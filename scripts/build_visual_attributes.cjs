#!/usr/bin/env node
/* Alpha-weighted visible paint coverage of original SVG studies, not source photos. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const visual = require(path.join(ROOT, 'site/dist/visual-attributes.js'));
const CHROMATIC = ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'pink'];
const NEUTRAL = ['black', 'white', 'gray', 'brown'];
const THRESHOLDS = { dominant_chromatic_fraction: .40, dominant_total_painted_fraction: .10, neutral_total_painted_fraction: .40, mixed_top_two_max_gap: .10, material_presence_fraction: .00001, unlabeled_neutral_decoration_fraction: .02, rainbow_primary_min_fraction: .20, rainbow_primary_sum_fraction: .75, rainbow_primary_max_fraction: .45, rainbow_wheel_min_hues: 5, rainbow_wheel_min_fraction: .05, rainbow_wheel_max_fraction: .40 };
function sharpModule() {
  for (const name of ['sharp', process.env.KELLY_SHARP_MODULE, path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')].filter(Boolean)) {
    try { return require(name); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }
  }
  throw new Error('Sharp is required: install it with npm install sharp, or set KELLY_SHARP_MODULE to its module path.');
}
function rgb(value) {
  const s = String(value || '').trim().toLowerCase();
  if (/^#[\da-f]{3}$/.test(s)) return [...s.slice(1)].map(c => parseInt(c + c, 16));
  if (/^#[\da-f]{6}$/.test(s)) return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const m = s.match(/^rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);
  if (m) return m.slice(1, 4).map(Number);
  return ({ white: [255,255,255], black: [0,0,0], red: [255,0,0], blue: [0,0,255], green: [0,128,0], yellow: [255,255,0] })[s] || null;
}
function inferFamily(color) {
  const [r,g,b] = color.map(v => v / 255), max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min, l = (max+min)/2;
  if (max < .22) return 'black';
  // Warm cream and light neutral paper are one white family, not spurious yellow.
  if (min > .73 && d < .18) return 'white';
  if (d < .11 || (d / Math.max(max, .001) < .18)) return l > .78 ? 'white' : l < .20 ? 'black' : 'gray';
  let h = d === 0 ? 0 : max === r ? ((g-b)/d)%6 : max === g ? (b-r)/d+2 : (r-g)/d+4;
  h = (h*60+360)%360;
  if (h >= 10 && h < 75 && max < .72) return 'brown';
  if (h < 15 || h >= 345) return 'red';
  if (h < 45) return 'orange';
  if (h < 75) return 'yellow';
  if (h < 170) return 'green';
  if (h < 255) return 'blue';
  if (h < 300) return 'purple';
  return 'pink';
}
function attrs(text) { return Object.fromEntries([...text.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1], m[2] ?? m[3]])); }
function paintPalette(svg) {
  const entries = new Map();
  for (const match of svg.matchAll(/<(?:[\w-]+:)?(?:path|rect|polygon|circle|ellipse|line|polyline)\b([^>]*)>/gi)) {
    const a = attrs(match[1]);
    for (const property of ['fill', 'stroke']) {
      if (!a[property] || a[property] === 'none') continue;
      const c = rgb(a[property]); if (!c) throw new Error('Unsupported paint '+a[property]);
      const declared = visual.normalizeColor(a['data-colour'] || a['data-color']);
      const family = [...CHROMATIC, ...NEUTRAL].includes(declared) ? declared : inferFamily(c);
      const key = c.join(',') + ':' + family;
      entries.set(key, { rgb: c, family, declared: Boolean(declared), property });
    }
  }
  if (!entries.size) throw new Error('No interpretable paints');
  return [...entries.values()];
}
function classifyCoverage(totals, declaredTotals, paintedPixels, palette) {
  const painted = Object.fromEntries([...CHROMATIC,...NEUTRAL].map(c => [c, (totals[c] || 0)/paintedPixels]));
  const chromaticFraction = CHROMATIC.reduce((sum,c) => sum+painted[c],0);
  const chromatic = Object.fromEntries(CHROMATIC.map(c => [c, chromaticFraction ? painted[c]/chromaticFraction : 0]));
  const chromaticDominant = CHROMATIC.filter(c => chromatic[c]+1e-10 >= THRESHOLDS.dominant_chromatic_fraction && painted[c]+1e-10 >= THRESHOLDS.dominant_total_painted_fraction);
  const neutralDominant = NEUTRAL.filter(c => painted[c]+1e-10 >= THRESHOLDS.neutral_total_painted_fraction);
  const primary = ['red','yellow','blue'].map(c => chromatic[c]);
  const balancedPrimary = chromaticFraction >= .10 && primary.every(v => v >= .20-1e-10 && v <= .45+1e-10) && primary.reduce((a,b) => a+b,0) >= .75-1e-10;
  const wheel = chromaticFraction >= .10 && CHROMATIC.filter(c => chromatic[c] >= .05-1e-10).length >= 5 && Math.max(...CHROMATIC.map(c=>chromatic[c])) <= .40+1e-10;
  const significantHues = CHROMATIC.filter(c => painted[c] >= THRESHOLDS.material_presence_fraction);
  const noChromaticDominant = !CHROMATIC.some(c => chromatic[c] >= .40-1e-10);
  const orderedShares=CHROMATIC.map(c=>chromatic[c]).sort((a,b)=>b-a);
  const balancedLeaders=orderedShares[0]-orderedShares[1]<=THRESHOLDS.mixed_top_two_max_gap+1e-10;
  const rainbow = balancedPrimary || wheel;
  const mixed = chromaticFraction >= .10 && significantHues.length >= 2 && (noChromaticDominant || balancedLeaders || rainbow);
  // Real declared neutral areas count even when small. Untagged thin separators do not.
  const materialFamilies = [...CHROMATIC,...NEUTRAL].filter(c => {
    const mass = painted[c];
    if (mass < THRESHOLDS.material_presence_fraction) return false;
    if (NEUTRAL.includes(c) && !(declaredTotals[c] > 0) && mass < .02) return false;
    return true;
  });
  const monochrome = materialFamilies.length === 1;
  let cls = rainbow ? 'rainbow' : mixed ? 'mixed' : chromaticDominant.length ? 'dominant' : chromaticFraction <= .00001 ? 'neutral' : 'no_qualifying_dominant';
  const explanation = monochrome ? `One visible material color family (${materialFamilies[0]}), including neutral support areas.` : `${materialFamilies.length} visible material color families; neutral painted/support fields count for monochrome.`;
  return { dominant_colors: [...chromaticDominant,...neutralDominant], chromatic_dominant_colors: chromaticDominant, color_class: cls, is_rainbow: rainbow, rainbow_basis: balancedPrimary ? 'balanced red/yellow/blue' : wheel ? 'five-or-more-hue wheel' : null, is_mixed: mixed, mixed_basis: mixed ? rainbow ? 'rainbow composition' : balancedLeaders ? 'leading hue shares within ten percentage points' : 'no hue reaches forty percent' : null, is_monochrome: monochrome, monochrome_color: monochrome ? materialFamilies[0] : null, visible_material_colors: materialFamilies, chromatic_fraction_of_painted: chromaticFraction, chromatic_coverage: chromatic, painted_coverage: painted, reason: explanation };
}
async function rasterAttributes(svg, sharp) {
  if (/<(?:image|script|foreignObject)\b/i.test(svg)) throw new Error('SVG contains raster/executable/external content');
  const palette = paintPalette(svg);
  const {data,info} = await sharp(Buffer.from(svg)).resize({width:512,height:512,fit:'inside'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const histogram = new Map(); let paintedPixels = 0;
  for (let i=0;i<data.length;i+=info.channels) {
    const alpha=data[i+3]/255;if (!alpha) continue;
    const key=(data[i]<<16)|(data[i+1]<<8)|data[i+2];histogram.set(key,(histogram.get(key)||0)+alpha);paintedPixels+=alpha;
  }
  if (!paintedPixels) throw new Error('SVG has no painted pixels');
  const totals={},declaredTotals={};
  for (const [key,mass] of histogram) {
    const c=[key>>16,(key>>8)&255,key&255];let nearest=null,dist=Infinity;
    for (const p of palette) {const d=(c[0]-p.rgb[0])**2+(c[1]-p.rgb[1])**2+(c[2]-p.rgb[2])**2;if(d<dist){dist=d;nearest=p;}}
    totals[nearest.family]=(totals[nearest.family]||0)+mass;
    if(nearest.declared)declaredTotals[nearest.family]=(declaredTotals[nearest.family]||0)+mass;
  }
  return {...classifyCoverage(totals,declaredTotals,paintedPixels,palette), raster_width:info.width,raster_height:info.height,painted_pixel_equivalents:paintedPixels,painted_fraction_of_raster:paintedPixels/(info.width*info.height),svg_paint_families:[...new Set(palette.filter(p=>p.declared).map(p=>p.family))]};
}
async function build() {
  const sharp=sharpModule(),file=path.join(ROOT,'data/catalogue.json'),input=fs.readFileSync(file),catalogue=JSON.parse(input),works=catalogue.works||catalogue,result={};
  for (const work of works) {
    const shape_family=visual.inferShapeFamily(work);
    if (!work.image_svg) {result[work.id]={has_visual:false,shape_family,dominant_colors:[],color_class:'unclassified',is_rainbow:false,is_mixed:false,is_monochrome:false,monochrome_color:null,reason:'No SVG study; dominant color and monochrome are unclassified. Source color tags are retained separately in the catalogue.'};continue;}
    const svgPath=path.resolve(ROOT,'site/dist',work.image_svg);if(!svgPath.startsWith(path.join(ROOT,'site/dist/assets/studies/')))throw new Error('Unexpected SVG path');
    const svg=fs.readFileSync(svgPath,'utf8'),measured=await rasterAttributes(svg,sharp);
    const measuredRectangle=shape_family==='Unclassified'&&measured.painted_fraction_of_raster>=.98;
    result[work.id]={has_visual:true,source_svg:work.image_svg,source_sha256:crypto.createHash('sha256').update(svg).digest('hex'),shape_family:measuredRectangle?'Rectangle':shape_family,shape_basis:measuredRectangle?'raster silhouette fills rectangular bounds':'coarse mapping of source shape/support description',...measured};
  }
  const records=Object.values(result),visuals=records.filter(r=>r.has_visual),count=predicate=>records.filter(predicate).length;
  const output={schema_version:1,classification_version:'svg-coverage-1',input_catalogue_sha256:crypto.createHash('sha256').update(input).digest('hex'),method:{rasterizer:{sharp:sharp.versions?.sharp||null,libvips:sharp.versions?.vips||null},basis:'Visible alpha-weighted raster coverage of original SVG studies; paint families come from the SVG data-colour attributes, with RGB hue fallback for untagged paints. Neither catalogue color tags nor recolored previews are used.',raster_max_edge:512,thresholds:THRESHOLDS,neutral_families:NEUTRAL,chromatic_families:CHROMATIC,shape_families:visual.SHAPE_FAMILIES},summary:{records:records.length,svg_analyzed:visuals.length,unclassified_color:count(r=>!r.has_visual),monochrome:count(r=>r.is_monochrome),rainbow:count(r=>r.is_rainbow),mixed:count(r=>r.is_mixed),dominant_color_counts:Object.fromEntries(visual.COLOR_ORDER.filter(c=>!['rainbow','mixed'].includes(c)).map(c=>[c,count(r=>r.dominant_colors.includes(c))])),shape_family_counts:Object.fromEntries(visual.SHAPE_FAMILIES.map(s=>[s,count(r=>r.shape_family===s)]))},works:result};
  const text=JSON.stringify(output,null,2)+'\n';fs.writeFileSync(path.join(ROOT,'data/visual-attributes.json'),text);fs.writeFileSync(path.join(ROOT,'site/dist/data/visual-attributes.json'),text);return output;
}
if(require.main===module)build().then(data=>console.log(JSON.stringify(data.summary,null,2))).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={build,paintPalette,classifyCoverage,rasterAttributes,inferFamily,loadSharp:sharpModule,THRESHOLDS,CHROMATIC,NEUTRAL};
