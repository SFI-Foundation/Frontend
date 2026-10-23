---
layout: sfi
title: SFI Part Detection
description: Search and classify SFI motorsports safety specifications using machine learning.
permalink: /sfi-specs/
---

<header class="sfi-page-header">
  <div class="sfi-page-header-content">
    <h1>SFI <span class="gold">Part Detection</span></h1>
    <p>Identify racing safety specifications using machine learning, or search more than 100 SFI specs across drag racing, auto racing, boat racing and more.</p>
  </div>
</header>

<div class="sfi__container">

<div id="publicView">

  <div class="sfi__row sfi__hidden" id="backToAdminBar">
    <button type="button" class="sfi__btn primary" id="backToAdminBtn">&larr; Back to admin view</button>
  </div>

  <section class="sfi__section">
    <div class="sfi__stats" id="statsBar">
      <div class="sfi__stat"><div class="sfi__stat-value" id="statSpecs">&mdash;</div><div class="sfi__stat-label">Total specs</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value" id="statCats">&mdash;</div><div class="sfi__stat-label">Categories</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value" id="statSubs">&mdash;</div><div class="sfi__stat-label">Subcategories</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value" id="statModel">&mdash;</div><div class="sfi__stat-label">ML accuracy</div></div>
    </div>
  </section>

  <section class="sfi__section" id="safety-showcase">
    <h2 class="sfi__title">Interactive safety showcase</h2>
    <p class="sfi__lead">Hover the highlighted zones on the car to see the SFI specs that protect drivers. Click a zone to pin its details.</p>

    <div class="sfi__showcase">
      <div class="sfi__showcase-stage">
        <canvas id="safetyCanvas" width="850" height="320"></canvas>
        <div class="sfi__showcase-hint">Hover zones &middot; click to pin</div>
      </div>
      <div class="sfi__showcase-panel" id="showcasePanel">
        <div class="sfi__showcase-placeholder" id="showcaseEmpty">Hover a zone on the car to explore SFI specs.</div>
        <div class="sfi__hidden" id="showcaseContent">
          <div class="sfi__showcase-category" id="spCat"></div>
          <h3 class="sfi__showcase-name" id="spTitle"></h3>
          <p class="sfi__showcase-desc" id="spDesc"></p>
          <div class="sfi__subtitle">SFI specifications</div>
          <div id="spSpecs"></div>
          <a href="#search" class="sfi__link">Search the full database &rarr;</a>
        </div>
      </div>
    </div>

    <div class="sfi__showcase-pills" id="showcasePills"></div>
  </section>

