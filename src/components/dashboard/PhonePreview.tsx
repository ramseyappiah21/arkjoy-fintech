"use client";

import { formatMoney } from "@/lib/money";
import { formatPhoneDisplay } from "@/lib/phone";
import type { MomoNotification, MomoWallet } from "@/lib/types";

type Props = {
  wallet: MomoWallet | null;
  phoneDisplay?: string;
  pulse?: boolean;
  latestSms?: MomoNotification | null;
};

export function PhonePreview({ wallet, phoneDisplay, pulse, latestSms }: Props) {
  const phone = phoneDisplay || (wallet ? formatPhoneDisplay(wallet.phone) : "—");
  const balance = wallet?.balance ?? 0;
  const network = wallet?.network ?? "MoMo";
  const sms = latestSms || wallet?.notifications?.[0] || null;
  const isOut = sms ? sms.amount < 0 : false;

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2.4rem] border-[10px] border-ink bg-ink p-2 shadow-2xl">
        <div className="overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-[#0f3d36] to-[#0a1f1c] text-paper">
          <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-paper/70">
            <span>
              {new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="h-4 w-20 rounded-full bg-ink/40" />
            <span>5G · 100%</span>
          </div>

          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gold uppercase">
                {network}
              </span>
              <span className="text-[10px] text-paper/50">Mobile Money</span>
            </div>
            <p className="mt-2 text-sm text-paper/70">{phone}</p>
            <p
              className={`mt-4 font-display text-3xl font-extrabold tracking-tight transition duration-500 ${
                pulse ? "scale-105 text-gold" : "text-paper"
              }`}
            >
              {formatMoney(balance, "GHS")}
            </p>
            <p className="mt-1 text-xs text-paper/50">Available balance</p>
          </div>

          <div className="min-h-[240px] bg-[#f4f1ea] px-3 py-3 text-ink">
            <p className="px-2 text-[11px] font-semibold tracking-wide text-ink/45 uppercase">
              MoMo alerts
            </p>

            {sms ? (
              <div
                key={sms.id}
                className={`mt-2 rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm ring-1 ring-forest/10 ${
                  pulse ? "animate-rise" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-teal">{network} MoMo</p>
                  <p className="text-[10px] text-ink/40">
                    {new Date(sms.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-ink">{sms.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink/70">{sms.body}</p>
                <p
                  className={`mt-2 text-xs font-bold ${
                    isOut ? "text-ink" : "text-forest"
                  }`}
                >
                  {isOut ? "" : "+"}
                  {formatMoney(Math.abs(sms.amount), "GHS")}
                </p>
              </div>
            ) : (
              <div className="mt-6 px-2 text-center text-xs text-ink/45">
                Move money to or from this number — SMS and balance update here.
              </div>
            )}

            {(wallet?.notifications?.length ?? 0) > 1 && (
              <div className="mt-2 space-y-2 px-1">
                {wallet!.notifications.slice(1, 3).map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl bg-white/80 px-3 py-2 text-[10px] text-ink/55"
                  >
                    {n.body}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink/45">
        Live phone preview · demo MoMo (no real telco charged)
      </p>
    </div>
  );
}
