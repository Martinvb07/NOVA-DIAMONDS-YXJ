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
            "surface group relative flex min-h-[150px] items-center gap-3 overflow-hidden p-5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
            c.highlight && "glow-nova",
          )}
        >
          <div className="relative z-10 min-w-0 flex-1">
            <p className="font-brand text-[14px] font-bold uppercase leading-tight tracking-[0.06em] text-fg">{c.kicker}</p>
            <p className="text-nebula mt-0.5 text-[15px] font-semibold leading-tight">{c.title}</p>
            <p className="mt-2 text-[11.5px] text-fg-subtle">{c.note}</p>
            <span className="btn-nova chamfer-sm mt-3.5 inline-flex h-8 items-center px-4 text-[10.5px] font-extrabold uppercase tracking-wider">
              {c.cta}
            </span>
          </div>
          <div className="relative w-[42%] max-w-[150px] shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">{c.art}</div>
        </Link>
      ))}
    </section>
  );
}
