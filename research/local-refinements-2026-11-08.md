# Local refinements — November 8, 2026

Review branch: `codex/local-refinements`. Local preview: http://127.0.0.1:8878/ . These changes are uncommitted and have not been pushed, merged or deployed. The public website is unchanged by this pass.

## Requested changes

1. **Gallery / Catalog / Plot.** Gallery is the home view with compact controls and a temporary right-side filter drawer; it has no persistent left sidebar. Catalog and Plot keep their desktop left sidebar. Small screens use a drawer. Grid is named Catalog, Arrange is named Plot, and navigation follows the requested order. Existing grid/arrange URL aliases remain supported.
2. **Artist first.** Ellsworth Kelly is the fixed, prominent title. The smaller second line reports the current SVG count and selected colors. Browser titles reflect the active view and selection.
3. **Source-informed SVG colors.** Reviewed all 497 studies in reference/proposal contact sheets; 486 have changed fills and 11 retain theirs. Five base blues—ink, ultramarine, cobalt, cyan and light—remain one Blue filter family. Other families now have small, nuanced palettes. Multitone compositions and spectral progressions retain their internal differences. Geometry and source catalog facts are unchanged. These are interpretive screen colors, not calibrated pigment measurements.
4. **Horizontal / Vertical.** Plot controls use these full names.
5. **Useful proportions.** Eleven stable aspect-ratio bands include Square (±2%), Near square portrait and Near square landscape (±10%). Suitable recorded dimensions take priority over SVG proportions. Bins do not change when filters change.
6. **Year and Decade.** Both are independent Plot dimensions. The filter is labeled Decade.
7. **Major collections.** Normalized collection groups shorten repeated institutional names; selected names and chart labels wrap. Private collections, Kelly Studio, historical galleries/lenders and Other public collections are explicit. The original reported collection credit stays visible in records. Public institutions with at least three records are individually listed.
8. **Painted area.** Alpha-weighted visible SVG coverage replaces rectangular bounding-box area. Transparent holes and gaps contribute no area. Nine fixed m² buckets range from under 0.1 to 25+. Eligible recorded dimensions or labeled size estimates supply the physical scale. This is an approximate visible canvas footprint, not the full physical surface of hidden/overlapping panels.
9. **Shared SVG loading.** Gallery, Catalog, Plot and details share SVG text, decoded images and visual descriptors. Returning to a loaded view does not reopen/loading-flash all the studies. HTTP revalidation on a fresh page load prevents outdated SVG colors from surviving a revision.
10. **2 hues / 3+ hues.** These replace Rainbow and Mixed in the interface, including plot fallback groups. A hue must occupy at least 1% of all painted pixels and 3% of chromatic pixels. Neutrals do not add hues; shades of blue remain one hue. Single color only still counts painted neutrals, so blue plus white is not single color. Old rainbow/mixed export fields remain for compatibility.
11. **Zoom stops at Fit.** Wheel, pinch, buttons and keyboard share the minimum zoom. Pan bounds keep the collection reachable.
12. **Repeated titles clarified.** The original earliest-per-title default remains, as originally requested. The prominent confusing toggle is replaced by “Show later works with repeated titles” under More options. Its help explains that the extra 103 records, 94 with SVGs, may describe distinct physical works.
13. **Personal About.** Starts with RJ, Columbia County, Kelly’s studio and support for school arts/humanities, and the desire to understand the body of work. Adds Info We Trust biography/contact links. Research detail is collapsed. Copyright, independence and artwork-rights notices remain visible.
14. **Human scale.** Three original clothed standing silhouettes are 170 cm tall at the same centimeter scale as the art. Enabled by default at True scale, optional by checkbox, absent at Same size. They are separate references and never increase work/export counts.
15. **Branding.** Uses the Info We Trust favicon. Adds a reproducible 1200 × 630 social preview: 13 single-color studies, one shared recorded physical scale, no overlapping painting boxes and intentional edge crops. Positions and dimensions are recorded in `research/social-card.json`.
16. **Cream background.** A consistent warm cream `#f3eee2` replaces the shifting background. White and dark alternatives remain available for particular works. This is a visual judgment, not a claim of mathematically maximum contrast for every color.

## Additional improvements

- **Evidence and reversibility:** every SVG has prior fills, current assignments, tone labels, confidence, basis, public source URLs and geometry evidence in `data/color-studies.json`. Details distinguish visually reviewed sources from provisional colors. All 497 have a contact-sheet sanity review; 93 records received specific reference adjudication. Automated suggestions remain low confidence. No claim that all full-resolution references were individually examined. Replay, rollback and audit are documented in `color-studies.md`.
- **Color-filter intersections:** Blue + 2 hues means blue-dominant works with exactly two chromatic families, rather than a union that admits unrelated paintings. Regression checks verify the real app intersections.
- **Sparse scale references:** at most eight people, distributed at roughly one per twelve works. Plot applies a collection-wide cap rather than adding a person in every small cell. The three poses cycle for visual variety. Original drawings avoid introducing the Wee People font’s third-party license restrictions.
- **Stable layouts and focus:** packing is deterministic, artwork boxes do not overlap, artwork DOM elements are reused, and stale asynchronous image results cannot restore a removed painting. Filter drawers trap focus and close with Escape. Camera panning is bounded.
- **Public-export safeguards:** original reference photographs and contact sheets stay ignored locally. Only the exact brand favicon and generated social card are permitted raster assets; the validator still rejects other raster research material. Licensing excludes the social artwork preview from the software/research licenses.
- **Reproducible verification:** palette audit is part of `npm test`; `npm run build:social` rebuilds the preview. Tests cover all 584 records, 497 studies, six actual Plot layouts, no overlaps, stable bins, human scale, zoom limits, data immutability, filter intersections and one-fetch/one-decode reuse.

## Asset provenance

- Favicon: https://isotype.infowetrust.com/infowetrust-icon-32x32.jpg , the existing Info We Trust brand asset, reused for this RJ Andrews project. Not represented as a newly licensed stock image.
- Human silhouettes: original SVG path drawings embedded in `gallery.js`, with no copied Wee People glyphs.
- Social card: generated solely from this project’s interpretive SVG studies. Underlying artwork rights are not cleared by the code license.
- Personal context: supplied by RJ; supplementary biography https://infowetrust.com/about and contact https://infowetrust.com/contact . School support: https://www.chathameducationfoundation.com/who-we-are/history/ .

## Validation

The final checks use Node 24 / Sharp and `npm test`. Browser review covers desktop Gallery, Catalog and Plot; 375 × 812 Gallery, filter drawer, Plot and About; color-evidence details; warm view switching; Fit minimum zoom; and full-viewport Plot without page overflow. A comparison with Git HEAD confirms no source catalog changes and no rendered SVG geometry changes. Final palette metadata wording may change to replace the previous standardized-color descriptions; it does not alter shape or source facts.
