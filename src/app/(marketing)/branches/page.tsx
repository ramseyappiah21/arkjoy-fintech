import { PageHero } from "@/components/PageHero";

const branches = [
  {
    region: "Ashanti Region",
    city: "Kumasi",
    name: "Nkukua Buoho",
    address: "Nkukua Buoho, Kumasi",
    hours: "Mon–Fri 8:30–16:00 · Sat 9:00–13:00",
  },
  {
    region: "Western Region",
    city: "Tarkwa",
    name: "Tarkwa Branch",
    address: "Tarkwa, Western Region",
    hours: "Mon–Fri 8:30–16:00 · Sat 9:00–13:00",
  },
];

export default function BranchesPage() {
  return (
    <>
      <PageHero
        eyebrow="Branches"
        title="Find arkJoy near you"
        copy="Visit us in Nkukua Buoho, Kumasi or Tarkwa, Western — or bank anytime in the app."
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Bright modern office lobby"
      />

      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className="rounded-2xl border border-forest/10 bg-sand/40 p-6"
              >
                <p className="text-xs font-semibold tracking-wider text-teal uppercase">
                  {branch.region}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-ink">{branch.name}</h2>
                <p className="mt-1 text-sm text-ink/70">{branch.address}</p>
                <p className="mt-3 text-sm text-ink/60">{branch.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
