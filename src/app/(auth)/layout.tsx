import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <Logo />
        <Link href="/" className="shrink-0 text-xs font-medium text-forest hover:text-teal sm:text-sm">
          ← Home
        </Link>
      </div>
      <div className="mx-auto w-full max-w-md px-3 pb-16 sm:px-4">{children}</div>
    </div>
  );
}
