# Color coverage and broad shape families

This companion dataset analyzes the **original SVG studies**, not photographs or measured historical pigments. It leaves catalogue color tags, fine shape descriptions, source facts and SVG files unchanged. Recoloring a preview does not update the classification.

## Coverage

All **497 SVGs** were rendered through Sharp with a maximum edge of 512 pixels. All **584 catalogue records** have a sidecar entry and broad shape family; the 87 records without SVGs have no invented dominant color or monochrome status.

| Attribute | Records |
|---|---:|
| Blue qualifies | 104 |
| Red qualifies | 72 |
| Yellow qualifies | 63 |
| Green qualifies | 55 |
| Orange qualifies | 28 |
| Purple qualifies | 6 |
| Black qualifies | 117 |
| White / cream qualifies | 122 |
| Gray qualifies | 19 |
| Brown qualifies | 2 |
| Rainbow | 25 |
| Mixed | 67 |
| Single color family | 121 |

Counts overlap: a balanced red/blue work can qualify for both color swatches and Mixed. A rainbow work also qualifies for Mixed. Pink remains a recognized family but no current study reaches its dominant threshold. No Unknown color swatch is created.

## Visible coverage, not counts of SVG elements

Each raster pixel is weighted by alpha. Fully transparent exterior pixels contribute nothing; partially transparent edge pixels contribute proportionally. This handles holes, overlaps, clipped areas, irregular supports and differently sized panels. A fully covered white underpainting does not become a visible second color.

Visible RGB values are assigned to the nearest original SVG paint color. Its `data-colour` paint family supplies the stable hue label; untagged paints use an RGB hue/neutral fallback. This quantization prevents antialias blends from introducing invented colors. Source families are normalized: violet becomes purple, cyan/teal blue, lime green, grey variants gray, and cream/ivory white. It uses shape-level paint families rather than the catalogue’s broad color tags.

Same-family relief shading remains that material family: light-gray vectors explicitly representing shadows of a white relief remain white. Real blue-plus-white, blue-plus-black and small painted neutral regions remain multicolor. Untagged neutral separator strokes below 2% of painted area are treated as drawing decoration rather than a new material. Declared material regions are retained down to 0.001% of visible painted area; this small raster tolerance prevents numerical noise from determining monochrome status. Texture and pigment differences absent from the SVG cannot be recovered by this method.

## Current interface refinements (2026-11-08)

The interface replaces Rainbow and Mixed with **2 hues** and **3+ hues**. A chromatic family counts when it occupies at least 1% of all painted pixels and 3% of chromatic pixels. Neutrals do not add hues; five blue shades still count as one blue hue. Hue count intersects with the dominant-color selection. The legacy rainbow/mixed fields below remain in exports for compatibility, but are no longer interface controls or plot groups.

The 497 source-informed recolored studies have been reanalyzed; their family labels remain stable. See [color-studies.md](color-studies.md) for interpretive palettes, confidence, source review and reversible fill assignments.

**Painted area** is an approximate visible two-dimensional canvas footprint: alpha-weighted SVG coverage multiplied by eligible recorded width and height, or clearly labeled estimated dimensions when enabled. Transparent holes and spaces between panels do not contribute. Overlapping hidden canvas surfaces, thickness and oblique projections cannot be reconstructed from a flat SVG. It is not an exact measurement of total physical painted surface. Area uses fixed m² bands from under 0.1 to 25+, so filtering does not silently move the thresholds.

**Major collections** groups institutions with at least three records individually, plus Other public collections, Private collections, Kelly Studio, Gallery / historical ownership and Unknown. Original collection credit lines remain unchanged. Eligible recorded dimensions take priority for proportion bands; the SVG proportions are a fallback. Square is ±2% and Near square ±10%.

## Filter definitions

