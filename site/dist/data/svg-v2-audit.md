# Second SVG enrichment audit

43 additional studies, reviewed 2026-10-26. Every study is coded SVG geometry with explicit `data-colour` attributes; none embeds a raster image. The palette is intentionally vivid and standardized. Contours, spacing, and most panel proportions are interpretive approximations, not facsimiles or conservation measurements.

15 studies use Foundation selected-work photographs; 20 use primary collection photographs; four use High Museum photographs; one uses North Carolina Museum of Art's official photograph; three use only the Met's ordinary displayed previews. Local references and exact URLs are in `data/studies-v2.json` and `research/svg-v2-reference-manifest.json`. The three Met preview observations are documented separately.

Validation layers:

1. Actual reference images were visually inspected before reconstruction. Earlier contact sheets and individual renders were visually checked; the new High/NCMA five-study sheet and the three Met study renders were checked separately.
2. All SVGs are parsed as XML and checked for accessible titles/descriptions, reference metadata, editable colour attributes, and absence of raster, script, or remote-resource elements.
3. All SVGs are independently raster-rendered through Sharp. Lookup paths, local reference files, source URLs, and catalogue lookup keys are checked programmatically. Results are stored in `research/svg-v2-validation.json`.

Special cases and limits:

- Colours for a Large Wall preserves the observed 8 × 8 arrangement of 64 squares. Spectrum Colors Arranged by Chance preserves the observed 38 × 38 grid, with source cell-centre colour samples grouped into vivid families. No chance arrangement is regenerated randomly.
- Seine and Cité preserve actual observed binary photo masks, merged into vector run rectangles. Fine photograph texture and slight contours are simplified. Crisp SVG edges avoid hairline rendering seams.
- White Relief, Relief with Blue, and White Relief over White use restrained neutral contour guides to distinguish relief edges; these guides are explicitly described as diagrammatic, not additional paint colours.
- Red Blue Green Yellow and Blue Red preserve approximate oblique installation views of wall/floor panels. Their floor trapezoids describe photographic perspective, not plan geometry.
- Red Dark Blue is a hand-traced organic silhouette from the ordinary Met preview. The source's dark blue maps to shared vivid blue, and fine contour irregularities are omitted.
- Red Yellow Blue EK 35 was not reconstructed from its available grayscale reference, because per-mark hues could not be established. Floor-shape photographs EK 808/EK 835 and absent reference EK 213 remain image gaps rather than invented geometry.
- The invalid SAAM image response is marked `image_valid:false` in the reference ledger, and no study was generated from it.

Catalogue completeness remains unestablished. This enrichment adds studies for documented works; it does not assert that the public sources constitute the complete catalogue raisonné. Current primary publisher/Foundation pages still establish volumes 1 (1940–1953, 2015) and 2 (1954–1958, 2021); the Foundation-funded biography identifies volume 3 (1959–1965) as in progress. No newer published volume was found in this review.
