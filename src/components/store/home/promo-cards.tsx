import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PromoCard = { kicker: string; title: string; note: ReactNode; cta: string; href: string; art: ReactNode; highlight?: boolean };

/** Fila de tres tarjetas promocionales (la del centro resaltada con borde neón). */
export function PromoCards({ cards }: { cards: PromoCard[] }) {
  return (
    <section aria-label="Promociones" className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <Link
          key={c.title}
          href={c.href}
          className={cn(
            "group relative flex min-h-[150px] items-center gap-3 overflow-hidden rounded-[6px] bg-ink-850 p-5 transition-shadow",
            c.highlight ? "glow-nova" : "ring-1 ring-white/[0.07] hover:ring-nova-400/40",
          )}
        >
          <div className="relative z-10 min-w-0 flex-1">
            <p className="text-[15px] font-extrabold uppercase leading-tight tracking-wide text-fg">{c.kicker}</p>
            <p className="text-[15px] font-semibold leading-tight text-fg-muted">{c.title}</p>
            <p className="mt-2 text-[11.5px] text-fg-subtle">{c.note}</p>
            <span className="mt-3.5 inline-flex h-8 items-center rounded-[4px] bg-nova-400 px-4 text-[10.5px] font-extrabold uppercase tracking-wider text-nova-ink shadow-[0_0_16px_-4px_rgb(41_168_255/0.8)] transition group-hover:bg-nova-300">
              {c.cta}
            </span>
          </div>
          <div className="relative w-[42%] max-w-[150px] shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">{c.art}</div>
        </Link>
      ))}
    </section>
  );
}
