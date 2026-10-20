---
layout: sfi
title: SFI Part Detection
description: Search and classify SFI motorsports safety specifications using machine learning.
permalink: /sfi-specs/
---

<style>
/* ── Page-specific styles for Spec Search ──────── */

/* Hero override for this page */
.specs-hero {
  background: linear-gradient(135deg, var(--sfi-bg) 0%, #1a1025 40%, var(--sfi-bg) 100%);
  padding: 120px 20px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.specs-hero::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(ellipse at 30% 50%, rgba(240,165,0,0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 50%, rgba(0,212,255,0.04) 0%, transparent 60%);
  animation: specsPulse 8s ease-in-out infinite alternate;
}
@keyframes specsPulse {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.05) rotate(2deg); }
}
.specs-hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
.specs-hero h1 {
  font-family: 'Oswald', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.specs-hero h1 span { color: var(--sfi-gold); }
.specs-hero-tag {
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem;
  color: var(--sfi-muted);
  margin-bottom: 32px;
  line-height: 1.6;
}
.specs-hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

/* Stats Bar */
.sfi-stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  max-width: 900px;
  margin: -30px auto 40px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}
.sfi-stat-card {
  background: rgba(13,18,32,0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--sfi-border);
  border-radius: 14px;
  padding: 20px 16px;
  text-align: center;
  transition: transform 0.2s, border-color 0.2s;
}
.sfi-stat-card:hover { transform: translateY(-3px); border-color: var(--sfi-gold); }
.sfi-stat-val {
  font-family: 'Oswald', sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--sfi-gold);
}
.sfi-stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: var(--sfi-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 4px;
}

/* Section Containers */
.sfi-section {
  max-width: 1000px;
  margin: 0 auto 48px;
  padding: 0 20px;
}
.sfi-section-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--sfi-gold);
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(240,165,0,0.2);
}

/* ML Classifier */
.sfi-classify-wrap {
  background: rgba(13,18,32,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--sfi-border);
  border-radius: var(--sfi-radius);
  padding: 32px;
}
.sfi-classify-input-row { display: flex; gap: 12px; margin-bottom: 20px; }
.sfi-classify-input {
  flex: 1;
  padding: 16px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  border: 2px solid rgba(240,165,0,0.2);
  border-radius: 12px;
  background: var(--sfi-bg);
  color: var(--sfi-text);
  transition: border-color 0.2s;
}
.sfi-classify-input:focus { outline: none; border-color: var(--sfi-gold); }
.sfi-classify-input::placeholder { color: #555; }
.sfi-classify-btn {
  padding: 16px 28px;
  background: linear-gradient(135deg, var(--sfi-gold), var(--sfi-gold-dim));
  color: #000;
  border: none;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}
.sfi-classify-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(240,165,0,0.3); }
.sfi-classify-hint {
  color: var(--sfi-muted);
  font-size: 0.85rem;
  margin-bottom: 16px;
  font-family: 'Inter', sans-serif;
}
.sfi-result-count {
  color: var(--sfi-muted);
  font-size: 0.9rem;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
}

/* Result Cards */
.sfi-result-card {
  background: var(--sfi-surface);
  border: 1px solid rgba(240,165,0,0.1);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}
.sfi-result-card:hover { border-color: var(--sfi-gold); }
.sfi-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.sfi-result-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: var(--sfi-gold);
  font-size: 1rem;
}
.sfi-result-conf {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: var(--sfi-cyan);
  font-weight: 600;
}
.sfi-result-name {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-text);
  font-size: 0.95rem;
  margin-bottom: 6px;
}
.sfi-result-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.sfi-cat-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  background: rgba(0,212,255,0.1);
  color: var(--sfi-cyan);
  border: 1px solid rgba(0,212,255,0.2);
}
.sfi-pdf-link {
  color: var(--sfi-cyan);
  text-decoration: none;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
}
.sfi-pdf-link:hover { text-decoration: underline; }
.sfi-conf-bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(240,165,0,0.15);
  margin-top: 8px;
  overflow: hidden;
}
.sfi-conf-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--sfi-gold), var(--sfi-cyan));
  transition: width 0.5s ease;
}

