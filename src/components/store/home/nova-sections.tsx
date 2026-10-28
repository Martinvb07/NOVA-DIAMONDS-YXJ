import Link from "next/link";
import { CreditCard, Fingerprint, Gem, Headphones, KeyRound, RotateCcw, ShieldCheck, Zap } from "lucide-react";

/** Encabezado de sección: número pequeño como etiqueta, título grande y subtítulo. */
export function SectionTitle({ index, title, sub }: { index: string; title: string; sub?: string }) {
  return (
    <div className="mb-5 sm:mb-6">
      <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-nova-300">
        <span className="rounded-full bg-nova-400/15 px-2 py-0.5 font-display tabular-nums tracking-normal ring-1 ring-nova-400/30">{index}</span>
        {sub}
      </p>
      <h2 className="mt-2 text-[22px] font-black uppercase leading-tight sm:text-[28px]">{title}</h2>
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
          <li key={title} className="surface group relative flex items-center gap-5 px-5 py-5 text-left md:flex-col md:gap-0 md:px-6 md:pb-7 md:pt-6 md:text-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
            <span className="relative grid size-[60px] shrink-0 place-items-center md:size-[72px]">
              <span aria-hidden className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-nova-400/30 to-plasma-400/25 ring-1 ring-nova-400/40 shadow-[0_0_30px_-6px_rgb(41_168_255/0.6)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-6 group-hover:scale-105" />
              <Icon className="relative size-7 text-nova-200 drop-shadow-[0_0_8px_rgb(41_168_255/0.9)]" strokeWidth={1.8} />
              <span className="btn-nova absolute -right-3 -top-2 !rounded-full px-2 py-0.5 font-display text-[11px] font-extrabold">0{i + 1}</span>
            </span>
            <div className="min-w-0"><p className="text-[17px] font-bold md:mt-5">{title}</p>
            <p className="mt-1 max-w-[260px] text-[14px] leading-relaxed text-fg-muted md:mx-auto md:mt-2">{text}</p></div>
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
            <li key={title} className="flex gap-3 rounded-[14px] border border-white/[0.06] bg-ink-950/50 p-4 transition-colors hover:border-nova-400/40">
              <span className="grid size-10 rounded-xl shrink-0 place-items-center bg-gradient-to-br from-nova-400/25 to-plasma-400/20 text-nova-200">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-[15px] font-bold">{title}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-fg-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
