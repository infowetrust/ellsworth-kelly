/* A blank, pannable field of SVGs. No geometry is reconstructed in this view. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const finite=v=>v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
  const dimensions=w=>finite(w.width_cm)>0&&finite(w.height_cm)>0;
  const trueScaleEligible=w=>dimensions(w)&&w.true_scale_eligible!==false;
  const title=w=>String(w.title||'Untitled record');
  const nice=s=>String(s||'Unknown').replace(/[_-]/g,' ').replace(/^./,c=>c.toUpperCase());
  const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  const distance=(a,b)=>a.reduce((sum,v,i)=>sum+(v-b[i])**2,0);

  /* Shelf rows keep every artwork disjoint. Alternating row direction preserves
     neighbours in the ordering, without fitting individual works into cells. */
  function packRows(items,targetWidth,gap){
    const rows=[];let row=[],width=0,height=0;
    function flush(){if(row.length)rows.push({items:row,width,height});row=[];width=0;height=0;}
    for(const item of items){if(row.length&&width+gap+item.width>targetWidth)flush();if(row.length)width+=gap;row.push(item);width+=item.width;height=Math.max(height,item.height);}flush();
    const worldWidth=Math.max(1,...rows.map(r=>r.width));let y=0;const positions=[];
    rows.forEach((r,index)=>{let x=(worldWidth-r.width)/2;const sequence=index%2?[...r.items].reverse():r.items;for(const item of sequence){positions.push({...item,x,y:y+(r.height-item.height)/2});x+=item.width+gap;}y+=r.height+gap;});
    return {items:positions,width:worldWidth,height:Math.max(1,y-gap)};
  }
  function packedLayout(items,aspect,gap){
    if(!items.length)return {items:[],width:1,height:1};
    const area=items.reduce((n,w)=>n+(w.width+gap)*(w.height+gap),0),widest=Math.max(...items.map(w=>w.width));
    let target=Math.max(widest,Math.sqrt(area*aspect)),packed;
    for(let i=0;i<5;i++){packed=packRows(items,target,gap);const ratio=packed.width/packed.height;if(Math.abs(Math.log(ratio/aspect))<.08)break;target=Math.max(widest,target*Math.sqrt(aspect/ratio));}
    return packed;
  }

  function visualFeatures(image){
    const canvas=document.createElement('canvas');canvas.width=24;canvas.height=24;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const width=image.naturalWidth||1,height=image.naturalHeight||1,scale=24/Math.max(width,height);
    ctx.clearRect(0,0,24,24);ctx.drawImage(image,(24-width*scale)/2,(24-height*scale)/2,width*scale,height*scale);
    const rgba=ctx.getImageData(0,0,24,24).data,hist=Array(15).fill(0),silhouette=Array(36).fill(0);let weight=0,brightness=0;
    for(let y=0;y<24;y++)for(let x=0;x<24;x++){
      const i=(y*24+x)*4,a=rgba[i+3]/255;if(a<.04)continue;
      const r=rgba[i]/255,g=rgba[i+1]/255,b=rgba[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,saturation=max?delta/max:0;
      let hue=0;if(delta){if(max===r)hue=((g-b)/delta+6)%6;else if(max===g)hue=(b-r)/delta+2;else hue=(r-g)/delta+4;hue/=6;}
      const bin=saturation<.16?(max<.25?12:max>.82?14:13):Math.min(11,Math.floor(hue*12));
      hist[bin]+=a;weight+=a;brightness+=(r*.2126+g*.7152+b*.0722)*a;silhouette[Math.floor(y/4)*6+Math.floor(x/4)]+=a/16;
    }
    for(let i=0;i<hist.length;i++)hist[i]/=weight||1;
    const dominant=hist.indexOf(Math.max(...hist));
    return {dominant,brightness:brightness/(weight||1),hist,coverage:weight/576,descriptor:[...hist.map(v=>Math.sqrt(v)*1.5),...silhouette.map(v=>v*.3),Math.log(width/height)*.16]};
  }

  class KellyGallery {
    constructor({onOpen,onExit,onColour,onScale}){
      this.root=$('immersive-gallery');this.stage=$('gallery-stage');this.world=$('gallery-world');this.onOpen=onOpen;this.onExit=onExit;this.onColour=onColour;
      this.cache=new Map();this.active=false;this.relative=false;this.scaleMode='recorded';this.onScale=onScale;this.layout='colour';this.chrome=true;this.items=[];this.pointers=new Map();this.camera={x:0,y:0,scale:1};this.bounds={width:1,height:1};this.fitScale=1;this.fitted=true;this.seed=1;this.revision=0;this.minScale=.001;this.maxScale=40;
      $('gallery-exit').addEventListener('click',()=>this.onExit());
      $('gallery-comparable').addEventListener('click',()=>this.setRelative(false));$('gallery-physical').addEventListener('click',()=>this.setRelative(true));
      $('gallery-scale-source').addEventListener('change',()=>{this.scaleMode=$('gallery-scale-source').value;this.relayout(true);this.onScale?.();});
      $('gallery-layout').addEventListener('change',()=>{this.layout=$('gallery-layout').value;if(this.layout==='shuffle')this.seed++;$('gallery-reshuffle').hidden=this.layout!=='shuffle';this.relayout(true);});
      $('gallery-reshuffle').addEventListener('click',()=>{this.seed++;this.relayout(true);});
      $('gallery-colour').addEventListener('change',()=>{const value=$('gallery-colour').value;if(value!=='__multiple')this.onColour(value);});
      $('gallery-empty-clear').addEventListener('click',()=>this.onColour(''));
      $('gallery-zoom-in').addEventListener('click',()=>this.zoomBy(1.35));$('gallery-zoom-out').addEventListener('click',()=>this.zoomBy(1/1.35));$('gallery-fit').addEventListener('click',()=>this.fit());
      $('gallery-hide-chrome').addEventListener('click',()=>{this.showChrome(false);this.stage.focus({preventScroll:true});});
      this.root.querySelectorAll('[data-gallery-background]').forEach(b=>b.addEventListener('click',()=>{this.root.dataset.background=b.dataset.galleryBackground;this.root.querySelectorAll('[data-gallery-background]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));}));
      this.stage.addEventListener('pointerdown',e=>this.pointerDown(e));this.stage.addEventListener('pointermove',e=>this.pointerMove(e));this.stage.addEventListener('pointerup',e=>this.pointerUp(e));this.stage.addEventListener('pointercancel',e=>this.pointerUp(e,true));
      this.stage.addEventListener('wheel',e=>this.wheel(e),{passive:false});
      this.stage.addEventListener('dblclick',e=>{if(!e.target.closest('[data-gallery-work]'))this.showChrome(!this.chrome);});
      this.stage.addEventListener('click',e=>{if(Date.now()<(this.suppressClickUntil||0)){e.preventDefault();e.stopPropagation();}},{capture:true});
      this.root.addEventListener('keydown',e=>this.keyDown(e));
      this.root.addEventListener('pointerleave',()=>this.hideTooltip());
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.stage);
    }
    setActive(active){
      if(this.active===active)return;this.active=active;this.root.hidden=!active;document.body.classList.toggle('gallery-mode',active);
      for(const section of [document.querySelector('main'),document.querySelector('.masthead')])if(section)section.inert=active;
      if(active){this.showChrome(true);requestAnimationFrame(()=>{this.resize();this.stage.focus({preventScroll:true});});}else{this.hideTooltip();this.pointers.clear();}
    }
    update(works,{colors=[],availableColours=[],collection=''}={}){
      this.filteredWorks=works;this.colors=colors;this.collection=collection;
      const select=$('gallery-colour'),signature=availableColours.join('|');
      if(signature!==this.colourSignature){select.replaceChildren(new Option('All colours',''));for(const c of availableColours)select.add(new Option(c==='unknown'?'Unknown colour':nice(c),c));select.add(new Option('Filtered colours','__multiple'));this.colourSignature=signature;}
      select.value=colors.length===1?colors[0]:colors.length?'__multiple':'';
      const key=works.map(w=>[w.id,w.image_svg,w.width_cm,w.height_cm,w.true_scale_eligible,w.scale_estimate?.height_cm,w.scale_estimate?.width_cm].join(':')).join('|');
      if(this.signature===key){this.updateCounts();return;}this.signature=key;
      const revision=++this.revision;
      const eligible=works.filter(w=>/^assets\/studies\/[a-z0-9-]+\.svg$/.test(w.image_svg||''));
      this.pending=works.length-eligible.length;this.failed=0;this.items=[];this.world.replaceChildren();this.updateCounts();
      $('gallery-empty').hidden=false;$('gallery-empty-title').textContent=eligible.length?'Opening the studies…':'No SVG studies in this field.';
      $('gallery-empty-note').textContent=eligible.length?'':'The catalogue keeps pending records. Return to the catalogue to inspect them.';$('gallery-empty-clear').hidden=!colors.length;
      Promise.all(eligible.map(async work=>{try{return {work,...await this.load(work.image_svg)};}catch{return null;}})).then(results=>{
        if(revision!==this.revision)return;this.items=results.filter(Boolean);this.failed=results.length-this.items.length;this.relayout(true);
      });
    }
    load(path){
      if(this.cache.has(path))return this.cache.get(path);
      const promise=new Promise((resolve,reject)=>{
        const image=new Image();image.onload=()=>{try{resolve({image,ratio:(image.naturalWidth||1)/(image.naturalHeight||1),visual:visualFeatures(image)});}catch(e){reject(e);}};image.onerror=()=>reject(new Error('SVG could not be loaded'));image.src=path;
      });this.cache.set(path,promise);return promise;
    }
    setRelative(relative,notify=true){if(this.relative===relative)return;this.relative=relative;$('gallery-scale-source-label').hidden=!relative;$('gallery-comparable').classList.toggle('active',!relative);$('gallery-physical').classList.toggle('active',relative);$('gallery-comparable').setAttribute('aria-pressed',String(!relative));$('gallery-physical').setAttribute('aria-pressed',String(relative));this.relayout(true);if(notify)this.onScale?.();}
    scaleDimensions(work){
      if(trueScaleEligible(work))return this.scaleMode==='estimates-only'?null:{width:Number(work.width_cm),height:Number(work.height_cm),estimated:false};
      const e=work.scale_estimate;
      if(this.scaleMode==='recorded'||!e||!(finite(e.width_cm)>0&&finite(e.height_cm)>0))return null;
      return {width:Number(e.width_cm),height:Number(e.height_cm),estimated:true};
    }
    ordered(items){
      const byColour=(a,b)=>a.visual.dominant-b.visual.dominant||a.visual.brightness-b.visual.brightness||title(a.work).localeCompare(title(b.work));
      if(this.layout==='year')return [...items].sort((a,b)=>(finite(a.work.year_start)??Infinity)-(finite(b.work.year_start)??Infinity)||title(a.work).localeCompare(title(b.work)));
      if(this.layout==='shape')return [...items].sort((a,b)=>nice(a.work.shape_type).localeCompare(nice(b.work.shape_type))||a.ratio-b.ratio||byColour(a,b));
      if(this.layout==='shuffle')return [...items].sort((a,b)=>hash(a.work.id+':'+this.seed)-hash(b.work.id+':'+this.seed));
      if(this.layout==='similarity'&&items.length){const remaining=[...items].sort(byColour),result=[remaining.shift()];while(remaining.length){const last=result[result.length-1];let best=0,bestDistance=Infinity;for(let i=0;i<remaining.length;i++){const d=distance(last.visual.descriptor,remaining[i].visual.descriptor);if(d<bestDistance){best=i;bestDistance=d;}}result.push(remaining.splice(best,1)[0]);}return result;}
      return [...items].sort(byColour);
    }
    relayout(resetCamera){
      const eligible=this.items.filter(item=>!this.relative||this.scaleDimensions(item.work)),ordered=this.ordered(eligible);
      const sized=ordered.map(item=>{if(this.relative)return {...item,...this.scaleDimensions(item.work)};return {...item,width:160*Math.min(1,item.ratio),height:160*Math.min(1,1/item.ratio),estimated:false};});
      const longEdges=sized.map(w=>Math.max(w.width,w.height)).sort((a,b)=>a-b),gap=this.relative?(longEdges[Math.floor(longEdges.length/2)]||160)*.23:42;
      const rect=this.stage.getBoundingClientRect(),aspect=Math.max(.45,(rect.width||1000)/Math.max(250,(rect.height||700)-155));
      const packed=packedLayout(sized,aspect,gap);this.positions=packed.items;this.bounds={width:packed.width,height:packed.height};
      this.world.replaceChildren();this.nodes=[];
      for(const item of this.positions){
        const button=document.createElement('button');button.className='gallery-artwork';button.dataset.galleryWork=String(item.work.id);button.style.left=item.x+'px';button.style.top=item.y+'px';button.style.width=item.width+'px';button.style.height=item.height+'px';button.setAttribute('aria-label',title(item.work)+', '+(item.work.date_display||item.work.year_start||'Date unknown')+'. Open record and colour controls.');
        const img=document.createElement('img');img.src=item.work.image_svg;img.alt='';img.draggable=false;button.append(img);
        if(item.estimated){button.dataset.scaleEstimated='true';button.setAttribute('aria-label',button.getAttribute('aria-label')+' Estimated size: '+this.estimateLabel(item.work)+'.');}
        button.addEventListener('click',e=>{if(e.detail===0){this.hideTooltip();this.onOpen(item.work.id);}});
        button.addEventListener('pointerenter',e=>{if(!this.pointers.size)this.showTooltip(item,e.clientX,e.clientY);});button.addEventListener('pointermove',e=>{if(!this.pointers.size)this.positionTooltip(e.clientX,e.clientY);});button.addEventListener('pointerleave',()=>this.hideTooltip());
        button.addEventListener('focus',()=>{this.ensureVisible(item);const r=button.getBoundingClientRect();this.showTooltip(item,r.left+r.width/2,r.bottom);});button.addEventListener('blur',()=>this.hideTooltip());
        this.world.append(button);this.nodes.push({item,button});
      }
      this.updateCounts();$('gallery-empty').hidden=sized.length>0;
      if(!sized.length){$('gallery-empty-title').textContent=this.relative&&this.scaleMode==='estimates-only'&&this.items.length?'No estimated sizes in this field.':this.relative&&this.items.length?'No studies can be shown at true scale.':'No SVG studies in this field.';$('gallery-empty-note').textContent=this.relative&&this.items.length?'Choose Include estimated sizes or Comparable size to see more studies.':'Pending records remain available in the catalogue.';}
      if(resetCamera)this.fit();else this.paint();
    }
    updateCounts(){
      const shownItems=this.items.filter(item=>!this.relative||this.scaleDimensions(item.work)),shown=shownItems.length,estimated=this.relative?shownItems.filter(item=>this.scaleDimensions(item.work)?.estimated).length:0,recordedHidden=this.relative&&this.scaleMode==='estimates-only'?this.items.filter(item=>trueScaleEligible(item.work)).length:0,omitted=this.relative?this.items.length-shown-recordedHidden:0;
      $('gallery-study-count').textContent=shown.toLocaleString()+' SVG '+(shown===1?'study':'studies')+(this.colors?.length?' · '+this.colors.map(nice).join(' + '):'')+(this.collection?' · '+this.collection:'');
      const excluded=[];if(estimated)excluded.push(estimated.toLocaleString()+' estimated sizes · open a work for its basis');if(this.pending)excluded.push(this.pending.toLocaleString()+' filtered works without SVGs');if(recordedHidden)excluded.push(recordedHidden.toLocaleString()+' recorded-size studies hidden');if(omitted)excluded.push(omitted.toLocaleString()+' studies omitted: scale unresolved');if(this.failed)excluded.push(this.failed.toLocaleString()+' SVGs could not be opened');
      $('gallery-excluded-count').textContent=excluded.join(' · ');
      $('gallery-scale-explanation').textContent=this.relative?(estimated?'Shared centimetre scale · estimates included':'True scale · one shared scale for recorded centimetres'):'Comparable size · same long edge, original proportions';
    }
    fit(){
      const r=this.stage.getBoundingClientRect(),toolbar=this.root.querySelector('.gallery-topbar').getBoundingClientRect(),status=this.root.querySelector('.gallery-status').getBoundingClientRect(),paddingX=r.width<700?25:65,paddingTop=Math.max(r.width<700?155:115,toolbar.bottom-r.top+26),paddingBottom=Math.max(r.width<700?135:100,r.bottom-status.top+20);
      const scale=Math.min(Math.max(1,r.width-paddingX*2)/this.bounds.width,Math.max(1,r.height-paddingTop-paddingBottom)/this.bounds.height);
      this.fitScale=scale||1;this.minScale=Math.max(.00001,this.fitScale*.07);this.maxScale=Math.max(this.fitScale*24,4);this.camera={x:(r.width-this.bounds.width*scale)/2,y:paddingTop+(r.height-paddingTop-paddingBottom-this.bounds.height*scale)/2,scale};this.fitted=true;this.paint();
    }
    paint(){
      if(this.paintFrame)return;this.paintFrame=requestAnimationFrame(()=>{this.paintFrame=0;const c=this.camera;this.world.style.transform=`translate(${c.x}px, ${c.y}px) scale(${c.scale})`;$('gallery-zoom-value').value=Math.round(c.scale/this.fitScale*100)+'%';if(this.relative)$('gallery-scale-explanation').textContent=(this.scaleMode==='estimates-only'?'Estimated scale · ':this.positions.some(i=>i.estimated)?'Estimated + recorded scale · ':'True scale · ')+c.scale.toLocaleString(undefined,{maximumSignificantDigits:3})+' px per cm, shared by all works';
        const r=this.stage.getBoundingClientRect(),pad=180;for(const {item,button}of this.nodes||[]){const visible=(item.x+item.width)*c.scale+c.x>-pad&&item.x*c.scale+c.x<r.width+pad&&(item.y+item.height)*c.scale+c.y>-pad&&item.y*c.scale+c.y<r.height+pad;button.style.visibility=visible?'visible':'hidden';button.tabIndex=visible?0:-1;}
      });
    }
    zoomBy(factor,x,y){const r=this.stage.getBoundingClientRect();x??=r.width/2;y??=r.height/2;const c=this.camera,next=clamp(c.scale*factor,this.minScale,this.maxScale),ratio=next/c.scale;c.x=x-(x-c.x)*ratio;c.y=y-(y-c.y)*ratio;c.scale=next;this.fitted=false;this.hideTooltip();this.paint();}
    wheel(e){if(!this.active)return;e.preventDefault();this.hideTooltip();if(e.shiftKey){this.camera.x-=e.deltaX||e.deltaY;this.camera.y-=e.deltaX?e.deltaY:0;this.fitted=false;this.paint();return;}const r=this.stage.getBoundingClientRect(),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?r.height:1);this.zoomBy(Math.exp(-clamp(delta,-250,250)*(e.ctrlKey?.008:.002)),e.clientX-r.left,e.clientY-r.top);}
    pointerDown(e){
      if(e.button!==0)return;e.preventDefault();this.hideTooltip();this.stage.focus({preventScroll:true});this.stage.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      const work=e.target.closest('[data-gallery-work]');this.down={x:e.clientX,y:e.clientY,camera:{...this.camera},id:work?.dataset.galleryWork||null,moved:false,multiple:this.pointers.size>1};
      if(this.pointers.size===2)this.startPinch();this.stage.classList.add('is-dragging');
    }
    startPinch(){const [a,b]=[...this.pointers.values()],r=this.stage.getBoundingClientRect(),mid={x:(a.x+b.x)/2-r.left,y:(a.y+b.y)/2-r.top};this.pinch={distance:Math.hypot(a.x-b.x,a.y-b.y)||1,scale:this.camera.scale,worldX:(mid.x-this.camera.x)/this.camera.scale,worldY:(mid.y-this.camera.y)/this.camera.scale};if(this.down)this.down.multiple=true;}
    pointerMove(e){
      if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(this.pointers.size>=2&&this.pinch){const [a,b]=[...this.pointers.values()],r=this.stage.getBoundingClientRect(),scale=clamp(this.pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/this.pinch.distance,this.minScale,this.maxScale);this.camera={scale,x:(a.x+b.x)/2-r.left-this.pinch.worldX*scale,y:(a.y+b.y)/2-r.top-this.pinch.worldY*scale};}
      else if(this.down){const dx=e.clientX-this.down.x,dy=e.clientY-this.down.y;if(Math.hypot(dx,dy)>4)this.down.moved=true;if(this.down.moved){this.camera.x=this.down.camera.x+dx;this.camera.y=this.down.camera.y+dy;}}
      this.fitted=false;this.paint();
    }
    pointerUp(e,cancelled=false){
      if(!this.pointers.has(e.pointerId))return;const down=this.down;this.pointers.delete(e.pointerId);if(this.stage.hasPointerCapture(e.pointerId))this.stage.releasePointerCapture(e.pointerId);this.suppressClickUntil=Date.now()+350;
      if(this.pointers.size){const p=[...this.pointers.values()][0];this.down={x:p.x,y:p.y,camera:{...this.camera},moved:true,multiple:true};this.pinch=null;if(this.pointers.size>=2)this.startPinch();return;}
      this.stage.classList.remove('is-dragging');this.down=null;this.pinch=null;
      if(!cancelled&&down&&!down.moved&&!down.multiple){if(down.id)this.onOpen(down.id);else if(!this.chrome)this.showChrome(true);}
    }
    showChrome(show){this.chrome=show;this.root.classList.toggle('chrome-hidden',!show);for(const node of this.root.querySelectorAll('.gallery-chrome'))node.inert=!show;this.hideTooltip();}
    keyDown(e){
      if(!this.active||$('detail-dialog').open||$('coverage-dialog').open||e.ctrlKey||e.metaKey||e.altKey)return;
      if(e.key==='Escape'){e.preventDefault();this.onExit();return;}
      const stageFocused=e.target===this.stage;if(!stageFocused)return;
      if(e.key==='Tab'){if(e.shiftKey){if(!this.chrome)this.showChrome(true);return;}e.preventDefault();this.showChrome(!this.chrome);return;}
      if(e.key==='Enter'){e.preventDefault();const first=(this.nodes||[]).find(({button})=>button.tabIndex===0);first?.button.focus();return;}
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const d=e.shiftKey?160:65;this.camera.x+=e.key==='ArrowLeft'?d:e.key==='ArrowRight'?-d:0;this.camera.y+=e.key==='ArrowUp'?d:e.key==='ArrowDown'?-d:0;this.fitted=false;this.paint();return;}
      if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')this.fit();else this.zoomBy(e.key==='-'?1/1.3:1.3);}
    }
    ensureVisible(item){const r=this.stage.getBoundingClientRect(),c=this.camera,x=(item.x+item.width/2)*c.scale+c.x,y=(item.y+item.height/2)*c.scale+c.y;if(x<45||x>r.width-45||y<130||y>r.height-100){c.x=r.width/2-(item.x+item.width/2)*c.scale;c.y=r.height/2-(item.y+item.height/2)*c.scale;this.fitted=false;this.paint();}}
    estimateLabel(work){const e=work.scale_estimate;return e?Math.round(e.height_cm)+' × '+Math.round(e.width_cm)+' cm (h × w)':'';}
    showTooltip(item,x,y){$('gallery-tooltip').textContent=title(item.work)+' · '+(item.work.date_display||item.work.year_start||'Date unknown')+(item.estimated?' · Estimated '+this.estimateLabel(item.work):'');$('gallery-tooltip').hidden=false;this.positionTooltip(x,y);}
    positionTooltip(x,y){const tooltip=$('gallery-tooltip');if(tooltip.hidden)return;tooltip.style.left=clamp(x+14,12,window.innerWidth-tooltip.offsetWidth-12)+'px';tooltip.style.top=clamp(y+15,12,window.innerHeight-tooltip.offsetHeight-12)+'px';}
    hideTooltip(){$('gallery-tooltip').hidden=true;}
    resize(){if(!this.active)return;const r=this.stage.getBoundingClientRect();if(!r.width||!r.height)return;const previous=this.viewport;this.viewport={width:r.width,height:r.height};if(this.fitted&&this.items.length)this.relayout(true);else if(previous){this.camera.x+=(r.width-previous.width)/2;this.camera.y+=(r.height-previous.height)/2;this.paint();}}
  }
  window.KellyGallery=KellyGallery;
})();
