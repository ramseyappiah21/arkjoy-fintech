import Link from "next/link";
import { PageHero } from "@/components/PageHero";

const products = [
  {
    id: "savings",
    title: "Savings Accounts",
    items: [
      "Standard Savings — earn on your GH¢ balance with flexible access",
      "Diaspora Save — for Ghanaians abroad sending home with purpose",
      "Student Account — banking built for campus life in Ghana",
      "Kids & Trust — start their financial journey early",
    ],
  },
  {
    id: "current",
    title: "Current Accounts",
    items: [
      "arkJoy Current — everyday MoMo, POS, and cheque-free payments",
      "Salary Account — get paid and bank in one place",
      "Foreign Currency — hold USD, EUR, GBP for travel and trade",
    ],
  },
  {
    id: "loans",
    title: "Loans",
    items: [
      "24hr Personal Loans — cash when timing matters",
      "Buy Now, Pay Later — shop now at partner merchants nationwide",
      "Salary Advance — bridge the gap before payday",
      "Investment-backed facility — unlock liquidity without selling",
    ],
  },
  {
    id: "cards",
    title: "Cards & eProducts",
    items: [
      "Debit Cards — spend in GH¢ and abroad with local control",
      "Mobile Banking — full self-service on your phone",
      "Internet Banking — manage everything from your desk",
    ],
  },
];

export default function PersonalPage() {
  return (
    <>
      <PageHero
        eyebrow="Personal"
        title="Everyday banking for Ghanaian life"
        copy="Savings, current accounts, instant loans, and cards — built for salary day, school fees, and weekend markets."
        image="https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Person smiling while reviewing personal finances"
        cta={{ href: "/register", label: "Open a Personal Account" }}
      />

      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {products.map((product) => (
              <div key={product.id} id={product.id} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-bold text-ink">{product.title}</h2>
                <ul className="mt-5 space-y-3">
                  {product.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 border-b border-forest/10 pb-3 text-ink/75"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-deep hover:text-paper"
            >
              Open Account
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-forest/20 px-6 py-3 text-sm font-medium text-forest hover:bg-mist"
            >
              Internet Banking
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
