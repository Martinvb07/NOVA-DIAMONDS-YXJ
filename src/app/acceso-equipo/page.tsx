import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Clock, MessagesSquare, Receipt, ShieldCheck, Warehouse } from "lucide-react";
import { Gem } from "@/components/brand/gem";
import { Logo } from "@/components/brand/logo";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import { hasGate } from "@/server/admin-gate";
import { StaffLogin } from "./staff-login";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acceso", robots: { index: false, follow: false }, referrer: "no-referrer" };

const FEATURES = [
  { icon: Receipt, title: "Pedidos y pagos", text: "Cada pedido con su estado real, desde el pago hasta la entrega." },
  { icon: MessagesSquare, title: "Chats de entrega", text: "Entrega las cuentas por un chat cifrado con el cliente." },
  { icon: Warehouse, title: "Proveedor y precios", text: "Saldo, regiones, costos y márgenes de cada paquete." },
] as const;

/** Inicio de sesión del equipo (contraseña + 2FA). Sin la cookie de la dirección secreta (ADMIN_PATH) responde 404. */
export default async function StaffAccess({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!(await hasGate())) notFound();
  const raw = safeNext((await searchParams).next, "/admin");
  const next = raw.startsWith("/admin") ? raw : "/admin";
  const user = await getCurrentUser();
  if (user && isStaff(user.role) && user.totpEnabledAt) redirect(next);

  return (
    <main id="contenido" className="min-h-dvh lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:overflow-hidden">
      {/* Formulario */}
      <section className="relative flex min-h-dvh flex-col px-5 py-5 sm:px-10 lg:h-dvh lg:py-4 lg:min-h-0 lg:px-14 xl:px-20">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(500px_220px_at_30%_0%,rgba(41,168,255,0.09),transparent)] lg:hidden" />
        <header className="relative flex items-center justify-between gap-3">
          <Logo name="NOVA DIAMONDS YXJ" />
          <span className="chamfer-sm bg-white/[0.05] px-2.5 py-1 font-brand text-[10px] font-bold uppercase tracking-[0.2em] text-fg-subtle">Panel</span>
        </header>

        <div className="relative mx-auto flex min-h-0 w-full max-w-[440px] flex-1 flex-col justify-center py-6 lg:overflow-y-auto lg:py-2">
          <StaffLogin next={next} />
        </div>

        <footer className="relative flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11.5px] text-fg-subtle">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Acceso restringido · cada ingreso queda registrado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" /> La sesión dura 12 horas
          </span>
        </footer>
      </section>

      {/* Marca (solo pantallas grandes) */}
      <aside aria-hidden className="relative hidden overflow-hidden border-l border-white/[0.06] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_80%_10%,rgba(41,168,255,0.18),transparent_60%),radial-gradient(700px_500px_at_10%_100%,rgba(139,108,255,0.22),transparent_60%),linear-gradient(160deg,#0b1020,#04060c)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_60%_40%,black,transparent)]" />
        <Gem hue="nova" className="absolute right-[14%] top-[13%] w-40 rotate-[14deg] drop-shadow-[0_30px_60px_rgba(41,168,255,0.25)] motion-safe:animate-float" />
        <Gem className="absolute right-[42%] top-[30%] w-16 -rotate-12 opacity-80 motion-safe:animate-float [animation-delay:-2s]" />
        <Gem className="absolute right-[8%] top-[44%] w-12 rotate-[28deg] opacity-60 motion-safe:animate-float [animation-delay:-4s]" />

        <div className="relative flex h-full flex-col justify-end p-10 xl:p-14">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-nova-300 ring-1 ring-white/10 backdrop-blur">
            <ShieldCheck className="size-3.5" /> Protegido con verificación en dos pasos
          </p>
          <h2 className="mt-5 max-w-[520px] text-[34px] font-black uppercase leading-[1.05] xl:text-[40px]">
            Toda la tienda,
            <br />
            <span className="text-nebula">en un solo lugar.</span>
          </h2>
          <ul className="mt-6 grid max-w-[560px] gap-2.5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="surface-flat flex items-start gap-3.5 p-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-nova-400/10 text-nova-300 ring-1 ring-nova-400/20">
                  <Icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold">{title}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-fg-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
