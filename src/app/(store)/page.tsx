import Link from "next/link";
import { ClipboardList, CreditCard, Gem as GemIcon, LifeBuoy, Radar, Users } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { AccountGridCard } from "@/components/store/account-listing";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { SectionHead } from "@/components/store/section-head";
import { currentSeason, seasonalBanner, seasonBanner } from "@/domain/season";
import { DiamondCover, tierFor } from "@/components/brand/covers";
import { RankEmblem } from "@/components/brand/rank-emblem";
import { ProductTile } from "@/components/store/product-tile";
import { FF_RANKS } from "@/domain/freefire";
import { formatNumber, packageTitle } from "@/lib/money";
import { db } from "@/lib/db";
import { BannerSlot } from "@/components/store/banner-slot";
import { LivePurchases } from "@/components/store/live-purchases";
import { Container } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { accountsVisible, getAccountFacets, getAccounts, getPackages, getLiveDeliveries } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import type { Metadata } from "next";

// Canónica solo en el inicio (antes la heredaban todas las páginas sin canónica propia).
export const metadata: Metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-dynamic";

const SHORTCUTS = [
  { href: "/recargas", icon: GemIcon, label: "Diamantes", hint: "Recarga por ID" },
  { href: "/cuentas", icon: Users, label: "Cuentas", hint: "Listas para jugar" },
  { href: "/pedido", icon: Radar, label: "Rastrear pedido", hint: "Estado en vivo" },
  { href: "/cuenta", icon: ClipboardList, label: "Mis pedidos", hint: "Tu historial" },
  { href: "/medios-de-pago", icon: CreditCard, label: "Medios de pago", hint: "PSE, Nequi, tarjeta" },
  { href: "/ayuda", icon: LifeBuoy, label: "Ayuda", hint: "Soporte real" },
];

