import { PageHero } from "@/components/PageHero";

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About arkJoy"
        title="Banking that lifts you"
        copy="We are building a modern bank rooted in trust, clarity, and joy — for individuals, families, and businesses."
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Modern bank building exterior"
      />

      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Our promise</h2>
            <p className="mt-4 leading-relaxed text-ink/70">
              arkJoy exists to make financial progress feel approachable. Inspired by the
              reliability of great community banks and the speed of modern fintech, we
              combine human service with digital channels that actually work.
            </p>
          </div>
          <div id="privacy">
            <h2 className="font-display text-2xl font-bold text-ink">Privacy</h2>
            <p className="mt-4 leading-relaxed text-ink/70">
              We protect your data with industry-standard encryption, strict access
              controls, and transparent policies. We never sell personal information.
            </p>
          </div>
          <div id="security">
            <h2 className="font-display text-2xl font-bold text-ink">Cyber security tips</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/70">
              <li>Never share your OTP, PIN, or password with anyone.</li>
              <li>Verify URLs before logging into Internet Banking.</li>
              <li>Enable app notifications and review transactions regularly.</li>
              <li>Report suspicious messages to support immediately.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
