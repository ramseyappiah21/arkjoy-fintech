"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";
import type { Account } from "@/lib/types";
import type { Transaction } from "@/lib/db";

export default function StatementsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountId, setAccountId] = useState("all");
  const [kind, setKind] = useState<"all" | "credit" | "debit">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/banking/accounts").then((r) => r.json()),
      fetch("/api/banking/transactions").then((r) => r.json()),
    ])
      .then(([accData, txnData]) => {
        setAccounts(accData.accounts || []);
        setTransactions(txnData.transactions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (accountId !== "all" && t.accountId !== accountId) return false;
      if (kind !== "all" && t.type !== kind) return false;
      if (!q) return true;
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q)
      );
    });
  }, [transactions, accountId, kind, query]);

  const accountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name || "Account";

  function downloadCsv() {
    const rows = [
      ["Date", "Account", "Type", "Category", "Description", "Counterparty", "Amount", "Status"],
      ...filtered.map((t) => [
        new Date(t.createdAt).toISOString(),
        accountName(t.accountId),
        t.type,
        t.category,
        t.description,
        t.counterparty,
        String(t.amount),
        t.status,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arkjoy-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Statements</h1>
          <p className="mt-1 text-ink/60">
            Filter your history and download a CSV for books or disputes.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={!filtered.length}
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
        >
          Download CSV
        </button>
      </div>

      <div className="grid gap-3 rounded-3xl border border-forest/10 bg-paper p-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-ink/55">Account</span>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-mist px-3 py-2.5"
          >
            <option value="all">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/55">Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "all" | "credit" | "debit")}
            className="w-full rounded-xl border border-forest/15 bg-mist px-3 py-2.5"
          >
            <option value="all">All</option>
            <option value="credit">Credits in</option>
            <option value="debit">Debits out</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/55">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="MoMo, ECG, salary…"
            className="w-full rounded-xl border border-forest/15 bg-mist px-3 py-2.5"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-3xl border border-forest/10 bg-paper">
        {loading ? (
          <p className="p-8 text-sm text-ink/50">Loading statements…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-sm text-ink/50">No transactions match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-mist text-ink/55">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const account = accounts.find((a) => a.id === t.accountId);
                  const currency = account?.currency || "GHS";
                  return (
                    <tr key={t.id} className="border-t border-forest/5">
                      <td className="px-4 py-3 whitespace-nowrap text-ink/60">
                        {new Date(t.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">{accountName(t.accountId)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{t.description}</p>
                        <p className="text-xs text-ink/45">
                          {t.category} · {t.counterparty}
                        </p>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                          t.type === "credit" ? "text-teal" : "text-ink"
                        }`}
                      >
                        {t.type === "credit" ? "+" : "−"}
                        {formatMoney(t.amount, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
