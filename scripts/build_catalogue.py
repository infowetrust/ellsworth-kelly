"""Reconcile source records without inventing the uncatalogued universe."""
import json,re,unicodedata,hashlib,csv
from urllib.parse import urlsplit,parse_qs,unquote
from pathlib import Path
from fractions import Fraction
ROOT=Path(__file__).resolve().parents[1]
def read(name,default=None):
 p=ROOT/name
 return json.loads(p.read_text()) if p.exists() else default

def source_list(r):
 return [dict(url=s,label='Primary source') if isinstance(s,str) else s for s in (r.get('sources') or [dict(url=r.get('source_url'),label=r.get('source_type','Primary source'))])]
def norm(s):return re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip()
def object_identity(url):
 """Recognize object URLs, never artist indexes or shared exhibition captions."""
 p=urlsplit(url or '');host=p.netloc.lower().removeprefix('www.');path=unquote(p.path).rstrip('/')
 if '/objects/' in path:
  m=re.search(r'/objects/(\d+)',path)
  if m:return host+':object:'+m[1]
 if host=='sfmoma.org' and path.startswith('/artwork/'):return host+path
 if host=='thebroad.org' and path.startswith('/art/ellsworth-kelly/'):
  return host+path
 if host=='moca.org' and path.startswith('/collection/work/'):return host+path
 if host=='glenstone.org' and path.startswith('/artworks/'):return host+path
 if host=='artic.edu':
  m=re.search(r'/artworks/(\d+)',path)
  if m:return host+':artwork:'+m[1]
 if host=='moma.org':
  m=re.search(r'/collection/works/(\d+)',path)
  if m:return host+':artwork:'+m[1]
 if host=='hirshhorn.si.edu':
  edan=parse_qs(p.query).get('edanUrl',[])
  if edan:return 'smithsonian:'+edan[0]
 return None
def dimension(s):
 try:return sum(float(Fraction(x)) for x in s.strip().split())
 except:return None

def foundation(r):
 years=[int(y) for y in re.findall(r'\b(?:19|20)\d{2}\b',r['date'])];ds=r['dimensions'].replace(' inches','').split(' x ')
 nums=[dimension(d) for d in ds]
 h,w=(nums+[None,None])[:2]
 notes=[]
 if r['title'] in ['Yellow Curve','Red Floor Panel'] and len(nums)==3:
  h,w=nums[1:];notes.append('Floor work: plan dimensions use the second and third published dimensions; first dimension is thickness.')
 return dict(id='ek-'+r['ek_id'][3:].replace('.','-').lower(),canonical_id=r['ek_id'],title=r['title'],year_start=min(years) if years else None,year_end=max(years) if years else None,date_display=r['date'],medium=r['medium'],height_cm=round(h*2.54,3) if h else None,width_cm=round(w*2.54,3) if w else None,dimensions_display=r['dimensions'],collection=r['collection'],sources=[dict(url=r['source_url'],label='Ellsworth Kelly Foundation',accessed='2026-10-26')],notes=notes,record_status='documented',source_records=[r],record_kind='painting')