<script src="{{ '/assets/js/sfi/api-base.js' | relative_url }}"></script>
<script>
(function(){
  var PARTS=[
    {id:'helmet',label:'Helmet',icon:'🪖',color:'#F0A500',pulse:0,
     shape:'ellipse',cx:552,cy:112,rx:23,ry:20,
     category:'Personal Protective Gear',
     desc:'SFI-certified helmets protect drivers from head impacts. Flame-resistant models add critical seconds to escape a fire.',
     specs:[{num:'24.1',name:'Youth Full Face Helmets',pdf:'specs/Spec_24.1.pdf'},{num:'31.1',name:'Flame Resistant Motorsports Helmets',pdf:'specs/Spec_31.1_032713.pdf'},{num:'41.1',name:'Motorsports Helmet',pdf:'specs/Spec_41.1_032713.pdf'}]},
    {id:'rollcage',label:'Roll Cage',icon:'🔩',color:'#f85149',pulse:1.6,
     shape:'rect',x:390,y:104,w:28,h:86,
     category:'Chassis & Structure',
     desc:'The roll cage\'s C-pillar is the backbone of driver protection during rollovers and side impacts. SFI specs cover padding and net requirements.',
     specs:[{num:'45.1',name:'Roll Bar Padding',pdf:'specs/Spec_45.1_081105.pdf'},{num:'37.1',name:'Roll Cage Nets',pdf:'specs/Spec_37.1_101106.pdf'},{num:'10.1G',name:'Funny Car Roll Cage',pdf:null}]},
    {id:'driver',label:'Suit & Harness',icon:'🧥',color:'#7c3aed',pulse:3.2,
     shape:'rect',x:468,y:142,w:108,h:56,
     category:'Personal Protective Gear & Restraints',
     desc:'Multi-layer fire-resistant suits give drivers seconds to escape. Racing harnesses distribute crash forces and prevent ejection.',
     specs:[{num:'3.2A',name:'Driver Suits',pdf:'specs/Spec_3.2A_062620.pdf'},{num:'3.4',name:'Advanced Driver Suits',pdf:'specs/Spec_3.4_101819.pdf'},{num:'16.1',name:'Driver Restraint Assemblies',pdf:'specs/Spec_16.1_022614.pdf'},{num:'16.6',name:'Advanced Motorsport Driver Restraint Assemblies',pdf:'specs/Spec_16.6_042018.pdf'}]},
    {id:'fuelcell',label:'Fuel Cell',icon:'⛽',color:'#3fb950',pulse:4.8,
     shape:'rect',x:104,y:180,w:94,h:56,
     category:'Fuel Related',
     desc:'Crash-resistant fuel cells prevent fuel spillage and fire after impact. Required in nearly all sanctioned racing classes.',
     specs:[{num:'28.1',name:'Polymer (Foam-Filled) Fuel Cells',pdf:'specs/Spec_28.1_082517.pdf'},{num:'28.2',name:'Crash Resistant Fuel Cells',pdf:'specs/Spec_28.2_071400.pdf'},{num:'32.1',name:'Stock Car Fuel Cell Bladder',pdf:'specs/Spec_32.1.pdf'}]}
  ];
  var PDF_BASE='https://www.sfifoundation.com/wp-content/pdfs/';

  var canvas=document.getElementById('safetyCanvas');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var activeId=null,hoveredId=null,phase=0;

  function getZone(mx,my){
    var r=canvas.getBoundingClientRect(),sx=canvas.width/r.width,sy=canvas.height/r.height;
    var cx=(mx-r.left)*sx,cy=(my-r.top)*sy;
    for(var i=0;i<PARTS.length;i++){
      var p=PARTS[i];
      if(p.shape==='ellipse'){var dx=(cx-p.cx)/p.rx,dy=(cy-p.cy)/p.ry;if(dx*dx+dy*dy<=1)return p;}
      else if(cx>=p.x&&cx<=p.x+p.w&&cy>=p.y&&cy<=p.y+p.h)return p;
    }
    return null;
  }

  function showPanel(part){
    document.getElementById('showcasePanel').style.setProperty('--accent',part.color);
    document.getElementById('showcaseEmpty').classList.add('sfi__hidden');
    document.getElementById('showcaseContent').classList.remove('sfi__hidden');
    document.getElementById('spCat').textContent=part.category;
    document.getElementById('spTitle').textContent=part.label;
    document.getElementById('spDesc').textContent=part.desc;
    document.getElementById('spSpecs').innerHTML=part.specs.map(function(s){
      var pdfLink=s.pdf?'<a class="sfi__link" href="'+PDF_BASE+s.pdf+'" target="_blank" rel="noopener">PDF</a>':'';
      return '<div class="sfi__spec-line"><span class="num">SFI '+s.num+'</span><span class="name">'+s.name+'</span>'+pdfLink+'</div>';
    }).join('');
    document.querySelectorAll('.sfi__showcase-pills .sfi__chip').forEach(function(el){
      el.classList.toggle('active',el.dataset.id===part.id);
    });
  }
  function hidePanel(){
    document.getElementById('showcaseEmpty').classList.remove('sfi__hidden');
    document.getElementById('showcaseContent').classList.add('sfi__hidden');
    document.querySelectorAll('.sfi__showcase-pills .sfi__chip').forEach(function(el){el.classList.remove('active');});
  }

  function draw(){
    var W=850,H=320;
    ctx.fillStyle='#0e1117';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,0.02)';ctx.lineWidth=1;
    for(var x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    var gg=ctx.createLinearGradient(0,295,0,320);gg.addColorStop(0,'rgba(255,255,255,0.03)');gg.addColorStop(1,'transparent');
    ctx.fillStyle=gg;ctx.fillRect(80,295,720,25);

    // Car body
    ctx.save();ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=20;
    ctx.beginPath();
    ctx.moveTo(100,248);ctx.lineTo(100,195);ctx.lineTo(148,168);ctx.lineTo(240,156);
    ctx.lineTo(315,140);ctx.lineTo(388,116);ctx.lineTo(396,108);ctx.lineTo(540,104);
    ctx.lineTo(578,104);ctx.lineTo(628,114);ctx.lineTo(668,128);ctx.lineTo(720,148);
    ctx.lineTo(782,158);ctx.bezierCurveTo(822,161,836,180,834,215);
    ctx.lineTo(834,250);ctx.lineTo(800,256);ctx.lineTo(758,258);
    ctx.arc(700,258,55,0,Math.PI,true);
    ctx.lineTo(275,258);ctx.arc(220,258,55,0,Math.PI,true);
    ctx.lineTo(100,258);ctx.closePath();
    ctx.fillStyle='#1e2535';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();

    // Side window
    ctx.beginPath();ctx.moveTo(396,108);ctx.lineTo(540,104);ctx.lineTo(578,104);
    ctx.lineTo(625,116);ctx.lineTo(625,157);ctx.lineTo(580,160);ctx.lineTo(396,153);ctx.closePath();
    ctx.fillStyle='rgba(58,123,213,0.12)';ctx.fill();ctx.strokeStyle='rgba(58,123,213,0.25)';ctx.lineWidth=1;ctx.stroke();

    // Windshield
    ctx.beginPath();ctx.moveTo(625,116);ctx.lineTo(668,128);ctx.lineTo(710,150);
    ctx.lineTo(668,160);ctx.lineTo(625,157);ctx.closePath();
    ctx.fillStyle='rgba(58,123,213,0.15)';ctx.fill();ctx.strokeStyle='rgba(58,123,213,0.3)';ctx.lineWidth=1;ctx.stroke();

    // Rear window
    ctx.beginPath();ctx.moveTo(315,140);ctx.lineTo(388,116);ctx.lineTo(396,108);
    ctx.lineTo(396,153);ctx.lineTo(325,160);ctx.closePath();
    ctx.fillStyle='rgba(58,123,213,0.08)';ctx.fill();

    // Headlight
    ctx.beginPath();ctx.ellipse(808,196,8,16,-0.25,0,Math.PI*2);
    ctx.fillStyle='rgba(232,160,32,0.15)';ctx.fill();ctx.strokeStyle='rgba(232,160,32,0.5)';ctx.lineWidth=1;ctx.stroke();

    // Door seam
    ctx.beginPath();ctx.moveTo(500,160);ctx.lineTo(500,250);
    ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;ctx.stroke();

    // Wheels
    [{cx:220,cy:265,r:44},{cx:700,cy:265,r:44}].forEach(function(w){
      ctx.beginPath();ctx.arc(w.cx,w.cy,w.r,0,Math.PI*2);
      ctx.fillStyle='#111827';ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.arc(w.cx,w.cy,w.r*0.58,0,Math.PI*2);
      ctx.fillStyle='#1e2535';ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1.5;ctx.stroke();
      for(var s=0;s<5;s++){
        var a=(s/5)*Math.PI*2;
        ctx.beginPath();ctx.moveTo(w.cx+Math.cos(a)*w.r*0.1,w.cy+Math.sin(a)*w.r*0.1);
        ctx.lineTo(w.cx+Math.cos(a)*w.r*0.53,w.cy+Math.sin(a)*w.r*0.53);
        ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=2;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(w.cx,w.cy,4,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fill();
    });

    // Zones
    phase+=0.025;
    PARTS.forEach(function(p){
      var isA=activeId===p.id,isH=hoveredId===p.id;
      var pulse=0.5+0.5*Math.sin(phase*1.8+p.pulse);
      ctx.save();
      if(isA||isH){ctx.shadowColor=p.color;ctx.shadowBlur=isA?16:10;}
      ctx.globalAlpha=isA?0.45:isH?0.32:0.08+pulse*0.07;
      ctx.fillStyle=p.color;ctx.beginPath();
      if(p.shape==='ellipse')ctx.ellipse(p.cx,p.cy,p.rx,p.ry,0,0,Math.PI*2);
      else{if(ctx.roundRect)ctx.roundRect(p.x,p.y,p.w,p.h,5);else ctx.rect(p.x,p.y,p.w,p.h);}
      ctx.fill();
      ctx.globalAlpha=isA?1:isH?0.8:0.3+pulse*0.3;
      ctx.strokeStyle=p.color;ctx.lineWidth=isA?2.5:isH?2:1.5;
      ctx.beginPath();
      if(p.shape==='ellipse')ctx.ellipse(p.cx,p.cy,p.rx,p.ry,0,0,Math.PI*2);
      else{if(ctx.roundRect)ctx.roundRect(p.x,p.y,p.w,p.h,5);else ctx.rect(p.x,p.y,p.w,p.h);}
      ctx.stroke();
      ctx.globalAlpha=1;ctx.restore();

      var lx=p.shape==='ellipse'?p.cx:p.x+p.w/2,ly=p.shape==='ellipse'?p.cy:p.y+p.h/2;
      ctx.save();ctx.globalAlpha=isA||isH?1:0.4+pulse*0.3;
      ctx.beginPath();ctx.arc(lx,ly,isA||isH?5:3,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();
      ctx.restore();

      if(isH||isA){
        var ty=(p.shape==='ellipse'?p.cy-p.ry:p.y)-10;
        ctx.save();ctx.font='bold 11px Inter,sans-serif';
        var tw=ctx.measureText(p.label).width;
        ctx.fillStyle='rgba(0,0,0,0.88)';ctx.beginPath();
        if(ctx.roundRect)ctx.roundRect(lx-tw/2-5,ty-12,tw+10,16,7);else ctx.rect(lx-tw/2-5,ty-12,tw+10,16);
        ctx.fill();ctx.fillStyle=p.color;ctx.textAlign='center';ctx.fillText(p.label,lx,ty);
        ctx.restore();
      }
    });
  }

  function loop(){draw();requestAnimationFrame(loop);}

  canvas.addEventListener('mousemove',function(e){
    var z=getZone(e.clientX,e.clientY),nid=z?z.id:null;
    if(nid!==hoveredId){hoveredId=nid;canvas.style.cursor=nid?'pointer':'crosshair';
      if(nid&&nid!==activeId)showPanel(PARTS.find(function(p){return p.id===nid;}));
      else if(!nid&&!activeId)hidePanel();}
  });
  canvas.addEventListener('mouseleave',function(){hoveredId=null;canvas.style.cursor='crosshair';if(!activeId)hidePanel();});
  canvas.addEventListener('click',function(e){
    var z=getZone(e.clientX,e.clientY);
    if(z){activeId=activeId===z.id?null:z.id;if(activeId)showPanel(z);else hidePanel();}
    else{activeId=null;hidePanel();}
  });

  var pillsEl=document.getElementById('showcasePills');
  if(pillsEl){PARTS.forEach(function(p){
    var btn=document.createElement('button');
    btn.type='button';btn.className='sfi__chip';btn.dataset.id=p.id;btn.textContent=p.label;
    btn.style.setProperty('--accent',p.color);
    btn.addEventListener('click',function(){activeId=activeId===p.id?null:p.id;if(activeId)showPanel(p);else hidePanel();});
    pillsEl.appendChild(btn);
  });}

  loop();
})();
</script>

  <section class="sfi__section" id="classify">
    <h2 class="sfi__title">ML part classifier</h2>
    <p class="sfi__lead">Describe a racing part and the model returns matching SFI specifications with confidence scores.</p>
    <div class="sfi__form-row">
      <input type="text" class="sfi__field" id="classifyInput" aria-label="Part description"
             placeholder="e.g. fire resistant racing helmet, turbocharger, fuel cell, roll cage">
      <button type="button" class="sfi__btn primary" id="classifyBtn">Classify</button>
    </div>
    <div class="sfi__count" id="classifyCount"></div>
    <div id="classifyResults"></div>
  </section>

  <section class="sfi__section" id="search">
    <h2 class="sfi__title">Specification database</h2>
    <input type="search" class="sfi__field" id="sfiSearch" aria-label="Search specifications"
           placeholder="Search specs (e.g. helmet, 1.1, drag racing, clutch)">
    <div id="sfiFuzzyHint" class="sfi__hint"></div>
    <div class="sfi__filters" id="sfiFilters">
      <button type="button" class="sfi__chip active" data-category="all">All</button>
    </div>
    <div class="sfi__count" id="sfiCount"></div>

    <div class="sfi__table-scroll">
      <table class="sfi__table">
        <thead>
          <tr><th>Spec #</th><th>Product</th><th>Category</th><th>Date</th><th>PDF</th></tr>
        </thead>
        <tbody id="sfiBody"></tbody>
      </table>
    </div>
    <div class="sfi__empty sfi__hidden" id="sfiNoResults">No specs match your search.</div>
  </section>

  <section class="sfi__section" id="categories">
    <h2 class="sfi__title">Browse by category</h2>
    <div class="sfi__grid" id="catGrid"></div>
  </section>

  <section class="sfi__section" id="about">
    <h2 class="sfi__title">About SFI Foundation</h2>
    <div class="sfi__card">
      <p>The <strong>SFI Foundation</strong> (originally the SEMA Foundation, Inc.) was established in 1978 as a nonprofit organization to develop and administer quality assurance programs for the motorsports aftermarket. SFI specifications cover safety equipment used across drag racing, auto racing, boat racing, tractor pulling and more.</p>
      <p>Each specification number corresponds to a type of racing equipment, from driver suits and helmets to roll cages, fuel cells, supercharger restraints and turbochargers. The classifier can identify the right specification from a plain-text description of a part.</p>
      <p>Learn more at <a class="sfi__link" href="{{ '/about/' | relative_url }}">About SFI Foundation</a>.</p>
    </div>
  </section>

</div><!-- /publicView -->

  <section class="sfi__section sfi__hidden" id="adminView">
    <div class="sfi__row" style="justify-content:space-between;align-items:center;">
      <h2 class="sfi__title">Manage SFI specifications</h2>
      <button type="button" class="sfi__btn" id="viewPublicBtn">View as public</button>
    </div>

    <div class="sfi__filters" id="adminTabs" role="tablist" aria-label="Admin sections">
      <button type="button" class="sfi__chip active" role="tab" id="tabBtn-manage" aria-controls="panel-manage" aria-selected="true" data-tab="manage">Manage</button>
      <button type="button" class="sfi__chip" role="tab" id="tabBtn-classifier" aria-controls="panel-classifier" aria-selected="false" data-tab="classifier">Classifier</button>
      <button type="button" class="sfi__chip" role="tab" id="tabBtn-explore" aria-controls="panel-explore" aria-selected="false" data-tab="explore">Explore</button>
    </div>
    <div id="adminMsg" class="sfi__message"></div>

    <div id="panel-manage" role="tabpanel" aria-labelledby="tabBtn-manage">
      <div class="sfi__stats" id="adminStats"></div>

      <div class="sfi__form-panel">
        <h3 id="formTitle">Add new specification</h3>
        <input type="hidden" id="editId">
        <div class="sfi__form-grid">
          <input class="sfi__field" id="fProduct" placeholder="Product name *" aria-label="Product name">
          <input class="sfi__field" id="fSpecNum" placeholder="Spec number (e.g. 3.3) *" aria-label="Spec number">
          <input class="sfi__field" id="fCategory" placeholder="Category *" aria-label="Category">
          <input class="sfi__field" id="fSubcategory" placeholder="Subcategory" aria-label="Subcategory">
          <input class="sfi__field" id="fEffDate" placeholder="Effective date" aria-label="Effective date">
          <input class="sfi__field" id="fSpecPdf" placeholder="Spec PDF filename" aria-label="Spec PDF filename">
          <input class="sfi__field" id="fMfrPdf" placeholder="Manufacturer PDF" aria-label="Manufacturer PDF">
          <input class="sfi__field" id="fProdPdf" placeholder="Products PDF" aria-label="Products PDF">
        </div>
        <div class="sfi__row">
          <button type="button" class="sfi__btn primary" id="saveBtn">Save spec</button>
          <button type="button" class="sfi__btn sfi__hidden" id="cancelBtn">Cancel</button>
        </div>
      </div>

      <h3 class="sfi__subtitle">All specifications</h3>
      <input type="search" class="sfi__field" id="adminFilter" placeholder="Search specs (typos are OK)" aria-label="Search specifications">
      <div id="adminHint" class="sfi__hint"></div>
      <div class="sfi__filters" id="adminChips"></div>
      <div class="sfi__count" id="adminCount"></div>
      <div class="sfi__table-scroll">
        <table class="sfi__table" id="adminTable">
          <thead>
            <tr>
              <th>ID</th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="spec_number">Spec #</button></th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="product_name">Product</button></th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="category">Category</button></th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="effective_date">Date</button></th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="adminTableBody"></tbody>
        </table>
      </div>
    </div>

    <div id="panel-classifier" class="sfi__hidden" role="tabpanel" aria-labelledby="tabBtn-classifier">
      <div id="classifierSlot"></div>
      <h3 class="sfi__subtitle">Model status</h3>
      <div class="sfi__stats" id="modelStats"></div>
      <div class="sfi__row">
        <button type="button" class="sfi__btn primary" id="retrainBtn">Retrain model</button>
      </div>
      <p class="sfi__hint visible" style="margin-top:.5rem;">Retraining uses the specs currently in the database, so spec edits made here take effect in the classifier.</p>
    </div>

    <div id="panel-explore" class="sfi__hidden" role="tabpanel" aria-labelledby="tabBtn-explore">
      <div id="exploreSlot"></div>
    </div>
  </section>

</div>

<style>
.sfi__sort { background: none; border: 0; padding: 0; color: inherit; font: inherit; font-weight: inherit; cursor: pointer; }
.sfi__sort::after { content: ' \2195'; opacity: .4; }
th[aria-sort="ascending"] .sfi__sort::after { content: ' \25B2'; opacity: 1; }
th[aria-sort="descending"] .sfi__sort::after { content: ' \25BC'; opacity: 1; }
</style>

<script>
// ── API Configuration ────────────────────────────
const API_BASE = window.SFI_API_BASE;
const API = API_BASE + "/api/sfi";

// ═══════════════ STATS BAR ═══════════════
async function loadStats() {
  try {
    const [statsRes, modelRes] = await Promise.all([
      fetch(`${API}/stats`),
      fetch(`${API}/classifier/status`)
    ]);
    const stats = await statsRes.json();
    const model = await modelRes.json();
    document.getElementById('statSpecs').textContent = stats.total_specs || 0;
    document.getElementById('statCats').textContent = stats.total_categories || 0;
    document.getElementById('statSubs').textContent = stats.total_subcategories || 0;
    document.getElementById('statModel').textContent = model.trained
      ? (model.accuracy * 100).toFixed(0) + '%' : 'Offline';
  } catch (e) { console.log('Stats load error:', e); }
}

// ═══════════════ ML CLASSIFIER ═══════════════
document.getElementById('classifyBtn').addEventListener('click', classifyPart);
document.getElementById('classifyInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') classifyPart();
});

async function classifyPart() {
  const input = document.getElementById('classifyInput').value.trim();
  if (!input) return;
  const countEl = document.getElementById('classifyCount');
  const resultsEl = document.getElementById('classifyResults');
  countEl.innerHTML = '<span class="sfi__spinner"></span> Classifying...';
  resultsEl.innerHTML = '';
  try {
    const res = await fetch(`${API}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: input })
    });
    const data = await res.json();
    countEl.textContent = `Found ${data.count} match(es) \u2014 Predicted category: ${data.predicted_category} (${(data.category_confidence * 100).toFixed(0)}% confidence)`;
    if (!data.predictions || !data.predictions.length) {
      resultsEl.innerHTML = '<div class="sfi__empty">No matching specs found.</div>';
      return;
    }
    resultsEl.innerHTML = data.predictions.map(p => {
      const confPct = (p.confidence * 100).toFixed(1);
      const pdfs = [];
      if (p.spec_pdf) pdfs.push(`<a class="sfi__link" href="https://www.sfifoundation.com/wp-content/pdfs/${p.spec_pdf}" target="_blank">Spec PDF</a>`);
      if (p.manufacturer_pdf) pdfs.push(`<a class="sfi__link" href="https://www.sfifoundation.com/wp-content/pdfs/${p.manufacturer_pdf}" target="_blank">Manufacturers</a>`);
      return `
        <div class="sfi__result">
          <div class="sfi__result-body">
            <div class="sfi__result-title">SFI ${esc(p.spec_number)}</div>
            <div class="sfi__result-sub">${esc(p.product_name)}</div>
            <div class="sfi__result-meta">
              <span class="sfi__badge info">${esc(p.category)}</span>
              ${p.subcategory ? `<span class="sfi__badge">${esc(p.subcategory)}</span>` : ''}
              ${pdfs.join(' \u2022 ')}
            </div>
          </div>
          <div class="sfi__result-side">
            <div class="sfi__result-score">${confPct}%</div>
            <div class="sfi__meter"><div class="sfi__meter-fill" style="width:${confPct}%"></div></div>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    countEl.textContent = 'Error connecting to API \u2014 is the backend running?';
  }
}

// ═══════════════ FUZZY SEARCH ENGINE ═══════════════

// Levenshtein distance between two strings
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Score how well a query word matches a target word (0 = no match, 1 = perfect)
function wordScore(query, target) {
  if (target.includes(query)) return 1;
  if (query.length <= 1) return 0;
  // Prefix match bonus
  if (target.startsWith(query.slice(0, Math.max(2, query.length - 1)))) return 0.85;
  const dist = levenshtein(query, target);
  const maxLen = Math.max(query.length, target.length);
  const similarity = 1 - dist / maxLen;
  // Allow up to ~30% character errors
  return similarity >= 0.65 ? similarity : 0;
}

// Score how well a query matches a spec's searchable text
function fuzzyMatch(query, spec) {
  const hay = `${spec.product_name} ${spec.spec_number} ${spec.category} ${spec.subcategory || ''}`.toLowerCase();
  const hayWords = hay.split(/[\s,\-\/&()]+/).filter(Boolean);
  const qWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!qWords.length) return 1; // empty query matches all

  let totalScore = 0;
  for (const qw of qWords) {
    // Exact substring match in full haystack
    if (hay.includes(qw)) { totalScore += 1; continue; }
    // Best fuzzy word match
    let best = 0;
    for (const hw of hayWords) {
      const s = wordScore(qw, hw);
      if (s > best) best = s;
    }
    totalScore += best;
  }
  return totalScore / qWords.length;
}

// Build a vocabulary of known words from specs for "did you mean" suggestions
let knownWords = [];
function buildVocabulary() {
  const wordSet = new Set();
  specs.forEach(s => {
    `${s.product_name} ${s.category} ${s.subcategory || ''}`
      .toLowerCase()
      .split(/[\s,\-\/&()]+/)
      .filter(w => w.length > 2)
      .forEach(w => wordSet.add(w));
  });
  knownWords = [...wordSet];
}

// Find the best correction for a query word
function correctWord(word) {
  if (word.length <= 2) return null;
  let bestWord = null, bestDist = Infinity;
  for (const kw of knownWords) {
    if (kw.includes(word) || word.includes(kw)) return null; // already matches
    const d = levenshtein(word, kw);
    const threshold = word.length <= 4 ? 1 : Math.ceil(word.length * 0.35);
    if (d <= threshold && d < bestDist) {
      bestDist = d;
      bestWord = kw;
    }
  }
  return bestWord;
}

// Build a "did you mean" suggestion from the query
function getSuggestion(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  let changed = false;
  const corrected = words.map(w => {
    const fix = correctWord(w);
    if (fix && fix !== w) { changed = true; return fix; }
    return w;
  });
  return changed ? corrected.join(' ') : null;
}

// ═══════════════ SPEC SEARCH ═══════════════
let specs = [];
let activeCategory = 'all';

async function loadSpecs() {
  try {
    const res = await fetch(`${API}/specs`);
    specs = await res.json();
    buildVocabulary();
    buildFilters();
    buildCategoryGrid();
    const savedCat = localStorage.getItem('sfiCat');
    if (savedCat) {
      localStorage.removeItem('sfiCat');
      activeCategory = savedCat;
    }
    renderSearch();
  } catch (e) {
    document.getElementById('sfiNoResults').classList.remove('sfi__hidden');
    document.getElementById('sfiNoResults').textContent = 'Could not connect to API \u2014 is the backend running?';
  }
}

function buildFilters() {
  const cats = [...new Set(specs.map(s => s.category))].sort();
  const row = document.getElementById('sfiFilters');
  row.innerHTML = '<button type="button" class="sfi__chip active" data-category="all">All</button>';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'sfi__chip';
    btn.dataset.category = cat;
    btn.textContent = cat;
    row.appendChild(btn);
  });
}

