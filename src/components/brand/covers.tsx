import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/money";

/**
 * Portadas de los paquetes de Nova Diamonds YXJ: una escena por nivel (public/portadas/paquete-N.svg),
 * diamante → racimo → caldero → caja → cofre → lanzamiento aéreo, con el destello nova de fondo y el
 * isotipo YXJ en los contenedores. La cantidad y el bonus van en HTML encima para que siempre se lean nítidos;
 * el arte es un archivo, así se descarga una vez y queda en caché.
 */

/** Nivel visual según la cantidad de diamantes (misma portada en toda la tienda). */
export function tierFor(diamonds: number): number {
  return [200, 450, 800, 1800, 4000].filter((t) => diamonds >= t).length + 1;
}

/** `plain`: solo la ilustración, sin cantidad ni bonus. */
export function DiamondCover({ tier, diamonds, bonus = 0, plain = false, className }: { tier: number; diamonds: number; bonus?: number; plain?: boolean; className?: string }) {
  const t = Math.max(1, Math.min(tier, 6));
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-[#02040d]", className)} style={{ containerType: "inline-size" }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/portadas/paquete-${t}.svg`} alt="" decoding="async" draggable={false} className="absolute inset-0 size-full" />

      {/* Bonus: etiqueta azul neón con esquina cortada, arriba a la izquierda */}
      {!plain && bonus > 0 && (
        <span
          className="absolute left-[6%] top-[6%] bg-gradient-to-r from-[#7fe3ff] to-[#29a8ff] py-[0.3em] pl-[0.55em] pr-[0.9em] font-brand font-black leading-none text-[#03101f] shadow-[0_0_14px_rgba(41,168,255,0.55)]"
          style={{ fontSize: "5.8cqw", clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
        >
          +{formatNumber(bonus)} BONUS
        </span>
      )}

      {/* Cantidad abajo, sobre un degradado para que siempre se lea */}
      {!plain && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#01030a]/90 via-[#01030a]/50 to-transparent px-[7%] pb-[6%] pt-[16%]">
          <p className="font-brand font-black leading-none tracking-tight text-white drop-shadow-[0_0_12px_rgba(41,168,255,0.55)]" style={{ fontSize: "16cqw" }}>
            {formatNumber(diamonds)}
          </p>
          <p className="mt-[3%] flex items-center gap-[0.45em] font-bold uppercase tracking-[0.18em] text-[#7fd4ff]" style={{ fontSize: "5.4cqw" }}>
            <span className="inline-block h-[0.18em] w-[1.2em] bg-gradient-to-r from-[#29a8ff] to-[#8b6cff]" />
            Diamantes
          </p>
        </div>
      )}
    </div>
  );
}
