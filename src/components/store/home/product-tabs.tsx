"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgePercent, Flame, Gem, Sparkles, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopCell, type ShopItem } from "./shop-cell";

const ICONS: Record<string, LucideIcon> = { nuevos: Sparkles, vendidos: Flame, ofertas: BadgePercent, recomendados: Star, diamantes: Gem, cuentas: Users };

export type ProductTab = { id: string; label: string; items: ShopItem[] };

/** Vitrina con pestañas a la izquierda (lista vertical en escritorio, fila deslizable en celular) y rejilla a la derecha. */
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const list = tabs.filter((t) => t.items.length);
  const [active, setActive] = useState(list[0]?.id);
  const current = list.find((t) => t.id === active) ?? list[0];
  if (!current) return null;

  return (
    <section aria-label="Vitrina de productos" className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
      <div role="tablist" aria-orientation="vertical" className="-mx-4 flex gap-2 self-start overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:rounded-[6px] lg:bg-ink-850 lg:px-0 lg:py-1 lg:ring-1 lg:ring-white/[0.07]">
        {list.map((t) => {
          const Icon = ICONS[t.id] ?? Gem;
          const on = t.id === current.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={cn(
                "flex h-10 shrink-0 items-center gap-3 rounded-full px-4 text-[12px] font-bold uppercase tracking-wider ring-1 transition-colors lg:h-14 lg:rounded-none lg:px-5 lg:ring-0 lg:[&:not(:last-child)]:border-b lg:border-white/[0.06]",
                on ? "bg-nova-400/12 text-nova-300 ring-nova-400/40 lg:bg-nova-400/[0.08] lg:shadow-[inset_3px_0_0_0_var(--color-nova-400)]" : "text-fg-subtle ring-white/[0.08] hover:text-fg",
              )}
            >
              <span className={cn("grid size-7 place-items-center rounded-full ring-1", on ? "text-nova-300 ring-nova-400/60 shadow-[0_0_12px_-2px_rgb(41_168_255/0.8)]" : "ring-white/15")}>
                <Icon className="size-3.5" />
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={current.label} className="grid grid-cols-2 self-start overflow-hidden rounded-[6px] bg-ink-900 ring-1 ring-white/[0.07] sm:grid-cols-3 xl:grid-cols-4">
        {current.items.slice(0, 8).map((it) => (
          <div key={it.key} className="animate-fade-in shadow-[inset_-1px_-1px_0_0_rgb(255_255_255/0.07)]">
            <ShopCell item={it} variant="card" />
          </div>
        ))}
      </div>
    </section>
  );
}
