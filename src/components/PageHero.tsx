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
    <section className="relative min-h-[58vh] overflow-hidden bg-ink text-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover animate-kenburns"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/20" />
      <div className="relative mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-4 py-16 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="animate-rise font-display text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="animate-rise-delay-1 mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="animate-rise-delay-2 mt-4 max-w-xl text-lg text-paper/80">{copy}</p>
        {cta && (
          <Link
            href={cta.href}
            className="animate-rise-delay-2 mt-8 inline-flex w-fit rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-deep hover:text-paper"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
