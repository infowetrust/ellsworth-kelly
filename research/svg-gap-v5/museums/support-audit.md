# Museum SVG support and independent review, 2026-10-27

The final batch contains **17 new, visually reviewed SVG studies** for the assigned 37 records. Ten use normalized observed proportions and are excluded from true-scale comparison. Seven use reliable physical bounding dimensions. All 17 render, contain numeric width/height, title/description/metadata and recolor attributes, and contain no raster images or scripts. `validation.json` records the structural check; `comparison-1.jpg` through `comparison-5.jpg` pair every new study with its viewed reference.

## Painted white regions versus wall

- **mumok, Blue Curve (1964):** the [primary object description](https://www.mumok.at/onlinesammlung/detail/blue-curve-1552) explicitly calls the work a traditional rectangular format (“im traditionellen Rechteckformat”), distinguishes it from contemporary shaped canvases, and describes the blue field reaching the right canvas edge. The upper/lower-right white regions are therefore retained within the rectangular support. The actual museum image appears on page55 of the [2016 checklist](https://www.mumok.at/fileadmin/Bibliothek/7_Presse/2016/We_Pioneers/wir_wegbereiter_werkliste_pdf.pdf), rendered in `references/mumok-checklist-p55.png`; actual canvas dimensions107×84cm exclude the separately listed109×86cm frame.
- **NGA Australia, Orange Curve (1964–65):** the [primary American Masters entry](https://digital.nga.gov.au/archive/americanmasters/works.cfm%3Fwrkirn%3D116211.html) explicitly describes the orange egg-shaped form against an off-white field on a rectangular support. The [2024 NGA essay](https://nga.gov.au/stories-ideas/artists-artists-virginia-cuppaidge/) separately discusses Kelly’s colors on white canvas. The white upper/lower-left regions are painted support, not gallery wall. The full reproduction viewed is `references/nga-orange-curve.jpg`, identified by a public exhibition-review caption as the Canberra painting. Dimensions remain unresolved, so normalized-only.

## Kawamura Black Curve (1994)

The actual painting is **not** the gray Cy Twombly rectangle in the upper half of the page. The [DIC company report](https://www3.dic-global.com/dic_ir_tsushin122h.pdf#page=11), PDFpage11, has a lower section headed “新収蔵品 エルズワース・ケリー” (new acquisition, Ellsworth Kelly). Its prose identifies an oil painting Black Curve,1994, more than2m high, acquired with several prints. The accompanying lower-right gallery photograph shows the large black curved wedge at far left, distinct from the small colorful prints to its right. The wedge has a bowed left contour, vertical right edge and diagonal lower edge.

- Full source page: `references/kawamura2019-p11.png`.
- Enlarged context crop, including the exact heading/text and lower gallery photo: `references/kawamura-black-curve-proof-crop.png`.
- Paired source detail/study: `comparison-2.jpg`, bottom row.

The reference is small; the SVG openly labels its contour approximate. The height/width used come from the existing museum record, not from the printed photo’s projection.

## Louisiana final closure

The initial direct static-image URL returned403 and ordinary navigation timed out. Returning to the already opened Flickr tab after it loaded revealed the complete public photograph. The actual visible image element exposed a2048×1365 public photo, downloaded through ordinary browser media download and copied to `references/louisiana-yellow-black.jpg`. The [photographer’s caption](https://www.flickr.com/photos/jpellgen/42883722960/) identifies Yellow Black,1968, Louisiana, photographed26August2018. It clearly shows a yellow L-shaped field around a black upper-right parallelogram. No wall or cast shadow included. The observed oblique outline is normalized-only despite known physical dimensions. `comparison-5.jpg` records the paired visual check.

## Identity closures

No additional SVG was made for MFA Blue Green Yellow Orange Red or MOCA Two Panels: Black/White. The evidence for their existing studies is recorded in `outcome-ledger.json`; the lead and Foundation agents handle the explicit identity mappings. MFA current ownership is established by its official2010 gift announcement, rather than inferred from a corporate succession. The1996 catalogue’s bank collection statement is historical.

## Independent check of the lead’s14 studies

Viewed both final `research/svg-gap-v5/root/comparison-1.jpg` and `comparison-2.jpg`, including the corrected Yellow Panel proportions. All13 photographed references agree with their studies’ support, major internal contours and color-family order. In particular, East River retains white painted forms; the Chatham works have transparent open lower-right areas rather than an invented white backplane. The corrected Yellow Panel stays normalized-only.

For the14th study, independently opened the [ordinary Met object page489307](https://www.metmuseum.org/art/collection/search/489307) in Chrome and viewed its regular544×600 preview. It shows a green rectangular field, a broad blue curved lens touching both sides in the upper half, and a red band across approximately the bottom23.6%. The lead’s SVG matches. The thin external frame is appropriately omitted. No enlargement/download was requested, respecting the museum’s ordinary preview limitation. No corrections found across these14 studies. Standardized screen palettes and approximate contours remain stated limitations.

This pass closes the publicly verified routes described in the ledger. It does not establish that missing references do not exist elsewhere or that the artist’s unpublished inventory has been exhausted.
