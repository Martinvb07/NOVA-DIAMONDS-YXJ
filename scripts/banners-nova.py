"""Banners de NOVA DIAMONDS a partir de la serie de banners de VANTA (misma composición, identidad propia).

- Paleta: verde lima y grises verdosos → azul neón, violeta y grises azulados de Nova.
- La luz en «V» detrás del arte → destello de estrella (nova) con rayos cian y violeta.
- Cada emblema «V» → isotipo YXJ.
- Títulos en Orbitron (la letra del logo) y textos en Inter, incrustados como subconjunto en cada SVG.

Salen como SVG (vector, como los de Vanta): nítidos en cualquier pantalla, livianos y sin pasar por el
optimizador de imágenes del servidor (que con fotos 4K tardaba en la primera visita).

Uso: python3 scripts/banners-nova.py <carpeta promo de vanta> <carpeta salida, p. ej. public/promo/nova> [navidad]
Con «navidad» escribe las versiones navideñas (sin luces encima, salvo el banner «Feliz Navidad»).
Requiere fonttools y brotli (pip install fonttools brotli).
"""
import base64
import io
import json
import math
import random
import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

b64 = lambda data: base64.b64encode(data).decode()


def small_mark() -> str:
    """Isotipo YXJ reducido (los cofres lo muestran a ~60 px): WebP de 96 px en lugar del PNG de 230 KB."""
    from PIL import Image
    im = Image.open(ROOT / "public/brand/nova-yxj.png").convert("RGBA")
    im.thumbnail((112, 112), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=88, method=6)
    return "data:image/webp;base64," + b64(buf.getvalue())


MARK = small_mark()


def font_subset(name: str, weight: int, text: str) -> str:
    """Subconjunto de la letra (solo los caracteres de los banners) en un peso fijo, como data URI WOFF2."""
    f = TTFont(ROOT / f"src/fonts/{name}-latin-wght-normal.woff2")
    f = instancer.instantiateVariableFont(f, {"wght": weight})
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern"]
    sub = subset.Subsetter(opts)
    sub.populate(text=text)
    sub.subset(f)
    f.flavor = "woff2"
    buf = io.BytesIO()
    f.save(buf)
    return "data:font/woff2;base64," + b64(buf.getvalue())

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
                   else f'<image href="{MARK}" x="-14" y="-11.3" width="28" height="22.6"/>', s)
    for a, b in COLORS.items():
        s = re.sub(re.escape(a), b, s, flags=re.I)
    # Títulos (Arial Black) en Orbitron sin cursiva; textos en Inter.
    s = s.replace('font-family="Arial Black, Arial, Helvetica, sans-serif"', 'font-family="NovaOrbitron, sans-serif"')
    s = s.replace('font-family="Arial, Helvetica, sans-serif"', 'font-family="NovaInter, sans-serif"')
    s = s.replace('font-style="italic"', "")
    return s


ITEMS = [  # archivo de vanta, salida
    ("hero-bonus.svg", "hero-bonus"), ("hero-nequi.svg", "hero-nequi"), ("hero-pagos.svg", "hero-pagos"),
    ("hero-codigos.svg", "hero-codigos"), ("pasos-wide.svg", "pasos-wide"), ("garantia-wide.svg", "garantia-wide"),
    ("sinclaves-wide.svg", "sinclaves-wide"), ("codigos.svg", "codigos"), ("garantia.svg", "garantia"),
    ("soporte.svg", "soporte"),
    ("m/hero-bonus.svg", "m/hero-bonus"), ("m/hero-nequi.svg", "m/hero-nequi"), ("m/hero-pagos.svg", "m/hero-pagos"),
    ("m/hero-codigos.svg", "m/hero-codigos"), ("m/pasos.svg", "m/pasos"), ("m/garantia.svg", "m/garantia"),
    ("m/sinclaves.svg", "m/sinclaves"),
]

# Navidad de cristal (tercer argumento «navidad»): copos de cristal, nieve abajo y rayos dorados en el destello. Las luces
# ya cuelgan en la página, así que los banners no llevan más (solo el banner propio «Feliz Navidad»).
NAVIDAD = len(sys.argv) > 3 and sys.argv[3] == "navidad"
TEMP = ROOT / "public/temporada"
svg_uri = lambda name: "data:image/svg+xml;base64," + b64((TEMP / name).read_bytes())

XMAS_TEXT = {  # textos del banner «Feliz Navidad», a partir de hero-bonus
    ">FREE FIRE<": ">YXJ NOVA<",
    ">+10%<": ">FELIZ<",
    ">DE BONUS<": ">NAVIDAD<",
    ">EN TODOS LOS PAQUETES DE DIAMANTES<": ">REGALA DIAMANTES DIRECTO A SU ID<",
    ">RECARGA POR ID  →<": ">REGALAR  →<",
}


