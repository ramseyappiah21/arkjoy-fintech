import Link from "next/link";
import { Hero } from "@/components/Hero";

const quickProducts = [
  {
    title: "Money Transfer",
    copy: "Receive Western Union, Ria, and diaspora remittances into your GH¢ account — tracked end to end.",
    href: "/payments",
  },
  {
    title: "eBanking",
    copy: "Internet Banking with real balances, MoMo transfers, and bill pay for ECG, MTN, and more.",
    href: "/login",
  },
  {
    title: "Instant Loans",
    copy: "Salary-backed and 24hr personal loans when timing matters — approvals in hours, not weeks.",
    href: "/personal#loans",
  },
  {
    title: "Diaspora Save",
    copy: "Working in the UK, US, or Gulf? Save in Ghana while you live abroad.",
    href: "/personal#savings",
  },
];

const digitalFeatures = [
  {
    title: "Buy Now, Pay Later",
    copy: "Shop at partner merchants across Ghana and settle on a schedule that fits your paycheck.",
  },
  {
    title: "Mobile Banking",
    copy: "MoMo, bank transfers, airtime, and balances — simple, secure, always with you.",
  },
  {
    title: "Internet Banking",
    copy: "Full control from your laptop: statements, transfers, cards, and bill payments.",
  },
  {
    title: "Debit Cards",
    copy: "Visa and Mastercard for Accra malls, online shopping, and travel abroad.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="border-b border-forest/10 bg-paper">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-3">
          <div className="relative isolate min-h-[220px] overflow-hidden sm:min-h-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
              alt="arkJoy team collaborating in a bright office"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />
            <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end p-6 sm:min-h-[280px] sm:p-8">
              <p className="font-display text-xl font-bold text-paper sm:text-2xl">
                Loans that move with you
              </p>
              <p className="mt-2 max-w-xs text-sm text-paper/80">
                Salary-backed options with clear rates — no guessing.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center bg-forest px-6 py-10 text-paper sm:px-10 sm:py-12">
            <p className="font-display text-sm font-semibold tracking-widest text-gold uppercase">
              Reference Rate
            </p>
            <p className="mt-3 font-display text-4xl font-extrabold tracking-tight text-paper sm:text-6xl">10.59%</p>
            <p className="mt-2 text-sm font-medium text-paper/75">Per annum · Effective 1 Jul 2026</p>
            <Link
              href="/personal#loans"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-gold-deep hover:text-paper sm:w-fit"
            >
              Get a Loan
            </Link>
          </div>
          <div className="relative isolate min-h-[220px] overflow-hidden bg-forest text-paper sm:min-h-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
              alt="Digital banking dashboard on a laptop"
              className="absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent" />
            <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end p-6 sm:min-h-[280px] sm:p-10">
              <p className="font-display text-2xl font-bold">Bank from anywhere</p>
              <p className="mt-2 max-w-xs text-sm text-paper/80">
                Open accounts, move money, and track spending in the arkJoy app.
              </p>
              <Link
                href="/app"
                className="mt-6 inline-flex w-fit rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-ink"
              >
                Download the app →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mesh py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Banking built for real life
            </h2>
            <p className="mt-4 text-lg text-ink/65">
              From instant transfers to business credit — the essentials, without the friction.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-forest/10 sm:grid-cols-2 lg:grid-cols-4">
            {quickProducts.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group bg-paper p-8 transition hover:bg-mist"
              >
                <h3 className="font-display text-xl font-bold text-ink group-hover:text-teal">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{item.copy}</p>
                <span className="mt-6 inline-block text-sm font-semibold text-gold-deep">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-gradient py-20 text-paper sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="font-display text-sm font-semibold tracking-[0.18em] text-gold uppercase">
                Digital channels
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
                A better way to bank — on your terms
              </h2>
              <p className="mt-4 text-lg text-paper/70">
                Your bank for life in Ghana — clear numbers, quick MoMo, and people who
                show up when it matters.
              </p>
              <blockquote className="mt-8 border-l-2 border-gold pl-5 text-paper/80 italic">
                “From salary day in Accra to market week in Kumasi, banking should feel
                light — and a little joyful.”
                <footer className="mt-3 text-sm not-italic text-paper/50">
                  — Leadership, arkJoy
                </footer>
              </blockquote>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {digitalFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-paper/10 bg-paper/5 p-6 backdrop-blur-sm transition hover:bg-paper/10"
                >
                  <h3 className="font-display text-lg font-semibold text-gold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/70">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Personal & business, side by side
              </h2>
              <p className="mt-4 max-w-xl text-lg text-ink/65">
                Whether you are saving for tomorrow or scaling a shop into a brand,
                arkJoy meets you where you are.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/branches"
                className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-medium text-forest hover:bg-mist"
              >
                Find a Branch
              </Link>
              <Link
                href="/rates"
                className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-medium text-forest hover:bg-mist"
              >
                FX & Card Rates
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Link
              href="/personal"
              className="group relative min-h-[340px] overflow-hidden rounded-3xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1400&q=80"
                alt="Customer using arkJoy personal banking"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="font-display text-3xl font-bold text-paper">Personal</h3>
                <p className="mt-2 text-paper/75">Savings, current accounts, loans & cards</p>
                <span className="mt-4 inline-block text-sm font-semibold text-gold">
                  Everyday banking →
                </span>
              </div>
            </Link>
            <Link
              href="/business"
              className="group relative min-h-[340px] overflow-hidden rounded-3xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80"
                alt="Team reviewing business banking options"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="font-display text-3xl font-bold text-paper">Business</h3>
                <p className="mt-2 text-paper/75">Accounts, SME tools, payments & credit</p>
                <span className="mt-4 inline-block text-sm font-semibold text-gold">
                  Bank your business →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-sand py-20 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal/15 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Open an account today
            </h2>
            <p className="mt-4 text-lg text-ink/65">
              Start with personal or business banking. Walk into a branch or begin online —
              we will meet you either way.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-deep hover:text-paper"
            >
              Get Started
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-forest/25 px-7 py-3.5 text-sm font-medium text-forest transition hover:bg-paper"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
