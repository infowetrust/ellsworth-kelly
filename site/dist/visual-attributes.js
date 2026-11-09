/* Original-study visual attributes. Recoloring previews never change this data. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KellyVisual = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';
  const SHAPE_FAMILIES = ['Rectangle', 'Circle & oval', 'Triangle & sector', 'Polygon & diagonal', 'Curved form', 'Joined panels', 'Separate panels', 'Unclassified'];
  const COLOR_ORDER = ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'brown'];
  const normalizeColor = value => {
    const c = String(value || '').toLowerCase().trim();
    return ({ violet: 'purple', grey: 'gray', lightgray: 'gray', darkgray: 'gray', lightgrey: 'gray', darkgrey: 'gray', cyan: 'blue', teal: 'blue', lime: 'green', cream: 'white', ivory: 'white' })[c] || c;
  };
  function inferShapeFamily(work) {
    const s = String(work && work.shape_type || '').toLowerCase().replace(/[_-]/g, ' ');
    const medium = String(work && work.medium || '').toLowerCase();
    if (/separat|partial.*panels/.test(s)) return 'Separate panels';
    if (/joined|overlapping|hinged|wall and floor|\bl shaped\b|\btriptych\b/.test(s)) return 'Joined panels';
    if (/installation/.test(s)) {
      const description = [medium, ...(work && work.notes || [])].join(' ').toLowerCase();
      return /joined panels/.test(description) ? 'Joined panels' : 'Separate panels';
    }
    if (!s && /(?:two|three|four|five|six|seven|nine|eleven|eighteen)\s+(?:joined\s+)?panels/.test(medium)) return /joined/.test(medium) ? 'Joined panels' : 'Separate panels';
    if (/^(?:rectangle|rectangular|square)\b|\bon rectangle\b|rectangular ground/.test(s)) return 'Rectangle';
    if (/\b(?:circle|circular|oval|ellipse|elliptic|disk|disc|ring)\b/.test(s)) return 'Circle & oval';
    if (/triangle|triangular|sector|fan shaped/.test(s)) return 'Triangle & sector';
    if (/polygon|diagonal|quadrilateral|pentagon|hexagon|trapezoid|parallelogram|diamond/.test(s)) return 'Polygon & diagonal';
    if (/curv|lens|lobe|biomorph|crescent|arc|cutout/.test(s)) return 'Curved form';
    return 'Unclassified';
  }
  let data = { works: {} };
  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }
  function setData(next) {
    data = next && next.works ? next : { works: {} };
    // A preview can recolor an image, but cannot rewrite the original classification.
    Object.values(data.works).forEach(freeze);
  }
  function attribute(workOrId) {
    if (workOrId && typeof workOrId === 'object' && Array.isArray(workOrId.dominant_colors)) return workOrId;
    const id = typeof workOrId === 'object' && workOrId ? workOrId.id : workOrId;
    return data.works[id] || { has_visual: false, dominant_colors: [], chromatic_coverage: {}, painted_coverage: {}, hue_count: null, is_rainbow: false, is_mixed: false, is_monochrome: false, monochrome_color: null, color_class: 'unclassified', shape_family: inferShapeFamily(typeof workOrId === 'object' ? workOrId : null) };
  }
  function dominantColors(value) { return [...attribute(value).dominant_colors]; }
  function matchesColor(value, selected) {
    const a = attribute(value), choices = typeof selected === 'string' ? [selected] : Array.from(selected || []);
    if (!choices.length) return true;
    if (!a.has_visual) return false;
    return choices.some(raw => {
      const c = normalizeColor(raw);
      if (c === 'rainbow' || c === 'multicolor') return a.is_rainbow;
      if (c === 'mixed') return a.is_mixed;
      if (c === 'two_hues') return a.hue_count === 2;
      if (c === 'many_hues') return a.hue_count >= 3;
      if (c === 'monochrome') return a.is_monochrome;
      return a.dominant_colors.includes(c);
    });
  }
  function shapeFamily(work, value) { return (value || attribute(work)).shape_family || inferShapeFamily(work); }
  function collectionIdentity(work) {
    const raw=String(work?.collection_group||work?.collection||'').trim();
    if(!raw||/^(unknown|not known|unrecorded|unspecified)$/i.test(raw))return 'Unknown';
    if(/Kelly (?:Studio|studio)|Collection of the artist/i.test(raw))return 'Kelly Studio';
    if(/^(?:Private collection|Collection |The Helman Collection|Caldic Collection|Bettina and |Robert and Jane |Mrs\.)|The Patsy R\./i.test(raw))return 'Private collections';
    if(/Galerie |Leo Castelli Gallery|\(lender,/i.test(raw))return 'Gallery / historical lender';
    const aliases=[[/San Francisco Museum of Modern Art/i,'SFMOMA'],[/^Museum of Modern Art, New York$/,'MoMA'],[/Art Institute of Chicago/i,'Art Institute of Chicago'],[/Whitney Museum/i,'Whitney'],[/Guggenheim/i,'Guggenheim'],[/Hirshhorn/i,'Hirshhorn'],[/Philadelphia Museum/i,'Philadelphia Museum of Art'],[/Saint Louis Art Museum/i,'Saint Louis Art Museum'],[/Buffalo AKG/i,'Buffalo AKG'],[/The Museum of Contemporary Art, Los Angeles/i,'MOCA Los Angeles'],[/The Broad/i,'The Broad'],[/Stedelijk Museum/i,'Stedelijk Museum'],[/Kunstsammlung Nordrhein-Westfalen/i,'Kunstsammlung NRW'],[/Kröller-Müller/i,'Kröller-Müller Museum'],[/Museum of Fine Arts, Boston/i,'MFA Boston'],[/Blanton Museum/i,'Blanton Museum'],[/The Metropolitan Museum/i,'The Met'],[/Modern Art Museum of Fort Worth/i,'Modern Art Museum of Fort Worth'],[/Museo Nacional Centro de Arte Reina Sofía/i,'Reina Sofía'],[/Städtische Galerie im Lenbachhaus/i,'Lenbachhaus'],[/Fondation Louis Vuitton/i,'Fondation Louis Vuitton'],[/The Baltimore Museum/i,'Baltimore Museum of Art']];
    for(const [pattern,label]of aliases)if(pattern.test(raw))return label;
    return raw.replace(/\s*[—(].*$/,'').replace(/, (?:Washington|Richmond|Tokyo|Madrid|Paris|Otterlo|Vienna|The University).*$/,'').trim();
  }
  function majorCollection(work) {return attribute(work).major_collection||collectionIdentity(work);}
  function paintedArea(work,{allowEstimates=false}={}) {
    const a=attribute(work),coverage=Number(a.painted_fraction_of_raster);
    if(!a.has_visual||!(coverage>0&&coverage<=1))return null;
    const positive=v=>v!==null&&v!==''&&Number.isFinite(Number(v))&&Number(v)>0;
    let width=Number(work?.width_cm),height=Number(work?.height_cm),estimated=false;
    if(!positive(work?.width_cm)||!positive(work?.height_cm)||work.true_scale_eligible===false){
      const e=work?.scale_estimate;
      if(!allowEstimates||!positive(e?.width_cm)||!positive(e?.height_cm))return null;
      width=Number(e.width_cm);height=Number(e.height_cm);estimated=true;
    }
    const cm2=width*height*coverage;
    return {cm2,m2:cm2/10000,estimated,coverage,basis:'Approximate visible SVG silhouette × overall dimensions; transparent gaps excluded. Hidden overlapping canvas and physical surface are not reconstructed.'};
  }
  return { SHAPE_FAMILIES, COLOR_ORDER, normalizeColor, inferShapeFamily, setData, attribute, dominantColors, matchesColor, shapeFamily, collectionIdentity, majorCollection, paintedArea };
});
