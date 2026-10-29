/* Exercise the gallery's actual size selection against the complete catalogue. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const catalogue=read('data/catalogue.json'),data=read('data/scale-estimates.json');
assert.equal(data.input_catalogue_sha256,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'data/catalogue.json'))).digest('hex'),'Regenerate estimates after catalogue changes');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'site/dist/gallery.js'),'utf8'),context);
const choose=context.window.KellyGallery.prototype.scaleDimensions;
const studies=catalogue.works.filter(w=>w.image_svg),recorded=w=>w.width_cm>0&&w.height_cm>0&&w.true_scale_eligible!==false;
const unresolved=studies.filter(w=>!recorded(w)),original=JSON.stringify(catalogue);
assert.deepEqual(Object.keys(data.estimates).sort(),unresolved.map(w=>w.id).sort(),'Every unresolved SVG has one estimate');
for(const work of studies){
  const w={...work,scale_estimate:data.estimates[work.id]};
  const plain=choose.call({scaleMode:'recorded'},w),mixed=choose.call({scaleMode:'estimated'},w),only=choose.call({scaleMode:'estimates-only'},w);
  assert.ok(mixed,work.id+' missing from combined view');
  if(recorded(w)){
    assert.equal(plain.width,w.width_cm);assert.equal(plain.height,w.height_cm);
    assert.equal(mixed.width,w.width_cm);assert.equal(mixed.height,w.height_cm);assert.equal(only,null);
  }else{
    assert.equal(plain,null);assert.ok(only?.estimated);assert.ok(mixed.estimated);
    const e=w.scale_estimate;assert.ok(Number.isFinite(e.width_cm)&&e.width_cm>0&&Number.isFinite(e.height_cm)&&e.height_cm>0);
    assert.ok(e.reason&&e.method&&e.confidence);
    assert.ok(Math.abs(Math.log((e.width_cm/e.height_cm)/e.svg_aspect_ratio))<0.002,work.id+' estimated size distorts SVG');
    for(const id of e.comparison_ids||[])assert.ok(studies.some(c=>c.id===id&&recorded(c)),id+' is not a measured comparator');
  }
}
for(const estimate of [null,{}, {width_cm:Infinity,height_cm:10},{width_cm:-1,height_cm:10},{width_cm:10,height_cm:NaN}]){
  assert.equal(choose.call({scaleMode:'estimated'},{true_scale_eligible:false,scale_estimate:estimate}),null);
}
assert.equal(JSON.stringify(catalogue),original,'Display estimation must not mutate factual catalogue fields');
console.log(JSON.stringify({recorded:studies.filter(recorded).length,estimated:unresolved.length,combined:studies.length,checks:'coverage, mode isolation, finite dimensions, aspect preservation, measured comparators, malformed estimates, factual immutability'}));
