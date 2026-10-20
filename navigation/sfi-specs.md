---
layout: opencs
title: SFI Part Detection
description: Search and classify SFI motorsports safety specifications using machine learning.
permalink: /sfi-specs/
---

<div class="ocs__container">

<!-- ═══════════════ HERO ═══════════════ -->
<span class="ocs__badge">SFI Foundation</span>
<h1>SFI Part Detection</h1>
<p class="ocs__description">
  Identify racing safety specifications instantly using machine learning.
  Search 100+ SFI specs across drag racing, auto racing, boat racing, and more.
</p>
<div class="ocs__links">
  <a href="#classify" class="ocs__btn accent fill">Classify a Part</a>
  <a href="#search" class="ocs__btn accent">Browse All Specs</a>
</div>

<!-- ═══════════════ STATS BAR ═══════════════ -->
<div class="ocs__stats" id="statsBar">
  <div class="ocs__stat"><span class="ocs__stat-value" id="statSpecs">&mdash;</span><span class="ocs__stat-label">Total Specs</span></div>
  <div class="ocs__stat"><span class="ocs__stat-value" id="statCats">&mdash;</span><span class="ocs__stat-label">Categories</span></div>
  <div class="ocs__stat"><span class="ocs__stat-value" id="statSubs">&mdash;</span><span class="ocs__stat-label">Subcategories</span></div>
  <div class="ocs__stat"><span class="ocs__stat-value" id="statModel">&mdash;</span><span class="ocs__stat-label">ML Accuracy</span></div>
</div>

<!-- ═══════════════ SAFETY SHOWCASE ═══════════════ -->
<h2 class="ocs__section-title" id="safety-showcase">Interactive Safety Showcase</h2>
<p class="ocs__description">Hover over the highlighted zones on the car to explore the SFI specs that protect drivers — click to pin details</p>

<div class="ocs__grid ocs__grid--standard cols-2">
  <div class="ocs__grid-cell ocs__grid-cell--wide">
    <canvas id="safetyCanvas" width="850" height="320"></canvas>
    <p class="ocs__text">Hover zones · Click to pin</p>
  </div>
  <div class="ocs__grid-cell" id="showcasePanel">
    <p class="ocs__text" id="showcaseEmpty">🏎️ Hover a zone on the car to explore SFI specs</p>
    <div id="showcaseContent" hidden>
      <span class="ocs__badge" id="spCat"></span>
      <h3 id="spTitle"></h3>
      <p class="ocs__description" id="spDesc"></p>
      <h4>SFI Specifications</h4>
      <ul class="ocs__entity-list" id="spSpecs"></ul>
      <a href="#search" class="ocs__btn accent fill small">Search Full Database →</a>
    </div>
  </div>
</div>

<div class="ocs__links" id="showcasePills"></div>

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
    document.getElementById('showcaseEmpty').hidden=true;
    document.getElementById('showcaseContent').hidden=false;
    document.getElementById('spCat').textContent=part.category;
    document.getElementById('spTitle').textContent=part.label;
    document.getElementById('spDesc').textContent=part.desc;
    document.getElementById('spSpecs').innerHTML=part.specs.map(function(s){
      var pdfLink=s.pdf?' <a class="ocs__btn pill small" href="'+PDF_BASE+s.pdf+'" target="_blank">PDF ↗</a>':'';
      return '<li><strong>SFI '+s.num+'</strong> '+s.name+pdfLink+'</li>';
    }).join('');
    document.querySelectorAll('.sc-pill').forEach(function(el){
      var isThis=el.dataset.id===part.id;
      el.classList.toggle('accent',isThis);el.classList.toggle('fill',isThis);
    });
  }
  function hidePanel(){
    document.getElementById('showcaseEmpty').hidden=false;
    document.getElementById('showcaseContent').hidden=true;
    document.querySelectorAll('.sc-pill').forEach(function(el){el.classList.remove('accent','fill');});
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
    btn.className='sc-pill ocs__btn pill small';btn.dataset.id=p.id;btn.textContent=p.icon+' '+p.label;
    btn.addEventListener('click',function(){activeId=activeId===p.id?null:p.id;if(activeId)showPanel(p);else hidePanel();});
    pillsEl.appendChild(btn);
  });}

  loop();
})();
</script>
<!-- ═══════════════ ML CLASSIFIER ═══════════════ -->
<h2 class="ocs__section-title" id="classify">ML Part Classifier</h2>
<div class="ocs__card">
  <p class="ocs__description">
    Describe a racing part and our ML model will identify the matching SFI specifications with confidence scores.
  </p>
  <div class="ocs__links">
    <input type="text" class="ocs__input large" id="classifyInput"
           placeholder="e.g. fire resistant racing helmet, turbocharger, fuel cell, roll cage...">
    <button class="ocs__btn accent fill" id="classifyBtn">Classify</button>
  </div>
  <p class="ocs__text" id="classifyCount"></p>
  <div id="classifyResults"></div>
