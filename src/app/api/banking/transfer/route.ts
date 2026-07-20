import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import {
  creditMomoWallet,
  debitMomoWallet,
  ensureWalletByPhone,
  ensureWalletForUser,
  newId,
  readDb,
  writeDb,
} from "@/lib/db";
import {
  detectNetwork,
  formatPhoneDisplay,
  isValidGhanaPhone,
  makeReference,
  normalizePhone,
} from "@/lib/phone";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fromAccountId = String(body.fromAccountId || "");
    const source = body.source === "momo" ? "momo" : "bank";
    const toName = String(body.toName || "").trim();
    const toAccount = String(body.toAccount || "").trim();
    const amount = Number(body.amount);
    const note = String(body.note || "").trim();
    const channel = String(body.channel || "MoMo");
    const reference = makeReference(channel === "MoMo" ? "AJM" : "AJT");

    if (!toName || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Recipient and a valid amount are required." },
        { status: 400 }
      );
    }

    if (channel === "MoMo" && !isValidGhanaPhone(toAccount)) {
      return NextResponse.json(
        {
          error:
            "Enter a valid Ghana MoMo number (10 digits, e.g. 0244123456).",
        },
        { status: 400 }
      );
    }

    const db = await readDb();
    const destPhone = channel === "MoMo" ? normalizePhone(toAccount) : "";
    const destNetwork = destPhone ? detectNetwork(destPhone) : null;
    const ownPhone = normalizePhone(user.phone);

    let account = null;
    let ownWallet = null;
    let momoWallet = null;
    let momoNotification = null;
    let reflectedOnPhone = false;
    let senderSms = null;

    if (source === "momo") {
      if (channel !== "MoMo") {
        return NextResponse.json(
          { error: "Phone wallet can only send via Mobile Money." },
          { status: 400 }
        );
      }
      if (!isValidGhanaPhone(ownPhone)) {
        return NextResponse.json(
          { error: "Your profile needs a valid Ghana mobile number." },
          { status: 400 }
        );
      }
      ownWallet = ensureWalletForUser(db, user.id, ownPhone);
      if (ownWallet.balance < amount) {
        return NextResponse.json(
          { error: "Insufficient MoMo balance on your phone." },
          { status: 400 }
        );
      }
      if (destPhone === ownPhone) {
        return NextResponse.json(
          { error: "Choose a different number — that is your own MoMo." },
          { status: 400 }
        );
      }

      senderSms = debitMomoWallet(
        ownWallet,
        amount,
        `${toName} (${formatPhoneDisplay(destPhone)})`,
        reference
      );
      momoWallet = ensureWalletByPhone(db, destPhone);
      momoNotification = creditMomoWallet(
        momoWallet,
        amount,
        `${user.name}`,
        reference
      );
      reflectedOnPhone = true;

      const txn = {
        id: newId("txn"),
        userId: user.id,
        accountId: "momo",
        type: "debit" as const,
        category: "MoMo Transfer",
        description:
          note ||
          `MoMo to ${toName} ${formatPhoneDisplay(destPhone)} · ${reference}`,
        amount,
        counterparty: `${toName} (${formatPhoneDisplay(destPhone)})`,
        createdAt: new Date().toISOString(),
        status: "completed" as const,
      };
      db.transactions.unshift(txn);
      await writeDb(db);

      return NextResponse.json({
        reference,
        transaction: txn,
        account: null,
        wallet: ownWallet,
        momoWallet,
        momoNotification: senderSms,
        recipientNotification: momoNotification,
        reflectedOnPhone: true,
        phoneDisplay: formatPhoneDisplay(ownPhone),
        recipientDisplay: formatPhoneDisplay(destPhone),
        network: destNetwork,
        receipt: {
          title: "MoMo sent successfully",
          subtitle: `${toName} · ${formatPhoneDisplay(destPhone)} · ${destNetwork}`,
          amount,
          source: "momo",
        },
      });
    }

    if (!fromAccountId) {
      return NextResponse.json(
        { error: "From account is required." },
        { status: 400 }
      );
    }

    account = db.accounts.find(
      (a) => a.id === fromAccountId && a.userId === user.id
    );
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (account.balance < amount) {
      return NextResponse.json({ error: "Insufficient funds." }, { status: 400 });
    }

    account.balance = Math.round((account.balance - amount) * 100) / 100;

    const txn = {
      id: newId("txn"),
      userId: user.id,
      accountId: account.id,
      type: "debit" as const,
      category: "Transfer",
      description:
        note ||
        `Transfer via ${channel} to ${toName}${
          destPhone ? ` ${formatPhoneDisplay(destPhone)}` : ""
        } · ${reference}`,
      amount,
      counterparty: toAccount
        ? `${toName} (${channel === "MoMo" ? formatPhoneDisplay(destPhone) : toAccount})`
        : toName,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };
    db.transactions.unshift(txn);

    if (channel === "MoMo" && destPhone) {
      momoWallet = ensureWalletByPhone(db, destPhone);
      momoNotification = creditMomoWallet(
        momoWallet,
        amount,
        `${user.name} (arkJoy)`,
        reference
      );
      reflectedOnPhone = destPhone === ownPhone;
      if (reflectedOnPhone) {
        ownWallet = momoWallet;
      } else {
        ownWallet = ensureWalletForUser(db, user.id, ownPhone || destPhone);
      }
    }

    await writeDb(db);

    return NextResponse.json({
      reference,
      transaction: txn,
      account,
      wallet: ownWallet,
      momoWallet,
      momoNotification: reflectedOnPhone ? momoNotification : null,
      recipientNotification: momoNotification,
      reflectedOnPhone,
      phoneDisplay: ownPhone ? formatPhoneDisplay(ownPhone) : undefined,
      recipientDisplay: destPhone ? formatPhoneDisplay(destPhone) : undefined,
      network: destNetwork,
      receipt: {
        title: channel === "MoMo" ? "MoMo sent successfully" : "Transfer successful",
        subtitle:
          channel === "MoMo"
            ? `${toName} · ${formatPhoneDisplay(destPhone)} · ${destNetwork}`
            : `${toName} · ${channel}`,
        amount,
        source: "bank",
      },
    });
  } catch {
    return NextResponse.json({ error: "Transfer failed." }, { status: 500 });
  }
}
