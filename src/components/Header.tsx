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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 text-[11px] sm:px-6 sm:py-2 sm:text-xs lg:px-8">
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
          <a href="tel:+233546774063" className="truncate text-sand/70 hover:text-gold">
            Care · 054 677 4063
          </a>
        </div>
      </div>

      <div className="border-b border-forest/10 bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
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

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="hidden rounded-full border border-forest/20 px-4 py-2 text-sm font-medium text-forest transition hover:border-forest hover:bg-mist sm:inline-flex"
            >
              Internet Banking
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gold px-3 py-2 text-xs font-semibold text-ink transition hover:bg-gold-deep hover:text-paper sm:px-4 sm:text-sm"
            >
              Open Account
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-forest/15 sm:h-10 sm:w-10 lg:hidden"
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
          <div className="max-h-[min(70vh,520px)] overflow-y-auto border-t border-forest/10 bg-paper px-3 py-3 sm:px-4 sm:py-4 lg:hidden">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 hover:bg-mist"
                  onClick={() => setOpen(false)}
                >
                  <span className="block font-display font-semibold">{link.label}</span>
                  <span className="text-sm text-ink/50">{link.sub}</span>
                </Link>
              ))}
              <div className="my-2 border-t border-forest/10" />
              {utilityLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-mist"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-1 rounded-lg px-3 py-2.5 font-medium text-teal"
                onClick={() => setOpen(false)}
              >
                Internet Banking
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gold/20 px-3 py-2.5 font-semibold text-ink"
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