</div>

<!-- ═══════════════ SPEC SEARCH ═══════════════ -->
<h2 class="ocs__section-title" id="search">Specification Database</h2>
<div class="ocs__card">
  <input type="text" class="ocs__input large" id="sfiSearch"
         placeholder="Search specs... (e.g. helmet, 1.1, drag racing, clutch)">
  <p class="ocs__description" id="sfiFuzzyHint" hidden></p>
  <div class="ocs__links" id="sfiFilters">
    <button class="ocs__btn pill small accent fill" data-category="all">All</button>
  </div>
  <p class="ocs__text" id="sfiCount"></p>
  <div class="ocs__table-wrap">
    <table class="ocs__table">
      <thead><tr><th>Spec #</th><th>Product</th><th>Category</th><th>Date</th><th>PDF</th></tr></thead>
      <tbody id="sfiBody"></tbody>
    </table>
  </div>
  <div class="ocs__callout" id="sfiNoResults" hidden>No specs match your search.</div>
</div>

<!-- ═══════════════ CATEGORIES ═══════════════ -->
<h2 class="ocs__section-title" id="categories">Browse by Category</h2>
<div class="ocs__hub-grid" id="catGrid"></div>

<!-- ═══════════════ ABOUT ═══════════════ -->
<h2 class="ocs__section-title">About SFI Foundation</h2>
<div class="ocs__card">
  <p class="ocs__text">
    The <strong>SFI Foundation</strong> (originally the SEMA Foundation, Inc.) was established in 1978 as a
    nonprofit organization to develop and administer quality assurance programs for the motorsports
    aftermarket. SFI specifications cover safety equipment used across drag racing, auto racing,
    boat racing, tractor pulling, and more.
  </p>
  <p class="ocs__text">
    Each specification number corresponds to a specific type of racing equipment &mdash; from driver suits
    and helmets to roll cages, fuel cells, supercharger restraints, and turbochargers. Our ML model
    can identify the correct specification from a plain-text description of any part.
  </p>
  <p class="ocs__text">
    Learn more at <a href="/about/">About SFI Foundation</a>
  </p>
</div>

<!-- ═══════════════ ADMIN PANEL ═══════════════ -->
<button class="ocs__btn accent" id="adminToggle">
  Admin Panel <span id="adminArrow">&#9654;</span>
</button>
<div class="ocs__card" id="adminBody" hidden>
  <span class="ocs__status-pill" id="adminMsg" hidden></span>
  <div class="ocs__stats" id="adminStats"></div>

  <h3 id="formTitle">Add New Specification</h3>
  <input type="hidden" id="editId">
  <div class="ocs__grid ocs__grid--standard cols-2">
    <input class="ocs__input" id="fProduct" placeholder="Product name *">
    <input class="ocs__input" id="fSpecNum" placeholder="Spec number (e.g. 3.3) *">
    <input class="ocs__input" id="fCategory" placeholder="Category *">
    <input class="ocs__input" id="fSubcategory" placeholder="Subcategory">
    <input class="ocs__input" id="fEffDate" placeholder="Effective date">
    <input class="ocs__input" id="fSpecPdf" placeholder="Spec PDF filename">
    <input class="ocs__input" id="fMfrPdf" placeholder="Manufacturer PDF">
    <input class="ocs__input" id="fProdPdf" placeholder="Products PDF">
  </div>
  <div class="ocs__links">
    <button class="ocs__btn accent fill" id="saveBtn">Save Spec</button>
    <button class="ocs__btn alert-red" id="cancelBtn" hidden>Cancel</button>
  </div>

  <h3>All Specifications</h3>
  <div class="ocs__table-wrap">
    <table class="ocs__table" id="adminTable">
      <thead><tr><th>ID</th><th>Spec #</th><th>Product</th><th>Category</th><th>Actions</th></tr></thead>
      <tbody id="adminTableBody"></tbody>
    </table>
  </div>
