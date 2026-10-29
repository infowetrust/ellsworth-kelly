# Enriching the Kelly catalogue

Checked 26 October 2026. The inventory is a research dataset, not an authenticated catalogue raisonné. Museum screening and work-level verification are different stages.

## Published catalogue raisonné: the authority we should reconcile

Yve-Alain Bois, **Ellsworth Kelly: Catalogue Raisonné of Paintings, Reliefs, and Sculpture**, Cahiers d’Art:

| Reference | Coverage | Publication/access evidence | Use in this project |
|---|---|---|---|
| Volume 1 |1940–1953|Print 2015; revised digital edition described by [Cahiers d’Art Institute](https://cahiersdartinstitute.org/catalogues/ellsworth-kelly/description?locale=en). ISBN 9782851171900, confirmed by [Rijksmuseum Research Library](https://www.rijksmuseum.nl/en/collection/publication/Ellsworth-Kelly-catalogue-raisonne-of-paintings-reliefs-and-sculpture--0d65527cb987d5193b2a7296690914ce).|Extract the authoritative work checklist, classify paintings/painted reliefs, reconcile every EK identity, title, date and variant.|
| Volume 2 |1954–1958|Print 2021; digital version still described as forthcoming. ISBN 9782851173195, confirmed by the [publisher’s distributor](https://www.artbook.com/9782851173195.html).|Reconcile the second period against a complete published inventory.|
| Volume 3 |1959–1965|The [Foundation-funded biography](https://discoveringek.ellsworthkelly.org/ek-100-chapter-4#meets-yve-alain-bois) lists it in progress. No publication was established in this check.|An unresolved authority gap, not a list from which to invent absent work numbers.|

The first two volumes should be consulted through legitimate digital access or a research/art library. We have verified publication details and used public excerpts; **we have not transcribed their complete inventories**. The prints catalogue raisonné by Richard Axsom concerns another medium and cannot stand in for the painting inventory. Historical exhibition catalogues are useful supplementary lists, but are selected and may contain superseded dates or collections.

## What the 200-institution pass establishes

The target list is curated for likely relevance to modern/contemporary international holdings. It is **not an externally ranked “top 200”**. It contains 200 named institutions across 199 primary domains; two Berlin museums share an institutional domain. Some institutions specialize in loans, exhibitions or other media.

All targets received a domain-scoped search. 120 returned indexed pages mentioning Kelly; 80 did not return an indexed primary result in this pass. Neither outcome establishes possession or absence of a painting. Hits include prints, exhibitions, publications, portraits and loans. Exact queries and returned URLs are retained in 50 batch files under `research/museum-screening/`.

The [museum ledger](data/museum-research-queue.json) records the next distinction: which institutions have work-level painting records verified in our inputs, which remain search leads, and where the search is unresolved. No painting is added solely because its museum appears in this list.

## Repeatable acquisition sequence

1. **Use institution data before broad search.** Prefer official artist-subset downloads or publicly documented collection endpoints. Preserve the whole artist subset and classify it before importing. The new Met pass streamed 503,012 CSV rows, retained 69 Kelly artist rows, and imported exactly five rows classified as Paintings; 64 other records stayed out. Walker’s all-media artist index supplied a comparable classification control.
2. **Open owning-museum object records.** Collect title, creation date/range, artist identity, medium, classification, accession, EK number if explicitly given, support/overall dimensions, collection statement and image reference. Capture a source snapshot or exact public evidence reference. Retain nulls when a page is inaccessible or a field is absent.
3. **Reconcile identity before counting additions.** An explicit EK number, accession/object URL, and image can establish the same work. Same title/year alone cannot: two 1962 Red White paintings and multiple 1964 Blue Red paintings are demonstrably distinct. Preserve historical aliases and date/size conflicts. Earliest-title suppression remains a display rule over the full ledger.
4. **Separate collections from exhibitions.** A venue’s retrospective does not prove ownership. A 1973 collection credit is historical. New acquisitions—including Cleveland’s 2026 Black Diagonal Relief and the Met’s 2025 Black White gift—show why museum records complement a catalogue raisonné.
5. **Review all 200 targets at work level.** Advance promising object/artist pages first; record blocked sites and unresolved queries. For ambiguous results, review the museum’s own all-media artist results or catalogues. Do not convert an unproductive search into a zero-holdings claim.

## SVG production workflow

Each new SVG requires a defensible reference, not just a descriptive title.

- Prefer a frontal object image with visible support boundaries. Retain the source URL and local research reference; do not put photograph pixels in the SVG.
- Use published overall dimensions for the outer aspect ratio. Represent separate panels, holes and white regions explicitly. Record whether dimensions describe support, frame, panel, installation or floor footprint.
- Hand-author simple lines, polygons, arcs and Bézier contours. For complex chance grids, transcribe/sample the **observed** cells. The new 64-square wall study follows its actual reference; no random grid stands in for the painting. Seine/Cité outlines derive from their observed reference masks.
- Standardize vibrant screen colours as an explicit interpretive palette. Keep inferred colour families separate from measured/calibrated colour. Recolouring in the interface changes a study, not the catalogue tags.
- When white-on-white relief boundaries need a neutral edge guide, label it as a viewing guide rather than an added paint colour. Label an oblique wall/floor diagram as schematic. Such projections are excluded from the flat-work true-scale gallery.
- Validate SVG XML, accessible title/description, source metadata, editable colour attributes, aspect ratio, transparent gaps, and absence of embedded rasters/scripts. Render the result and compare it with the reference. Leave a pending slot when colour, topology or geometry is not sufficiently supported.

The 43 new studies and their per-work decisions are documented in [SVG audit](data/svg-v2-audit.md), [study lookup](data/studies-v2.json), and the generator. This is an approximate visual index, not a facsimile or a rights determination.

## Gallery behaviour and limits

The new Gallery takes inspiration from ImageSorter’s visual neighbourhoods and continuous navigation: see the [product description](https://www.modula4.com/products/additional-products/imagesorter/). It displays SVGs alone on a blank field, with optional hidden controls, drag/pinch/scroll navigation, and fit-to-field.

**Comparable size** gives each SVG the same long edge while preserving its proportions. **True scale** applies one shared pixels-per-centimetre scale to eligible works; no work is separately fitted back into a cell. Source dimensions must be known. Schematic wall/floor projections are omitted from that mode with a count. Layout order changes position, not physical size. Colour/visual-neighbour layouts use sampled SVG colours and silhouettes; they are navigational arrangements, not art-historical similarity claims.

Pending studies remain in the research catalogue and are explicitly counted as omitted from this visual-only view.

## Completion gates

A claim of complete coverage requires authoritative inventories and recorded reconciliation, not more attractive thumbnails. Track source-row preservation, unresolved identities, missing fields, per-period inventory gaps, and unmade studies. Never divide by an invented oeuvre total. Reconcile the published volumes first, then assemble and cross-check later-period lists. The remaining private/unknown collections will require archival evidence beyond a museum-only sweep.


## 27 October museum follow-up

See the [latest museum expansion](museum-expansion-v3.md):259records,158SVGs,101pending studies. Seven public artist indexes were reconciled, with Hirshhorn current full coverage still unresolved. Work-level records now cover37of the200research targets.
