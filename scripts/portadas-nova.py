"""Portadas de paquetes con la identidad de NOVA DIAMONDS a partir de la serie de escenas de VANTA.

- Paleta: el verde lima y los grises verdosos pasan al azul neón / violeta y grises azulados de Nova.
- La luz en «V» de fondo se cambia por un destello de estrella (nova) con rayos cian y violeta.
- Cada emblema «V» (cofres, cajas, caldero) se cambia por el isotipo YXJ con un halo azul.

Uso: python3 portadas_nova.py <carpeta portadas de vanta> <yxj.webp pequeño> <carpeta salida>
"""
import base64
import math
import re
import sys
from pathlib import Path

SRC, MARK, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
OUT.mkdir(parents=True, exist_ok=True)
MARK_B64 = base64.b64encode(MARK.read_bytes()).decode()

COLORS = {
    # acento lima → azul neón de Nova
    "#b9f43c": "#29b6ff", "#dcff7a": "#9fe9ff", "#5f9a12": "#1a5fd6",
    # fondo verde oscuro → azul noche
    "#10200f": "#0c1f55", "#040705": "#02040d", "#0d200f": "#171240",
    # grises verdosos de los objetos → grises azulados
    "#323a36": "#2c3756", "#0c100e": "#0a0f1f", "#47524c": "#3f4c70", "#1b221e": "#161d36",
    "#2d3531": "#27314e", "#141916": "#10162b", "#030504": "#02040b", "#050706": "#04060f",
    "#060807": "#050812", "#070908": "#060a16", "#0a0d0b": "#080c1a", "#2c3330": "#28324e",
    "#1d2320": "#192038", "#a9c79a": "#9fb6e6",
}

V_PATH = "M-10 -8 H-4.2 L0 1.6 L4.2 -8 H10 L1.8 8.6 H-1.8Z"
V_BEAM = '<path d="M26 -4 H62 L100 86 L138 -4 H174 L108 146 H92Z" fill="url(#cv)"></path>'


def nova_burst(cx=100, cy=78):
    """Destello de estrella: rayos largos alternando cian y violeta, más un núcleo de luz."""
    rays = []
    for i in range(12):
        a = math.radians(i * 30 + 15)
        long = 150 if i % 2 == 0 else 95
        w = 9 if i % 2 == 0 else 6
        ex, ey = cx + math.cos(a) * long, cy + math.sin(a) * long
        px, py = -math.sin(a) * w, math.cos(a) * w
        grad = "url(#nrayA)" if i % 3 != 2 else "url(#nrayB)"
        rays.append(f'<path d="M{cx:.1f} {cy:.1f} L{ex + px:.1f} {ey + py:.1f} L{ex - px:.1f} {ey - py:.1f}Z" fill="{grad}"></path>')
    return (
        '<defs>'
        f'<radialGradient id="nrayA" gradientUnits="userSpaceOnUse" cx="{cx}" cy="{cy}" r="150"><stop offset="0" stop-color="#7fe3ff" stop-opacity="0.55"></stop><stop offset="1" stop-color="#29b6ff" stop-opacity="0"></stop></radialGradient>'
        f'<radialGradient id="nrayB" gradientUnits="userSpaceOnUse" cx="{cx}" cy="{cy}" r="150"><stop offset="0" stop-color="#a48bff" stop-opacity="0.5"></stop><stop offset="1" stop-color="#6d4dff" stop-opacity="0"></stop></radialGradient>'
        f'<radialGradient id="ncore" gradientUnits="userSpaceOnUse" cx="{cx}" cy="{cy}" r="60"><stop offset="0" stop-color="#e9fbff" stop-opacity="0.35"></stop><stop offset="1" stop-color="#29b6ff" stop-opacity="0"></stop></radialGradient>'
        '</defs>'
        f'<g opacity="0.85">{"".join(rays)}</g><circle cx="{cx}" cy="{cy}" r="60" fill="url(#ncore)"></circle>'
    )


def yxj(glow: bool):
    """Isotipo YXJ en lugar de la V (mismo tamaño aproximado: 20 x 17 unidades alrededor de 0,0)."""
    if glow:
        return '<circle cx="0" cy="0" r="12" fill="#29b6ff" opacity="0.35" filter="url(#csoft)"></circle>'
    return f'<image href="data:image/webp;base64,{MARK_B64}" x="-13" y="-10.5" width="26" height="21"></image>'


for src in sorted(SRC.glob("paquete-*.svg")):
    s = src.read_text(encoding="utf-8")
    assert V_BEAM in s, f"{src.name}: no se encontró la luz en V"
    s = s.replace(V_BEAM, nova_burst())
    # Emblemas: el primer path V de cada grupo es el halo (con filtro), el segundo el trazo.
    s = re.sub(r'<path d="' + re.escape(V_PATH) + r'"[^>]*filter="url\(#csoft\)"[^>]*></path>', yxj(True), s)
    s = re.sub(r'<path d="' + re.escape(V_PATH) + r'"[^>]*></path>', yxj(False), s)
    assert V_PATH not in s, f"{src.name}: quedó una V"
    for a, b in COLORS.items():
        s = re.sub(re.escape(a), b, s, flags=re.I)
    (OUT / src.name).write_text(s, encoding="utf-8")
    print(src.name, len(s) // 1024, "KB")
