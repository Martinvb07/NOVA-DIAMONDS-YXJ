import Link from "next/link";
import { ChevronRight, CreditCard, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { AccountGridCard } from "@/components/store/account-listing";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { DiamondCover, tierFor } from "@/components/brand/covers";
import { RankEmblem } from "@/components/brand/rank-emblem";
import { FF_RANKS } from "@/domain/freefire";
import { formatNumber, packageTitle } from "@/lib/money";
import { db } from "@/lib/db";
import { LivePurchases } from "@/components/store/live-purchases";
import { Container } from "@/components/ui/primitives";
import { AccountsIllustration } from "@/components/brand/illustrations";
import { FeaturedCarousel } from "@/components/store/home/featured-carousel";
import { ProductTabs } from "@/components/store/home/product-tabs";
import { PromoCards, type PromoCard } from "@/components/store/home/promo-cards";
import type { ShopItem } from "@/components/store/home/shop-cell";
import { ShowcaseHero, type HeroSlide } from "@/components/store/home/showcase-hero";
import { Guarantee, HowItWorks, SectionTitle } from "@/components/store/home/nova-sections";
import { PRODUCT_LABELS } from "@/domain/labels";
import { formatMoney } from "@/lib/money";
import type { AccountCardView, PackageView } from "@/server/catalog";
import { env } from "@/lib/env";
import { accountsVisible, getAccountFacets, getAccounts, getPackages, getLiveDeliveries } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import type { Metadata } from "next";

// Canónica solo en el inicio (antes la heredaban todas las páginas sin canónica propia).
export const metadata: Metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-dynamic";

function RowHead({ title, sub, href, cta }: { title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <div>
        <h2 className="text-[20px] font-extrabold leading-tight tracking-tight sm:text-[26px]">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-fg-subtle">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white/[0.05] pl-3.5 pr-2.5 text-[13px] font-medium text-fg-muted ring-1 ring-white/[0.08] hover:bg-white/10 hover:text-fg">
          {cta ?? "Ver todo"} <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

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

function accountItem(a: AccountCardView): ShopItem {
  return {
    key: `a-${a.id}`,
    href: `/cuentas/${a.slug}`,
    title: a.title,
    sub: [a.level != null && `Nivel ${a.level}`, a.skinsCount != null && `${formatNumber(a.skinsCount)} skins`].filter(Boolean).join(" · ") || "Cuenta Free Fire",
    price: a.quote.price,
    original: a.quote.original,
    currency: a.currency,
    badge: PRODUCT_LABELS[a.label] ?? (a.reservedTemporarily ? "Reservada" : null),
    disabled: !a.available,
    cta: "Ver cuenta",
    cover: { kind: "account", url: a.image?.url ?? null, alt: a.image?.alt ?? a.title, rank: a.rank },
  };
}

/** Diapositivas del carrusel principal a partir de paquetes reales: el de mayor descuento, el recomendado y el más grande. */
function heroSlides(packages: Pkg[]): HeroSlide[] {
  const live = packages.filter((p) => p.available);
  const picks: Array<{ p: Pkg | undefined; kicker: string; title: string; text: string }> = [
    {
      p: [...live].sort((a, b) => b.quote.discountPct - a.quote.discountPct)[0],
      kicker: "Temporada Nova",
      title: "¡Mega recarga!",
      text: "Diamantes directo a tu ID de Free Fire en minutos. Paga en pesos con PSE, Nequi, Bancolombia o tarjeta.",
    },
    {
      p: live.find((p) => p.label === "RECOMMENDED" || p.label === "BEST_SELLER"),
      kicker: "El favorito",
      title: "¡Más bonus!",
      text: "El paquete que más eligen los jugadores, con bonus incluido y seguimiento del pedido en vivo.",
    },
    {
      p: [...live].sort((a, b) => b.diamonds - a.diamonds)[0],
      kicker: "Para los pro",
      title: "¡Cofre nova!",
      text: "El paquete más grande de la tienda para el pase élite, skins y todo lo que viene en la temporada.",
    },
  ];
  const seen = new Set<string>();
  return picks.flatMap(({ p, ...copy }) => {
    if (!p || seen.has(p.id)) return [];
    seen.add(p.id);
    return [
      {
        key: p.id,
        ...copy,
        cta: "Recargar ahora",
        href: `/recargas?paquete=${p.slug}`,
        price: p.quote.price,
        original: p.quote.original,
        currency: p.currency,
        tier: tierFor(p.diamonds),
        diamonds: p.diamonds,
        bonus: p.bonusDiamonds,
      },
    ];
  });
}

export default async function HomePage() {
  const [packages, accounts, recent, settings, facets, heroBanners] = await Promise.all([getPackages(), getAccounts({ onlyAvailable: false, take: 12 }), getLiveDeliveries(10).catch(() => ({ items: [], stats: { today: 0, diamonds30d: 0 } })), getSettings(), getAccountFacets(), db.promoBanner.findMany({ where: { placement: "TOP", active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, title: true, imageUrl: true, imageMobileUrl: true, href: true } }).catch(() => [])]);
  const showAccounts = await accountsVisible();
  const visibleAccounts = showAccounts ? accounts.filter((a) => a.available || a.reservedTemporarily) : [];
  const bonusPct = packages[0]?.diamonds ? Math.round((packages[0].bonusDiamonds / packages[0].diamonds) * 100) : 0;
  const rankChips = [...FF_RANKS].reverse().filter((r) => facets.rankCounts[r.id]);

  const slides = heroSlides(packages);
  const pkgItems = packages.map(packageItem);
  const accItems = visibleAccounts.map(accountItem);
  const featured = [...packages].sort((a, b) => Number(b.featured) - Number(a.featured)).map(packageItem);
  const tabs = [
    { id: "nuevos", label: "Lo nuevo", items: [...accItems.slice(0, 4), ...pkgItems.slice(0, 8 - Math.min(4, accItems.length))] },
    { id: "vendidos", label: "Más vendidos", items: packages.filter((p) => p.label === "BEST_SELLER" || p.featured).map(packageItem) },
    { id: "ofertas", label: "Ofertas", items: [...packages.filter((p) => p.quote.original != null).map(packageItem), ...accItems.filter((a) => a.original != null)] },
    { id: "recomendados", label: "Recomendados", items: packages.filter((p) => p.label === "RECOMMENDED" || p.label === "BONUS").map(packageItem) },
    { id: "diamantes", label: "Diamantes", items: pkgItems },
    ...(accItems.length ? [{ id: "cuentas", label: "Cuentas", items: accItems }] : []),
  ];

  const mid = packages[Math.floor(packages.length / 2)];
  const cheapestAccount = visibleAccounts.reduce<AccountCardView | null>((m, a) => (!m || a.quote.price < m.quote.price ? a : m), null);
  const promoCards: PromoCard[] = [
    {
      kicker: "Diamantes",
      title: "Bonus en todos",
      note: bonusPct ? <>Hasta <span className="font-semibold text-nova-300">+{bonusPct}%</span> extra</> : "Directo a tu ID",
      cta: "Recargar",
      href: "/recargas",
      art: mid ? <div className="overflow-hidden rounded-[10px] ring-1 ring-nova-400/30"><DiamondCover tier={tierFor(mid.diamonds)} diamonds={mid.diamonds} bonus={mid.bonusDiamonds} /></div> : null,
    },
    showAccounts
      ? {
          kicker: "Cuentas Free Fire",
          title: "Colecciones",
          note: cheapestAccount ? <>Desde <span className="font-semibold text-nova-300">{formatMoney(cheapestAccount.quote.price, cheapestAccount.currency)}</span></> : "Rango, nivel y skins a la vista",
          cta: "Ver cuentas",
          href: "/cuentas",
          highlight: true,
          art: <div className="relative aspect-square">{rankChips[0] ? <RankEmblem rank={rankChips[0].id} className="absolute inset-[12%] size-[76%] drop-shadow-[0_0_18px_rgb(41_168_255/0.55)]" /> : <AccountsIllustration />}</div>,
        }
      : {
          kicker: "Seguimiento",
          title: "En vivo",
          note: "Mira cada paso de tu pedido",
          cta: "Rastrear",
          href: "/pedido",
          highlight: true,
          art: <div className="grid aspect-square place-items-center"><ShieldCheck className="size-20 text-nova-300 drop-shadow-[0_0_18px_rgb(41_168_255/0.8)]" strokeWidth={1.4} /></div>,
        },
    {
      kicker: "Medios de pago",
      title: "Pago verificado",
      note: "PSE · Nequi · Bancolombia · tarjeta",
      cta: "Ver medios",
      href: "/medios-de-pago",
      art: <div className="grid aspect-square place-items-center"><CreditCard className="size-20 text-nova-300 drop-shadow-[0_0_18px_rgb(41_168_255/0.8)]" strokeWidth={1.4} /></div>,
    },
  ];

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

      <Container className="space-y-8 pb-2 pt-4 sm:space-y-10 sm:pb-6 sm:pt-6">
        {/* Portada estilo vitrina con paquetes reales; sin paquetes, los banners principales del panel. */}
        {slides.length > 0 ? <ShowcaseHero slides={slides} /> : heroBanners.length > 0 && <HeroCarousel banners={heroBanners} />}

        <PromoCards cards={promoCards} />

        {/* Productos destacados */}
        <div id="diamantes" className="scroll-mt-24">
          <FeaturedCarousel strong="Productos" title="destacados" items={featured} href="/recargas" />
          <p className="mt-2 text-center text-[11.5px] text-fg-subtle">{bonusPct ? `Todos con +${bonusPct}% de bonus · precio final en pesos` : "Precio final en pesos colombianos"}</p>
        </div>

        <HowItWorks />

        {/* Compras en vivo: últimas 10 compras pagadas (reales), se actualiza sola */}
        <LivePurchases initial={recent} />

        <section aria-label="Vitrina">
          <SectionTitle index="03" title="Explora la tienda" sub="Filtra por lo nuevo, lo más vendido o las ofertas" />
          <ProductTabs tabs={tabs} />
        </section>

        {/* Cuentas */}
        {visibleAccounts.length > 0 && (
          <section>
            <SectionTitle index="04" title="Cuentas destacadas" sub="Cada cuenta es única · procedencia revisada antes de publicar" />
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

        <Guarantee />
      </Container>
    </>
  );
}
