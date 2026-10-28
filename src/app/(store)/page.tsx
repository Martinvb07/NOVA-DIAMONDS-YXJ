import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { AccountGridCard } from "@/components/store/account-listing";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { tierFor } from "@/components/brand/covers";
import { RankEmblem } from "@/components/brand/rank-emblem";
import { FF_RANKS } from "@/domain/freefire";
import { formatNumber, packageTitle } from "@/lib/money";
import { db } from "@/lib/db";
import { LivePurchases } from "@/components/store/live-purchases";
import { Container } from "@/components/ui/primitives";
import { ShopCell, type ShopItem } from "@/components/store/home/shop-cell";
import { ShowcaseHero } from "@/components/store/home/showcase-hero";
import { Guarantee, HowItWorks, SectionTitle } from "@/components/store/home/nova-sections";
import { PRODUCT_LABELS } from "@/domain/labels";
import type { PackageView } from "@/server/catalog";
import { env } from "@/lib/env";
import { accountsVisible, getAccountFacets, getAccounts, getPackages, getLiveDeliveries } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import type { Metadata } from "next";

// Canónica solo en el inicio (antes la heredaban todas las páginas sin canónica propia).
export const metadata: Metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-dynamic";

type Pkg = PackageView & { quote: { price: number; original: number | null; discountPct: number } };

function packageItem(p: Pkg): ShopItem {
  return {
    key: `p-${p.id}`,
    href: `/recargas?paquete=${p.slug}`,
    title: packageTitle(p.diamonds, p.bonusDiamonds),
    sub: `Recibes ${formatNumber(p.diamonds + p.bonusDiamonds)} diamantes`,
    price: p.quote.price,
    original: p.quote.original,
    currency: p.currency,
    badge: PRODUCT_LABELS[p.label] ?? (p.quote.discountPct ? `−${p.quote.discountPct}%` : null),
    disabled: !p.available,
    cta: "Recargar ahora",
    cover: { kind: "diamond", tier: tierFor(p.diamonds), diamonds: p.diamonds, bonus: p.bonusDiamonds },
  };
}

export default async function HomePage() {
  const [packages, accounts, recent, settings, facets, heroBanners] = await Promise.all([getPackages(), getAccounts({ onlyAvailable: false, take: 12 }), getLiveDeliveries(10).catch(() => ({ items: [], stats: { today: 0, diamonds30d: 0 } })), getSettings(), getAccountFacets(), db.promoBanner.findMany({ where: { placement: "TOP", active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, title: true, imageUrl: true, imageMobileUrl: true, href: true } }).catch(() => [])]);
  const showAccounts = await accountsVisible();
  const visibleAccounts = showAccounts ? accounts.filter((a) => a.available || a.reservedTemporarily) : [];
  const bonusPct = packages[0]?.diamonds ? Math.round((packages[0].bonusDiamonds / packages[0].diamonds) * 100) : 0;
  const rankChips = [...FF_RANKS].reverse().filter((r) => facets.rankCounts[r.id]);

  const pkgItems = packages.map(packageItem);
  // Portada: el paquete recomendado (o el del medio) y el precio más bajo disponible.
  const live = packages.filter((p) => p.available);
  const star = live.find((p) => p.label === "RECOMMENDED" || p.label === "BEST_SELLER") ?? live[Math.floor(live.length / 2)];
  const cheapest = live.reduce<Pkg | null>((m, p) => (!m || p.quote.price < m.quote.price ? p : m), null);
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
      <Container className="space-y-16 pb-4 pt-2 sm:space-y-24 sm:pb-8">
        {star && cheapest ? (
          <ShowcaseHero
            pkg={{ href: `/recargas?paquete=${star.slug}`, price: star.quote.price, currency: star.currency, tier: tierFor(star.diamonds), diamonds: star.diamonds, bonus: star.bonusDiamonds }}
            from={{ price: cheapest.quote.price, currency: cheapest.currency }}
          />
        ) : (
          <>
            <h1 className="sr-only">{showAccounts ? "Diamantes y cuentas de Free Fire en Colombia" : "Recarga de diamantes de Free Fire en Colombia"}</h1>
            {heroBanners.length > 0 && <HeroCarousel banners={heroBanners} />}
          </>
        )}

        {pkgItems.length > 0 && (
          <section id="diamantes" aria-labelledby="paquetes" className="scroll-mt-24">
            <SectionTitle
              title="Paquetes de diamantes"
              sub={bonusPct ? `Todos incluyen +${bonusPct}% de bonus. Precio final en pesos colombianos.` : "Precio final en pesos colombianos."}
              href="/recargas"
              cta="Ir a recargar"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {pkgItems.map((it) => (
                <ShopCell key={it.key} item={it} />
              ))}
            </div>
          </section>
        )}

        <HowItWorks />

        {/* Compras en vivo: últimas 10 compras pagadas (reales), se actualiza sola */}
        <LivePurchases initial={recent} />

        {/* Cuentas */}
        {visibleAccounts.length > 0 && (
          <section>
            <SectionTitle title="Cuentas destacadas" sub="Cada cuenta es única y su procedencia se revisa antes de publicarla." href="/cuentas" cta="Ver todas las cuentas" />
            {rankChips.length > 1 && (
              <nav aria-label="Cuentas por rango" className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
                {rankChips.map((r) => (
                  <Link
                    key={r.id}
                    href={`/cuentas?rango=${r.id}`}
                    className="group flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-ink-900 pl-1.5 pr-3 text-[14px] font-medium transition-colors hover:border-white/20"
                  >
                    <RankEmblem rank={r.id} className="size-6" />
                    {r.label}
                    <span className="text-[12px] tabular-nums text-fg-subtle">{facets.rankCounts[r.id]}</span>
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

        <Guarantee />
      </Container>
    </>
  );
}
