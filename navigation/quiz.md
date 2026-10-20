---
layout: sfi
title: My Gear
description: Track your racing safety equipment, SFI certifications, and expiration dates.
permalink: /quiz/
---

<style>
/* ── My Gear Tracker Styles ───────────────────── */
.gear-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 100px 24px 80px;
  font-family: 'Inter', sans-serif;
}

/* Safety Score Ring */
.gear-score-section {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}
.gear-score-ring {
  position: relative;
  width: 160px; height: 160px;
  flex-shrink: 0;
}
.gear-score-ring svg { transform: rotate(-90deg); }
.gear-score-ring .ring-bg {
  fill: none;
  stroke: rgba(240,165,0,0.1);
  stroke-width: 10;
}
.gear-score-ring .ring-fill {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease, stroke 0.5s;
}
.gear-score-val {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.gear-score-num {
  font-family: 'Oswald', sans-serif;
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--sfi-gold);
  line-height: 1;
}
.gear-score-label {
  font-size: 0.7rem;
  color: var(--sfi-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 4px;
}
.gear-score-info { flex: 1; min-width: 240px; }
.gear-score-info h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}
.gear-score-info p {
  color: var(--sfi-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 16px;
}
.gear-score-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.gear-badge {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: 1px solid;
}
.gear-badge.good { color: var(--sfi-green); border-color: rgba(63,185,80,0.3); background: rgba(63,185,80,0.08); }
.gear-badge.warn { color: var(--sfi-gold); border-color: rgba(240,165,0,0.3); background: rgba(240,165,0,0.08); }
.gear-badge.bad { color: var(--sfi-red); border-color: rgba(248,81,73,0.3); background: rgba(248,81,73,0.08); }

/* Add Gear Form */
.gear-add-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.gear-add-bar input, .gear-add-bar select {
  padding: 12px 16px;
  border: 2px solid var(--sfi-border);
  border-radius: 10px;
  background: var(--sfi-bg);
  color: var(--sfi-text);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}
.gear-add-bar input:focus, .gear-add-bar select:focus { outline: none; border-color: var(--sfi-gold); }
.gear-add-bar input::placeholder { color: #555; }
.gear-add-bar select { cursor: pointer; }
.gear-add-bar select option { background: var(--sfi-bg); color: var(--sfi-text); }
.gear-add-bar .gear-name-input { flex: 2; min-width: 180px; }
.gear-add-bar .gear-spec-input { flex: 1; min-width: 100px; }
.gear-add-bar .gear-date-input { flex: 1; min-width: 140px; }
.gear-add-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--sfi-gold), var(--sfi-gold-dim));
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
  white-space: nowrap;
}
.gear-add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(240,165,0,0.3); }

/* Gear spec autocomplete */
.gear-spec-wrap {
  position: relative;
  flex: 1;
  min-width: 100px;
}
.gear-spec-wrap input { width: 100%; }
.gear-autocomplete {
  display: none;
  position: absolute;
  top: 100%;
  left: 0; right: 0;
  background: var(--sfi-surface2);
  border: 1px solid var(--sfi-border);
  border-radius: 0 0 10px 10px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
}
.gear-autocomplete.open { display: block; }
.gear-ac-item {
  padding: 10px 14px;
  font-size: 0.85rem;
  color: var(--sfi-text);
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.gear-ac-item:hover { background: rgba(240,165,0,0.06); }
.gear-ac-item small { color: var(--sfi-muted); }

/* Gear Items */
.gear-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.gear-list-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--sfi-gold);
}
.gear-sort-btn {
  padding: 6px 14px;
  border: 1px solid var(--sfi-border);
  border-radius: 8px;
  background: transparent;
  color: var(--sfi-muted);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.gear-sort-btn:hover { border-color: var(--sfi-gold); color: var(--sfi-text); }

.gear-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--sfi-muted);
  font-size: 0.95rem;
}
.gear-empty-icon { font-size: 3rem; margin-bottom: 12px; opacity: 0.5; }

.gear-item {
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 18px;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
.gear-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
}
.gear-item.status-good::before { background: var(--sfi-green); }
.gear-item.status-warn::before { background: var(--sfi-gold); }
.gear-item.status-expired::before { background: var(--sfi-red); }
.gear-item:hover { border-color: var(--sfi-border-bright); transform: translateX(4px); }

