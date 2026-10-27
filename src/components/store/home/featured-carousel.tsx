"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ShopCell, type ShopItem } from "./shop-cell";

/** Bloque «Productos destacados»: caja con borde, celdas separadas por líneas y flechas a los lados. */
export function FeaturedCarousel({ title, strong, items, href, cta = "Ver todos" }: { title: string; strong: string; items: ShopItem[]; href: string; cta?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => {
    const el = track.current;
    if (!el) return;
    const cell = el.querySelector<HTMLElement>("[data-cell]");
    el.scrollBy({ left: d * (cell?.offsetWidth ?? 220), behavior: "smooth" });
  };
  if (!items.length) return null;

  return (
    <section className="relative" aria-label={`${strong} ${title}`}>
      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] bg-gradient-to-r from-nova-400/[0.07] via-transparent to-plasma-400/[0.06] px-5 py-3.5">
          <h2 className="flex items-center gap-3 text-[13px] uppercase tracking-[0.12em] text-fg-muted">
            <span className="font-display text-[12px] font-extrabold text-nova-300">01</span>
            <span className="h-4 w-px bg-nova-400/50" aria-hidden />
            <span><span className="font-black text-fg">{strong}</span> {title}</span>
          </h2>
          <Link href={href} className="inline-flex items-center gap-1.5 text-[11.5px] text-fg-subtle transition-colors hover:text-nova-300">
            {cta} <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => (
            <div key={it.key} data-cell className="w-1/2 shrink-0 snap-start border-r border-white/[0.07] last:border-r-0 sm:w-1/3 lg:w-1/4">
              <ShopCell item={it} />
            </div>
          ))}
        </div>
      </div>
      {items.length > 2 &&
        [
          { d: -1, icon: ChevronLeft, side: "-left-4", label: "Anteriores" },
          { d: 1, icon: ChevronRight, side: "-right-4", label: "Siguientes" },
        ].map(({ d, icon: Icon, side, label }) => (
          <button
            key={d}
            type="button"
            onClick={() => scroll(d)}
            aria-label={label}
            className={`absolute top-1/2 hidden size-8 place-items-center chamfer-sm bg-ink-900 text-fg-subtle ring-1 ring-white/15 transition hover:bg-nova-400 hover:text-nova-ink md:grid ${side}`}
          >
            <Icon className="size-4" />
          </button>
        ))}
    </section>
  );
}
