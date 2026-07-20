import { NextResponse } from "next/server";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { newId, readDb, writeDb, ensureWalletForUser, type Account } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");
    const accountType = body.accountType === "business" ? "business" : "current";

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email, and a password (6+ chars) are required." },
        { status: 400 }
      );
    }

    const db = await readDb();
    if (db.users.some((u) => u.email === email)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const userId = newId("usr");
    const user = {
      id: userId,
      email,
      name,
      phone,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    const account: Account = {
      id: newId("acc"),
      userId,
      name: accountType === "business" ? "Business Current" : "arkJoy Current",
      type: accountType === "business" ? "business" : "current",
      currency: "GHS",
      number: `00${Math.floor(10000000000 + Math.random() * 89999999999)}`,
      balance: 100,
    };

    const savings: Account = {
      id: newId("acc"),
      userId,
      name: "arkJoy Savings",
      type: "savings",
      currency: "GHS",
      number: `00${Math.floor(10000000000 + Math.random() * 89999999999)}`,
      balance: 50,
    };

    db.users.push(user);
    db.accounts.push(account, savings);
    if (!db.momoWallets) db.momoWallets = [];
    if (phone) {
      ensureWalletForUser(db, userId, phone);
    }
    db.cards.push({
      id: newId("card"),
      userId,
      accountId: account.id,
      label: "arkJoy Debit",
      brand: "Visa",
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expiry: "12/29",
      status: "active",
      spendingLimit: 5000,
    });
    db.transactions.push({
      id: newId("txn"),
      userId,
      accountId: account.id,
      type: "credit",
      category: "Welcome",
      description: "Welcome bonus — thank you for joining arkJoy",
      amount: 100,
      counterparty: "arkJoy",
      createdAt: new Date().toISOString(),
      status: "completed",
    });

    await writeDb(db);

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    };
    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json({ user: sessionUser });
  } catch {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
