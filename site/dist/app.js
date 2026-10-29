(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const palette = {blue:'#0647cb',red:'#eb3025',yellow:'#ffdc00',green:'#00864d',orange:'#f77416',purple:'#7b35ad',pink:'#ed8caa',black:'#20211e',white:'#fffefa',gray:'#979b96',grey:'#979b96',brown:'#80603f',multicolor:'conic-gradient(#0050d4,#00985c,#ffe500,#f5392c,#0050d4)',unknown:'repeating-linear-gradient(135deg,#d5d7ca 0 2px,#f5f4ee 2px 5px)'};
  const colorOrder = ['blue','red','yellow','green','orange','purple','pink','black','white','gray','brown','multicolor','unknown'];
  const state = {works:[], filtered:[], colors:new Set(), view:'grid', summary:{}, sort:'study', vivid:false};
  const hiddenKey='kelly-hidden-works';
  state.hidden=new Set();
  try{const ids=JSON.parse(sessionStorage.getItem(hiddenKey)||'[]');if(Array.isArray(ids))state.hidden=new Set(ids.filter(id=>typeof id==='string'));}catch{}
  const initialQuery=new URLSearchParams(location.search);
  const immersive=new window.KellyGallery({onOpen:id=>openDetail(id),onExit:()=>setView('grid'),onScale:()=>syncLocation(),onColour:color=>{state.colors.clear();if(color)state.colors.add(color);filter();}});
  if(['gallery','plot'].includes(initialQuery.get('view')))state.view=initialQuery.get('view');
  if(state.view==='gallery'){immersive.setActive(true);$('gallery-empty').hidden=false;}
  const number = n => n !== null && n !== '' && Number.isFinite(Number(n)) ? Number(n) : null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
  const clean = value => String(value ?? '').trim();
  const nice = value => clean(value).replace(/[_-]/g,' ').replace(/^./, c => c.toUpperCase());
  const unknown = value => !clean(value) || /^(unknown|not known|unrecorded|unspecified|null|n\/a)$/i.test(clean(value));
  const colors = w => Array.isArray(w.colors) && w.colors.length ? w.colors.map(c => String(c).toLowerCase()) : ['unknown'];
  const shape = w => unknown(w.shape_type) ? 'Unknown' : nice(w.shape_type);
  const collection = w => unknown(w.collection_group||w.collection) ? 'Unknown' : clean(w.collection_group||w.collection);
  const year = w => number(w.year_start);
  const dims = w => number(w.height_cm) > 0 && number(w.width_cm) > 0;
  const date = w => clean(w.date_display) || (year(w) === null ? 'Date unknown' : String(year(w)) + (number(w.year_end) && number(w.year_end) !== year(w) ? '–' + w.year_end : ''));
  const imagePath = w => w.image_svg || w.image_png || w.image_original || null;
  const imageKind = w => w.image_svg ? 'SVG study' : w.image_png ? 'Transparent PNG' : w.image_original ? 'Source photograph' : 'SVG study pending';
  function colorEvidence(w) {
    const basis=String(w.color_basis||'').toLowerCase();
    if(basis.includes('title'))return 'Derived from the title; tags are not exhaustive and have not been visually verified.';
    if(basis==='unreviewed')return 'Not yet visually reviewed. Color is unknown until supported by a source.';
    if(basis.includes('visual')||basis.includes('reference'))return 'Based on source-image review. Screen colors remain approximate; see the linked evidence.';
    return nice(w.color_basis)+'. See the linked evidence.';
  }
  const safeURL = url => { try {const u = new URL(url,location.href);return ['http:','https:'].includes(u.protocol) ? u.href : null;} catch {return null;} };
  const imageURL = path => { if(!path) return null;try{const u = new URL(path,location.href);return ['http:','https:'].includes(u.protocol) ? u.href : null;}catch{return null;} };
  const placeholder = w => `<span class="missing-image"><span aria-hidden="true">—</span><span>SVG study pending</span><small>${esc(shape(w))}${dims(w) ? ' · ' + fmt(w.height_cm) + ' × ' + fmt(w.width_cm) + ' cm' : ''}</small></span>`;
  const title = w => clean(w.title) || 'Untitled record';

  function toast(message) {$('toast').textContent = message;$('toast').classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
  function saveHidden(){try{sessionStorage.setItem(hiddenKey,JSON.stringify([...state.hidden]));}catch{}}
  function updateHiddenControls(){
    for(const id of ['restore-hidden','gallery-restore-hidden']){const button=$(id);button.hidden=!state.hidden.size;button.textContent=`Restore hidden (${state.hidden.size})`;}
  }
  function hideWork(w){
    state.hidden.add(String(w.id));saveHidden();
    state.detailRevision=(state.detailRevision||0)+1;
    $('detail-dialog').close();immersive.hideTooltip();if(state.view==='gallery')immersive.showChrome(true);filter();
    (state.view==='gallery'?$('gallery-stage'):$('restore-hidden')).focus({preventScroll:true});
    toast(`${title(w)} hidden from all views.`);
    const undo=document.createElement('button');undo.type='button';undo.textContent='Undo';
    undo.addEventListener('click',()=>{state.hidden.delete(String(w.id));saveHidden();filter();toast('Work restored.');});$('toast').append(' ',undo);
    clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),6000);
  }
  function restoreHidden(){
    state.hidden.clear();saveHidden();filter();toast('All hidden works restored.');
    (state.view==='gallery'?$('gallery-stage'):$('results')).focus({preventScroll:true});
  }
  function fillSelect(id, values, label) {const s=$(id), selected=s.value;s.innerHTML=`<option value="">${label}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');s.value=selected;}
  function buildFilters() {
    const available = [...new Set(state.works.flatMap(colors))];
    available.sort((a,b)=>(colorOrder.indexOf(a)<0?99:colorOrder.indexOf(a))-(colorOrder.indexOf(b)<0?99:colorOrder.indexOf(b)) || a.localeCompare(b));
    $('color-chips').innerHTML=available.map(c=>`<button class="color-chip" data-color="${esc(c)}" style="--swatch:${palette[c]||'#b1b3a7'};--check:${['yellow','white','pink','unknown'].includes(c)?'#24241f':'#fff'}" title="${esc(nice(c))} · ${fmt(state.works.filter(w=>colors(w).includes(c)).length)} records" aria-label="${esc(nice(c))}" aria-pressed="false"></button>`).join('');
    fillSelect('shape',[...new Set(state.works.map(shape))].sort(),'All shapes');
    fillSelect('collection',[...new Set(state.works.map(collection))].sort(),'All collections');
    const decades=[...new Set(state.works.map(w=>year(w)===null?'Unknown':Math.floor(year(w)/10)*10+'s'))].sort();fillSelect('decade',decades,'All years');
  }
  function filter() {
    const q=$('search').value.trim().toLowerCase(), selectedShape=$('shape').value, selectedCollection=$('collection').value, decade=$('decade').value, image=$('image-filter').value;
    state.filtered=state.works.filter(w=>{
      if(state.hidden.has(String(w.id)))return false;
      if($('representatives').checked && w.is_representative === false) return false;
      if(!$('unknowns').checked && (year(w)===null || !dims(w) || shape(w)==='Unknown' || collection(w)==='Unknown' || colors(w).includes('unknown'))) return false;
      if(state.colors.size && !colors(w).some(c=>state.colors.has(c))) return false;
      if(selectedShape && shape(w)!==selectedShape) return false;
      if(selectedCollection && collection(w)!==selectedCollection) return false;
      if(decade && (decade==='Unknown' ? year(w)!==null : year(w)===null || Math.floor(year(w)/10)*10+'s'!==decade)) return false;
      if(image==='available' && !imagePath(w) || image==='missing' && imagePath(w) || image==='svg' && !w.image_svg) return false;
      if(q && ![title(w),...(w.title_aliases||[]),date(w),collection(w),w.collection,shape(w),colors(w).join(' '),w.id,w.canonical_id].some(v=>String(v).toLowerCase().includes(q))) return false;
      return true;
    });
    const order=$('sort').value;
    state.filtered.sort((a,b)=>{
      if(order==='study'){const available=Number(Boolean(imagePath(b)))-Number(Boolean(imagePath(a)));if(available)return available;const ya=year(a),yb=year(b);return (ya??Infinity)-(yb??Infinity)||title(a).localeCompare(title(b));}
      if(order==='year'||order==='year-desc'){const ya=year(a),yb=year(b);if(ya===null && yb!==null)return 1;if(yb===null && ya!==null)return -1;return (order==='year-desc'?-1:1)*((ya??0)-(yb??0))||title(a).localeCompare(title(b));}
      if(order==='area')return (dims(b)?b.height_cm*b.width_cm:-1)-(dims(a)?a.height_cm*a.width_cm:-1)||title(a).localeCompare(title(b));
      if(order==='color')return colors(a)[0].localeCompare(colors(b)[0])||(year(a)??9999)-(year(b)??9999);
      if(order==='shape')return shape(a).localeCompare(shape(b))||(year(a)??9999)-(year(b)??9999);
      return title(a).localeCompare(title(b));
    });
    render();
  }
  function render() {
    updateHiddenControls();
    const works=state.filtered, n=works.length, missing=works.filter(w=>!imagePath(w)).length;
    $('result-count').textContent=fmt(n);$('result-noun').textContent=n===1?'work':'works';
    const studyCount=works.filter(w=>w.image_svg).length,otherImages=n-missing-studyCount;
    $('result-note').textContent=`${fmt(studyCount)} SVG studies${otherImages?' · '+fmt(otherImages)+' source images':''} · ${fmt(missing)} open visual slots`;
    const colorText=state.colors.size?[...state.colors].map(nice).join(' + '):'';
    $('field-name').textContent=colorText?`A FIELD OF ${colorText.toUpperCase()}`: 'THE WHOLE FIELD';
    $('footer-count').textContent=`${fmt(n)} / ${fmt(state.works.length)} records`;
    $('empty').hidden=n>0;$('gallery').hidden=state.view!=='grid'||!n;$('plot').hidden=state.view!=='plot'||!n;
    $('arrange-controls').hidden=state.view!=='plot';$('scale-note').hidden=!$('relative-scale').checked;$('vivid-note').hidden=!$('vivid-colour').checked;document.body.classList.toggle('vivid-preview',$('vivid-colour').checked);$('gallery').classList.toggle('relative-gallery',$('relative-scale').checked);
    document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(state.colors.has(b.dataset.color))));
    immersive.setActive(state.view==='gallery');
    if(state.view==='gallery')immersive.update(works,{colors:[...state.colors],collection:$('collection').value,availableColours:[...new Set(state.works.flatMap(colors))].sort((a,b)=>(colorOrder.indexOf(a)<0?99:colorOrder.indexOf(a))-(colorOrder.indexOf(b)<0?99:colorOrder.indexOf(b)))});
    else if(state.view==='grid')renderGrid();else renderPlot();
    syncLocation();
  }
  function artMarkup(w,mode,maxDimension) {
    const src=imageURL(imagePath(w));if(!src)return mode==='plot'?'?':placeholder(w);
    let sizing='';
    if($('relative-scale').checked && dims(w)){
      const gridColumn=parseFloat(getComputedStyle($('gallery')).gridTemplateColumns)||185;
      const maxPx=mode==='plot'?70:Math.min(170,Math.max(40,gridColumn-16));
      sizing=` style="width:${w.width_cm/maxDimension*maxPx}px;height:${w.height_cm/maxDimension*maxPx}px"`;
    }
    return `<img src="${esc(src)}" alt="${esc(title(w))}${w.image_svg?' — interpretive SVG study':''}" loading="lazy" data-study="${Boolean(w.image_svg)}"${sizing}>`;
  }
  function getMaxDimension(){return Math.max(1,...state.works.filter(w=>!state.hidden.has(String(w.id))&&dims(w)).flatMap(w=>[Number(w.height_cm),Number(w.width_cm)]));}
  function bindArtEvents(container) {
    container.querySelectorAll('[data-work-id]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.workId)));
    container.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const card=img.closest('[data-work-id]');const w=state.works.find(w=>String(w.id)===card?.dataset.workId);if(!w)return;const stage=img.closest('.art-stage');if(stage)stage.innerHTML=placeholder(w);else{img.remove();card.textContent='?';card.classList.add('missing-dot');}}));
  }
  function renderGrid(){
    const max=getMaxDimension();
    $('gallery').innerHTML=state.filtered.map(w=>`<button class="art-card${$('relative-scale').checked&&!dims(w)?' dimension-unknown':''}" data-work-id="${esc(w.id)}" aria-label="${esc(title(w))}, ${esc(date(w))}. Open record"><span class="art-stage">${artMarkup(w,'grid',max)}</span><span class="art-caption"><span class="art-title">${esc(title(w))}</span><span class="art-date">${esc(date(w))}</span><span class="art-extra">${esc(imageKind(w))}${dims(w)?' · '+fmt(w.height_cm)+' × '+fmt(w.width_cm)+' cm':''}</span></span></button>`).join('');
    bindArtEvents($('gallery'));
  }
  const axes={year:{name:'Year created',numeric:true,get:year},height:{name:'Height (cm)',numeric:true,get:w=>number(w.height_cm)>0?number(w.height_cm):null},width:{name:'Width (cm)',numeric:true,get:w=>number(w.width_cm)>0?number(w.width_cm):null},area:{name:'Bounding-box area (cm²)',numeric:true,get:w=>dims(w)?w.height_cm*w.width_cm:null},ratio:{name:'Width / height',numeric:true,get:w=>dims(w)?w.width_cm/w.height_cm:null},color:{name:'Color · first recorded color',get:w=>colors(w)[0]==='unknown'?null:nice(colors(w)[0])},shape:{name:'Shape',get:w=>shape(w)==='Unknown'?null:shape(w)},collection:{name:'Collection reported',get:w=>collection(w)==='Unknown'?null:collection(w)}};
  function axisScale(key,works){
    const axis=axes[key], values=works.map(axis.get).filter(v=>v!==null);
    if(axis.numeric){const min=values.length?Math.min(...values):0,max=values.length?Math.max(...values):1;const spread=max-min||1;return{axis,position:v=>v===null?null:max===min?.5:.06+(v-min)/spread*.88,ticks:max===min?[{p:.5,label:key==='year'?String(Math.round(min)):fmt(min)}]:Array.from({length:5},(_,i)=>({p:.06+i*.22,label:key==='year'?String(Math.round(min+(max-min)*i/4)):fmt(min+(max-min)*i/4)}))};}
    const cats=[...new Set(values)].sort((a,b)=>a.localeCompare(b));
    return{axis,position:v=>v===null?null:cats.length<2?.5:.06+cats.indexOf(v)/(cats.length-1)*.88,ticks:cats.map((v,i)=>({p:cats.length<2?.5:.06+i/(cats.length-1)*.88,label:v}))};
  }
  function renderPlot(){
    const x=axisScale($('axis-x').value,state.filtered),y=axisScale($('axis-y').value,state.filtered),max=getMaxDimension();
    const plotted=state.filtered.filter(w=>x.axis.get(w)!==null&&y.axis.get(w)!==null),missing=state.filtered.filter(w=>!plotted.includes(w));
    const xTicks=x.ticks.map(t=>`<span class="axis-tick x" style="left:${t.p*100}%">${esc(t.label)}</span>`).join('');
    const yTicks=y.ticks.map(t=>`<span class="axis-tick y" style="top:${(1-t.p)*100}%">${esc(t.label)}</span>`).join('');
    const dots=plotted.map((w,i)=>{
      const jitterX=x.axis.numeric?0:((i*7)%9-4)*.35,jitterY=y.axis.numeric?0:((i*13)%9-4)*.35;
      return `<button data-work-id="${esc(w.id)}" class="plot-dot${!imagePath(w)?' missing-dot':''}${$('relative-scale').checked&&dims(w)?' relative-dot':''}" style="left:${x.position(x.axis.get(w))*100+jitterX}%;top:${(1-y.position(y.axis.get(w)))*100+jitterY}%" title="${esc(title(w))} · ${esc(date(w))}" aria-label="${esc(title(w))}, ${esc(date(w))}. Open record">${artMarkup(w,'plot',max)}</button>`;
    }).join('');
    $('plot').innerHTML=`<div class="plot-inner"><span class="axis-title y">${esc(y.axis.name)}</span><div class="plot-area">${xTicks}${yTicks}${dots}</div><span class="axis-title x">${esc(x.axis.name)}</span></div>${missing.length?`<div class="plot-unknown">${fmt(missing.length)} records cannot be positioned because an axis attribute is unknown. <button id="show-unplotted">See their records ↗</button></div>`:''}`;
    const cats=Math.max(x.ticks.length,y.ticks.length);if(cats>12)$('plot').querySelector('.plot-inner').style.minWidth=`${Math.min(2800,Math.max(650,x.ticks.length*85))}px`;
    if(y.ticks.length>12){$('plot').querySelector('.plot-inner').style.height=`${Math.min(2400,Math.max(650,y.ticks.length*48))}px`;}
    bindArtEvents($('plot'));
    $('show-unplotted')?.addEventListener('click',()=>{
      state.unplotted=missing;setView('grid');state.filtered=missing;render();toast('Showing records with unknown axis attributes. Change any filter to return.');
    });
  }
  function syncLocation(){
    const url=new URL(location.href);
    if(state.view==='gallery')url.searchParams.set('view','gallery');else if(state.view==='plot')url.searchParams.set('view','plot');else url.searchParams.delete('view');
    if(state.colors.size)url.searchParams.set('color',[...state.colors].join(','));else url.searchParams.delete('color');
    if($('collection').value)url.searchParams.set('collection',$('collection').value);else url.searchParams.delete('collection');
    if(!$('representatives').checked)url.searchParams.set('versions','all');else url.searchParams.delete('versions');
    if(immersive.relative)url.searchParams.set('scale',immersive.scaleMode);else url.searchParams.delete('scale');
    if(url.href!==location.href)history.replaceState(null,'',url);
  }
  function setView(view){const previous=state.view;state.view=view;for(const type of ['grid','plot','gallery']){$('view-'+type).classList.toggle('active',view===type);$('view-'+type).setAttribute('aria-pressed',String(view===type));}render();if(previous==='gallery'&&view!=='gallery')$('gallery-open').focus({preventScroll:true});}
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
  async function loadRecolourStudy(w,revision) {
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
      const controls=$('recolour-controls');controls.replaceChildren();controls.hidden=false;
      const heading=document.createElement('h3');heading.id='recolour-title';heading.textContent='Make a colour study';controls.append(heading);
      const intro=document.createElement('p');intro.className='recolour-note';intro.textContent='Recolour this SVG study. Catalogue tags and other paintings keep their original colours.';controls.append(intro);
      const palette=document.createElement('div');palette.className='study-palette';
      const inputs=[];
      for(const group of groups.values()){
        const label=document.createElement('label'),input=document.createElement('input'),caption=document.createElement('span');
        input.type='color';input.value=group.original;input.setAttribute('aria-label','Recolour '+nice(group.label));
        caption.textContent=nice(group.label);label.append(input,caption);palette.append(label);inputs.push({input,group});
        input.addEventListener('input',()=>{for(const shape of group.shapes)shape.setAttribute('fill',input.value);});
      }
      controls.append(palette);
      const actions=document.createElement('div');actions.className='study-actions';
      const reset=document.createElement('button');reset.type='button';reset.className='text-button';reset.textContent='Reset study colours';
      reset.addEventListener('click',()=>{for(const {input,group}of inputs){input.value=group.original;for(const shape of group.shapes)shape.setAttribute('fill',group.original);}});
      const download=document.createElement('button');download.type='button';download.className='text-button';download.textContent='Download this SVG ↓';
      download.addEventListener('click',()=>{
        const exported=svg.cloneNode(true);exported.setAttribute('width',String(width>0?width:1000*ratio));exported.setAttribute('height',String(height>0?height:1000));
        const note=document.createElementNS('http://www.w3.org/2000/svg','metadata');note.textContent='Interactive colour study. Interpretive geometry and screen colours; catalogue colour tags remain unchanged.';exported.append(note);
        const serialized=new XMLSerializer().serializeToString(exported),url=URL.createObjectURL(new Blob([serialized],{type:'image/svg+xml;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download=String(w.id).replace(/[^a-z0-9-]/gi,'')+'-colour-study.svg';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('SVG colour study downloaded');
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
  function openDetail(id){
    const w=state.works.find(w=>String(w.id)===String(id));if(!w)return;
    const detailRevision=state.detailRevision=(state.detailRevision||0)+1;
    const src=imageURL(imagePath(w)), missing=Array.isArray(w.missing_fields)?w.missing_fields:[];
    const sources=Array.isArray(w.sources)?w.sources:[];
    const notes=Array.isArray(w.notes)?w.notes.filter(Boolean).join(' '):w.notes;
    const auctions=(w.auction_history||[]).map(a=>{const url=safeURL(a.source_url);return `<li>${esc(a.house||a.auction_house||a.sale_house||'Auction record')} · ${esc(String(a.sale_date||'Date unknown').slice(0,10))}${a.lot_number?' · lot '+esc(a.lot_number):''}${url?` <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Public lot record ↗</a>`:''}</li>`;}).join('');
    const sourceHTML=sources.map((s,i)=>{if(typeof s==='string')s={url:s,label:'Source '+(i+1)};const url=safeURL(s.url);return url?`<li><a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.title||'Source '+(i+1))} ↗<span>${esc(new URL(url).hostname)}</span></a></li>`:'';}).join('');
    const marketOffers=(w.market_history||[]).map(a=>{const url=safeURL(a.source_url);return `<li>${esc(a.house||'Dealer')} · Private sale offer · observed ${esc(a.observed_date||'date unknown')}${url?` <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Listing ↗</a>`:''}</li>`;}).join('');
    $('detail-body').innerHTML=`<div class="detail-layout"><div class="detail-image">${src?`<img src="${esc(src)}" alt="${esc(title(w))}${w.image_svg?' — interpretive SVG study':''}" data-study="${Boolean(w.image_svg)}">`:placeholder(w)}</div><div class="detail-info"><p class="eyebrow">ELLSWORTH KELLY · CATALOGUE WORK</p><h2 id="detail-title">${esc(title(w))}</h2><p class="detail-year">${esc(date(w))}</p><div class="detail-visibility"><button id="detail-hide" class="outline-button">Hide from all views</button><span>Temporary in this tab. Restore hidden works at any time.</span></div><dl><dt>Dimensions</dt><dd>${dims(w)?fmt(w.height_cm)+' × '+fmt(w.width_cm)+' cm (h × w)':'Not yet recorded'}</dd><dt>Medium</dt><dd>${esc(w.medium||'Not yet recorded')}</dd><dt>Color</dt><dd>${esc(colors(w).map(nice).join(', '))}</dd><dt>Shape</dt><dd>${esc(shape(w))}</dd><dt>Collection reported</dt><dd>${esc(clean(w.collection)||'Unknown')}</dd><dt>Image</dt><dd>${esc(imageKind(w))}</dd>${w.canonical_id?`<dt>Catalogue ID</dt><dd>${esc(w.canonical_id)}</dd>`:''}</dl>${estimatedSizeHTML(w)}${w.color_basis?`<p class="color-evidence"><strong>Color evidence:</strong> ${esc(colorEvidence(w))}</p>`:''}${w.image_svg?'<section id="recolour-controls" class="recolour-controls" aria-labelledby="recolour-title" hidden></section><p class="uncertainty">Interpretive reconstruction; geometry and screen colour approximate. This SVG study is a navigational aid. Consult the linked source to examine the artwork.</p>':''}${w.true_scale_eligible===false?`<p class="uncertainty">${esc(w.true_scale_note||'Schematic projection: available in comparable-size Gallery view, omitted from true scale.')}</p>`:''}${w.image_original&&!w.image_svg&&!w.image_png?'<p class="uncertainty">Source photograph; background has not been removed.</p>':''}${marketOffers?`<h3>Public market listings</h3><ul>${marketOffers}</ul><p class="uncertainty">An offer is not evidence of a completed sale.</p>`:''}${auctions?`<h3>Public auction history</h3><ul>${auctions}</ul><p class="uncertainty">Sale records establish public appearances; present ownership is unverified.</p>`:''}${notes?`<h3>Record notes</h3><p>${esc(notes)}</p>`:''}${missing.length?`<h3>Known gaps</h3><p class="uncertainty">${esc(missing.map(nice).join(' · '))}</p>`:''}${w.is_representative===false?'<p class="uncertainty">A work with this recorded title has an earlier date in the catalogue. This record is hidden by the default earliest-title filter.</p>':''}<h3>Sources & evidence</h3>${sourceHTML?`<ul>${sourceHTML}</ul>`:'<p class="uncertainty">No linked source has yet been recorded.</p>'}<p class="record-id">Record ${esc(w.id)}${w.duplicate_group?' · Title group '+esc(w.duplicate_group):''}</p></div></div>`;
    $('detail-dialog').showModal();$('detail-close').focus();
    $('detail-hide').addEventListener('click',()=>hideWork(w));
    if(w.image_svg)loadRecolourStudy(w,detailRevision);
  }
  function buildCoverage(){
    const all=state.works,n=all.length,svg=all.filter(w=>w.image_svg).length,sourced=all.filter(w=>Array.isArray(w.sources)&&w.sources.length).length;
    const representatives=all.filter(w=>w.is_representative!==false).length,summary=state.summary;
    $('catalogue-total').textContent=`${fmt(n)} records · ${fmt(representatives)} earliest titles`;
    $('coverage-stats').innerHTML=[[n,'catalogued records'],[representatives,'earliest title records'],[sourced,'with linked sources'],[svg,'interpretive SVG studies'],[all.filter(w=>!dims(w)).length,'dimensions to be found'],[all.filter(w=>year(w)===null).length,'dates unresolved']].map(([count,label])=>`<div class="coverage-stat"><strong>${fmt(count)}</strong><span>${label}</span></div>`).join('');
    const sourceNames={foundation:'Ellsworth Kelly Foundation',museums:'Museum collections',chatham:'Chatham exhibition inventory',moma_1973_selected_captions:'MoMA 1973 exhibition captions',museum_enrichment_v2:'Additional museum records',screening_enrichment_v2:'Screening follow-up records',met_painting_dataset_v2:'Met open collection dataset',chronology_named_candidates:'Foundation chronology: named candidates',sfmoma_enrichment_v3:'SFMOMA full artist-index review',hirshhorn_seattle_v3:'Hirshhorn and Seattle collection review',broad_moca_v3:'Broad and MOCA collection review',additional_museums_v3:'Glenstone, Fort Worth and Nelson-Atkins review',core_museums_v4:'Chicago and core museum refresh',north_american_museums_v4:'North American collection sweep',international_museums_v4:'International collection sweep',auction_private_v4:'Public auctions and gallery exhibition archives',secondary_galleries_v4:'Additional primary gallery records',short_catalogues_v4:'Public gallery and Whitney exhibition books',public_catalogues_v4:'Guggenheim 1996 retrospective inventory',foundation_exhibitions_v4:'Foundation exhibition-caption evidence',moma_live_v4:'MoMA live promised-gift object pages'};
    const contributions=Object.entries(summary.source_record_counts||{}).map(([key,count])=>`<li><span>${esc(sourceNames[key]||nice(key))}</span><strong>${esc(count)} records</strong></li>`).join('');
    const gaps=(Array.isArray(summary.known_unknowns)?summary.known_unknowns:[]).map(g=>{
      const years=Array.isArray(g.years)?g.years.join('–'):nice(g.id);
      return `<li><strong>${esc(years)}</strong><p>${esc(g.reason||'Inventory reconciliation remains incomplete.')}</p><span>${g.missing_count===null||g.missing_count===undefined?'Number of missing works not established':fmt(g.missing_count)+' missing works identified'}</span></li>`;
    }).join('');
    const conflicts=(Array.isArray(summary.source_conflicts)?summary.source_conflicts:[]).map(c=>{
      const preferred=safeURL(c.preferred_source),other=safeURL(c.other_source);
      return `<li><strong>${esc(c.title)} · ${esc(nice(c.field))}</strong><p>${esc(c.reason||'Sources differ.')}</p><span>Catalogue value: ${esc(c.preferred??'Unresolved')}; conflicting source: ${esc(c.other??'Unknown')}.</span><p class="conflict-links">${preferred?`<a href="${esc(preferred)}" target="_blank" rel="noopener noreferrer">Catalogue evidence ↗</a>`:''}${other?` <a href="${esc(other)}" target="_blank" rel="noopener noreferrer">Conflicting record ↗</a>`:''}</p></li>`;
    }).join('');
    const notes=[summary.collection_note,summary.color_note,summary.size_note].filter(Boolean).map(note=>`<p>${esc(note)}</p>`).join('');
    const screening=summary.museum_screening,screeningCounts=screening?.status_counts||{};
    const screeningHTML=screening?`<h3>Museum research</h3>${summary.museum_research_v4?.targets_with_recorded_outcome?`<p><strong>${fmt(summary.museum_research_v4.targets_with_recorded_outcome)} of 200 targets revisited</strong> in the latest pass. Work-level outcomes, exclusions and access limits are preserved in the downloadable queue.</p>`:''}<p>Original screening: ${fmt(screening.targets||0)} institution targets screened: ${fmt(screeningCounts.artist_mention_leads||0)} produced artist-mention leads; ${fmt(screeningCounts.no_indexed_primary_result_in_this_pass||0)} had no indexed primary result in this pass. These are institution-search outcomes, not counts of holdings or paintings.</p>${screening.method?`<p class="coverage-small">${esc(screening.method)}</p>`:''}`:'';
    const references=(Array.isArray(summary.catalogue_references)?summary.catalogue_references:[]).map(reference=>{const url=safeURL(reference.url);return url?`<li><a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(String(reference.title||'Catalogue reference').replace(/volume(\d):/gi,'volume $1: '))} ↗</a></li>`:'';}).join('');
    const colorPending=all.filter(w=>!w.color_basis||/unreviewed|title_derived/.test(w.color_basis)).length;
    const pass=summary.svg_gap_pass_v6||summary.svg_gap_pass_v5,passVersion=summary.svg_gap_pass_v6?'v6':'v5';
    const gapPassHTML=pass?`<h3>Latest SVG reference pass</h3><p>${fmt(pass.new_svg_studies)} additional SVGs in a review of ${fmt(pass.baseline_svg_gaps)} visual gaps. ${fmt(pass.scope_exclusions)} records were identified as nonpaintings and retained in an exclusions ledger.</p><p><a href="./svg-gap-pass-${passVersion}.md" target="_blank" rel="noopener noreferrer">SVG reference audit ↗</a> · <a href="./data/svg-gap-outcomes-${passVersion}.json" download>Every reviewed gap (JSON) ↓</a> · <a href="./data/excluded-nonpaintings-${passVersion}.json" download>Scope exclusions (JSON) ↓</a></p>`:'';
    $('coverage-extra').innerHTML=`${summary.as_of?`<p class="coverage-date">Research snapshot: ${esc(summary.as_of)}</p>`:''}${gapPassHTML}<h3>How much is here?</h3><p>${esc(summary.completeness||'Completeness is unestablished. This inventory does not establish the total number of Kelly paintings.')} The ${fmt(n)} records above are a source-backed starting point, not a denominator for the whole body of work.</p><p>${fmt(n-svg)} records still need an SVG study. ${fmt(colorPending)} records have unreviewed or title-derived color tags. A blue search may therefore include provisional matches and miss works whose color has not yet been documented.</p>${contributions?`<h3>Reported source contributions</h3><ul class="provenance-list">${contributions}</ul><p class="coverage-small">Sources can overlap and records may be reconciled. These contributions describe the research inputs, not independent counts of unique paintings.</p>`:''}${screeningHTML}<h3>Continue the research</h3><p class="research-resource-links"><a href="./research-expansion-v4.md" target="_blank" rel="noopener noreferrer">Latest collection and auction expansion ↗</a><a href="./research-roadmap.md" target="_blank" rel="noopener noreferrer">Research roadmap ↗</a><a href="./data/museum-research-queue.json" download>Museum research queue (JSON) ↓</a></p>${references?`<h3>Catalogue raisonné references</h3><ul class="catalogue-reference-list">${references}</ul>`:''}${gaps?`<h3>Inventory gaps, kept explicit</h3><ul class="coverage-gaps">${gaps}</ul>`:''}${conflicts?`<h3>Sources that disagree</h3><ul class="coverage-gaps">${conflicts}</ul>`:''}${notes?`<h3>Metadata limits</h3>${notes}`:''}`;
  }
  function reset(){state.colors.clear();['search','shape','decade','collection','image-filter'].forEach(id=>$(id).value='');$('representatives').checked=true;$('unknowns').checked=true;filter();}
  function exportData(type){
    let content,mime;if(type==='json'){content=JSON.stringify({exported_at:new Date().toISOString(),count:state.filtered.length,filters:{search:$('search').value,colors:[...state.colors],shape:$('shape').value,decade:$('decade').value,collection:$('collection').value,earliest_title_only:$('representatives').checked},works:state.filtered},null,2);mime='application/json';}
    else{const fields=['id','title','year_start','year_end','date_display','height_cm','width_cm','medium','collection','colors','color_basis','shape_type','image_svg','image_png','image_original','image_status','is_representative','missing_fields','canonical_id','true_scale_eligible','scale_estimate','auction_history','market_history','sources','notes'];const cell=v=>'"'+String(Array.isArray(v)||typeof v==='object'&&v!==null?JSON.stringify(v):v??'').replace(/"/g,'""')+'"';content=[fields.join(','),...state.filtered.map(w=>fields.map(k=>cell(w[k])).join(','))].join('\r\n');mime='text/csv;charset=utf-8';}
    const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement('a');a.href=url;a.download=`ellsworth-kelly-${state.filtered.length}-works.${type}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('export-menu').hidden=true;$('export').setAttribute('aria-expanded','false');toast(`Exported ${fmt(state.filtered.length)} records`);
  }
  ['search','shape','decade','collection','image-filter','representatives','unknowns','sort'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',filter));
  ['relative-scale','vivid-colour','axis-x','axis-y'].forEach(id=>$(id).addEventListener('change',render));
  $('color-chips').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;const c=b.dataset.color;state.colors.has(c)?state.colors.delete(c):state.colors.add(c);filter();});
  $('all-blue').addEventListener('click',()=>{reset();state.colors.add('blue');filter();$('results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});});
  $('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
  $('restore-hidden').addEventListener('click',restoreHidden);$('gallery-restore-hidden').addEventListener('click',restoreHidden);
  $('view-grid').addEventListener('click',()=>setView('grid'));$('view-plot').addEventListener('click',()=>setView('plot'));$('view-gallery').addEventListener('click',()=>setView('gallery'));$('gallery-open').addEventListener('click',()=>setView('gallery'));
  $('detail-close').addEventListener('click',()=>$('detail-dialog').close());$('coverage-close').addEventListener('click',()=>$('coverage-dialog').close());
  $('coverage-open').addEventListener('click',()=>$('coverage-dialog').showModal());
  ['detail-dialog','coverage-dialog'].forEach(id=>$(id).addEventListener('click',e=>{if(e.target===$(id)){const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();}}));
  $('export').addEventListener('click',()=>{const open=$('export-menu').hidden;$('export-menu').hidden=!open;$('export').setAttribute('aria-expanded',String(open));});
  $('export-json').addEventListener('click',()=>exportData('json'));$('export-csv').addEventListener('click',()=>exportData('csv'));
  document.addEventListener('click',e=>{if(!e.target.closest('.export-wrap')){$('export-menu').hidden=true;$('export').setAttribute('aria-expanded','false');}});
  window.addEventListener('resize',()=>{clearTimeout(state.resizeTimer);state.resizeTimer=setTimeout(render,120);});
  Promise.all([fetch('./data/catalogue.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('Catalogue request failed ('+r.status+')');return r.json();}),fetch('./data/scale-estimates.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null)]).then(([data,scaleData])=>{
    state.works=Array.isArray(data)?data:Array.isArray(data.works)?data.works:[];state.summary=data.summary||{};if(!state.works.length)throw new Error('The catalogue does not yet contain records.');
    state.works=state.works.map((w,i)=>({...w,id:w.id??'record-'+i,...(scaleData?.estimates?.[w.id]?{scale_estimate:scaleData.estimates[w.id]}:{})}));const estimatesAvailable=state.works.some(w=>w.scale_estimate?.height_cm>0&&w.scale_estimate?.width_cm>0);
    for(const option of $('gallery-scale-source').options)if(option.value!=='recorded')option.disabled=!estimatesAvailable;
    if(!estimatesAvailable)$('gallery-scale-source').title='Estimated sizes could not be loaded; recorded sizes are available.';
    if(['recorded','estimated','estimates-only'].includes(initialQuery.get('scale'))){immersive.scaleMode=estimatesAvailable?initialQuery.get('scale'):'recorded';$('gallery-scale-source').value=immersive.scaleMode;immersive.setRelative(true,false);if(!estimatesAvailable&&initialQuery.get('scale')!=='recorded')toast('Estimated sizes could not be loaded. Showing recorded sizes.');}$('loading').hidden=true;buildFilters();buildCoverage();const initial=initialQuery;if(initial.get('color'))initial.get('color').split(',').filter(c=>colorOrder.includes(c)).forEach(c=>state.colors.add(c));if(['svg','missing','available'].includes(initial.get('images')))$('image-filter').value=initial.get('images');if(initial.get('versions')==='all')$('representatives').checked=false;if(initial.get('collection')&&[...$('collection').options].some(o=>o.value===initial.get('collection')))$('collection').value=initial.get('collection');filter();for(const type of ['grid','plot','gallery']){$('view-'+type).classList.toggle('active',state.view===type);$('view-'+type).setAttribute('aria-pressed',String(state.view===type));}
  }).catch(err=>{$('loading').innerHTML=`<p>The catalogue could not be opened.</p><p style="font:12px Arial,sans-serif">${esc(err.message)}<br>Serve this folder over HTTP and include data/catalogue.json.</p>`;$('result-count').textContent='0';$('result-note').textContent='Catalogue unavailable';if(state.view==='gallery'){$('gallery-empty').hidden=false;$('gallery-empty-title').textContent='The catalogue could not be opened.';$('gallery-empty-note').textContent=err.message;}});
})();
