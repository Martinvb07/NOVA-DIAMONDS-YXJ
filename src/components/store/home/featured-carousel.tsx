"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ShopCell, type ShopItem } from "./shop-cell";

/** Bloque «Productos destacados»: encabezado con flechas y fila deslizable de tarjetas. */
export function FeaturedCarousel({ title, strong, items, href, cta = "Ver todos" }: { title: string; strong: string; items: ShopItem[]; href: string; cta?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => {
    const el = track.current;
    if (!el) return;
    const cell = el.querySelector<HTMLElement>("[data-cell]");
    el.scrollBy({ left: d * ((cell?.offsetWidth ?? 220) + 16), behavior: "smooth" });
  };
  if (!items.length) return null;

  return (
    <section className="relative" aria-label={`${strong} ${title}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-nova-300">Lo más pedido</p>
          <h2 className="mt-1.5 text-[22px] font-black uppercase leading-tight sm:text-[28px]">
            {strong} <span className="text-nebula">{title}</span>
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={href} className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-fg-muted ring-1 ring-white/10 transition hover:text-fg hover:ring-nova-400/50">
            {cta} <ArrowRight className="size-4" />
          </Link>
          {items.length > 2 &&
            [
              { d: -1, icon: ChevronLeft, label: "Anteriores" },
              { d: 1, icon: ChevronRight, label: "Siguientes" },
            ].map(({ d, icon: Icon, label }) => (
              <button
                key={d}
                type="button"
                onClick={() => scroll(d)}
                aria-label={label}
                className="hidden size-10 place-items-center rounded-full text-fg-muted ring-1 ring-white/10 transition hover:bg-nova-400 hover:text-nova-ink hover:ring-nova-400 md:grid"
              >
                <Icon className="size-4" />
              </button>
            ))}
        </div>
      </div>
      <div ref={track} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <div key={it.key} data-cell className="w-[calc(50%-8px)] shrink-0 snap-start sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)]">
            <ShopCell item={it} />
          </div>
        ))}
      </div>
    </section>
  );
}
