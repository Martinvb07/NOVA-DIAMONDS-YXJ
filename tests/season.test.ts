import { afterEach, describe, expect, it } from "vitest";
import { christmasOver, currentSeason, isSeasonalImage, seasonalBanner, seasonBanner } from "@/domain/season";

const co = (iso: string) => new Date(`${iso}T12:00:00-05:00`);

describe("Navidad de cristal", () => {
  afterEach(() => {
    delete process.env.SEASON;
  });

  it("se ve solo si está encendida en Ajustes y no ha llegado el 1 de enero", () => {
    expect(currentSeason("navidad", co("2026-12-24"))).toBe("navidad");
    expect(currentSeason("", co("2026-12-24"))).toBeNull();
    expect(currentSeason("navidad", co("2027-01-01"))).toBeNull();
    expect(christmasOver(co("2026-12-31"))).toBe(false);
    expect(christmasOver(co("2027-01-01"))).toBe(true);
    expect(christmasOver(co("2027-09-01"))).toBe(false);
  });

  it("SEASON en el .env la fuerza o la apaga", () => {
    process.env.SEASON = "off";
    expect(currentSeason("navidad", co("2026-12-24"))).toBeNull();
    process.env.SEASON = "navidad";
    expect(currentSeason("", co("2027-03-01"))).toBe("navidad");
  });

  it("cambia los banners de la marca por su versión navideña y deja los subidos al panel", () => {
    const marca = { imageUrl: "/promo/nova/hero-bonus.webp", imageMobileUrl: "/promo/nova/m/hero-bonus.webp" };
    expect(seasonalBanner(marca, "navidad")).toEqual({ imageUrl: "/promo/nova/navidad/hero-bonus.webp", imageMobileUrl: "/promo/nova/navidad/m/hero-bonus.webp" });
    expect(seasonalBanner(marca, null)).toEqual(marca);
    const propio = { imageUrl: "/uploads/mi-banner.webp", imageMobileUrl: null };
    expect(seasonalBanner(propio, "navidad")).toEqual(propio);
    expect(isSeasonalImage("/promo/nova/navidad/hero-bonus.webp")).toBe(true);
    expect(isSeasonalImage(propio.imageUrl)).toBe(false);
  });

  it("el banner «Feliz Navidad» solo existe en temporada", () => {
    expect(seasonBanner("navidad")?.imageUrl).toBe("/promo/nova/navidad/hero-navidad.webp");
    expect(seasonBanner(null)).toBeNull();
  });
});
