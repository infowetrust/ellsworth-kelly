# Wee People scale references

**Wee People — illustrations by Alberto Cairo. Copyright © 2018 ProPublica and Alberto Cairo.**

These five standing figures are glyphs **H, L, b, q and r** from the user's locally installed Wee People font. Their native outline commands are preserved without reshaping or simplification. SVG uses uniform scaling, a coordinate-system flip and translation only. Each figure's visible head-to-sole bounds span 170 reference centimeters; this does not claim that the original depicted individual was 170 cm tall. Empty lateral space centers the unchanged outline within a 56 × 170 cm packing box.

- [Official source and usage notes](https://github.com/propublica/weepeople)
- [Upstream license notice](LICENSE.md)
- [CC BY-NC-ND 3.0 United States](https://creativecommons.org/licenses/by-nc-nd/3.0/us/)
- [Extraction and bounds manifest](manifest.json)

The upstream terms require credit, prohibit selling the font separately, and prohibit altering or adding shapes without approval. Upstream also specifically permits use on pages with ads or as a design element in a paid publication. These are the upstream terms, not a new license granted by this project. Do not treat the glyphs as MIT or CC BY 4.0 assets or infer unrestricted commercial reuse. No endorsement by Alberto Cairo or ProPublica is implied.

The original local font's embedded copyright string reads “2013 ProPublica”; the distributed upstream notice above reads “2018 ProPublica and Alberto Cairo.” Both are recorded rather than silently substituted. Only the five selected outline renderings are included; no font file or unrelated local fonts are distributed.

Rebuild using `scripts/build_wee_people_references.py --font FONT.otf` from the repository root, with the `fonttools` Python package installed. The script verifies the font family, exact extracted path strings, uniform aspect ratio and visible 170 cm height.