works=[foundation(r) for r in read('data/foundation.json',[])]
conflicts=[];matches=[]
SOURCE_INPUTS=['museums','chatham','moma1973','met-enrichment-v2','museum-enrichment-v2','screening-enrichment-v2','sfmoma-enrichment-v3','hirshhorn-seattle-v3','broad-moca-v3','additional-museums-v3','core-museums-v4','north-american-museums-v4','international-museums-v4','auction-private-v4','secondary-galleries-v4','short-catalogues-v4','public-catalogues-v4','foundation-exhibitions-v4','moma-live-v4','gap-museum-enrichment-v5','gap-public-loans-v5','gap-museum-enrichment-v6','gap-market-enrichment-v6','gap-foundation-enrichment-v6']
for r in [r for name in SOURCE_INPUTS for r in read('data/'+name+'.json',[])]:
 if r.get('source_id')=='sfmoma:504-5':
  r=dict(r,height_cm=64.8,width_cm=53.3,medium='Gesso and oil on wood',accession='99.359',source_url='https://www.sfmoma.org/artwork/99.359/')
  r['sources']=source_list(r)+[dict(url=r['source_url'],label='SFMOMA current Window I object record',accessed='2026-10-26')]
 years=r.get('year_start',r.get('year'));title=r['title']
 if re.search(r'\s*\(EK\s*\d+(?:\.\d+)?\)$',title):
  r=dict(r);r['ek_id']='EK '+re.search(r'\(EK\s*(\d+(?:\.\d+)?)\)$',title)[1];title=re.sub(r'\s*\(EK\s*\d+(?:\.\d+)?\)$','',title)
 def same_work(w):
  if r.get('verified_identity_of')==w['id']:return True
  if r.get('gallery_inventory_id') and any(x.get('gallery_inventory_id')==r['gallery_inventory_id'] for x in w['source_records']):return True
  if r.get('ek_id') and w.get('canonical_id'):return w['canonical_id']==r['ek_id']
  identity=object_identity(r.get('source_url'))
  if identity and any(object_identity(s.get('url'))==identity for s in w.get('sources',[])):return True
  verified_pairs={'moma1973:pdf37-caption1':'EK 63','moma1973:pdf55-caption1':'EK 72','sfmoma:504-4':'EK A.29','sfmoma:504-2':'EK 59','sfmoma:504-3':'EK 18','sfmoma:508-2':'EK 172','sfmoma:513-4':'EK 562','moma:79793':'EK 72','nga:127392':'EK 589.2'}
  if verified_pairs.get(r.get('source_id'))==w.get('canonical_id') and r.get('source_id') in verified_pairs:return True
  if norm(w['title'])!=norm(title) or w['year_start']!=years or years is None:return False
  if r.get('source_url') and any(s.get('url','').rstrip('/')==r['source_url'].rstrip('/') for s in w.get('sources',[])):return True
  if title.startswith('Chatham '):return True
  # Specific historical captions whose panel/visual identity is also cross-referenced.
  historical_specific={'Window, Museum of Modern Art, Paris','White Relief','Relief with Blue','Seine','Cité','La Combe I','La Combe II','Méditerranée','Brooklyn Bridge VII','Rebound','Colors for a Large Wall','Painting for a White Wall','Tiger','Red Blue Green'}
  if str(r.get('source_id','')).startswith('moma1973:') and title in historical_specific:return True
  if all(w.get(k) and r.get(k) for k in ['height_cm','width_cm']):return all(abs(w[k]-r[k])<=max(1,0.006*w[k]) for k in ['height_cm','width_cm'])
  return False
 candidates=[w for w in works if same_work(w)]
 explicit=[w for w in candidates if r.get('ek_id') and w.get('canonical_id')==r['ek_id']]
 if explicit:candidates=explicit
 if len(candidates)==1:
  w=candidates[0]
  if not w.get('canonical_id') and r.get('ek_id'):w['canonical_id']=r['ek_id']
  w['title_aliases']=list(dict.fromkeys(w.get('title_aliases',[])+r.get('title_aliases',[])))
  if norm(title)!=norm(w['title']):w['title_aliases']=list(dict.fromkeys(w['title_aliases']+[title]))
  matches.append({'id':w['id'],'source':r.get('source_id',r.get('source_url'))})
  for k in ['height_cm','width_cm','year_start','year_end','collection']:
   a,b=w.get(k),r.get(k)
   if a is not None and b is not None and a!=b and (not isinstance(a,(int,float)) or abs(a-b)>.6):
    chosen,alternative,source=a,b,r.get('source_url')
    if k in ['year_start','year_end'] and r.get('prefer_current_museum_date'):
     chosen,alternative,source=b,a,w['sources'][0].get('url')
    conflicts.append(dict(id=w['id'],field=k,chosen=chosen,alternative=alternative,source=source))
   if a is None and b is not None:w[k]=b
  if r.get('prefer_current_museum_date'):
   for k in ['year_start','year_end','date_display']:
    if r.get(k) is not None:w[k]=r[k]
  if w.get('medium') is None and r.get('medium'):w['medium']=r['medium']
  # The collecting museum's own record is the preferred report of its holding.
  if r.get('collection') and not str(r['collection']).lower().startswith('unknown') and not str(r.get('source_id','')).startswith('moma1973:') and not r.get('auction_house') and not r.get('sale_house') and not r.get('sale_date') and not r.get('auction_history') and not r.get('gallery_inventory_id') and not r.get('historical_source'):w['collection']=r['collection']
  w['sources']+=source_list(r)
  w['notes']+=r.get('notes',[]) if isinstance(r.get('notes',[]),list) else [r['notes']]
  w['source_records'].append(r)
  if r.get('image_url'):w['source_image_url']=r['image_url']
 else:
  ident=r.get('source_id') or r.get('ek_id') or hashlib.sha1((title+str(years)).encode()).hexdigest()[:12]
  w=dict(id=norm(ident).replace(' ','-'),canonical_id=r.get('ek_id'),title=title,year_start=years,year_end=r.get('year_end',years),date_display=r.get('date_display') or r.get('date') or (str(years) if years else None),medium=r.get('medium'),height_cm=r.get('height_cm'),width_cm=r.get('width_cm'),dimensions_display=r.get('dimensions_display') or r.get('dimensions'),collection=r.get('collection'),sources=source_list(r),notes=r.get('notes',[]),record_status=r.get('record_status','documented'),record_kind=r.get('record_kind','painting'),source_records=[r],source_image_url=r.get('image_url'),title_aliases=r.get('title_aliases',[]))
  if not isinstance(w['notes'],list):w['notes']=[w['notes']]
  works.append(w)