</div>

</div>

<script>
// ── API Configuration ────────────────────────────
const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:8423"
  : "https://greppers-be.opencodingsociety.com";
const API = API_BASE + "/api/sfi";

const CATEGORY_ICONS = {
  "Auto Racing": "\u{1F3CE}\u{FE0F}",
  "Drag Racing": "\u{1F3C1}",
  "Boat Racing": "\u{1F6A4}",
  "Personal Protective Gear, Restraints & Nets": "\u{1F6E1}\u{FE0F}",
  "Chassis": "\u{1F527}",
  "Fuel Related": "\u26FD",
  "Tractor Pulling": "\u{1F69C}",
};

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
  countEl.innerHTML = 'Classifying...';
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
      resultsEl.innerHTML = '<div class="ocs__callout">No matching specs found.</div>';
      return;
    }
    resultsEl.innerHTML = data.predictions.map(p => {
      const confPct = (p.confidence * 100).toFixed(1);
      const pdfs = [];
      if (p.spec_pdf) pdfs.push(`<a class="ocs__btn pill small" href="https://www.sfifoundation.com/wp-content/pdfs/${p.spec_pdf}" target="_blank">Spec PDF</a>`);
      if (p.manufacturer_pdf) pdfs.push(`<a class="ocs__btn pill small" href="https://www.sfifoundation.com/wp-content/pdfs/${p.manufacturer_pdf}" target="_blank">Manufacturers</a>`);
      return `
        <div class="ocs__card">
          <h3>SFI ${p.spec_number} <span class="ocs__status-pill ocs__status-pill--good">${confPct}%</span></h3>
          <p class="ocs__text">${p.product_name}</p>
          <div class="ocs__links">
            <span class="ocs__status-pill ocs__status-pill--neutral">${p.category}</span>
            ${p.subcategory ? `<span class="ocs__status-pill ocs__status-pill--neutral">${p.subcategory}</span>` : ''}
            ${pdfs.join(' ')}
          </div>
          <progress value="${confPct}" max="100"></progress>
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
    document.getElementById('sfiNoResults').hidden = false;
    document.getElementById('sfiNoResults').textContent = 'Could not connect to API \u2014 is the backend running?';
  }
}

function buildFilters() {
  const cats = [...new Set(specs.map(s => s.category))].sort();
  const row = document.getElementById('sfiFilters');
  row.innerHTML = '<button class="ocs__btn pill small accent fill" data-category="all">All</button>';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'ocs__btn pill small';
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
    <div class="ocs__hub-card" onclick="filterByCategory('${cat.replace(/'/g, "\\'")}')">
      <div class="ocs__hub-card-title">${CATEGORY_ICONS[cat] || '\u{1F4CB}'} ${cat}</div>
      <p>${count} spec${count !== 1 ? 's' : ''}</p>
    </div>
  `).join('');
}

function filterByCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('#sfiFilters .ocs__btn').forEach(b => {
    const on = b.dataset.category === cat;
    b.classList.toggle('accent', on);
    b.classList.toggle('fill', on);
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
    hintEl.hidden = true;
    countEl.textContent = `Showing ${pool.length} of ${specs.length} specs`;
    if (!pool.length) { tbody.innerHTML = ''; noRes.hidden = false; return; }
    noRes.hidden = true;
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
    hintEl.hidden = false;
  } else {
    hintEl.hidden = true;
  }

  countEl.textContent = `Showing ${scored.length} of ${specs.length} specs`;
  if (!scored.length) { tbody.innerHTML = ''; noRes.hidden = false; return; }
  noRes.hidden = true;
  tbody.innerHTML = scored.map(x => specRow(x.spec)).join('');
}

function applySuggestion(text) {
  document.getElementById('sfiSearch').value = text;
  renderSearch();
}

