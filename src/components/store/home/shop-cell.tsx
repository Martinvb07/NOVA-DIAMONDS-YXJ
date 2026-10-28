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

/** Tarjeta de producto del inicio: portada, nombre, lo que recibes y precio. Toda la tarjeta es el enlace. */
export function ShopCell({ item }: { item: ShopItem }) {
  const discounted = item.original != null && item.original > item.price;
  return (
    <Link href={item.href} aria-disabled={item.disabled || undefined} className={cn("card-product group flex h-full flex-col p-2", item.disabled && "opacity-60")}>
      <div className="overflow-hidden rounded-[10px]">
        <ItemCover cover={item.cover} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3">
        {item.badge && <p className="mb-1 text-[12px] font-semibold text-nova-300">{item.badge}</p>}
        <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-fg">{item.title}</p>
        <p className="mt-0.5 line-clamp-1 text-[12.5px] text-fg-subtle">{item.sub}</p>
        <p className="mt-auto flex items-baseline gap-2 pt-3 tabular-nums">
          <span className="text-[16px] font-bold text-fg">{formatMoney(item.price, item.currency)}</span>
          {discounted && <span className="text-[12px] text-fg-subtle line-through">{formatMoney(item.original!, item.currency)}</span>}
        </p>
        <span className="sr-only">{item.disabled ? "No disponible" : item.cta}</span>
      </div>
    </Link>
  );
}
