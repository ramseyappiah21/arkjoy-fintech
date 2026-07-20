import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const db = await readDb();

  let transactions = db.transactions.filter((t) => t.userId === user.id);
  if (accountId) {
    transactions = transactions.filter((t) => t.accountId === accountId);
  }

  transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ transactions });
}