def flake(cx, cy, r, op):
    p = []
    for i in range(6):
        a = math.radians(i * 60 - 90)
        ex, ey = cx + math.cos(a) * r, cy + math.sin(a) * r
        p.append(f"M{cx:.1f} {cy:.1f}L{ex:.1f} {ey:.1f}")
        bx, by = cx + math.cos(a) * r * .55, cy + math.sin(a) * r * .55
        for sgn in (-1, 1):
            b = a + sgn * math.radians(40)
            p.append(f"M{bx:.1f} {by:.1f}L{bx + math.cos(b) * r * .3:.1f} {by + math.sin(b) * r * .3:.1f}")
    return f'<path d="{" ".join(p)}" stroke="#e9fbff" stroke-width="{max(r * .13, .8):.2f}" stroke-linecap="round" fill="none" opacity="{op:.2f}"/>'


def xmas_layer(w, h, hero, seed):
    """Capa navideña en SVG (en proporción al alto, así sirve en todos los tamaños)."""
    rnd = random.Random(seed)
    out = []
    for _ in range(14 if w > h else 10):
        out.append(flake(rnd.uniform(0, w), rnd.uniform(h * .05, h * .85), rnd.uniform(h * .012, h * .028), rnd.uniform(.35, .8)))
    # Nieve en el borde de abajo: montículo ondulado, más alto a la derecha (bajo el arte).
    base, d, x = h - h * .035, f"M0 {h}", 0.0
    d += f"L0 {base:.0f}"
    while x < w:
        nx = min(w, x + rnd.uniform(h * .12, h * .25))
        lift = h * (.01 + .05 * (nx / w)) + rnd.uniform(0, h * .015)
        d += f"Q{(x + nx) / 2:.0f} {base - lift:.0f} {nx:.0f} {base:.0f}"
        x = nx
    out.append(f'<path d="{d}L{w} {h}Z" fill="#eef8ff"/><path d="{d.replace(f"M0 {h}L0", "M0")}" stroke="#ffffff" stroke-width="{h * .006:.1f}" fill="none" opacity=".9"/>')
    if hero:
        wide = w > h * 2
        if wide:  # cable de luces solo en el banner propio de Navidad
            tile_h = h * .14
            tile_w = tile_h * 240 / 46
            n = math.ceil(w / tile_w)
            # Cada pieza se guarda una vez (defs) y se repite con <use>, así el archivo no crece con el ancho.
            for k, name in enumerate(("luces-cable.svg", "luces-1.svg", "luces-2.svg", "luces-3.svg")):
                out.append(f'<defs><image id="xl{k}" href="{svg_uri(name)}" width="{tile_w:.1f}" height="{tile_h:.1f}"/></defs>')
                out += [f'<use href="#xl{k}" x="{i * tile_w:.1f}" y="0"/>' for i in range(n)]
        sx, sy, ss = (w * .782, h * .02, h * .2) if wide else (w * .6, 0, h * .13)
        out.append(f'<image href="{svg_uri("estrella.svg")}" x="{sx - ss / 2:.0f}" y="{sy:.0f}" width="{ss:.0f}" height="{ss:.0f}"/>')
        out.append(f'<defs><image id="xesf" href="{svg_uri("esfera.svg")}" width="60" height="90"/></defs>')
        for fx, fh in ((.6, .34), (.66, .24), (.95, .3)) if wide else ((.3, .2), (.88, .24)):
            eh = h * fh
            out.append(f'<use href="#xesf" transform="translate({w * fx - eh / 3:.0f} {(h * .05 if wide else 0):.0f}) scale({eh / 90:.3f})"/>')
    return "".join(out)


def xmas_svg(s, hero):
    if hero:
        for a, b in XMAS_TEXT.items():
            s = s.replace(a, b)
        s = s.replace('fill="#29b6ff">FELIZ<', 'fill="#ffd36b">FELIZ<')
    # Rayos violeta del destello → dorados (luz de Navidad).
    return s.replace('stop-color="#a48bff"', 'stop-color="#ffd36b"').replace('stop-color="#6d4dff"', 'stop-color="#ffb72e"')


jobs = [(src, out, False) for src, out in ITEMS]
if NAVIDAD:
    jobs += [("hero-bonus.svg", "hero-navidad", True), ("m/hero-bonus.svg", "m/hero-navidad", True)]

# Primera pasada: convertir y juntar el texto para hacer un solo subconjunto de cada letra.
done = []
for i, (src, out, hero) in enumerate(jobs):
    s = (SRC / src).read_text(encoding="utf-8")
    w, h = (int(float(x)) for x in re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', s).groups())
    s = convert(s, w, h)
    if NAVIDAD:
        s = xmas_svg(s, hero)
        s = s.replace("</svg>", xmas_layer(w, h, hero, i) + "</svg>")
    done.append((out, s))

texts = "".join(re.sub(r"<[^>]+>", " ", s) for _, s in done) + "0123456789"
orb = font_subset("orbitron", 900, texts)
inter = font_subset("inter", 700, texts)
style = (f'<style>@font-face{{font-family:NovaOrbitron;src:url({orb}) format("woff2");font-weight:100 900}}'
         f'@font-face{{font-family:NovaInter;src:url({inter}) format("woff2");font-weight:100 900}}</style>')

total = 0
for out, s in done:
    s = re.sub(r"(<svg[^>]*>)", lambda m: m.group(1) + style, s, count=1)
    f = OUT / f"{out}.svg"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(s, encoding="utf-8")
    total += f.stat().st_size
print(len(done), "banners ·", total // 1024, "KB en total")
