import Link from "next/link";
import { PageHero } from "@/components/PageHero";

const offerings = [
  {
    id: "accounts",
    title: "Business Accounts",
    copy: "Current accounts, foreign currency holdings, and multi-user access for your team across Ghana.",
  },
  {
    id: "sme",
    title: "SME Solutions",
    copy: "Working capital and tools for traders, retailers, and growing enterprises — from inventory to expansion.",
  },
  {
    id: "payments",
    title: "Payment Solutions",
    copy: "Collections, bulk payouts, POS, and GHIPSS rails that keep cash flowing.",
  },
  {
    id: "credit",
    title: "Business Credit",
    copy: "Overdrafts, employee schemes, and Business Express facilitators when you need a decision fast.",
  },
];

export default function BusinessPage() {
  return (
    <>
      <PageHero
        eyebrow="Business"
        title="Bank your business with confidence"
        copy="arkJoy Business Express connects you to facilitators, credit, and payments so you can focus on growth."
        image="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Business owners collaborating in a modern workspace"
        cta={{ href: "/register", label: "Open a Business Account" }}
      />

      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
              All the support you need
            </h2>
            <p className="mt-4 text-lg text-ink/65">
              Contact Business Express on 054 677 4063 or ramseyappiah21@gmail.com
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {offerings.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="scroll-mt-28 border-t-2 border-gold bg-sand/60 p-8"
              >
                <h3 className="font-display text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-ink/65">{item.copy}</p>
              </div>
            ))}
          </div>

          <Link
            href="/register"
            className="mt-12 inline-flex rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition hover:bg-forest"
          >
            Start Banking with arkJoy
          </Link>
        </div>
      </section>
    </>
  );
}
