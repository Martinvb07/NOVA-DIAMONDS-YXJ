"""Banners de NOVA DIAMONDS a partir de la serie de banners de VANTA (misma composición, identidad propia).

- Paleta: verde lima y grises verdosos → azul neón, violeta y grises azulados de Nova.
- La luz en «V» detrás del arte → destello de estrella (nova) con rayos cian y violeta.
- Cada emblema «V» → isotipo YXJ.
- Títulos en Orbitron (la letra del logo) y textos en Inter, incrustados al exportar.

Uso: python3 scripts/banners-nova.py <carpeta promo de vanta> <carpeta de trabajo>
Escribe en la carpeta de trabajo un HTML por banner y lista.json; scripts/banners-nova.js los exporta a WebP.
"""
import base64
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, WORK = Path(sys.argv[1]), Path(sys.argv[2])
WORK.mkdir(parents=True, exist_ok=True)

b64 = lambda p: base64.b64encode(Path(p).read_bytes()).decode()
MARK = b64(ROOT / "public/brand/nova-yxj.png")
FONTS = {k: b64(ROOT / f"src/fonts/{k}-latin-wght-normal.woff2") for k in ("orbitron", "inter")}

COLORS = {
    "#b9f43c": "#29b6ff", "#c8f04f": "#29b6ff", "#dcff7a": "#9fe9ff", "#d9f77f": "#7fe3ff", "#5f9a12": "#1a5fd6",
    "#0c180c": "#0a1a48", "#030604": "#02040d", "#10200f": "#0c1f55", "#040705": "#02040d", "#0d200f": "#141142",
    "#323a36": "#2c3756", "#0c100e": "#0a0f1f", "#47524c": "#3f4c70", "#1b221e": "#161d36", "#2d3531": "#27314e",
    "#141916": "#10162b", "#030504": "#02040b", "#050706": "#04060f", "#060807": "#050812", "#070908": "#060a16",
    "#0a0d0b": "#080c1a", "#2c3330": "#28324e", "#1d2320": "#192038", "#a9c79a": "#9fb6e6", "#10140a": "#03101f",
    "#0b0f14": "#03101f",
}
V_PATH = re.compile(r'<path d="M-10 -8H-4\.2L0 1\.6L4\.2 -8H10L1\.8 8\.6H-1\.8Z"([^>]*)/>')
BEAM = re.compile(r'<path d="M(-?[\d.]+) -10H(-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) -10H(-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)Z" fill="url\(#v\)"/>')


def burst(cx, cy, size):
    rays = []
    for i in range(12):
        a = math.radians(i * 30 + 15)
        ln = size * (1 if i % 2 == 0 else 0.62)
        w = size * (0.06 if i % 2 == 0 else 0.04)
        ex, ey = cx + math.cos(a) * ln, cy + math.sin(a) * ln
        px, py = -math.sin(a) * w, math.cos(a) * w
        rays.append(f'<path d="M{cx:.0f} {cy:.0f}L{ex + px:.0f} {ey + py:.0f}L{ex - px:.0f} {ey - py:.0f}Z" fill="url(#{"nrA" if i % 3 != 2 else "nrB"})"/>')
    return (
        f'<defs><radialGradient id="nrA" gradientUnits="userSpaceOnUse" cx="{cx:.0f}" cy="{cy:.0f}" r="{size:.0f}"><stop offset="0" stop-color="#7fe3ff" stop-opacity=".5"/><stop offset="1" stop-color="#29b6ff" stop-opacity="0"/></radialGradient>'
        f'<radialGradient id="nrB" gradientUnits="userSpaceOnUse" cx="{cx:.0f}" cy="{cy:.0f}" r="{size:.0f}"><stop offset="0" stop-color="#a48bff" stop-opacity=".5"/><stop offset="1" stop-color="#6d4dff" stop-opacity="0"/></radialGradient>'
        f'<radialGradient id="nrC" gradientUnits="userSpaceOnUse" cx="{cx:.0f}" cy="{cy:.0f}" r="{size * .4:.0f}"><stop offset="0" stop-color="#e9fbff" stop-opacity=".3"/><stop offset="1" stop-color="#29b6ff" stop-opacity="0"/></radialGradient></defs>'
        f'<g opacity=".85">{"".join(rays)}</g><circle cx="{cx:.0f}" cy="{cy:.0f}" r="{size * .4:.0f}" fill="url(#nrC)"/>'
    )


def convert(s: str, w: int, h: int) -> str:
    m = BEAM.search(s)
    if m:
        ax, ay = float(m.group(3)), float(m.group(4))
        s = s.replace(m.group(0), burst(ax, ay * 0.8, h * 0.95))
    s = V_PATH.sub(lambda m: '<circle cx="0" cy="0" r="12" fill="#29b6ff" opacity=".35" filter="url(#soft)"/>' if "filter=" in m.group(1)
                   else f'<image href="data:image/png;base64,{MARK}" x="-14" y="-11.3" width="28" height="22.6"/>', s)
    for a, b in COLORS.items():
        s = re.sub(re.escape(a), b, s, flags=re.I)
    # Títulos (Arial Black) en Orbitron sin cursiva; textos en Inter.
    s = s.replace('font-family="Arial Black, Arial, Helvetica, sans-serif"', 'font-family="NovaOrbitron, sans-serif"')
    s = s.replace('font-family="Arial, Helvetica, sans-serif"', 'font-family="NovaInter, sans-serif"')
    s = s.replace('font-style="italic"', "")
    return s


PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:NovaOrbitron;src:url(data:font/woff2;base64,{orb}) format('woff2');font-weight:400 900}}
@font-face{{font-family:NovaInter;src:url(data:font/woff2;base64,{inter}) format('woff2');font-weight:100 900}}
html,body{{margin:0;background:#000}} #b{{position:relative;width:{w}px;height:{h}px;overflow:hidden}}
#b>svg{{display:block;width:{w}px;height:{h}px}}
</style></head><body><div id="b">{svg}</div></body></html>"""

ITEMS = [  # archivo de vanta, salida
    ("hero-bonus.svg", "hero-bonus"), ("hero-nequi.svg", "hero-nequi"), ("hero-pagos.svg", "hero-pagos"),
    ("hero-codigos.svg", "hero-codigos"), ("pasos-wide.svg", "pasos-wide"), ("garantia-wide.svg", "garantia-wide"),
    ("sinclaves-wide.svg", "sinclaves-wide"), ("codigos.svg", "codigos"), ("garantia.svg", "garantia"),
    ("soporte.svg", "soporte"),
    ("m/hero-bonus.svg", "m/hero-bonus"), ("m/hero-nequi.svg", "m/hero-nequi"), ("m/hero-pagos.svg", "m/hero-pagos"),
    ("m/hero-codigos.svg", "m/hero-codigos"), ("m/pasos.svg", "m/pasos"), ("m/garantia.svg", "m/garantia"),
    ("m/sinclaves.svg", "m/sinclaves"),
]

lista = []
for src, out in ITEMS:
    s = (SRC / src).read_text(encoding="utf-8")
    w, h = (int(float(x)) for x in re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', s).groups())
    s = convert(s, w, h)
    name = out.replace("/", "-")
    (WORK / f"{name}.html").write_text(PAGE.format(orb=FONTS["orbitron"], inter=FONTS["inter"], w=w, h=h, svg=s), encoding="utf-8")
    lista.append({"name": name, "w": w, "h": h, "out": f"{out}.webp"})
(WORK / "lista.json").write_text(json.dumps(lista, indent=1), encoding="utf-8")
print(len(lista), "banners")
