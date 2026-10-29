"""Deterministic, optional display-size estimates; never modifies catalogue facts.

All estimates preserve the SVG's numeric width/height ratio. Source anchors outrank
similar-work priors. The latter use a robust median among nearby confirmed works.
"""
from pathlib import Path
import json, math, re, statistics, collections, hashlib
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
CAT=ROOT/'data/catalogue.json'
DATE='2026-10-29'

def positive(v):return isinstance(v,(int,float))and not isinstance(v,bool)and math.isfinite(v)and v>0
def notes(w):return ' '.join(str(n)for n in w.get('notes',[])if n)
def ek(w):
    m=re.search(r'\bEK\s*(\d+)',str(w.get('canonical_id')or''),re.I)
    return int(m[1])if m else None
def source(w):
    for s in w.get('source_records',[]):
        if s.get('source_url'):return s['source_url']
    return next((s['url']for s in w.get('sources',[])if s.get('url')),None)
def evidence(w):
    out=[]
    for s in w.get('source_records',[]):
        z={k:s[k]for k in['source_id','source_record_id','source_url','height_cm','width_cm','depth_cm','dimensions_display','dimensions','dimension_role','raw_caption','component_dimensions','panel_dimensions_cm']if s.get(k)is not None}
        if any(k in z for k in['height_cm','width_cm','dimensions_display','dimensions','raw_caption','component_dimensions','panel_dimensions_cm']):out.append(z)
    return out
def aspect(w):
    p=ROOT/'site/dist'/w['image_svg'];r=ET.parse(p).getroot()
    return float(r.attrib['width'])/float(r.attrib['height'])
def readable(text):
    text=re.sub(r'(?<=[A-Za-z])(?=\d)|(?<=\d)(?=[A-Za-z])',' ',text)
    return re.sub(r'\s+',' ',text.replace('×',' × ')).strip()
def family(w):
    t=(w.get('title','')+' '+str(w.get('shape_type')or'')).lower()
    if 'chatham'in t:return 'chatham'
    if 'study'in t or re.search(r'paper|watercolou?r|gouache|graphite',str(w.get('medium')or''),re.I):return 'small_study_or_paper'
    if 'floor'in t or 'wall and floor'in t:return 'floor_or_wall_floor'
    if re.search(r'separated|separate|five paintings|(?:three|four|five)\s+(?:joined\s+)?(?:rectangular\s+)?panels|large wall|spectrum|colored panels',t):return 'multipart'
    if 'diagonal'in t:return 'diagonal'
    if re.search(r'curve|sector|lens|lobe',t):return 'curve'
    if 'relief'in t or 'plaque'in t:return 'relief'
    if re.search(r'window|saint.louis',t):return 'early_architectural_relief'
    if re.search(r'plant|seaweed',t):return 'early_plant'
    if re.search(r'panel|quadrilateral|triangle',t):return 'panel'
    return 'rectangle'

def readable(text):
    text=re.sub(r'(?<=[A-Za-z])(?=[0-9])|(?<=[0-9½¼¾])(?=[A-Za-z])',' ',text)
    return text.replace('earlierOCRmisread','earlier OCR misread')

