import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export default function PaymentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Payments"
        title="Send and receive without the wait"
        copy="Domestic transfers, international remittances, bill pay, and trade payments — tracked end to end."
        image="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Secure digital payment on a smartphone"
        cta={{ href: "/app", label: "Transfer in the App" }}
      />

      <section className="bg-mesh py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              title: "Money Transfer",
              copy: "Receive funds from partners worldwide with transparent fees and status updates.",
            },
            {
              title: "Bills & Merchants",
              copy: "Pay utilities, schools, and vendors in a few taps — receipts saved automatically.",
            },
            {
              title: "Trade & Express",
              copy: "Letters of credit, collections, and express corridors for international commerce.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-paper p-8 shadow-[0_1px_0_rgba(15,61,54,0.08)]">
              <h2 className="font-display text-xl font-bold text-ink">{item.title}</h2>
              <p className="mt-3 text-ink/65">{item.copy}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/internet-banking"
            className="text-sm font-semibold text-teal hover:underline"
          >
            Prefer the desktop? Open Internet Banking →
          </Link>
        </div>
      </section>
    </>
  );
}
