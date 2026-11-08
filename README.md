# Ellsworth Kelly: paintings in SVG

An independent, source-linked comparative study of color, shape, year and scale in Ellsworth Kelly’s paintings.

**584 records · 497 SVG studies · 87 pending studies · 61 estimated display sizes.**

This is an incomplete research inventory, not an authenticated catalogue raisonné. Reported collections can be historical; conflicting evidence and unknowns remain visible. The default shows 403 SVG studies, selecting the earliest dated work per recorded title. Turn off that filter to see all 497. A shared title does not prove two records describe the same physical object.

## Explore

Gallery is the home view. Arrange groups works in evenly spaced category cells, with labeled numeric ranges and no overlapping study bounds. Grid keeps titles and metadata visible. Gallery and Arrange support comparable sizes or relative physical scale; estimated sizes remain separate from recorded measurements. Temporary hiding, recoloring, sources and filtered exports are available.

Dominant colors come from visible painted area in the original SVG, not title or museum tags. A chromatic family must cover at least 40% of chromatic area and 10% of total painted area; neutrals need 40% of painted area. Single color includes shades of one paint family, but excludes a second neutral paint family. Rainbow and Mixed have separate rules. All classifications describe approximate studies, not measured original pigments. See [classification methods](research/visual-attributes.md).

```sh
python3 -m http.server 8766 --directory site/dist
```

Open http://localhost:8766/ . Use `?versions=all&color=blue` for all 104 blue SVG studies. No account, database or build step is required to serve the static app.

## Data and SVGs

- [Catalog JSON](data/catalogue.json) and [CSV](data/catalogue.csv): metadata, sources, provenance and known gaps.
- [497 SVG studies](site/dist/assets/studies): editable approximate representations, linked by each record’s `image_svg`.
- [Visual attributes](data/visual-attributes.json): area fractions, classifications, source hashes and method version.
- [Scale estimates](data/scale-estimates.json) and [methods](research/scale-estimates.md): approximate display sizes, confidence, source anchors and comparators.
- [Identity reconciliation](data/reconciliation.json), [nonpainting exclusions](data/excluded-nonpaintings-v6.json) and [gap audit](research/svg-gap-pass-v6.md).
- [Scholarly context and reading](docs/SCHOLARLY-CONTEXT.md), including Yve-Alain Bois’s catalogue raisonné.

Photographs, scans and full-page OCR are excluded. Recorded dimensions, source records and SVG geometry are unchanged by the new classification system. All SVGs simplify contours and screen colors; some use documented projected or installation views.

## Licenses and rights

Original software is open-source under [MIT](LICENSE). The project’s original research contribution is [CC BY 4.0](LICENSING.md). **Both exclude the SVG artwork representations, underlying artworks and third-party material.** Public availability is not a license to reuse Kelly’s art. No blanket permission or individual fair-use determination has been established. See [RIGHTS.md](RIGHTS.md) and the [rights review](docs/RIGHTS-REVIEW.md).

The project supports comparison, criticism and research. That purpose does not guarantee fair use or legal clearance. Neither the Foundation nor the cited scholars or institutions endorse it.

## Validate and update

Use Node 24 and Python 3:

```sh
npm ci
npm test
```

The app is plain HTML/CSS/JavaScript in `site/dist/`. After changing factual metadata, rebuild the catalog and scale sidecar, then the visual attributes:

```sh
python3 scripts/build_catalogue.py
python3 scripts/build_scale_estimates.py
npm run build:visuals
npm test
```

The visual builder uses pinned Sharp and records its rasterizer version. Historical drawing pipelines that depended on private reference photographs are not part of this export. Portable checks validate distributed data, vectors and their public-export boundary, rather than undistributed references.

## Feedback and publication

Use the site’s Feedback link or a work’s correction link to open a GitHub issue form. A person must review and manually submit it; known bot accounts are closed automatically. Login and a checkbox cannot prove someone is human. See [CONTRIBUTING.md](CONTRIBUTING.md).

GitHub Actions validates pushes and pull requests. Website deployment is manual. See [PUBLICATION.md](PUBLICATION.md) for GitHub Pages and `ellsworth.infowetrust.com`.
