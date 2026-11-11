---
layout: sfi
title: Manufacturer management prototype
permalink: /sfi-manufacturer-demo/
---
<header class="sfi-page-header"><div class="sfi-page-header-content">
<h1>Manufacturer management <span class="gold">prototype</span></h1>
<p>Synthetic demonstration only. Every company, registration, revision and expiration below is fictional. These records do not represent certified manufacturers.</p>
</div></header>
<div class="sfi__container">
<p>This isolated prototype uses browser memory. Refresh resets edits. It does not read accounts, save records, schedule tasks, or send email or SMS.</p>
<p><a class="sfi__link" href="{{ '/sfi-specs/' | relative_url }}">Return to specification search</a></p>
<section class="sfi__section" aria-labelledby="demoHeading">
<h2 id="demoHeading" class="sfi__title">Sample manufacturer dashboard</h2>
<div id="demoControls" class="sfi__demo-controls">
<div class="sfi__demo-control"><label for="demoSearch">Search sample manufacturers or registrations</label><input id="demoSearch" type="search" class="sfi__field"></div>
<div class="sfi__demo-control"><label for="demoStatus">Status</label><select id="demoStatus" class="sfi__field"><option value="">All sample statuses</option><option>Current sample</option><option>Upcoming</option><option>Expires today</option><option>Overdue</option></select></div>
<div class="sfi__demo-control"><label for="demoInstant">Preview instant (ISO 8601 with timezone)</label><input id="demoInstant" class="sfi__field" type="text" aria-describedby="demoTimeHelp"></div>
<div class="sfi__demo-control"><label for="demoZone">Timezone</label><select id="demoZone" class="sfi__field"><option>America/Los_Angeles</option><option>America/New_York</option><option>UTC</option><option>Pacific/Auckland</option></select></div>
</div>
<p id="demoTimeHelp">Expiration dates are inclusive calendar dates in the selected timezone. A sample becomes overdue the following local day.</p>
<p id="demoError" role="alert"></p><p id="demoSummary" role="status" aria-live="polite"></p>
<div id="demoRows" class="sfi__demo-grid"></div>
</section>
<section class="sfi__section" aria-labelledby="noticeHeading">
<h2 id="noticeHeading" class="sfi__title">Reminder configuration prototype</h2>
<p>Intervals apply only to these fictional registrations. Real schedules must come from reviewed manufacturer or product requirements. Turn off any interval independently, including the six-month notice.</p>
<fieldset id="demoIntervals"><legend>Enabled notice intervals</legend>
<div class="sfi__demo-controls">
<div class="sfi__interval">
<label for="interval-six"><input id="interval-six" type="checkbox" checked> Calendar-month notice enabled</label>
<label for="value-six">Calendar-month notice interval (months)</label>
<input class="sfi__field" id="value-six" type="number" min="1" max="24" step="1" value="6" required aria-describedby="help-six error-six">
<small id="help-six">Enter 1–24 whole months.</small><span id="error-six" class="sfi__input-error"></span>
</div>
<div class="sfi__interval">
<label for="interval-ninety"><input id="interval-ninety" type="checkbox" checked> 90-day notice enabled</label>
<label for="value-ninety">90-day notice interval (days)</label>
<input class="sfi__field" id="value-ninety" type="number" min="1" max="730" step="1" value="90" required aria-describedby="help-ninety error-ninety">
<small id="help-ninety">Enter 1–730 whole days.</small><span id="error-ninety" class="sfi__input-error"></span>
</div>
<div class="sfi__interval">
<label for="interval-thirty"><input id="interval-thirty" type="checkbox" checked> 30-day notice enabled</label>
<label for="value-thirty">30-day notice interval (days)</label>
<input class="sfi__field" id="value-thirty" type="number" min="1" max="730" step="1" value="30" required aria-describedby="help-thirty error-thirty">
<small id="help-thirty">Enter 1–730 whole days.</small><span id="error-thirty" class="sfi__input-error"></span>
</div>
<div class="sfi__interval">
<label for="interval-seven"><input id="interval-seven" type="checkbox" checked> 7-day notice enabled</label>
<label for="value-seven">7-day notice interval (days)</label>
<input class="sfi__field" id="value-seven" type="number" min="1" max="730" step="1" value="7" required aria-describedby="help-seven error-seven">
<small id="help-seven">Enter 1–730 whole days.</small><span id="error-seven" class="sfi__input-error"></span>
</div>
</div></fieldset>
<p>Month intervals use calendar months, clamping to the last day when needed. Previews include all enabled intervals whose threshold has been reached. Overdue samples have a separate preview.</p>
<h3>Upcoming and overdue samples</h3><ul id="demoUpcoming"></ul>
<h3>Notification message previews</h3><ul id="demoMessages"></ul>
</section></div>
<script src="{{ '/assets/js/sfi/manufacturer-demo.js' | relative_url }}"></script>
