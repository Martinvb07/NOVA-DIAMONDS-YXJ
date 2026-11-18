"""Piezas de la Navidad de NOVA DIAMONDS («Navidad de cristal»): copos como cristales, luces en los colores de la marca,
aurora y colinas nevadas con pinos de hielo. Uso: python3 scripts/temporada-nova.py public/temporada"""
import math, random, sys
from pathlib import Path
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)

def flake(cx, cy, r, color="#e9fbff", sw=None, op=1):
    """Copo de nieve de 6 brazos con ramitas (cristal)."""
    sw = sw or max(r * .12, .6)
    p = []
    for i in range(6):
        a = math.radians(i * 60 - 90)
        ex, ey = cx + math.cos(a) * r, cy + math.sin(a) * r
        p.append(f"M{cx:.1f} {cy:.1f}L{ex:.1f} {ey:.1f}")
        for k in (.45, .7):
            bx, by = cx + math.cos(a) * r * k, cy + math.sin(a) * r * k
            for s in (-1, 1):
                b = a + s * math.radians(40)
                l = r * (.32 if k == .45 else .22)
                p.append(f"M{bx:.1f} {by:.1f}L{bx + math.cos(b) * l:.1f} {by + math.sin(b) * l:.1f}")
    return f'<path d="{" ".join(p)}" stroke="{color}" stroke-width="{sw:.2f}" stroke-linecap="round" fill="none" opacity="{op}"/>'

def write(name, w, h, body, defs="", stretch=False):
    par = ' preserveAspectRatio="none"' if stretch else ""
    (OUT / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"{par}>{defs}{body}</svg>\n')

# Nieve: dos capas que se repiten (copos de cristal + puntos), para animar en globals.css.
for name, size, n, seed, rr in (("nieve-a.svg", 560, 26, 3, (2.5, 6)), ("nieve-b.svg", 800, 20, 9, (4, 9))):
    rnd = random.Random(seed); b = []
    for _ in range(n):
        x, y = rnd.uniform(0, size), rnd.uniform(0, size)
        if rnd.random() < .55:
            b.append(flake(x, y, rnd.uniform(*rr), rnd.choice(["#ffffff", "#c7ecff", "#9fe9ff"]), op=round(rnd.uniform(.55, .95), 2)))
        else:
            b.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(1.2, 2.6):.1f}" fill="#eaf8ff" opacity="{rnd.uniform(.5, .9):.2f}"/>')
    write(name, size, size, "".join(b))

# Luces: cable que cuelga en ondas y bombillos de cristal (cian, violeta, dorado, blanco); 3 capas que titilan por turnos.
W, H = 240, 46
wire = f'<path d="M0 6 Q60 30 120 6 T240 6" stroke="#1b2a52" stroke-width="2.4" fill="none"/>'
write("luces-cable.svg", W, H, wire)
cols = [("#5ee7ff", "#c9f7ff"), ("#a48bff", "#e3dcff"), ("#ffd36b", "#fff3c9"), ("#ffffff", "#ffffff"), ("#29a8ff", "#bfe6ff"), ("#ff7ab6", "#ffd6e8")]
def bulb_at(t):
    x = t * W; u = (x % 120) / 120; y = 6 + 48 * u * (1 - u)
    return x, y
for layer in range(3):
    b = []
    for i in range(8):
        if i % 3 != layer: continue
        x, y = bulb_at((i + .5) / 8)
        c, hi = cols[i % len(cols)]
        b.append(f'<circle cx="{x:.1f}" cy="{y + 9:.1f}" r="9" fill="{c}" opacity=".35"/>'
                 f'<rect x="{x - 2.6:.1f}" y="{y:.1f}" width="5.2" height="4" rx="1" fill="#2c3756"/>'
                 f'<path d="M{x:.1f} {y + 3:.1f} C{x + 5.5:.1f} {y + 6:.1f} {x + 5:.1f} {y + 13:.1f} {x:.1f} {y + 15:.1f} C{x - 5:.1f} {y + 13:.1f} {x - 5.5:.1f} {y + 6:.1f} {x:.1f} {y + 3:.1f}Z" fill="{c}"/>'
                 f'<path d="M{x - 1.6:.1f} {y + 6:.1f} q-1 3 0 5" stroke="{hi}" stroke-width="1.3" fill="none" stroke-linecap="round"/>')
    write(f"luces-{layer + 1}.svg", W, H, "".join(b))

# Borde de nieve escarchada (para tarjetas, banners propios y el pie): capa blanca con gotitas de hielo.
rnd = random.Random(5); d = "M0 0H400V7"; x = 400
while x > 0:
    w = rnd.uniform(14, 30); x2 = max(0, x - w); depth = rnd.uniform(9, 16)
    d += f"Q{(x + x2) / 2:.0f} {depth:.0f} {x2:.0f} 7"; x = x2
d += "Z"
icicles = "".join(f'<path d="M{x:.0f} 8 l3 {rnd.uniform(5, 11):.0f} l3 -{rnd.uniform(5, 11) - 2:.0f}Z" fill="#c7ecff" opacity=".85"/>' for x in range(12, 400, 37))
write("nieve-borde.svg", 400, 22, f'<path d="{d}" fill="#f4fbff"/><path d="M0 4H400" stroke="#ffffff" stroke-width="2" opacity=".8"/>{icicles}', stretch=True)