identity_aliases={}
identity_resolutions=read('data/identity-resolutions-v3.json',[])+read('data/identity-resolutions-v4.json',[])+read('data/gap-identity-v5.json',[])
def reconcile_identities(resolutions):
 for resolution in resolutions:
  keep=next((w for w in works if w['id']==resolution['keep']),None)
  if not keep:continue
  for old_id in resolution['merge']:
   old=next((w for w in works if w['id']==old_id),None)
   if not old:continue
   if old.get('canonical_id'):
    if keep.get('canonical_id') and re.sub(r'\s+','',keep['canonical_id']).upper()!=re.sub(r'\s+','',old['canonical_id']).upper():
     raise ValueError('Conflicting canonical identities in verified merge: '+keep['id']+' / '+old_id)
    if not keep.get('canonical_id'):keep['canonical_id']=old['canonical_id']
   for k in ['height_cm','width_cm','year_start','year_end','medium']:
    a,b=keep.get(k),old.get(k)
    if a is None and b is not None:keep[k]=b
    elif a is not None and b is not None and (norm(a)!=norm(b) if k=='medium' else abs(a-b)>.6):
     conflicts.append(dict(id=keep['id'],field=k,chosen=a,alternative=b,source=old['sources'][0]['url']))
   keep['sources']+=old['sources'];keep['source_records']+=old['source_records'];keep['notes']+=old['notes']
   keep['notes'].append('Verified identity reconciliation: '+resolution['evidence'])
   keep['title_aliases']=list(dict.fromkeys(keep.get('title_aliases',[])+old.get('title_aliases',[])+([old['title']] if norm(old['title'])!=norm(keep['title']) else [])))
   identity_aliases[old_id]=keep['id'];works.remove(old)
   for entry in matches+conflicts:
    if entry.get('id')==old_id:entry['id']=keep['id']
  if resolution.get('date_display'):keep['date_display']=resolution['date_display']
reconcile_identities(identity_resolutions)
coverage=read('research/coverage.json',{})
for c in coverage.get('named_work_candidates',[])+read('data/chronology-later.json',[]):
 v=c.get('verified_metadata',{})
 if v.get('year') is not None:c['year']=v['year']
 if not v and c.get('source_evidence'):
  v={k:c.get(k) for k in ['medium','height_cm','width_cm','collection']};v['source_url']=c['source_url'];c['verified_metadata']=v
 # A proved identity can retain a conflicting historical date. Match that
 # preserved source row rather than recreating an already reconciled gap.
 found=[w for w in works if (c.get('ek_id') and w.get('canonical_id')==c['ek_id']) or (norm(c['title']) in [norm(w['title'])]+[norm(a) for a in w.get('title_aliases',[])] and (c.get('year') is None or c['year']==w['year_start'])) or (w['id'] in set(identity_aliases.values()) and c.get('year') is not None and any(norm(r.get('title',''))==norm(c['title']) and r.get('year_start',r.get('year'))==c['year'] for r in w['source_records']))]
 # A named chronology example does not identify every same-title/year work.
 # Bind its supplementary evidence to an already matching primary source.
 exact=[w for w in found if c.get('ek_id') and w.get('canonical_id')==c['ek_id']]
 source_bound=[w for w in found if v.get('source_url') and any(s.get('url')==v['source_url'] for s in w['sources'])]
 if exact:found=exact
 elif source_bound:found=source_bound
 if c.get('title')=='Blue Green' and 'UNESCO' in str(c.get('source_evidence','')):found=[]
 if found:
  for w in found:
   w['sources'].append(dict(url=c['source_url'],label='Foundation chronology (existence evidence)'))
   if v:
    w['sources'].append(dict(url=v['source_url'],label='Verified supplementary metadata',page=v.get('source_pdf_page')))
    for k in ['medium','height_cm','width_cm','collection']:
     if w.get(k) is None:w[k]=v.get(k)
    if v.get('note'):w['notes'].append(v['note'])
  continue
 works.append(dict(id='gap-'+norm(c['title']).replace(' ','-')+'-'+str(c.get('year') or 'undated'),canonical_id=c.get('ek_id'),title=c['title'],year_start=c.get('year'),year_end=c.get('year_end',c.get('year')),date_display=(str(c['year'])+('–'+str(c['year_end']) if c.get('year_end') and c['year_end']!=c['year'] else '')) if c.get('year') else None,medium=None,height_cm=None,width_cm=None,collection=None,sources=[dict(url=c['source_url'],label='Foundation chronology (existence evidence)')],notes=[c.get('note')],record_status='metadata_incomplete',source_records=[c],record_kind=c.get('record_kind','painting_candidate')))
