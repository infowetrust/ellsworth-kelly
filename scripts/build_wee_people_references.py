"""Render unchanged local Wee People font outlines as uniformly scaled SVG references.

Requires fonttools. Usage: python3 scripts/build_wee_people_references.py --font FONT.otf
The font is supplied separately; no unrelated installed font or original font file is copied.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
from xml.sax.saxutils import escape
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'site/dist/assets/people'
HEIGHT_CM, BOX_WIDTH_CM = 170, 56
SELECTION = [('H', 'upper-h'), ('L', 'upper-l'), ('b', 'lower-b'), ('q', 'lower-q'), ('r', 'lower-r')]
SOURCE = 'https://github.com/propublica/weepeople'
LICENSE = 'https://creativecommons.org/licenses/by-nc-nd/3.0/us/'
CREDIT = 'Wee People; illustrations by Alberto Cairo. Copyright (c) 2018 ProPublica and Alberto Cairo. CC BY-NC-ND 3.0 US.'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font', required=True, type=Path)
    args = parser.parse_args()
    font = TTFont(args.font)
    names = {r.toUnicode() for r in font['name'].names if r.nameID in {1, 4, 6}}
    if not any('WeePeople' in n.replace(' ', '') for n in names):
        raise ValueError('Only the explicitly requested Wee People font may be processed')
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    OUT.mkdir(parents=True, exist_ok=True)
    entries, records = [], []
    for char, slug in SELECTION:
        glyph_name = cmap[ord(char)]
        bounds_pen = BoundsPen(glyphs)
        glyphs[glyph_name].draw(bounds_pen)
        x0, y0, x1, y1 = bounds_pen.bounds
        scale = HEIGHT_CM / (y1 - y0)
        visible_width = (x1 - x0) * scale
        if visible_width > BOX_WIDTH_CM:
            raise ValueError('Glyph exceeds the reference box; do not distort it')
        # Native outline commands are not simplified, redrawn, rounded or resampled.
        pen = SVGPathPen(glyphs)
        glyphs[glyph_name].draw(pen)
        path = pen.getCommands()
        # Only uniform scale, the coordinate-system Y flip and centering translation.
        tx = (BOX_WIDTH_CM - visible_width) / 2 - x0 * scale
        ty = y1 * scale
        matrix = f'matrix({scale!r} 0 0 {-scale!r} {tx!r} {ty!r})'
        label = f'Wee People glyph {char}, upright standing figure'
        provenance = f'{CREDIT} Source: {SOURCE}. License: {LICENSE}. Unchanged font outline; technical SVG conversion and uniform scaling only. Visible reference height 170 cm, not the depicted individual’s measured height.'
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="56" height="170" viewBox="0 0 56 170" aria-hidden="true"><title>{escape(label)}</title><desc>{escape(provenance)}</desc><metadata>{escape(provenance)}</metadata><path fill="currentColor" transform="{matrix}" d="{escape(path)}"/></svg>'
        filename = f'wee-people-{slug}.svg'
        (OUT / filename).write_text(svg + '\n')
        entries.append({'label': label, 'svg': svg})
        # Verify the saved d commands exactly match the source glyph extraction.
        assert re.search(r' d="([^"]+)"', svg).group(1) == path
        assert abs((y1 - y0) * scale - HEIGHT_CM) < 1e-10
        records.append({'character': char, 'glyph_name': glyph_name, 'file': filename,
                        'font_bounds': [x0, y0, x1, y1], 'uniform_scale': scale,
                        'translate_x': tx, 'translate_y': ty,
                        'visible_width_cm': visible_width, 'visible_height_cm': HEIGHT_CM,
                        'box_width_cm': BOX_WIDTH_CM,
                        'native_path_sha256': hashlib.sha256(path.encode()).hexdigest()})
    manifest = {'source': SOURCE, 'license_url': LICENSE, 'credit': CREDIT,
                'source_font_filename': args.font.name,
                'source_font_sha256': hashlib.sha256(args.font.read_bytes()).hexdigest(),
                'embedded_font_copyright': sorted({r.toUnicode() for r in font['name'].names if r.nameID == 0}),
                'method': 'Unchanged native glyph commands; uniform scale and coordinate-system conversion only. No glyph reshaping.',
                'glyphs': records}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    gallery = ROOT / 'site/dist/gallery.js'
    source = gallery.read_text()
    encoded = '  const humanMarkup=' + json.dumps(entries, ensure_ascii=False, separators=(',', ':')) + ';'
    source, count = re.subn(r'^  const humanMarkup=.*?;$', lambda match: encoded, source, flags=re.M)
    assert count == 1, 'Expected the existing human glyph registry'
    gallery.write_text(source)
    print(json.dumps({'glyphs': len(entries), 'reference_box_cm': [BOX_WIDTH_CM, HEIGHT_CM], 'outlines_unchanged': True}))


if __name__ == '__main__':
    main()