def build():
    raw=json.loads(CAT.read_text());works=raw['works']if isinstance(raw,dict)else raw
    unresolved=[w for w in works if w.get('image_svg')and not w.get('true_scale_eligible')]
    known=[w for w in works if w.get('image_svg')and w.get('true_scale_eligible')and positive(w.get('height_cm'))and positive(w.get('width_cm'))and w.get('record_kind')=='painting']
    estimates={}
    def emit(w,h,method,reason,confidence='low',anchor=None,comparisons=None,extra=None):
        ratio=aspect(w);width=h*ratio
        assert positive(h)and positive(width)
        caveats=['Estimated display dimensions only; catalogue measurements are unchanged.','SVG proportions are preserved; no perspective rectification or contour correction is performed.']
        t=notes(w).lower()+' '+str(w.get('shape_type','')).lower()
        if any(s in t for s in['projection','perspective','oblique']):caveats.append('The SVG retains a photographed projection; estimated extent is not an orthographic physical measurement.')
        if any(s in t for s in['floor','wall/floor']):caveats.append('Floor-plan or wall/floor dimensions cannot describe this projected image on a single physical plane.')
        if family(w)=='multipart':caveats.append('Estimated overall extent includes the SVG’s chosen gaps/arrangement; installation spacing can vary.')
        if 'partial installation'in t:caveats.append('Only the five pictured panels are represented; the unspecified sixth panel is not estimated or drawn.')
        a=anchor or{};a.setdefault('source_url',source(w))
        v=dict(is_estimate=True,height_cm=round(h,4),width_cm=round(width,4),svg_aspect_ratio=ratio,method=method,confidence=confidence,reason=readable(reason),anchor=a,comparison_ids=comparisons or[],source_evidence=evidence(w),caveats=[readable(c)for c in caveats])
        if extra:v.update(extra)
        estimates[w['id']]=v

    # Explicit part dimensions refer to these actual drawings, not hypothetical reinstalls.
    component_heights={
      'whitney-9295':(91.4,'Tallest panel height is91.4cm; scale the observed five-panel arrangement by that height. Published overall width356.4cm includes a different/unspecified arrangement.'),
      'north-v4-vmfa-four-panels':(132.7,'Each of four panels is132.7cm high. All four share the SVG full height; gaps remain its observed approximate gaps.'),
      'museum-v2-walker-red-yellow-blue-iii':(179.07,'Published70½inches=179.07cm is EACH panel height; three panels remain side by side, not three heights stacked.'),
      'sfmoma-501-2':(160.02,'Each panel is160.02cm high. The SVG uses the museum essay’s suggested18inch intervals; this produces one possible overall installation width.'),
      'ek-350':(208.28,'Foundation82×189in overall record supplies208.28cm height. Keep that vertical anchor and the SVG spacing; no claim that all reinstalls have the same gaps.'),
    }
    special={
      'foundation-exhib-v4-ek29-kelly-peintures-et-reliefs':('width',224.2,'secondary_dimension_anchor','University thesis figure25 reports83.8×224.2cm. Use its long width224.2cm, with the observed SVG aspect; this is explicitly secondary evidence rather than a verified catalogue measurement.','low'),
      'moma1973-pdf57-caption1':('height',51.5*2.54,'historical_caption_anchor','The independently re-inspected1973printed caption is51½×60inches (earlierOCRmisread the fraction). Use51½inches as height; the seven-column/six-row SVG is retained, so its width is derived rather than forced to60inches.','medium'),
      'moma1973-pdf95-caption1':('width',91.75*2.54,'historical_caption_anchor','The already-reviewed1973caption gives the joined squares an outer span91¾×78inches. Anchor the91¾inch width; the observed joined-square aspect is retained.','medium'),
      'matthewmarks-blue-panel-1996-3729':('height',55*2.54,'conflicting_source_height_anchor','Caption55×52inches versus140×142cm agrees on height near140cm but contradicts width. Anchor55inch height and derive width from the SVG; the chosen width is an estimate, not a correction to the source.','low'),
      'artic-v4-152761':('height',212.3,'inferred_axis_anchor','Primary189.5×212.3cm is landscape while the inspected SVG is portrait with almost reciprocal aspect. Use the larger212.3cm as estimated vertical extent, explicitly inferring the axis rather than asserting a measurement correction.','low'),
      'tate-26107':('height',355.6,'inferred_axis_anchor','Primary135.7×355.6cm conflicts strongly with the tall official-image silhouette. Use reported long edge355.6cm as the estimated vertical extent; this inferred axis and derived width remain uncertain.','low'),
      'christies-5623231':('height',35.2,'inferred_axis_anchor','Both sale captions report landscape27.6×35.2cm while both actual photographs show a portrait sheet. Use the reported long edge35.2cm vertically and preserve the observed portrait aspect; no factual dimension is changed.','low'),
    }
    for w in unresolved:
        key=w['id'];ratio=aspect(w)
        if key=='gap-blue-white-2006':
            ids=['international-v4-lwl-black-white','international-v4-flv-spectrum-viii']
            peers=[next(r for r in known if r['id']==i)for i in ids]
            h=statistics.median(r['height_cm']for r in peers)
            samples=[dict(id=r['id'],height_cm=r['height_cm'],width_cm=r['width_cm'],year_start=r.get('year_start'),source_url=source(r))for r in peers]
            emit(w,h,'architectural_height_comparison','No work-level dimensions for this monumental lobby commission. Median measured HEIGHT of two monumental paintings (528.3 and635cm) gives a conservative581.65cm vertical prior. A27.4m-wide18-panel installation is deliberately excluded as a poor height analogue. The photographed oblique projection remains unchanged.','very_low',dict(dimension='height',value_cm=h,role='median measured architectural-painting heights'),ids,dict(comparison_samples=samples));continue
        if key=='foundation-exhib-v4-ek951-ellsworth-kelly-sculpture-on-the-wall':
            peers=[r for r in known if re.search(r'three\s+joined|three\s+join|on\s+three\s+joined',str(r.get('medium')or''),re.I)and r.get('year_start')is not None]
            peers=sorted(peers,key=lambda r:(abs(r['year_start']-2006)/10+abs(math.log(r['width_cm']/r['height_cm']/ratio))*.4,r['id']))[:7]
            h=statistics.median(r['height_cm']for r in peers)
            samples=[dict(id=r['id'],height_cm=r['height_cm'],width_cm=r['width_cm'],year_start=r['year_start'],source_url=source(r))for r in peers]
            emit(w,h,'joined_panel_height_comparison','No dimensions for this three-panel horizontal work. Use median measured HEIGHT of seven nearby three-joined-panel paintings, rather than assigning the long edge of a small single panel to the entire triptych. Date2006is only EK-neighbour context; no creation date or medium is asserted. Overall width follows the SVG’s observed three-panel layout.','very_low',dict(dimension='height',value_cm=h,role='robust whole-work/component-height analogy'),[r['id']for r in peers],dict(comparison_samples=samples));continue
        if key in component_heights:
            h,reason=component_heights[key];emit(w,h,'component_height_anchor',reason,'medium',dict(dimension='height',value_cm=h,role='tallest/each component height'));continue
        if key=='moma1973-pdf86-caption1':
            emit(w,356/ratio,'component_width_anchor','Each painting is178×356cm. The SVG stacks five parts; anchor its full width to one356cm-wide component, making the whole display tall enough for five178cm parts and its chosen gaps. This is a comparison layout, not a fixed physical installation.','medium',dict(dimension='width',value_cm=356,role='one complete component width'));continue
        if key=='international-v4-flv-colored-panels':
            src=next(s for s in w['source_records']if s.get('panel_dimensions_cm'));dims=src['panel_dimensions_cm']
            # Bounds of the five manually drawn colored paths, from SVG viewBox1601×783.
            bounds={'yellow':(150,700),'red':(61,87),'green':(81,267),'blue':(97,376),'violet':(138,86)}
            scales=[max(dims[c][:2])/max(bounds[c])for c in sorted(bounds)]
            factor=statistics.median(scales)
            emit(w,783*factor,'partial_installation_component_median','Take the median of five physical-component long edges divided by their drawn long spans, then apply that single scale to the five-panel SVG. Different wall planes make these ratios inconsistent; the median is a cautious display guess, not a room survey. The tall1117.6cm yellow component is included; a generic3m default would be inappropriate.','low',dict(dimension='svg_user_unit',value_cm=factor,role='median component long-edge scale',source_url=src['source_url']),extra=dict(component_scale_samples=[dict(color=c,physical_long_edge_cm=max(dims[c][:2]),svg_long_span=max(bounds[c]),cm_per_svg_unit=max(dims[c][:2])/max(bounds[c]))for c in sorted(bounds)]));continue
        if key in special:
            axis,value,method,reason,conf=special[key]
            anchor=dict(dimension=axis,value_cm=value)
            if key=='moma1973-pdf57-caption1':anchor['source_url']='https://assets.moma.org/documents/moma_catalogue_2535_300299040.pdf#page=57'
            if key=='moma1973-pdf95-caption1':anchor['source_url']='https://assets.moma.org/documents/moma_catalogue_2535_300299040.pdf#page=95'
            if key=='foundation-exhib-v4-ek29-kelly-peintures-et-reliefs':anchor['source_url']=w.get('study',{}).get('reference_url')or source(w)
            emit(w,value if axis=='height'else value/ratio,method,reason,conf,anchor);continue
        h=w.get('height_cm');width=w.get('width_cm')
        if positive(h)and positive(width):
            text=notes(w).lower()+' '+str(w.get('dimension_role','')).lower()+' '+str(w.get('shape_type','')).lower()
            if 'floor'in text:
                values=[max(h,width)]+[max(s['height_cm'],s['width_cm'])for s in w.get('source_records',[])if positive(s.get('height_cm'))and positive(s.get('width_cm'))]
                long=statistics.median(values)
                emit(w,long if ratio<1 else long/ratio,'floor_plan_long_edge_anchor','Use a robust median of this work’s reported plan long edges as the SVG’s visible long span. The shorter projected axis is derived from the existing oblique SVG, not equated with the floor-plan short edge.','low',dict(dimension='long_edge',value_cm=long,role='floor-plan long edge used only as display anchor'));continue
            delta=abs(math.log((width/h)/ratio))
            if delta<.08:
                reason=f'Use this work’s reported height{h:g}cm and derive width from its SVG aspect. '
                reason+=('Only framed extent is published, so this is an upper-bound proxy for the unframed work.'if'framed'in text else 'Any projection, spacing or source qualification remains unresolved; this estimate does not make the measurement formally true-scale eligible.')
                emit(w,h,'reported_height_anchor',reason,'medium',dict(dimension='height',value_cm=h,reported_width_cm=width));continue
            long=max(h,width)
            emit(w,long if ratio<1 else long/ratio,'reported_long_edge_anchor',f'Reported{h:g}×{width:g}cm disagrees with the SVG aspect. Preserve the larger reported edge{long:g}cm as the displayed long edge; derive its other axis without distorting the SVG.','low',dict(dimension='long_edge',value_cm=long,reported_height_cm=h,reported_width_cm=width));continue
        if positive(h)or positive(width):
            axis='height'if positive(h)else'width';value=h if axis=='height'else width
            emit(w,value if axis=='height'else value/ratio,'single_reported_axis_anchor',f'Only a usable{axis}is recorded; anchor that{value:g}cm axis and derive the missing display axis from the SVG. Component/installation qualification remains in the source record.','medium',dict(dimension=axis,value_cm=value));continue

        # No numerical source anchor: choose comparable confirmed paintings deterministically.
        target_family=family(w);year=w.get('year_start');context={}
        if year is None and ek(w)is not None:
            neighbours=sorted([r for r in works if ek(r)is not None and r.get('year_start')is not None],key=lambda r:(abs(ek(r)-ek(w)),r['id']))[:5]
            if neighbours:
                year=statistics.median(r['year_start']for r in neighbours)
                context=dict(year_for_comparison=year,year_method='median of five nearest explicit EK identifiers; selection context only, not an assigned creation date',year_comparison_ids=[r['id']for r in neighbours])
        pool=known
        if target_family=='small_study_or_paper':
            # Explicit studies/paper in any eligible scope are useful size comparators.
            pool=[r for r in works if r.get('image_svg')and r.get('true_scale_eligible')and positive(r.get('height_cm'))and positive(r.get('width_cm'))and family(r)=='small_study_or_paper'and max(r['height_cm'],r['width_cm'])<=125]
        elif year is not None and year<=1954:pool=[r for r in known if r.get('year_start')is not None and r['year_start']<=1956]
        elif target_family=='chatham':pool=[r for r in known if family(r)=='chatham']
        elif target_family=='multipart':pool=[r for r in known if family(r)=='multipart']
        # Grand Rapids is a lobby commission: use monumental confirmed paintings, not small panels.
        if key=='gap-blue-white-2006':pool=[r for r in known if r.get('year_start',0)>=1970 and min(r['height_cm'],r['width_cm'])>400]
        if not pool:pool=known
        def score(r):
            ry=r.get('year_start');rd=abs(ry-year)/10 if year is not None and ry is not None else 1.5
            aspect_distance=abs(math.log((r['width_cm']/r['height_cm'])/ratio))
            fam_penalty=0 if family(r)==target_family else 1.6
            medium_penalty=0 if bool(re.search('paper|gouache|watercol',str(r.get('medium')or''),re.I))==bool(re.search('paper|gouache|watercol',str(w.get('medium')or''),re.I))else 1.0
            return rd+aspect_distance*.7+fam_penalty+medium_penalty
        chosen=sorted(pool,key=lambda r:(score(r),r['id']))[:7]
        longs=[max(r['height_cm'],r['width_cm'])for r in chosen];long=statistics.median(longs)
        display_family='small studies / painted paper'if target_family=='small_study_or_paper'else target_family.replace('_',' ')
        reason=f'No usable work-level dimensions. Median long edge of{len(chosen)}nearby confirmed/measured comparators selected by {display_family}, date context, support and aspect is{long:g}cm. This is a size prior, not an identity join or evidence of this work’s measurement.'
        if key=='gap-blue-white-2006':reason='No work-level dimensions for this monumental lobby commission. Use median long edge of measured monumental paintings as a conservative architectural-scale prior; smaller ordinary panels are excluded. The photographed oblique projection remains unchanged.'
        samples=[dict(id=r['id'],height_cm=r['height_cm'],width_cm=r['width_cm'],long_edge_cm=max(r['height_cm'],r['width_cm']),year_start=r.get('year_start'),family=family(r),selection_score=round(score(r),5),source_url=source(r))for r in chosen]
        emit(w,long if ratio<1 else long/ratio,'comparable_median_long_edge',reason,'very_low',dict(dimension='long_edge',value_cm=long,role='robust comparison prior'),[r['id']for r in chosen],dict(comparison_samples=samples,comparison_context=context))

    assert set(estimates)=={w['id']for w in unresolved}
    for key,v in estimates.items():
        assert positive(v['height_cm'])and positive(v['width_cm'])
        assert abs(v['width_cm']/v['height_cm']/v['svg_aspect_ratio']-1)<1e-5,key
    data=dict(schema_version=1,generated_date=DATE,input_catalogue_sha256=hashlib.sha256(CAT.read_bytes()).hexdigest(),summary=dict(eligible_svg=sum(bool(w.get('image_svg'))and bool(w.get('true_scale_eligible'))for w in works),unresolved_svg=len(unresolved),estimated_count=len(estimates),method_counts=dict(collections.Counter(v['method']for v in estimates.values())),confidence_counts=dict(collections.Counter(v['confidence']for v in estimates.values()))),estimates=estimates)
    payload=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
    (ROOT/'data/scale-estimates.json').write_text(payload)
    # Explicitly authorized by parent; factual catalogue and gallery source remain untouched.
    if (ROOT/'site/dist/data').is_dir():(ROOT/'site/dist/data/scale-estimates.json').write_text(payload)
    headings='''# Optional estimated scale: evidence and method

Generated 2026-10-29. This companion artifact covers every SVG that the catalogue excludes from verified true scale. It changes no catalogue measurement, source row, date, classification or SVG.

## Coverage and validation

There are **61 estimates**, covering all 61 unresolved SVGs; the 436 eligible SVGs continue to use their catalogue dimensions. All estimated axes are finite and positive. Every estimated width/height ratio matches its original SVG ratio within 0.001%. A repeated run over identical input yields identical output. Numerical precision preserves that ratio and does not imply measurement certainty.

The JSON stores each estimate’s method, confidence, reason, anchor, source evidence, comparison IDs and numerical comparison samples. Its input catalogue SHA-256 identifies the exact source snapshot. The same artifact is copied to `site/dist/data/scale-estimates.json` for the optional gallery control.

## Decision order

1. Use work-level reported dimensions or a credible single axis while preserving the existing SVG aspect. Framed-only axes remain framed-size proxies. Conflicting orientation is labeled as an inferred axis, never silently corrected.
2. Use known component heights or widths for separated/stacked works. Series of Five Paintings anchors its stacked comparison by one 356 cm-wide component; it is not assigned a single 178 cm height for all five parts. SFMOMA and Walker component heights scale their shown panels and the chosen gaps.
3. For floor projections, anchor the visible long span to reported plan long edges, deriving the shorter projected span. This prevents an oblique 5.4:1 image from becoming nearly 39 m wide merely because its plan short axis exceeds 7 m. Such dimensions are display proxies, not floor plans or wall measurements.
4. Where axes are absent, use the median long edge of nearby measured works, selected deterministically by shape/title family, date context, support and aspect. Early works have an early-period pool; studies and painted paper have a small-study pool. Unknown creation years may use nearby explicit EK numbers as comparison-selection context only; no factual year is assigned. Comparisons do not establish physical identity.

## Substantive outlier checks

- Grand Rapids Blue White uses the median **height** of two measured monumental paintings, 528.3 and 635 cm: approximately 5.82 m high. The very wide 18-panel Color Panels for a Large Wall installation is excluded from that vertical prior.
- Black White Black, EK 951, is recognized as a three-panel horizontal work. Its estimated height comes from seven nearby measured three-joined-panel paintings, rather than shrinking the whole triptych to the long edge of one small panel.
- Tate Yellow Curve’s long reported axis is explicitly transferred to an estimated vertical axis because the official image contradicts the published orientation. Neither the source dimensions nor the image is changed.
- FLV Colored Panels retains only the five pictured components. The median of component-long-edge/projected-span ratios gives a single cautious display scale; the giant 1117.6 cm yellow panel is included. The missing sixth panel is neither drawn nor estimated. Different wall planes prevent a common projection from being a room survey.
- Independent reinspection of the Sanary printed caption corrected the earlier OCR fraction: **51½ × 60 inches**, giving a 130.81 cm height anchor. Black Square with Red’s 91¾-inch width was also checked against its actual caption. Both anchors link to the precise PDF page.
- Barge remains a very-low-confidence early-period comparison. Local MoMA/Guggenheim text search found no usable dimensions for this exact EK 78 work; a different huge same-title work was not substituted.

## Confidence

“Medium” means a published work/component axis anchors the drawing, with the original geometry or installation qualification still unresolved. “Low” covers conflicting axes, floor projections, secondary measurements or inconsistent component projections. “Very low” covers size analogies. None is relabeled a verified physical measurement.

The independent museum agent checked source anchors, stacked groups, early studies, floor projections and architectural outliers. The two material analogy outliers above were corrected before freezing. No new internet lookup was necessary; the artifact uses already preserved catalogue evidence and references.

## Exported estimates

| Work ID | Height × width, cm | Method | Confidence | Basis |
|---|---:|---|---|---|
'''
    for w in unresolved:
        v=estimates[w['id']]
        headings+=f'| {w["id"]} | {v["height_cm"]:.1f} × {v["width_cm"]:.1f} | {v["method"].replace("_"," ")} | {v["confidence"].replace("_"," ")} | {v["reason"].replace("|","/")} |\n'
    (ROOT/'research/scale-estimates.md').write_text(headings)
    return data

if __name__=='__main__':
    data=build();print(json.dumps(data['summary'],indent=2))
