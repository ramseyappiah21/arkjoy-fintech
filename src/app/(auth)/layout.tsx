import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <Link href="/" className="text-sm font-medium text-forest hover:text-teal">
          ← Back to home
        </Link>
      </div>
      <div className="mx-auto max-w-md px-4 pb-16">{children}</div>
    </div>
  );
}
