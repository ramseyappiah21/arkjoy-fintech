import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { ensureWalletForUser, formatMoney, readDb, writeDb } from "@/lib/db";
import { formatPhoneDisplay } from "@/lib/phone";

export default async function DashboardPage() {
  const user = await readSession();
  if (!user) redirect("/login");

  const db = await readDb();
  const accounts = db.accounts.filter((a) => a.userId === user.id);
  const wallet = ensureWalletForUser(db, user.id, user.phone);
  await writeDb(db);
  const transactions = db.transactions
    .filter((t) => t.userId === user.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  const ghsTotal = accounts
    .filter((a) => a.currency === "GHS")
    .reduce((sum, a) => sum + a.balance, 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">
          {greeting}, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-ink/60">Here is your arkJoy snapshot for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-forest-gradient p-6 text-paper md:col-span-2">
          <p className="text-sm text-paper/70">Total GH¢ balance</p>
          <p className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            {formatMoney(ghsTotal, "GHS")}
          </p>
          <p className="mt-2 text-sm text-paper/60">
            Across {accounts.filter((a) => a.currency === "GHS").length} Ghana cedi accounts
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/dashboard/transfer"
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink"
            >
              Withdraw to phone
            </Link>
            <Link
              href="/dashboard/statements"
              className="rounded-full border border-paper/30 px-4 py-2 text-sm font-medium text-paper"
            >
              Statements
            </Link>
            <Link
              href="/dashboard/bills"
              className="rounded-full border border-paper/30 px-4 py-2 text-sm font-medium text-paper"
            >
              Pay a bill
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-forest/10 bg-paper p-6">
          <p className="text-sm text-ink/55">MoMo on your phone</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            {formatMoney(wallet.balance, "GHS")}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {wallet.network} · {formatPhoneDisplay(wallet.phone)}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/dashboard/transfer" className="font-medium text-teal hover:underline">
                Withdraw to this number →
              </Link>
            </li>
            <li>
              <Link href="/dashboard/accounts" className="font-medium text-teal hover:underline">
                View all accounts →
              </Link>
            </li>
            <li>
              <Link href="/dashboard/cards" className="font-medium text-teal hover:underline">
                Manage cards →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-2xl border border-forest/10 bg-paper p-5"
          >
            <p className="text-xs font-semibold tracking-wider text-teal uppercase">
              {account.type}
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-ink">{account.name}</h2>
            <p className="mt-1 text-xs text-ink/45">•••• {account.number.slice(-4)}</p>
            <p className="mt-4 font-display text-2xl font-bold">
              {formatMoney(account.balance, account.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-forest/10 bg-paper p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-ink">Recent activity</h2>
          <Link href="/dashboard/accounts" className="text-sm font-medium text-teal hover:underline">
            See all
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-forest/8">
          {transactions.map((txn) => (
            <li key={txn.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{txn.description}</p>
                <p className="text-xs text-ink/45">
                  {new Date(txn.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {txn.category}
                </p>
              </div>
              <p
                className={`shrink-0 font-semibold ${
                  txn.type === "credit" ? "text-teal" : "text-ink"
                }`}
              >
                {txn.type === "credit" ? "+" : "−"}
                {formatMoney(txn.amount, "GHS")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
