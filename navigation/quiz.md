---
layout: sfi
title: My Gear
description: Track your racing safety equipment, SFI certifications, and expiration dates.
permalink: /quiz/
---


<header class="sfi-page-header">
  <div class="sfi-page-header-content">
    <h1>My <span class="gold">Gear</span></h1>
    <p>Track your racing safety equipment, SFI spec numbers and certification dates.</p>
  </div>
</header>

<div class="sfi__gear">

  <div id="gearAuthBanner" class="sfi__notice"></div>

  <div id="gearMain">

    <section class="sfi__score">
      <div class="sfi__score-ring">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <circle class="track" cx="80" cy="80" r="68"/>
          <circle class="value" id="scoreRing" cx="80" cy="80" r="68"
                  stroke-dasharray="427.3" stroke-dashoffset="427.3"/>
        </svg>
        <div class="sfi__score-number">
          <span id="scoreNum">--</span>
          <small>Safety score</small>
        </div>
      </div>
      <div class="sfi__score-info">
        <h2 class="sfi__title">Gear tracker</h2>
        <p class="sfi__lead">Log your equipment with SFI spec numbers and certification dates to see what is current, what is expiring soon and what needs replacing. SFI certifications typically expire after five years.</p>
        <div class="sfi__score-badges" id="scoreBadges"></div>
      </div>
    </section>

    <form class="sfi__gear-form" onsubmit="return false">
      <input type="text" class="sfi__field" id="gearName" placeholder="Equipment name (e.g. Simpson Diamondback)" aria-label="Equipment name">
      <div class="sfi__autocomplete">
        <input type="text" class="sfi__field" id="gearSpec" placeholder="SFI spec #" autocomplete="off" aria-label="SFI spec number">
        <div class="sfi__autocomplete-list" id="gearAC"></div>
      </div>
      <input type="date" class="sfi__field" id="gearDate" title="Certification / manufacture date" aria-label="Certification date">
      <button type="button" class="sfi__btn primary" id="gearAddBtn">Add gear</button>
    </form>

    <div class="sfi__gear-head">
      <h2 class="sfi__subtitle" id="gearListTitle">My equipment (0)</h2>
      <button type="button" class="sfi__btn small" id="gearSortBtn">Sort: <span id="sortLabel">Urgency</span></button>
    </div>

    <div id="gearList"></div>

  </div>
</div>

<!-- ── Scripts: each file has a single responsibility ── -->
<script src="{{ '/assets/js/sfi/quiz-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/quiz-ui.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/quiz-app.js' | relative_url }}"></script>
