import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export default function SupportPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="We are here when you need us"
        copy="Call, WhatsApp, or visit a branch — our team serves you in Kumasi and Tarkwa."
        image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Customer support representative at a laptop"
      />

      <section className="bg-paper py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { title: "Call", detail: "054 677 4063", note: "Mon–Fri 8:00–20:00 · Sat 9:00–14:00" },
            { title: "Email", detail: "ramseyappiah21@gmail.com", note: "We reply within one business day" },
            {
              title: "Branches",
              detail: "Two locations",
              note: "Nkukua Buoho, Kumasi · Tarkwa, Western",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-sand/60 p-8">
              <h2 className="font-display text-xl font-bold text-ink">{item.title}</h2>
              <p className="mt-3 text-lg font-medium text-teal">{item.detail}</p>
              <p className="mt-2 text-sm text-ink/55">{item.note}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-wrap gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/branches"
            className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-deep hover:text-paper"
          >
            Find a Branch
          </Link>
          <Link
            href="/login"
            className="inline-flex rounded-full border border-forest/20 px-6 py-3 text-sm font-medium text-forest hover:bg-mist"
          >
            Internet Banking
          </Link>
        </div>
      </section>
    </>
  );
}
