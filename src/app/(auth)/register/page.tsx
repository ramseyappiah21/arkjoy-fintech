"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    accountType: "personal",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/dashboard");
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
      <h1 className="font-display text-3xl font-bold text-ink">Open your account</h1>
      <p className="mt-2 text-sm text-ink/60">
        Create your arkJoy profile and start banking in GH¢ today.
      </p>

      {(
        [
          ["name", "Full name", "text", "Ama Mensah"],
          ["email", "Email", "email", "you@email.com"],
          ["phone", "Phone (Ghana)", "tel", "0244 000 000"],
        ] as const
      ).map(([key, label, type, placeholder]) => (
        <label key={key} className="mt-4 block text-sm">
          <span className="font-medium">{label}</span>
          <input
            type={type}
            required
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>
      ))}

      <label className="mt-4 block text-sm">
        <span className="font-medium">Password</span>
        <PasswordInput
          required
          placeholder="••••••••"
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
          autoComplete="new-password"
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="font-medium">Account type</span>
        <select
          value={form.accountType}
          onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-forest/15 bg-sand/40 px-4 py-3 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        >
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </select>
      </label>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-gold py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-deep hover:text-paper disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already banking with us?{" "}
        <Link href="/login" className="font-semibold text-teal hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
