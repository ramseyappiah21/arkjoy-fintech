import Link from "next/link";
import { PageHero } from "@/components/PageHero";

const features = [
  "Open an account with verified ID in minutes",
  "Instant transfers and bill payments",
  "Request loans and track approvals",
  "Virtual cards for safer online shopping",
  "Live notifications for every transaction",
  "Branch & ATM locator built in",
];

export default function AppPage() {
  return (
    <>
      <PageHero
        eyebrow="arkJoy App"
        title="Your bank in your pocket"
        copy="Simple, secure, and built for real Ghanaian lives — transfers, bills, credit, and more."
        image="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Person using mobile banking app outdoors"
        cta={{ href: "/open-account", label: "Get Started" }}
      />

      <section className="bg-paper py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
              Everything you need, one tap away
            </h2>
            <ul className="mt-8 space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-ink/75">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-xs text-forest">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-forest"
              >
                Download for iOS
              </a>
              <a
                href="#"
                className="rounded-full border border-forest/20 px-6 py-3 text-sm font-medium text-forest hover:bg-mist"
              >
                Download for Android
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-forest-gradient p-10 text-paper">
            <p className="font-display text-sm font-semibold tracking-widest text-gold uppercase">
              Why customers switch
            </p>
            <p className="mt-6 font-display text-3xl font-bold leading-snug">
              Over one million moments of banking without a queue.
            </p>
            <p className="mt-4 text-paper/70">
              Send money to family, settle a bill from the sofa, or unlock instant credit
              when opportunity knocks.
            </p>
            <Link
              href="/support"
              className="mt-8 inline-flex text-sm font-semibold text-gold hover:underline"
            >
              Need help getting started? →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
