import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/money";

/**
 * Portadas originales de los paquetes de Nova Diamonds, estilo cósmico en azul: cada paquete tiene su
 * propia escena (órbita → constelación → asteroide → portal → planeta con anillos → supernova).
 * Arte vectorial propio; la cantidad y el bonus van en HTML encima para que siempre se lean nítidos.
 */

/** Nivel visual según la cantidad de diamantes (misma portada en toda la tienda). */
export function tierFor(diamonds: number): number {
  return [200, 450, 800, 1800, 4000].filter((t) => diamonds >= t).length + 1;
}

/** Gema: x, y (esquina superior izquierda), ancho; `p` = gema de plasma (morada). */
type G = [x: number, y: number, w: number, p?: boolean];

/** Estrellas del fondo, fijas (iguales en servidor y navegador). */
const STARS: Array<[number, number, number]> = Array.from({ length: 26 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return [Math.round(Math.abs(a % 1) * 2000) / 10, Math.round(Math.abs(b % 1) * 2000) / 10, 0.4 + (i % 4) * 0.25];
});

/** Resplandor principal de cada paquete. */
const NEBULA = ["#29a8ff", "#3fb4ff", "#1484f0", "#4f9dff", "#29a8ff", "#8b6cff"];

function Scene({ t, id, u }: { t: number; id: string; u: (n: string) => string }): ReactNode {
  const gem = (g: G, k: number) => <use key={k} href={`#${id}${g[3] ? "gemP" : "gem"}`} x={g[0]} y={g[1]} width={g[2]} height={g[2] * (106 / 120)} />;
  switch (t) {
    // 1 · Una gema en órbita
    case 1:
      return (
        <>
          <ellipse cx="128" cy="132" rx="58" ry="17" fill="none" stroke="#7fd4ff" strokeOpacity="0.35" strokeWidth="1.6" transform="rotate(-14 128 132)" />
          {gem([94, 92, 70], 0)}
          <path d="M70 132 A58 17 0 0 0 186 132" fill="none" stroke="#7fd4ff" strokeOpacity="0.9" strokeWidth="2" transform="rotate(-14 128 132)" />
          <circle cx="76" cy="146" r="10" fill="#29a8ff" opacity="0.25" />
          <circle cx="76" cy="146" r="5" fill="#c7ecff" />
        </>
      );
    // 2 · Constelación de tres gemas
    case 2:
      return (
        <>
          <path d="M98 118 L136 98 L168 140 Z M76 92 L98 118 M168 140 L182 104" fill="none" stroke="#7fd4ff" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="3 4" />
          {[[98, 118], [136, 98], [168, 140], [76, 92], [182, 104]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i < 3 ? 2.6 : 1.6} fill="#c7ecff" />
          ))}
          {([[74, 112, 46], [148, 120, 44], [104, 74, 64]] as G[]).map(gem)}
        </>
      );
    // 3 · Gemas sobre un asteroide flotante
    case 3:
      return (
        <>
          <path d="M66 150 C70 132 96 124 128 126 C164 128 188 136 186 152 C182 172 150 180 122 178 C92 176 62 168 66 150Z" fill={u("rock")} stroke="#020a1c" strokeWidth="2.5" />
          <path d="M72 146 C90 134 150 130 182 144" fill="none" stroke="#29a8ff" strokeOpacity="0.8" strokeWidth="2.4" />
          {[[96, 160], [150, 166], [126, 172]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3 + (i % 2)} fill="#0a1a38" />
          ))}
          {([[74, 102, 42], [146, 100, 42], [100, 76, 62]] as G[]).map(gem)}
          <path d="M120 186 l-6 12 M134 184 l-3 10" stroke="#29a8ff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    // 4 · Gemas saliendo de un portal
    case 4:
      return (
        <>
          <path d="M80 160 L96 92 M176 160 L160 92 M128 160 V70" stroke="#29a8ff" strokeOpacity="0.18" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="128" cy="160" rx="62" ry="16" fill={u("portal")} />
          <ellipse cx="128" cy="160" rx="62" ry="16" fill="none" stroke="#7fd4ff" strokeWidth="3" />
          <ellipse cx="128" cy="160" rx="50" ry="11" fill="none" stroke="#29a8ff" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="5 4" />
          {([[78, 112, 40], [150, 108, 42], [104, 80, 58], [126, 126, 34]] as G[]).map(gem)}
        </>
      );
    // 5 · Planeta con anillos y gemas en órbita
    case 5:
      return (
        <>
          <ellipse cx="130" cy="126" rx="76" ry="18" fill="none" stroke="#7fd4ff" strokeOpacity="0.35" strokeWidth="6" transform="rotate(-12 130 126)" />
          <circle cx="130" cy="122" r="44" fill={u("planet")} stroke="#020a1c" strokeWidth="2.5" />
          <path d="M96 106 C112 98 150 98 168 112 M92 128 C116 120 146 122 172 134" fill="none" stroke="#c7ecff" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
          <path d="M54 126 A76 18 0 0 0 206 126" fill="none" stroke="#7fd4ff" strokeWidth="6" strokeOpacity="0.9" transform="rotate(-12 130 126)" />
          {([[56, 118, 40], [166, 92, 34], [108, 138, 52]] as G[]).map(gem)}
        </>
      );
    // 6 · Supernova
    default:
      return (
        <>
          <g transform="translate(128 118)">
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M0 -${i % 2 ? 58 : 84} L5 -20 L-5 -20Z`} fill={i % 2 ? "#8b6cff" : "#7fd4ff"} opacity={i % 2 ? 0.45 : 0.6} transform={`rotate(${i * 22.5})`} />
            ))}
          </g>
          <circle cx="128" cy="118" r="34" fill="#c7ecff" opacity="0.18" />
          <circle cx="128" cy="118" r="20" fill="#fff" opacity="0.25" />
          {([[64, 132, 38, true], [168, 128, 36, true], [86, 150, 34], [146, 152, 34], [96, 82, 64]] as G[]).map(gem)}
        </>
      );
  }
}

type GemColors = { a: string; b: string; c: string; d: string; e: string; line: string };

/** Gema facetada (talla brillante) con los colores dados. */
function GemSymbol({ id, c }: { id: string; c: GemColors }) {
  return (
    <symbol id={id} viewBox="0 0 120 106">
      <path d="M30 6H90L116 36H4Z" fill={c.a} />
      <path d="M30 6L50 22L4 36Z" fill={c.b} />
      <path d="M90 6L70 22L116 36Z" fill={c.d} />
      <path d="M4 36L50 22L60 36Z" fill={c.a} />
      <path d="M116 36L70 22L60 36Z" fill={c.c} />
      <path d="M42 6H78L70 22H50Z" fill="#fff" fillOpacity="0.7" />
      <path d="M50 22H70L60 36Z" fill="#fff" fillOpacity="0.45" />
      <path d="M4 36H44L60 102Z" fill={c.c} />
      <path d="M44 36H76L60 102Z" fill={c.b} />
      <path d="M76 36H116L60 102Z" fill={c.e} />
      <path d="M44 36L60 102M76 36L60 102" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
      <path d="M4 36H116" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.4" />
      <path d="M36 11H50L45 17H31Z" fill="#fff" />
      <path d="M30 6H90L116 36L60 102L4 36Z" fill="none" stroke={c.line} strokeWidth="3.2" strokeLinejoin="round" />
    </symbol>
  );
}

/** `plain`: solo la ilustración, sin cantidad ni bonus. */
export function DiamondCover({ tier, diamonds, bonus = 0, plain = false, className }: { tier: number; diamonds: number; bonus?: number; plain?: boolean; className?: string }) {
  const t = Math.max(1, Math.min(tier, 6));
  const id = useId().replace(/:/g, "");
  const u = (name: string) => `url(#${id}${name})`;
  const nebula = NEBULA[t - 1];

  return (
    <div className={cn("relative aspect-square overflow-hidden bg-[#030a1d]", className)} style={{ containerType: "inline-size" }} aria-hidden>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#0a1f4d" />
            <stop offset="1" stopColor="#020713" />
          </linearGradient>
          <radialGradient id={`${id}neb`} cx="0.66" cy="0.62" r="0.55">
            <stop offset="0" stopColor={nebula} stopOpacity="0.55" />
            <stop offset="0.55" stopColor={t === 6 ? "#29a8ff" : "#0d5fd1"} stopOpacity="0.18" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}neb2`} cx="0.15" cy="0.2" r="0.45">
            <stop offset="0" stopColor="#8b6cff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#8b6cff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}rock`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2f5aa8" />
            <stop offset="1" stopColor="#0f2350" />
          </linearGradient>
          <radialGradient id={`${id}portal`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#c7ecff" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#29a8ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#0d5fd1" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id={`${id}planet`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#7fd4ff" />
            <stop offset="0.45" stopColor="#1484f0" />
            <stop offset="1" stopColor="#06245e" />
          </radialGradient>
          <GemSymbol id={`${id}gem`} c={{ a: "#dff4ff", b: "#9edcff", c: "#3fb0ff", d: "#1d7ae6", e: "#0b4fb8", line: "#031a3d" }} />
          <GemSymbol id={`${id}gemP`} c={{ a: "#efe8ff", b: "#c4b2ff", c: "#9a7dff", d: "#7357f0", e: "#4a2fb8", line: "#1a0d45" }} />
          <path id={`${id}spark`} d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2Z" fill="#fff" />
        </defs>

        <rect width="200" height="200" fill={u("bg")} />
        <rect width="200" height="200" fill={u("neb2")} />
        <rect width="200" height="200" fill={u("neb")} />
        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.35 + (i % 3) * 0.2} />
        ))}

        {/* Un poco más abajo para dejar aire a la cantidad y al bonus de arriba */}
        <g transform="translate(4 12)">
          <Scene t={t} id={id} u={u} />
        </g>

        {[[182, 76, 1], [64, 74, 0.6], [188, 178, 0.7]].map(([x, y, k], i) => (
          <use key={i} href={`#${id}spark`} transform={`translate(${x} ${y}) scale(${k})`} />
        ))}
      </svg>

      {!plain && (
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#020713]/70 to-transparent p-[7%] pb-[14%]">
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
