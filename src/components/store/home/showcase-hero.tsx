import Link from "next/link";
import { Check } from "lucide-react";
import { DiamondCover } from "@/components/brand/covers";
import { formatMoney } from "@/lib/money";

export type HeroPackage = { href: string; price: number; currency: string; tier: number; diamonds: number; bonus: number };

const POINTS = ["Entrega automática a tu ID", "PSE, Nequi, Bancolombia o tarjeta", "Reembolso si la entrega falla"];

/** Portada del inicio: propuesta clara, dos acciones y el paquete recomendado a la derecha (solo escritorio). */
export function ShowcaseHero({ pkg, from }: { pkg: HeroPackage; from: { price: number; currency: string } }) {
  return (
    <section aria-label="Portada" className="grid items-center gap-10 py-6 sm:py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-14">
      <div>
        <p className="text-[14px] font-medium text-nova-300">Recargas de Free Fire en Colombia</p>
        <h1 className="mt-3 text-[34px] font-bold leading-[1.08] sm:text-[46px] lg:text-[54px]">Diamantes directo a tu ID, en minutos.</h1>
        <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-fg-muted sm:text-[17px]">
          Escribe tu ID de jugador, elige el paquete y paga en pesos. Verificamos tu cuenta antes del pago y puedes seguir el pedido en vivo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/recargas" className="btn-nova inline-flex h-12 items-center px-6 text-[15px] font-semibold">
            Recargar desde {formatMoney(from.price, from.currency)}
          </Link>
          <Link href="/pedido" className="inline-flex h-12 items-center rounded-[10px] border border-white/12 px-6 text-[15px] font-semibold text-fg transition-colors hover:bg-white/[0.05]">
            Rastrear pedido
          </Link>
        </div>
        <ul className="mt-8 grid gap-2.5 text-[14px] text-fg-muted sm:flex sm:flex-wrap sm:gap-x-6">
          {POINTS.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <Check className="size-4 text-ok-400" strokeWidth={2.5} /> {p}
            </li>
          ))}
        </ul>
      </div>

      <Link href={pkg.href} className="group relative ml-auto hidden w-full max-w-[360px] lg:block">
        <div className="overflow-hidden rounded-[18px] border border-white/10">
          <DiamondCover tier={pkg.tier} diamonds={pkg.diamonds} bonus={pkg.bonus} className="transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
        <div className="absolute -bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/95 px-4 py-3 backdrop-blur">
          <span className="text-[13px] text-fg-muted">Recomendado</span>
          <span className="text-[17px] font-bold tabular-nums">{formatMoney(pkg.price, pkg.currency)}</span>
        </div>
      </Link>
    </section>
  );
}
