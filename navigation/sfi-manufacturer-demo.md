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
<label>Search sample manufacturers or registrations <input id="demoSearch" type="search" class="sfi__field"></label>
<label>Status <select id="demoStatus" class="sfi__field"><option value="">All sample statuses</option><option>Current sample</option><option>Upcoming</option><option>Expires today</option><option>Overdue</option></select></label>
<label>Preview instant (ISO 8601 with timezone) <input id="demoInstant" class="sfi__field" type="text" aria-describedby="demoTimeHelp"></label>
<label>Timezone <select id="demoZone" class="sfi__field"><option>America/Los_Angeles</option><option>America/New_York</option><option>UTC</option><option>Pacific/Auckland</option></select></label>
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
<label><span><input id="interval-six" type="checkbox" checked> Calendar-month notice enabled (default six)</span><span>Months <input id="value-six" type="number" min="1" max="24" value="6"></span></label>
<label><span><input id="interval-ninety" type="checkbox" checked> 90-day notice enabled</span><span>Days <input id="value-ninety" type="number" min="1" max="730" value="90"></span></label>
<label><span><input id="interval-thirty" type="checkbox" checked> 30-day notice enabled</span><span>Days <input id="value-thirty" type="number" min="1" max="730" value="30"></span></label>
<label><span><input id="interval-seven" type="checkbox" checked> 7-day notice enabled</span><span>Days <input id="value-seven" type="number" min="1" max="730" value="7"></span></label>
</div></fieldset>
<p>Month intervals use calendar months, clamping to the last day when needed. Previews include all enabled intervals whose threshold has been reached. Overdue samples have a separate preview.</p>
<h3>Upcoming and overdue samples</h3><ul id="demoUpcoming"></ul>
<h3>Notification message previews</h3><ul id="demoMessages"></ul>
</section></div>
<script src="{{ '/assets/js/sfi/manufacturer-demo.js' | relative_url }}"></script>
