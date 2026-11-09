#!/usr/bin/env node
/* Fill-only, reversible palette study. Public replay requires no source photographs. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),FILE=path.join(ROOT,'data/color-studies.json');
const sharp=require('./build_visual_attributes.cjs').loadSharp();
const visual=require('../site/dist/visual-attributes.js');
const PALETTES={
 blue:{ink:'#1b3158',ultramarine:'#293d94',cobalt:'#1f5fc6',cyan:'#087bbd',light:'#80a7c7'},
 red:{scarlet:'#dc302f',vermilion:'#ef4b28',carmine:'#b72f42',oxide:'#b83b28'},
 yellow:{lemon:'#f4df39',golden:'#f2cf27',ochre:'#dfb32b',pale:'#e7d77b'},
 green:{deep:'#17463f',forest:'#206b4a',emerald:'#169452',grass:'#3fa044',lime:'#91b638',teal:'#188a7c'},
 orange:{bright:'#ec7627',warm:'#e99132',red_orange:'#ef5825',gold:'#ebae2b'},
 purple:{violet:'#74429c',deep:'#50336f',soft:'#a184bd'},
 pink:{rose:'#e386a7',deep:'#bc487c'},
 black:{carbon:'#20211f',soft:'#303332'},
 white:{clean:'#f8f7f1',warm:'#eeeada',cream:'#e8dbba'},
 gray:{mist:'#e1e4df',light:'#c4c7c3',middle:'#969d9a',dark:'#626c70',charcoal:'#343c43'},
 brown:{umber:'#77513a',wood:'#aa8358',red:'#914a32'}
};
// Direct contact-sheet review of cited source photographs. These are interpretations,
// not measurements or assertions about pigment. Multiple-tone spectra retain tone order.
const DIRECT={
 'ek-22':{blue:'light'},'ek-54':{blue:'cyan',orange:'bright',pink:'rose'},
 'ek-50':{blue:'ultramarine',red:'scarlet',yellow:'golden',white:'cream'},
 'ek-124':{blue:'cobalt',white:'warm'},'ek-137':{blue:'cyan',green:'grass'},
 'ek-225':{blue:'cyan'},'ek-289':{blue:'cyan',green:'emerald'},
 'ek-295':{blue:'ultramarine'},'ek-278':{blue:'cobalt',green:'forest'},
 'ek-316':{blue:'ultramarine',red:'vermilion',green:'emerald'},
 'ek-351':{blue:'light',green:'grass',red:'vermilion',yellow:'lemon'},
 'ek-348':{blue:'cobalt',green:'forest',red:'vermilion',yellow:'golden'},
 'ek-350':{blue:'ultramarine',red:'carmine',yellow:'lemon'},
 'ek-360':{blue:'cyan',green:'grass',yellow:'golden',orange:'bright',red:'scarlet'},
 'ek-356':{blue:'cyan',red:'vermilion'},'ek-407':{blue:'ultramarine',red:'vermilion',white:'warm'},
 'ek-451':{blue:'ultramarine',red:'vermilion',yellow:'golden'},
 'ek-706':{blue:'ink'},'ek-856':{blue:'cyan'},
 'ek-896':{blue:'cyan',red:'vermilion',green:'emerald'},
 'ek-922':{blue:'cobalt',red:'vermilion',green:'grass'},
 'ek-924':{blue:'cobalt',green:'emerald'},'ek-988':{blue:'cobalt'},
 'ek-1030':{blue:'cyan',red:'scarlet',yellow:'lemon',green:'emerald'},
 'guggenheim1996-cat-111':{blue:'light'},'moma-82211':{blue:'light'},
 'matthewmarks-kite-i-1952-44834':{blue:'cobalt',red:'scarlet',yellow:'golden'},
 'guggenheim1996-cat-26':{blue:'ultramarine'},
 'guggenheim1996-cat-34':{blue:'ultramarine'},'guggenheim1996-cat-36':{blue:'cyan'},
 'guggenheim1996-cat-41':{blue:'cyan',green:'forest'},
 'artic-v4-57211':{blue:'ink'},'gap-blue-white-1962':{blue:'cyan'},
 'freeman-pf0900':{blue:'ultramarine',red:'vermilion',green:'emerald'},
 'modern-v3-1784':{blue:'cobalt',red:'vermilion'},
 'lacma-33895':{blue:'ultramarine'},'north-v4-ago-whiteblue':{blue:'cyan'},
 'seattle-14331':{red:'vermilion'},'museum-v2-dia-50442':{blue:'cyan',red:'vermilion'},
 'museum-v2-mumok-blue-curve':{blue:'cyan'},'whitney-16879':{blue:'cyan',red:'scarlet'},
 'hirshhorn-07-2':{red:'vermilion',yellow:'golden',blue:'cobalt'},
 'moca-v3-two-panels-yellow-with-large-blue':{blue:'ultramarine',yellow:'lemon'},
 'broad-v3-blue-yellow-red-iv':{blue:'ultramarine',red:'vermilion'},
 'guggenheim1996-essay-74-fig-3':{blue:'ink'},'ncma-8122':{blue:'ultramarine'},
 'sfmoma-513-5':{blue:'ink'},'artic-v4-152760':{blue:'ultramarine'},
 'international-v4-saint-etienne-blue-diagonal-curve':{blue:'cyan'},
 'international-v4-maeght-blue-floor-panel-leo':{blue:'cyan'},
 'whitney-17195':{blue:'cobalt'},
 'matthewmarks-dark-blue-with-white-relief-2002-18625':{blue:'ink'},
 'matthewmarks-dark-blue-relief-2008-31223':{blue:'ink'},
 'matthewmarks-red-relief-over-dark-blue-2004-25969':{red:'vermilion',blue:'ultramarine'},
 'ek-a-29':{yellow:'pale',white:'warm'},'sfmoma-v3-99-348':{yellow:'pale',white:'warm'},
 'international-v4-kroller-plant-i':{white:'warm'},'ek-a-22':{white:'warm'},
 'sfmoma-504-5':{white:'warm'},'sfmoma-v3-fc-571':{white:'warm'},
 'ek-12':{white:'cream'},
 'guggenheim1996-cat-127':{yellow:'pale'},'moma1973-pdf64-caption1':{red:'vermilion'},
 'hirshhorn-72-161':{red:'vermilion'},'sfmoma-v3-66-3':{red:'vermilion'},
 'sfmoma-508-5':{red:'vermilion'},'ek-290':{red:'vermilion'},'ek-206':{red:'vermilion'},
 'guggenheim-venice-green-red':{red:'vermilion'},'christies-6168970':{red:'carmine'},
 'ek-273':{yellow:'lemon'},'ek-288':{yellow:'lemon',orange:'warm'},
 'christies-5895383':{yellow:'pale'},
 'ek-700':{green:'deep'},'modern-v3-1781':{green:'deep'},
 'hirshhorn-07-31':{green:'deep'},'guggenheim1996-cat-74':{gray:'charcoal'},
 'guggenheim1996-cat-72':{gray:'charcoal'},'moma-80300':{orange:'red_orange'},
 'north-v4-philadelphia-black-red-orange':{orange:'red_orange'},
 'ek-835':{red:'vermilion'},'ek-809':{red:'carmine',orange:'red_orange'},
 'north-v4-slam-purple-panel':{purple:'deep'},'sfmoma-v3-fc-465':{purple:'deep'},
 'ek-502':{red:'vermilion'},'whitney-17194':{yellow:'lemon'},
 'matthewmarks-25976':{green:'lime',orange:'gold',yellow:'golden'},
 'matthewmarks-red-on-black-2001-12574':{red:'oxide'},
 'matthewmarks-red-curved-panel-1994-2483':{red:'oxide'},
 'matthewmarks-red-orange-curve-1997-5074':{orange:'red_orange'},
 'museum-v2-flv-green-relief':{green:'teal'},
 'matthewmarks-gray-curve-relief-2010-33754':{gray:'mist'},
 'matthewmarks-gray-curved-relief-2012-37114':{gray:'mist'}
};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const fillRE=/\bfill\s*=\s*(["'])(#[0-9a-f]{3}(?:[0-9a-f]{3})?)\1/gi;
const allFills=s=>[...s.matchAll(fillRE)].map(m=>m[2].toLowerCase());
const geometry=s=>s.replace(/(<(?:desc|metadata)\b[^>]*>)[\s\S]*?(<\/(?:desc|metadata)>)/gi,'$1ANNOTATION$2').replace(fillRE,(whole,q)=>`fill=${q}PALETTE${q}`);
const rgb=s=>{s=s.slice(1);if(s.length===3)s=[...s].map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16));};
const dist=(a,b)=>a.reduce((sum,n,i)=>sum+(n-b[i])**2,0);
function hsv(c){const [r,g,b]=c.map(v=>v/255),v=Math.max(r,g,b),m=Math.min(r,g,b),d=v-m;let h=!d?0:v===r?((g-b)/d)%6:v===g?(b-r)/d+2:(r-g)/d+4;return[(h*60+360)%360,v?d/v:0,v];}
function pixelFamily(c){const [h,s,v]=hsv(c);if(v<.10||s<.26)return null;if(h<16||h>=345)return'red';if(h<44)return v<.6?'brown':'orange';if(h<74)return'yellow';if(h<170)return'green';if(h<255)return'blue';if(h<300)return'purple';return'pink';}
function fillFamilies(s){const out=[];for(const m of s.matchAll(/<[^!?][^>]*>/g)){const tag=m[0],family=visual.normalizeColor(tag.match(/\bdata-colou?r=["']([^"']+)["']/i)?.[1]);for(const f of tag.matchAll(fillRE))out.push(family||require('./build_visual_attributes.cjs').inferFamily(rgb(f[2])));}return out;}
function nearest(family,color){const p=PALETTES[family];if(!p)return null;return Object.keys(p).sort((a,b)=>dist(rgb(p[a]),color)-dist(rgb(p[b]),color))[0];}
function redTone(c){const[h,s,v]=hsv(c);if(h>8&&h<30)return v<.75?'oxide':'vermilion';if(h>=345||v<.69)return'carmine';return'scarlet';}
function blueTone(c){const[h,s,v]=hsv(c);if(v<.42)return'ink';if(s<.54&&v>.55)return'light';if(h<208)return'cyan';if(v<.64||h>232)return'ultramarine';return'cobalt';}
async function referenceStats(file){try{const {data,info}=await sharp(file).resize({width:320,height:320,fit:'inside'}).removeAlpha().raw().toBuffer({resolveWithObject:true}),bins={};for(let i=0;i<data.length;i+=info.channels){const c=[data[i],data[i+1],data[i+2]],f=pixelFamily(c);if(!f)continue;const k=c.map(v=>Math.floor(v/16)).join(',');bins[f]??=new Map();const bin=bins[f].get(k)||{sum:[0,0,0],count:0};bin.count++;c.forEach((v,j)=>bin.sum[j]+=v);bins[f].set(k,bin);}const result={};for(const[f,map]of Object.entries(bins)){const sorted=[...map.values()].sort((a,b)=>b.count-a.count),total=sorted.reduce((n,b)=>n+b.count,0);if(total<Math.max(40,info.width*info.height*.002))continue;const top=sorted.slice(0,5),weight=top.reduce((n,b)=>n+b.count,0);result[f]={rgb:[0,1,2].map(j=>Math.round(top.reduce((n,b)=>n+b.sum[j],0)/weight)),fraction_of_reference:total/(info.width*info.height)};}return result;}catch{return{};}}
function findReference(work,referenceRoot){if(!referenceRoot)return null;const id=work.study?.reference_id;if(id){const f=path.resolve(referenceRoot,id);if(fs.existsSync(f))return f;}return null;}
function referenceSafety(work){const id=work.study?.reference_id||'';if(DIRECT[work.id])return{usable:true,reason:'Specific painting/panel colors visually located in the cited reference.'};if(!/\.(?:jpe?g|png|webp|tiff?)$/i.test(id))return{usable:false,reason:'No directly usable source image; observation text or missing reference is not pixel evidence.'};if(/svg-gap|public-catalogues|short.catalog|\/pages\/|moma-pages|(?:page|plate|fig|studio|installation|frontis|contact|comparison|preview)[-_\d.]/i.test(id))return{usable:false,reason:'Book, installation, composite or unreviewed contextual reference: automatic tone sampling rejected until a target crop is verified.'};return{usable:true,reason:'Existing object-specific museum/gallery/Foundation reference; automatic family-tone proposal only, not a new individual visual review.'};}
function replaceFills(svg,values){let n=0;const out=svg.replace(fillRE,(all,q)=>`fill=${q}${values[n++]}${q}`);if(n!==values.length)throw Error('Fill count changed');return out;}
async function derive(){
 const referenceRoot=process.env.KELLY_REFERENCE_ROOT;if(!referenceRoot)throw Error('--derive requires KELLY_REFERENCE_ROOT; it is never serialized. Replay existing assignments with --apply.');
 const old=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE)):null,works=JSON.parse(fs.readFileSync(path.join(ROOT,'data/catalogue.json'))).works.filter(w=>w.image_svg),result={};
 for(const w of works){const file=path.join(ROOT,'site/dist',w.image_svg),current=fs.readFileSync(file,'utf8'),prior=old?.works?.[w.id],before=prior?.prior_fills||allFills(current);if(prior&&geometry(current)!==geometry(replaceFills(current,before)))throw Error('Unexpected geometry');const baseline=replaceFills(current,before),families=fillFamilies(baseline);if(families.length!==before.length)throw Error('Fill parse mismatch '+w.id);
  const reference=findReference(w,referenceRoot),safety=referenceSafety(w),stats=reference&&safety.usable?await referenceStats(reference):{},distinct={};before.forEach((c,i)=>{(distinct[families[i]]??=new Set()).add(c);});
  const assignments=before.map((from,i)=>{const family=families[i],palette=PALETTES[family];if(!palette)return{index:i,family,from,to:from,basis:'retained_unmapped_paint',confidence:'low'};let tone,basis,confidence;
   // Preserve continuous hue progressions and relief shading; collapse would remove evidence.
   const progressive=distinct[family]?.size>1;
   if(progressive&&['white','gray','black'].includes(family)){return{index:i,family,from,to:from,basis:'retained_relief_or_neutral_tone_variation',confidence:'medium'};}
   if(distinct[family]?.size>=3){return{index:i,family,from,to:from,basis:'retained_spectral_tone_progression',confidence:'medium'};}
   if(progressive){tone=family==='blue'?blueTone(rgb(from)):nearest(family,rgb(from));basis='prior_multitone_order_preserved';confidence='low';}
   else if(DIRECT[w.id]?.[family]){tone=DIRECT[w.id][family];basis='direct_reference_contact_review';confidence='medium';}
   else if(stats[family]&&['blue','red','yellow','green','orange','purple','pink','brown'].includes(family)){tone=family==='blue'?blueTone(stats[family].rgb):family==='red'?redTone(stats[family].rgb):nearest(family,stats[family].rgb);basis='automated_reference_tone_proposal';confidence='low';}
   else {tone=family==='blue'&&/\bdark blue\b/i.test(w.title)?'ink':family==='green'&&/\bdark green\b/i.test(w.title)?'deep':family==='gray'&&/\bdark gr[ae]y\b/i.test(w.title)?'charcoal':nearest(family,rgb(from));basis=/\bdark (?:blue|green|gr[ae]y)\b/i.test(w.title)&&['blue','green','gray'].includes(family)?'title_supported_dark_family_default':'prior_family_palette_default';confidence='low';}
   return{index:i,family,from,to:palette[tone],tone,basis,confidence,...(stats[family]?{reference_tone_rgb:stats[family].rgb,reference_family_fraction:stats[family].fraction_of_reference}:{})};});
  for(const family of Object.keys(distinct)){const group=assignments.filter(a=>a.family===family);if(distinct[family].size>1&&new Set(group.map(a=>a.to)).size<distinct[family].size){for(const a of group){a.to=a.from;delete a.tone;a.basis='retained_multitone_to_prevent_collapse';a.confidence='medium';}}}
  result[w.id]={...(prior?.metadata_refinement?{metadata_refinement:prior.metadata_refinement}:{}),path:w.image_svg,title:w.title,source_urls:[...new Set([w.study?.reference_url,...(w.sources||[]).map(s=>s.url)].filter(s=>/^https?:\/\//.test(s||'')))],reference_available:Boolean(reference),automatic_reference_eligible:safety.usable,reference_evidence_note:safety.reason,reference_sha256:reference?sha(fs.readFileSync(reference)):null,review_scope:DIRECT[w.id]?'direct_reference_contact_review':'automated_or_prior_only',geometry_sha256:sha(geometry(baseline)),prior_sha256:sha(baseline),prior_fills:before,assignments,reason:DIRECT[w.id]?'Cited source photograph viewed in the palette pass; color impression translated into a limited screen palette.':'Reference pixel statistics propose hue-family tone where usable; no claim of individual visual review. Monochrome/no-color or ambiguous references fall back to prior tone. Source photographs are not color-calibrated.'};
 }
 const records=Object.values(result),summary={works:records.length,direct_reference_contact_review:records.filter(w=>w.review_scope==='direct_reference_contact_review').length,reference_available:records.filter(w=>w.reference_available).length,automatic_reference_eligible:records.filter(w=>w.automatic_reference_eligible).length,changed_works:records.filter(w=>w.assignments.some(a=>a.from!==a.to)).length,basis_counts:{},work_basis_counts:{},blue_tone_work_counts:{}};
 for(const w of records){for(const b of new Set(w.assignments.map(a=>a.basis)))summary.work_basis_counts[b]=(summary.work_basis_counts[b]||0)+1;for(const a of w.assignments)summary.basis_counts[a.basis]=(summary.basis_counts[a.basis]||0)+1;for(const t of new Set(w.assignments.filter(a=>a.family==='blue').map(a=>a.tone).filter(Boolean)))summary.blue_tone_work_counts[t]=(summary.blue_tone_work_counts[t]||0)+1;}
 let out={schema_version:1,structure_hash_method:'svg_structure_excluding_fill_values_and_desc_metadata_text',...(old?.metadata_refinement?{metadata_refinement:old.metadata_refinement}:{}),version:'source-informed-limited-palette-1',as_of:'2026-11-08',description:'Interpretive screen palette assignments, not pigment measurements. Local source references remain private; public URLs and content hashes support provenance. Geometry and material color-family labels are unchanged.',palettes:PALETTES,method:{reference_sampling:'320px max-edge reference histogram; high-chroma family mask, five most frequent quantized bins; excludes neutral backgrounds. Automatic proposals are explicitly low-confidence. Contact/manual decisions can override.',blue_rule:'Five deliberately spaced blue impressions: ink, ultramarine, cobalt, cyan and light. Dark title fallback only when usable color-reference signal is absent. Existing spectral progressions and essential within-family tone differences are retained rather than collapsed into identical fills.',limits:'Installation photos and book plates can contain other paintings; monochrome references provide no recoverable chromatic evidence. Reference proposals are not 497 individual visual reviews. Original gradients and relief shade variation are retained.',replay:'node scripts/build_color_studies.cjs --apply',rollback:'node scripts/build_color_studies.cjs --rollback'},summary,works:result};const reviewedFile=path.join(ROOT,'data/color-review-overrides.json');if(fs.existsSync(reviewedFile))out=require('./color_reviews.cjs').mergeReviews(out,JSON.parse(fs.readFileSync(reviewedFile)));save(out);return out;
}
function save(data){const text=JSON.stringify(data,null,2)+'\n';fs.mkdirSync(path.join(ROOT,'site/dist/data'),{recursive:true});fs.writeFileSync(FILE,text);fs.writeFileSync(path.join(ROOT,'site/dist/data/color-studies.json'),text);}
function apply(data,rollback=false){for(const[id,w]of Object.entries(data.works)){const file=path.join(ROOT,'site/dist',w.path),svg=fs.readFileSync(file,'utf8');if(sha(geometry(svg))!==w.geometry_sha256)throw Error('Geometry changed: '+id);const out=replaceFills(svg,rollback?w.prior_fills:w.assignments.map(a=>a.to));if(sha(geometry(out))!==w.geometry_sha256)throw Error('Geometry mutation');fs.writeFileSync(file,out);}}
function audit(data){const reviewedFile=path.join(ROOT,'data/color-review-overrides.json');if(fs.existsSync(reviewedFile)){const expected=require('./color_reviews.cjs').mergeReviews(data,JSON.parse(fs.readFileSync(reviewedFile)));for(const[id,w]of Object.entries(data.works))if(JSON.stringify(w.assignments.map(a=>a.to))!==JSON.stringify(expected.works[id].assignments.map(a=>a.to)))throw Error('Reviewed override lost '+id);}let changes=0;for(const[id,w]of Object.entries(data.works)){const s=fs.readFileSync(path.join(ROOT,'site/dist',w.path),'utf8');if(sha(geometry(s))!==w.geometry_sha256)throw Error('Geometry mismatch '+id);if(w.metadata_refinement?.current_annotations_sha256&&sha([...s.matchAll(/(<(?:desc|metadata)\b[^>]*>)[\s\S]*?(<\/(?:desc|metadata)>)/gi)].map(m=>m[0]).join('\n'))!==w.metadata_refinement.current_annotations_sha256)throw Error('Annotation mismatch '+id);if(JSON.stringify(allFills(s))!==JSON.stringify(w.assignments.map(a=>a.to)))throw Error('Unexpected fills '+id);if(w.assignments.some(a=>a.from!==a.to))changes++;}return{works:Object.keys(data.works).length,changed:changes,geometry:'unchanged',fills:'match sidecar'};}
(async()=>{const args=process.argv.slice(2);let data=args.includes('--derive')?await derive():JSON.parse(fs.readFileSync(FILE));if(args.includes('--apply'))apply(data);if(args.includes('--rollback'))apply(data,true);if(args.includes('--audit'))console.log(JSON.stringify(audit(data),null,2));else console.log(JSON.stringify(data.summary,null,2));})().catch(e=>{console.error(e);process.exitCode=1;});
