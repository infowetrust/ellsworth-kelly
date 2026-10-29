# Independent second audit: Foundation v5 studies and identity groups

Reviewed 2026-10-27 by the museum researcher, independently of the authoring agent. Scope at review: **16 SVG studies and all22 identity groups** in `gap-identity-v5.json`. This is an audit of sourced records and interpretive studies, not certification of a complete Kelly inventory.

## Result

All16 studies agree with their specifically identified references in major support, internal geometry and color-family placement. All16 parse as SVG, have positive numeric width/height, title, description, metadata and painted-element `data-colour` attributes, and contain no raster, script or foreignObject elements. Fifteen are normalized-only; only the1955 Black and White study uses established physical proportions. No neutral colors were substituted for unknown pigments.

Viewed the complete `foundation/study-comparison-1.jpg` through `-4.jpg`, and inspected the two original floor photographs separately. Viewed identity-comparison1–5 in full, then inspected the added La Combe II, Five Panels and Spectrum III source plates individually. The MFA and MOCA identity evidence was also checked against actual primary metadata and the alternative visual references collected in the museum pass.

## Corrections found and disposition

1. **Canonical identifiers were being lost during explicit identity merges.** All17 groups that supplied an EK identifier had null canonical IDs on their retained records. Reported to the lead with examples EK249, EK60 and EK34. The lead added central propagation from the merged record with conflict checking and a regression check. This affects provenance/identity metadata, not the visual match.
2. **EK501 Black with White Triangle had incorrect photograph provenance.** The comparison initially repeated the Foundation MoMA gallery photo on both sides, and the evidence claimed it was the same photograph as1996figure34. I independently rendered and viewed the actual book PDFpage37: it is Kelly’s Chatham studio in1973, with a caption identifying White Curve V and Black with White Triangle. The latter’s black quadrilateral and attached inverted white triangle match the Foundation gallery work. The identity remains defensible, but the evidence required correction. The author corrected the text and target reference to `independent/guggenheim1996-page-37.png`; the source URL list was also corrected to include the actual1996 PDFpage37.
3. **EK835 Red Floor Panel’s normalized aspect was too tall.** Its actual photographed support spans roughly1086×193px, ratio5.63, whereas the initial SVG used4.8. The polygon’s vertex fractions were already consistent. Reported the ratio correction; the generator now uses5.63 and remains explicitly a floor projection excluded from true-scale display.
4. **Slip Study’s lower-left black corner.** The author independently spotted and fixed this while the audit was in progress. The inspected final comparison retains the black area outside the rounded white lower field.

No other material geometry correction was found in the16-study set.

## Support and palette checks

- **Sanary:** the actual color plate has a6×7 grid. The grid’s landscape proportions agree with the historical51¼×60in caption; the surrounding portrait-format mount and frame are excluded. Cell sequence reviewed against the plate. Teal/blue/purple/orange differences are openly simplified to color families.
- **Black and White1955:** the lower-right illustration on MoMA PDF62 shows a rectangular painted ground with a tapering white needle between black fields. The white lower-right region belongs to the work.
- **Black Square with Red:** the color plate shows two offset joined squares. Empty upper-left/lower-right regions are wall/page background and correctly transparent.
- **Floor works EK808/EK835:** only the colored floor panel is retained. Both clearly state that they show a photographed projection, not a reconstructed floor plan; neither is eligible for physical scaling. Yellow projection ratio5.4 agrees with the source’s observed bounding ratio of about5.38.
- **Black White Black EK951:** three panels are distinguished from wall. Approximate relative widths remain qualified because the photograph is oblique; no exact measured panel proportions are asserted.
- **White Plaque: Bridge Arch and Reflection II EK1024:** the center is solid painted white, not a hole; the two rounded lobes and shallow waist are supported by the image.
- **Black Relief with White EK946:** the white rectangular backing is visibly part of the work, below/right of the raised black trapezoid. It is retained; surrounding gallery wall is excluded. Approximate flattening remains disclosed.
- **White and Black EK82 / Barge EK78:** framed artworks are separated from frame/wall. White internal ground is retained. The oblique photographs limit precise proportions, so normalized-only treatment is appropriate.
- **Slip / Falcon / York studies EK180/182/176:** the images identify three distinct framed studies and the vector arrangements correspond to left/center/right respectively. Paper/canvas medium remains unverified rather than promoted to a confirmed painting classification.
- **Two Curves EK1046:** the white lens-shaped support is observed directly. The black Marks2012 Two Curves is correctly rejected as the same physical object despite its similar outline/title.
- **Red Curve EK746:** the broad upper convex arc, two straight lower edges and low point agree with the Barnes installation. No rectangular wall ground is invented.
- **November Painting:** black fragment placement follows the actual MACBA color reproduction, checked against the MoMA source. Cream ground and white-on-cream fragment boundaries are explicitly simplified; neither page margins nor a fabricated palette are included.