# Estrella nova (sobre el logo y la portada del recomendado).
def star(cx, cy, r, ri):
    pts = []
    for i in range(10):
        a = math.radians(i * 36 - 90); rr = r if i % 2 == 0 else ri
        pts.append(f"{cx + math.cos(a) * rr:.1f},{cy + math.sin(a) * rr:.1f}")
    return " ".join(pts)
write("estrella.svg", 64, 64, f'<circle cx="32" cy="32" r="26" fill="url(#g)" opacity=".7"/><polygon points="{star(32, 32, 20, 8.5)}" fill="url(#s)" stroke="#fff6cf" stroke-width="1.5" stroke-linejoin="round"/><circle cx="27" cy="25" r="3" fill="#fff" opacity=".9"/>',
      '<defs><radialGradient id="g"><stop offset="0" stop-color="#ffe9a3"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6cf"/><stop offset="1" stop-color="#ffb72e"/></linearGradient></defs>')

# Adorno colgante (esfera de cristal con YXJ-azul) para las portadas.
write("esfera.svg", 60, 90, '<path d="M30 0V28" stroke="#c7ecff" stroke-width="1.6" opacity=".8"/><rect x="24" y="26" width="12" height="8" rx="2" fill="#ffd36b"/><circle cx="30" cy="58" r="26" fill="url(#e)" stroke="#e9fbff" stroke-width="1.5"/><path d="M8 52 Q30 64 52 52" stroke="#ffffff" stroke-width="3" fill="none" opacity=".55"/><circle cx="21" cy="47" r="6" fill="#fff" opacity=".7"/>' + flake(36, 64, 8, "#ffffff", 1.4, .9),
      '<defs><radialGradient id="e" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#c7f4ff"/><stop offset=".45" stop-color="#29a8ff"/><stop offset="1" stop-color="#3a1fa8"/></radialGradient></defs>')

# Paisaje de invierno antes del pie: aurora, colinas nevadas, pinos de hielo con luces y la estrella nova.
W, H = 1600, 170; rnd = random.Random(11); b = []
b.append('<path d="M0 60 C300 10 520 90 820 40 S1350 20 1600 70 V170H0Z" fill="url(#au)" opacity=".55"/>')
def pine(x, base, h, lights=True):
    w = h * .55; s = []
    for k, (yy, ww) in enumerate(((0, 1), (.32, .8), (.58, .6))):
        ty = base - h + h * yy
        s.append(f'<path d="M{x:.0f} {ty:.0f} L{x + w * ww / 2:.0f} {ty + h * .45:.0f} H{x - w * ww / 2:.0f}Z" fill="url(#pi)"/>'
                 f'<path d="M{x - w * ww / 2 + 3:.0f} {ty + h * .45 - 2:.0f} Q{x:.0f} {ty + h * .45 - 9:.0f} {x + w * ww / 2 - 3:.0f} {ty + h * .45 - 2:.0f}" stroke="#f4fbff" stroke-width="3" fill="none" stroke-linecap="round"/>')
    if lights:
        for _ in range(4):
            lx = x + rnd.uniform(-w * .3, w * .3); ly = base - rnd.uniform(h * .15, h * .8)
            s.append(f'<circle cx="{lx:.0f}" cy="{ly:.0f}" r="2.4" fill="{rnd.choice(["#5ee7ff", "#a48bff", "#ffd36b", "#ffffff"])}"/>')
    s.append(f'<rect x="{x - 3:.0f}" y="{base - 2:.0f}" width="6" height="8" fill="#2c3756"/>')
    return "".join(s)
for x, base, h in ((80, 150, 86), (170, 148, 60), (330, 140, 96), (430, 144, 64), (640, 136, 80), (1020, 138, 84), (1110, 142, 56), (1300, 140, 100), (1410, 146, 66), (1530, 150, 84)):
    b.append(pine(x, base, h))
b.append('<path d="M0 150 C220 120 380 140 560 132 S900 110 1100 130 S1420 140 1600 128 V170H0Z" fill="#dff3ff"/>')
b.append('<path d="M0 158 C260 140 520 160 800 150 S1300 140 1600 152 V170H0Z" fill="#f4fbff"/>')
b.append(pine(820, 132, 118))
b.append(f'<polygon points="{star(820, 12, 12, 5)}" fill="#ffd36b" stroke="#fff6cf" stroke-width="1.2"/><circle cx="820" cy="12" r="20" fill="#ffd36b" opacity=".25"/>')
for _ in range(26):
    b.append(flake(rnd.uniform(0, W), rnd.uniform(4, 100), rnd.uniform(2, 4.5), "#e9fbff", op=round(rnd.uniform(.4, .85), 2)))
write("paisaje.svg", W, H, "".join(b), '<defs><linearGradient id="au" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#29b6ff" stop-opacity="0"/><stop offset=".3" stop-color="#5ee7ff" stop-opacity=".45"/><stop offset=".6" stop-color="#8b6cff" stop-opacity=".45"/><stop offset="1" stop-color="#29b6ff" stop-opacity="0"/></linearGradient>'
      '<linearGradient id="pi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8fe0"/><stop offset="1" stop-color="#173a8a"/></linearGradient></defs>')
print(sorted(p.name for p in OUT.iterdir()))
