import { PageHero } from "@/components/PageHero";

export default function RatesPage() {
  return (
    <>
      <PageHero
        eyebrow="Rates"
        title="Stay up to date on rates"
        copy="Indicative reference, FX, and card rates — published to help you plan with confidence."
        image="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Financial market charts on a screen"
      />

      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-gold p-8 text-ink">
              <p className="text-sm font-semibold tracking-wider uppercase">Reference Rate</p>
              <p className="mt-4 font-display text-5xl font-extrabold">10.59%</p>
              <p className="mt-2 text-sm">Per annum · Effective 1 Jul 2026</p>
            </div>
            <div className="rounded-3xl bg-paper p-8 lg:col-span-2">
              <h2 className="font-display text-xl font-bold">Indicative FX (demo)</h2>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-forest/15 text-ink/50">
                    <tr>
                      <th className="pb-3 font-medium">Currency</th>
                      <th className="pb-3 font-medium">Buy</th>
                      <th className="pb-3 font-medium">Sell</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink/80">
                    {[
                      ["USD", "15.20", "15.45"],
                      ["EUR", "16.40", "16.75"],
                      ["GBP", "19.10", "19.55"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-b border-forest/8">
                        <td className="py-3 font-semibold">{row[0]}</td>
                        <td className="py-3">{row[1]}</td>
                        <td className="py-3">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-ink/45">
                Demo figures for illustration only. Contact your branch for live rates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
