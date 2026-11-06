import "server-only";
import { db } from "@/lib/db";
import { compareRegions, DEFAULT_TOPUP_REGION, floorPrice, isFreeFireProductKey, minMarginFor, type MinMarginRule, parseRegionList, regionalPrice, regionLabel, splitBonus, suggestedPrice } from "@/domain/topup-regions";
import { audit } from "@/lib/audit";
import { supplierApi } from "./integrations/topup/rechargegame";
import type { TopUpProvider } from "./integrations/topup/types";
import { getSettings, saveSettings } from "./settings";

/**
 * Catálogo del proveedor mayorista: copia local + vínculo con los paquetes de la tienda.
 * La sincronización actualiza costos y existencias; los precios de venta solo cambian solos para subir hasta la
 * ganancia mínima que fijó el dueño (Panel → Proveedor), nunca para bajar.
 */

const GAME = "free-fire";
/** Cada cuánto se renueva el catálogo desde el mantenimiento (corre cada 2 min): costos y agotados al día. */
const CATALOG_MAX_AGE_MS = 15 * 60_000;
const toCents = (usdt: number | string) => Math.round(Number(usdt) * 100);
const isDiamondPack = (p: { unit: string | null; amount: number | null; delivery: string }) => p.unit === "Diamonds" && (p.amount ?? 0) > 0 && p.delivery === "player_id";

export async function supplierRate() {
  const s = await getSettings();
  const usdtCop = Number(s.usdtCop) > 0 ? Number(s.usdtCop) : 3400;
  const margin = Number(s.topupMargin) >= 0 ? Number(s.topupMargin) : 30;
  const pct = (v: string | undefined) => (Number(v) > 0 && Number(v) < 90 ? Number(v) : 0);
  const minMargin: MinMarginRule = { general: pct(s.minMarginPct), small: pct(s.minMarginSmallPct) };
  return { usdtCop, margin, minMargin, regions: parseRegionList(s.topupRegions), syncedAt: s.supplierSyncedAt ? new Date(s.supplierSyncedAt) : null };
}

export type PriceChange = { id: string; name: string; region: string; from: number; to: number };

/**
 * Ganancia mínima: sube el precio de los paquetes activos (con costo conocido) que quedaron por debajo, por
 * ejemplo porque el proveedor subió su costo. Nunca baja un precio. Queda registrado en la auditoría.
 */
export async function enforceMinimumMargins(): Promise<PriceChange[]> {
  const { usdtCop, minMargin } = await supplierRate();
  if (!(minMargin.general > 0 || minMargin.small > 0)) return [];
  // Los paquetes con precio fijo (puesto a mano) no se tocan.
  const pkgs = await db.diamondPackage.findMany({ where: { active: true, manualPrice: false, costCents: { not: null } }, select: { id: true, name: true, region: true, diamonds: true, bonusDiamonds: true, price: true, compareAtPrice: true, costCents: true } });
  const changes: PriceChange[] = [];
  for (const p of pkgs) {
    const pct = minMarginFor(p, minMargin);
    if (!(pct > 0)) continue;
    const floor = floorPrice(p.costCents!, usdtCop, pct);
    if (p.price >= floor) continue;
    // Condicional sobre el precio leído: si alguien lo editó justo ahora, no se pisa.
    const r = await db.diamondPackage.updateMany({ where: { id: p.id, price: p.price }, data: { price: floor, ...(p.compareAtPrice != null && p.compareAtPrice <= floor ? { compareAtPrice: null } : {}) } });
    if (r.count) changes.push({ id: p.id, name: p.name, region: p.region, from: p.price, to: floor });
  }
  if (changes.length) await audit({ actorId: null, action: "package.min_margin", entity: "DiamondPackage", data: { usdtCop, minMargin, changes } });
  return changes;
}

let syncing: Promise<SyncSummary> | null = null;
export type SyncSummary = { products: number; regions: number; linked: number; updated: number; repriced: number };

/** Descarga el catálogo de Free Fire y actualiza costo/agotado de los paquetes vinculados. */
export function syncSupplierCatalog(): Promise<SyncSummary> {
  syncing ??= doSync().finally(() => (syncing = null));
  return syncing;
}