/* Spec Search */
.sfi-search-box {
  width: 100%;
  padding: 14px 18px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  border: 2px solid rgba(240,165,0,0.2);
  border-radius: 12px;
  background: var(--sfi-bg);
  color: var(--sfi-text);
  margin-bottom: 12px;
  box-sizing: border-box;
}
.sfi-search-box:focus { outline: none; border-color: var(--sfi-gold); }
.sfi-filter-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.sfi-filter-btn {
  padding: 6px 16px;
  border: 1px solid rgba(240,165,0,0.2);
  border-radius: 20px;
  background: transparent;
  color: var(--sfi-muted);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  transition: all 0.2s;
}
.sfi-filter-btn:hover { border-color: var(--sfi-gold); color: var(--sfi-text); }
.sfi-filter-btn.active { background: var(--sfi-gold); color: #000; border-color: var(--sfi-gold); }
.sfi-count {
  color: var(--sfi-muted);
  font-size: 0.85rem;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
}
.sfi-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
}
.sfi-table th {
  text-align: left;
  padding: 12px 10px;
  border-bottom: 2px solid var(--sfi-gold);
  color: var(--sfi-gold);
  position: sticky;
  top: 64px;
  background: var(--sfi-bg);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 5;
}
.sfi-table td {
  padding: 10px;
  border-bottom: 1px solid rgba(240,165,0,0.08);
  color: var(--sfi-text);
}
.sfi-table tr:hover td { background: rgba(240,165,0,0.04); }
.sfi-spec-num { font-weight: 700; color: var(--sfi-gold); white-space: nowrap; }
.sfi-no-results {
  text-align: center;
  color: var(--sfi-muted);
  padding: 40px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
}

