// Exporta los banners de scripts/banners-nova.py a PNG (luego se pasan a WebP).
// Uso: node scripts/banners-nova.js <carpeta de trabajo> [escala]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const work = path.resolve(process.argv[2]);
  const scale = Number(process.argv[3] || 1.5);
  const items = JSON.parse(fs.readFileSync(path.join(work, "lista.json"), "utf8"));
  const browser = await chromium.launch();
  for (const it of items) {
    const page = await browser.newPage({ viewport: { width: it.w, height: it.h }, deviceScaleFactor: scale });
    await page.goto("file://" + path.join(work, it.name + ".html"));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    await page.locator("#b").screenshot({ path: path.join(work, it.name + ".png") });
    await page.close();
  }
  await browser.close();
  console.log(items.length, "exportados");
})();
