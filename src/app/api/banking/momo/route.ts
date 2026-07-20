import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import {
  creditMomoWallet,
  debitMomoWallet,
  ensureWalletForUser,
  newId,
  readDb,
  writeDb,
} from "@/lib/db";
import {
  formatPhoneDisplay,
  isValidGhanaPhone,
  makeReference,
  normalizePhone,
} from "@/lib/phone";

export async function GET() {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  const wallet = ensureWalletForUser(db, user.id, user.phone);
  await writeDb(db);

  return NextResponse.json({
    wallet,
    phoneDisplay: formatPhoneDisplay(wallet.phone),
  });
}

/**
 * action: "toPhone"  — bank → your MoMo number
 * action: "fromPhone" — your MoMo number → bank
 */
export async function POST(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action === "fromPhone" ? "fromPhone" : "toPhone";
    const accountId = String(body.fromAccountId || body.accountId || "");
    const amount = Number(body.amount);
    const note = String(body.note || "").trim();
    const reference = makeReference("AJM");

    if (!accountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Account and a valid amount are required." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const account = db.accounts.find(
      (a) => a.id === accountId && a.userId === user.id
    );
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (account.currency !== "GHS") {
      return NextResponse.json(
        { error: "Use a GH¢ account for MoMo movements." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(user.phone);
    if (!isValidGhanaPhone(phone)) {
      return NextResponse.json(
        {
          error:
            "Your profile needs a valid Ghana mobile number (e.g. 0244123456).",
        },
        { status: 400 }
      );
    }

    const wallet = ensureWalletForUser(db, user.id, phone);
    wallet.phone = phone;

    if (action === "toPhone") {
      if (account.balance < amount) {
        return NextResponse.json({ error: "Insufficient bank funds." }, { status: 400 });
      }
      account.balance = Math.round((account.balance - amount) * 100) / 100;
      const notification = creditMomoWallet(
        wallet,
        amount,
        note || `arkJoy ${account.name}`,
        reference
      );
      const txn = {
        id: newId("txn"),
        userId: user.id,
        accountId: account.id,
        type: "debit" as const,
        category: "MoMo Deposit",
        description:
          note ||
          `Bank to MoMo ${formatPhoneDisplay(phone)} · ${reference}`,
        amount,
        counterparty: `MoMo ${formatPhoneDisplay(phone)}`,
        createdAt: new Date().toISOString(),
        status: "completed" as const,
      };
      db.transactions.unshift(txn);
      await writeDb(db);
      return NextResponse.json({
        action,
        reference,
        transaction: txn,
        account,
        wallet,
        notification,
        phoneDisplay: formatPhoneDisplay(phone),
        network: wallet.network,
        receipt: {
          title: "Deposited to your phone",
          subtitle: `${formatPhoneDisplay(phone)} · ${wallet.network}`,
          amount,
          direction: "toPhone",
        },
      });
    }

    // fromPhone — cash out MoMo to bank
    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient MoMo balance on your phone." },
        { status: 400 }
      );
    }
    const notification = debitMomoWallet(
      wallet,
      amount,
      note || `arkJoy ${account.name}`,
      reference
    );
    if (!notification) {
      return NextResponse.json(
        { error: "Insufficient MoMo balance on your phone." },
        { status: 400 }
      );
    }
    account.balance = Math.round((account.balance + amount) * 100) / 100;
    const txn = {
      id: newId("txn"),
      userId: user.id,
      accountId: account.id,
      type: "credit" as const,
      category: "MoMo Cash-out",
      description:
        note ||
        `MoMo ${formatPhoneDisplay(phone)} to bank · ${reference}`,
      amount,
      counterparty: `MoMo ${formatPhoneDisplay(phone)}`,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };
    db.transactions.unshift(txn);
    await writeDb(db);
    return NextResponse.json({
      action,
      reference,
      transaction: txn,
      account,
      wallet,
      notification,
      phoneDisplay: formatPhoneDisplay(phone),
      network: wallet.network,
      receipt: {
        title: "Withdrawn from your phone",
        subtitle: `${formatPhoneDisplay(phone)} · ${wallet.network} → ${account.name}`,
        amount,
        direction: "fromPhone",
      },
    });
  } catch {
    return NextResponse.json({ error: "MoMo request failed." }, { status: 500 });
  }
}
