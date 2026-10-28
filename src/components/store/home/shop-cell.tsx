import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AccountPlaceholder } from "@/components/brand/illustrations";
import { DiamondCover } from "@/components/brand/covers";
import { RankEmblem } from "@/components/brand/rank-emblem";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Producto listo para las vitrinas del inicio (paquete de diamantes o cuenta). Solo datos serializables. */
export type ShopItem = {
  key: string;
  href: string;
  title: string;
  sub: string;
  price: number;
  original: number | null;
  currency: string;
  badge: string | null;
  disabled: boolean;
  cta: string;
  cover: { kind: "diamond"; tier: number; diamonds: number; bonus: number } | { kind: "account"; url: string | null; alt: string; rank: string | null };
};

export function ItemCover({ cover, className }: { cover: ShopItem["cover"]; className?: string }) {
  if (cover.kind === "diamond") return <DiamondCover tier={cover.tier} diamonds={cover.diamonds} bonus={cover.bonus} className={className} />;
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-ink-750", className)}>
      {cover.url ? (
        <Image src={cover.url} alt={cover.alt} fill sizes="200px" unoptimized={cover.url.endsWith(".svg")} className="object-cover object-top" />
      ) : (
        <AccountPlaceholder />
      )}
      {cover.rank && <RankEmblem rank={cover.rank} className="absolute bottom-1.5 left-1.5 size-7 drop-shadow" />}
    </div>
  );
}

function Prices({ item }: { item: ShopItem }) {
  return (
    <p className="flex min-w-0 flex-col tabular-nums leading-tight">
      {item.original != null && item.original > item.price && <span className="text-[12px] text-fg-subtle line-through">{formatMoney(item.original, item.currency)}</span>}
      <span className="text-[17px] font-extrabold text-fg sm:text-[18px]">{formatMoney(item.price, item.currency)}</span>
    </p>
  );
}

/**
 * Tarjeta de producto de las vitrinas del inicio: portada grande con esquinas suaves, nombre legible,
 * subtítulo, precio destacado y botón de compra siempre visible.
 */
export function ShopCell({ item }: { item: ShopItem; variant?: "plain" | "card" }) {
  return (
    <Link
      href={item.href}
      aria-disabled={item.disabled || undefined}
      className={cn("card-product group relative flex h-full flex-col p-2.5 sm:p-3", item.disabled && "opacity-60")}
    >
      {item.badge && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-nova-400 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-nova-ink shadow-[0_4px_14px_-4px_rgb(41_168_255/0.9)] sm:right-5 sm:top-5">{item.badge}</span>
      )}
      <div className="overflow-hidden rounded-[12px]">
        <ItemCover cover={item.cover} className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]" />
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <p className="line-clamp-2 text-[14px] font-bold leading-snug text-fg sm:text-[15px]">{item.title}</p>
        <p className="mt-0.5 line-clamp-1 text-[12px] text-fg-subtle sm:text-[12.5px]">{item.sub}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Prices item={item} />
          <span
            aria-hidden
            className="btn-nova grid size-9 shrink-0 place-items-center !rounded-full transition-transform group-hover:scale-110 sm:size-10"
          >
            <ArrowRight className="size-4" strokeWidth={2.4} />
          </span>
        </div>
        <span className="sr-only">{item.disabled ? "No disponible" : item.cta}</span>
      </div>
    </Link>
  );
}
