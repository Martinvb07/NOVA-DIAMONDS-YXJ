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
            "surface group relative flex min-h-[120px] items-center gap-4 overflow-hidden p-4 sm:min-h-[150px] sm:p-5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
            c.highlight && "ring-1 ring-nova-400/40",
          )}
        >
          <div className="relative z-10 min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-nova-300">{c.kicker}</p>
            <p className="mt-1 text-[19px] font-extrabold leading-tight text-fg">{c.title}</p>
            <p className="mt-1.5 text-[13px] text-fg-muted">{c.note}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-nova-300 transition-colors group-hover:text-nova-200">
              {c.cta} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
          <div className="relative w-[30%] max-w-[110px] shrink-0 sm:w-[38%] sm:max-w-[140px] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">{c.art}</div>
        </Link>
      ))}
    </section>
  );
}
