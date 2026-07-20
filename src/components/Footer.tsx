import Link from "next/link";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Personal Banking",
    links: [
      { href: "/personal#savings", label: "Savings Accounts" },
      { href: "/personal#current", label: "Current Accounts" },
      { href: "/personal#loans", label: "Loans" },
      { href: "/personal#cards", label: "Debit Cards" },
    ],
  },
  {
    title: "Business Banking",
    links: [
      { href: "/business#accounts", label: "Business Accounts" },
      { href: "/business#sme", label: "SME Solutions" },
      { href: "/business#payments", label: "Payment Solutions" },
      { href: "/business#credit", label: "Business Credit" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/payments", label: "Money Transfer" },
      { href: "/app", label: "Mobile Banking" },
      { href: "/internet-banking", label: "Internet Banking" },
      { href: "/rates", label: "FX & Rates" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Corporate Info" },
      { href: "/branches", label: "Find a Branch" },
      { href: "/support", label: "Customer Care" },
      { href: "/about#security", label: "Security Tips" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-sand">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo className="[&_span:last-child]:text-sand [&_.text-teal]:text-gold" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand/65">
              arkJoy is a modern Ghanaian bank for people and businesses who want
              banking that feels clear, fast, and human — from MoMo to every branch.
            </p>
            <p className="mt-6 text-sm text-sand/50">
              Business hours · Mon–Fri 8:30am–4:00pm · Customer care 054 677 4063
              <br />
              <a
                href="mailto:ramseyappiah21@gmail.com"
                className="text-gold/90 hover:text-gold"
              >
                ramseyappiah21@gmail.com
              </a>
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-display text-sm font-semibold text-gold">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-sand/70 transition hover:text-sand"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-sand/10 pt-6 text-xs text-sand/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} arkJoy Bank. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about#privacy" className="hover:text-sand">
              Privacy Policy
            </Link>
            <Link href="/about#security" className="hover:text-sand">
              Cyber Security
            </Link>
            <Link href="/support" className="hover:text-sand">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
