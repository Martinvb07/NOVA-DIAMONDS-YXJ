import Link from "next/link";
import { CreditCard, Fingerprint, Gem, Headphones, KeyRound, RotateCcw, ShieldCheck, Zap } from "lucide-react";

/** Encabezado de sección numerado con línea neón (estilo HUD). */
export function SectionTitle({ index, title, sub }: { index: string; title: string; sub?: string }) {
  return (
    <div className="mb-6 flex items-end gap-4">
      <span className="font-display text-[38px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_rgb(41_168_255/0.6)] sm:text-[44px]">{index}</span>
      <div className="min-w-0 flex-1 pb-1">
        <h2 className="text-[18px] font-black uppercase leading-tight sm:text-[22px]">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-fg-subtle">{sub}</p>}
        <span aria-hidden className="mt-3 block h-px bg-gradient-to-r from-nova-400/70 via-plasma-400/40 to-transparent" />
      </div>
    </div>
  );
}

const STEPS = [
  { icon: Fingerprint, title: "Pon tu ID", text: "Verificamos tu cuenta de Free Fire y su región antes de que pagues." },
  { icon: CreditCard, title: "Paga en pesos", text: "PSE, Nequi, Bancolombia o tarjeta. El pago se confirma con la pasarela." },
  { icon: Gem, title: "Recibe al instante", text: "Los diamantes llegan directo a tu cuenta y sigues el pedido en vivo." },
];

/** Cómo funciona: tres pasos conectados por una línea de energía. */
export function HowItWorks() {
  return (
    <section aria-label="Cómo funciona">
      <SectionTitle index="02" title="Recarga en 3 pasos" sub="Sin contraseñas · directo a tu ID" />
      <ol className="relative grid gap-4 md:grid-cols-3">
        <span aria-hidden className="pointer-events-none absolute left-[16%] right-[16%] top-[42px] hidden h-px bg-[linear-gradient(90deg,transparent,rgb(41_168_255/0.7),rgb(139_108_255/0.7),transparent)] md:block" />
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="surface group relative flex flex-col items-center px-6 pb-7 pt-6 text-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
            <span className="relative grid size-[72px] place-items-center">
              <span aria-hidden className="absolute inset-0 rotate-45 border border-nova-400/50 bg-ink-950 shadow-[0_0_26px_-4px_rgb(41_168_255/0.7)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[135deg]" />
              <Icon className="relative size-7 text-nova-200 drop-shadow-[0_0_8px_rgb(41_168_255/0.9)]" strokeWidth={1.8} />
              <span className="btn-nova chamfer-sm absolute -right-3 -top-2 px-1.5 font-display text-[10.5px] font-extrabold">0{i + 1}</span>
            </span>
            <p className="mt-6 font-brand text-[14px] font-bold uppercase tracking-[0.08em]">{title}</p>
            <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-fg-muted">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const PROMISES = [
  { icon: ShieldCheck, title: "Pago verificado", text: "Solo marcamos pagado cuando la pasarela lo confirma." },
  { icon: RotateCcw, title: "Reembolso si falla", text: "Si la entrega no se completa, te devolvemos tu dinero." },
  { icon: KeyRound, title: "Sin contraseñas", text: "Nunca te pedimos la clave de tu cuenta ni de Facebook." },
  { icon: Headphones, title: "Soporte real", text: "Personas de verdad por WhatsApp y correo." },
];

/** Garantía: banda con brillo y las cuatro promesas de la tienda. */
export function Guarantee() {
  return (
    <section aria-labelledby="garantia" className="surface relative overflow-hidden p-6 sm:p-9">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(139_108_255/0.35),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-[radial-gradient(closest-side,rgb(41_168_255/0.25),transparent)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 font-brand text-[11px] font-bold uppercase tracking-[0.3em] text-nova-300">
            <Zap className="size-3.5" /> Garantía Nova
          </p>
          <h2 id="garantia" className="mt-3 text-[26px] font-black uppercase leading-[1.05] sm:text-[34px]">
            Si la entrega falla, <span className="text-nebula">te devolvemos tu dinero</span>
          </h2>
          <Link href="/legal/reembolsos" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-nova-300 underline decoration-nova-400/40 underline-offset-4 hover:text-nova-200">
            Ver política de reembolsos
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3 rounded-[var(--radius-card)] border border-white/[0.06] bg-ink-950/50 p-4 transition-colors hover:border-nova-400/40">
              <span className="chamfer-sm grid size-10 shrink-0 place-items-center bg-gradient-to-br from-nova-400/25 to-plasma-400/20 text-nova-200">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-[14px] font-bold">{title}</span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-fg-subtle">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