v6_updates=read('data/gap-root-record-updates-v6.json',[])
for review in v6_updates:
 w=next((w for w in works if w['id']==review['id']),None)
 if not w:raise ValueError('Unknown reviewed record: '+review['id'])
 for k,value in review.get('updates',{}).items():
  if k not in ['record_kind','record_status','medium','collection','height_cm','width_cm','year_start','year_end','date_display']:raise ValueError('Unsupported reviewed field: '+k)
  old=w.get(k)
  if old is not None and old!=value and k not in ['record_kind','record_status']:
   conflicts.append(dict(id=w['id'],field=k,chosen=value,alternative=old,source=review['source_url']))
  w[k]=value
 w['sources'].append(dict(url=review['source_url'],label=review['source_label'],accessed='2026-10-28'))
 w['source_records'].append(dict(source_id='review-v6:'+review['id'],title=w['title'],source_url=review['source_url'],source_evidence=review['evidence'],verified_updates=review['updates']))
 w['notes'].append(review['evidence'])
v6_identities=sum((read('data/gap-'+group+'-identities-v6.json',[]) for group in ['root','museum','market','foundation']),[])
identity_resolutions+=v6_identities
reconcile_identities(v6_identities)
# Enrich gap records without guessing ownership or overriding stronger work records.
for w in works:
 if w['record_status']=='metadata_incomplete':
  v=w['source_records'][0].get('verified_metadata',{})
  if v:
   for k in ['medium','height_cm','width_cm','collection']:
    if v.get(k) is not None:w[k]=v[k]
   w['sources'].append(dict(url=v['source_url'],label='Verified supplementary metadata',page=v.get('source_pdf_page')))
   if v.get('note'):w['notes'].append(v['note'])
 if w.get('canonical_id') in ['EK 348','EK 356']:
  w['notes'].append('Wall/floor painting: published dimensions include three spatial axes. The two-axis size view cannot represent its full installation geometry.')
v5_scope_exclusions=read('data/gap-scope-exclusions-v5.json',[])
v6_scope_exclusions=read('data/gap-scope-exclusions-v6.json',[])+read('data/gap-museum-scope-exclusions-v6.json',[])
scope_exclusions=v5_scope_exclusions+v6_scope_exclusions
excluded_works=[]
for w in works[:]:
 evidence=[e for e in scope_exclusions if e.get('record_id')==w['id'] or (e.get('canonical_id') and e['canonical_id']==w.get('canonical_id'))]
 if evidence:
  w['exclusion_evidence']=evidence;excluded_works.append(w);works.remove(w)