## All22 identity groups

| Retained work / identifier | Independent disposition |
|---|---|
| Christie's6482948 / EK249, Blue Pale Gray | Distinctive blue two-lobed form and long lower curling stem match. |
| Christie's6606713 / EK282, White Black | Broad curved white top band, endpoints and thin black top-right corner match. Distinct from angular EK246. |
| Sotheby's2017lot42 / EK796 | Joined blue curved sector and purple lower rectangle match unique support geometry. |
| SFMOMA FC.603 / EK852 | Narrow red double-curved portrait support and lower pointed end match. |
| Guggenheim1996cat104 / EK859 | Green wedge and short curved top/long diagonal match; no join to the later High Museum work. |
| NGA75042 / EK60, Tiger | Five-panel arrangement, unequal widths and exact top-row color order match. |
| Walker Red Green Blue / EK332 | Nested lower-left red/green rectangles within outer blue L match. Red Green Blue II remains separate. |
| SFMOMA FC.518 / EK388 | Two unequal joined colored quadrilaterals match silhouette and proportions. |
| Marks50646 / EK98, Study for Atlantic | Two-panel black ground and unequal white curves match distinctive center junction. |
| Guggenheim1996essay37fig34b / EK501 | Match supported by the actual studio photograph after correcting the erroneous same-photo claim. |
| Christie's5315261 / EK293, Yellow Curve | Portrait oval-on-ground form matches the Tooth installation. The auction record dates1962 and documents Arthur Tooth provenance; this is not the1996 Yellow Curve. |
| Marks39467 / EK1057 | White inverted triangular support with shallow raised curved top panel matches unusual Belle-Île subtitle/configuration. |
| Marks45015 / EK56 | Exactly six strips in red–white–black–yellow–white–blue order. Guggenheim1996cat19 correctly remains outside this join. |
| MoMA1973PDF66 / EK211 | Two tall orange/red relief panels and projecting junction match. |
| MoMA79739 / EK384, Spectrum IV | Nearly square13-strip support matches; distinct from the wide Spectrum III. |
| MoMA78403 / EK230, Running White | Tilted white ring plus separate rising lower band match uniquely. |
| MoMA1973PDF40 / EK34, La Combe II | Nine hinged panels and specific stair-shadow fragment sequence match. Flat La Combe I remains separate. The1973 date1950 and1996 date1950–51 must remain distinct source reports; hinged/variable-depth geometry should stay excluded from frontal true-scale assumptions. |
| Whitney9295, Painting in Five Panels | All five unequal canvases carry matching distinctive motifs. Carpenter historical ownership/current Carpenter gift and36in height reinforce identity. Date1955vs1956 and installation width1405/16vs144in remain explicit conflicts. |
| Modern8497, Spectrum III | Exact title/year,13joined panels,33¼×108⅝in match; grayscale tonal ordering is consistent with current color images. Historical MoMA/Janis credit is preserved as unresolved historical evidence rather than an invented transfer story. |
| MFA1968 Blue Green Yellow Orange Red | Actual museum visitor/donor images match the1996 figure’s five-panel arrangement; primary2010 gift text gives approximately10×22ft and current MFA ownership. No duplicate SVG added. |
| MOCA2005.13 /1996cat59 | Exact1970date,111×64in, two joined panels and Halff promised/completed gift to MOCA establish identity despite title variant. Current museum ownership retained. |

| Guggenheim1996cat28 / EK87, Bar | Independently viewed MoMA1973PDF68, Guggenheim1996PDF129 and Foundation1956photo30. The long black support has the same shallow upper undulations and asymmetric lower-center indentation; exact96in width and oil/canvas agree. Date1956vs1955 and height32¾vs33in remain explicit source conflicts. |

The identity checks use distinctive configurations and specific metadata; a shared title or a nearby essay figure number alone was not accepted as a match. Standardized palettes and approximate contours remain interpretation limits. Any later studies added after this16-study checkpoint require their own visual check.

## Final Bar addendum

The22nd identity group was checked after the initial16-study freeze. Independently viewed both full source pages—MoMA1973PDF68 and Guggenheim1996PDF129—and Foundation1956installation photo30. Their shallow upper waves and asymmetric peaked lower indentation agree; both catalogue captions state oil on canvas and96in width. The MoMA caption gives1956 and32¾in height; the1996 caption gives1955 and33in. The join to Guggenheim1996cat28/EK87 is supported by the distinctive outline and specific dimensions, with those date/height differences preserved as source conflicts. The final audited state is16 new studies and22 explicit identity groups; no further visual correction is requested.
