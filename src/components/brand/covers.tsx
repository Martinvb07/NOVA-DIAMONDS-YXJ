import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/money";

/**
 * Portadas de los paquetes de Nova Diamonds YXJ: el arte oficial del diamante (public/brand/diamante-nova.webp).
 * Los paquetes más grandes se ven más abiertos (aparecen más diamantes alrededor) y los dos mayores toman un tono
 * violeta. La cantidad y el bonus van en HTML encima para que siempre se lean nítidos.
 */

/** Nivel visual según la cantidad de diamantes (misma portada en toda la tienda). */
export function tierFor(diamonds: number): number {
  return [200, 450, 800, 1800, 4000].filter((t) => diamonds >= t).length + 1;
}

/** Acercamiento por nivel: los paquetes pequeños enfocan el diamante; los grandes muestran toda la escena. */
const ZOOM = [1.32, 1.24, 1.16, 1.1, 1.04, 1];

/** `plain`: solo la ilustración, sin cantidad ni bonus. */
export function DiamondCover({ tier, diamonds, bonus = 0, plain = false, className }: { tier: number; diamonds: number; bonus?: number; plain?: boolean; className?: string }) {
  const t = Math.max(1, Math.min(tier, 6));
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-[#02050f]", className)} style={{ containerType: "inline-size" }} aria-hidden>
      <Image
        src="/brand/diamante-nova.webp"
        alt=""
        fill
        sizes="(min-width: 1024px) 220px, 45vw"
        className="object-cover"
        style={{ transform: `scale(${ZOOM[t - 1]}) translate(4%, 6%)` }}
      />
      {t >= 5 && <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_55%_60%,rgba(139,108,255,0.32),transparent_70%)] mix-blend-screen" />}

      {!plain && (
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#01030a]/80 via-[#01030a]/40 to-transparent p-[7%] pb-[16%]">
          <p className="font-display font-bold leading-none tracking-tight text-white drop-shadow-[0_2px_10px_rgba(41,168,255,0.45)]" style={{ fontSize: "19cqw" }}>
            {formatNumber(diamonds)}
          </p>
          <p className="mt-[2%] font-semibold uppercase tracking-[0.14em] text-[#7fd4ff]" style={{ fontSize: "6.2cqw" }}>
            Diamantes
          </p>
          {bonus > 0 && (
            <span className="mt-[4%] inline-block rounded-[0.35em] bg-gradient-to-r from-[#29a8ff] to-[#7fd4ff] px-[0.45em] py-[0.15em] font-bold text-[#03101f] shadow-[0_0_14px_rgba(41,168,255,0.5)]" style={{ fontSize: "6.4cqw" }}>
              +{formatNumber(bonus)} BONUS
            </span>
          )}
        </div>
      )}
    </div>
  );
}
