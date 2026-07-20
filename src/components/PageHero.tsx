import Link from "next/link";

type Props = {
  eyebrow?: string;
  title: string;
  copy: string;
  image: string;
  imageAlt: string;
  cta?: { href: string; label: string };
};

export function PageHero({ eyebrow, title, copy, image, imageAlt, cta }: Props) {
  return (
    <section className="relative min-h-[42vh] overflow-hidden bg-ink text-paper sm:min-h-[58vh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center animate-kenburns"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/65 to-ink/90 sm:bg-gradient-to-r sm:from-ink/90 sm:via-ink/65 sm:to-ink/20" />
      <div className="relative mx-auto flex min-h-[42vh] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[58vh] sm:px-6 sm:py-16 lg:px-8">
        {eyebrow && (
          <p className="animate-rise font-display text-xs font-semibold tracking-[0.18em] text-gold uppercase sm:text-sm sm:tracking-[0.2em]">
            {eyebrow}
          </p>
        )}
        <h1 className="animate-rise-delay-1 mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:mt-3 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="animate-rise-delay-2 mt-3 max-w-xl text-base text-paper/80 sm:mt-4 sm:text-lg">{copy}</p>
        {cta && (
          <Link
            href={cta.href}
            className="animate-rise-delay-2 mt-6 inline-flex w-fit rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-deep hover:text-paper sm:mt-8"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
