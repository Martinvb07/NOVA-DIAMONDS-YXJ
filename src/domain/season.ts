/**
 * Temporada de Navidad de Nova («Navidad de cristal»): decoración que va ENCIMA del diseño de siempre (no reemplaza
 * nada). Se enciende en Panel → Ajustes → Temporada (seasonTheme = "navidad") y se apaga sola el 1 de enero (ver
 * christmasOver y el mantenimiento). SEASON=navidad o SEASON=off en el .env la fuerza a mano.
 */
import { NAVIDAD_BANNERS } from "@/content/navidad-banners";

export type Season = "navidad";

/** Desde el 1 de enero (hora de Colombia) y hasta agosto la Navidad no se muestra aunque siga encendida en Ajustes. */
export function christmasOver(now = new Date()): boolean {
  return new Date(now.getTime() - 5 * 3600_000).getUTCMonth() <= 7;
}

/** Temporada activa: la forzada en el .env o la elegida en Ajustes (Navidad, hasta el 31 de diciembre). */
export function currentSeason(seasonTheme: string | null | undefined, now = new Date()): Season | null {
  const forced = process.env.SEASON;
  if (forced === "navidad") return "navidad";
  if (forced === "off") return null;
  return seasonTheme === "navidad" && !christmasOver(now) ? "navidad" : null;
}

/**
 * En Navidad, los banners de la marca (public/promo/nova) se cambian solos por su versión navideña
 * (public/promo/nova/navidad, ver scripts/banners-nova.py). Lo guardado en el panel no cambia.
 */
export function seasonalBanner<T extends { imageUrl: string; imageMobileUrl?: string | null }>(b: T, season: Season | null): T {
  if (season !== "navidad") return b;
  const swap = (u: string | null | undefined) => (u && NAVIDAD_BANNERS.has(u) ? u.replace("/promo/nova/", "/promo/nova/navidad/") : u);
  return { ...b, imageUrl: swap(b.imageUrl) ?? b.imageUrl, imageMobileUrl: swap(b.imageMobileUrl) };
}

/** ¿La imagen ya es navideña? Esas no llevan el borde de nieve que se pone a los banners subidos al panel. */
export const isSeasonalImage = (url: string) => url.startsWith("/promo/nova/navidad/");

/** Banner de Navidad para el carrusel del inicio (va de primero; los del panel siguen igual detrás). */
export function seasonBanner(season: Season | null) {
  if (season !== "navidad") return null;
  return { id: "temporada-navidad", title: "Feliz Navidad: regala diamantes directo a su ID", imageUrl: "/promo/nova/navidad/hero-navidad.svg", imageMobileUrl: "/promo/nova/navidad/m/hero-navidad.svg", href: "/recargas" };
}