function buildCategoryGrid() {
  const cats = {};
  specs.forEach(s => { cats[s.category] = (cats[s.category] || 0) + 1; });
  const grid = document.getElementById('catGrid');
  grid.innerHTML = Object.entries(cats).sort((a,b) => b[1] - a[1]).map(([cat, count]) => `
    <div class="sfi__category" onclick="filterByCategory('${cat.replace(/'/g, "\\'")}')">
      <div class="sfi__category-name">${cat}</div>
      <div class="sfi__category-count">${count} spec${count !== 1 ? 's' : ''}</div>
    </div>
  `).join('');
}

function filterByCategory(cat) {
  if (!document.getElementById('adminView').classList.contains('sfi__hidden')) {
    adminCategory = cat;
    setAdminTab('manage');
    renderAdminTable();
    document.getElementById('adminTable').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  activeCategory = cat;
  document.querySelectorAll('#sfiFilters .sfi__chip').forEach(b => {
    b.classList.toggle('active', b.dataset.category === cat);
  });
  renderSearch();
  document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

function renderSearch() {
  const q = document.getElementById('sfiSearch').value.trim();
  const tbody = document.getElementById('sfiBody');
  const noRes = document.getElementById('sfiNoResults');
  const countEl = document.getElementById('sfiCount');
  const hintEl = document.getElementById('sfiFuzzyHint');

  // Category filter first
  let pool = activeCategory === 'all' ? specs : specs.filter(s => s.category === activeCategory);

  if (!q) {
    // No query — show all in category
    hintEl.className = 'sfi__hint';
    countEl.textContent = `Showing ${pool.length} of ${specs.length} specs`;
    if (!pool.length) { tbody.innerHTML = ''; noRes.classList.remove('sfi__hidden'); return; }
    noRes.classList.add('sfi__hidden');
    tbody.innerHTML = pool.map(s => specRow(s)).join('');
    return;
  }

  // Score and sort by fuzzy relevance
  const scored = pool.map(s => ({ spec: s, score: fuzzyMatch(q, s) }))
    .filter(x => x.score >= 0.55)
    .sort((a, b) => b.score - a.score);

  // "Did you mean?" suggestion
  const suggestion = getSuggestion(q);
  if (suggestion && scored.length < 5) {
    hintEl.innerHTML = `Did you mean: <strong onclick="applySuggestion('${suggestion.replace(/'/g, "\\'")}')">${suggestion}</strong>?`;
    hintEl.className = 'sfi__hint visible';
  } else {
    hintEl.className = 'sfi__hint';
  }

  countEl.textContent = `Showing ${scored.length} of ${specs.length} specs`;
  if (!scored.length) { tbody.innerHTML = ''; noRes.classList.remove('sfi__hidden'); return; }
  noRes.classList.add('sfi__hidden');
  tbody.innerHTML = scored.map(x => specRow(x.spec)).join('');
}

function applySuggestion(text) {
  document.getElementById('sfiSearch').value = text;
  renderSearch();
}

function specRow(s) {
  const pdfs = [];
  if (s.spec_pdf) pdfs.push(`<a class="sfi__link" href="https://www.sfifoundation.com/wp-content/pdfs/${s.spec_pdf}" target="_blank">Spec</a>`);
  if (s.manufacturer_pdf) pdfs.push(`<a class="sfi__link" href="https://www.sfifoundation.com/wp-content/pdfs/${s.manufacturer_pdf}" target="_blank">Mfrs</a>`);
  return `<tr>
    <td class="num">SFI ${s.spec_number}</td>
    <td>${s.product_name}</td>
    <td><span class="sfi__badge info">${s.category}</span></td>
    <td>${s.effective_date || '\u2014'}</td>
    <td>${pdfs.join(' \u2022 ') || '\u2014'}</td>
  </tr>`;
}

document.getElementById('sfiSearch').addEventListener('input', renderSearch);
document.getElementById('sfiFilters').addEventListener('click', e => {
  if (!e.target.classList.contains('sfi__chip')) return;
  document.querySelectorAll('#sfiFilters .sfi__chip').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  activeCategory = e.target.dataset.category;
  renderSearch();
});

// ═══════════════ ADMIN PANEL ═══════════════
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

let adminSpecs = [];
let isAdminUser = false;
let adminCategory = 'all';
let adminSort = { key: null, dir: 1 };

// Public sections that the admin view shows inside its tabs. They are moved
// (not cloned) so their element IDs and event handlers keep working.
const SECTION_SLOTS = { classify: 'classifierSlot', 'safety-showcase': 'exploreSlot', categories: 'exploreSlot', about: 'exploreSlot' };
const sectionMarkers = {};

function moveSections(toAdmin) {
  Object.keys(SECTION_SLOTS).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (toAdmin) {
      if (!sectionMarkers[id]) {
        sectionMarkers[id] = document.createComment(id);
        el.parentNode.insertBefore(sectionMarkers[id], el);
      }
      document.getElementById(SECTION_SLOTS[id]).appendChild(el);
    } else if (sectionMarkers[id] && sectionMarkers[id].parentNode) {
      sectionMarkers[id].parentNode.insertBefore(el, sectionMarkers[id].nextSibling);
    }
  });
}

