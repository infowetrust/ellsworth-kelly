/* Original-study visual attributes. Recoloring previews never change this data. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KellyVisual = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';
  const SHAPE_FAMILIES = ['Rectangle', 'Circle & oval', 'Triangle & sector', 'Polygon & diagonal', 'Curved form', 'Joined panels', 'Separate panels', 'Unclassified'];
  const COLOR_ORDER = ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'brown', 'rainbow', 'mixed'];
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
    return data.works[id] || { has_visual: false, dominant_colors: [], chromatic_coverage: {}, painted_coverage: {}, is_rainbow: false, is_mixed: false, is_monochrome: false, monochrome_color: null, color_class: 'unclassified', shape_family: inferShapeFamily(typeof workOrId === 'object' ? workOrId : null) };
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
      if (c === 'monochrome') return a.is_monochrome;
      return a.dominant_colors.includes(c);
    });
  }
  function shapeFamily(work, value) { return (value || attribute(work)).shape_family || inferShapeFamily(work); }
  return { SHAPE_FAMILIES, COLOR_ORDER, normalizeColor, inferShapeFamily, setData, attribute, dominantColors, matchesColor, shapeFamily };
});