/* Categories Grid */
.sfi-cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}
.sfi-cat-card {
  background: rgba(13,18,32,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid var(--sfi-border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
}
.sfi-cat-card:hover {
  border-color: var(--sfi-gold);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}
.sfi-cat-icon { font-size: 2rem; margin-bottom: 8px; }
.sfi-cat-name {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: var(--sfi-text);
  font-size: 0.9rem;
  margin-bottom: 4px;
}
.sfi-cat-count {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  font-size: 0.75rem;
}

/* About Card */
.sfi-about-card {
  background: rgba(13,18,32,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--sfi-border);
  border-radius: var(--sfi-radius);
  padding: 32px;
}
.sfi-about-card p {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  line-height: 1.7;
  font-size: 0.95rem;
  margin-bottom: 12px;
}
.sfi-about-card a { color: var(--sfi-cyan); text-decoration: none; }
.sfi-about-card a:hover { text-decoration: underline; }

/* Admin Accordion */
.sfi-admin-toggle {
  width: 100%;
  padding: 14px 20px;
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: 12px;
  color: var(--sfi-gold);
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sfi-admin-toggle:hover { background: var(--sfi-surface2); }
.sfi-admin-body { display: none; margin-top: 16px; }
.sfi-admin-body.open { display: block; }
.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.admin-stat {
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}
.admin-stat-val { font-family: 'Oswald', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--sfi-gold); }
.admin-stat-label { color: var(--sfi-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', sans-serif; }
.admin-form {
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}
.admin-form h3 { color: var(--sfi-gold); margin: 0 0 16px; font-size: 1.1rem; font-family: 'Inter', sans-serif; }
.admin-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.admin-field {
  padding: 10px 12px;
  border: 1px solid rgba(240,165,0,0.15);
  border-radius: 8px;
  background: var(--sfi-bg);
  color: var(--sfi-text);
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}
.admin-field:focus { outline: none; border-color: var(--sfi-gold); }
.admin-field::placeholder { color: #555; }
.admin-actions { display: flex; gap: 8px; margin-top: 12px; }
.admin-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: var(--sfi-gold);
  color: #000;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  transition: background 0.2s;
}
.admin-btn:hover { background: #d49400; }
.admin-btn-danger {
  padding: 8px 16px;
  border: 1px solid var(--sfi-red);
  border-radius: 8px;
  background: transparent;
  color: var(--sfi-red);
  font-weight: 700;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.admin-btn-danger:hover { background: var(--sfi-red); color: #fff; }
.admin-msg {
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  display: none;
  font-family: 'Inter', sans-serif;
}
.admin-msg.success { display: block; background: rgba(63,185,80,0.12); color: var(--sfi-green); border: 1px solid rgba(63,185,80,0.25); }
.admin-msg.error { display: block; background: rgba(248,81,73,0.12); color: var(--sfi-red); border: 1px solid rgba(248,81,73,0.25); }

/* Loading Spinner */
.sfi-spinner {
  display: inline-block;
  width: 20px; height: 20px;
  border: 3px solid rgba(240,165,0,0.2);
  border-top-color: var(--sfi-gold);
  border-radius: 50%;
  animation: sfiSpin 0.6s linear infinite;
}
@keyframes sfiSpin { to { transform: rotate(360deg); } }

/* Fuzzy search hint */
.sfi-fuzzy-hint {
  display: none;
  padding: 10px 16px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: rgba(0,212,255,0.06);
  border: 1px solid rgba(0,212,255,0.15);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: var(--sfi-muted);
}
.sfi-fuzzy-hint.visible { display: block; }
.sfi-fuzzy-hint strong {
  color: var(--sfi-cyan);
  cursor: pointer;
}
.sfi-fuzzy-hint strong:hover { text-decoration: underline; }

/* Responsive */
@media (max-width: 600px) {
  .specs-hero h1 { font-size: 2.2rem; }
  .sfi-classify-input-row { flex-direction: column; }
  .sfi-stats-bar { grid-template-columns: repeat(2, 1fr); }
  .admin-row { grid-template-columns: 1fr; }
}
</style>

<!-- ═══════════════ HERO ═══════════════ -->
<div class="specs-hero">
  <div class="specs-hero-content">
    <h1>SFI <span>Part Detection</span></h1>
    <p class="specs-hero-tag">
      Identify racing safety specifications instantly using machine learning.<br>
      Search 100+ SFI specs across drag racing, auto racing, boat racing, and more.
    </p>
    <div class="specs-hero-btns">
      <a href="#classify" class="sfi-btn sfi-btn-primary">Classify a Part</a>
      <a href="#search" class="sfi-btn sfi-btn-secondary">Browse All Specs</a>
    </div>
  </div>
</div>

<!-- ═══════════════ STATS BAR ═══════════════ -->
<div class="sfi-stats-bar" id="statsBar">
  <div class="sfi-stat-card">
    <div class="sfi-stat-val" id="statSpecs">&mdash;</div>
    <div class="sfi-stat-label">Total Specs</div>
  </div>
  <div class="sfi-stat-card">
    <div class="sfi-stat-val" id="statCats">&mdash;</div>
    <div class="sfi-stat-label">Categories</div>
  </div>
  <div class="sfi-stat-card">
    <div class="sfi-stat-val" id="statSubs">&mdash;</div>
    <div class="sfi-stat-label">Subcategories</div>
  </div>
  <div class="sfi-stat-card">
    <div class="sfi-stat-val" id="statModel">&mdash;</div>
    <div class="sfi-stat-label">ML Accuracy</div>
  </div>
</div>

<!-- ═══════════════ SAFETY SHOWCASE ═══════════════ -->
<div class="sfi-section" id="safety-showcase">
  <h2 class="sfi-section-title">Interactive Safety Showcase</h2>
  <p style="color:var(--sfi-muted);font-family:'Inter',sans-serif;font-size:0.95rem;margin:0 0 24px;line-height:1.6;">Hover over the highlighted zones on the car to explore the SFI specs that protect drivers — click to pin details</p>

  <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start;margin-top:24px;">
    <div style="position:relative;background:#0e1117;border-radius:10px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;cursor:crosshair;">
      <canvas id="safetyCanvas" width="850" height="320" style="width:100%;height:auto;display:block;"></canvas>
      <div style="position:absolute;bottom:9px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:rgba(255,255,255,0.4);font-size:0.68rem;padding:3px 11px;border-radius:20px;white-space:nowrap;pointer-events:none;font-family:'Inter',sans-serif;letter-spacing:0.5px;">Hover zones · Click to pin</div>
    </div>
    <div id="showcasePanel" style="background:#161b27;border-radius:10px;border:1px solid rgba(255,255,255,0.07);padding:20px;min-height:260px;display:flex;flex-direction:column;">
      <div id="showcaseEmpty" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;">
        <div style="font-size:2.5rem;opacity:0.25;">🏎️</div>
        <p style="color:#8b949e;font-size:0.84rem;line-height:1.5;font-family:'Inter',sans-serif;max-width:200px;margin:0;">Hover a zone on the car to explore SFI specs</p>
      </div>
      <div id="showcaseContent" style="display:none;flex-direction:column;flex:1;">
        <div id="spCat" style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;font-family:'Inter',sans-serif;"></div>
        <h3 id="spTitle" style="font-family:'Oswald',sans-serif;font-size:1.35rem;font-weight:700;margin:0 0 9px;text-transform:uppercase;color:#e2e8f0;"></h3>
        <p id="spDesc" style="font-size:0.8rem;color:#8b949e;line-height:1.6;margin-bottom:13px;font-family:'Inter',sans-serif;"></p>
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#8b949e;margin-bottom:6px;font-family:'Inter',sans-serif;">SFI Specifications</div>
        <div id="spSpecs"></div>
        <a href="#search" style="display:inline-flex;align-items:center;justify-content:center;margin-top:14px;padding:8px 14px;background:rgba(58,123,213,0.1);border:1px solid rgba(58,123,213,0.25);border-radius:8px;color:#6fa3e8;font-family:'Inter',sans-serif;font-weight:600;font-size:0.8rem;text-decoration:none;">Search Full Database →</a>
      </div>
    </div>
  </div>

  <div id="showcasePills" style="display:flex;flex-wrap:wrap;gap:7px;margin-top:16px;justify-content:center;"></div>
</div>

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
    document.getElementById('showcaseEmpty').style.display='none';
    var c=document.getElementById('showcaseContent');c.style.display='flex';
    var cat=document.getElementById('spCat');cat.textContent=part.category;cat.style.color=part.color;
    var t=document.getElementById('spTitle');t.textContent=part.label;t.style.color=part.color;
    document.getElementById('spDesc').textContent=part.desc;
    document.getElementById('spSpecs').innerHTML=part.specs.map(function(s){
      var pdfLink=s.pdf?'<a href="'+PDF_BASE+s.pdf+'" target="_blank" style="margin-left:auto;font-size:0.68rem;color:'+part.color+';opacity:0.8;text-decoration:none;border:1px solid '+part.color+'44;padding:2px 7px;border-radius:10px;white-space:nowrap;">PDF ↗</a>':'';
      return '<div style="display:flex;align-items:center;gap:9px;padding:6px 9px;background:rgba(255,255,255,0.04);border-radius:7px;margin-bottom:5px;border:1px solid rgba(255,255,255,0.05);"><span style="font-family:Oswald,sans-serif;font-weight:700;font-size:0.9rem;min-width:50px;color:'+part.color+'">SFI '+s.num+'</span><span style="font-size:0.76rem;color:#c9d1d9;font-family:Inter,sans-serif;line-height:1.3;flex:1;">'+s.name+'</span>'+pdfLink+'</div>';
    }).join('');
    document.querySelectorAll('.sc-pill').forEach(function(el){
      var isThis=el.dataset.id===part.id;
      el.style.background=isThis?part.color+'28':'transparent';
      var pp=PARTS.find(function(x){return x.id===el.dataset.id;});
      if(pp){el.style.borderColor=isThis?pp.color:pp.color+'55';el.style.color=isThis?pp.color:pp.color+'99';}
    });
  }
  function hidePanel(){
    document.getElementById('showcaseEmpty').style.display='flex';
    document.getElementById('showcaseContent').style.display='none';
    document.querySelectorAll('.sc-pill').forEach(function(el){
      var pp=PARTS.find(function(x){return x.id===el.dataset.id;});
      if(pp){el.style.background='transparent';el.style.borderColor=pp.color+'55';el.style.color=pp.color+'99';}
    });
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
    btn.className='sc-pill';btn.dataset.id=p.id;btn.textContent=p.icon+' '+p.label;
    btn.style.cssText='padding:5px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;border:1px solid '+p.color+'55;color:'+p.color+'99;background:transparent;transition:all 0.18s;';
    btn.addEventListener('click',function(){activeId=activeId===p.id?null:p.id;if(activeId)showPanel(p);else hidePanel();});
    pillsEl.appendChild(btn);
  });}

  loop();
})();
</script>
<!-- ═══════════════ ML CLASSIFIER ═══════════════ -->
<div class="sfi-section" id="classify">
  <h2 class="sfi-section-title">ML Part Classifier</h2>
  <div class="sfi-classify-wrap">
    <p class="sfi-classify-hint">
      Describe a racing part and our ML model will identify the matching SFI specifications with confidence scores.
    </p>
    <div class="sfi-classify-input-row">
      <input type="text" class="sfi-classify-input" id="classifyInput"
             placeholder="e.g. fire resistant racing helmet, turbocharger, fuel cell, roll cage...">
      <button class="sfi-classify-btn" id="classifyBtn">Classify</button>
    </div>
    <div class="sfi-result-count" id="classifyCount"></div>
    <div id="classifyResults"></div>
  </div>
</div>

<!-- ═══════════════ SPEC SEARCH ═══════════════ -->
<div class="sfi-section" id="search">
  <h2 class="sfi-section-title">Specification Database</h2>

  <input type="text" class="sfi-search-box" id="sfiSearch"
         placeholder="Search specs... (e.g. helmet, 1.1, drag racing, clutch)">

  <div id="sfiFuzzyHint" class="sfi-fuzzy-hint"></div>

  <div class="sfi-filter-row" id="sfiFilters">
    <button class="sfi-filter-btn active" data-category="all">All</button>
  </div>

  <div class="sfi-count" id="sfiCount"></div>

  <table class="sfi-table">
    <thead>
      <tr>
        <th>Spec #</th>
        <th>Product</th>
        <th>Category</th>
        <th>Date</th>
        <th>PDF</th>
      </tr>
    </thead>
    <tbody id="sfiBody"></tbody>
  </table>

  <div class="sfi-no-results" id="sfiNoResults" style="display:none;">
    No specs match your search.
  </div>
</div>

<!-- ═══════════════ CATEGORIES ═══════════════ -->
<div class="sfi-section" id="categories">
  <h2 class="sfi-section-title">Browse by Category</h2>
  <div class="sfi-cat-grid" id="catGrid"></div>
</div>

<!-- ═══════════════ ABOUT ═══════════════ -->
<div class="sfi-section">
  <h2 class="sfi-section-title">About SFI Foundation</h2>
  <div class="sfi-about-card">
    <p>
      The <strong>SFI Foundation</strong> (originally the SEMA Foundation, Inc.) was established in 1978 as a
      nonprofit organization to develop and administer quality assurance programs for the motorsports
      aftermarket. SFI specifications cover safety equipment used across drag racing, auto racing,
      boat racing, tractor pulling, and more.
    </p>
    <p>
      Each specification number corresponds to a specific type of racing equipment &mdash; from driver suits
      and helmets to roll cages, fuel cells, supercharger restraints, and turbochargers. Our ML model
      can identify the correct specification from a plain-text description of any part.
    </p>
    <p>
      Learn more at <a href="/about/">About SFI Foundation</a>
    </p>
  </div>
</div>

<!-- ═══════════════ ADMIN PANEL ═══════════════ -->
<div class="sfi-section">
  <button class="sfi-admin-toggle" id="adminToggle">
    Admin Panel <span id="adminArrow">&#9654;</span>
  </button>
  <div class="sfi-admin-body" id="adminBody">
    <div id="adminMsg" class="admin-msg"></div>
    <div class="admin-stats" id="adminStats"></div>

    <div class="admin-form">
      <h3 id="formTitle">Add New Specification</h3>
      <input type="hidden" id="editId">
      <div class="admin-row">
        <input class="admin-field" id="fProduct" placeholder="Product name *">
        <input class="admin-field" id="fSpecNum" placeholder="Spec number (e.g. 3.3) *">
      </div>
      <div class="admin-row">
        <input class="admin-field" id="fCategory" placeholder="Category *">
        <input class="admin-field" id="fSubcategory" placeholder="Subcategory">
      </div>
      <div class="admin-row">
        <input class="admin-field" id="fEffDate" placeholder="Effective date">
        <input class="admin-field" id="fSpecPdf" placeholder="Spec PDF filename">
      </div>
      <div class="admin-row">
        <input class="admin-field" id="fMfrPdf" placeholder="Manufacturer PDF">
        <input class="admin-field" id="fProdPdf" placeholder="Products PDF">
      </div>
      <div class="admin-actions">
        <button class="admin-btn" id="saveBtn">Save Spec</button>
        <button class="admin-btn-danger" id="cancelBtn" style="display:none;">Cancel</button>
      </div>
    </div>

    <h3 style="color:var(--sfi-gold); margin-bottom:12px; font-family:'Inter',sans-serif;">All Specifications</h3>
    <table class="sfi-table" id="adminTable">
      <thead>
        <tr>
          <th>ID</th>
          <th>Spec #</th>
          <th>Product</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="adminTableBody"></tbody>
    </table>
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
  countEl.innerHTML = '<span class="sfi-spinner"></span> Classifying...';
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
      resultsEl.innerHTML = '<div class="sfi-no-results">No matching specs found.</div>';
      return;
    }
    resultsEl.innerHTML = data.predictions.map(p => {
      const confPct = (p.confidence * 100).toFixed(1);
      const pdfs = [];
      if (p.spec_pdf) pdfs.push(`<a class="sfi-pdf-link" href="https://www.sfifoundation.com/wp-content/pdfs/${p.spec_pdf}" target="_blank">Spec PDF</a>`);
      if (p.manufacturer_pdf) pdfs.push(`<a class="sfi-pdf-link" href="https://www.sfifoundation.com/wp-content/pdfs/${p.manufacturer_pdf}" target="_blank">Manufacturers</a>`);
      return `
        <div class="sfi-result-card">
          <div class="sfi-result-header">
            <span class="sfi-result-title">SFI ${p.spec_number}</span>
            <span class="sfi-result-conf">${confPct}%</span>
          </div>
          <div class="sfi-result-name">${p.product_name}</div>
          <div class="sfi-result-meta">
            <span class="sfi-cat-badge">${p.category}</span>
            ${p.subcategory ? `<span class="sfi-cat-badge">${p.subcategory}</span>` : ''}
            ${pdfs.join(' \u2022 ')}
          </div>
          <div class="sfi-conf-bar">
            <div class="sfi-conf-fill" style="width:${confPct}%"></div>
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
    document.getElementById('sfiNoResults').style.display = 'block';
    document.getElementById('sfiNoResults').textContent = 'Could not connect to API \u2014 is the backend running?';
  }
}

function buildFilters() {
  const cats = [...new Set(specs.map(s => s.category))].sort();
  const row = document.getElementById('sfiFilters');
  row.innerHTML = '<button class="sfi-filter-btn active" data-category="all">All</button>';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'sfi-filter-btn';
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
    <div class="sfi-cat-card" onclick="filterByCategory('${cat.replace(/'/g, "\\'")}')">
      <div class="sfi-cat-icon">${CATEGORY_ICONS[cat] || '\u{1F4CB}'}</div>
      <div class="sfi-cat-name">${cat}</div>
      <div class="sfi-cat-count">${count} spec${count !== 1 ? 's' : ''}</div>
    </div>
  `).join('');
}

function filterByCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.sfi-filter-btn').forEach(b => {
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
    hintEl.className = 'sfi-fuzzy-hint';
    countEl.textContent = `Showing ${pool.length} of ${specs.length} specs`;
    if (!pool.length) { tbody.innerHTML = ''; noRes.style.display = 'block'; return; }
    noRes.style.display = 'none';
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
    hintEl.className = 'sfi-fuzzy-hint visible';
  } else {
    hintEl.className = 'sfi-fuzzy-hint';
  }

  countEl.textContent = `Showing ${scored.length} of ${specs.length} specs`;
  if (!scored.length) { tbody.innerHTML = ''; noRes.style.display = 'block'; return; }
  noRes.style.display = 'none';
  tbody.innerHTML = scored.map(x => specRow(x.spec)).join('');
}

