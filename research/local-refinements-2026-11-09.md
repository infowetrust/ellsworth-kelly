# Local refinements — November 9, 2026

Historical local-review notes. The release now selects card O; publication status is recorded separately in PUBLICATION.md.

Continues the uncommitted `codex/local-refinements` work. Preview: http://127.0.0.1:8878/ . No commit, push, merge or deployment.

- Gallery’s Color button and filter drawer now share the left side, on desktop and mobile.
- Catalog’s default sidebar fits without internal scrolling at 1512 × 801 and 1440 × 700. Redundant visible dropdown labels and repeated helper copy are removed; programmatic labels remain. Default option text carries the meaning: Any number of hues, All shapes, All decades, All major collections. Expanded options and exceptionally short screens retain safe overflow rather than clipping controls.
- One quiet download-to-tray SVG icon replaces Export text. Its menu distinguishes Current selection · JSON, Current selection · CSV and Entire catalog · JSON. The separate sidebar catalog-download link is removed. Escape closes the menu and returns focus.
- Five actual Wee People glyph outlines (H, L, b, q, r) replace the original proportional sketches. Source: the locally installed WeePeople Regular font. Native path commands are unchanged. Uniform scale, translation and SVG coordinate conversion preserve proportions. Visible head-to-sole height is exactly 170 cm, with a 56 cm packing box and no clipping. About credits Alberto Cairo and ProPublica and links the bundled license/provenance. These borrowed outlines are excluded from MIT and CC BY 4.0; their upstream CC BY-NC-ND 3.0 US terms remain in force. The font itself is not distributed.
- The 1200 × 630 preview card has no visible text. It contains 13 chromatic, nonrectangular single-color paintings, with no neutral-color or rectangular works. All use one shared scale from eligible recorded dimensions. Painting bounding boxes do not overlap; edge cropping is deliberate. The builder validates these constraints, and the placement manifest is in `social-card.json`.

Validation: full automated suite, SVG/glyph outline hashes, inline/file identity, exact visible human height, nonoverlap, source-data immutability and public-export boundaries passed. Browser review confirmed the left drawer at desktop and 375 × 812, accessible download choices and no Catalog sidebar scrolling at the desktop sizes above. Temporary viewport overrides were reset. The latest script asset version ensures the browser displays Wee People rather than a cached earlier silhouette registry.

Assets and methods:

- [Wee People attribution and license](../site/dist/assets/people/README.md)
- [Wee People bounds and path hashes](../site/dist/assets/people/manifest.json)
- [Text-free social card](../site/dist/assets/social-card.png)
- [Card placements and physical scale](social-card.json)

## Further refinement: card options and common floor

- Four text-free 1200 × 630 options are available at `/card-options.html`: A has 4 large works, B 7, C 12 and D 20. Original painting orientations are preserved, no painting box overlaps another, and no top edge is cropped into a hanging point. Each option has a consistent physical scale of its own (1.4, 1.05, 0.84 and 0.58 pixels/cm respectively). B is the current local default. The SVGs are in `site/dist/assets/social-card-options/`; full-size local PNGs and a comparison sheet are in ignored `research/social-card-options/`. `npm run build:social -- --option a` (or b/c/d) selects and rebuilds the local default.
- All people now share a floor 32 cm below the globally lowest painting edge (or at least 170 cm from the origin for miniature works). They occupy clear horizontal intervals in the bottom band, with a right-side gutter as a fallback. Painting coordinates, Plot categories and cell spacing are unchanged when people are toggled. Fit bounds include the people.
- Additional tests cover the common baseline, nonoverlap, clear-space/gutter fallbacks and 69 real physical Gallery/Plot layouts, including recorded/estimated dimensions. The full suite and public-export checks passed. Browser measurements confirmed both feet at the same baseline below every visible painting.

All changes remain local and uncommitted. No push, merge or deployment.

## Further refinement: large, distinct shapes

Six new alternatives E–J extend the four-large-painting direction. E/F/G contain four paintings; H/I/J contain five. Within each option every painting has a different chromatic family, and all double-lobed B/heart-like examples are excluded. Shapes include bent panels, single sectors, stepped forms, chevrons, long arcs, hexagons and split forms. At least two paintings in each card run beyond a side or bottom edge; top edges remain visible. Physical proportions and original orientations remain unchanged, with one shared physical scale within each option. No artwork boxes overlap. Earlier A–D remain under a collapsed section on the local review page. The current default preview file is not changed by presenting these alternatives.

The builder checks unique colors, exclusion of the double-lobed works, counts, edge crops, physical dimensions and nonoverlap. A separate visual review informed revisions to the red curved forms and enlarged yellow shapes. Public-export validation passed. The working tree remains local and uncommitted.

## Further refinement: variations on selected H

K–P offer six five-work compositions based on H. K tightens cropping, L opens the spacing, M moves green right and purple left, N places green centrally, O substitutes Green Angle, and P substitutes Dark Blue Curve. The reviewed colors and source orientations are unchanged. Every card uses one shared physical scale, five different chromatic families, no text or overlaps and at least two edge-cropped works. H remains the selected card. Earlier options A–J stay available under the collapsed comparison section.

The social-card builder checks every placement, physical dimension, color-family uniqueness and edge crop. Public-export validation passes. Nothing committed, pushed or deployed.
