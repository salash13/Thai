#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère content/glyphs.json : le tracé SVG de chaque lettre + la position de sa boucle (หัว).

    pip install fonttools brotli
    python3 scripts/extract-glyphs.py

La boucle est le point de départ du geste d'écriture : on la détecte comme le plus petit
contour fermé du glyphe (~88 x 86 unités). Quand une lettre en a plusieurs, on prend la
plus à gauche. Les lettres sans boucle sont listées dans SANS_BOUCLE.
"""
import json, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = ROOT / "assets/fonts/NotoSansThaiLooped-Regular.woff2"
SANS_BOUCLE = {"ก": (140, 515), "ธ": (110, 500)}   # début du trait, posé à la main
PAD = 90

def contours(gs, gname):
    rp = RecordingPen(); gs[gname].draw(rp)
    out, cur = [], []
    for op, args in rp.value:
        cur.append((op, args))
        if op in ("closePath", "endPath"):
            out.append(cur); cur = []
    boxes = []
    for c in out:
        pts = [p for op, args in c for p in (args or []) if isinstance(p, tuple)]
        if not pts: continue
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        boxes.append({"w": max(xs) - min(xs), "h": max(ys) - min(ys),
                      "cx": (min(xs) + max(xs)) / 2, "cy": (min(ys) + max(ys)) / 2})
    return boxes

def main():
    letters = json.loads((ROOT / "content/letters.json").read_text(encoding="utf-8"))
    font = TTFont(FONT); gs = font.getGlyphSet(); cmap = font.getBestCmap()
    out = {}
    for l in letters:
        ch = l["ch"]; gname = cmap[ord(ch)]
        pen = SVGPathPen(gs); gs[gname].draw(pen)
        bp = BoundsPen(gs); gs[gname].draw(bp)
        x0, y0, x1, y1 = bp.bounds
        if ch in SANS_BOUCLE:
            (lx, ly), has = SANS_BOUCLE[ch], False
        else:
            boxes = contours(gs, gname)
            loops = [b for b in boxes if 70 <= b["w"] <= 110 and 70 <= b["h"] <= 110]
            b = min(loops, key=lambda b: b["cx"]) if loops else min(boxes, key=lambda b: b["w"] * b["h"])
            lx, ly, has = round(b["cx"]), round(b["cy"]), bool(loops)
        out[ch] = {"d": pen.getCommands(),
                   "vb": f"{x0-PAD} {-(y1+PAD)} {(x1-x0)+2*PAD} {(y1-y0)+2*PAD}",
                   "loop": [lx, -ly], "hasLoop": has}
    (ROOT / "content/glyphs.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  {len(out)} tracés écrits dans content/glyphs.json")

if __name__ == "__main__":
    main()