function applySuggestion(text) {
  document.getElementById('sfiSearch').value = text;
  renderSearch();
}

function specRow(s) {
  const pdfs = [];
  if (s.spec_pdf) pdfs.push(`<a class="sfi-pdf-link" href="https://www.sfifoundation.com/wp-content/pdfs/${s.spec_pdf}" target="_blank">Spec</a>`);
  if (s.manufacturer_pdf) pdfs.push(`<a class="sfi-pdf-link" href="https://www.sfifoundation.com/wp-content/pdfs/${s.manufacturer_pdf}" target="_blank">Mfrs</a>`);
  return `<tr>
    <td class="sfi-spec-num">SFI ${s.spec_number}</td>
    <td>${s.product_name}</td>
    <td><span class="sfi-cat-badge">${s.category}</span></td>
    <td>${s.effective_date || '\u2014'}</td>
    <td>${pdfs.join(' \u2022 ') || '\u2014'}</td>
  </tr>`;
}

document.getElementById('sfiSearch').addEventListener('input', renderSearch);
document.getElementById('sfiFilters').addEventListener('click', e => {
  if (!e.target.classList.contains('sfi-filter-btn')) return;
  document.querySelectorAll('.sfi-filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  activeCategory = e.target.dataset.category;
  renderSearch();
});

// ═══════════════ ADMIN PANEL ═══════════════
document.getElementById('adminToggle').addEventListener('click', () => {
  const body = document.getElementById('adminBody');
  const arrow = document.getElementById('adminArrow');
  body.classList.toggle('open');
  arrow.innerHTML = body.classList.contains('open') ? '&#9660;' : '&#9654;';
  if (body.classList.contains('open')) { loadAdminStats(); loadAdminTable(); }
});

function showMsg(text, type) {
  const el = document.getElementById('adminMsg');
  el.textContent = text;
  el.className = `admin-msg ${type}`;
  setTimeout(() => { el.className = 'admin-msg'; }, 4000);
}

async function loadAdminStats() {
  try {
    const res = await fetch(`${API}/stats`);
    const d = await res.json();
    document.getElementById('adminStats').innerHTML = `
      <div class="admin-stat"><div class="admin-stat-val">${d.total_specs}</div><div class="admin-stat-label">Total Specs</div></div>
      <div class="admin-stat"><div class="admin-stat-val">${d.total_categories}</div><div class="admin-stat-label">Categories</div></div>
      <div class="admin-stat"><div class="admin-stat-val">${d.total_subcategories}</div><div class="admin-stat-label">Subcategories</div></div>`;
  } catch (e) {}
}

async function loadAdminTable() {
  try {
    const res = await fetch(`${API}/specs`);
    const data = await res.json();
    document.getElementById('adminTableBody').innerHTML = data.map(s => `
      <tr>
        <td>${s.id}</td>
        <td class="sfi-spec-num">SFI ${s.spec_number}</td>
        <td>${s.product_name}</td>
        <td><span class="sfi-cat-badge">${s.category}</span></td>
        <td>
          <button class="admin-btn" style="padding:4px 10px;font-size:.75rem;" onclick="editSpec(${s.id})">Edit</button>
          <button class="admin-btn-danger" style="padding:4px 10px;font-size:.75rem;" onclick="deleteSpec(${s.id})">Del</button>
        </td>
      </tr>`).join('');
  } catch (e) {}
}

function clearForm() {
  ['editId','fProduct','fSpecNum','fCategory','fSubcategory','fEffDate','fSpecPdf','fMfrPdf','fProdPdf']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('formTitle').textContent = 'Add New Specification';
  document.getElementById('cancelBtn').style.display = 'none';
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
    document.getElementById('cancelBtn').style.display = 'inline-block';
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