v5_excluded_works=[w for w in excluded_works if any(e in v5_scope_exclusions for e in w['exclusion_evidence'])]
(ROOT/'data/excluded-nonpaintings-v5.json').write_text(json.dumps(v5_excluded_works,ensure_ascii=False,indent=2)+'\n')
(ROOT/'data/excluded-nonpaintings-v6.json').write_text(json.dumps(excluded_works,ensure_ascii=False,indent=2)+'\n')
for w in works:
 w['auction_history']=list({a.get('source_url') or str(a):a for r in w['source_records'] for a in (r.get('auction_history') or ([{k:r.get(k) for k in ['source_id','source_url','auction_house','sale_house','sale_date','sale_title','lot_number','provenance','collection_as_of'] if r.get(k) is not None}] if r.get('auction_house') or r.get('sale_house') or r.get('sale_date') else []))}.values())
 w['market_history']=list({a.get('source_url') or str(a):a for r in w['source_records'] for a in r.get('market_history',[])}.values())
 w['field_conflicts']=[c for c in conflicts if c['id']==w['id']]
 meaningful=[c for c in w['field_conflicts'] if c['field'] in ['height_cm','width_cm','year_start','year_end','medium']]
 for c in meaningful:w['notes'].append('Source discrepancy: '+c['field']+' is recorded here as '+str(c['chosen'])+'; another source reports '+str(c['alternative'])+'. See preserved source rows and reconciliation ledger.')
 if w.get('canonical_id')=='EK 12':w['notes'].append('Scope review: gesso-on-wood painted object/relief included in this broad painting inventory.')
 if w.get('canonical_id')=='EK 50':w['notes'].append('Scope review: dyed-cotton panel work retained alongside paintings; medium is textile, not applied paint.')
# Explicitly reviewed vector studies, separate from asserted museum facts.
STUDY_INPUTS=['studies','chatham-studies','studies-v2','sfmoma-studies-v3','hirshhorn-seattle-studies-v3','broad-moca-studies-v3','additional-studies-v3','core-studies-v4','north-american-studies-v4','international-studies-v4','auction-studies-v4','secondary-studies-v4','short-studies-v4','public-catalogue-studies-v4','gap-root-studies-v5','gap-market-studies-v5','gap-museum-studies-v5','gap-foundation-studies-v5','gap-root-studies-v6','gap-market-studies-v6','gap-museum-studies-v6','gap-foundation-studies-v6']
studies={k:v for name in STUDY_INPUTS for k,v in read('data/'+name+'.json',{}).items()}
for w in works:
 key=w.get('canonical_id') or w['id'];study=studies.get(key) or studies.get(w['id'])
 if not study:
  for row in w['source_records']:
   source_id=row.get('source_id','')
   study=studies.get(source_id) or studies.get(norm(source_id).replace(' ','-'))
   if study:break
 if not study:
  study=next((studies[old_id] for old_id,new_id in identity_aliases.items() if new_id==w['id'] and old_id in studies),None)
 w.update(colors=[],shape_type=None,color_basis='unreviewed',shape_basis='unreviewed',image_svg=None,image_png=None,image_original=None,image_status='not_reconstructed')
 if study:
  w.update(colors=study['colors'],shape_type=study['shape_type'],color_basis='visual_reference_interpretation',shape_basis='visual_reference_interpretation',image_svg=study['path'],image_status='interpretive_svg',study=study)
 else:
  color_tokens=re.findall(r'\b(blue|red|yellow|green|orange|purple|pink|black|white|gray|grey|brown)\b',w['title'].lower())
  w['colors']=list(dict.fromkeys('gray' if x=='grey' else x for x in color_tokens));w['color_basis']='title_derived_nonexhaustive' if color_tokens else 'unreviewed'
  documented_colors=next((r['documented_colors'] for r in reversed(w['source_records']) if r.get('documented_colors')),None)
  if documented_colors:w['colors']=documented_colors;w['color_basis']='primary_source_colour_description'
 if study and study.get('notes'):w['notes'].append(study['notes'])
 if w['title'].startswith('Chatham '):
  w['shape_type']='L shaped joined rectangles'
  w['shape_basis']='MoMA Chatham series description and visual review where available'
 w['missing_fields']=[k for k in ['year_start','medium','height_cm','width_cm','collection','shape_type'] if w.get(k) is None]
 if not w['colors']:w['missing_fields'].append('color_review')
 if not w['image_svg']:w['missing_fields'].append('svg_study')
 w['is_representative']=True;w['duplicate_group']=norm(w['title'])
 w['dimension_role']=next((r['dimension_role'] for r in reversed(w['source_records']) if r.get('dimension_role')),'reported bounding dimensions')
 w['true_scale_eligible']=True
 scale_rows=[r for r in w['source_records'] if r.get('true_scale_eligible') is False]
 if scale_rows:
  w['true_scale_eligible']=False
  w['true_scale_note']=scale_rows[-1].get('true_scale_note') or 'The source dimensions or projection do not yet establish reliable physical scale for this study.'
 if study and study.get('true_scale_eligible') is False:
  w['true_scale_eligible']=False
  w['true_scale_note']=study.get('true_scale_note') or 'This study is available at comparable size only; its reference does not establish physical scale.'
 if w.get('canonical_id') in ['EK 348','EK 356']:
  w['true_scale_eligible']=False;w['dimension_role']='wall-and-floor installation';w['true_scale_note']='SVG uses a schematic oblique projection. Two published axes cannot calibrate this projection to the flat-work centimetre scale.'
 col=str(w.get('collection') or '')
 colmap=[(r'San Francisco Museum|SFMOMA','San Francisco Museum of Modern Art'),(r'Museum of Modern Art, New York','Museum of Modern Art, New York'),(r'Whitney','Whitney Museum of American Art'),(r'National Gallery of Art','National Gallery of Art'),(r'Tate','Tate'),(r'Pompidou|Musée National d.Art Moderne','Centre Pompidou'),(r'Guggenheim','Guggenheim'),(r'Glenstone','Glenstone'),(r'Beyeler','Fondation Beyeler'),(r'Art Institute of Chicago','Art Institute of Chicago'),(r'Private collection','Private collection'),(r'Collection unverified|Unknown|whereabouts unknown','Unknown')]
 w['collection_group']=next((label for pattern,label in colmap if re.search(pattern,col,re.I)),col or None)
 # Deduplicate source URLs without losing source snapshots.
 w['sources']=list({s['url']:dict(s,label=s.get('label') or s.get('institution') or 'Primary collection record') for s in w['sources'] if s.get('url')}.values())
