import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";

export async function GET() {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await readDb();
  const cards = db.cards.filter((c) => c.userId === user.id);
  return NextResponse.json({ cards });
}

export async function PATCH(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const cardId = String(body.cardId || "");
    const status = body.status === "frozen" ? "frozen" : "active";

    const db = await readDb();
    const card = db.cards.find((c) => c.id === cardId && c.userId === user.id);
    if (!card) {
      return NextResponse.json({ error: "Card not found." }, { status: 404 });
    }
    card.status = status;
    await writeDb(db);
    return NextResponse.json({ card });
  } catch {
    return NextResponse.json({ error: "Could not update card." }, { status: 500 });
  }
}
