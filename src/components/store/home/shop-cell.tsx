import Image from "next/image";
import Link from "next/link";
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
    <p className="mt-1.5 flex items-baseline justify-center gap-2 tabular-nums">
      {item.original != null && item.original > item.price && <span className="text-[12px] text-fg-subtle line-through">{formatMoney(item.original, item.currency)}</span>}
      <span className="text-[14.5px] font-bold text-nova-300">{formatMoney(item.price, item.currency)}</span>
    </p>
  );
}

/**
 * Celda de vitrina estilo tienda clásica: portada centrada, nombre en mayúsculas, subtítulo y precio
 * tachado + precio. «card» se eleva al pasar el mouse y muestra el botón de compra.
 */
export function ShopCell({ item, variant = "plain" }: { item: ShopItem; variant?: "plain" | "card" }) {
  const card = variant === "card";
  return (
    <Link
      href={item.href}
      aria-disabled={item.disabled || undefined}
      className={cn(
        "group relative flex h-full flex-col items-center px-4 pb-5 pt-5 text-center transition-[background,box-shadow,transform] duration-300",
        card ? "hover:z-10 hover:-translate-y-1 hover:bg-ink-800/80 hover:shadow-[0_0_0_1px_rgb(41_168_255/0.55),0_24px_50px_-20px_rgb(0_0_0/0.9),0_0_30px_-8px_rgb(41_168_255/0.45)]" : "hover:bg-white/[0.02]",
        item.disabled && "opacity-60",
      )}
    >
      {item.badge && (
        <span className="btn-nova chamfer-sm absolute left-3 top-3 z-10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide">{item.badge}</span>
      )}
      <div className="chamfer w-full max-w-[150px] overflow-hidden">
        <ItemCover cover={item.cover} className="transition-transform duration-500 group-hover:scale-[1.06]" />
      </div>
      <p className="mt-4 line-clamp-2 text-[12.5px] font-bold uppercase leading-snug tracking-wide text-fg group-hover:text-nova-200">{item.title}</p>
      <p className="mt-1 line-clamp-1 text-[10.5px] font-medium uppercase tracking-wider text-fg-subtle">{item.sub}</p>
      <Prices item={item} />
      {card && (
        <span className="btn-nova chamfer-sm mt-3 inline-flex h-8 items-center px-4 text-[10.5px] font-bold uppercase tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:opacity-100">
          {item.disabled ? "No disponible" : item.cta}
        </span>
      )}
    </Link>
  );
}