async function doSync(): Promise<SyncSummary> {
  const { groups } = await supplierApi.catalog();
  const now = new Date();
  // Protección: un catálogo vacío o al que le falta la mayoría de los productos vinculados es una falla del
  // proveedor, no «dejó de vender todo». No se aplica (se conserva la copia anterior) y se reintenta después.
  const incoming = new Set(groups.flatMap((g) => g.products.map((p) => p.product_key.slice(0, 191))));
  const linkedActive = (await db.diamondPackage.findMany({ where: { active: true, providerSku: { not: null } }, select: { providerSku: true } })).map((p) => p.providerSku!);
  const stillThere = linkedActive.filter((k) => incoming.has(k)).length;
  if (incoming.size === 0 || (linkedActive.length >= 4 && stillThere < linkedActive.length / 2)) {
    throw new Error(`El proveedor devolvió un catálogo ${incoming.size === 0 ? "vacío" : `incompleto (${stillThere} de ${linkedActive.length} productos vinculados)`}: no se aplicó y se conserva la copia anterior.`);
  }
  const rows = groups.flatMap((g) =>
    g.products.map((p) => ({
      productKey: p.product_key.slice(0, 191),
      game: GAME,
      regionSlug: g.slug,
      regionName: g.key.slice(0, 100),
      name: p.name.slice(0, 191),
      amount: p.amount ?? null,
      unit: p.unit ?? null,
      priceCents: toCents(p.price),
      outOfStock: !!p.out_of_stock,
      delivery: p.delivery,
      syncedAt: now,
    })),
  );
  await db.$transaction([db.supplierProduct.deleteMany({ where: { game: GAME } }), db.supplierProduct.createMany({ data: rows })]);
  const byKey = new Map(rows.map((r) => [r.productKey, r]));

  let linked = 0;
  let updated = 0;
  const packages = await db.diamondPackage.findMany({ select: { id: true, region: true, diamonds: true, bonusDiamonds: true, providerSku: true, costCents: true, supplierOutOfStock: true } });
  for (const p of packages) {
    let product = isFreeFireProductKey(p.providerSku) ? byKey.get(p.providerSku) : undefined;
    // Paquetes creados a mano: se vinculan por cantidad total dentro de su región.
    if (!product && !isFreeFireProductKey(p.providerSku)) {
      product = rows.find((r) => r.regionSlug === p.region && isDiamondPack(r) && r.amount === p.diamonds + p.bonusDiamonds);
      if (product) linked++;
    }
    if (!product) {
      if (isFreeFireProductKey(p.providerSku) && !p.supplierOutOfStock) {
        // El proveedor ya no lista ese producto: se trata como agotado.
        await db.diamondPackage.update({ where: { id: p.id }, data: { supplierOutOfStock: true } });
        updated++;
      }
      continue;
    }
    if (p.providerSku !== product.productKey || p.costCents !== product.priceCents || p.supplierOutOfStock !== product.outOfStock) {
      await db.diamondPackage.update({ where: { id: p.id }, data: { providerSku: product.productKey, costCents: product.priceCents, supplierOutOfStock: product.outOfStock } });
      updated++;
    }
  }
  await saveSettings({ supplierSyncedAt: now.toISOString() });
  // Costos nuevos: ningún paquete queda por debajo de la ganancia mínima.
  const repriced = await enforceMinimumMargins().catch((e) => {
    console.error("[proveedor] no se pudo aplicar la ganancia mínima:", (e as Error).message);
    return [] as PriceChange[];
  });
  return { products: rows.length, regions: groups.length, linked, updated, repriced: repriced.length };
}

/** Sincroniza si la copia local tiene más de 15 minutos (o nunca se sincronizó). Nunca lanza error. */
export async function ensureFreshCatalog(): Promise<boolean> {
  const { syncedAt } = await supplierRate();
  if (syncedAt && Date.now() - syncedAt.getTime() < CATALOG_MAX_AGE_MS) return false;
  try {
    await syncSupplierCatalog();
    return true;
  } catch (e) {
    console.error("[proveedor] no se pudo sincronizar el catálogo:", (e as Error).message);
    return false;
  }
}

export type SupplierRegion = { slug: string; name: string; label: string; packs: number; minCents: number | null; maxCents: number | null; outOfStock: number; storePackages: number; enabled: boolean };

export async function listSupplierRegions(): Promise<SupplierRegion[]> {
  const [products, packages, { regions }] = await Promise.all([
    db.supplierProduct.findMany({ where: { game: GAME }, orderBy: { priceCents: "asc" } }),
    db.diamondPackage.groupBy({ by: ["region"], where: { active: true }, _count: { _all: true } }),
    supplierRate(),
  ]);
  const map = new Map<string, SupplierRegion>();
  for (const p of products) {
    if (!isDiamondPack(p)) continue;
    const r = map.get(p.regionSlug) ?? { slug: p.regionSlug, name: p.regionName, label: regionLabel(p.regionSlug, p.regionName), packs: 0, minCents: null, maxCents: null, outOfStock: 0, storePackages: 0, enabled: regions.includes(p.regionSlug) };
    r.packs++;
    if (p.outOfStock) r.outOfStock++;
    r.minCents = r.minCents == null ? p.priceCents : Math.min(r.minCents, p.priceCents);
    r.maxCents = r.maxCents == null ? p.priceCents : Math.max(r.maxCents, p.priceCents);
    map.set(p.regionSlug, r);
  }
  for (const g of packages) {
    const r = map.get(g.region);
    if (r) r.storePackages = g._count._all;
  }
  // Orden fijo (no cambia al activar/ocultar: evita clics en la fila equivocada).
  return [...map.values()].sort(compareRegions);
}