groups={}
for w in works:groups.setdefault(norm(w['title']),[]).append(w)
duplicate_groups=[]
for title,group in groups.items():
 if len(group)<2:continue
 known=sorted([w for w in group if w['year_start'] is not None],key=lambda w:(w['year_start'],w['id']))
 if known:
  chosen=known[0]
  for w in known[1:]:w['is_representative']=False;w['representative_id']=chosen['id']
  for w in group:
   if w['year_start'] is None:w['notes'].append('Same-title dates unresolved: retained visibly because earliest work cannot be established.')
  if sum(w['year_start']==chosen['year_start'] for w in known)>1:
   for w in group:w['notes'].append('Earliest creation-year tie: ordering within the year is unknown. One record is selected deterministically for display.')
  duplicate_groups.append(dict(title=title,representative_id=chosen['id'],members=[w['id'] for w in group]))
works.sort(key=lambda w:(w['year_start'] if w['year_start'] is not None else 9999,w['title'],w['id']))
summary=dict(title='An open research catalogue, not an authenticated catalogue raisonné',as_of='2026-10-26',completeness='Unestablished. The total number of paintings is unknown; unlisted works remain outside this inventory.',records=len(works),earliest_titles=sum(w['is_representative'] for w in works),svg_studies=sum(bool(w['image_svg']) for w in works),metadata_incomplete=sum(w['record_status']=='metadata_incomplete' for w in works),missing_svg=sum(not w['image_svg'] for w in works),source_record_counts={'foundation':len(read('data/foundation.json',[])),'museums':len(read('data/museums.json',[])),'chatham':len(read('data/chatham.json',[])),'moma_1973_selected_captions':len(read('data/moma1973.json',[])),'museum_enrichment_v2':len(read('data/museum-enrichment-v2.json',[])),'screening_enrichment_v2':len(read('data/screening-enrichment-v2.json',[])),'met_painting_dataset_v2':len(read('data/met-enrichment-v2.json',[])),'chronology_named_candidates':len(coverage.get('named_work_candidates',[]))+len(read('data/chronology-later.json',[]))},known_unknowns=coverage.get('coverage_gaps',[]),inventory_total=None,duplicate_rule='Earliest dated instance of the same normalized title among inventoried records. Roman numerals retained; unknown dates remain visible. All source records retained.',collection_note='Collection as reported in the cited source, not a guarantee of current ownership.',visual_note='SVG studies interpret reference geometry, use standardized vivid screen colours, and omit texture, framing, depth, and photographic perspective. They are not facsimiles. No reuse-rights conclusion is asserted.',color_note='Colour search includes title-derived, nonexhaustive tags on records without visual review. Empty colours mean unknown.',size_note='Dimensions in centimetres, h × w; area uses the bounding rectangle, not painted surface. Floor paintings use plan dimensions.',scope='Painting, painted reliefs, and painted canvas panel installations; gesso-on-wood and dyed-cotton panel objects are flagged for scope review. Historical mentions remain provisional.',source_conflicts=coverage.get('source_conflicts',[]))
screening=read('research/museum-screening-ledger.json',{})
summary['museum_screening']={k:screening.get(k) for k in ['as_of','method','targets','distinct_primary_domains','status_counts','work_level_institutions_with_records']}
summary['as_of']='2026-10-28'
summary['documented_scope_exclusions_v5']=len(v5_excluded_works)
v5_baseline=read('research/svg-gap-v5/baseline-catalogue.json',{})
if v5_baseline:
 old_assets={w['image_svg'] for w in v5_baseline['works'] if w.get('image_svg')}
 current_assets={w['image_svg'] for w in works if w.get('image_svg')}
 summary['svg_gap_pass_v5']=dict(baseline_svg_studies=len(old_assets),baseline_svg_gaps=v5_baseline['summary']['missing_svg'],new_svg_studies=len(current_assets-old_assets),remaining_svg_gaps=summary['missing_svg'],scope_exclusions=len(excluded_works),identity_resolutions=len(read('data/gap-identity-v5.json',[])))
