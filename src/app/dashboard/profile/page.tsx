import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await readSession();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Profile</h1>
        <p className="mt-1 text-ink/60">Your arkJoy identity and security basics.</p>
      </div>

      <div className="rounded-3xl border border-forest/10 bg-paper p-6 sm:p-8">
        <dl className="space-y-5 text-sm">
          <div>
            <dt className="text-ink/45">Full name</dt>
            <dd className="mt-1 text-lg font-semibold text-ink">{user.name}</dd>
          </div>
          <div>
            <dt className="text-ink/45">Email</dt>
            <dd className="mt-1 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-ink/45">Phone</dt>
            <dd className="mt-1 font-medium">{user.phone || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-ink/45">Customer ID</dt>
            <dd className="mt-1 font-mono text-xs text-ink/70">{user.id}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-3xl bg-mist p-6">
        <h2 className="font-display text-lg font-bold text-ink">Security tips</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>Never share OTPs — arkJoy will never ask for them on a call.</li>
          <li>Enable phone lock and keep the app updated.</li>
          <li>Report lost cards immediately from the Cards page.</li>
        </ul>
      </div>
    </div>
  );
}