/**
 * Crea en la tienda los paquetes de diamantes de una región. Precio:
 *  - LATAM (región principal): costo × tasa + margen general.
 *  - Otras regiones: mismo margen que el escalón equivalente de LATAM, sin pasar su precio (ver regionalPrice).
 * Los que ya existen conservan su precio salvo que se pida recalcular.
 */
export async function importRegionPackages(regionSlug: string, opts: { reprice?: boolean } = {}) {
  const { usdtCop, margin } = await supplierRate();
  const products = (await db.supplierProduct.findMany({ where: { game: GAME, regionSlug }, orderBy: { amount: "asc" } })).filter(isDiamondPack);
  if (products.length === 0) return { created: 0, repriced: 0 };
  const existing = await db.diamondPackage.findMany({ where: { providerSku: { in: products.map((p) => p.productKey) } } });
  const latam =
    regionSlug === DEFAULT_TOPUP_REGION
      ? []
      : (await db.diamondPackage.findMany({ where: { region: DEFAULT_TOPUP_REGION, active: true }, select: { diamonds: true, bonusDiamonds: true, price: true, costCents: true } })).map((l) => ({
          amount: l.diamonds + l.bonusDiamonds,
          price: l.price,
          costCents: l.costCents,
        }));
  let created = 0;
  let repriced = 0;
  for (const [i, p] of products.entries()) {
    const price = regionalPrice({ amount: p.amount!, costCents: p.priceCents, usdtCop, latam })?.price ?? suggestedPrice(p.priceCents, usdtCop, margin);
    const found = existing.find((e) => e.providerSku === p.productKey);
    if (found) {
      if (opts.reprice && found.price !== price) {
        await db.diamondPackage.update({ where: { id: found.id }, data: { price, compareAtPrice: null, costCents: p.priceCents, supplierOutOfStock: p.outOfStock } });
        repriced++;
      }
      continue;
    }
    const { diamonds, bonusDiamonds } = splitBonus(p.amount!);
    let slug = `diamantes-${regionSlug}-${p.amount}`.slice(0, 180);
    if (await db.diamondPackage.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await db.diamondPackage.create({
      data: {
        slug,
        name: `${p.amount} diamantes (${regionLabel(regionSlug, p.regionName)})`,
        diamonds,
        bonusDiamonds,
        price,
        region: regionSlug,
        providerSku: p.productKey,
        costCents: p.priceCents,
        supplierOutOfStock: p.outOfStock,
        sortOrder: i,
        active: true,
        available: true,
      },
    });
    created++;
  }
  return { created, repriced };
}

// Cambios a la lista de regiones activas, uno a la vez (dos clics seguidos no deben pisarse).
let regionsLock: Promise<unknown> = Promise.resolve();
export function updateEnabledRegions(change: (current: string[]) => string[] | Promise<string[]>): Promise<string[]> {
  const run = regionsLock.then(async () => {
    const current = parseRegionList((await getSettings()).topupRegions);
    const next = [...new Set(await change(current))];
    await saveSettings({ topupRegions: next.join(",") });
    return next;
  });
  regionsLock = run.catch(() => {});
  return run;
}

/** Nombre de la región como lo usa el proveedor ("LATAM", "Brazil"), para pedidos y verificación de ID. */
export async function supplierRegionName(regionSlug: string): Promise<string | null> {
  const row = await db.supplierProduct.findFirst({ where: { game: GAME, regionSlug }, select: { regionName: true } });
  return row?.regionName ?? null;
}

/** Busca el slug de región a partir del nombre que devuelve el verificador de IDs. */
export async function regionSlugFromName(name: string | null | undefined): Promise<string | null> {
  if (!name) return null;
  const rows = await db.supplierProduct.findMany({ where: { game: GAME }, distinct: ["regionSlug"], select: { regionSlug: true, regionName: true } });
  const n = name.toLowerCase().trim();
  return rows.find((r) => r.regionName.toLowerCase() === n || r.regionSlug === n)?.regionSlug ?? null;
}

/** Tasa del día USD→COP (fuente pública). El USDT se negocia muy cerca del dólar. */
export async function fetchDailyUsdCop(): Promise<number> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as { result?: string; rates?: Record<string, number> };
  const cop = j.rates?.COP;
  if (j.result !== "success" || !cop || cop < 1000 || cop > 10000) throw new Error("Respuesta inesperada");
  return Math.round(cop);
}

