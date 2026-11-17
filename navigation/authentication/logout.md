---
layout: sfi
title: Sign Out
permalink: /logout/
search_exclude: true
---
<section class="sfi-profile">
  <div class="sfi-profile-card">
    <h1>Sign Out</h1>
    <p id="signOutStatus" role="status" aria-live="polite">Signing out of SFI Foundation…</p>
    <button id="signOutRetry" type="button" hidden>Try again</button>
    <p><a href="{{ '/login/' | relative_url }}">Return to Sign In</a></p>
  </div>
</section>
<script type="module" src="{{ '/assets/js/sfi/logout.js' | relative_url }}"></script>
