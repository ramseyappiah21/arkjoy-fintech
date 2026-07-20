import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex min-w-0 items-center gap-2 sm:gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-gold transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
      >
        <svg viewBox="0 0 40 40" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" aria-hidden>
          <path
            d="M20 6c-4.2 5.2-8 9.8-8 14.2a8 8 0 0 0 16 0C28 15.8 24.2 11.2 20 6Z"
            fill="currentColor"
          />
          <path
            d="M20 12c-2.4 3-4.5 5.7-4.5 8.2a4.5 4.5 0 1 0 9 0C24.5 17.7 22.4 15 20 12Z"
            fill="#0f3d36"
          />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
        ark<span className="text-teal">Joy</span>
      </span>
    </Link>
  );
}