/** Tasa de la tienda a partir del dólar del día: el USDT en Colombia suele costar un poco más que el oficial (+2 %). */
export const usdtCopFromUsd = (usd: number) => Math.round(usd * 1.02);

/** Cada cuánto se renueva la tasa automática (la fuente se actualiza una vez al día). */
const RATE_MAX_AGE_MS = 6 * 60 * 60_000;
/** Un salto mayor que esto frente a la tasa anterior se trata como un dato malo de la fuente y no se aplica. */
const RATE_MAX_JUMP = 0.15;

export type DailyRateResult = { usd: number; from: number; to: number; repriced: PriceChange[] };

/**
 * Aplica el dólar del día (+2 %) como tasa de la tienda y, si con la tasa nueva algún paquete queda bajo la
 * ganancia mínima, le sube el precio (nunca baja precios). Lo usa el botón del panel y el mantenimiento.
 */
export async function applyDailyRate(actorId: string | null, opts: { allowJump?: boolean } = {}): Promise<DailyRateResult> {
  const usd = await fetchDailyUsdCop();
  const to = usdtCopFromUsd(usd);
  const { usdtCop: from } = await supplierRate();
  if (!opts.allowJump && Math.abs(to - from) / from > RATE_MAX_JUMP) {
    throw new Error(`La tasa del día ($${to.toLocaleString("es-CO")}) cambia más de ${RATE_MAX_JUMP * 100} % frente a la actual ($${from.toLocaleString("es-CO")}); no se aplicó sola. Revísala y guárdala en Panel → Proveedor.`);
  }
  await saveSettings({ usdtCop: String(to), usdtCopAt: new Date().toISOString() });
  if (to !== from) await audit({ actorId, action: "supplier.rates", entity: "Setting", data: { usdtCop: to, before: from, source: "open.er-api.com", usd, auto: actorId == null } });
  const repriced = await enforceMinimumMargins();
  return { usd, from, to, repriced };
}

/** Último intento fallido (en memoria): tras un error se espera 1 h antes de volver a consultar la fuente. */
let rateFailedAt = 0;

/** Mantenimiento: si la tasa automática está activa y tiene más de 6 h, la renueva. Nunca lanza error. */
export async function ensureDailyRate(): Promise<boolean> {
  const s = await getSettings();
  if (s.usdtCopAuto !== "true") return false;
  if (s.usdtCopAt && Date.now() - new Date(s.usdtCopAt).getTime() < RATE_MAX_AGE_MS) return false;
  if (Date.now() - rateFailedAt < 60 * 60_000) return false;
  try {
    // La primera vez se acepta cualquier salto: la tasa por defecto (3.400) puede estar muy lejos de la real.
    await applyDailyRate(null, { allowJump: !s.usdtCopAt });
    return true;
  } catch (e) {
    rateFailedAt = Date.now();
    console.error("[proveedor] no se pudo actualizar la tasa del día:", (e as Error).message);
    return false;
  }
}

export type PlayerRegionCheck =
  | { ok: true; playerId: string; region: string; regionSlug: string }
  | { ok: false; error: string; region?: string | null };

/** "Latinoamérica, Brasil o Europa" */
function regionsText(slugs: string[]) {
  const names = slugs.map((s) => regionLabel(s));
  return names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} o ${names[names.length - 1]}`;
}

/**
 * Regla de venta: solo se recargan cuentas cuya región confirma el proveedor y que está activa en la tienda.
 * Sin región confirmada (EXISTS, verificador caído) no se vende: una recarga a otra región no llega.
 */
export async function checkPlayerRegion(provider: TopUpProvider, playerId: string): Promise<PlayerRegionCheck> {
  const { regions } = await supplierRate();
  const r = await provider.validatePlayer(playerId);
  if (r.verifiable && !r.valid) return { ok: false, error: r.message ?? "No encontramos ese ID de jugador. Revísalo e intenta de nuevo." };
  if (!r.verifiable) return { ok: false, error: r.message ?? "No pudimos verificar la región de esta cuenta ahora mismo. Intenta de nuevo en unos minutos." };
  const list = regionsText(regions);
  if (!r.region) {
    return { ok: false, error: `Encontramos la cuenta, pero no pudimos confirmar que sea de ${list}. Por ahora solo recargamos cuentas de esas regiones.` };
  }
  const slug = await regionSlugFromName(r.region);
  if (!slug || !regions.includes(slug)) {
    return { ok: false, region: r.region, error: `Esta cuenta es de ${regionLabel(slug, r.region)}. Por ahora solo recargamos cuentas de ${list}.` };
  }
  return { ok: true, playerId, region: r.region, regionSlug: slug };
}

