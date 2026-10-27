"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiamondCover } from "@/components/brand/covers";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  key: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  price: number;
  original: number | null;
  currency: string;
  tier: number;
  diamonds: number;
  bonus: number;
};

/**
 * Carrusel principal cuando el panel no tiene banners: paquetes reales con titular grande, botón,
 * portada a la derecha y burbuja de precio (precio anterior tachado encima).
 */
export function ShowcaseHero({ slides }: { slides: HeroSlide[] }) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setI((c) => (c + d + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(1), 6000);
    return () => clearTimeout(t);
  }, [i, paused, n, go]);

  if (!n) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="group relative overflow-hidden rounded-[6px] bg-ink-950 ring-1 ring-white/[0.08]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_380px_at_78%_55%,rgb(41_168_255/0.22),transparent_70%),radial-gradient(500px_300px_at_0%_0%,rgb(13_95_209/0.18),transparent_70%)]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative flex transition-transform duration-700 ease-[cubic-bezier(0.3,0.7,0.2,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, idx) => {
          const off = idx !== i;
          return (
            <div key={s.key} aria-hidden={off} className="grid w-full shrink-0 items-center gap-6 px-6 py-8 sm:grid-cols-[1.15fr_1fr] sm:px-14 sm:py-12 lg:min-h-[340px] lg:px-20">
              <div className="order-2 sm:order-1">
                <p className="text-[15px] font-extrabold uppercase tracking-[0.12em] text-fg sm:text-[20px]">{s.kicker}</p>
                <h2 className="text-chrome mt-1 text-[40px] font-black uppercase leading-[0.95] tracking-tight sm:text-[58px] lg:text-[68px]">{s.title}</h2>
                <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-fg-muted">{s.text}</p>
                <Link
                  href={s.href}
                  tabIndex={off ? -1 : 0}
                  className="mt-6 inline-flex h-11 items-center rounded-[4px] bg-nova-400 px-7 text-[13px] font-extrabold uppercase tracking-wider text-nova-ink shadow-[0_0_26px_-4px_rgb(41_168_255/0.85)] transition hover:bg-nova-300"
                >
                  {s.cta}
                </Link>
              </div>
              <div className="relative order-1 mx-auto w-full max-w-[230px] sm:order-2 sm:max-w-[300px]">
                <div className="overflow-hidden rounded-[18px] shadow-[0_0_60px_-10px_rgb(41_168_255/0.6)] ring-1 ring-nova-400/30 animate-float">
                  <DiamondCover tier={s.tier} diamonds={s.diamonds} bonus={s.bonus} />
                </div>
                <div className="absolute -bottom-3 -left-5 grid size-[92px] place-items-center rounded-full bg-ink-900/90 text-center ring-2 ring-nova-400/70 backdrop-blur shadow-[0_0_30px_-6px_rgb(41_168_255/0.8)] sm:size-[104px]">
                  <span className="leading-tight">
                    {s.original != null && s.original > s.price && <span className="block text-[11px] text-fg-subtle line-through">{formatMoney(s.original, s.currency)}</span>}
                    <span className="block px-1 text-[15px] font-extrabold tabular-nums text-nova-300 sm:text-[17px]">{formatMoney(s.price, s.currency)}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <>
          {[
            { d: -1, icon: ChevronLeft, side: "left-3 sm:left-4", label: "Anterior" },
            { d: 1, icon: ChevronRight, side: "right-3 sm:right-4", label: "Siguiente" },
          ].map(({ d, icon: Icon, side, label }) => (
            <button
              key={d}
              type="button"
              onClick={() => go(d)}
              aria-label={label}
              className={cn("absolute top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full text-fg-muted ring-1 ring-white/25 transition hover:text-nova-300 hover:ring-nova-400/70 sm:grid", side)}
            >
              <Icon className="size-4" />
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Ir al destacado ${idx + 1}`}
                aria-current={idx === i}
                className={cn("h-[3px] w-10 rounded-full transition-colors duration-300", idx === i ? "bg-nova-400 shadow-[0_0_10px_rgb(41_168_255/0.9)]" : "bg-white/20 hover:bg-white/40")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
