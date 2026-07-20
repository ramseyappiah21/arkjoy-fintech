import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { newId, readDb, writeDb } from "@/lib/db";
import {
  detectNetwork,
  formatPhoneDisplay,
  isValidGhanaPhone,
  makeReference,
  normalizePhone,
} from "@/lib/phone";
import {
  createMomoTransferRecipient,
  initiateMomoTransfer,
  isPaystackLiveConfigured,
  networkToPaystackProvider,
} from "@/lib/paystack";

/**
 * Live: send money TO any MoMo number (disbursement from Paystack balance → telco).
 */
export async function POST(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPaystackLiveConfigured()) {
    return NextResponse.json(
      {
        error:
          "Live MoMo is not configured. Add PAYSTACK_SECRET_KEY to .env.local.",
        mode: "demo",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const toName = String(body.toName || "").trim();
    const phone = normalizePhone(String(body.phone || body.toAccount || ""));
    const amount = Number(body.amount);
    const fromAccountId = String(body.fromAccountId || "");
    const note = String(body.note || "").trim();

    if (!toName || !isValidGhanaPhone(phone) || !amount || amount <= 0) {
      return NextResponse.json(
        {
          error:
            "Recipient name, valid Ghana MoMo number, and amount are required.",
        },
        { status: 400 }
      );
    }

    const db = await readDb();
    const account = db.accounts.find(
      (a) =>
        a.id === fromAccountId && a.userId === user.id && a.currency === "GHS"
    );
    if (!account) {
      return NextResponse.json(
        { error: "Select a GH¢ bank account to fund the payout." },
        { status: 404 }
      );
    }
    if (account.balance < amount) {
      return NextResponse.json(
        {
          error:
            "Insufficient arkJoy demo balance. For live payouts, Paystack also needs enough settled balance in your Paystack business.",
        },
        { status: 400 }
      );
    }

    const network = detectNetwork(phone);
    const provider = networkToPaystackProvider(network);
    const reference = makeReference("AJD").toLowerCase();

    const recipient = await createMomoTransferRecipient({
      name: toName,
      phone,
      provider,
    });

    if (!recipient.ok || !recipient.data?.recipient_code) {
      return NextResponse.json(
        {
          error:
            recipient.message ||
            "Could not create MoMo transfer recipient. Check number/network and Paystack Transfer settings.",
        },
        { status: 502 }
      );
    }

    const transfer = await initiateMomoTransfer({
      amountGhs: amount,
      recipientCode: recipient.data.recipient_code,
      reason: note || `arkJoy MoMo to ${toName}`,
      reference,
    });

    if (!transfer.ok) {
      return NextResponse.json(
        {
          error:
            transfer.message ||
            "Paystack transfer failed. Ensure Transfers are enabled and your Paystack balance can cover the amount + fees.",
          details: transfer.data,
        },
        { status: 502 }
      );
    }

    // Reserve locally once Paystack accepts the transfer request
    account.balance = Math.round((account.balance - amount) * 100) / 100;
    db.transactions.unshift({
      id: newId("txn"),
      userId: user.id,
      accountId: account.id,
      type: "debit",
      category: "Live MoMo Send",
      description: `Live MoMo to ${toName} ${formatPhoneDisplay(phone)} · ${reference}`,
      amount,
      counterparty: `${toName} (${formatPhoneDisplay(phone)})`,
      createdAt: new Date().toISOString(),
      status:
        transfer.data?.status === "success" ? "completed" : "pending",
    });

    if (!db.livePayments) db.livePayments = [];
    db.livePayments.unshift({
      id: newId("live"),
      userId: user.id,
      accountId: account.id,
      phone,
      amount,
      reference,
      provider,
      network,
      type: "transfer",
      status: transfer.data?.status || "pending",
      displayText: `Sending GH¢ ${amount.toFixed(2)} to ${formatPhoneDisplay(phone)} via ${network}`,
      createdAt: new Date().toISOString(),
      recipientName: toName,
      transferCode: transfer.data?.transfer_code,
    });
    db.livePayments = db.livePayments.slice(0, 100);
    await writeDb(db);

    return NextResponse.json({
      mode: "live",
      reference,
      status: transfer.data?.status || "pending",
      transferCode: transfer.data?.transfer_code,
      network,
      provider,
      phoneDisplay: formatPhoneDisplay(phone),
      amount,
      account,
      message:
        "Live MoMo disbursement submitted to the telco via Paystack. Fees apply. Confirm on the recipient phone / Paystack dashboard.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to initiate live MoMo transfer." },
      { status: 500 }
    );
  }
}
