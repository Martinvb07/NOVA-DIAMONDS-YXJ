import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Headphones, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";

/** Encabezado de sección: título, descripción opcional y un enlace a la derecha. */
export function SectionTitle({ title, sub, href, cta }: { title: string; sub?: ReactNode; href?: string; cta?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 className="text-[24px] font-bold leading-tight sm:text-[28px]">{title}</h2>
        {sub && <p className="mt-1.5 text-[15px] text-fg-muted">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-nova-300 hover:text-nova-200">
          {cta ?? "Ver todo"} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

const STEPS = [
  { title: "Escribe tu ID", text: "Verificamos tu cuenta de Free Fire y su región antes de que pagues." },
  { title: "Paga en pesos", text: "PSE, Nequi, Bancolombia o tarjeta. El pago lo confirma la pasarela." },
  { title: "Recibe tus diamantes", text: "Llegan directo a tu cuenta y sigues cada paso del pedido en vivo." },
];

/** Cómo funciona: tres pasos en columnas. */
export function HowItWorks() {
  return (
    <section aria-labelledby="como-funciona">
      <SectionTitle title="Cómo funciona" sub="Sin contraseñas: solo necesitamos tu ID de jugador." />
      <ol id="como-funciona" className="grid gap-6 border-t border-white/[0.08] pt-6 md:grid-cols-3 md:gap-10">
        {STEPS.map(({ title, text }, i) => (
          <li key={title}>
            <span className="grid size-8 place-items-center rounded-full bg-white/[0.07] text-[14px] font-semibold tabular-nums text-fg">{i + 1}</span>
            <p className="mt-4 text-[17px] font-semibold">{title}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const PROMISES = [
  { icon: ShieldCheck, title: "Pago verificado", text: "Solo marcamos el pedido como pagado cuando la pasarela lo confirma." },
  { icon: RotateCcw, title: "Reembolso si falla", text: "Si la entrega no se completa, te devolvemos el dinero." },
  { icon: KeyRound, title: "Sin contraseñas", text: "Nunca te pedimos la clave de tu cuenta ni de Facebook." },
  { icon: Headphones, title: "Soporte por personas", text: "Te atendemos por WhatsApp y correo." },
];

/** Garantías de la tienda. */
export function Guarantee() {
  return (
    <section aria-labelledby="garantia" className="surface p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 id="garantia" className="text-[24px] font-bold leading-tight sm:text-[28px]">Compra con tranquilidad</h2>
          <p className="mt-2 text-[15px] text-fg-muted">Si la entrega falla, te devolvemos tu dinero.</p>
        </div>
        <Link href="/legal/reembolsos" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-nova-300 hover:text-nova-200">
          Política de reembolsos <ArrowRight className="size-4" />
        </Link>
      </div>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon className="size-5 text-nova-300" />
            <p className="mt-3 text-[15px] font-semibold">{title}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-fg-muted">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
