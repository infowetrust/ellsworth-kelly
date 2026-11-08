(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const palette={red:'#e73528',orange:'#f47a20',yellow:'#ffda00',green:'#07864b',blue:'#0751c9',purple:'#844aa9',pink:'#ed94b6',brown:'#856443',black:'#222321',white:'#fff',gray:'#9b9d98',rainbow:'conic-gradient(#ee3b2b,#ffdd00,#07864b,#0751c9,#844aa9,#ee3b2b)',mixed:'linear-gradient(135deg,#e73528 0 33%,#ffda00 33% 66%,#0751c9 66%)'};
  const colorOrder=Object.keys(palette),shapeFamilies=['Rectangle','Circle & oval','Triangle & sector','Polygon & diagonal','Curved form','Joined panels','Separate panels','Unclassified'];
  const initialQuery=new URLSearchParams(location.search),initialView=initialQuery.get('view');
  const state={works:[],filtered:[],colors:new Set(),view:['grid','plot','gallery','arrange'].includes(initialView)?(initialView==='arrange'?'plot':initialView):'gallery',summary:{},hidden:new Set(),ready:false};
  const hiddenKey='kelly-hidden-works';try{const ids=JSON.parse(sessionStorage.getItem(hiddenKey)||'[]');if(Array.isArray(ids))state.hidden=new Set(ids.filter(id=>typeof id==='string'));}catch{}
  const number=n=>n!==null&&n!==''&&Number.isFinite(Number(n))?Number(n):null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
  const clean=v=>String(v??'').trim();
  const nice=v=>clean(v).replace(/[_-]/g,' ').replace(/^./,c=>c.toUpperCase());
  const unknown=v=>!clean(v)||/^(unknown|not known|unrecorded|unspecified|null|n\/a)$/i.test(clean(v));
  const colors=w=>Array.isArray(w.colors)&&w.colors.length?w.colors.map(c=>String(c).toLowerCase()):['unknown'];
  const attr=w=>window.KellyVisual?.attribute(w)||{};
  const dominants=w=>window.KellyVisual?.dominantColors(attr(w))||attr(w).dominant_colors||[];
  const dominantLabel=w=>dominants(w).map(nice).join(', ')||(attr(w).is_rainbow?'Rainbow — no individual dominant hue':attr(w).is_mixed?'Mixed — no individual dominant hue':attr(w).has_visual?'No individual dominant hue':'Unclassified');
  const shape=w=>window.KellyVisual?.shapeFamily(w,attr(w))||attr(w).shape_family||'Unclassified';
  const collection=w=>unknown(w.collection_group||w.collection)?'Unknown':clean(w.collection_group||w.collection);
  const year=w=>number(w.year_start),dims=w=>number(w.height_cm)>0&&number(w.width_cm)>0;
  const date=w=>clean(w.date_display)||(year(w)===null?'Date unknown':String(year(w))+(number(w.year_end)&&number(w.year_end)!==year(w)?'–'+w.year_end:''));
  const title=w=>clean(w.title)||'Untitled record';
  const imagePath=w=>w.image_svg||null;
  const imageKind=w=>w.image_svg?'SVG study':'SVG study pending';
  const safeURL=url=>{try{const u=new URL(url,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}};
  const imageURL=safeURL;
  const placeholder=w=>`<span class="missing-image"><span>Study pending</span><small>${esc(shape(w))}</small></span>`;
  const feedbackURL=w=>{const url=new URL('https://github.com/infowetrust/ellsworth-kelly/issues/new');url.searchParams.set('template','work-feedback.yml');url.searchParams.set('work_id',w.id);url.searchParams.set('title','Correction: '+title(w));url.searchParams.set('source_url',w.sources?.find(s=>s?.url)?.url||'');url.searchParams.set('view_url',location.href);return url.href;};
  const immersive=new window.KellyGallery({onOpen:id=>openDetail(id),onExit:()=>{$('view-'+state.view).focus();},onScale:()=>{if(state.ready)render();else syncLocation();},onColor:color=>{state.colors.clear();if(color)state.colors.add(color);filter();}});
  function colorEvidence(w){const basis=String(w.color_basis||'').toLowerCase();if(basis.includes('title'))return 'Source tags derived from the title; not exhaustive or visually verified.';if(basis==='unreviewed')return 'Source colors not yet visually reviewed.';if(basis.includes('visual')||basis.includes('reference'))return 'Source tags based on image review. Screen colors remain approximate.';return nice(w.color_basis)+'. See the linked evidence.';}
  function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500);}
  function saveHidden(){try{sessionStorage.setItem(hiddenKey,JSON.stringify([...state.hidden]));}catch{}}
  function updateHiddenControls(){for(const id of ['restore-hidden','gallery-restore-hidden']){const b=$(id);b.hidden=!state.hidden.size;b.textContent=`Restore hidden (${state.hidden.size})`;}}
  function hideWork(w){state.hidden.add(String(w.id));saveHidden();state.detailRevision=(state.detailRevision||0)+1;$('detail-dialog').close();immersive.hideTooltip();immersive.showChrome(true);filter();(state.view==='grid'?$('restore-hidden'):$('gallery-stage')).focus({preventScroll:true});toast(`${title(w)} hidden.`);const undo=document.createElement('button');undo.textContent='Undo';undo.addEventListener('click',()=>{state.hidden.delete(String(w.id));saveHidden();filter();toast('Work restored.');});$('toast').append(' ',undo);clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),6500);}
  function restoreHidden(){state.hidden.clear();saveHidden();filter();toast('Hidden works restored.');(state.view==='grid'?$('results'):$('gallery-stage')).focus({preventScroll:true});}
  function tooltip(node,text){const tip=$('ui-tooltip');function show(){tip.textContent=text;tip.hidden=false;const r=node.getBoundingClientRect();tip.style.left=Math.min(innerWidth-tip.offsetWidth-12,Math.max(12,r.left))+'px';tip.style.top=Math.min(innerHeight-tip.offsetHeight-12,r.bottom+7)+'px';}node.addEventListener('pointerenter',show);node.addEventListener('focus',show);for(const event of ['pointerleave','blur','click'])node.addEventListener(event,()=>tip.hidden=true);}
  function fillSelect(id,values,label){const s=$(id),selected=s.value;s.replaceChildren(new Option(label,''));for(const v of values)s.add(new Option(v,v));s.value=selected;}
  function buildFilters(){
    $('color-chips').replaceChildren();for(const c of colorOrder){const count=state.works.filter(w=>matchesColor(w,[c])).length;if(!count)continue;const b=document.createElement('button');b.className='color-chip';b.dataset.color=c;b.style.setProperty('--swatch',palette[c]);b.style.setProperty('--check',['white','yellow','pink'].includes(c)?'#222':'#fff');b.setAttribute('aria-label',nice(c));b.setAttribute('aria-pressed','false');tooltip(b,`${nice(c)} · ${count} in full catalog`);$('color-chips').append(b);}
    fillSelect('shape',shapeFamilies.filter(s=>state.works.some(w=>shape(w)===s)),'All shapes');fillSelect('collection',[...new Set(state.works.map(collection))].sort(),'All collections');fillSelect('decade',[...new Set(state.works.map(w=>year(w)===null?'Unknown':Math.floor(year(w)/10)*10+'s'))].sort(),'All years');$('pending-total').textContent='('+state.works.filter(w=>!w.image_svg).length+')';
  }
  function matchesColor(w,selected){if(!selected.length)return true;return window.KellyVisual?.matchesColor(attr(w),selected)||false;}
  function filter(){
    const q=$('search').value.trim().toLowerCase(),selectedShape=$('shape').value,selectedCollection=$('collection').value,decade=$('decade').value;
    state.filtered=state.works.filter(w=>{
      if(state.hidden.has(String(w.id)))return false;
      if(!$('include-pending').checked&&!w.image_svg)return false;
      if($('representatives').checked&&w.is_representative===false)return false;
      if(!$('unknowns').checked&&(year(w)===null||!dims(w)||shape(w)==='Unclassified'||collection(w)==='Unknown'||!attr(w).has_visual))return false;
      if(!matchesColor(w,[...state.colors]))return false;
      if($('monochrome').checked&&!attr(w).is_monochrome)return false;
      if(selectedShape&&shape(w)!==selectedShape)return false;if(selectedCollection&&collection(w)!==selectedCollection)return false;
      if(decade&&(decade==='Unknown'?year(w)!==null:year(w)===null||Math.floor(year(w)/10)*10+'s'!==decade))return false;
      if(q&&![title(w),...(w.title_aliases||[]),date(w),collection(w),w.collection,shape(w),colors(w).join(' '),w.id,w.canonical_id].some(v=>String(v).toLowerCase().includes(q)))return false;return true;
    });
    const order=$('sort').value;state.filtered.sort((a,b)=>{if(order==='study'){const availability=Number(Boolean(b.image_svg))-Number(Boolean(a.image_svg));if(availability)return availability;return(year(a)??Infinity)-(year(b)??Infinity)||title(a).localeCompare(title(b));}if(order==='year'||order==='year-desc'){if(year(a)===null&&year(b)!==null)return 1;if(year(b)===null&&year(a)!==null)return-1;return(order==='year-desc'?-1:1)*((year(a)??0)-(year(b)??0))||title(a).localeCompare(title(b));}if(order==='area')return(dims(b)?b.height_cm*b.width_cm:-1)-(dims(a)?a.height_cm*a.width_cm:-1)||title(a).localeCompare(title(b));if(order==='color')return(dominants(a)[0]||'zz').localeCompare(dominants(b)[0]||'zz')||title(a).localeCompare(title(b));if(order==='shape')return shape(a).localeCompare(shape(b))||title(a).localeCompare(title(b));return title(a).localeCompare(title(b));});render();
  }
  function activeFilterCount(){return state.colors.size+['search','shape','decade','collection'].filter(id=>$(id).value).length+Number($('monochrome').checked)+Number($('include-pending').checked)+Number(!$('representatives').checked)+Number(!$('unknowns').checked);}
  function visibleWorks(){return state.view!=='grid'&&immersive.relative?state.filtered.filter(w=>immersive.scaleDimensions(w)):state.filtered;}
  function render(){
    updateHiddenControls();const works=state.filtered,visible=visibleWorks(),n=visible.length,studies=visible.filter(w=>w.image_svg).length;
    $('result-count').textContent=fmt(n);$('result-noun').textContent=n===1?'work':'works';$('result-note').textContent=fmt(studies)+' SVG studies'+(n-studies?' · '+fmt(n-studies)+' pending':'')+(works.length-n?' · '+fmt(works.length-n)+' excluded by scale':'');
    const parts=[...state.colors].map(nice);if($('shape').value)parts.push($('shape').value);const colorText=[...state.colors].map(nice).join(' + '),heading=fmt(studies)+(colorText?' '+colorText.toLowerCase():'')+' SVG '+(studies===1?'study':'studies');$('page-title').textContent=heading;$('header-summary').textContent='Ellsworth Kelly'+($('shape').value?' · '+$('shape').value:'');document.title='Ellsworth Kelly · '+heading+' · '+(state.view==='plot'?'Arrange':nice(state.view));
    $('filter-badge').textContent=activeFilterCount()||'';for(const type of ['gallery','plot','grid']){$('view-'+type).classList.toggle('active',state.view===type);$('view-'+type).setAttribute('aria-pressed',String(state.view===type));}
    $('gallery-controls').hidden=state.view!=='gallery';$('arrange-controls').hidden=state.view!=='plot';$('scale-controls').hidden=state.view==='grid';$('grid-controls').hidden=state.view!=='grid';$('gallery').hidden=state.view!=='grid'||!n;$('empty').hidden=state.view!=='grid'||n>0;$('scale-note').hidden=state.view!=='grid'||!$('relative-scale').checked;
    document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(state.colors.has(b.dataset.color))));immersive.setActive(state.view!=='grid');
    if(state.view==='grid')renderGrid();else{immersive.setMode(state.view,{x:$('axis-x').value,y:$('axis-y').value});immersive.update(works,{colors:[...state.colors],collection:$('collection').value});}
    syncLocation();
  }
  function artMarkup(w,max){if(!w.image_svg)return placeholder(w);let sizing='';if($('relative-scale').checked&&dims(w)&&w.true_scale_eligible!==false)sizing=` style="width:${w.width_cm/max*160}px;height:${w.height_cm/max*160}px"`;return `<img src="${esc(imageURL(w.image_svg))}" alt="${esc(title(w))} — SVG study" loading="lazy"${sizing}>`;}
  function renderGrid(){const max=Math.max(1,...state.filtered.filter(w=>dims(w)&&w.true_scale_eligible!==false).flatMap(w=>[Number(w.height_cm),Number(w.width_cm)]));$('gallery').innerHTML=state.filtered.map(w=>`<button class="art-card${$('relative-scale').checked&&(!dims(w)||w.true_scale_eligible===false)?' dimension-unknown':''}" data-work-id="${esc(w.id)}"><span class="art-stage">${artMarkup(w,max)}</span><span class="art-caption"><span class="art-title">${esc(title(w))}</span><span class="art-date">${esc(date(w))}</span><span class="art-extra">${esc(shape(w))}${w.image_svg?'':' · Study pending'}</span></span></button>`).join('');$('gallery').querySelectorAll('[data-work-id]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.workId)));$('gallery').querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const work=state.works.find(w=>w.id===img.closest('[data-work-id]').dataset.workId);img.parentElement.innerHTML=placeholder(work);}));}
  function syncLocation(){if(!state.ready)return;const url=new URL(location.href);if(state.view==='gallery')url.searchParams.delete('view');else url.searchParams.set('view',state.view==='plot'?'arrange':'grid');for(const [key,value]of [['color',[...state.colors].join(',')],['shape',$('shape').value],['collection',$('collection').value],['year',$('decade').value],['q',$('search').value],['pending',$('include-pending').checked?'1':''],['monochrome',$('monochrome').checked?'1':''],['versions',$('representatives').checked?'':'all'],['unknowns',$('unknowns').checked?'':'0'],['scale',immersive.relative?immersive.scaleMode:''],['x',state.view==='plot'?$('axis-x').value:''],['y',state.view==='plot'?$('axis-y').value:'']]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}url.searchParams.delete('images');if(url.href!==location.href)history.replaceState(null,'',url);}
  function setView(view){state.view=view;render();}
  function toggleFilters(open){$('filters').inert=!open&&innerWidth<=800;document.body.classList.toggle('filters-open',open);$('filter-toggle').setAttribute('aria-expanded',String(open));$('filter-backdrop').hidden=!open;if(open)$('search').focus();else $('filter-toggle').focus();}
  function sanitizedStudy(text,id) {
    if(/<!DOCTYPE|<!ENTITY/i.test(text))throw new Error('Unsupported SVG declaration');
    const parsed=new DOMParser().parseFromString(text,'image/svg+xml');
    if(parsed.querySelector('parsererror')||parsed.documentElement.localName!=='svg'||parsed.documentElement.namespaceURI!=='http://www.w3.org/2000/svg')throw new Error('Invalid study SVG');
    const ns='http://www.w3.org/2000/svg';
    const allowedTags=new Set(['svg','g','rect','path','polygon','polyline','line','circle','ellipse','title','desc','metadata']);
    const numeric=new Set(['x','y','width','height','rx','ry','cx','cy','r','x1','x2','y1','y2','stroke-width','opacity','fill-opacity','stroke-opacity','viewBox','points']);
    function copy(source) {
      if(!allowedTags.has(source.localName)||source.namespaceURI!==ns)return null;
      const dest=document.createElementNS(ns,source.localName);
      for(const {name,value} of source.attributes){
        let valid=false;
        if(numeric.has(name))valid=/^[0-9eE+.,%\s-]+$/.test(value);
        else if(name==='fill'||name==='stroke')valid=/^(#[0-9a-f]{3}|#[0-9a-f]{6}|none)$/i.test(value);
        else if(name==='d')valid=/^[MmZzLlHhVvCcSsQqTtAaEe0-9+.,\s-]+$/.test(value);
        else if(name==='transform')valid=/^[a-zA-Z0-9+.,()\s-]+$/.test(value)&&!/[uU][rR][lL]/.test(value);
        else if(name==='data-colour')valid=/^[a-z][a-z0-9 -]{0,40}$/i.test(value);
        else if(name==='preserveAspectRatio')valid=/^(none|x(Min|Mid|Max)Y(Min|Mid|Max)( (meet|slice))?)$/.test(value);
        else if(name==='fill-rule'||name==='clip-rule')valid=/^(nonzero|evenodd)$/.test(value);
        if(valid)dest.setAttribute(name,value);
      }
      if(['title','desc','metadata'].includes(source.localName))dest.textContent=source.textContent;
      else for(const child of source.children){const safe=copy(child);if(safe)dest.append(safe);}
      return dest;
    }
    const svg=copy(parsed.documentElement);
    svg.setAttribute('xmlns',ns);svg.setAttribute('role','img');
    const labels=[];
    for(const tag of ['title','desc']){const node=svg.querySelector(tag);if(node){const key='study-'+String(id).replace(/[^a-z0-9-]/gi,'')+'-'+tag;node.setAttribute('id',key);labels.push(key);}}
    if(labels.length)svg.setAttribute('aria-labelledby',labels.join(' '));
    return svg;
  }
  async function loadRecolorStudy(w,revision) {
    if(!/^assets\/studies\/[a-z0-9-]+\.svg$/.test(w.image_svg))return;
    try {
      const response=await fetch(w.image_svg,{mode:'same-origin'});
      if(!response.ok)throw new Error('Study unavailable');
      const text=await response.text();
      if(revision!==state.detailRevision||!$('detail-dialog').open)return;
      const svg=sanitizedStudy(text,w.id),groups=new Map();
      svg.querySelectorAll('[data-colour][fill]').forEach(shape=>{
        let fill=shape.getAttribute('fill');if(!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(fill))return;
        if(fill.length===4)fill='#'+fill.slice(1).split('').map(c=>c+c).join('');
        const label=shape.getAttribute('data-colour'),key=label+':'+fill;
        if(!groups.has(key))groups.set(key,{label,original:fill,shapes:[]});
        groups.get(key).shapes.push(shape);
      });
      if(!groups.size)return;
      const host=$('detail-body').querySelector('.detail-image'),frame=document.createElement('div');
      frame.className='detail-svg-frame';
      const width=Number(svg.getAttribute('width')),height=Number(svg.getAttribute('height'));
      const box=(svg.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);
      const ratio=width>0&&height>0?width/height:box[2]>0&&box[3]>0?box[2]/box[3]:1;
      frame.style.aspectRatio=String(ratio);frame.style.width=`min(100%, ${68*ratio}vh)`;
      svg.removeAttribute('width');svg.removeAttribute('height');frame.append(svg);host.replaceChildren(frame);
      const controls=$('recolor-controls');controls.replaceChildren();controls.hidden=false;
      const heading=document.createElement('h3');heading.id='recolor-title';heading.textContent='Make a color study';controls.append(heading);
      const intro=document.createElement('p');intro.className='recolor-note';intro.textContent='Recolor this SVG study. Catalog tags and other paintings keep their original colors.';controls.append(intro);
      const palette=document.createElement('div');palette.className='study-palette';
      const inputs=[];
      for(const group of groups.values()){
        const label=document.createElement('label'),input=document.createElement('input'),caption=document.createElement('span');
        input.type='color';input.value=group.original;input.setAttribute('aria-label','Recolor '+nice(group.label));
        caption.textContent=nice(group.label);label.append(input,caption);palette.append(label);inputs.push({input,group});
        input.addEventListener('input',()=>{for(const shape of group.shapes)shape.setAttribute('fill',input.value);});
      }
      controls.append(palette);
      const actions=document.createElement('div');actions.className='study-actions';
      const reset=document.createElement('button');reset.type='button';reset.className='text-button';reset.textContent='Reset study colors';
      reset.addEventListener('click',()=>{for(const {input,group}of inputs){input.value=group.original;for(const shape of group.shapes)shape.setAttribute('fill',group.original);}});
      const download=document.createElement('button');download.type='button';download.className='text-button';download.textContent='Download this SVG ↓';
      download.addEventListener('click',()=>{
        const exported=svg.cloneNode(true);exported.setAttribute('width',String(width>0?width:1000*ratio));exported.setAttribute('height',String(height>0?height:1000));
        const note=document.createElementNS('http://www.w3.org/2000/svg','metadata');note.textContent='Interactive color study. Interpretive geometry and screen colors; catalog tags remain unchanged. This color study is not licensed under MIT or CC BY. Underlying artwork rights are separate; see RIGHTS: https://github.com/infowetrust/ellsworth-kelly/blob/main/RIGHTS.md and '+new URL('./research-and-rights.html',location.href).href+'. Primary reference: '+(w.sources?.find(s=>s?.url)?.url||w.study?.source_url||'See catalog record '+w.id)+'.';exported.append(note);
        const serialized=new XMLSerializer().serializeToString(exported),url=URL.createObjectURL(new Blob([serialized],{type:'image/svg+xml;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download=String(w.id).replace(/[^a-z0-9-]/gi,'')+'-color-study.svg';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('SVG color study downloaded');
      });
      actions.append(reset,download);controls.append(actions);
    } catch { /* Keep the original study image if an editable local SVG cannot be loaded. */ }
  }
  function estimatedSizeHTML(w){
    const e=w.scale_estimate;if(!e)return '';
    const comparisons=(e.comparison_ids||[]).map(id=>state.works.find(work=>work.id===id)).filter(Boolean);
    const anchorURL=safeURL(e.anchor?.source_url);
    return `<section class="estimated-size" aria-label="Estimated gallery dimensions"><h3>Estimated gallery size</h3><p class="estimated-measure">≈ ${fmt(e.height_cm)} × ${fmt(e.width_cm)} cm <small>(h × w)</small></p><p>Best guess · ${esc(nice(e.confidence||'low').toLowerCase())} confidence. This estimate sets the SVG’s display size; recorded dimensions above remain the source measurements.</p><p>${esc(e.reason||'Estimated from similar documented works, preserving the SVG proportions.')}</p>${comparisons.length?`<p><strong>Compared with:</strong> ${comparisons.map(c=>esc(title(c))+' ('+esc(date(c))+', '+fmt(c.height_cm)+' × '+fmt(c.width_cm)+' cm)').join('; ')}.</p>`:''}${(e.caveats||[]).length?`<p>${esc(e.caveats.join(' '))}</p>`:''}${anchorURL?`<a href="${esc(anchorURL)}" target="_blank" rel="noopener noreferrer">${comparisons.length?'Work source':'Size anchor source'} ↗</a>`:''}<p><a href="./data/scale-estimates.json" download>Download estimates and evidence ↓</a></p></section>`;
  }
  function classificationHTML(w){
    const a=attr(w),pct=v=>(Number(v||0)*100).toLocaleString(undefined,{maximumFractionDigits:1})+'%';
    if(!a.has_visual)return '<details class="study-classification"><summary>Study classification</summary><p>No SVG study is available. Dominant colors remain unclassified; original source tags are listed separately.</p></details>';
    const rows=dominants(w).map(c=>`<li><strong>${esc(nice(c))}</strong>: ${pct(a.painted_coverage?.[c])} of painted pixels${Object.hasOwn(a.chromatic_coverage||{},c)?'; '+pct(a.chromatic_coverage[c])+' of chromatic pixels':''}.</li>`).join('');
    return `<details class="study-classification"><summary>Study classification</summary><p>Calculated from the original SVG study; transparent pixels are excluded. Recoloring this preview does not change the filters.</p>${rows?`<ul>${rows}</ul>`:'<p>No individual color family meets the dominance rule.</p>'}<p>Chromatic families need ≥40% of chromatic pixels and ≥10% of all painted pixels. Neutral families need ≥40% of painted pixels.</p><p><strong>Rainbow:</strong> ${a.is_rainbow?'Yes':'No'}${a.rainbow_basis?' — '+esc(a.rainbow_basis):''}<br><strong>Mixed:</strong> ${a.is_mixed?'Yes':'No'}${a.mixed_basis?' — '+esc(a.mixed_basis):''}<br><strong>Single color:</strong> ${a.is_monochrome?'Yes'+(a.monochrome_color?' — '+esc(nice(a.monochrome_color)):''):'No'}.</p>${a.reason?`<p>${esc(a.reason)}</p>`:''}<p><strong>Shape family:</strong> ${esc(shape(w))}${a.shape_basis?' — '+esc(a.shape_basis):''}.</p><p>These approximate screen-area measurements describe the study, not the original paint. <a href="./data/visual-attributes.json" download>Download classifications ↓</a></p></details>`;
  }
  function openDetail(id){
    const w=state.works.find(w=>String(w.id)===String(id));if(!w)return;
    const detailRevision=state.detailRevision=(state.detailRevision||0)+1;
    const src=imageURL(w.image_svg||w.image_png||w.image_original), missing=Array.isArray(w.missing_fields)?w.missing_fields:[];
    const sources=Array.isArray(w.sources)?w.sources:[];
    const notes=Array.isArray(w.notes)?w.notes.filter(Boolean).join(' '):w.notes;
    const auctions=(w.auction_history||[]).map(a=>{const url=safeURL(a.source_url);return `<li>${esc(a.house||a.auction_house||a.sale_house||'Auction record')} · ${esc(String(a.sale_date||'Date unknown').slice(0,10))}${a.lot_number?' · lot '+esc(a.lot_number):''}${url?` <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Public lot record ↗</a>`:''}</li>`;}).join('');
    const sourceHTML=sources.map((s,i)=>{if(typeof s==='string')s={url:s,label:'Source '+(i+1)};const url=safeURL(s.url);return url?`<li><a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.title||'Source '+(i+1))} ↗<span>${esc(new URL(url).hostname)}</span></a></li>`:'';}).join('');
    const marketOffers=(w.market_history||[]).map(a=>{const url=safeURL(a.source_url);return `<li>${esc(a.house||'Dealer')} · Private sale offer · observed ${esc(a.observed_date||'date unknown')}${url?` <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Listing ↗</a>`:''}</li>`;}).join('');
    $('detail-body').innerHTML=`<div class="detail-layout"><div class="detail-image">${src?`<img src="${esc(src)}" alt="${esc(title(w))}${w.image_svg?' — interpretive SVG study':''}" data-study="${Boolean(w.image_svg)}">`:placeholder(w)}</div><div class="detail-info"><p class="eyebrow">ELLSWORTH KELLY · CATALOG WORK</p><h2 id="detail-title">${esc(title(w))}</h2><p class="detail-year">${esc(date(w))}</p><div class="detail-visibility"><button id="detail-hide" class="outline-button">Hide from all views</button><span>Temporary in this tab. Restore hidden works at any time.</span></div><dl><dt>Dimensions</dt><dd>${dims(w)?fmt(w.height_cm)+' × '+fmt(w.width_cm)+' cm (h × w)':'Not yet recorded'}</dd><dt>Medium</dt><dd>${esc(w.medium||'Not yet recorded')}</dd><dt>Dominant color</dt><dd>${esc(dominantLabel(w))}</dd><dt>Color tags</dt><dd>${esc(colors(w).map(nice).join(', '))}</dd><dt>Shape family</dt><dd>${esc(shape(w))}</dd><dt>Shape described</dt><dd>${esc(nice(w.shape_type)||'Unclassified')}</dd><dt>Collection reported</dt><dd>${esc(clean(w.collection)||'Unknown')}</dd><dt>Image</dt><dd>${esc(imageKind(w))}</dd>${w.canonical_id?`<dt>Catalog ID</dt><dd>${esc(w.canonical_id)}</dd>`:''}</dl>${estimatedSizeHTML(w)}${classificationHTML(w)}${w.color_basis?`<p class="color-evidence"><strong>Color evidence:</strong> ${esc(colorEvidence(w))}</p>`:''}${w.image_svg?'<section id="recolor-controls" class="recolor-controls" aria-labelledby="recolor-title" hidden></section><p class="uncertainty">Interpretive reconstruction; geometry and screen color approximate. This SVG study is a navigational aid. Consult the linked source to examine the artwork.</p>':''}${w.true_scale_eligible===false?`<p class="uncertainty">${esc(w.true_scale_note||'Schematic projection: available in comparable-size Gallery view, omitted from true scale.')}</p>`:''}${w.image_original&&!w.image_svg&&!w.image_png?'<p class="uncertainty">Source photograph; background has not been removed.</p>':''}${marketOffers?`<h3>Public market listings</h3><ul>${marketOffers}</ul><p class="uncertainty">An offer is not evidence of a completed sale.</p>`:''}${auctions?`<h3>Public auction history</h3><ul>${auctions}</ul><p class="uncertainty">Sale records establish public appearances; present ownership is unverified.</p>`:''}${notes?`<h3>Record notes</h3><p>${esc(notes)}</p>`:''}${missing.length?`<h3>Known gaps</h3><p class="uncertainty">${esc(missing.map(nice).join(' · '))}</p>`:''}${w.is_representative===false?'<p class="uncertainty">A work with this recorded title has an earlier date in the catalog. This record is hidden by the default earliest-title filter.</p>':''}<div class="detail-links"><a href="${esc(feedbackURL(w))}" target="_blank" rel="noopener noreferrer">Suggest a correction ↗</a><a href="./research-and-rights.html" target="_blank" rel="noopener noreferrer">Research & rights ↗</a></div><h3>Sources & evidence</h3>${sourceHTML?`<ul>${sourceHTML}</ul>`:'<p class="uncertainty">No linked source has yet been recorded.</p>'}<p class="record-id">Record ${esc(w.id)}${w.duplicate_group?' · Title group '+esc(w.duplicate_group):''}</p></div></div>`;
    $('detail-dialog').showModal();$('detail-close').focus();
    $('detail-hide').addEventListener('click',()=>hideWork(w));
    if(w.image_svg)loadRecolorStudy(w,detailRevision);
  }
  function buildCoverage(){
    const all=state.works,n=all.length,svg=all.filter(w=>w.image_svg).length,sourced=all.filter(w=>Array.isArray(w.sources)&&w.sources.length).length;
    const representatives=all.filter(w=>w.is_representative!==false).length,summary=state.summary;
    $('catalogue-total').textContent=`${fmt(n)} records · ${fmt(representatives)} earliest titles`;
    $('coverage-stats').innerHTML=[[n,'catalogd records'],[representatives,'earliest title records'],[sourced,'with linked sources'],[svg,'interpretive SVG studies'],[all.filter(w=>!dims(w)).length,'dimensions to be found'],[all.filter(w=>year(w)===null).length,'dates unresolved']].map(([count,label])=>`<div class="coverage-stat"><strong>${fmt(count)}</strong><span>${label}</span></div>`).join('');
    const sourceNames={foundation:'Ellsworth Kelly Foundation',museums:'Museum collections',chatham:'Chatham exhibition inventory',moma_1973_selected_captions:'MoMA 1973 exhibition captions',museum_enrichment_v2:'Additional museum records',screening_enrichment_v2:'Screening follow-up records',met_painting_dataset_v2:'Met open collection dataset',chronology_named_candidates:'Foundation chronology: named candidates',sfmoma_enrichment_v3:'SFMOMA full artist-index review',hirshhorn_seattle_v3:'Hirshhorn and Seattle collection review',broad_moca_v3:'Broad and MOCA collection review',additional_museums_v3:'Glenstone, Fort Worth and Nelson-Atkins review',core_museums_v4:'Chicago and core museum refresh',north_american_museums_v4:'North American collection sweep',international_museums_v4:'International collection sweep',auction_private_v4:'Public auctions and gallery exhibition archives',secondary_galleries_v4:'Additional primary gallery records',short_catalogues_v4:'Public gallery and Whitney exhibition books',public_catalogues_v4:'Guggenheim 1996 retrospective inventory',foundation_exhibitions_v4:'Foundation exhibition-caption evidence',moma_live_v4:'MoMA live promised-gift object pages'};
    const contributions=Object.entries(summary.source_record_counts||{}).map(([key,count])=>`<li><span>${esc(sourceNames[key]||nice(key))}</span><strong>${esc(count)} records</strong></li>`).join('');
    const gaps=(Array.isArray(summary.known_unknowns)?summary.known_unknowns:[]).map(g=>{
      const years=Array.isArray(g.years)?g.years.join('–'):nice(g.id);
      return `<li><strong>${esc(years)}</strong><p>${esc(g.reason||'Inventory reconciliation remains incomplete.')}</p><span>${g.missing_count===null||g.missing_count===undefined?'Number of missing works not established':fmt(g.missing_count)+' missing works identified'}</span></li>`;
    }).join('');
    const conflicts=(Array.isArray(summary.source_conflicts)?summary.source_conflicts:[]).map(c=>{
      const preferred=safeURL(c.preferred_source),other=safeURL(c.other_source);
      return `<li><strong>${esc(c.title)} · ${esc(nice(c.field))}</strong><p>${esc(c.reason||'Sources differ.')}</p><span>Catalog value: ${esc(c.preferred??'Unresolved')}; conflicting source: ${esc(c.other??'Unknown')}.</span><p class="conflict-links">${preferred?`<a href="${esc(preferred)}" target="_blank" rel="noopener noreferrer">Catalog evidence ↗</a>`:''}${other?` <a href="${esc(other)}" target="_blank" rel="noopener noreferrer">Conflicting record ↗</a>`:''}</p></li>`;
    }).join('');
    const notes=[summary.collection_note,summary.color_note,summary.size_note].filter(Boolean).map(note=>`<p>${esc(note)}</p>`).join('');
    const screening=summary.museum_screening,screeningCounts=screening?.status_counts||{};
    const screeningHTML=screening?`<h3>Museum research</h3>${summary.museum_research_v4?.targets_with_recorded_outcome?`<p><strong>${fmt(summary.museum_research_v4.targets_with_recorded_outcome)} of 200 targets revisited</strong> in the latest pass. Work-level outcomes, exclusions and access limits are preserved in the downloadable queue.</p>`:''}<p>Original screening: ${fmt(screening.targets||0)} institution targets screened: ${fmt(screeningCounts.artist_mention_leads||0)} produced artist-mention leads; ${fmt(screeningCounts.no_indexed_primary_result_in_this_pass||0)} had no indexed primary result in this pass. These are institution-search outcomes, not counts of holdings or paintings.</p>${screening.method?`<p class="coverage-small">${esc(screening.method)}</p>`:''}`:'';
    const references=(Array.isArray(summary.catalogue_references)?summary.catalogue_references:[]).map(reference=>{const url=safeURL(reference.url);return url?`<li><a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(String(reference.title||'Catalog reference').replace(/volume(\d):/gi,'volume $1: '))} ↗</a></li>`:'';}).join('');
    const colorPending=all.filter(w=>!w.color_basis||/unreviewed|title_derived/.test(w.color_basis)).length;
    const pass=summary.svg_gap_pass_v6||summary.svg_gap_pass_v5,passVersion=summary.svg_gap_pass_v6?'v6':'v5';
    const gapPassHTML=pass?`<h3>Latest SVG reference pass</h3><p>${fmt(pass.new_svg_studies)} additional SVGs in a review of ${fmt(pass.baseline_svg_gaps)} visual gaps. ${fmt(pass.scope_exclusions)} records were identified as nonpaintings and retained in an exclusions ledger.</p><p><a href="./svg-gap-pass-${passVersion}.md" target="_blank" rel="noopener noreferrer">SVG reference audit ↗</a> · <a href="./data/svg-gap-outcomes-${passVersion}.json" download>Every reviewed gap (JSON) ↓</a> · <a href="./data/excluded-nonpaintings-${passVersion}.json" download>Scope exclusions (JSON) ↓</a></p>`:'';
    $('coverage-extra').innerHTML=`${summary.as_of?`<p class="coverage-date">Research snapshot: ${esc(summary.as_of)}</p>`:''}${gapPassHTML}<h3>How much is here?</h3><p>${esc(summary.completeness||'Completeness is unestablished. This inventory does not establish the total number of Kelly paintings.')} The ${fmt(n)} records above are a source-backed starting point, not a denominator for the whole body of work.</p><p>${fmt(n-svg)} records still need an SVG study. ${fmt(colorPending)} records have unreviewed or title-derived source color tags. Dominant-color filters use the original SVG studies and the documented pixel-area rules, not those provisional source tags. Works without an SVG remain unclassified for visual color filtering.</p>${contributions?`<h3>Reported source contributions</h3><ul class="provenance-list">${contributions}</ul><p class="coverage-small">Sources can overlap and records may be reconciled. These contributions describe the research inputs, not independent counts of unique paintings.</p>`:''}${screeningHTML}<h3>Continue the research</h3><p class="research-resource-links"><a href="./research-expansion-v4.md" target="_blank" rel="noopener noreferrer">Latest collection and auction expansion ↗</a><a href="./research-roadmap.md" target="_blank" rel="noopener noreferrer">Research roadmap ↗</a><a href="./data/museum-research-queue.json" download>Museum research queue (JSON) ↓</a></p>${references?`<h3>Catalog raisonné references</h3><ul class="catalog-reference-list">${references}</ul>`:''}${gaps?`<h3>Inventory gaps, kept explicit</h3><ul class="coverage-gaps">${gaps}</ul>`:''}${conflicts?`<h3>Sources that disagree</h3><ul class="coverage-gaps">${conflicts}</ul>`:''}${notes?`<h3>Metadata limits</h3>${notes}`:''}`;
  }

  function reset(){state.colors.clear();['search','shape','decade','collection'].forEach(id=>$(id).value='');$('monochrome').checked=false;$('include-pending').checked=false;$('representatives').checked=true;$('unknowns').checked=true;filter();}
  function exportData(type){const exportedWorks=visibleWorks();let content,mime;if(type==='json'){content=JSON.stringify({exported_at:new Date().toISOString(),count:exportedWorks.length,filters:{search:$('search').value,dominant_colors:[...state.colors],shape_family:$('shape').value,year:$('decade').value,collection:$('collection').value,include_pending:$('include-pending').checked,monochrome:$('monochrome').checked,earliest_title_only:$('representatives').checked,view:state.view,scale_sources:state.view!=='grid'&&immersive.relative?immersive.scaleMode:'comparable'},works:exportedWorks.map(w=>({...w,visual_attributes:attr(w)}))},null,2);mime='application/json';}else{const fields=['id','title','year_start','year_end','date_display','height_cm','width_cm','medium','collection','colors','color_basis','shape_type','image_svg','image_status','is_representative','missing_fields','canonical_id','true_scale_eligible','scale_estimate','sources','notes'];const cell=v=>'"'+String(Array.isArray(v)||typeof v==='object'&&v!==null?JSON.stringify(v):v??'').replace(/"/g,'""')+'"';content=[fields.concat(['dominant_colors','shape_family']).join(','),...exportedWorks.map(w=>fields.map(k=>cell(w[k])).concat([cell(dominants(w)),cell(shape(w))]).join(','))].join('\r\n');mime='text/csv;charset=utf-8';}const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement('a');a.href=url;a.download=`ellsworth-kelly-${exportedWorks.length}-works.${type}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('export-menu').hidden=true;$('export').setAttribute('aria-expanded','false');toast('Exported '+fmt(exportedWorks.length)+' records');}
  ['search','shape','decade','collection','include-pending','representatives','unknowns','sort','monochrome'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',filter));['relative-scale','axis-x','axis-y'].forEach(id=>$(id).addEventListener('change',render));
  tooltip($('monochrome'),'One painted color family, including shades. White, black and gray painted fields count separately; transparency does not.');
  $('color-chips').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;const c=b.dataset.color;state.colors.has(c)?state.colors.delete(c):state.colors.add(c);filter();});
  $('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);for(const id of ['restore-hidden','gallery-restore-hidden'])$(id).addEventListener('click',restoreHidden);for(const view of ['grid','plot','gallery'])$('view-'+view).addEventListener('click',()=>setView(view));
  $('filter-toggle').addEventListener('click',()=>toggleFilters(!document.body.classList.contains('filters-open')));for(const id of ['filter-close','filter-backdrop'])$(id).addEventListener('click',()=>toggleFilters(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('filters-open'))toggleFilters(false);});
  for(const id of ['detail','coverage']){$(id+'-close').addEventListener('click',()=>$(id+'-dialog').close());$(id+'-dialog').addEventListener('click',e=>{if(e.target===$(id+'-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});}$('coverage-open').addEventListener('click',()=>$('coverage-dialog').showModal());
  $('export').addEventListener('click',()=>{const open=$('export-menu').hidden;$('export-menu').hidden=!open;$('export').setAttribute('aria-expanded',String(open));});for(const type of ['json','csv'])$('export-'+type).addEventListener('click',()=>exportData(type));document.addEventListener('click',e=>{if(!e.target.closest('.export-wrap')){$('export-menu').hidden=true;$('export').setAttribute('aria-expanded','false');}});
  $('filters').inert=innerWidth<=800;window.addEventListener('resize',()=>{$('filters').inert=innerWidth<=800&&!document.body.classList.contains('filters-open');if(innerWidth>800&&document.body.classList.contains('filters-open'))toggleFilters(false);if(state.view==='grid'&&state.ready){clearTimeout(state.resizeTimer);state.resizeTimer=setTimeout(renderGrid,100);}});
  const optional=path=>fetch(path,{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);
  Promise.all([fetch('./data/catalogue.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('Catalog request failed ('+r.status+')');return r.json();}),optional('./data/scale-estimates.json'),optional('./data/visual-attributes.json')]).then(([data,scaleData,visualData])=>{
    state.works=Array.isArray(data)?data:Array.isArray(data.works)?data.works:[];state.summary=data.summary||{};if(!state.works.length)throw new Error('The catalog does not yet contain records.');window.KellyVisual?.setData(visualData||{});
    state.works=state.works.map((w,i)=>({...w,id:w.id??'record-'+i,...(scaleData?.estimates?.[w.id]?{scale_estimate:scaleData.estimates[w.id]}:{})}));state.hidden=new Set([...state.hidden].filter(id=>state.works.some(w=>String(w.id)===id)));saveHidden();
    const estimatesAvailable=state.works.some(w=>w.scale_estimate?.height_cm>0&&w.scale_estimate?.width_cm>0);for(const option of $('gallery-scale-source').options)if(option.value!=='recorded')option.disabled=!estimatesAvailable;
    if(['recorded','estimated','estimates-only'].includes(initialQuery.get('scale'))){immersive.scaleMode=estimatesAvailable?initialQuery.get('scale'):'recorded';$('gallery-scale-source').value=immersive.scaleMode;immersive.setRelative(true,false);}
    buildFilters();buildCoverage();if(initialQuery.get('color'))initialQuery.get('color').split(',').filter(c=>colorOrder.includes(c)).forEach(c=>state.colors.add(c));for(const [id,key]of [['shape','shape'],['collection','collection'],['decade','year']])if([...$(id).options].some(o=>o.value===initialQuery.get(key)))$(id).value=initialQuery.get(key);$('search').value=initialQuery.get('q')||'';$('include-pending').checked=initialQuery.get('pending')==='1'||initialQuery.get('images')==='missing';$('monochrome').checked=initialQuery.get('monochrome')==='1';$('representatives').checked=initialQuery.get('versions')!=='all';$('unknowns').checked=initialQuery.get('unknowns')!=='0';for(const axis of ['x','y'])if([...$('axis-'+axis).options].some(o=>o.value===initialQuery.get(axis)))$('axis-'+axis).value=initialQuery.get(axis);$('loading').hidden=true;state.ready=true;filter();
    if(!visualData)toast('Visual color attributes unavailable. Source tags are preserved in each record.');
  }).catch(err=>{$('loading').textContent='The catalog could not be opened: '+err.message;$('result-count').textContent='0';$('result-note').textContent='Catalog unavailable';immersive.setActive(false);});
})();
