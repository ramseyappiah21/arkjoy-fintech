import { NextResponse } from "next/server";
import {
  PAYSTACK_TEST_MOMO_PHONE,
  paystackHealthCheck,
  paystackKeyKind,
  paystackMode,
} from "@/lib/paystack";

export async function GET() {
  const mode = paystackMode();
  const keyKind = paystackKeyKind();
  const connected =
    mode === "live" ? (await paystackHealthCheck()).ok : false;

  return NextResponse.json({
    mode,
    live: mode === "live",
    keyKind,
    connected,
    testMoMoPhone: keyKind === "test" ? PAYSTACK_TEST_MOMO_PHONE : null,
    message:
      mode === "live"
        ? keyKind === "live"
          ? connected
            ? "Live Paystack keys connected — real MoMo prompts will go to the phone number you enter."
            : "Live keys set but Paystack is unreachable — check network or key validity."
          : connected
            ? `Paystack TEST mode connected. Use test MoMo number ${PAYSTACK_TEST_MOMO_PHONE} — your real phone will not get a prompt until live keys are activated.`
            : "Paystack TEST keys set but API unreachable — check internet or secret key."
        : "Demo mode — add PAYSTACK_SECRET_KEY to .env.local and restart the dev server.",
  });
}