function setAdminTab(name) {
  if (!['manage', 'classifier', 'explore'].includes(name)) name = 'manage';
  ['manage', 'classifier', 'explore'].forEach(t => {
    document.getElementById(`panel-${t}`).classList.toggle('sfi__hidden', t !== name);
    const btn = document.getElementById(`tabBtn-${t}`);
    btn.classList.toggle('active', t === name);
    btn.setAttribute('aria-selected', String(t === name));
  });
  try { sessionStorage.setItem('sfiAdminTab', name); } catch (e) {}
}

function setView(view) {
  const admin = view === 'admin';
  moveSections(admin);
  document.getElementById('adminView').classList.toggle('sfi__hidden', !admin);
  document.getElementById('publicView').classList.toggle('sfi__hidden', admin);
  document.getElementById('backToAdminBar').classList.toggle('sfi__hidden', admin || !isAdminUser);
  if (admin) {
    let tab = 'manage';
    try { tab = sessionStorage.getItem('sfiAdminTab') || 'manage'; } catch (e) {}
    setAdminTab(tab);
  }
  try { sessionStorage.setItem('sfiSpecsView', view); } catch (e) {}
}

document.getElementById('viewPublicBtn').addEventListener('click', () => setView('public'));
document.getElementById('backToAdminBtn').addEventListener('click', () => setView('admin'));
document.getElementById('adminTabs').addEventListener('click', e => {
  const btn = e.target.closest('[data-tab]');
  if (btn) setAdminTab(btn.dataset.tab);
});
// "Search the full database" link in the showcase points at the public search
document.getElementById('exploreSlot').addEventListener('click', e => {
  const link = e.target.closest('a[href="#search"]');
  if (link) { e.preventDefault(); setAdminTab('manage'); }
});

