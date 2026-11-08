# Independent visual UI integration review

Reviewed 2026-11-08 in the canonical portable repository. Scope: `site/dist/app.js`, `gallery.js`, `index.html`, the visual helper, and current catalog/sidecar data. UI files were read only during this review; the UI owner applied the corrections below.

## Findings and resolutions

1. **Resolved: known balanced palettes treated as missing color.** The “Include unknown attributes” predicate originally rejected an empty dominant-color array. This incorrectly removed analyzed Rainbow/Mixed works such as *Spectrum I*, which have measured colors but no individual hue reaching 40%. It now checks `!attr(w).has_visual`; ordinary missing year, dimensions, collection and shape checks remain separate.
2. **Resolved: stale provisional blue-filter explanation.** Coverage text previously said blue searches could include title-derived provisional matches. The updated text distinguishes preserved source tags from the SVG-only dominant filter. The filter never falls back to source colors or titles.
3. **Resolved by UI owner: balanced detail label.** A measured work with no individually dominant color uses Rainbow/Mixed/no individual dominant hue wording instead of being called unclassified. The detailed panel still reports actual percentages and classification rules.

## Verification

Executed the actual `filter()` implementation in an isolated Node VM against all current catalog records and the real sidecar, with only DOM controls/rendering stubbed:

| Selection | Matching SVG studies |
|---|---:|
| Default earliest-title selection | 403 |
| Blue, all versions | 104 |
| Blue OR red, all versions | 164 |
| Blue OR red, single-color works | 45 |
| Rainbow, all versions | 25 |

The 164-result OR predicate matches the independent union computed directly with `KellyVisual.matchesColor`; selections are OR within color and AND with the separate single-color checkbox. Blue + white studies are excluded by that checkbox, while multiple shades within one family remain eligible.

Executed the actual URL serialization function with stubbed location/history: blue + single-color + all versions produces `?versions=all&color=blue&monochrome=1`; restoring defaults removes the last two optional settings. Initialization reads `monochrome=1`, and earliest-title selection is checked unless `versions=all`. Reset returns to earliest-title, no color, no single-color restriction, and pending studies off. Default gallery mode is explicit.

The header count is computed from filtered records, with SVG count computed from that same filtered set; pending count is their difference. Global swatch counts are independent full-catalog totals, so the blue swatch's 104 does not assert 104 under the default earliest-title restriction. Tooltip wording identifies their global scope.

Both color filtering and Gallery/Arrange dominant-color grouping use `KellyVisual` sidecar attributes. Gallery's small canvas descriptors support visual-neighbor ordering only; they do not override dominant filters. Shape filtering/grouping uses the eight agreed shape families; empty families can be omitted from the select. An unavailable sidecar yields unclassified color, not a title-derived fallback. Unknown is absent from color swatches; violet normalizes to purple in the helper.

Source `colors`, `color_basis`, fine-grained `shape_type`, dimensions, sources, notes and identity fields are retained in work details/exports. Runtime work copies append scale estimates without overwriting those facts. JSON export appends `visual_attributes`; CSV appends dominant colors and coarse shape family. `git diff` showed no changes to either catalog JSON during this review.

Recolor controls modify a parsed/sanitized preview SVG only. Frozen original classification attributes, original SVG files and catalog facts remain separate. Syntax checks passed for app, gallery and the classification generator. Raster/classifier regressions are covered by `tests/visual-attributes.cjs`; browser layout, pointer behavior and responsive checks remain the lead/UI agent's separate integration review.

No unresolved blocking classification integration issue remains after the reported corrections. Category grouping chooses one primary display group when multiple hues qualify; color filtering still matches every qualifying family.
