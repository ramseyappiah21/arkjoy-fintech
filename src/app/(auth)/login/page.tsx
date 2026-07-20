"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("ama@arkjoy.bank");
  const [password, setPassword] = useState("joybank123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-forest/10 bg-paper p-8 shadow-[0_20px_60px_rgba(10,31,28,0.08)]"
    >
      <h1 className="font-display text-3xl font-bold text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-ink/60">
        Sign in to Internet Banking and your arkJoy dashboard.
      </p>

      <label className="mt-6 block text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </label>
      <label className="mt-4 block text-sm">
        <span className="font-medium">Password</span>
        <PasswordInput
          required
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
      </label>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-gold py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-deep hover:text-paper disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="mt-4 rounded-xl bg-mist px-3 py-2 text-xs text-ink/55">
        Demo: <strong>ama@arkjoy.bank</strong> / <strong>joybank123</strong>
      </p>

      <p className="mt-6 text-center text-sm text-ink/60">
        New to arkJoy?{" "}
        <Link href="/register" className="font-semibold text-teal hover:underline">
          Open an account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-ink/50">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
