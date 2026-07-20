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
  chargeMobileMoney,
  isPaystackLiveConfigured,
  networkToPaystackProvider,
  PAYSTACK_TEST_MOMO_PHONE,
  paystackKeyKind,
} from "@/lib/paystack";

/**
 * Live: charge customer's MoMo (money leaves their telco wallet → Paystack/arkJoy).
 * Used for "Phone → Bank" style cash-in / deposit from phone.
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
          "Live MoMo is not configured. Add PAYSTACK_SECRET_KEY to .env.local (from https://dashboard.paystack.com/#/settings/developer).",
        mode: "demo",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone || user.phone || ""));
    const amount = Number(body.amount);
    const accountId = String(body.accountId || "");
    const note = String(body.note || "").trim();

    if (!isValidGhanaPhone(phone) || !amount || amount <= 0 || !accountId) {
      return NextResponse.json(
        {
          error:
            "Valid Ghana MoMo number, GH¢ amount, and destination bank account are required.",
        },
        { status: 400 }
      );
    }

    if (paystackKeyKind() === "test" && phone !== PAYSTACK_TEST_MOMO_PHONE) {
      return NextResponse.json(
        {
          error: `Paystack TEST mode only sends MoMo prompts to ${formatPhoneDisplay(PAYSTACK_TEST_MOMO_PHONE)}. Your real number will work after Paystack activates live keys.`,
          testMoMoPhone: PAYSTACK_TEST_MOMO_PHONE,
          mode: "test",
        },
        { status: 400 }
      );
    }

    const db = await readDb();
    const account = db.accounts.find(
      (a) => a.id === accountId && a.userId === user.id && a.currency === "GHS"
    );
    if (!account) {
      return NextResponse.json(
        { error: "GH¢ bank account not found." },
        { status: 404 }
      );
    }

    const network = detectNetwork(phone);
    const provider = networkToPaystackProvider(network);
    const reference = makeReference("AJC").toLowerCase();

    const charge = await chargeMobileMoney({
      email: user.email,
      amountGhs: amount,
      phone,
      provider,
      reference,
      metadata: {
        userId: user.id,
        accountId,
        purpose: "momo_cash_in",
        note,
      },
    });

    if (!charge.ok) {
      return NextResponse.json(
        {
          error: charge.message || "Paystack could not start the MoMo charge.",
          details: charge.data,
        },
        { status: 502 }
      );
    }

    const pending = {
      id: newId("live"),
      userId: user.id,
      accountId,
      phone,
      amount,
      reference,
      provider,
      network,
      type: "charge" as const,
      status: charge.data?.status || "pay_offline",
      displayText:
        charge.data?.display_text ||
        "Approve the MoMo prompt on your phone to complete payment.",
      createdAt: new Date().toISOString(),
    };

    if (!db.livePayments) db.livePayments = [];
    db.livePayments.unshift(pending);
    db.livePayments = db.livePayments.slice(0, 100);
    await writeDb(db);

    return NextResponse.json({
      mode: "live",
      reference,
      status: pending.status,
      displayText: pending.displayText,
      network,
      provider,
      phoneDisplay: formatPhoneDisplay(phone),
      amount,
      message:
        "A real MoMo prompt was sent to the phone. Approve it with your PIN. Telco + Paystack fees apply.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to initiate live MoMo charge." },
      { status: 500 }
    );
  }
}
