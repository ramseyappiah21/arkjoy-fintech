import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await readSession();
  if (!user) redirect("/login?next=/dashboard");

  return <DashboardShell userName={user.name}>{children}</DashboardShell>;
}
