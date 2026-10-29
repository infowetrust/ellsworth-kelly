# Museum SVG gap pass v6

Reviewed 2026-10-28. Fourteen assigned records have explicit outcomes in `outcome-ledger.json`: two new vector studies, two evidence-backed print scope corrections, and ten unresolved image gaps. None of the old studies is counted again. No central catalogue or app file was edited.

## New studies

**Tate, Yellow Curve, T07403.** The full official image was viewed and downloaded from the actual public Tate image element. All three painted support edges are visible. The tall triangular shape agrees with the secondary captioned photograph, but conflicts with the dimensions still supplied by Tate’s current details panel. The study is normalized only and preserves that conflict; it does not swap dimensions or assume another Yellow Curve identity. Exact browser observations are in `tate-primary-browser-observation.md`. One new primary source row is in `data/gap-museum-enrichment-v6.json`.

**Fondation Louis Vuitton, Colored Panels.** Two full official color photographs were viewed. The study follows the observed arrangement of the five displayed panels on different wall planes, with all architecture removed. It is explicitly a partial installation study of a six-panel work; the unspecified sixth panel is not invented. No aggregate physical dimensions or canonical flattened installation is claimed. Existing individually reported dimensions remain source metadata. Violet maps to the searchable purple family. This study remains a scope candidate and is normalized only.

Both deployed assets are under `site/dist/assets/studies/v6-museum-*`. Reproduce with `python3 scripts/build_gap_museum_studies_v6.py`, bundled Node running `render_studies.js`, and bundled Python running `finalize_audit.py`. Both rendered studies and the paired source sheet `comparison.jpg` were visually reviewed. XML validation confirms numeric width/height, `preserveAspectRatio="none"`, title/description/source metadata, color-family attributes on every painted path, and no embedded raster, script or foreignObject.

## Van Abbemuseum: actual journal recovery resolves a misleading classification

The new museum collection frontend exposes public `/api/artworks/search` and `/api/artists/directory` routes. Search `q=Kelly` returns zero because the artwork search does not match artist names; the artist directory does list Ellsworth Kelly. Exact work-title searches recover Black Curve I (1973), inventory 1018, and White Curve I (1973), inventory 1019, with primary 1200-pixel photos. Current individual museum pages explicitly describe pencil/lithograph on paper, acquired 1985; quoted sizes are framed sizes.

That was initially insufficient to exclude the historical painting slots: same title/year could name prints after paintings. The current frontend also explicitly links legacy museum pages to `old-plone.vanabbemuseum.nl`. A focused request to the original journal path on that publicly linked legacy host recovered the actual 2009 no. 4 PDF, rather than only indexed text:

https://old-plone.vanabbemuseum.nl/nl/museum/vriendenvereniging/journaals/journaal_2009_nr_4.pdf/@@download/file

The complete PDF is saved as `references/vanabbe-journal-2009-4-legacy.pdf`. PDF pages 5 and 6, printed pages 9 and 10, were rendered and viewed. They show the same square print images as current inventories 1019 and 1018, including broad paper margins, faint pencil edition markings beneath the lower-left image corner and signatures below the lower-right corner. The journal photograph of Black Curve I has the same rising black curved field; White Curve I has the matching white lower-right curved field against black upper-left. These are not shaped canvases.

The historical interview’s word *schilderijen* had been treated too literally. The now-recovered pictures plus explicit current media establish the print scope correction. `vanabbe-scope-comparison.jpg` places both actual journal illustrations beside current photographs. `data/gap-museum-scope-exclusions-v6.json` records the exact source records, URLs and visual proof. It does not assert that no separate same-title painting exists elsewhere.

## Remaining limits

The ten retained gaps comprise both MFAH paintings, Fukuoka Blue Black Curve III, K20 Concorde IV, Cincinnati Black Diamond with White, the four Lenbachhaus Documenta panels, and MFA Boston White Relief Over White. Each has specific new attempts and a concrete failure in the outcome ledger.

The explicitly linked larger K20 photograph is still cropped at the top and right. Fukuoka’s tiny dark primary image does not resolve the blue/black boundary. Cincinnati supplies no image. MFAH’s ordinary public page remains behind a Cloudflare check; exact auction provenance and historical exhibition alternatives did not produce a verified actual image. The public *Am I Blue?* excerpt credits Green Black on printed page 25 but does not include that illustration. Lenbachhaus’s current group image is withheld; the inspected 2022 installation inventory and public documenta/d’Offay routes do not establish the four named curved supports. The Foundation agent independently checked its preserved exhibition snapshots and found no corresponding annotated installation. MFA Boston’s promised gift remains unillustrated and cannot be joined to the same-title Marks work solely by title/year.

No generic shape was inferred from a title, no print image was substituted for a painting, and no inaccessible image was treated as evidence that the work does not exist.
