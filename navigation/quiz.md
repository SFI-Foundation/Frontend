---
layout: opencs
title: My Gear
description: Track your racing safety equipment, SFI certifications, and expiration dates.
permalink: /quiz/
---

<div class="ocs__container">

  <!-- ═══════════ AUTH BANNER ═══════════ -->
  <div id="gearAuthBanner" class="ocs__callout"></div>

  <!-- ═══════════ MAIN CONTENT ═══════════ -->
  <div id="gearMain">

    <!-- ═══════════ SAFETY SCORE ═══════════ -->
    <h1>My Gear Tracker</h1>
    <p class="ocs__description">
      Log your racing safety equipment with SFI spec numbers and certification dates.
      Track what's current, what's expiring soon, and what needs replacement.
      SFI certifications typically expire after 5 years.
    </p>
    <div class="ocs__stats">
      <div class="ocs__stat">
        <span class="ocs__stat-value" id="scoreNum">--</span>
        <span class="ocs__stat-label">Safety Score</span>
        <progress id="scoreRing" value="0" max="100"></progress>
      </div>
    </div>
    <div class="ocs__links" id="scoreBadges"></div>

    <!-- ═══════════ ADD GEAR ═══════════ -->
    <div class="ocs__card">
      <div class="ocs__links">
        <input type="text" class="ocs__input" id="gearName" placeholder="Equipment name (e.g. Simpson Diamondback)">
        <input type="text" class="ocs__input" id="gearSpec" placeholder="SFI Spec #" autocomplete="off">
        <input type="date" class="ocs__input" id="gearDate" title="Certification / manufacture date">
        <button class="ocs__btn accent fill" id="gearAddBtn">+ Add Gear</button>
      </div>
      <ul class="ocs__entity-list" id="gearAC" hidden></ul>
    </div>

    <!-- ═══════════ GEAR LIST ═══════════ -->
    <h2 class="ocs__section-title" id="gearListTitle">My Equipment (0)</h2>
    <button class="ocs__btn pill small" id="gearSortBtn">Sort: <span id="sortLabel">Urgency</span></button>

    <div id="gearList"></div>

  </div>
</div>

<!-- ── Scripts: each file has a single responsibility ── -->
<script src="{{ '/assets/js/sfi/quiz-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/quiz-ui.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/quiz-app.js' | relative_url }}"></script>
