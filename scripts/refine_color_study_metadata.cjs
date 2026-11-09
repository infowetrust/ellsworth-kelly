#!/usr/bin/env node
/* Remove obsolete palette claims without touching any renderable SVG content. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),file=path.join(ROOT,'data/color-studies.json'),data=JSON.parse(fs.readFileSync(file));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const annotations=/(<(?:desc|metadata)\b[^>]*>)[\s\S]*?(<\/(?:desc|metadata)>)/gi;
const withoutAnnotations=s=>s.replace(annotations,'$1ANNOTATION$2');
const geometry=s=>withoutAnnotations(s).replace(/\bfill\s*=\s*(["'])(#[0-9a-f]{3}(?:[0-9a-f]{3})?)\1/gi,(m,q)=>`fill=${q}PALETTE${q}`);
function currentPaletteNote(w){
 const accepted=(w.color_reviews||[]).filter(r=>r.decision!=='unresolved');if(accepted.length)return 'Palette refinement ('+data.as_of+'): specific source-image review of '+[...new Set(accepted.flatMap(r=>r.families))].join(', ')+(accepted.some(r=>(r.evidence||[]).some(e=>e.kind==='contributor_photo'))?' including an unpublished contributor photograph':'')+'; interpretive screen colors, not calibrated to original paint.';
 if(w.color_reviews?.length)return 'Palette refinement ('+data.as_of+'): source review remains unresolved for '+[...new Set(w.color_reviews.flatMap(r=>r.families))].join(', ')+'; prior provisional screen colors retained, not calibrated to original paint.';
 if(w.review_scope==='direct_reference_contact_review')return'Palette refinement (2026-11-08): source-reference contact review plus recorded family defaults; interpretive screen colors, not calibrated to original paint.';
 if(w.assignments.some(a=>a.basis==='automated_reference_tone_proposal'))return'Palette refinement (2026-11-08): low-confidence reference-assisted tone proposals and prior family defaults; not individually color-verified or calibrated to original paint.';
 return'Palette refinement (2026-11-08): prior color-family tones and defaults; no new individual color-reference review or calibration to original paint.';
}
function revise(text){return text.replace(/The dark blue is intentionally more vivid than the near-black source photograph\.\s*/g,'').replace(/standardi[sz]ed(?:\s+vivid)?/gi,'interpretive').replace(/\bvivid\b/gi,'interpretive').replace(/interpretive\s+interpretive/gi,'interpretive');}
const writes=[];let updated=0;
for(const[id,w]of Object.entries(data.works)){
 const dest=path.join(ROOT,'site/dist',w.path),before=fs.readFileSync(dest,'utf8');
 const legacyStructure=before.replace(/\bfill\s*=\s*(["'])(#[0-9a-f]{3}(?:[0-9a-f]{3})?)\1/gi,(m,q)=>`fill=${q}PALETTE${q}`);
 const expectedStructure=data.structure_hash_method==='svg_structure_excluding_fill_values_and_desc_metadata_text'?geometry(before):legacyStructure;
 if(hash(expectedStructure)!==w.geometry_sha256)throw Error('Pre-existing structure change '+id);
 const currentFills=[...before.matchAll(/\bfill\s*=\s*(["'])(#[0-9a-f]{3}(?:[0-9a-f]{3})?)\1/gi)].map(m=>m[2].toLowerCase());
 if(JSON.stringify(currentFills)!==JSON.stringify(w.assignments.map(a=>a.to)))throw Error('Pre-existing fill change '+id);
 let after=before.replace(/(<(desc|metadata)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,(m,start,tag,body,end)=>{
  let text=revise(body);
  if(tag.toLowerCase()==='desc'){
   text=text.replace(/\s*Palette refinement \(\d{4}-\d{2}-\d{2}\):[\s\S]*$/,'').trimEnd();
   text+=' '+currentPaletteNote(w);
  }
  return start+text+end;
 });
 if(!/<desc\b/i.test(after))throw Error('Missing description '+id);
 if(withoutAnnotations(before)!==withoutAnnotations(after))throw Error('Renderable content altered '+id);
 const oldUrls=[...before.matchAll(/https?:[^\s<"']+/g)].map(m=>m[0]);
 const newUrls=[...after.matchAll(/https?:[^\s<"']+/g)].map(m=>m[0]);
 if(JSON.stringify(oldUrls)!==JSON.stringify(newUrls))throw Error('Source URL altered '+id);
 if(before!==after)updated++;
 w.geometry_sha256=hash(geometry(after));
 w.metadata_refinement={date:w.color_reviews?.length?data.as_of:(w.metadata_refinement?.date||'2026-11-08'),scope:'desc and metadata text only',prior_annotations_sha256:w.metadata_refinement?.prior_annotations_sha256||hash([...before.matchAll(annotations)].map(m=>m[0]).join('\n')),description_basis:(w.color_reviews||[]).some(r=>r.decision!=='unresolved')?'source_review_v2':w.color_reviews?.length?'source_review_unresolved_v2':w.review_scope==='direct_reference_contact_review'?'reference_contact_review':w.assignments.some(a=>a.basis==='automated_reference_tone_proposal')?'low_confidence_reference_assisted':'prior_family_default',current_annotations_sha256:hash([...after.matchAll(annotations)].map(m=>m[0]).join('\n'))};
 writes.push([dest,after]);
}
data.structure_hash_method='svg_structure_excluding_fill_values_and_desc_metadata_text';
data.metadata_refinement={date:data.as_of,scope:'Only nonrendering desc/metadata palette wording; source URLs, title, geometry, attributes and every fill unchanged. Prior fill rollback remains available; rollback does not restore obsolete annotation wording.',works:Object.keys(data.works).length};
if(process.argv.includes('--apply')){
 for(const[dest,s]of writes)fs.writeFileSync(dest,s);
 const out=JSON.stringify(data,null,2)+'\n';fs.writeFileSync(file,out);fs.writeFileSync(path.join(ROOT,'site/dist/data/color-studies.json'),out);
}
console.log(JSON.stringify({checked:writes.length,annotation_updates:updated,renderable_content:'byte-identical',source_urls:'unchanged',applied:process.argv.includes('--apply')},null,2));