.gear-item-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  background: rgba(240,165,0,0.08);
  border: 1px solid rgba(240,165,0,0.12);
}
.gear-item-info { flex: 1; min-width: 0; }
.gear-item-name {
  font-weight: 700;
  color: var(--sfi-text);
  font-size: 0.95rem;
  margin-bottom: 2px;
}
.gear-item-spec {
  font-size: 0.8rem;
  color: var(--sfi-gold);
  font-weight: 600;
}
.gear-item-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
}
.gear-item-meta span {
  font-size: 0.75rem;
  color: var(--sfi-muted);
}
.gear-item-status {
  text-align: right;
  flex-shrink: 0;
}
.gear-status-tag {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.gear-status-tag.good { color: var(--sfi-green); background: rgba(63,185,80,0.12); }
.gear-status-tag.warn { color: var(--sfi-gold); background: rgba(240,165,0,0.12); }
.gear-status-tag.expired { color: var(--sfi-red); background: rgba(248,81,73,0.12); }
.gear-days-left {
  font-size: 0.75rem;
  color: var(--sfi-muted);
  margin-top: 4px;
}
.gear-item-del {
  background: none;
  border: none;
  color: var(--sfi-muted);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.gear-item-del:hover { color: var(--sfi-red); background: rgba(248,81,73,0.1); }

@media (max-width: 600px) {
  .gear-wrap { padding: 80px 16px 60px; }
  .gear-score-section { flex-direction: column; text-align: center; }
}

.gear-auth-banner {
  margin: 0 0 24px;
  padding: 12px 18px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  line-height: 1.55;
  border: 1px solid var(--sfi-border);
  background: rgba(22,27,39,0.7);
  color: var(--sfi-muted);
}
.gear-auth-banner.remote {
  border-color: rgba(63,185,80,0.3);
  background: rgba(63,185,80,0.06);
  color: var(--sfi-text);
}
.gear-auth-banner.local {
  border-color: rgba(240,165,0,0.35);
  background: rgba(240,165,0,0.06);
}
.gear-auth-banner a { color: var(--sfi-gold); font-weight: 600; text-decoration: none; }
.gear-auth-banner a:hover { text-decoration: underline; }
.gear-auth-banner strong { color: var(--sfi-text); }

/* Pending / rejected item states on the gear list */
.gear-item.status-pending { border-color: rgba(240,165,0,0.45); background: rgba(240,165,0,0.04); }
.gear-item.status-rejected { border-color: rgba(248,81,73,0.45); background: rgba(248,81,73,0.04); opacity: 0.8; }
.gear-status-tag.pending { color: var(--sfi-gold); border: 1px solid rgba(240,165,0,0.35); background: rgba(240,165,0,0.1); }
.gear-status-tag.rejected { color: var(--sfi-red); border: 1px solid rgba(248,81,73,0.35); background: rgba(248,81,73,0.08); }
.gear-review-note {
  margin-top: 4px;
  font-size: 0.72rem;
  color: var(--sfi-muted);
  font-style: italic;
}

</style>

<div class="gear-wrap">

  <!-- ═══════════ AUTH BANNER ═══════════ -->
  <div id="gearAuthBanner" class="gear-auth-banner"></div>

  <!-- ═══════════ MAIN CONTENT ═══════════ -->
  <div id="gearMain">

    <!-- ═══════════ SAFETY SCORE ═══════════ -->
    <div class="gear-score-section">
      <div class="gear-score-ring">
        <svg viewBox="0 0 160 160" width="160" height="160">
          <circle class="ring-bg" cx="80" cy="80" r="68"/>
          <circle class="ring-fill" id="scoreRing" cx="80" cy="80" r="68"
                  stroke="var(--sfi-gold)"
                  stroke-dasharray="427.3"
                  stroke-dashoffset="427.3"/>
        </svg>
        <div class="gear-score-val">
          <div class="gear-score-num" id="scoreNum">--</div>
          <div class="gear-score-label">Safety Score</div>
        </div>
      </div>
      <div class="gear-score-info">
        <h2>My Gear Tracker</h2>
        <p>
          Log your racing safety equipment with SFI spec numbers and certification dates.
          Track what's current, what's expiring soon, and what needs replacement.
          SFI certifications typically expire after 5 years.
        </p>
        <div class="gear-score-badges" id="scoreBadges"></div>
      </div>
    </div>

    <!-- ═══════════ ADD GEAR ═══════════ -->
    <div class="gear-add-bar">
      <input type="text" class="gear-name-input" id="gearName" placeholder="Equipment name (e.g. Simpson Diamondback)">
      <div class="gear-spec-wrap">
        <input type="text" class="gear-spec-input" id="gearSpec" placeholder="SFI Spec #" autocomplete="off">
        <div class="gear-autocomplete" id="gearAC"></div>
      </div>
      <input type="date" class="gear-date-input" id="gearDate" title="Certification / manufacture date">
      <button class="gear-add-btn" id="gearAddBtn">+ Add Gear</button>
    </div>

    <!-- ═══════════ GEAR LIST ═══════════ -->
    <div class="gear-list-header">
      <div class="gear-list-title" id="gearListTitle">My Equipment (0)</div>
      <button class="gear-sort-btn" id="gearSortBtn">Sort: <span id="sortLabel">Urgency</span></button>
    </div>

    <div id="gearList"></div>

  </div>
</div>

<!-- ── Scripts: each file has a single responsibility ── -->
<script src="{{ '/assets/js/sfi/quiz-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/quiz-ui.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/quiz-app.js' | relative_url }}"></script>
