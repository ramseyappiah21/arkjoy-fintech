"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";
import type { Account, BillPayee } from "@/lib/types";

export default function BillsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<BillPayee[]>([]);
  const [accountId, setAccountId] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/banking/accounts").then((r) => r.json()),
      fetch("/api/banking/bills").then((r) => r.json()),
    ]).then(([accData, billData]) => {
      setAccounts(accData.accounts || []);
      setPayees(billData.payees || []);
      if (accData.accounts?.[0]) setAccountId(accData.accounts[0].id);
      if (billData.payees?.[0]) setPayeeId(billData.payees[0].id);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/banking/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          payeeId,
          reference,
          amount: Number(amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment failed");
        return;
      }
      const payee = payees.find((p) => p.id === payeeId);
      setMessage(
        `Paid ${formatMoney(Number(amount), "GHS")} to ${payee?.name}. Receipt saved.`
      );
      setAmount("");
      setReference("");
      setAccounts((prev) =>
        prev.map((a) => (a.id === data.account.id ? data.account : a))
      );
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Pay bills</h1>
        <p className="mt-1 text-ink/60">
          ECG, Ghana Water, MTN, Telecel, DStv, NHIA — pay in seconds.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-forest/10 bg-paper p-6 sm:p-8"
      >
        <label className="block text-sm">
          <span className="font-medium">From account</span>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {formatMoney(a.balance, a.currency)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium">Biller</span>
          <select
            value={payeeId}
            onChange={(e) => setPayeeId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          >
            {payees.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.category})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium">Meter / account / phone</span>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. meter number or 0244…"
            className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Amount (GH¢)</span>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="rounded-xl bg-mint/60 px-3 py-2 text-sm text-forest">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-paper hover:bg-forest disabled:opacity-60"
        >
          {loading ? "Paying…" : "Pay now"}
        </button>
      </form>
    </div>
  );
}
