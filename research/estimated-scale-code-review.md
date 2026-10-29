# Estimated gallery scale: independent code review

Reviewed 29 October 2026. Scope: `site/dist/app.js`, `gallery.js`, `index.html`, `style.css`. No frontend files edited by this reviewer. The separate estimates dataset was not yet present at review time.

## Result

No remaining material code issue found after the lead agent's two corrections below. The implementation keeps estimates in `scale_estimate`, preserves source `height_cm`/`width_cm`, labels estimated works in the status line, tooltip and accessible name, and exposes confidence, reasons, comparisons, caveats and measurement links in details. Grid/Arrange continue using recorded facts; the new source selector affects the immersive Gallery's true-scale mode.

### Findings corrected during review

1. **Incorrect omission explanation in estimates-only mode.** The previous code labelled every omitted SVG as a hidden recorded-size study, including unresolved dimensions and invalid or absent estimates. Current `updateCounts()` independently counts `trueScaleEligible` recorded works and reports the remaining omitted works as unresolved. Verified with a mixed fixture.
2. **Incomplete update signature.** The previous Gallery signature ignored eligibility and estimate dimensions. Replacing a same-ID work object with newly supplied estimates could leave `this.items` holding its old work object. Current signature includes `true_scale_eligible` and estimate height/width. Verified that a same-ID replacement now refreshes the stored work and dimensions.

### Wording corrected

The lead agent also changed `paint()` to say “Estimated scale” in estimates-only mode, so it no longer implies recorded works are shown in that state. The selection, counts and geometry remain correct.

## Focused checks actually run

Both JavaScript files pass `node --check`. A Node VM loaded the actual `KellyGallery` class with minimal DOM stubs and exercised:

- Recorded-only: one eligible recorded work shown; estimated, absent-estimate, invalid-estimate and unresolved-projection works omitted as unresolved.
- Include estimates: recorded plus two valid estimated works shown. Zero-height estimates rejected.
- Estimates-only: two estimated works shown, one eligible recorded work reported hidden, two unresolved works reported unresolved.
- Comparable mode: all five available SVG studies shown; estimated-size count/labels cleared.
- Input immutability: repeated scale selection and counts do not change recorded work fields or estimates.
- Same-ID estimate replacement: new estimate dimensions replace the item reference after the corrected signature invalidates.
- Hide then restore: empty update removes the item, restore restores it exactly.
- Out-of-order SVG completion: a removed/hidden older record cannot return after the current record loads; revision check rejects the stale result.

Static review also confirms source selection relayout uses the current mode when pending SVG loads finish, hidden works are removed before Gallery update, restored works keep their separate estimate evidence, controls update the shared URL, valid `?scale=recorded|estimated|estimates-only` initializes true-scale state, and comparable mode removes the `scale` parameter.

## Final dataset and browser checks for integration

These require the real dataset and browser, so they are not claimed as completed here:

1. Every estimate key resolves to a current catalogue work, every comparison ID resolves after identity merges, and all positive centimetre dimensions are finite. An obsolete alias must be resolved rather than silently omitted.
2. Estimate width/height ratio must agree with the SVG's intrinsic width/height ratio within a documented rounding tolerance. `object-fit:contain` prevents visual stretching, but a disagreeing estimate rectangle would letterbox the image and make its effective centimetre scale inaccurate. Validate the real data, including wide multi-panel and projection studies.
3. Deep links: open `?view=gallery&scale=estimated&color=blue` and `?view=gallery&scale=estimates-only`, then comparable → true scale, catalogue → gallery, and refresh. Verify selector value, included studies and URL agree.
4. Hide an estimated large work, change scale source while its images are loading, restore it, and verify no duplicate/stale node or incorrect count. Check a filter containing only recorded works, only estimated works, and no usable scales.
5. Check the three-mode toolbar at 320, 375, 768 and 1024 px widths, plus a short landscape viewport. New wrapping rules are plausible, but the mobile fit padding is fixed at 155 px and should be checked against the actual wrapped toolbar height; verify the top row of fitted artworks is not covered. Check the longer lower-left status block against zoom controls.
6. Inspect one recorded work and one estimate in each mode. The detail's recorded dimension line must remain unchanged; estimated confidence and basis must remain visible, and exported JSON/CSV should preserve the estimate as a separate field.
7. If `scale-estimates.json` is missing or fails to load, catalogue loading still succeeds through the optional-fetch fallback. Verify that the selector's zero-estimate state and empty-field explanation remain understandable.

The code does not mutate artwork colours, SVG files or source measurements. Parent integration owns real-data validation, final browser QA and publication.
