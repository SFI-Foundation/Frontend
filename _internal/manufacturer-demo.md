---
layout: sfi
title: Manufacturer Dashboard
body_class: sfi-manufacturer-dashboard
permalink: /sfi-manufacturer-demo/
---
<div class="sfi-demo">
  <header class="sfi-demo-heading">
    <div><h1>Manufacturer Dashboard</h1></div>
    <button id="demoReset" class="sfi-btn sfi-btn-outline" type="button">Reset demo</button>
  </header>
  <p class="sfi-demo-notice">Fictional Apex Safety Lab records and illustrative tests. Reminders are previews only; nothing is saved or sent.</p>
  <div class="sfi-demo-workspace">
    <section class="sfi-demo-models" aria-labelledby="demoHeading">
      <div class="sfi-demo-section-heading"><h2 id="demoHeading">Product models</h2><span id="demoCount"></span></div>
      <div id="demoFilters" class="sfi-demo-filters">
        <label for="demoSearch">Search models<input id="demoSearch" type="search" class="sfi__field" placeholder="Model, spec or registration"></label>
        <label for="demoStatus">Certification status<select id="demoStatus" class="sfi__field"><option value="">All statuses</option><option value="Current sample">Current</option><option>Upcoming</option><option>Expires today</option><option>Overdue</option></select></label>
      </div>
      <p class="sfi-demo-list-labels" aria-hidden="true"><span>Model / applicable spec</span><span>Status / expiration</span></p>
      <ul id="demoRows" class="sfi-demo-list" aria-label="Product models"></ul>
      <p id="demoSummary" class="sfi-demo-summary" role="status" aria-live="polite"></p>
    </section>
    <section id="demoDetails" class="sfi-demo-details" aria-labelledby="demoModelHeading">
      <div id="demoModelDetails"></div>
      <section class="sfi-demo-reminders" aria-labelledby="boardNoticeHeading">
        <h3 id="boardNoticeHeading">Expiration reminder previews</h3>
        <div id="demoBoardMessages"></div>
      </section>
    </section>
  </div>
  <p id="demoError" role="alert"></p>
  <details id="demoControlsDisclosure" class="sfi-demo-disclosure">
    <summary>Demo controls <span>Simulated date, timezone &amp; expiration</span></summary>
    <div id="demoControls" class="sfi-demo-control-grid">
      <label for="demoInstant">Simulated date and time (ISO 8601)<input id="demoInstant" class="sfi__field" type="text" aria-describedby="demoTimeHelp"></label>
      <label for="demoZone">Timezone<select id="demoZone" class="sfi__field"><option>America/Los_Angeles</option><option>America/New_York</option><option>UTC</option><option>Pacific/Auckland</option></select></label>
      <label for="demoExpiration">Selected model expiration<input id="demoExpiration" class="sfi__field" type="date" required></label>
    </div>
    <p id="demoTimeHelp">Include Z or a timezone offset in the simulated time. Expiration is inclusive in the selected timezone; overdue starts the following day. Reset demo restores all sample dates and filters.</p>
<details class="sfi-demo-advanced"><summary>Advanced reminder interval sandbox</summary>
<section class="sfi__section" aria-labelledby="noticeHeading">
<h2 id="noticeHeading" class="sfi__title">Reminder configuration prototype</h2>
<p>Advanced interval previews are disabled by default. The three board-review previews above remain visible. These additional intervals apply only to fictional registrations. Real schedules must come from reviewed manufacturer or product requirements. Turn off any interval independently, including the six-month notice.</p>
<fieldset id="demoIntervals"><legend>Enabled notice intervals</legend>
<div class="sfi__demo-controls">
<div class="sfi__interval">
<label for="interval-six"><input id="interval-six" type="checkbox"> Calendar-month notice enabled</label>
<label for="value-six">Calendar-month notice interval (months)</label>
<input class="sfi__field" id="value-six" type="number" min="1" max="24" step="1" value="6" required aria-describedby="help-six error-six">
<small id="help-six">Enter 1–24 whole months.</small><span id="error-six" class="sfi__input-error"></span>
</div>
<div class="sfi__interval">
<label for="interval-ninety"><input id="interval-ninety" type="checkbox"> 90-day notice enabled</label>
<label for="value-ninety">90-day notice interval (days)</label>
<input class="sfi__field" id="value-ninety" type="number" min="1" max="730" step="1" value="90" required aria-describedby="help-ninety error-ninety">
<small id="help-ninety">Enter 1–730 whole days.</small><span id="error-ninety" class="sfi__input-error"></span>
</div>
<div class="sfi__interval">
<label for="interval-thirty"><input id="interval-thirty" type="checkbox"> 30-day notice enabled</label>
<label for="value-thirty">30-day notice interval (days)</label>
<input class="sfi__field" id="value-thirty" type="number" min="1" max="730" step="1" value="30" required aria-describedby="help-thirty error-thirty">
<small id="help-thirty">Enter 1–730 whole days.</small><span id="error-thirty" class="sfi__input-error"></span>
</div>
<div class="sfi__interval">
<label for="interval-seven"><input id="interval-seven" type="checkbox"> 7-day notice enabled</label>
<label for="value-seven">7-day notice interval (days)</label>
<input class="sfi__field" id="value-seven" type="number" min="1" max="730" step="1" value="7" required aria-describedby="help-seven error-seven">
<small id="help-seven">Enter 1–730 whole days.</small><span id="error-seven" class="sfi__input-error"></span>
</div>
</div></fieldset>
<p>Month intervals use calendar months, clamping to the last day when needed. Previews include all enabled intervals whose threshold has been reached. Overdue samples have a separate preview.</p>
<h3>Upcoming and overdue samples</h3><ul id="demoUpcoming"></ul>
<h3>Notification message previews</h3><ul id="demoMessages"></ul>
</section></details>
  </details>
  <details class="sfi-demo-disclosure">
    <summary>About retesting &amp; recertification</summary>
    <p>Manufacturer retesting and certification expiration apply to a model record. A racer's product recertification period applies to an individual item and is a separate requirement. Dates and test mappings here are illustrative; renewal rules await SFI confirmation.</p>
    <p>Reminder timing uses two calendar months (clamped at month end), 14 calendar days, and the expiration date itself. These previews do not create testing appointments.</p>
  </details>
</div>
<script src="{{ '/_internal/manufacturer-demo.js' | relative_url }}"></script>
