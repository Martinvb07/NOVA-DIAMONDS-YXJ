"""Banners de NOVA DIAMONDS diseñados en HTML/CSS (letras de la tienda, logo, maquetas y diamantes facetados).

Cada banner tiene su diseño de escritorio y uno propio para celular (vertical, con márgenes amplios), así nada queda
cortado. Con «navidad» se generan además las versiones navideñas (copos de cristal, nieve y rayos dorados).

Uso: python3 scripts/banners-nova.py <carpeta de trabajo>
     node scripts/banners-nova.js <carpeta de trabajo>   → exporta a public/promo/nova2 (y /navidad) en WebP.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK, PUBLIC = Path(sys.argv[1]), ROOT / "public"
WORK.mkdir(parents=True, exist_ok=True)
A = lambda p: f"file://{PUBLIC / p}"

# ---------- Iconos (trazo, estilo lucide) ----------
ICON = {
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "arrow": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "id": '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4"/><path d="M14.5 10h4M14.5 13.5h3"/>',
    "card": '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 15h4"/>',
    "gem": '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>',
    "lock": '<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    "shield": '<path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z"/>',
    "zap": '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    "chat": '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"/>',
    "refund": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7.5v9M14.5 9.5c-.4-.9-1.4-1.4-2.5-1.4-1.4 0-2.5.8-2.5 1.9 0 2.6 5 1.4 5 4 0 1.1-1.1 2-2.5 2-1.2 0-2.2-.6-2.6-1.5"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/>',
    "tag": '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
}


def icon(name, size=24, stroke="currentColor", sw=2):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICON[name]}</svg>'


# ---------- Diamante facetado (talla brillante) ----------
_GEM_N = 0


def gem(w, extra_style=""):
    """Diamante con facetas en degradado, brillo especular y destello. Vectorial: nítido a cualquier tamaño."""
    global _GEM_N
    _GEM_N += 1
    g = f"g{_GEM_N}"
    gx = [8, 63, 100, 137, 192]  # cintura (y = 60)
    tx = [46, 82, 118, 154]  # mesa (y = 20)
    crown_fill = [f"url(#{g}c1)", f"url(#{g}c2)", f"url(#{g}c3)", f"url(#{g}c2)", f"url(#{g}c4)", f"url(#{g}c3)", f"url(#{g}c5)"]
    crown = [
        (gx[0], 60, tx[0], 20, gx[1], 60), (tx[0], 20, tx[1], 20, gx[1], 60), (gx[1], 60, tx[1], 20, gx[2], 60),
        (tx[1], 20, tx[2], 20, gx[2], 60), (gx[2], 60, tx[2], 20, gx[3], 60), (tx[2], 20, tx[3], 20, gx[3], 60),
        (gx[3], 60, tx[3], 20, gx[4], 60),
    ]
    pav_fill = [f"url(#{g}p1)", f"url(#{g}p2)", f"url(#{g}p3)", f"url(#{g}p4)", f"url(#{g}p5)", f"url(#{g}p6)"]
    px = [8, 45, 82, 118, 155, 192]
    pav = [(px[i], 60, px[i + 1], 60, 100, 172) for i in range(5)]
    polys = "".join(f'<polygon points="{a},{b} {c},{d} {e},{f}" fill="{crown_fill[i]}"/>' for i, (a, b, c, d, e, f) in enumerate(crown))
    polys += "".join(f'<polygon points="{a},{b} {c},{d} {e},{f}" fill="{pav_fill[i]}"/>' for i, (a, b, c, d, e, f) in enumerate(pav))
    lines = "".join(f'<path d="M{x} 60 L100 172"/>' for x in px[1:-1]) + "".join(f'<path d="M{a} {b} L{c} {d}"/>' for a, b, c, d, *_ in crown)
    return f'''<svg viewBox="0 0 200 180" width="{w}" style="overflow:visible;{extra_style}">
<defs>
 <linearGradient id="{g}c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b8ecff"/></linearGradient>
 <linearGradient id="{g}c2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9fbff"/><stop offset="1" stop-color="#7fd6ff"/></linearGradient>
 <linearGradient id="{g}c3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fe4ff"/><stop offset="1" stop-color="#3aa6ff"/></linearGradient>
 <linearGradient id="{g}c4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a5e2ff"/></linearGradient>
 <linearGradient id="{g}c5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5cbcff"/><stop offset="1" stop-color="#1f6fe6"/></linearGradient>
 <linearGradient id="{g}p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#3b9cff"/></linearGradient>
 <linearGradient id="{g}p2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#1f62e0"/></linearGradient>
 <linearGradient id="{g}p3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f8ff"/><stop offset="1" stop-color="#4a9dff"/></linearGradient>
 <linearGradient id="{g}p4" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f86ff"/><stop offset="1" stop-color="#2a3fd0"/></linearGradient>
 <linearGradient id="{g}p5" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c63e8"/><stop offset="1" stop-color="#2a1f9e"/></linearGradient>
 <linearGradient id="{g}sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
{polys}
<g stroke="#ffffff" stroke-opacity=".55" stroke-width=".8" fill="none">{lines}<path d="M8 60 H192"/></g>
<path d="M46 20 H154" stroke="#fff" stroke-width="1.6" stroke-opacity=".9"/>
<polygon points="30,60 46,20 60,20 44,60" fill="url(#{g}sh)" opacity=".55"/>
<polygon points="70,64 86,64 100,150 96,150" fill="#fff" opacity=".35"/>
<g transform="translate(160 22)"><path d="M0 -20 C2 -4 4 -2 20 0 C4 2 2 4 0 20 C-2 4 -4 2 -20 0 C-4 -2 -2 -4 0 -20Z" fill="#fff"/></g>
</svg>'''


CSS = f'''
@font-face{{font-family:Sora;src:url({(ROOT / "src/fonts/sora-latin-wght-normal.woff2").as_uri()});font-weight:100 900}}
@font-face{{font-family:Inter;src:url({(ROOT / "src/fonts/inter-latin-wght-normal.woff2").as_uri()});font-weight:100 900}}
@font-face{{font-family:Orbitron;src:url({(ROOT / "src/fonts/orbitron-latin-wght-normal.woff2").as_uri()});font-weight:400 900}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:#000}}
.b{{position:relative;overflow:hidden;font-family:Inter,sans-serif;color:#fff;-webkit-font-smoothing:antialiased;
  background:
    radial-gradient(55% 95% at var(--fx,76%) var(--fy,55%), rgba(46,160,255,.55), rgba(46,160,255,0) 62%),
    radial-gradient(35% 55% at 100% 0%, rgba(124,92,255,.35), rgba(124,92,255,0) 70%),
    radial-gradient(40% 70% at 0% 100%, rgba(20,80,200,.25), rgba(20,80,200,0) 70%),
    linear-gradient(112deg,#030716 0%,#06122f 42%,#0a2766 100%)}}
.rays{{position:absolute;inset:0;pointer-events:none;opacity:.55;
  background:repeating-linear-gradient(115deg, rgba(255,255,255,0) 0 140px, var(--ray,rgba(255,255,255,.035)) 140px 190px);
  -webkit-mask-image:radial-gradient(70% 90% at var(--fx,76%) 45%,#000 20%,transparent 75%)}}
.dots{{position:absolute;inset:0;pointer-events:none;opacity:.45;
  background-image:radial-gradient(rgba(150,210,255,.55) 1px,transparent 1.4px);background-size:26px 26px;
  -webkit-mask-image:radial-gradient(45% 70% at var(--fx,76%) 50%,#000 0%,transparent 75%)}}
.floor{{position:absolute;border-radius:50%;background:radial-gradient(closest-side,rgba(80,190,255,.65),rgba(80,190,255,0));filter:blur(6px)}}
.bokeh{{position:absolute;border-radius:50%;background:#8fdcff;filter:blur(1.5px);opacity:.7}}
.edge{{position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,transparent,#3fc1ff 30%,#6b5cff 70%,transparent)}}
.logo{{display:block}}
.chip{{display:inline-flex;align-items:center;gap:.55em;border-radius:99px;padding:.55em 1.1em .55em .8em;font-family:Orbitron,sans-serif;font-weight:800;
  letter-spacing:.14em;color:#bff3ff;background:rgba(94,231,255,.08);border:1px solid rgba(94,231,255,.35)}}
h1{{font-family:Sora,sans-serif;font-weight:800;text-wrap:balance;letter-spacing:-.025em;line-height:1.02}}
h1 .a{{background:linear-gradient(92deg,#a5f3ff 0%,#3cc0ff 55%,#4f8dff 100%);-webkit-background-clip:text;background-clip:text;color:transparent}}
.sub{{color:#bccbe8;font-weight:500;line-height:1.4}}
.cta{{display:inline-flex;align-items:center;gap:.55em;border-radius:.75em;font-weight:700;color:#fff;
  background:linear-gradient(180deg,#43c0ff 0%,#1a78ee 100%);box-shadow:0 .6em 1.6em -.5em rgba(41,168,255,.75),inset 0 1px 0 rgba(255,255,255,.4)}}
.pills{{display:flex;flex-wrap:wrap;gap:.6em}}
.pill{{display:inline-flex;align-items:center;gap:.45em;border-radius:99px;padding:.45em .9em .45em .6em;background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.12);color:#dbe7fb;font-weight:600}}
.pill i{{display:grid;place-items:center;width:1.35em;height:1.35em;border-radius:50%;background:rgba(69,217,155,.18);color:#4fe0a6}}
.glass{{background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.16);
  box-shadow:0 30px 60px -20px rgba(0,8,40,.85),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(14px)}}
.white{{background:#fff;color:#0b1530;box-shadow:0 30px 60px -18px rgba(0,8,40,.9)}}
.gemfx{{filter:drop-shadow(0 0 28px rgba(90,200,255,.55)) drop-shadow(0 34px 30px rgba(0,10,60,.75))}}
.gold{{background:linear-gradient(160deg,#fff1b3 0%,#ffd04a 45%,#f2a516 100%);color:#3a2300;
  box-shadow:0 18px 36px -12px rgba(255,170,30,.6),inset 0 2px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(160,90,0,.35)}}
.num{{font-family:Sora,sans-serif;font-weight:800}}
.mono{{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace}}
'''

EYEBROW = "NOVA DIAMONDS"


MARK = A("brand/nova-yxj.png")
T = lambda n: A(f"temporada/{n}")
NAVIDAD = False  # se cambia en la segunda pasada (versiones navideñas)


def xmas_layer(w, h, hero):
    """Copos de cristal, nieve abajo y, en «Feliz Navidad», luces, estrella y esferas (proporcional al alto)."""
    snow = round(h * .085)
    out = (f'<div style="position:absolute;inset:0;pointer-events:none;background:url({T("nieve-a.svg")}) 0 0/{round(h * 1.1)}px,'
           f'url({T("nieve-b.svg")}) 30% 20%/{round(h * 1.6)}px;opacity:.75"></div>'
           f'<div style="position:absolute;left:0;right:0;bottom:-1px;height:{snow}px;transform:scaleY(-1);'
           f'background:url({T("nieve-borde.svg")}) 0 0/{round(snow * 18)}px 100% repeat-x"></div>')
    if hero:
        lights = round(h * (.13 if w > h else .09))
        out += (f'<div style="position:absolute;left:0;right:0;top:0;height:{lights}px;background:url({T("luces-1.svg")}) 0 0/auto 100% repeat-x,'
                f'url({T("luces-2.svg")}) 0 0/auto 100% repeat-x,url({T("luces-3.svg")}) 0 0/auto 100% repeat-x,url({T("luces-cable.svg")}) 0 0/auto 100% repeat-x"></div>')
    return out


def page(w, h, inner, fx="76%", fy="55%", hero_xmas=False):
    """Fondo azul noche con destello, el YXJ en grafiti como marca de agua (identidad) y el contenido encima."""
    wide = w > h * 1.6
    wm = (f'<img src="{MARK}" style="position:absolute;right:{-w * .04:.0f}px;top:{h * .02:.0f}px;height:{h * 1.05:.0f}px;opacity:.07;transform:rotate(-8deg);filter:blur(.5px)">'
          if wide else f'<img src="{MARK}" style="position:absolute;right:{-w * .1:.0f}px;top:{-h * .04:.0f}px;width:{w * .9:.0f}px;opacity:.07;transform:rotate(-8deg)">')
    extra = xmas_layer(w, h, hero_xmas) if NAVIDAD else ""
    gold = "--ray:rgba(255,211,107,.5);" if NAVIDAD else ""
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="b" id="b" style="width:{w}px;height:{h}px;--fx:{fx};--fy:{fy};{gold}">{wm}<div class="rays"></div><div class="dots"></div>{inner}{extra}<div class="edge"></div></div>
</body></html>'''


def bokeh(points):
    return "".join(f'<span class="bokeh" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px;opacity:{o}"></span>' for x, y, s, o in points)


def copy_block(x, y, w, logo_h, title, title_size, sub, sub_size, cta=None, cta_size=19, pills=None, pill_size=15, gap=1.0):
    parts = [f'<span class="chip" style="font-size:{logo_h * .36:.0f}px"><img src="{MARK}" style="height:1.9em;margin:-.45em .1em -.45em -.2em">{EYEBROW}</span>']
    parts.append(f'<h1 style="font-size:{title_size}px;margin-top:{int(logo_h * .35 * gap)}px">{title}</h1>')
    if sub:
        parts.append(f'<p class="sub" style="font-size:{sub_size}px;margin-top:{int(sub_size * .7)}px;max-width:{w}px">{sub}</p>')
    if cta:
        parts.append(f'<div style="margin-top:{int(cta_size * 1.4)}px"><span class="cta" style="font-size:{cta_size}px;padding:.78em 1.25em">{cta} {icon("arrow", int(cta_size * 1.05), sw=2.5)}</span></div>')
    if pills:
        parts.append(f'<div class="pills" style="font-size:{pill_size}px;margin-top:{int(pill_size * 1.6)}px">' + "".join(f'<span class="pill"><i>{icon("check", int(pill_size * .85), sw=3)}</i>{p}</span>' for p in pills) + "</div>")
    return f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px">{"".join(parts)}</div>'


def at(x, y, inner, extra=""):
    return f'<div style="position:absolute;left:{x}px;top:{y}px;{extra}">{inner}</div>'


# ---------- Arte de cada banner (escala k) ----------

def art_bonus(cx, cy, k):
    return (f'<div class="floor" style="left:{cx - 230 * k}px;top:{cy + 120 * k}px;width:{460 * k}px;height:{70 * k}px"></div>'
            + at(cx - 280 * k, cy - 20 * k, gem(110 * k, "filter:blur(1.5px) drop-shadow(0 0 20px rgba(90,200,255,.45));transform:rotate(-16deg);opacity:.85"))
            + at(cx + 150 * k, cy - 150 * k, gem(90 * k, "filter:blur(2px) drop-shadow(0 0 18px rgba(90,200,255,.4));transform:rotate(14deg);opacity:.75"))
            + at(cx - 165 * k, cy - 150 * k, f'<div class="gemfx">{gem(330 * k)}</div>')
            + at(cx + 95 * k, cy + 40 * k, f'<div class="gold" style="transform:rotate(-8deg);border-radius:{22 * k}px;padding:{14 * k}px {22 * k}px {12 * k}px;text-align:center">'
                 f'<div class="num" style="font-size:{58 * k}px;line-height:1;letter-spacing:-.03em">+10%</div><div style="font-weight:800;font-size:{17 * k}px;letter-spacing:.22em;margin-top:{4 * k}px">BONUS</div></div>'))


def phone_screen(k, title, logo, rows, amount, status):
    rws = "".join(f'<div style="display:flex;justify-content:space-between;font-size:{13 * k}px;color:#5a6785;padding:{7 * k}px 0;border-bottom:1px solid #edf0f6"><span>{a}</span><b style="color:#0b1530">{b}</b></div>' for a, b in rows)
    return (f'<div style="width:{250 * k}px;height:{500 * k}px;border-radius:{40 * k}px;background:#0a0f1d;padding:{9 * k}px;box-shadow:0 40px 70px -20px rgba(0,6,30,.95),0 0 0 {1.5 * k}px rgba(255,255,255,.18),inset 0 0 0 {1.5 * k}px #1b2236">'
            f'<div style="position:relative;width:100%;height:100%;border-radius:{32 * k}px;background:#f5f7fb;overflow:hidden;padding:{40 * k}px {18 * k}px {18 * k}px">'
            f'<div style="position:absolute;top:{10 * k}px;left:50%;transform:translateX(-50%);width:{80 * k}px;height:{22 * k}px;border-radius:99px;background:#0a0f1d"></div>'
            f'<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-weight:700;font-size:{15 * k}px;color:#0b1530">{title}</span>{logo}</div>'
            f'<div style="margin-top:{16 * k}px;background:#fff;border-radius:{16 * k}px;padding:{14 * k}px;box-shadow:0 4px 14px rgba(15,30,80,.08)">'
            f'<div style="font-size:{12 * k}px;color:#6b7896">Total a pagar</div><div class="num" style="font-size:{30 * k}px;color:#0b1530;margin-top:{2 * k}px">{amount}</div>{rws}</div>'
            f'<div style="margin-top:{18 * k}px;display:flex;flex-direction:column;align-items:center;text-align:center">'
            f'<div style="display:grid;place-items:center;width:{62 * k}px;height:{62 * k}px;border-radius:50%;background:#22c58b;color:#fff;box-shadow:0 10px 24px -8px rgba(34,197,139,.8)">{icon("check", int(32 * k), sw=3)}</div>'
            f'<div style="margin-top:{10 * k}px;font-weight:800;font-size:{17 * k}px;color:#0b1530">{status}</div>'
            f'<div style="font-size:{12 * k}px;color:#6b7896;margin-top:{3 * k}px">Tus diamantes van en camino</div></div>'
            f'</div></div>')


def art_nequi(cx, cy, k):
    nequi = f'<img src="{A("pagos/nequi.svg")}" style="height:{16 * k}px">'
    pk = k * .8
    nequi = f'<img src="{A("pagos/nequi.svg")}" style="height:{16 * pk}px">'
    screen = phone_screen(pk, "Pagar", nequi, [("Paquete", "520 + 52 💎"), ("ID de jugador", "123456789")], "$ 15.999", "Pago aprobado")
    return (f'<div class="floor" style="left:{cx - 200 * k}px;top:{cy + 200 * k}px;width:{400 * k}px;height:{60 * k}px"></div>'
            + at(cx - 100 * k, cy - 205 * k, f'<div style="transform:perspective({1400 * k}px) rotateY(-16deg) rotateX(4deg) rotate(3deg)">{screen}</div>')
            + at(cx + 115 * k, cy - 170 * k, f'<div class="gemfx">{gem(120 * k)}</div>')
            + at(cx - 250 * k, cy + 60 * k, gem(70 * k, "filter:blur(1.5px) drop-shadow(0 0 16px rgba(90,200,255,.5));transform:rotate(-14deg)")))


def logo_tile(src, k, w=170, h=104, pad=22, extra=""):
    return (f'<div class="white" style="width:{w * k}px;height:{h * k}px;border-radius:{20 * k}px;display:grid;place-items:center;padding:{pad * k}px;{extra}">'
            f'<img src="{src}" style="display:block;width:{(w - 2 * pad) * k:.0f}px;height:{(h - 2 * pad) * k:.0f}px;object-fit:contain"></div>')


def art_pagos(cx, cy, k):
    tiles = [
        ("pagos/nequi.svg", -250, -150, -8), ("pagos/pse.jpg", -40, -190, 4), ("pagos/bancolombia.svg", 160, -130, 7),
        ("pagos/visa.svg", -170, 10, -4), ("pagos/mastercard.svg", 40, 30, 5),
    ]
    out = f'<div class="floor" style="left:{cx - 260 * k}px;top:{cy + 150 * k}px;width:{520 * k}px;height:{70 * k}px"></div>'
    for src, dx, dy, rot in tiles:
        out += at(cx + dx * k, cy + dy * k, logo_tile(A(src), k, extra=f"transform:rotate({rot}deg)"))
    out += at(cx - 360 * k, cy + 10 * k, f'<div class="gemfx">{gem(110 * k, "transform:rotate(-10deg)")}</div>')
    return out


def code_card(k, w=400):
    return (f'<div class="white" style="width:{w * k}px;border-radius:{22 * k}px;padding:{22 * k}px">'
            f'<div style="font-size:{14 * k}px;font-weight:700;color:#0b1530">Código promocional</div>'
            f'<div style="display:flex;gap:{10 * k}px;margin-top:{12 * k}px">'
            f'<div class="mono" style="flex:1;display:flex;align-items:center;height:{52 * k}px;padding:0 {16 * k}px;border-radius:{12 * k}px;border:{2 * k}px solid #2a8dff;font-size:{20 * k}px;font-weight:700;letter-spacing:.12em;color:#0b1530">NOVA10</div>'
            f'<div style="display:grid;place-items:center;height:{52 * k}px;padding:0 {20 * k}px;border-radius:{12 * k}px;background:#1a78ee;color:#fff;font-weight:700;font-size:{15 * k}px">Aplicar</div></div>'
            f'<div style="display:flex;align-items:center;justify-content:space-between;margin-top:{14 * k}px;padding:{11 * k}px {14 * k}px;border-radius:{12 * k}px;background:#e8f8f0;color:#118a5c;font-size:{14 * k}px;font-weight:700">'
            f'<span style="display:flex;align-items:center;gap:{8 * k}px">{icon("check", int(16 * k), sw=3)} Descuento aplicado</span><span>−10%</span></div>'
            f'<div style="display:flex;justify-content:space-between;margin-top:{14 * k}px;font-size:{14 * k}px;color:#6b7896"><span>Total</span>'
            f'<span><s style="margin-right:{8 * k}px">$ 15.999</s><b class="num" style="color:#0b1530;font-size:{18 * k}px">$ 14.399</b></span></div></div>')


def art_codigos(cx, cy, k):
    tag = (f'<div class="gold" style="display:flex;align-items:center;gap:{10 * k}px;border-radius:{16 * k}px;padding:{12 * k}px {18 * k}px;transform:rotate(-10deg)">'
           f'{icon("tag", int(26 * k), sw=2.4)}<span class="num" style="font-size:{30 * k}px;letter-spacing:-.02em">−10%</span></div>')
    return (f'<div class="floor" style="left:{cx - 230 * k}px;top:{cy + 150 * k}px;width:{460 * k}px;height:{60 * k}px"></div>'
            + at(cx - 200 * k, cy - 130 * k, f'<div style="transform:perspective({1400 * k}px) rotateY(-12deg) rotateX(4deg)">{code_card(k)}</div>')
            + at(cx + 120 * k, cy - 200 * k, tag)
            + at(cx - 280 * k, cy + 90 * k, f'<div class="gemfx">{gem(100 * k, "transform:rotate(-12deg)")}</div>'))


def step_card(k, n, ic, title, text, w=232):
    return (f'<div class="glass" style="width:{w * k}px;height:{214 * k}px;border-radius:{22 * k}px;padding:{22 * k}px {20 * k}px">'
            f'<div style="display:flex;align-items:center;justify-content:space-between">'
            f'<div style="display:grid;place-items:center;width:{54 * k}px;height:{54 * k}px;border-radius:{16 * k}px;background:linear-gradient(160deg,#4cc6ff,#1a6fe6);box-shadow:0 10px 24px -8px rgba(41,168,255,.8)">{icon(ic, int(28 * k), "#fff", 2.2)}</div>'
            f'<span class="num" style="font-size:{40 * k}px;color:rgba(255,255,255,.14)">0{n}</span></div>'
            f'<div style="margin-top:{18 * k}px;font-family:Sora;font-weight:700;font-size:{21 * k}px">{title}</div>'
            f'<div style="margin-top:{6 * k}px;font-size:{14.5 * k}px;color:#b6c5e3;line-height:1.4">{text}</div></div>')


STEPS = [("id", "Pon tu ID", "Verificamos tu cuenta y región antes de pagar."), ("card", "Paga en pesos", "Nequi, PSE, Bancolombia o tarjeta."), ("gem", "Recíbelos ya", "Directo a tu cuenta de Free Fire, en minutos.")]


def shield_art(k, size=250, mark="check"):
    g = f"sh{size}{mark}"
    inner = {"check": '<path d="M70 104 l22 22 l42 -46" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>',
             "lock": '<rect x="74" y="92" width="52" height="42" rx="9" fill="#fff"/><path d="M86 92 v-12 a14 14 0 0 1 28 0 v12" fill="none" stroke="#fff" stroke-width="9"/><circle cx="100" cy="112" r="6" fill="#1a6fe6"/>',
             "refund": '<text x="100" y="134" text-anchor="middle" font-family="Sora" font-weight="800" font-size="74" fill="#fff">$</text>'}[mark]
    return f'''<svg viewBox="0 0 200 220" width="{size * k}" style="overflow:visible;filter:drop-shadow(0 0 30px rgba(80,190,255,.5)) drop-shadow(0 30px 30px rgba(0,8,50,.8))">
<defs><linearGradient id="{g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fe3ff"/><stop offset=".5" stop-color="#2a8dff"/><stop offset="1" stop-color="#3a2bd6"/></linearGradient>
<linearGradient id="{g}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<path d="M100 8 L182 38 V100 C182 158 140 196 100 212 C60 196 18 158 18 100 V38Z" fill="url(#{g}a)" stroke="#bff0ff" stroke-width="3"/>
<path d="M100 22 L168 47 V100 C168 150 133 182 100 196 C67 182 32 150 32 100 V47Z" fill="#0b2f8a" opacity=".35"/>
<path d="M100 8 L182 38 V70 C140 60 60 60 18 90 V38Z" fill="url(#{g}b)"/>
{inner}</svg>'''


def art_garantia(cx, cy, k):
    return (f'<div class="floor" style="left:{cx - 200 * k}px;top:{cy + 110 * k}px;width:{400 * k}px;height:{60 * k}px"></div>'
            + at(cx - 110 * k, cy - 125 * k, shield_art(k, 220, "refund"))
            + at(cx + 110 * k, cy - 120 * k, f'<div class="glass" style="border-radius:{16 * k}px;padding:{12 * k}px {16 * k}px;font-size:{15 * k}px;font-weight:700;display:flex;align-items:center;gap:{8 * k}px"><span style="color:#4fe0a6">{icon("refund", int(20 * k), sw=2.2)}</span>Reembolso total</div>')
            + at(cx - 280 * k, cy + 30 * k, f'<div class="glass" style="border-radius:{16 * k}px;padding:{12 * k}px {16 * k}px;font-size:{15 * k}px;font-weight:700;display:flex;align-items:center;gap:{8 * k}px"><span style="color:#4fe0a6">{icon("shield", int(20 * k), sw=2.2)}</span>Pago protegido</div>'))


def id_card(k, w=420):
    return (f'<div class="white" style="width:{w * k}px;border-radius:{22 * k}px;padding:{22 * k}px">'
            f'<div style="font-size:{14 * k}px;font-weight:700;color:#0b1530">ID de jugador</div>'
            f'<div class="mono" style="display:flex;align-items:center;justify-content:space-between;margin-top:{10 * k}px;height:{54 * k}px;padding:0 {16 * k}px;border-radius:{12 * k}px;border:{2 * k}px solid #22c58b;font-size:{21 * k}px;font-weight:700;letter-spacing:.08em;color:#0b1530">123456789<span style="color:#22c58b">{icon("check", int(22 * k), sw=3)}</span></div>'
            f'<div style="display:flex;align-items:center;gap:{12 * k}px;margin-top:{14 * k}px;padding:{12 * k}px;border-radius:{14 * k}px;background:#f2f6fd">'
            f'<div style="display:grid;place-items:center;width:{44 * k}px;height:{44 * k}px;border-radius:50%;background:linear-gradient(160deg,#4cc6ff,#1a6fe6);color:#fff">{icon("user", int(22 * k), "#fff", 2.2)}</div>'
            f'<div><div style="font-weight:800;font-size:{16 * k}px;color:#0b1530">NovaPlayer_YXJ</div><div style="font-size:{13 * k}px;color:#5a6785">Cuenta verificada · Región Colombia</div></div></div>'
            f'<div style="display:flex;align-items:center;gap:{8 * k}px;margin-top:{12 * k}px;font-size:{13 * k}px;color:#5a6785">{icon("lock", int(15 * k), "#5a6785", 2.2)} No pedimos contraseña</div></div>')


def art_sinclaves(cx, cy, k):
    return (f'<div class="floor" style="left:{cx - 230 * k}px;top:{cy + 140 * k}px;width:{460 * k}px;height:{60 * k}px"></div>'
            + at(cx - 210 * k, cy - 135 * k, f'<div style="transform:perspective({1400 * k}px) rotateY(-12deg) rotateX(4deg)">{id_card(k)}</div>')
            + at(cx + 175 * k, cy - 165 * k, shield_art(k, 105, "lock")))


def chat_card(k, w=420):
    def bubble(text, me):
        side = "flex-end" if me else "flex-start"
        bg = "#1a78ee;color:#fff" if me else "#f0f3f9;color:#0b1530"
        return f'<div style="display:flex;justify-content:{side};margin-top:{10 * k}px"><div style="max-width:78%;padding:{10 * k}px {14 * k}px;border-radius:{16 * k}px;background:{bg};font-size:{14.5 * k}px;line-height:1.35">{text}</div></div>'
    return (f'<div class="white" style="width:{w * k}px;border-radius:{22 * k}px;padding:{18 * k}px {18 * k}px {20 * k}px">'
            f'<div style="display:flex;align-items:center;gap:{10 * k}px;padding-bottom:{12 * k}px;border-bottom:1px solid #edf0f6">'
            f'<div style="display:grid;place-items:center;width:{40 * k}px;height:{40 * k}px;border-radius:50%;background:linear-gradient(160deg,#4cc6ff,#1a6fe6)">{icon("chat", int(20 * k), "#fff", 2.2)}</div>'
            f'<div><div style="font-weight:800;font-size:{15 * k}px;color:#0b1530">Soporte Nova</div><div style="font-size:{12 * k}px;color:#22c58b;font-weight:700">● En línea</div></div></div>'
            + bubble("Hola, ¿en qué va mi pedido VX-4821?", True)
            + bubble("¡Hola! Ya se entregó: 520 + 52 diamantes a tu ID 💎", False)
            + bubble("¡Gracias! 🙌", True) + "</div>")


def art_soporte(cx, cy, k):
    return (f'<div class="floor" style="left:{cx - 230 * k}px;top:{cy + 160 * k}px;width:{460 * k}px;height:{60 * k}px"></div>'
            + at(cx - 210 * k, cy - 150 * k, f'<div style="transform:perspective({1400 * k}px) rotateY(-12deg) rotateX(4deg)">{chat_card(k)}</div>')
            + at(cx + 165 * k, cy - 205 * k, f'<div class="gemfx">{gem(100 * k, "transform:rotate(12deg)")}</div>'))


def art_pasos(x, cy, k, w=232, gap=24):
    out = ""
    for i, (ic, t, tx) in enumerate(STEPS):
        out += at(x + i * (w + gap) * k, cy, step_card(k, i + 1, ic, t, tx, w))
    return out


# ---------- Banners ----------
items = []


def add(name, w, h, html, out):
    (WORK / f"{name}.html").write_text(html, encoding="utf-8")
    items.append({"name": name, "w": w, "h": h, "out": out})


def stack_m(w, h, art, title, size, sub, sub_size, cta=None, pills=None, art_k=.62, art_y=.33):
    """Diseño de celular: arte arriba al centro y texto abajo, con 7 % de margen en todos los lados."""
    m = round(w * .07)
    return art(w / 2, h * art_y, art_k) + copy_block(m, round(h * (.5 if h > w * .7 else .44)), w - 2 * m, round(h * .052), title, size, sub, sub_size, cta, round(size * .38), pills=pills, pill_size=round(sub_size * .82), gap=.7)


BK = [(1040, 90, 6, .7), (1530, 70, 4, .6), (1490, 400, 5, .5), (980, 380, 3, .6), (1180, 40, 3, .5)]
HEROES = {
    "hero-bonus": dict(title='<span class="a">+10% de bonus</span><br>en cada recarga', sub="Todos los paquetes de diamantes incluyen bonus. Directo a tu ID de Free Fire.", msub="Todos los paquetes incluyen bonus.", cta="Recargar ahora", art=art_bonus),
    "hero-nequi": dict(title='Paga con <span class="a">Nequi</span><br>en segundos', sub="Desde tu celular y en pesos. Tus diamantes llegan apenas se aprueba el pago.", msub="Desde tu celular y en pesos.", cta="Recargar ahora", art=art_nequi),
    "hero-pagos": dict(title='Paga <span class="a">como quieras</span>', sub="Nequi, PSE, Bancolombia, débito o crédito. Pago seguro y en pesos colombianos.", msub="Nequi, PSE, Bancolombia o tarjeta.", cta="Ver paquetes", art=art_pagos),
    "hero-codigos": dict(title='¿Tienes un<br><span class="a">código?</span>', sub="Escríbelo al pagar y ve tu descuento al instante, antes de confirmar.", msub="Escríbelo al pagar y ve tu descuento.", cta="Usar mi código", art=art_codigos),
}
# Tamaño y altura del arte en el diseño de celular (cada arte tiene otra forma).
MOBILE_ART = {"art_bonus": (.9, .25), "art_nequi": (.68, .31), "art_pagos": (.78, .3), "art_codigos": (.8, .28)}
NAVIDAD_HERO = dict(title='<span class="a" style="background-image:linear-gradient(92deg,#fff3c9,#ffd36b 50%,#ffb72e)">Feliz Navidad</span><br>regala diamantes', sub="Recarga directo al ID de quien quieras: llega en minutos y con bonus.", msub="Directo a su ID, en minutos y con bonus.", cta="Regalar ahora", art=art_bonus)


def build(navidad: bool):
    global NAVIDAD, EYEBROW
    NAVIDAD = navidad
    base = "promo/nova2/navidad" if navidad else "promo/nova2"
    tag = "x-" if navidad else ""
    heroes = dict(HEROES, **({"hero-navidad": NAVIDAD_HERO} if navidad else {}))
    for name, c in heroes.items():
        EYEBROW = "FELIZ NAVIDAD" if name == "hero-navidad" else "NOVA DIAMONDS"
        x = name == "hero-navidad"
        inner = bokeh(BK) + c["art"](1220, 250, 1.0) + copy_block(80, 70, 640, 44, c["title"], 62, c["sub"], 20, c["cta"], 18)
        add(f"{tag}{name}", 1600, 480, page(1600, 480, inner, hero_xmas=x), f"{base}/{name}.webp")
        mk, my = MOBILE_ART.get(c["art"].__name__, (.82, .28))
        inner = bokeh([(620, 40, 5, .6), (90, 560, 4, .5)]) + stack_m(800, 600, c["art"], c["title"], 50, c["msub"], 20, c["cta"], art_k=mk, art_y=my)
        add(f"{tag}m-{name}", 800, 600, page(800, 600, inner, "50%", "30%", hero_xmas=x), f"{base}/m/{name}.webp")
    EYEBROW = "NOVA DIAMONDS"
    # Recarga en 3 pasos
    inner = bokeh(BK) + art_pasos(760, 93, 1.0) + copy_block(80, 62, 560, 42, 'Recarga en<br><span class="a">3 pasos</span>', 54, "Sin contraseñas: solo necesitamos tu ID de jugador.", 19)
    add(f"{tag}pasos-wide", 1600, 400, page(1600, 400, inner, "70%", "50%"), f"{base}/pasos-wide.webp")
    inner = bokeh([(700, 40, 4, .6)]) + copy_block(56, 40, 688, 34, 'Recarga en <span class="a">3 pasos</span>', 44, None, 0, gap=.7) + art_pasos(48, 190, 1.0, 220, 12)
    add(f"{tag}m-pasos", 800, 520, page(800, 520, inner, "50%", "70%"), f"{base}/m/pasos.webp")
    strips = {
        "garantia": dict(title='Si la entrega falla,<br><span class="a">te devolvemos tu dinero</span>', sub=None, pills=["Pago verificado", "Sin contraseñas", "Soporte real"], art=art_garantia, cx=1280,
                         mtitle='Si falla, <span class="a">te devolvemos</span>', mk=.9),
        "sinclaves": dict(title='Solo tu ID.<br><span class="a">Cero contraseñas.</span>', sub="Nunca te pedimos la clave de tu cuenta ni de Facebook.", pills=None, art=art_sinclaves, cx=1250,
                          mtitle='Solo tu ID. <span class="a">Cero claves.</span>', mk=.82),
    }
    for name, c in strips.items():
        inner = bokeh(BK) + c["art"](c["cx"], 200, .95) + copy_block(80, 62, 680, 42, c["title"], 50, c["sub"], 19, pills=c["pills"], pill_size=15)
        add(f"{tag}{name}-wide", 1600, 400, page(1600, 400, inner, "78%", "50%"), f"{base}/{name}-wide.webp")
        inner = bokeh([(700, 40, 4, .6)]) + c["art"](400, 165, c["mk"]) + copy_block(56, 330, 688, 30, c["mtitle"], 44, None, 0, pills=c["pills"] and c["pills"][:2], pill_size=16, gap=.6)
        add(f"{tag}m-{name}", 800, 520, page(800, 520, inner, "50%", "35%"), f"{base}/m/{name}.webp")
    sides = {
        "codigos": dict(title='¿Tienes un<br><span class="a">código?</span>', cta="Usar código", art=art_codigos),
        "garantia": dict(title='<span class="a">Reembolso</span><br>garantizado', cta="Ver política", art=art_garantia),
        "soporte": dict(title='Soporte<br><span class="a">de verdad</span>', cta="Ir a ayuda", art=art_soporte),
    }
    for name, c in sides.items():
        # Se muestran angostos (columna lateral, ~360 px): texto grande, sin subtítulo, arte grande a la derecha.
        inner = bokeh([(1100, 60, 5, .6), (90, 560, 4, .5)]) + c["art"](820, 420, 1.0) + copy_block(72, 64, 760, 58, c["title"], 104, None, 0, c["cta"], 34)
        add(f"{tag}side-{name}", 1200, 630, page(1200, 630, inner, "72%", "55%"), f"{base}/{name}.webp")


build(False)
build(True)
(WORK / "lista.json").write_text(json.dumps(items, indent=1), encoding="utf-8")
print(len(items), "banners")