- **A chromatic color qualifies** when it covers at least **40% of nonneutral painted pixels** and at least **10% of all painted pixels**. The second condition prevents a tiny blue fleck on an otherwise white support from becoming a blue-dominant work. Forty percent retains substantial two-color compositions while excluding small accents. More than one hue may qualify.
- **Neutral colors qualify** when they cover at least **40% of all painted pixels**. Black, white/cream, gray and brown are excluded from the chromatic denominator but retain meaningful swatches.
- **Rainbow** means either balanced red/yellow/blue (each 20–45% of chromatic area, together at least 75%), or a hue-wheel composition with at least five chromatic families each reaching 5% and none exceeding 40%. Chromatic paint must cover at least 10% of the whole study. The primary rule uses the red/yellow/blue palette central to these paintings.
- **Mixed** means at least two visible chromatic families and at least 10% chromatic coverage overall, with no clear unique leader: no hue reaches 40%, or the two leading shares differ by at most ten percentage points, or the work is Rainbow. Thus equal red/blue qualifies for red, blue and Mixed; 60/40 has a clear leader and is not Mixed. Neutral-only black/white compositions use their neutral swatches and are not chromatic Mixed.
- **Single-color works** means one visible material color family, including its shades. Two Yellows and multiple grays therefore qualify. Blue plus white or black does not qualify, even when the neutral region is too small to earn its own dominant swatch. This is a color-family definition, not a claim of one pigment or a completely uniform surface.

## Shape families

Eight families replace dozens of detailed filter labels: **Rectangle; Circle & oval; Triangle & sector; Polygon & diagonal; Curved form; Joined panels; Separate panels; Unclassified**. All original fine descriptions remain in the catalogue. Mapping uses those descriptions and explicit support/panel information, not a painting’s color or title alone.

Separated and joined supports are recognized first. A rectangular canvas with a curving painted figure stays Rectangle. Single floor canvases retain Polygon or Curved form; a floor projection is not automatically multiple panels. When a source shape description is insufficient but the rendered support fills at least 98% of its rectangular image bounds, the broad Rectangle family can be established from the visible silhouette. Otherwise it stays Unclassified. Circle & oval currently has no illustrated members and may be omitted from the menu until one is documented.

Current shape counts: Rectangle 225; Triangle & sector 21; Polygon & diagonal 65; Curved form 40; Joined panels 123; Separate panels 23; Unclassified 87.

## Reproduction and integration

Use Node 24 or newer and Sharp. The script first uses a locally installed `sharp` module, then `KELLY_SHARP_MODULE`, then the available Codex bundled installation. On another computer, `npm install sharp` supplies the dependency.

```sh
node scripts/build_visual_attributes.cjs
node tests/visual-attributes.cjs
```

The deterministic script writes identical `data/visual-attributes.json` and `site/dist/data/visual-attributes.json`. Each visual entry records its SVG SHA-256, coverage fractions, classification reasons and raster dimensions. The sidecar also fingerprints the input catalogue.

`site/dist/visual-attributes.js` exposes the classic-script global `KellyVisual`: `setData`, `attribute`, `dominantColors`, `matchesColor`, `shapeFamily`, plus taxonomy constants. It also supports CommonJS for tests. `setData` freezes original attribute objects; `dominantColors` returns a copy. Missing-sidecar fallbacks return no colors and a candid shape classification. No helper recalculates attributes from a recolored preview.

## Verification

All 497 actual SVGs rendered successfully. Every one of the 584 IDs reconciles with the sidecar; painted coverage sums to one, thresholds are checked, and no Unknown/violet filter labels survive. The 87 missing SVGs remain unclassified for visual color.

Tests cover transparent blue silhouettes, fully occluded paint, small blue accents, real white strips on blue, white-relief shading, balanced primary thirds, equal red/blue, 60/40 red/blue, violet normalization, immutable classifications and identical exported copies. They also guard against matching “string” as “ring” and against treating single floor projections as separate panels.

The actual-study visual sample in `tests/visual-attributes-samples.png` was inspected: pure blue is single-color; Blue White is not; Two Yellows and white relief shading retain one family; Colors for a Large Wall and Spectrum I are rainbow/mixed; Aloes retains cream paper; Green Black retains both green and black. All selected examples agree with their measured coverage and the definitions above.
