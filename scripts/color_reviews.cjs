/* Explicit reviewed decisions override automatic tone suggestions. Pure, reversible data merge. */
'use strict';
const hex=/^#[0-9a-f]{6}$/i,copy=v=>JSON.parse(JSON.stringify(v));
function summarize(data){
 const records=Object.values(data.works),summary={works:records.length,direct_reference_contact_review:records.filter(w=>w.review_scope==='direct_reference_contact_review').length,reference_available:records.filter(w=>w.reference_available).length,automatic_reference_eligible:records.filter(w=>w.automatic_reference_eligible).length,changed_works:records.filter(w=>w.assignments.some(a=>a.from!==a.to)).length,basis_counts:{},work_basis_counts:{},blue_tone_work_counts:{}};
 for(const w of records){for(const b of new Set(w.assignments.map(a=>a.basis)))summary.work_basis_counts[b]=(summary.work_basis_counts[b]||0)+1;for(const a of w.assignments)summary.basis_counts[a.basis]=(summary.basis_counts[a.basis]||0)+1;for(const t of new Set(w.assignments.filter(a=>a.family==='blue').map(a=>a.tone).filter(Boolean)))summary.blue_tone_work_counts[t]=(summary.blue_tone_work_counts[t]||0)+1;}
 return summary;
}
function mergeReviews(input,manifest){
 const data=copy(input);if(!Array.isArray(manifest.reviews))throw Error('Expected explicit review list');
 for(const[family,tones]of Object.entries(manifest.palettes||{})){if(!data.palettes[family])throw Error('Unknown paint family '+family);for(const[tone,value]of Object.entries(tones)){if(!/^[a-z_]+$/.test(tone)||!hex.test(value))throw Error('Invalid reviewed palette');if(data.palettes[family][tone]&&data.palettes[family][tone]!==value)throw Error('Do not globally retint existing tone '+family+'.'+tone);data.palettes[family][tone]=value.toLowerCase();}}
 const reviewIds=new Set();
 for(const review of manifest.reviews){
  if(!review.review_id||reviewIds.has(review.review_id))throw Error('Duplicate/missing review id');reviewIds.add(review.review_id);
  const w=data.works[review.id];if(!w)throw Error('Unknown study '+review.id);
  if(review.geometry_sha256!==w.geometry_sha256)throw Error('Review geometry changed '+review.id);
  if(!['confirmed','corrected','unresolved'].includes(review.decision))throw Error('Unknown review outcome');
  const families=[...new Set(review.families||[])];if(!families.length||families.some(f=>!w.assignments.some(a=>a.family===f)))throw Error('Review family absent '+review.id);
  for(const e of review.evidence||[]){if(e.url&&!/^https?:\/\//.test(e.url))throw Error('Only public source URLs');if(e.sha256&&!/^[a-f0-9]{64}$/.test(e.sha256))throw Error('Bad evidence hash');if(JSON.stringify(e).match(/(?:\/Users\/|\/home\/|file:\/\/)/))throw Error('Private source path');}
  const changes=new Map();for(const change of review.assignments||[]){if(changes.has(change.index))throw Error('Duplicate paint index');const a=w.assignments[change.index];if(!a||a.index!==change.index||a.family!==change.family||!families.includes(a.family)||a.from!==change.original_fill||!hex.test(change.to))throw Error('Paint identity/structure mismatch '+review.id);if(change.tone&&data.palettes[a.family]?.[change.tone]!==change.to.toLowerCase())throw Error('Unregistered reviewed tone '+change.tone);changes.set(change.index,change);}
  if(review.decision==='unresolved'&&changes.size)throw Error('Unresolved source cannot recolor');
  for(const retained of review.retained_assignments||[]){const a=w.assignments[retained.index];if(review.decision!=='unresolved'||!a||a.family!==retained.family||a.from!==retained.original_fill||!families.includes(a.family)||!hex.test(retained.to))throw Error('Invalid provisional retention');a.to=retained.to;a.basis=retained.previous_assignment.basis;a.confidence=retained.previous_assignment.confidence;if(retained.previous_assignment.tone)a.tone=retained.previous_assignment.tone;else delete a.tone;a.unresolved_review_id=review.review_id;}
  if(review.decision!=='unresolved'){
   for(const a of w.assignments){if(!families.includes(a.family))continue;const change=changes.get(a.index),oldEvidence=change?.previous_assignment||a.review_predecessor||{fill:a.to,basis:a.basis,confidence:a.confidence,...(a.tone?{tone:a.tone}:{})};a.review_predecessor=oldEvidence;
    if(change){a.to=change.to.toLowerCase();if(change.tone)a.tone=change.tone;else delete a.tone;}
    a.basis=change?.corrected?'direct_reference_review_v2_correction':'direct_reference_review_v2_confirmed';a.confidence=review.confidence||'medium';a.review_id=review.review_id;
   }
   w.review_scope='direct_reference_contact_review';w.reviewed_families=[...new Set([...(w.reviewed_families||[]),...families])].sort();w.reason='Specific source-image review of '+w.reviewed_families.join(', ')+'. Per-paint decisions, sources and limits are recorded; screen colors are interpretive, not calibrated pigments.';
  }
  w.color_reviews=(w.color_reviews||[]).filter(r=>r.review_id!==review.review_id);w.color_reviews.push(copy(review));
 }
 data.version='source-informed-limited-palette-2';data.as_of=manifest.as_of;data.method.reviewed_override_policy='Explicit, source-reviewed paint-index decisions and confirmations take precedence over automatic tone proposals. No cross-painting white-balance transfer. Original pre-palette fills remain available for rollback.';
 data.summary=summarize(data);const unique=decision=>new Set(manifest.reviews.filter(r=>r.decision===decision).map(r=>r.id)).size;
 const acceptedIds=new Set(manifest.reviews.filter(r=>r.decision!=='unresolved').map(r=>r.id)),unresolvedIds=new Set(manifest.reviews.filter(r=>r.decision==='unresolved').map(r=>r.id)),correctedIds=new Set(manifest.reviews.filter(r=>r.decision==='corrected').map(r=>r.id));
 data.review_summary={as_of:manifest.as_of,screened_records:new Set(manifest.reviews.map(r=>r.id)).size,unresolved_only_records:[...unresolvedIds].filter(id=>!acceptedIds.has(id)).length,partially_unresolved_records:[...unresolvedIds].filter(id=>acceptedIds.has(id)).length,confirmed_only_records:[...acceptedIds].filter(id=>!correctedIds.has(id)).length,reviewed_records:new Set(manifest.reviews.filter(r=>r.decision!=='unresolved').map(r=>r.id)).size,corrected_records:unique('corrected'),confirmed_records:unique('confirmed'),unresolved_records:unique('unresolved'),corrected_paints:manifest.reviews.reduce((n,r)=>n+(r.assignments||[]).filter(a=>a.corrected).length,0),private_reference_photos_distributed:0};
 return data;
}
module.exports={mergeReviews,summarize};
