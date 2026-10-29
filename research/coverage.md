# Catalogue coverage and validation

Checked 26 October 2026. This is a research catalogue and prototype, not a certified catalogue raisonné. No complete public painting inventory or reliable total painting count was found in the primary sources reviewed. Unknown totals are deliberately `null` in `coverage.json`.

## Authoritative publication coverage

The [Foundation bibliography](https://ellsworthkelly.org/catalogue-raisonne/) lists Yve-Alain Bois's volume 1, **1940–1953** (2015), and volume 2, **1954–1958** (2021). [Cahiers d'Art Institute](https://cahiersdartinstitute.org/catalogues/ellsworth-kelly/description?locale=en) provides a subscription digital edition of volume 1 and describes a digital version of volume 2 as forthcoming. Its search route requires sign-in even for preview. The Foundation-funded [Discovering EK biography](https://discoveringek.ellsworthkelly.org/ek-100-chapter-4#meets-yve-alain-bois) describes volume 3, **1959–1965**, as in progress. The [author's institution](https://www.ias.edu/ideas/2021/bois-ellsworth-kelly-vol-2) reported a planned five-volume project in 2021; this historical plan should not be treated as a current publication guarantee.

Consequently, the project has four explicitly unresolved inventory ranges: 1940–1953; 1954–1958; 1959–1965; and 1966–2015. Their missing counts cannot yet be calculated. Print-volume reconciliation or authorized digital access is necessary to convert these into an exhaustive checklist.

## Public Foundation extraction

The [Foundation's selected works index](https://ellsworthkelly.org/work/) spans paintings, sculptures, photographs, prints and drawings. It is not a painting-only catalogue. `data/foundation.json` contains **78 painting/painted-object candidates**, each checked against its individual Foundation work page. Every record contains an EK identifier, exact title, date string, medium, dimensions, collection statement and source URL. Gesso-on-wood **Cutout in Wood** and dyed-cotton **Red Yellow Blue White** are retained for scope review rather than silently discarded. These records are source facts; shape/color labels and SVG studies are a separate interpretive layer.

Direct HTTP requests to the Foundation returned a Cloudflare challenge in this session; browser and indexed web-tool reads worked. The text snapshots preserve metadata provenance. The Foundation is WordPress-based, but no accessible complete sitemap or REST index was confirmed. Do not assume its numbered works form a complete accessible sequence.

## Known works beyond the selected index

`coverage.json` includes **23 named-work candidates** from the [Foundation chronology](https://ellsworthkelly.org/chronology/), including Antibes, the La Combe works, Ormesson, Méditerranée, White Square, Black Square, Atlantic, Broadway, Aubade, Running White and several others. These are evidence-backed slots awaiting museum/raisonné reconciliation. A chronology year often records an exhibition or acquisition, so it is not copied into the creation-year field unless explicit. Thirteen candidates now include `verified_metadata` from additional work-level museum sources or explicit captions in the [MoMA 1973 retrospective catalogue](https://assets.moma.org/documents/moma_catalogue_2535_300299040.pdf). The latter gives creation years for La Combe II (1950), Ormesson (1950), Meschers (1951), Méditerranée (1952), Bar (1956), and Painting in Three Panels (1956). Its collection statements are historical, not current ownership verification.

The [MoMA Chatham exhibition](https://www.moma.org/calendar/exhibitions/1329) establishes an independently checkable subgroup of **14 paintings**, made in 1971. This is a useful completeness test within the much larger unknown universe. The [MoMA book preview](https://www.moma.org/d/pdfs/W1siZiIsIjIwMTgvMDYvMTMvOGlvazUweWl5aF9LZWxseV9DaGF0aGFtX1BSRVZJRVcxLnBkZiJdXQ/Kelly_Chatham_PREVIEW1.pdf?sha=cc613fbfe3ec18ec) offers another primary source for the subgroup.

## Deduplication

Use EK identifiers as work identity. Titles recur. For example, [Green Panel, EK 605](https://ellsworthkelly.org/work/green-panel-2/) is dated 1980, while [Green Panel, EK 700](https://ellsworthkelly.org/work/green-panel/) is dated 1985. The user-requested earliest-title view should display EK 605, while the research ledger retains both and records the suppression. Do not delete provenance or turn this view into a claim about the number of unique paintings.

Normalize case, Unicode punctuation and whitespace only for exact-title comparison. Preserve Roman numerals, color order, panel/relief/curve wording and parenthetical dedications. Different works titled Untitled need special treatment rather than collapsing all anonymous titles automatically.

## Three complementary checks

1. **Inventory reconciliation:** compare every selected-index painting candidate against an individual work page, and compare record counts, EK identifiers and exact titles. Then reconcile complete printed catalogue inventories before claiming completeness.
2. **Independent museum verification:** match paintings against owning-museum records using title, creation date, medium, dimensions and image; keep discrepancies visible. Private collection statements remain anonymous rather than being guessed. Chatham's expected 14 is a subgroup control.
3. **Independent source and visual audit:** review source conflicts, title groups, years, dimension units and panel orientation. Review SVG studies against source photos, preserving holes, separate panels and white regions. A generated study must never be presented as a photographed artwork.

These checks are a protocol; only the extraction checks explicitly recorded in `coverage.json` have been completed by this research subtask. They do not certify the whole catalogue three times.

## Conflicts already detected

The individual Foundation record and chronology place **Black Curves in 1954**, while Discovering EK's search text says 1955. The chronology and SFMOMA date **La Combe III to 1951**, while the educational search text says 1952. MoMA's 1973 catalogue dates **La Combe II to 1950**, while the educational biography says 1951. MoMA dates **Méditerranée to 1952**, incompatible with the educational site's 1962 date (a later exhibition publication uses 1951–1952). Work-level records take precedence where available; unresolved date nuances remain recorded. These examples demonstrate why copying a single attractive biography is insufficient.

## Completion criteria

Full completion requires an authoritative list of all painting identities; reconciliation of every candidate and suppression group; field-level source evidence; known unknowns for absent media and metadata; and visual verification of every asset. An empty image slot for a sourced identity is valid. Inventing a painting for every missing integer in the EK sequence is invalid: that sequence also includes sculpture and reliefs, fractional identifiers, and separate prefixed series.
