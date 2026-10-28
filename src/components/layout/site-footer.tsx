import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PaymentBadges } from "@/components/brand/payment-badges";
import { Container } from "@/components/ui/primitives";
import { parsePaymentMethods } from "@/domain/payment-methods";
import { whatsappLink } from "@/lib/utils";
import type { PublicPaymentOption } from "@/server/integrations/payments";
import type { StoreSettings } from "@/server/settings";
import { BoldLogo } from "@/components/brand/bold-logo";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Tienda",
    links: [
      { href: "/recargas", label: "Diamantes Free Fire" },
      { href: "/cuentas", label: "Cuentas Free Fire" },
      { href: "/buscar", label: "Buscar" },
      { href: "/carrito", label: "Carrito" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { href: "/pedido", label: "Rastrear pedido" },
      { href: "/ayuda", label: "Centro de ayuda" },
      { href: "/medios-de-pago", label: "Medios de pago" },
      { href: "/ayuda#contacto", label: "Contactar soporte" },
      { href: "/ayuda?tema=reembolso#contacto", label: "Solicitar reembolso" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terminos", label: "Términos y condiciones" },
      { href: "/legal/privacidad", label: "Privacidad" },
      { href: "/legal/cookies", label: "Cookies" },
      { href: "/legal/reembolsos", label: "Reembolsos" },
      { href: "/legal/productos-digitales", label: "Productos digitales" },
    ],
  },
];


export function SiteFooter({ settings, payments, showAccounts = true }: { settings: StoreSettings; payments: PublicPaymentOption[]; showAccounts?: boolean }) {
  const columns = showAccounts ? COLUMNS : COLUMNS.map((c) => ({ ...c, links: c.links.filter((l) => l.href !== "/cuentas") }));
  const real = payments.map((p) => p.name);
  const gateways = real.length ? real : ["Bold"];
  const wa = whatsappLink(settings.whatsapp, `Hola ${settings.storeName}, necesito ayuda.`);
  const methods = parsePaymentMethods(settings.paymentMethods);
  const year = new Date().getFullYear();
  // Datos del vendedor visibles (Estatuto del Consumidor): razón social, NIT y dirección.
  const company = [settings.legalName, settings.taxId && `NIT ${settings.taxId}`, [settings.address, settings.city].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
  const socials = [
    wa && { href: wa, label: "WhatsApp", icon: <MessageCircle className="size-[18px]" /> },
    settings.instagram && { href: settings.instagram, label: "Instagram", icon: <InstagramGlyph className="size-[18px]" /> },
    settings.supportEmail && { href: `mailto:${settings.supportEmail}`, label: "Correo", icon: <Mail className="size-[18px]" /> },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ReactNode }>;

  return (
    <footer className="relative mt-16 border-t border-white/[0.08] bg-ink-950 sm:mt-24">
      <Container className="relative">
        {/* Cuerpo */}
        <div className="grid gap-10 pb-8 pt-12 sm:gap-12 sm:pb-10 sm:pt-16 lg:grid-cols-[1.15fr_2fr]">
          <div className="max-w-sm">
            <Logo name={settings.storeName} logoUrl={settings.logoUrl || undefined} />
            <p className="mt-4 text-[14px] leading-relaxed text-fg-muted">
              {showAccounts ? "Diamantes y cuentas de Free Fire en Colombia." : "Diamantes de Free Fire en Colombia."} Recarga directa por ID, pagos en pesos y seguimiento de cada pedido.
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={s.label}
                    title={s.label}
                    className="grid size-10 place-items-center rounded-lg border border-white/[0.08] text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
            {methods.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-[13px] font-medium text-fg-subtle">Medios de pago</p>
                <PaymentBadges methods={methods} size="sm" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-8">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="mb-3 text-[14px] font-semibold text-fg sm:mb-4">{col.title}</p>
                <ul className="space-y-2.5 sm:space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="group inline-flex items-center gap-1 text-[14px] text-fg-muted transition-colors hover:text-fg">
                        {l.label}
                        
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col gap-3 border-t border-white/[0.08] py-8 text-[12.5px] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.legalName || settings.storeName}
            {company && <span className="block sm:inline"><span className="hidden sm:inline"> · </span>{company}</span>}
            <span className="block">
              ¿Una queja sin resolver? Acude a la{" "}
              <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">
                Superintendencia de Industria y Comercio
              </a>
              .
            </span>
          </p>
          <p className="flex flex-wrap items-center gap-1.5">
            Pagos procesados por
            {gateways.map((g, i) => (
              <span key={g} className="inline-flex items-center">
                {g === "Bold" ? <BoldLogo className="h-[15px] opacity-90" /> : <span className="font-medium text-fg-muted">{g}</span>}
                {i < gateways.length - 1 && ","}
              </span>
            ))}
          </p>
        </div>

        {settings.showGarenaDisclaimer === "true" && (
          <p className="max-w-4xl border-t border-white/[0.05] pb-6 pt-5 text-[11.5px] leading-relaxed text-fg-subtle">
            {settings.storeName} es una tienda independiente y no está afiliada, patrocinada ni respaldada por Garena International ni por sus filiales. Free Fire y sus marcas
            relacionadas pertenecen a sus respectivos titulares y se mencionan únicamente para identificar el juego al que se destinan los productos.
          </p>
        )}
      </Container>

    </footer>
  );
}