export default async function HomePage() {
  const [packages, accounts, recent, settings, facets, heroBanners] = await Promise.all([getPackages(), getAccounts({ onlyAvailable: false, take: 12 }), getLiveDeliveries(10).catch(() => ({ items: [], stats: { today: 0, diamonds30d: 0 } })), getSettings(), getAccountFacets(), db.promoBanner.findMany({ where: { placement: "TOP", active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, title: true, imageUrl: true, imageMobileUrl: true, href: true } }).catch(() => [])]);
  const showAccounts = await accountsVisible();
  const visibleAccounts = showAccounts ? accounts.filter((a) => a.available || a.reservedTemporarily) : [];
  const shortcuts = showAccounts ? SHORTCUTS : SHORTCUTS.filter((s) => s.href !== "/cuentas");
  const bonusPct = packages[0]?.diamonds ? Math.round((packages[0].bonusDiamonds / packages[0].diamonds) * 100) : 0;
  const rankChips = [...FF_RANKS].reverse().filter((r) => facets.rankCounts[r.id]);

  // Carrusel: en Navidad el banner navideño va de primero y los del panel se ven en su versión navideña.
  const seasonNow = currentSeason(settings.seasonTheme);
  const xmas = seasonBanner(seasonNow);
  const banners = [...(xmas ? [xmas] : []), ...heroBanners.map((b) => seasonalBanner(b, seasonNow))];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: settings.legalName || settings.storeName,
          url: env.appUrl,
          ...(settings.instagram ? { sameAs: [settings.instagram] } : {}),
          ...(settings.supportEmail ? { email: settings.supportEmail } : {}),
        }}
      />
      <h1 className="sr-only">{showAccounts ? "Diamantes y cuentas de Free Fire en Colombia" : "Recarga de diamantes de Free Fire en Colombia"}</h1>

      <Container className="space-y-10 pb-2 pt-4 sm:space-y-16 sm:pb-6 sm:pt-7">
        <div className="space-y-5">
          {banners.length > 0 && <HeroCarousel banners={banners} />}

          {/* Accesos rápidos */}
          {/* Celular: fila deslizable de íconos tipo app. Escritorio: rejilla de tarjetas. */}
          <nav
            aria-label="Accesos rápidos"
            className={cn(
              "-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0",
              shortcuts.length === 6 ? "sm:grid-cols-6" : "sm:grid-cols-5",
            )}
          >
            {shortcuts.map(({ href, icon: Icon, label, hint }) => (
              <Link
                key={label}
                href={href}
                className="group flex w-[76px] shrink-0 snap-start flex-col items-center gap-2 text-center sm:w-auto sm:rounded-[16px] sm:bg-ink-850 sm:px-2 sm:py-3.5 sm:ring-1 sm:ring-white/[0.07] sm:transition sm:hover:-translate-y-0.5 sm:hover:bg-ink-800 sm:hover:ring-nova-400/30 lg:flex-row lg:gap-3 lg:p-3 lg:text-left"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-gradient-to-b from-ink-750 to-ink-850 shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset] ring-1 ring-white/[0.07] transition active:scale-95 sm:size-11 sm:rounded-[12px] sm:bg-gradient-to-br sm:from-nova-400/20 sm:to-plasma-400/15 sm:ring-nova-400/25">
                  <Icon className="size-6 text-nova-300 transition-transform group-hover:-translate-y-0.5 sm:size-5" strokeWidth={2.2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-medium leading-tight text-fg-muted sm:text-[13px] sm:font-semibold sm:text-fg lg:truncate lg:text-[13.5px]">{label}</span>
                  <span className="hidden truncate text-[11.5px] text-fg-subtle lg:mt-0.5 lg:block">{hint}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Recargas */}
        {packages.length > 0 && (
          <section id="diamantes" className="scroll-mt-24">
            <SectionHead eyebrow="Free Fire · directo a tu ID" title="Recargas de diamantes" sub={bonusPct ? `Todos con +${bonusPct}% de bonus · precio final en pesos` : "Precio final en pesos"} href="/recargas" cta="Ver todo" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 min-[480px]:grid-cols-3 sm:gap-x-4 lg:grid-cols-6">
              {packages.map((p) => (
                <ProductTile
                  key={p.id}
                  href={`/recargas?paquete=${p.slug}`}
                  cover={<DiamondCover tier={tierFor(p.diamonds)} diamonds={p.diamonds} bonus={p.bonusDiamonds} />}
                  title={packageTitle(p.diamonds, p.bonusDiamonds)}
                  meta={`Recibes ${formatNumber(p.diamonds + p.bonusDiamonds)} diamantes`}
                  price={p.quote.price}
                  original={p.quote.original}
                  currency={p.currency}
                  label={p.label}
                  isDemo={p.isDemo}
                  disabled={!p.available}
                />
              ))}
            </div>
          </section>
        )}

        <BannerSlot slot="HOME_TRUST" variant="wide" label="Cómo comprar" eyebrow="Así de fácil" title="Cómo comprar" sub="Pon tu ID, paga en pesos y recibe en minutos." />

        {/* Compras en vivo: últimas 10 compras pagadas (reales), se actualiza sola */}
        <LivePurchases initial={recent} />

        {/* Cuentas */}
        {visibleAccounts.length > 0 && (
          <section>
            <SectionHead eyebrow="Cuentas Free Fire" title="Cuentas destacadas" sub="Cada cuenta es única · procedencia revisada antes de publicar" href="/cuentas" cta="Ver catálogo" />
            {rankChips.length > 1 && (
              <nav aria-label="Cuentas por rango" className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
                {rankChips.map((r) => (
                  <Link
                    key={r.id}
                    href={`/cuentas?rango=${r.id}`}
                    className="group flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink-850 pl-1.5 pr-3.5 text-[13.5px] font-semibold ring-1 ring-white/[0.08] transition hover:bg-ink-800 hover:ring-white/20"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-white/[0.05]">
                      <RankEmblem rank={r.id} className="size-6 transition-transform group-hover:scale-110" />
                    </span>
                    {r.label}
                    <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-fg-subtle">{facets.rankCounts[r.id]}</span>
                  </Link>
                ))}
              </nav>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleAccounts.slice(0, 3).map((a) => (
                <AccountGridCard key={a.id} a={a} />
              ))}
            </div>
          </section>
        )}

        <BannerSlot slot="HOME_BOTTOM" variant="wide" label="Compra con confianza" eyebrow="Garantía Nova" title="Compra con confianza" sub="Pago verificado, sin contraseñas y reembolso si la entrega falla." />
      </Container>
    </>
  );
}
