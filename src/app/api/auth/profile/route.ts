import { NextResponse } from "next/server";
import { createSessionToken, readSession, setSessionCookie } from "@/lib/auth";
import { ensureWalletForUser, readDb, writeDb } from "@/lib/db";
import { isValidGhanaPhone, normalizePhone } from "@/lib/phone";

export async function PATCH(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone || ""));
    if (!isValidGhanaPhone(phone)) {
      return NextResponse.json(
        { error: "Enter a valid Ghana mobile number (10 digits)." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const user = db.users.find((u) => u.id === session.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    user.phone = phone;
    const wallet = ensureWalletForUser(db, user.id, phone);
    wallet.phone = phone;
    await writeDb(db);

    const nextSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    };
    await setSessionCookie(await createSessionToken(nextSession));

    return NextResponse.json({ user: nextSession, wallet });
  } catch {
    return NextResponse.json({ error: "Could not update phone." }, { status: 500 });
  }
}
