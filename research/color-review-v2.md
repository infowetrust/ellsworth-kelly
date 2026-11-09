# Color review — November 9, 2026

This pass responds to a contributor photograph of *Red on Red* at SFMOMA. The earlier automated tone proposal had made both red panels too orange. Option H was selected during color review; the release now uses variant O, with the same reviewed palette decisions.

## Coverage and decisions

Three independent review scopes screened every one of the **497 SVG studies**: red/orange/pink/brown; green/yellow; blue/purple and all neutral-only studies. Overlapping families produced 688 review records. Contact-sheet review is not a claim of 497 calibrated or full-resolution examinations, and a missing or inadequate image still counts only as a screened slot.

- **103 studies recolored**, changing 171 paint elements: 101 painting records and two painting candidates.
- **253 other studies retain their colors after supported comparisons of the reviewed families.**
- **141 studies have only unresolved color evidence in this pass** and retain provisional colors.
- **50 of the 356 studies with some supported decisions also have unresolved families.** Counts of individual family outcomes therefore overlap.
- All 584 source catalog records, dimensions, identities and collection statements are unchanged. All 497 rendered geometries and material-family labels are unchanged. Original pre-palette fill rollback values are preserved.

Each reviewer compared actual source imagery with the current studies and generated proposed renders. The lead independently inspected every proposed correction in source/current/proposed sheets, including a dedicated Red on Red comparison and the complete green/yellow and blue/purple correction sets. Source-image contact sheets and the contributor photograph remain local and are excluded from the public export. Their content hashes support provenance; no private file paths or EXIF are distributed.

## Red on Red and H

The [SFMOMA object record](https://www.sfmoma.org/artwork/FC.713/) and [Matthew Marks record](https://matthewmarks.com/exhibitions/ellsworth-kelly-relief-paintings-05-2001/lightbox/works/red-on-red-2001-12571) identify the painting. Their photographs differ visibly: the museum web image is brighter and more orange, while the gallery image and the independently contributed museum photograph support a stronger warm red. This disagreement is preserved in the review reason rather than hidden behind a pixel average.

The two panels now use the same curated warm red **#e52d22**, replacing **#ef4b28**. This is a screen-color interpretation, not a measured pigment or a claim that any photograph is perfectly calibrated. The contributor photograph is used only as evidence for this work; its lighting or white balance is not transferred to other paintings.

| H work | Current decision |
|---|---|
| Dark Green Panel, 1986 | Darker green-black, #1b332d; the primary museum image is substantially darker than the earlier teal. |
| Violet, 1985 | Dark plum, #3e2946, after the specific Sotheby's image. |
| Red on Red, 2001 | Warm red, #e52d22, with independent contributor and primary-source comparisons. |
| Dark Blue Curves, 1997 | Ultramarine #293d94 confirmed as a reasonable limited-palette impression. |
| Split Yellow, 2013 | Clear yellow #f5df16 replaces duller golden #f2cf27. |

The broader corrections include overly pink/rust-red distinctions, brighter clear yellows, warmer leaf greens, muted/cornflower blues and pale cyan. A limited set of reusable tones is extended where the old palette cannot convey a recurring impression. Relief shading and necessary panel distinctions remain visible; these do not assert different pigments. Different shades remain within their existing broad color family for filtering.

## Durable reviewed overrides

[data/color-review-overrides.json](../data/color-review-overrides.json) stores accepted confirmations, corrections and unresolved retentions at explicit paint indices, with geometry fingerprints, prior decisions, source URLs and evidence hashes. [audit.json](color-review-v2/audit.json) records the reconciled counts and independent geometry/source-data checks. Scope-specific proposal records remain in `research/color-review-v2/`.

The merge preserves original rollback colors and takes precedence over automatic proposals during regeneration. Unresolved reviews explicitly retain their earlier provisional tones instead of accepting a new automatic guess. A replay cannot recolor a different family, silently retint a shared palette token, or proceed after a geometry change. The browser's work details show reviewed families and unresolved evidence.

```sh
node scripts/apply_color_reviews.cjs --apply
node scripts/build_color_studies.cjs --apply
node scripts/refine_color_study_metadata.cjs --apply
npm run build:visuals
npm run build:social
npm test
```

The automated suite tests idempotence, reviewed-decision precedence over simulated automatic proposals, exact paint identities, geometry/family guards, original fill rollback, private-photo provenance and identical browser data copies. The existing full layout, scale and public-export checks also pass. No source photographs are bundled. These notes describe the color-review pass. Current release status is recorded in PUBLICATION.md.
