# Ellsworth Kelly — A field of paintings

An independent research catalogue, editable SVG collection and static visual explorer.

**584 source-linked records · 497 SVG studies · 87 explicit visual gaps · 61 estimated display sizes.**

This is a working inventory, not a complete or authenticated catalogue raisonné. Sources overlap; reported collections may be historical. Identity joins, missing fields and conflicting evidence are retained. Earliest-title mode selects one dated work per normalized title; all other records remain available.

## Explore locally

```sh
python3 -m http.server 8766 --directory site/dist
```

Open http://localhost:8766/?view=gallery&versions=all . Add `&color=blue` for the blue field, `&scale=estimated` to include estimated sizes, or `&scale=estimates-only` to isolate them. The site requires no account, API key, database or build step when hosted independently.

## Use the data and vectors

- [Full catalogue JSON](data/catalogue.json) and [CSV](data/catalogue.csv): work metadata, source links, unknowns and provenance.
- [497 editable SVG files](site/dist/assets/studies): one file per illustrated record. Each catalogue record links through `image_svg`.
- [Scale estimates](data/scale-estimates.json): separate approximate display dimensions, source anchors, comparable records, confidence and reasoning.
- [Identity reconciliation](data/reconciliation.json) and [nonpainting exclusions](data/excluded-nonpaintings-v6.json).
- [Latest gap audit](research/svg-gap-pass-v6.md), [114 reviewed outcomes](research/svg-gap-v6/gap-outcome-ledger.json) and [estimation methods](research/scale-estimates.md).

SVGs are interpretive reconstructions: contours and screen colours are approximate. Photographs, book scans and full-page OCR are excluded. Original factual dimensions are preserved separately from estimated display dimensions. See [RIGHTS.md](RIGHTS.md).

## Validate and update

```sh
python3 scripts/validate_portable.py
node scripts/check_scale_estimates.cjs
```

The app is plain HTML/CSS/JavaScript under `site/dist/`. Edit its files directly. Change source metadata in `data/`, then rebuild:

```sh
python3 scripts/build_catalogue.py
python3 scripts/build_scale_estimates.py
python3 scripts/validate_portable.py
node scripts/check_scale_estimates.cjs
```

Some historical SVG generation depended on privately held reference photographs and is outside this portable export. The actual editable SVGs, source citations, provenance and core catalogue/scale builders are included. Portable validation checks distributed assets and data; the original local audit also checked reference photographs that are not distributed.

## Publish

GitHub Pages can serve `site/dist/` directly using the included manual workflow. Repository publication and website publication are separate steps. See [PUBLICATION.md](PUBLICATION.md) for Pages and the proposed `ellsworth.infowetrust.com` domain.