function showMsg(text, type) {
  const el = document.getElementById('adminMsg');
  el.textContent = text;
  el.className = `sfi__message ${type}`;
  setTimeout(() => { el.className = 'sfi__message'; }, 4000);
}

async function loadAdminStats() {
  try {
    const [statsRes, modelRes] = await Promise.all([fetch(`${API}/stats`), fetch(`${API}/classifier/status`)]);
    const d = await statsRes.json();
    const model = await modelRes.json();
    const acc = model.trained ? (model.accuracy * 100).toFixed(0) + '%' : 'Offline';
    document.getElementById('adminStats').innerHTML = `
      <div class="sfi__stat"><div class="sfi__stat-value">${d.total_specs}</div><div class="sfi__stat-label">Total specs</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value">${d.total_categories}</div><div class="sfi__stat-label">Categories</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value">${d.total_subcategories}</div><div class="sfi__stat-label">Subcategories</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value">${acc}</div><div class="sfi__stat-label">ML accuracy</div></div>`;
    renderModelStats(model);
  } catch (e) {}
}

function renderModelStats(model) {
  const tile = (v, l) => `<div class="sfi__stat"><div class="sfi__stat-value">${esc(v)}</div><div class="sfi__stat-label">${l}</div></div>`;
  document.getElementById('modelStats').innerHTML = model.trained
    ? tile((model.accuracy * 100).toFixed(1) + '%', 'Training accuracy') + tile(model.training_samples, 'Training samples') +
      tile(model.spec_classes, 'Spec classes') + tile(model.category_classes, 'Category classes')
    : tile('Offline', 'Model not trained');
}

