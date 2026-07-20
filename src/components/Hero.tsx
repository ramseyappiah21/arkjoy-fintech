"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    eyebrow: "Business Express",
    title: "Grow your business with arkJoy",
    copy: "From Makola to Airport City — dedicated facilitators, GHIPSS payments, and credit that keeps your stock moving.",
    cta: { href: "/business", label: "Explore Business Banking" },
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80",
    imageAlt: "Ghanaian business owner smiling while using a phone in a shop",
  },
  {
    id: 2,
    eyebrow: "Personal Banking",
    title: "Everyday banking, done with joy",
    copy: "Open a GH¢ account in minutes, send MoMo, pay ECG, and manage your money securely — anywhere in Ghana.",
    cta: { href: "/personal", label: "Explore Personal Banking" },
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1920&q=80",
    imageAlt: "Person reviewing finances on a smartphone",
  },
  {
    id: 3,
    eyebrow: "arkJoy App",
    title: "Your bank in your pocket",
    copy: "Transfers, bills, loans, and Visa debit — built for Accra traffic, Kumasi markets, and weekends at home.",
    cta: { href: "/app", label: "Get the App" },
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=80",
    imageAlt: "Mobile banking on a smartphone",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-ink text-paper sm:min-h-[88vh]">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.image}
            alt=""
            className={`h-full w-full object-cover object-center ${i === index ? "animate-kenburns" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink/90 sm:bg-gradient-to-r sm:from-ink/92 sm:via-ink/70 sm:to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30 sm:from-ink/50 sm:to-ink/20" />
        </div>
      ))}

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[88vh] sm:justify-center sm:px-6 sm:py-24 lg:px-8">
        <p
          key={`eyebrow-${slide.id}`}
          className="animate-rise font-display text-xs font-semibold tracking-[0.18em] text-gold uppercase sm:text-sm sm:tracking-[0.2em]"
        >
          {slide.eyebrow}
        </p>
        <h1
          key={`title-${slide.id}`}
          className="animate-rise-delay-1 mt-3 max-w-3xl font-display text-[1.85rem] leading-[1.1] font-extrabold tracking-tight text-paper sm:mt-4 sm:text-5xl lg:text-7xl"
        >
          {slide.title}
        </h1>
        <p
          key={`copy-${slide.id}`}
          className="animate-rise-delay-2 mt-4 max-w-xl text-base leading-relaxed text-paper/80 sm:mt-6 sm:text-xl"
        >
          {slide.copy}
        </p>
        <div className="animate-rise-delay-2 mt-7 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href={slide.cta.href}
            className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-deep hover:text-paper sm:px-7"
          >
            {slide.cta.label}
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border border-paper/35 px-6 py-3.5 text-sm font-medium text-paper transition hover:border-paper hover:bg-paper/10 sm:px-7"
          >
            Open an Account
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-3 sm:mt-16">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-10 bg-gold" : "w-4 bg-paper/35 hover:bg-paper/60"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute top-1/2 left-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-paper/25 bg-ink/40 text-paper backdrop-blur transition hover:bg-ink/70 md:flex"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute top-1/2 right-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-paper/25 bg-ink/40 text-paper backdrop-blur transition hover:bg-ink/70 md:flex"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
      >
        ›
      </button>
    </section>
  );
}
