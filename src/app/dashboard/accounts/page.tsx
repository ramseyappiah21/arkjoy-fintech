import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { formatMoney, readDb } from "@/lib/db";

export default async function AccountsPage() {
  const user = await readSession();
  if (!user) redirect("/login");

  const db = await readDb();
  const accounts = db.accounts.filter((a) => a.userId === user.id);
  const transactions = db.transactions
    .filter((t) => t.userId === user.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Accounts</h1>
        <p className="mt-1 text-ink/60">Balances, account numbers, and full history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-3xl border border-forest/10 bg-paper p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-teal uppercase">
                  {account.type} · {account.currency}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">{account.name}</h2>
              </div>
              <p className="font-display text-xl font-bold">
                {formatMoney(account.balance, account.currency)}
              </p>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-ink/45">Account number</dt>
                <dd className="mt-1 font-medium">{account.number}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Currency</dt>
                <dd className="mt-1 font-medium">{account.currency}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-forest/10 bg-paper">
        <div className="border-b border-forest/10 px-6 py-4">
          <h2 className="font-display text-xl font-bold">Transaction history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-sand/50 text-ink/50">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-t border-forest/8">
                  <td className="px-6 py-3 text-ink/55">
                    {new Date(txn.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-medium text-ink">{txn.description}</p>
                    <p className="text-xs text-ink/45">{txn.counterparty}</p>
                  </td>
                  <td className="px-6 py-3 text-ink/60">{txn.category}</td>
                  <td
                    className={`px-6 py-3 text-right font-semibold ${
                      txn.type === "credit" ? "text-teal" : "text-ink"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "−"}
                    {formatMoney(txn.amount, "GHS")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
