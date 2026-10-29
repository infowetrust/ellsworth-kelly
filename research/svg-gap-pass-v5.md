# SVG gap reference pass — 27 October 2026

[Open all studies](https://kelly-colour-atlas.coolshell256.chatgpt.site/?view=gallery&versions=all) · [Blue studies](https://kelly-colour-atlas.coolshell256.chatgpt.site/?view=gallery&color=blue&versions=all)

The pass began with 636 research records, 400 SVGs and 236 visual gaps. It adds **83 unique interpretive SVGs**, giving **483 SVGs** across **597 research records**. **114 SVG slots remain open**. All 400 previously published SVG assets survive.

This is a reference and validation pass, not a claim of complete catalogue coverage or calibrated facsimiles. The total record count can fall when a duplicate physical identity is reconciled or a provisional painting is proved to be sculpture. These corrections are not counted as new SVGs.

The reference search also documented 3 additional records outside the original gap set, with 3 SVGs. Those additions are kept separate from the 80 newly drawn assets that resolve original gaps.

## Every original gap has an outcome

| Outcome | Original slots |
| --- | ---: |
| New SVG on original record | 80 |
| Identity merged into a newly illustrated work | 5 |
| Identity reconciled with an existing illustrated work | 17 |
| Proved nonpainting; retained in exclusions ledger | 19 |
| Still needs an SVG | 115 |

New SVGs by original classification: {'painting': 61, 'painting_candidate': 19}. Remaining slots by current classification: {'painting': 38, 'painting_candidate': 74, 'painting_group': 1, 'painting_group_candidate': 1}. The blue filter now has 187 tagged records, 165 SVGs and 22 open visual slots across all versions. Title-derived color evidence remains disclosed.

## How references were recovered

Three subagents handled museum references, market/publication references, and Foundation/historical records; the lead handled Chicago, the Met, and missing Chatham studies. The researchers followed alternate public museum previews, credited institutional exhibition photographs, publicly accessible auction images, exhibition catalogues and Foundation installation captions. Failed requests are preserved rather than treated as proof that no reference exists.

Each new vector follows an actually inspected reference. Painted white supports are retained; surrounding walls, external frames and cast shadows are omitted. Curves and screen colors remain interpretations. Black-and-white photos alone do not establish the placement of unknown original colors. Ambiguous identities, unseen contours and complex works without an adequate vector interpretation remain gaps.

Physical scale is withheld where a photograph's projection or the reported dimensions do not establish the installed silhouette. Examples include Chicago's Yellow Panel, whose reported dimensions conflict with the visible aspect, and Chatham studies with unknown dimensions. Comparable-size viewing remains available. Source dimensions are preserved without stretching the SVG to disguise the conflict.

## Validation

**44 automated checks pass; 0 fail.** Checks cover preserved source rows, distinct identities, one SVG asset per illustrated physical record, parseable vectors without raster images/scripts, inspected-reference files, physical aspect ratios where eligible, and explicit nonpainting exclusions. Rendered source/SVG comparison sheets support visual review; the lead independently checks the subagent batches. Browser review checks image loading, the blue filter, comparable versus physical scale, and editable colors.

The JSON gap ledger preserves all 236 original IDs and their current outcome. The exclusions ledger retains the original source records plus the primary medium evidence. Raw input files are unchanged. Neither an identity merge nor a scope exclusion is represented as a newly drawn SVG.

## Files and remaining limits

- `research/svg-gap-v5/gap-outcome-ledger.json`: every original slot, current identity and reference-review outcome.
- `data/gap-*-studies-v5.json`: vector provenance and interpretation notes.
- `data/gap-identity-v5.json`: explicit physical-identity reconciliations, when established.
- `data/excluded-nonpaintings-v5.json`: complete excluded records and primary evidence.
- `research/svg-gap-v5/{root,market,museums,foundation}/`: reference attempts, observations, rendered comparisons and batch audits.

Public references still leave missing images, uncertain color placement, uncertain identity and photographic projection. Authenticated Bois inventories remain an independent catalogue-reconciliation boundary. These unresolved cases stay visible. Original source photographs and scanned books remain research references; the distributed project bundle contains metadata, code, ledgers and interpretive vectors rather than those photographs/books. No copyright-clearance conclusion is asserted for the SVG studies.
