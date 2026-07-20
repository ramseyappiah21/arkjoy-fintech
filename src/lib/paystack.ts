import { detectNetwork, normalizePhone } from "./phone";

const PAYSTACK_BASE = "https://api.paystack.co";
const PAYSTACK_TIMEOUT_MS = 25_000;

/** Paystack test MoMo number — real phones do not receive prompts in test mode. */
export const PAYSTACK_TEST_MOMO_PHONE = "0551234987";

export type PaystackProvider = "mtn" | "atl" | "vod";

export function isPaystackLiveConfigured() {
  const key = (process.env.PAYSTACK_SECRET_KEY || "").trim();
  return Boolean(key) && !key.includes("your_") && key.length > 20;
}

export function paystackKeyKind(): "live" | "test" | "missing" {
  const key = (process.env.PAYSTACK_SECRET_KEY || "").trim();
  if (!key || key.length <= 20) return "missing";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return "test";
}

export function paystackMode(): "live" | "demo" {
  return isPaystackLiveConfigured() ? "live" : "demo";
}

export function toPesewas(amountGhs: number) {
  return Math.round(amountGhs * 100);
}

export function networkToPaystackProvider(
  network: ReturnType<typeof detectNetwork>
): PaystackProvider {
  if (network === "MTN") return "mtn";
  if (network === "AirtelTigo") return "atl";
  if (network === "Telecel") return "vod";
  return "mtn";
}

export function phoneForPaystack(phone: string) {
  return normalizePhone(phone);
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T; message?: string }> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return {
      ok: false,
      status: 500,
      data: {} as T,
      message: "PAYSTACK_SECRET_KEY is not set",
    };
  }

  try {
    const res = await fetch(`${PAYSTACK_BASE}${path}`, {
      ...init,
      signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data: T;
    };

    return {
      ok: res.ok && json.status === true,
      status: res.status,
      data: json.data,
      message: json.message,
    };
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "Paystack API timed out — check internet or try again."
        : err instanceof Error
          ? err.message
          : "Could not reach Paystack";
    return {
      ok: false,
      status: 504,
      data: {} as T,
      message,
    };
  }
}

export async function paystackHealthCheck() {
  return paystackFetch<Array<{ currency: string; balance: number }>>("/balance");
}

export type ChargeResult = {
  reference: string;
  status: string;
  display_text?: string;
  amount: number;
  currency: string;
  id?: number;
};

/** Collect money FROM a customer's MoMo wallet (real USSD/prompt on their phone). */
export async function chargeMobileMoney(input: {
  email: string;
  amountGhs: number;
  phone: string;
  provider: PaystackProvider;
  reference: string;
  metadata?: Record<string, string>;
}) {
  return paystackFetch<ChargeResult>("/charge", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: toPesewas(input.amountGhs),
      currency: "GHS",
      reference: input.reference.toLowerCase(),
      mobile_money: {
        phone: phoneForPaystack(input.phone),
        provider: input.provider,
      },
      metadata: input.metadata,
    }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackFetch<{
    status: string;
    reference: string;
    amount: number;
    currency: string;
    gateway_response?: string;
    paid_at?: string;
    channel?: string;
    customer?: { email?: string; phone?: string };
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export async function createMomoTransferRecipient(input: {
  name: string;
  phone: string;
  provider: PaystackProvider;
}) {
  // Ghana MoMo recipient bank codes commonly match provider codes uppercase
  const bankCode =
    input.provider === "mtn"
      ? "MTN"
      : input.provider === "vod"
        ? "VOD"
        : "ATL";

  return paystackFetch<{
    recipient_code: string;
    details?: { account_number?: string; bank_code?: string };
  }>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "mobile_money",
      name: input.name,
      account_number: phoneForPaystack(input.phone),
      bank_code: bankCode,
      currency: "GHS",
    }),
  });
}

export async function initiateMomoTransfer(input: {
  amountGhs: number;
  recipientCode: string;
  reason: string;
  reference: string;
}) {
  return paystackFetch<{
    transfer_code: string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
  }>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: toPesewas(input.amountGhs),
      recipient: input.recipientCode,
      reason: input.reason,
      currency: "GHS",
      reference: input.reference.toLowerCase(),
    }),
  });
}

export async function verifyTransfer(reference: string) {
  return paystackFetch<{
    status: string;
    reference: string;
    amount: number;
    currency: string;
    transfer_code?: string;
  }>(`/transfer/verify/${encodeURIComponent(reference)}`);
}
