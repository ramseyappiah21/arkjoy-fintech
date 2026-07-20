"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";
import type { Card } from "@/lib/types";

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/banking/cards");
    const data = await res.json();
    setCards(data.cards || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleFreeze(card: Card) {
    setError("");
    const res = await fetch("/api/banking/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        status: card.status === "active" ? "frozen" : "active",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update card");
      return;
    }
    setCards((prev) => prev.map((c) => (c.id === data.card.id ? data.card : c)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Cards</h1>
        <p className="mt-1 text-ink/60">
          Freeze a lost card instantly or review spending limits.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.id} className="space-y-4">
            <div
              className={`relative overflow-hidden rounded-3xl p-6 text-paper shadow-lg ${
                card.brand === "Visa"
                  ? "bg-gradient-to-br from-forest to-teal"
                  : "bg-gradient-to-br from-ink to-forest"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">arkJoy</p>
                <p className="text-sm font-semibold opacity-80">{card.brand}</p>
              </div>
              <p className="mt-10 font-display text-2xl tracking-[0.2em]">
                •••• •••• •••• {card.last4}
              </p>
              <div className="mt-6 flex justify-between text-sm">
                <div>
                  <p className="text-xs opacity-60">Card</p>
                  <p className="font-medium">{card.label}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Expires</p>
                  <p className="font-medium">{card.expiry}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Status</p>
                  <p className="font-medium capitalize">{card.status}</p>
                </div>
              </div>
              {card.status === "frozen" && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/50 backdrop-blur-[2px]">
                  <span className="rounded-full bg-paper px-4 py-1.5 text-sm font-semibold text-ink">
                    Frozen
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-forest/10 bg-paper px-4 py-3">
              <p className="text-sm text-ink/60">
                Limit {formatMoney(card.spendingLimit, "GHS")}
              </p>
              <button
                type="button"
                onClick={() => toggleFreeze(card)}
                className="rounded-full border border-forest/20 px-4 py-2 text-sm font-medium text-forest hover:bg-mist"
              >
                {card.status === "active" ? "Freeze card" : "Unfreeze"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
