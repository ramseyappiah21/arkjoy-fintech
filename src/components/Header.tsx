"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

const utilityLinks = [
  { href: "/about", label: "About arkJoy" },
  { href: "/branches", label: "Branches" },
  { href: "/rates", label: "Rates" },
  { href: "/support", label: "Support" },
];

const navLinks = [
  { href: "/", label: "Home", sub: "Banking that lifts you" },
  { href: "/personal", label: "Personal", sub: "Everyday banking" },
  { href: "/business", label: "Business", sub: "Grow with confidence" },
  { href: "/payments", label: "Payments", sub: "Send & receive" },
  { href: "/app", label: "arkJoy App", sub: "Bank on the go" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink text-sand/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <nav className="hidden flex-wrap items-center gap-5 md:flex">
            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sand/60">Customer care · 054 677 4063</p>
        </div>
      </div>

      <div className="border-b border-forest/10 bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-lg px-3 py-2 transition-colors hover:bg-mist"
              >
                <span className="block font-display text-sm font-semibold text-ink group-hover:text-teal">
                  {link.label}
                </span>
                <span className="block text-[11px] text-ink/45">{link.sub}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full border border-forest/20 px-4 py-2 text-sm font-medium text-forest transition hover:border-forest hover:bg-mist sm:inline-flex"
            >
              Internet Banking
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-deep hover:text-paper"
            >
              Open Account
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-forest/10 bg-paper px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 hover:bg-mist"
                  onClick={() => setOpen(false)}
                >
                  <span className="block font-display font-semibold">{link.label}</span>
                  <span className="text-sm text-ink/50">{link.sub}</span>
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-2 rounded-lg px-3 py-3 font-medium text-teal"
                onClick={() => setOpen(false)}
              >
                Internet Banking
              </Link>
              <Link
                href="/register"
                className="rounded-lg px-3 py-3 font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                Open Account
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
