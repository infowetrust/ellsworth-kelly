"""Validate the distributed catalogue/site without undistributed photo references."""
from pathlib import Path
from urllib.parse import urlsplit,parse_qsl
import hashlib,json,re,subprocess,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text())
D=read('data/catalogue.json');W=D['works'];S=read('site/dist/data/catalogue.json');E=read('data/scale-estimates.json')
assert D==S,'Root and browser catalogue differ'
assert len({w['id'] for w in W})==len(W)==D['summary']['records']
eks=[w['canonical_id'] for w in W if w.get('canonical_id')];assert len(eks)==len(set(eks))
assert D['summary']['inventory_total'] is None,'Do not assert a complete oeuvre count'
assets=[w['image_svg'] for w in W if w.get('image_svg')]
assert len(assets)==len(set(assets))==D['summary']['svg_studies']
assert sum(not w.get('image_svg') for w in W)==D['summary']['missing_svg']
for w in W:
    assert w.get('sources') and all(str(s.get('url','')).startswith('https://') for s in w['sources']),w['id']
    for field in ['height_cm','width_cm']:assert w[field] is None or w[field]>0
for path in assets:
    assert re.fullmatch(r'assets/studies/[a-z0-9-]+\.svg',path),path
    p=ROOT/'site/dist'/path;assert p.is_file(),path
    svg=ET.parse(p).getroot();assert svg.tag.endswith('}svg')
    box=[float(v) for v in svg.get('viewBox','').replace(',',' ').split()]
    assert len(box)==4 and box[2]>0 and box[3]>0
    for axis in ['width','height']:
        if svg.get(axis) is not None:assert float(svg.get(axis))>0
    for element in svg.iter():
        assert element.tag.split('}')[-1] not in {'image','script','foreignObject'},path
        for k,v in element.attrib.items():
            assert not k.lower().startswith('on'),path
            if k.endswith('href'):assert v.startswith('#'),path
assert {p.relative_to(ROOT/'site/dist').as_posix() for p in (ROOT/'site/dist/assets/studies').glob('*.svg')}==set(assets)
V=read('data/visual-attributes.json')
assert V==read('site/dist/data/visual-attributes.json'),'Browser visual sidecar differs'
assert V['input_catalogue_sha256']==hashlib.sha256((ROOT/'data/catalogue.json').read_bytes()).hexdigest(),'Stale visual catalog hash'
assert set(V['works'])=={w['id'] for w in W},'Missing visual attribute slots'
for w in W:
    if w.get('image_svg'):
        assert V['works'][w['id']]['source_sha256']==hashlib.sha256((ROOT/'site/dist'/w['image_svg']).read_bytes()).hexdigest(),'Stale SVG analysis: '+w['id']
assert E==read('site/dist/data/scale-estimates.json')
assert E['input_catalogue_sha256']==hashlib.sha256((ROOT/'data/catalogue.json').read_bytes()).hexdigest()
assert set(E['estimates'])=={w['id'] for w in W if w.get('image_svg') and not w.get('true_scale_eligible')}
for name in ['index.html','app.js','gallery.js','style.css','scale-estimates.md','svg-gap-pass-v6.md','research-roadmap.md','research-expansion-v4.md','data/svg-gap-outcomes-v6.json','data/excluded-nonpaintings-v6.json','data/museum-research-queue.json']:
    assert (ROOT/'site/dist'/name).is_file(),name
prohibited={'raw_caption_ocr','raw_caption','raw_ocr','full_ocr','ocr_text','raw_html','html_snapshot','raw_details','source_raw','raw_snapshot','snapshot','snapshots','reference_file','target_reference_file'}
def inspect(value):
    if isinstance(value,dict):
        assert not (set(value)&prohibited),'Raw/private capture fields found'
        for v in value.values():inspect(v)
    elif isinstance(value,list):
        for v in value:inspect(v)
    elif isinstance(value,str) and value.startswith(('http://','https://')):
        assert not any(k.lower() in {'token','access_token','auth_token','session_token'} for k,v in parse_qsl(urlsplit(value).query)),'Session-like URL parameter'
try:
    candidates=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=ROOT).decode().split('\0')
    files=[ROOT/p for p in set(candidates) if p and (ROOT/p).is_file()]
except (subprocess.CalledProcessError,FileNotFoundError):
    files=[p for p in ROOT.rglob('*') if p.is_file() and not any(part in {'.git','node_modules','__pycache__'} for part in p.relative_to(ROOT).parts)]
for p in files:
    rel=p.relative_to(ROOT)
    assert not any(part in {'.openai','node_modules','__pycache__'} for part in rel.parts),str(rel)
    assert p.suffix.lower() not in {'.pdf','.jpg','.jpeg','.png','.webp','.tif','.tiff','.zip','.gz','.pyc'},str(rel)
    text=p.read_text()
    assert not re.search(r'/Users/[A-Za-z0-9._-]+/|/home/[A-Za-z0-9._-]+/',text),'Personal path in '+str(rel)
    assert not re.search(r'-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}',text),'Credential pattern in '+str(rel)
    if p.suffix=='.json':inspect(json.loads(text))
print(json.dumps(dict(records=len(W),svg_studies=len(assets),estimates=len(E['estimates']),files=len(files),result='portable catalogue, SVGs, references and public-export boundary pass')))
