import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET() {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await readDb();
  const accounts = db.accounts.filter((a) => a.userId === user.id);
  return NextResponse.json({ accounts });
}
