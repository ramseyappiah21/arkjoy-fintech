"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/dashboard/transfer", label: "Transfer & MoMo" },
  { href: "/dashboard/statements", label: "Statements" },
  { href: "/dashboard/bills", label: "Pay Bills" },
  { href: "/dashboard/cards", label: "Cards" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function DashboardShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-sand/40">
      <header className="sticky top-0 z-40 border-b border-forest/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/15 sm:h-10 sm:w-10 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Logo />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[10rem] truncate text-sm font-semibold text-ink">{userName}</p>
              <p className="text-xs text-ink/50">Internet Banking</p>
            </div>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded-full border border-forest/20 px-3 py-2 text-xs font-medium text-forest hover:bg-mist disabled:opacity-60 sm:px-4 sm:text-sm"
            >
              {loggingOut ? "…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6 lg:px-8">
        {/* Mobile chip nav */}
        <nav className="scroll-x-chips mb-4 lg:hidden" aria-label="Dashboard sections">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                isActive(link.href, link.exact)
                  ? "bg-forest text-paper"
                  : "border border-forest/15 bg-paper text-ink/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <aside
          className={`${
            open ? "mb-4 block" : "hidden"
          } rounded-2xl border border-forest/10 bg-paper p-3 lg:mb-0 lg:block`}
        >
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive(link.href, link.exact)
                    ? "bg-forest text-paper"
                    : "text-ink/70 hover:bg-mist hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
