import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { newId, readDb, writeDb } from "@/lib/db";

export async function GET() {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await readDb();
  return NextResponse.json({ payees: db.billPayees });
}

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const accountId = String(body.accountId || "");
    const payeeId = String(body.payeeId || "");
    const reference = String(body.reference || "").trim();
    const amount = Number(body.amount);

    if (!accountId || !payeeId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Account, payee, and amount are required." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const account = db.accounts.find(
      (a) => a.id === accountId && a.userId === user.id
    );
    const payee = db.billPayees.find((p) => p.id === payeeId);
    if (!account || !payee) {
      return NextResponse.json({ error: "Invalid account or payee." }, { status: 404 });
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
      category: "Bills",
      description: `${payee.name}${reference ? ` — ${reference}` : ""}`,
      amount,
      counterparty: payee.name,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };
    db.transactions.unshift(txn);
    await writeDb(db);

    return NextResponse.json({ transaction: txn, account });
  } catch {
    return NextResponse.json({ error: "Bill payment failed." }, { status: 500 });
  }
}