v6_baseline=read('research/svg-gap-v6/baseline-catalogue.json',{})
if v6_baseline:
 summary['svg_gap_pass_v5']=v6_baseline['summary'].get('svg_gap_pass_v5',summary.get('svg_gap_pass_v5'))
 previous_assets={w['image_svg'] for w in v6_baseline['works'] if w.get('image_svg')}
 current_assets={w['image_svg'] for w in works if w.get('image_svg')}
 assert previous_assets<=current_assets, 'Previously published SVGs must survive'
 summary['svg_gap_pass_v6']=dict(baseline_svg_studies=len(previous_assets),baseline_svg_gaps=v6_baseline['summary']['missing_svg'],new_svg_studies=len(current_assets-previous_assets),remaining_svg_gaps=summary['missing_svg'],scope_exclusions=len(v6_scope_exclusions),identity_resolutions=len(v6_identities))
summary['museum_research_v4']=screening.get('fresh_pass_v4',{})
for name in SOURCE_INPUTS:
 if name.endswith(('v3','v4','v5','v6')):summary['source_record_counts'][name.replace('-','_')]=len(read('data/'+name+'.json',[]))
summary['catalogue_references']=[{'title':'Yve-Alain Bois, Catalogue Raisonné, volume1:1940–1953 (2015)','url':'https://cahiersdartinstitute.org/catalogues/ellsworth-kelly/description?locale=en'},{'title':'Yve-Alain Bois, Catalogue Raisonné, volume2:1954–1958 (2021)','url':'https://www.artbook.com/9782851173195.html'}]
result=dict(schema_version='1.2',summary=summary,record_aliases=identity_aliases,works=works)
(ROOT/'data/catalogue.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
(ROOT/'data/reconciliation.json').write_text(json.dumps(dict(matches=matches,conflicts=conflicts,duplicate_groups=duplicate_groups,identity_resolutions=identity_resolutions,record_aliases=identity_aliases),ensure_ascii=False,indent=2))
(ROOT/'site/dist/data').mkdir(parents=True,exist_ok=True)
(ROOT/'site/dist/data/catalogue.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
(ROOT/'site/dist/data/coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2))
fields=['id','canonical_id','title','year_start','year_end','medium','height_cm','width_cm','collection','colors','color_basis','shape_type','image_svg','record_status','is_representative','missing_fields','record_kind','dimension_role','true_scale_eligible','auction_history','market_history','sources']
with (ROOT/'data/catalogue.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=fields,lineterminator="\n");writer.writeheader()
 for w in works:writer.writerow({k:json.dumps(w.get(k),ensure_ascii=False) if isinstance(w.get(k),(dict,list)) else w.get(k) for k in fields})
print(json.dumps({k:summary[k] for k in ['records','earliest_titles','svg_studies','missing_svg','metadata_incomplete']}))