function specRow(s) {
  const pdfs = [];
  if (s.spec_pdf) pdfs.push(`<a class="ocs__btn pill small" href="https://www.sfifoundation.com/wp-content/pdfs/${s.spec_pdf}" target="_blank">Spec</a>`);
  if (s.manufacturer_pdf) pdfs.push(`<a class="ocs__btn pill small" href="https://www.sfifoundation.com/wp-content/pdfs/${s.manufacturer_pdf}" target="_blank">Mfrs</a>`);
  return `<tr>
    <td>SFI ${s.spec_number}</td>
    <td>${s.product_name}</td>
    <td><span class="ocs__status-pill ocs__status-pill--neutral">${s.category}</span></td>
    <td>${s.effective_date || '\u2014'}</td>
    <td>${pdfs.join(' ') || '\u2014'}</td>
  </tr>`;
}

document.getElementById('sfiSearch').addEventListener('input', renderSearch);
document.getElementById('sfiFilters').addEventListener('click', e => {
  if (!e.target.dataset.category) return;
  document.querySelectorAll('#sfiFilters .ocs__btn').forEach(b => b.classList.remove('accent', 'fill'));
  e.target.classList.add('accent', 'fill');
  activeCategory = e.target.dataset.category;
  renderSearch();
});

// ═══════════════ ADMIN PANEL ═══════════════
document.getElementById('adminToggle').addEventListener('click', () => {
  const body = document.getElementById('adminBody');
  const arrow = document.getElementById('adminArrow');
  body.hidden = !body.hidden;
  arrow.innerHTML = body.hidden ? '&#9654;' : '&#9660;';
  if (!body.hidden) { loadAdminStats(); loadAdminTable(); }
});

function showMsg(text, type) {
  const el = document.getElementById('adminMsg');
  el.textContent = text;
  el.className = `ocs__status-pill ocs__status-pill--${type === 'error' ? 'bad' : 'good'}`;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 4000);
}

async function loadAdminStats() {
  try {
    const res = await fetch(`${API}/stats`);
    const d = await res.json();
    document.getElementById('adminStats').innerHTML = `
      <div class="ocs__stat"><span class="ocs__stat-value">${d.total_specs}</span><span class="ocs__stat-label">Total Specs</span></div>
      <div class="ocs__stat"><span class="ocs__stat-value">${d.total_categories}</span><span class="ocs__stat-label">Categories</span></div>
      <div class="ocs__stat"><span class="ocs__stat-value">${d.total_subcategories}</span><span class="ocs__stat-label">Subcategories</span></div>`;
  } catch (e) {}
}

async function loadAdminTable() {
  try {
    const res = await fetch(`${API}/specs`);
    const data = await res.json();
    document.getElementById('adminTableBody').innerHTML = data.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>SFI ${s.spec_number}</td>
        <td>${s.product_name}</td>
        <td><span class="ocs__status-pill ocs__status-pill--neutral">${s.category}</span></td>
        <td>
          <button class="ocs__btn small accent" onclick="editSpec(${s.id})">Edit</button>
          <button class="ocs__btn small alert-red" onclick="deleteSpec(${s.id})">Del</button>
        </td>
      </tr>`).join('');
  } catch (e) {}
}

function clearForm() {
  ['editId','fProduct','fSpecNum','fCategory','fSubcategory','fEffDate','fSpecPdf','fMfrPdf','fProdPdf']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('formTitle').textContent = 'Add New Specification';
  document.getElementById('cancelBtn').hidden = true;
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
    document.getElementById('cancelBtn').hidden = false;
  } catch (e) { showMsg('Failed to load spec', 'error'); }
}

async function deleteSpec(id) {
  if (!confirm('Delete this spec?')) return;
  try {
    const res = await fetch(`${API}/specs/${id}`, { method: 'DELETE' });
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
      res = await fetch(`${API}/specs/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      res = await fetch(`${API}/specs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (res.ok) { showMsg(editId ? 'Spec updated' : 'Spec created', 'success'); clearForm(); loadAdminTable(); loadAdminStats(); loadSpecs(); }
    else { const err = await res.json(); showMsg(err.error || 'Save failed', 'error'); }
  } catch (e) { showMsg('Error connecting to API', 'error'); }
});

document.getElementById('cancelBtn').addEventListener('click', clearForm);

// ═══════════════ INIT ═══════════════
loadStats();
loadSpecs();
</script>
