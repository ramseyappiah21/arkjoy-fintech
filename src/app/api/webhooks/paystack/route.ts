import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  ensureWalletForUser,
  newId,
  readDb,
  writeDb,
} from "@/lib/db";
import { formatPhoneDisplay, normalizePhone } from "@/lib/phone";

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  // In production always verify. Allow missing secret only if explicitly disabled.
  if (process.env.PAYSTACK_SKIP_WEBHOOK_VERIFY !== "true") {
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: {
      reference?: string;
      status?: string;
      amount?: number;
      metadata?: { userId?: string; accountId?: string; purpose?: string };
    };
  };

  const reference = String(event.data?.reference || "").toLowerCase();
  if (!reference) {
    return NextResponse.json({ received: true });
  }

  const db = await readDb();
  if (!db.livePayments) db.livePayments = [];
  const pending = db.livePayments.find((p) => p.reference === reference);

  if (event.event === "charge.success" && pending && pending.type === "charge") {
    if (pending.status !== "success") {
      const account = db.accounts.find(
        (a) => a.id === pending.accountId && a.userId === pending.userId
      );
      if (account) {
        account.balance = Math.round((account.balance + pending.amount) * 100) / 100;
        db.transactions.unshift({
          id: newId("txn"),
          userId: pending.userId,
          accountId: account.id,
          type: "credit",
          category: "Live MoMo Cash-in",
          description: `Live MoMo from ${formatPhoneDisplay(pending.phone)} · ${reference}`,
          amount: pending.amount,
          counterparty: `MoMo ${formatPhoneDisplay(pending.phone)}`,
          createdAt: new Date().toISOString(),
          status: "completed",
        });
      }
      const wallet = ensureWalletForUser(
        db,
        pending.userId,
        normalizePhone(pending.phone)
      );
      wallet.notifications.unshift({
        id: newId("sms"),
        title: "Payment approved",
        body: `GHS ${pending.amount.toFixed(2)} paid to arkJoy via ${pending.network}. Ref ${reference}.`,
        amount: -pending.amount,
        balance: wallet.balance,
        createdAt: new Date().toISOString(),
        read: false,
      });
      pending.status = "success";
      await writeDb(db);
    }
  }

  if (
    (event.event === "transfer.success" || event.event === "transfer.failed") &&
    pending &&
    pending.type === "transfer"
  ) {
    pending.status = event.event === "transfer.success" ? "success" : "failed";
    const txn = db.transactions.find((t) =>
      t.description.includes(reference)
    );
    if (txn) {
      txn.status = pending.status === "success" ? "completed" : "failed";
      if (pending.status === "failed") {
        const account = db.accounts.find((a) => a.id === pending.accountId);
        if (account) {
          account.balance = Math.round((account.balance + pending.amount) * 100) / 100;
        }
      }
    }
    await writeDb(db);
  }

  return NextResponse.json({ received: true });
}
