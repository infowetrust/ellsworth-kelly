# Independent estimated-scale data review

Reviewed 2026-10-29 by the museum-records agent. Scope: `scripts/build_scale_estimates.py`, all 61 entries in `data/scale-estimates.json`, the current factual catalogue, corresponding SVG proportions, and selected existing source photographs/caption pages. No shared data, factual metadata, SVG or frontend file was edited by this reviewer.

**Result: pass after two substantive numerical corrections and one caption-fraction correction.** These are optional display-size estimates. They do not establish physical measurements, resolve perspective, or change catalogue facts.

## Corrections independently found and rechecked

| Record | Draft issue | Final estimate and basis |
|---|---|---|
| Grand Rapids `gap-blue-white-2006`, Blue White | A median of the 6.35 m Spectrum VIII long edge and a sprawling 27.43 m-wide eighteen-panel wall gave a 16.89 m height for a narrow lobby painting. A whole installation width was an unsuitable vertical analogue. | **581.65 × 150.7375 cm**, height × width. Median measured heights of the LWL Black and White (528.3 cm) and FLV Spectrum VIII (635 cm); projected SVG aspect retained. Confidence remains very low. |
| Foundation EK 951, Black White Black | Shape text “three joined rectangular panels” missed the multipart detector. Single-panel long edges were applied to the entire horizontal triptych, yielding only 57.4 cm high × 152 cm wide. Actual Foundation photograph 42 shows the broad three-panel wall work. | **204 × 540.6 cm**, height × width. Median height of seven measured nearby three-panel paintings, with the SVG’s three-panel aspect. Candidate scope, inferred comparison period and very low confidence remain explicit. |
| Sanary, `moma1973-pdf57-caption1` | The draft repeated an OCR reading of 51¼ inches. The actual 1973 caption on PDF page 57, printed page 52, reads **51½ × 60 inches**. | **130.81 × 152.6117 cm**, height × width. Height uses 51.5 × 2.54; width follows the SVG’s seven-column/six-row aspect. This does not overwrite catalogue dimensions. The estimate links the exact PDF page. |

Also viewed the actual Black Square with Red caption, PDF page 95: 6 feet 6 inches × 7 feet 7¾ inches. The estimate correctly uses **91¾ inches as width**, not height, and converts it to 233.045 cm.

## High-risk cases checked

- **Floor projections:** EK 808 Yellow Curve and EK 835 Red Floor Panel use a reported plan long edge only as a display anchor. Applying plan height directly to their flattened SVGs would have produced approximately 38.8 m and 45.3 m widths. The final estimates avoid that error and preserve the existing projected contours. Blue Floor Panel for Leo likewise remains a projected display proxy rather than an asserted floor plan.
- **Tate Yellow Curve T07403:** the official tall photograph conflicts with the current wide 135.7 × 355.6 cm metadata. The final estimate explicitly infers the 355.6 cm long edge as vertical and derives 214.52 cm width from the observed aspect. It is low confidence, does not silently swap factual axes, and does not merge another Yellow Curve.
- **Panel components:** Whitney Painting in Five Panels uses its tallest published panel height, 91.4 cm. VMFA uses each-panel height 132.7 cm; Walker Red Yellow Blue III uses each-panel height 179.07 cm. These do not multiply panel count into height for side-by-side arrangements. SFMOMA Blue Green Black Red uses each-panel height 160.02 cm and keeps approximate installation gaps.
- **Series of Five Paintings:** the 356 cm component width calibrates the chosen five-row comparison layout. Its resulting approximately 975.4 cm display height is explicitly a stacked comparison, not a measured physical installation or prescribed order.
- **FLV Colored Panels:** the five observed component ratios, including the 1117.6 cm-high yellow panel, produce a median display scale. Its approximately 12.50 m × 25.56 m extent is an architectural projection estimate, not a room survey. Different wall planes prevent one scale from matching every component exactly. Only the five pictured panels are represented; no sixth panel is invented.
- **Other dimension qualifications:** Buffalo’s parallelogram keeps a reported long-edge anchor without treating the short support edge as the complete bounding width. AIC Yellow Panel and Aloes retain explicit inferred-axis conflicts. Walker Yellow/Red uses its framed extent as a qualified upper-bound proxy. Ormesson keeps the thesis measurement secondary. Existing published dimensions for November Painting, Tate Red White and Red Yellow Blue II are used without promoting unresolved projection/installation status to measured eligibility.
- **Early and small works:** Plant I and Seaweed use early-period comparators; Falcon, Slip and York Studies use measured small studies/paper rather than late monumental canvases. The three missing Chatham paintings use measured members of the same 1971 series and remain near the series’ approximately 2.74 m height. EK-neighbour years are selection context only, not newly assigned creation dates.

## Independent structural reconciliation

The final estimate target set equals the 61 current SVG records excluded from measured physical scale: no omissions or extra records. Every entry has `is_estimate: true`, finite positive centimetre dimensions and its method/confidence. All comparator IDs resolve to records with positive published dimensions and measured-scale eligibility. Every estimated width/height ratio agrees with its actual deployed SVG ratio within relative error **5.59 × 10⁻⁷**, allowing rounding. The stored factual-catalogue input hash matches the current catalogue.

The final confidence distribution is **16 medium, 13 low and 32 very low**. The 32 comparison-only priors, including the revised architectural and joined-panel cases, remain openly speculative. No additional material unit, aspect, component-count or period-scale outlier was found in the bounded review of all 61 records.

The parent separately owns browser verification and integration checks. This review approves the data as an opt-in estimated-display layer with its existing qualifications; it does not certify the guesses as the artist’s actual dimensions.