document.getElementById('retrainBtn').addEventListener('click', async () => {
  if (!confirm('Retrain the classifier on the current specs? This can take a few seconds.')) return;
  const btn = document.getElementById('retrainBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="sfi__spinner"></span> Retraining...';
  try {
    const res = await fetch(`${API}/classifier/retrain`, { method: 'POST', credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      showMsg('Model retrained', 'success');
      renderModelStats(data);
      loadAdminStats();
      loadStats();
    } else {
      showMsg(data.error || data.message || `Retrain failed (${res.status})`, 'error');
    }
  } catch (e) { showMsg('Error connecting to API', 'error'); }
  btn.disabled = false;
  btn.textContent = 'Retrain model';
});

function adminPdfLinks(s) {
  const pdfs = [];
  if (s.spec_pdf) pdfs.push(`<a class="sfi__link" href="https://www.sfifoundation.com/wp-content/pdfs/${encodeURI(s.spec_pdf)}" target="_blank" rel="noopener">Spec</a>`);
  if (s.manufacturer_pdf) pdfs.push(`<a class="sfi__link" href="https://www.sfifoundation.com/wp-content/pdfs/${encodeURI(s.manufacturer_pdf)}" target="_blank" rel="noopener">Mfrs</a>`);
  return pdfs.join(' \u2022 ') || '\u2014';
}

function adminSortValue(s, key) {
  if (key === 'effective_date') return Date.parse(s.effective_date) || 0;
  return String(s[key] || '');
}

function renderAdminChips() {
  const cats = [...new Set(adminSpecs.map(s => s.category))].sort();
  if (adminCategory !== 'all' && !cats.includes(adminCategory)) adminCategory = 'all';
  document.getElementById('adminChips').innerHTML = ['all', ...cats].map(c =>
    `<button type="button" class="sfi__chip${c === adminCategory ? ' active' : ''}" data-category="${esc(c)}">${c === 'all' ? 'All' : esc(c)}</button>`).join('');
}

function renderAdminTable() {
  const q = document.getElementById('adminFilter').value.trim();
  const hintEl = document.getElementById('adminHint');
  let rows = adminCategory === 'all' ? adminSpecs : adminSpecs.filter(s => s.category === adminCategory);

  let relevance = false;
  if (q) {
    rows = rows.map(s => ({ s, score: fuzzyMatch(q, s) })).filter(x => x.score >= 0.55)
      .sort((a, b) => b.score - a.score).map(x => x.s);
    relevance = true;
    const suggestion = getSuggestion(q);
    if (suggestion && rows.length < 5) {
      hintEl.innerHTML = `Did you mean: <strong style="cursor:pointer" data-suggest="${esc(suggestion)}">${esc(suggestion)}</strong>?`;
      hintEl.className = 'sfi__hint visible';
    } else { hintEl.className = 'sfi__hint'; }
  } else { hintEl.className = 'sfi__hint'; }

  if (adminSort.key) {
    const k = adminSort.key;
    rows = [...rows].sort((a, b) => {
      const x = adminSortValue(a, k), y = adminSortValue(b, k);
      const c = typeof x === 'number' ? x - y : x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' });
      return c * adminSort.dir;
    });
  }
  document.querySelectorAll('#adminTable th[aria-sort]').forEach(th => {
    const key = th.querySelector('[data-sort]').dataset.sort;
    th.setAttribute('aria-sort', adminSort.key === key ? (adminSort.dir === 1 ? 'ascending' : 'descending') : 'none');
  });

  document.getElementById('adminChips').querySelectorAll('.sfi__chip').forEach(b =>
    b.classList.toggle('active', b.dataset.category === adminCategory));
  document.getElementById('adminCount').textContent = `Showing ${rows.length} of ${adminSpecs.length} specs`;
  document.getElementById('adminTableBody').innerHTML = rows.length ? rows.map(s => `
      <tr>
        <td>${s.id}</td>
        <td class="num">SFI ${esc(s.spec_number)}</td>
        <td>${esc(s.product_name)}</td>
        <td><span class="sfi__badge info">${esc(s.category)}</span></td>
        <td>${esc(s.effective_date) || '\u2014'}</td>
        <td>${adminPdfLinks(s)}</td>
        <td>
          <button type="button" class="sfi__btn small" onclick="editSpec(${s.id})">Edit</button>
          <button type="button" class="sfi__btn small danger" onclick="deleteSpec(${s.id})">Delete</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="7">No specs match.</td></tr>';
}

async function loadAdminTable() {
  try {
    const res = await fetch(`${API}/specs`);
    adminSpecs = await res.json();
    renderAdminChips();
    renderAdminTable();
  } catch (e) {}
}

document.getElementById('adminFilter').addEventListener('input', renderAdminTable);
document.getElementById('adminChips').addEventListener('click', e => {
  const chip = e.target.closest('.sfi__chip');
  if (!chip) return;
  adminCategory = chip.dataset.category;
  renderAdminTable();
});
document.getElementById('adminHint').addEventListener('click', e => {
  const sug = e.target.closest('[data-suggest]');
  if (!sug) return;
  document.getElementById('adminFilter').value = sug.dataset.suggest;
  renderAdminTable();
});
document.querySelector('#adminTable thead').addEventListener('click', e => {
  const btn = e.target.closest('[data-sort]');
  if (!btn) return;
  const key = btn.dataset.sort;
  adminSort = adminSort.key === key ? { key, dir: -adminSort.dir } : { key, dir: 1 };
  renderAdminTable();
});

function clearForm() {
  ['editId','fProduct','fSpecNum','fCategory','fSubcategory','fEffDate','fSpecPdf','fMfrPdf','fProdPdf']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('formTitle').textContent = 'Add New Specification';
  document.getElementById('cancelBtn').classList.add('sfi__hidden');
}

async function editSpec(id) {
  try {
    const res = await fetch(`${API}/specs/${id}`);
    const s = await res.json();
    document.getElementById('editId').value = s.id;
    document.getElementById('fProduct').value = s.product_name;
    document.getElementById('fSpecNum').value = s.spec_number;
    document.getElementById('fCategory').value = s.category;
    document.getElementById('fSubcategory').value = s.subcategory || '';
    document.getElementById('fEffDate').value = s.effective_date || '';
    document.getElementById('fSpecPdf').value = s.spec_pdf || '';
    document.getElementById('fMfrPdf').value = s.manufacturer_pdf || '';
    document.getElementById('fProdPdf').value = s.products_pdf || '';
    document.getElementById('formTitle').textContent = `Editing Spec #${s.id}`;
    document.getElementById('cancelBtn').classList.remove('sfi__hidden');
  } catch (e) { showMsg('Failed to load spec', 'error'); }
}

async function deleteSpec(id) {
  const spec = adminSpecs.find(x => x.id === id);
  const label = spec ? `SFI ${spec.spec_number} \u2013 ${spec.product_name}` : 'this spec';
  if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
  try {
    const res = await fetch(`${API}/specs/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { showMsg('Spec deleted', 'success'); loadAdminTable(); loadAdminStats(); loadSpecs(); }
    else { showMsg('Delete failed', 'error'); }
  } catch (e) { showMsg('Error connecting to API', 'error'); }
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  const body = {
    product_name: document.getElementById('fProduct').value.trim(),
    spec_number: document.getElementById('fSpecNum').value.trim(),
    category: document.getElementById('fCategory').value.trim(),
    subcategory: document.getElementById('fSubcategory').value.trim(),
    effective_date: document.getElementById('fEffDate').value.trim(),
    spec_pdf: document.getElementById('fSpecPdf').value.trim(),
    manufacturer_pdf: document.getElementById('fMfrPdf').value.trim(),
    products_pdf: document.getElementById('fProdPdf').value.trim(),
  };
  if (!body.product_name || !body.spec_number || !body.category) {
    showMsg('Product name, spec number, and category are required', 'error');
    return;
  }
  const editId = document.getElementById('editId').value;
  try {
    let res;
    if (editId) {
      res = await fetch(`${API}/specs/${editId}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      res = await fetch(`${API}/specs`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (res.ok) { showMsg(editId ? 'Spec updated' : 'Spec created', 'success'); clearForm(); loadAdminTable(); loadAdminStats(); loadSpecs(); }
    else { const err = await res.json(); showMsg(err.error || 'Save failed', 'error'); }
  } catch (e) { showMsg('Error connecting to API', 'error'); }
});

document.getElementById('cancelBtn').addEventListener('click', clearForm);

// Only admins get the manage view. The backend enforces this too (401/403);
// hiding is just UX.
async function revealAdminPanel() {
  try {
    const res = await fetch(`${API}/me`, { credentials: 'include' });
    if (!res.ok) return;
    const me = await res.json();
    if (me.isAdmin || me.role === 'Admin') {
      isAdminUser = true;
      let view = 'admin';
      try { view = sessionStorage.getItem('sfiSpecsView') || 'admin'; } catch (e) {}
      loadAdminStats();
      loadAdminTable();
      setView(view === 'public' ? 'public' : 'admin');
    }
  } catch (e) {}
}

// ═══════════════ INIT ═══════════════
revealAdminPanel();
loadStats();
loadSpecs();
</script>
