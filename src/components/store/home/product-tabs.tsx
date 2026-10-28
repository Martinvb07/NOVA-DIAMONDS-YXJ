"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgePercent, Flame, Gem, Sparkles, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopCell, type ShopItem } from "./shop-cell";

const ICONS: Record<string, LucideIcon> = { nuevos: Sparkles, vendidos: Flame, ofertas: BadgePercent, recomendados: Star, diamantes: Gem, cuentas: Users };

export type ProductTab = { id: string; label: string; items: ShopItem[] };

/** Vitrina con pestañas en píldoras arriba (deslizables en celular) y rejilla de tarjetas debajo. */
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const list = tabs.filter((t) => t.items.length);
  const [active, setActive] = useState(list[0]?.id);
  const current = list.find((t) => t.id === active) ?? list[0];
  if (!current) return null;

  return (
    <div className="space-y-5">
      <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
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
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors",
                on ? "bg-nova-400 text-nova-ink shadow-[0_8px_24px_-10px_rgb(41_168_255/0.9)]" : "bg-white/[0.04] text-fg-muted ring-1 ring-white/[0.08] hover:bg-white/[0.08] hover:text-fg",
              )}
            >
              <Icon className="size-4" />
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", on ? "bg-nova-ink/15" : "bg-white/[0.06] text-fg-subtle")}>{Math.min(t.items.length, 8)}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={current.label} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {current.items.slice(0, 8).map((it) => (
          <div key={it.key} className="animate-fade-in">
            <ShopCell item={it} />
          </div>
        ))}
      </div>
    </div>
  );
}
