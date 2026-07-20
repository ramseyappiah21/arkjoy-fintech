"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { formatMoney } from "@/lib/money";
import { detectNetwork, formatPhoneDisplay, isValidGhanaPhone } from "@/lib/phone";
import type { Account, MomoNotification, MomoWallet } from "@/lib/types";

type Mode = "toPhone" | "fromPhone" | "send";

type Receipt = {
  title: string;
  subtitle: string;
  amount: number;
  reference: string;
  network?: string | null;
  live?: boolean;
};

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [wallet, setWallet] = useState<MomoWallet | null>(null);
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [mode, setMode] = useState<Mode>("fromPhone");
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [useLive, setUseLive] = useState(false);
  const [keyKind, setKeyKind] = useState<"live" | "test" | "missing">("missing");
  const [testMoMoPhone, setTestMoMoPhone] = useState<string | null>(null);
  const [myPhone, setMyPhone] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [payFrom, setPayFrom] = useState<"bank" | "momo">("bank");
  const [toName, setToName] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [latestSms, setLatestSms] = useState<MomoNotification | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [awaitingPhone, setAwaitingPhone] = useState<string | null>(null);

  const loadMomo = useCallback(async () => {
    const res = await fetch("/api/banking/momo");
    if (!res.ok) return;
    const data = await res.json();
    setWallet(data.wallet);
    setPhoneDisplay(data.phoneDisplay || "");
    if (data.wallet?.phone) setMyPhone(data.wallet.phone);
  }, []);

  useEffect(() => {
    fetch("/api/banking/accounts")
      .then((r) => r.json())
      .then((data) => {
        const list: Account[] = data.accounts || [];
        setAccounts(list);
        const ghs = list.filter((a) => a.currency === "GHS");
        const first = ghs[0] || list[0];
        if (first) setFromAccountId(first.id);
      });
    fetch("/api/payments/status")
      .then((r) => r.json())
      .then((data) => {
        const on = Boolean(data.live);
        const kind = (data.keyKind || (on ? "test" : "missing")) as
          | "live"
          | "test"
          | "missing";
        setLiveEnabled(on);
        // Only auto-enable Paystack for LIVE keys. Test keys stay optional (demo default).
        setUseLive(kind === "live");
        setKeyKind(kind);
        setTestMoMoPhone(data.testMoMoPhone || null);
      })
      .catch(() => {
        setLiveEnabled(false);
        setUseLive(false);
        setKeyKind("missing");
        setTestMoMoPhone(null);
      });
    loadMomo();
  }, [loadMomo]);

  async function saveMyPhone(phone: string) {
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save phone");
    if (data.wallet) {
      setWallet(data.wallet);
      setPhoneDisplay(formatPhoneDisplay(data.wallet.phone));
      setMyPhone(data.wallet.phone);
    }
  }

  function flashPhone(nextWallet: MomoWallet, sms?: MomoNotification | null) {
    setWallet(nextWallet);
    setPhoneDisplay(formatPhoneDisplay(nextWallet.phone));
    if (sms) setLatestSms(sms);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 1600);
  }

  function clearForm() {
    setAmount("");
    setNote("");
    if (mode === "send") {
      setToName("");
      setToAccount("");
    }
  }

  async function pollCharge(reference: string) {
    setAwaitingPhone(reference);
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await fetch(
        `/api/payments/momo/verify?reference=${encodeURIComponent(reference)}&kind=charge`
      );
      const data = await res.json();
      if (data.status === "success" && data.settled) {
        if (data.account) {
          setAccounts((prev) =>
            prev.map((a) => (a.id === data.account.id ? data.account : a))
          );
        }
        if (data.wallet) flashPhone(data.wallet, data.wallet.notifications?.[0]);
        setReceipt({
          title: "Live MoMo charge successful",
          subtitle: `${data.phoneDisplay} → bank · real telco`,
          amount: data.amount,
          reference,
          live: true,
        });
        setMessage("Phone approved the charge. Funds credited to your arkJoy account.");
        setAwaitingPhone(null);
        clearForm();
        return;
      }
      if (data.status === "failed" || data.status === "abandoned") {
        setError(`Charge ${data.status}. Try again or check your MoMo PIN prompt.`);
        setAwaitingPhone(null);
        return;
      }
    }
    setMessage(
      "Still waiting for phone approval. You can leave this page — webhook will settle it, or tap Verify later."
    );
    setAwaitingPhone(null);
  }

  async function onLiveFromPhone() {
    if (!isValidGhanaPhone(myPhone)) {
      setError("Set a valid Ghana MoMo number first (e.g. 0546774063).");
      return;
    }
    setMessage("Contacting Paystack…");
    await saveMyPhone(myPhone);

    const res = await fetch("/api/payments/momo/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: myPhone,
        amount: Number(amount),
        accountId: fromAccountId,
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.testMoMoPhone) setTestMoMoPhone(data.testMoMoPhone);
      setError(data.error || "Live charge failed");
      return;
    }
    setReceipt({
      title: "Approve on your phone",
      subtitle: data.displayText || data.message,
      amount: Number(amount),
      reference: data.reference,
      network: data.network,
      live: true,
    });
    setMessage(data.message);
    await pollCharge(data.reference);
  }

  async function onLiveDisburse(to: {
    name: string;
    phone: string;
  }) {
    const res = await fetch("/api/payments/momo/disburse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toName: to.name,
        phone: to.phone,
        amount: Number(amount),
        fromAccountId,
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Live MoMo send failed");
      return;
    }
    if (data.account) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === data.account.id ? data.account : a))
      );
    }
    setReceipt({
      title: "Paystack MoMo submitted",
      subtitle: `${to.name} · ${data.phoneDisplay} · ${data.network}`,
      amount: Number(amount),
      reference: data.reference,
      network: data.network,
      live: true,
    });
    setMessage(data.message);
    clearForm();
    await loadMomo();
  }

  async function onMomoMove(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setReceipt(null);
    try {
      // Prefer Paystack whenever keys are configured
      if (liveEnabled && useLive) {
        if (mode === "fromPhone") {
          await onLiveFromPhone();
        } else {
          if (!isValidGhanaPhone(myPhone)) {
            setError("Set a valid Ghana MoMo number first.");
            return;
          }
          await saveMyPhone(myPhone);
          await onLiveDisburse({
            name: "Me (my MoMo)",
            phone: myPhone,
          });
        }
        return;
      }

      const res = await fetch("/api/banking/momo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          fromAccountId,
          accountId: fromAccountId,
          amount: Number(amount),
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      if (data.account) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === data.account.id ? data.account : a))
        );
      }
      flashPhone(data.wallet, data.notification);
      setReceipt({
        title: data.receipt.title,
        subtitle: data.receipt.subtitle,
        amount: Number(amount),
        reference: data.reference,
        network: data.network,
      });
      setMessage(
        mode === "toPhone"
          ? "Demo ledger only (Paystack toggle is off)."
          : "Demo ledger only (Paystack toggle is off)."
      );
      clearForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setReceipt(null);

    if (!isValidGhanaPhone(toAccount)) {
      setError("Enter a valid Ghana number (10 digits), e.g. 0551234567.");
      setLoading(false);
      return;
    }

    try {
      if (useLive && liveEnabled) {
        if (payFrom !== "bank") {
          setError("Live telco send must be funded from a bank account (Paystack payout balance).");
          return;
        }
        await onLiveDisburse({ name: toName, phone: toAccount });
        return;
      }

      const res = await fetch("/api/banking/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: payFrom === "bank" ? fromAccountId : undefined,
          source: payFrom,
          toName,
          toAccount,
          amount: Number(amount),
          note,
          channel: "MoMo",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Transfer failed");
        return;
      }
      if (data.account) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === data.account.id ? data.account : a))
        );
      }
      if (data.wallet) {
        flashPhone(data.wallet, data.momoNotification);
      }
      setReceipt({
        title: data.receipt.title,
        subtitle: data.receipt.subtitle,
        amount: Number(amount),
        reference: data.reference,
        network: data.network,
      });
      setMessage(
        data.reflectedOnPhone
          ? "Demo: sent to your own MoMo preview."
          : `Demo: sent to ${data.recipientDisplay}.`
      );
      clearForm();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const ghsAccounts = accounts.filter((a) => a.currency === "GHS");
  const destNetwork = isValidGhanaPhone(toAccount)
    ? detectNetwork(toAccount)
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">MoMo & Transfers</h1>
          <p className="mt-1 text-ink/60">
            Move money between your bank and MoMo. Demo mode works with your real phone number.
          </p>
        </div>

        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            keyKind === "live"
              ? "border-teal/30 bg-mint/50 text-forest"
              : "border-forest/10 bg-mist text-ink"
          }`}
        >
          {keyKind === "live" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p>
                <strong>Paystack LIVE connected.</strong>{" "}
                {useLive
                  ? "Real MoMo prompts will go to the phone number you enter."
                  : "Paystack paused — using demo ledger."}
              </p>
              <label className="inline-flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={useLive}
                  onChange={(e) => setUseLive(e.target.checked)}
                />
                Use Paystack
              </label>
            </div>
          ) : liveEnabled ? (
            <div className="space-y-2">
              <p>
                <strong>Demo MoMo active</strong> — balances update on the phone preview. Live telco
                charges need Paystack business docs later; for now you can keep building.
              </p>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70">
                <input
                  type="checkbox"
                  checked={useLive}
                  onChange={(e) => setUseLive(e.target.checked)}
                />
                Optional: try Paystack TEST API
              </label>
              {useLive && testMoMoPhone && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-paper/80 px-3 py-2 text-ink/70">
                  <span>
                    Test API needs{" "}
                    <strong>{formatPhoneDisplay(testMoMoPhone)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMyPhone(testMoMoPhone)}
                    className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-paper"
                  >
                    Use test number
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>
              <strong>Paystack not detected.</strong> Restart the dev server after adding keys to{" "}
              <code className="rounded bg-paper/80 px-1">.env.local</code>.
            </p>
          )}
        </div>

        <div className="grid gap-2 rounded-2xl bg-sand p-1 sm:grid-cols-3">
          {(
            [
              ["fromPhone", "Phone → Bank"],
              ["toPhone", "Bank → Phone"],
              ["send", "Send to any number"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setError("");
                setMessage("");
                setReceipt(null);
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                mode === key ? "bg-forest text-paper shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {receipt && (
          <div
            className={`rounded-3xl border p-5 ${
              receipt.live
                ? "border-teal/30 bg-mint/50"
                : "border-teal/20 bg-mint/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-teal uppercase">
                  {receipt.live ? "Live telco receipt" : "Transaction receipt"}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">
                  {receipt.title}
                </h2>
                <p className="mt-1 text-sm text-ink/65">{receipt.subtitle}</p>
              </div>
              <p className="font-display text-xl font-bold text-forest">
                {formatMoney(receipt.amount, "GHS")}
              </p>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink/45">Reference</dt>
                <dd className="font-mono text-xs font-semibold">{receipt.reference}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Status</dt>
                <dd className="font-semibold text-teal">
                  {awaitingPhone ? "Awaiting phone PIN…" : "Submitted"}
                </dd>
              </div>
              {receipt.network && (
                <div>
                  <dt className="text-ink/45">Network</dt>
                  <dd className="font-semibold">{receipt.network}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink/45">Time</dt>
                <dd className="font-semibold">{new Date().toLocaleString("en-GB")}</dd>
              </div>
            </dl>
          </div>
        )}

        {mode !== "send" ? (
          <form
            onSubmit={onMomoMove}
            className="space-y-4 rounded-3xl border border-forest/10 bg-paper p-6 sm:p-8"
          >
            <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">
              {mode === "fromPhone" ? (
                useLive && liveEnabled ? (
                  <>
                    <strong>Live:</strong> Paystack sends a real MoMo prompt to{" "}
                    <strong>{phoneDisplay}</strong>. Approve with your PIN — money leaves the telco
                    wallet and credits your arkJoy account after confirmation.
                  </>
                ) : (
                  <>
                    Cash out from <strong>{phoneDisplay || "your MoMo"}</strong> into your bank
                    (demo ledger).
                  </>
                )
              ) : useLive && liveEnabled ? (
                <>
                  <strong>Live:</strong> Pays out from your Paystack balance to{" "}
                  <strong>{phoneDisplay}</strong> on the real network.
                </>
              ) : (
                <>
                  Move GH¢ from bank onto <strong>{phoneDisplay || "your MoMo"}</strong> (demo).
                </>
              )}
            </div>

            <label className="block text-sm">
              <span className="font-medium">
                {mode === "fromPhone" ? "Credit bank account" : "Debit bank account"}
              </span>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              >
                {ghsAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {formatMoney(a.balance, a.currency)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Your MoMo number</span>
                <input
                  value={myPhone}
                  onChange={(e) => setMyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="0546774063"
                  className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
                <span className="mt-1 block text-xs text-ink/45">
                  Use the same number on your MTN/Telecel/AirtelTigo wallet
                </span>
              </label>
              <label className="block text-sm">
                <span className="font-medium">Preview MoMo balance</span>
                <input
                  readOnly
                  value={wallet ? formatMoney(wallet.balance, "GHS") : "—"}
                  className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/60 px-4 py-3 font-semibold text-ink"
                />
              </label>
            </div>

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

            <label className="block text-sm">
              <span className="font-medium">Narration (optional)</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
              disabled={loading || !myPhone || Boolean(awaitingPhone)}
              className="w-full rounded-full bg-gold py-3.5 text-sm font-semibold text-ink hover:bg-gold-deep hover:text-paper disabled:opacity-60"
            >
              {awaitingPhone
                ? "Waiting for phone PIN…"
                : loading
                  ? "Processing…"
                  : useLive && liveEnabled
                    ? mode === "fromPhone"
                      ? "Charge via Paystack"
                      : "Pay out via Paystack"
                    : mode === "fromPhone"
                      ? "Withdraw (demo)"
                      : "Deposit (demo)"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={onSend}
            className="space-y-4 rounded-3xl border border-forest/10 bg-paper p-6 sm:p-8"
          >
            <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">
              {useLive && liveEnabled ? (
                <>
                  <strong>Live:</strong> Real MoMo payout to any Ghana number. Your Paystack
                  business must have Transfers enabled and enough balance.
                </>
              ) : (
                <>
                  Demo send to any Ghana MoMo number. Enable live keys for real telco delivery.
                </>
              )}
            </div>

            {!(useLive && liveEnabled) && (
              <div className="flex gap-2 rounded-full bg-sand p-1">
                <button
                  type="button"
                  onClick={() => setPayFrom("bank")}
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                    payFrom === "bank" ? "bg-paper text-ink shadow-sm" : "text-ink/55"
                  }`}
                >
                  Pay from bank
                </button>
                <button
                  type="button"
                  onClick={() => setPayFrom("momo")}
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                    payFrom === "momo" ? "bg-paper text-ink shadow-sm" : "text-ink/55"
                  }`}
                >
                  Pay from my MoMo
                </button>
              </div>
            )}

            <label className="block text-sm">
              <span className="font-medium">From bank account</span>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              >
                {ghsAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {formatMoney(a.balance, a.currency)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium">Recipient name</span>
              <input
                required
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Kwame Asante"
                className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium">Recipient MoMo number</span>
              <input
                required
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                placeholder="0551234567"
                className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
              {destNetwork && (
                <span className="mt-2 inline-flex rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-forest">
                  {destNetwork} detected
                </span>
              )}
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

            <label className="block text-sm">
              <span className="font-medium">Narration (optional)</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
              className="w-full rounded-full bg-gold py-3.5 text-sm font-semibold text-ink hover:bg-gold-deep hover:text-paper disabled:opacity-60"
            >
              {loading
                ? "Sending…"
                : useLive && liveEnabled
                  ? "Send MoMo via Paystack"
                  : "Send MoMo (demo)"}
            </button>
          </form>
        )}
      </div>

      <div className="lg:sticky lg:top-24">
        <PhonePreview
          wallet={wallet}
          phoneDisplay={phoneDisplay}
          pulse={pulse}
          latestSms={latestSms}
        />
      </div>
    </div>
  );
}
