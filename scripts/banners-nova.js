// Exporta los banners de scripts/banners-nova.py: PNG al 1,5× y luego WebP en public/ (ver el .py).
// Uso: node scripts/banners-nova.js <carpeta de trabajo> [solo]   («solo»: un banner por nombre, para revisar)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const work = path.resolve(process.argv[2]);
  const only = process.argv[3];
  const items = JSON.parse(fs.readFileSync(path.join(work, "lista.json"), "utf8")).filter((it) => !only || it.name.includes(only));
  const browser = await chromium.launch();
  for (const it of items) {
    const page = await browser.newPage({ viewport: { width: it.w, height: it.h }, deviceScaleFactor: 1.5 });
    await page.goto("file://" + path.join(work, it.name + ".html"));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.locator("#b").screenshot({ path: path.join(work, it.name + ".png") });
    await page.close();
  }
  await browser.close();
  console.log(items.length, "exportados");
})();
