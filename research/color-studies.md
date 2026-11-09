# Source-informed screen palettes

**Current update:** the November 9 source-review pass corrected 103 studies and selected card H. See [color-review-v2.md](color-review-v2.md) for current evidence, unresolved cases and durable reviewed overrides. The November 8 account below documents the earlier pass.

Local refinement dated 2026-11-08. These are interpretive screen-color studies, not measurements of Kelly's pigments or calibrated reproductions. The photos, scans, lighting and displays vary. A limited palette conveys the perceived paint more consistently than literal eyedropper values.

Every one of the 497 SVG studies has a reversible assignment in `data/color-studies.json`, with an identical browser copy at `site/dist/data/color-studies.json`. **486 SVGs changed; 11 retained their fills.** No geometry, material `data-colour` labels, identifiers, source measurements or catalog metadata changed. Each work retains its prior fill values, source URLs, evidence basis, confidence and geometry hash.

## Five blue impressions

| Impression | Screen color | Representative work | Reference judgment |
|---|---|---|---|
| Ink | `#1b3158` | *Dark Blue Panel*, EK706 | Nearly black blue in the Foundation's room photograph. |
| Ultramarine | `#293d94` | *Blue Tablet*, EK295 | A violet-leaning, moderately dark blue. |
| Cobalt | `#1f5fc6` | *Blue Curves*, EK988 | A strong, cleaner middle blue. |
| Cyan | `#087bbd` | *North River*, EK225 | A more cyan-leaning blue than the former shared cobalt. |
| Light | `#80a7c7` | *Window VI*, EK22 | A pale, less saturated blue field. |

All five retain the material family **blue**. *Dark Blue Curve* (EK856) uses cyan after reference review: its observed hue takes priority over a literal interpretation of “dark” in its title. These judgments use the Foundation's [Dark Blue Panel](https://ellsworthkelly.org/work/dark-blue-panel/), [Blue Tablet](https://ellsworthkelly.org/work/blue-tablet/), [Blue Curves](https://ellsworthkelly.org/work/blue-curves/), [North River](https://ellsworthkelly.org/work/north-river/), [Window VI](https://ellsworthkelly.org/work/window-vi/), and [Dark Blue Curve](https://ellsworthkelly.org/work/dark-blue-curve/) references.

The five base-blue assignments appear in 15 ink, 31 ultramarine, 69 cobalt, 54 cyan and 4 light work memberships. Memberships overlap when a work contains several tones. Existing spectral progressions and necessary within-family differences are exceptions: the pass preserves them rather than collapsing adjacent painted regions into one flat color. Thus five base blue variants do not mean that every spectral blue RGB value has been reduced to five hex codes.

Other families use similarly small sets: scarlet/vermilion/carmine/oxide reds; lemon/golden/ochre/pale yellows; deep/forest/emerald/grass/lime/teal greens; bright/warm/red-orange/gold oranges; three purples; two pinks; neutral black, white, gray and brown groups. These remain the existing material families for filtering. Cream support is still white; a cool gray photograph is not promoted to blue.

## Evidence and limits

The 93 explicitly adjudicated work records used contact-sheet reference review; 92 have at least one manual fill decision. These include the five blue examples, dark green and gray panels, pale gray reliefs, cream paper supports, warm red-orange fields and several red proposals that otherwise shifted toward carmine under dim photographic lighting. A direct review is still medium-confidence interpretation, not color calibration.

There are 490 cached reference files, including observation text as well as images. Automatic sampling is eligible for 381 records; 109 cached contextual/observation references and seven missing references are not eligible. Whole book pages, unreviewed installation/composite views and observation documents are rejected for automatic tone sampling. A specifically located painting can receive a manual decision, but unrelated colors elsewhere on a page are not treated as that painting's palette. Black-and-white references cannot supply chromatic evidence.

For eligible object-specific images, a 320-pixel maximum-edge raster supplies a **low-confidence tone proposal**. A high-chroma family mask suppresses neutral walls and page backgrounds; the five most frequent quantized bins give a robust reference-pixel impression. The proposal is snapped to a deliberately limited family palette. It is not an original-paint RGB estimate. At least one such automatic proposal occurs in 183 work records. Prior/default choices also occur in 341 records, commonly for neutral supports; evidence categories overlap within a work.

The initial reference/proposal sanity review covered all 497 studies across 32 contact sheets. Outliers were corrected and final sheets regenerated; the five blue examples and selected final sheets were inspected again. This is **not a claim that all 497 full-resolution primary references were individually re-examined**. The sidecar distinguishes specific reference adjudication from automated proposals, title-supported dark-family defaults and retained/prior-family choices. The latter remain low-confidence.

Uncertain examples remain explicit: the early Chatham studies with no cached source image use conservative prior-family tones; *Meschers* has an observation record rather than usable pixels; *Red Dark Blue* uses a title-supported ink fallback without claiming new visual confirmation. Installation scenes can change apparent hue and brightness. Book plates can fade or shift. Those limitations remain visible in each record's basis and reason.

## Reproduce, inspect or reverse

```sh
node scripts/build_color_studies.cjs --apply --audit
node scripts/build_color_studies.cjs --rollback
```

Replay and rollback require only the committed sidecar and SVGs. Both refuse to proceed if the stored geometry hash no longer matches. The artifact stores every prior fill, so there is no need to recover the original color from a screenshot. The structure fingerprint excludes fill values and nonrendering description/metadata text; the audit checks current annotation hashes separately.

The final metadata pass removes obsolete “standardized vivid” palette claims and EK706's former claim that its dark blue is deliberately made more vivid. Every individual SVG description now states whether its palette used specific reference contact review, low-confidence reference-assisted proposals, or prior/default tones. None claims calibrated pigment values. Titles, source URLs and every byte outside the description/metadata text were unchanged in this metadata pass. Stored prior fills and assignment decisions were preserved; color rollback restores original fills while retaining the honest current description.

The metadata pass is reproducible and idempotent:

```sh
node scripts/refine_color_study_metadata.cjs --apply
node scripts/build_color_studies.cjs --audit
```

To derive proposals again from separately retained private research files:

```sh
KELLY_REFERENCE_ROOT=<private-reference-root> node scripts/build_color_studies.cjs --derive
```

This requires the original reference corpus; it is not a build prerequisite. Public metadata stores source URLs and reference hashes, never local absolute paths or source photographs.

Local QA generation:

```sh
KELLY_REFERENCE_ROOT=<private-reference-root> node scripts/render_color_studies.cjs
KELLY_REFERENCE_ROOT=<private-reference-root> node scripts/render_color_studies.cjs --blue-examples
```

The ignored `research/color-studies/references/` directory contains 32 source/before/after sheets, their local index, and `five-blue-examples.jpg`. These contain reference photographs and are not public site assets. A comparison with Git HEAD verified all 497 files have fill-only changes. The audit also verified that sidecar copies match, no private paths are serialized, no raster/script content was introduced, and every active SVG fill matches its recorded assignment.

The visual-attribute and social-preview builders should be rerun after applying a palette pass, because original SVG hashes and rendered pixels change. Recoloring an individual browser preview remains separate from these stored original-study assignments.
