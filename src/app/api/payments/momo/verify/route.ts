import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import {
  ensureWalletForUser,
  newId,
  readDb,
  writeDb,
} from "@/lib/db";
import { formatPhoneDisplay, normalizePhone } from "@/lib/phone";
import { isPaystackLiveConfigured, verifyTransaction, verifyTransfer } from "@/lib/paystack";

export async function GET(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPaystackLiveConfigured()) {
    return NextResponse.json({ error: "Live MoMo not configured", mode: "demo" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const reference = String(searchParams.get("reference") || "").toLowerCase();
  const kind = searchParams.get("kind") === "transfer" ? "transfer" : "charge";

  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  const db = await readDb();
  const pending = db.livePayments?.find(
    (p) => p.reference === reference && p.userId === user.id
  );

  if (kind === "transfer") {
    const result = await verifyTransfer(reference);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.message || "Could not verify transfer", status: "unknown" },
        { status: 502 }
      );
    }

    if (pending) {
      pending.status = result.data.status;
      await writeDb(db);
    }

    return NextResponse.json({
      mode: "live",
      kind: "transfer",
      reference,
      status: result.data.status,
      amount: (result.data.amount || 0) / 100,
      pending,
    });
  }

  const result = await verifyTransaction(reference);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message || "Could not verify charge", status: "unknown" },
      { status: 502 }
    );
  }

  const status = result.data.status;
  if (status === "success" && pending && pending.status !== "success") {
    const account = db.accounts.find(
      (a) => a.id === pending.accountId && a.userId === user.id
    );
    if (account) {
      account.balance = Math.round((account.balance + pending.amount) * 100) / 100;
      db.transactions.unshift({
        id: newId("txn"),
        userId: user.id,
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
      user.id,
      normalizePhone(pending.phone)
    );
    wallet.notifications.unshift({
      id: newId("sms"),
      title: "Payment approved",
      body: `GHS ${pending.amount.toFixed(2)} paid to arkJoy. Ref ${reference}.`,
      amount: -pending.amount,
      balance: wallet.balance,
      createdAt: new Date().toISOString(),
      read: false,
    });

    pending.status = "success";
    await writeDb(db);

    return NextResponse.json({
      mode: "live",
      kind: "charge",
      reference,
      status: "success",
      amount: pending.amount,
      account,
      wallet,
      phoneDisplay: formatPhoneDisplay(pending.phone),
      settled: true,
    });
  }

  if (pending) {
    pending.status = status;
    await writeDb(db);
  }

  return NextResponse.json({
    mode: "live",
    kind: "charge",
    reference,
    status,
    amount: (result.data.amount || 0) / 100,
    gateway_response: result.data.gateway_response,
    pending,
    settled: false,
  });
}
