---
layout: sfi
body_class: sfi-home
title: SFI Foundation
description: Standards for the quality assurance of specialty performance and racing equipment.
permalink: /
---
<section class="sfi-hero">
  <div class="sfi-hero-content">
    <div class="sfi-hero-copy">
      <p class="sfi-eyebrow">SFI Foundation · Established 1978</p>
      <h1>Safety Standards<br>for Motorsports</h1>
      <p class="sfi-hero-sub">A nonprofit developing and administering standards for the quality assurance of specialty performance and racing equipment.</p>
      <div class="sfi-hero-actions">
        <a href="{{ '/sfi-specs/' | relative_url }}" class="sfi-btn sfi-btn-primary">Find Specifications <span aria-hidden="true">&rarr;</span></a>
        <a href="{{ '/about/' | relative_url }}" class="sfi-btn sfi-btn-secondary">About SFI</a>
      </div>
    </div>
    <form class="sfi-home-search" action="{{ '/sfi-specs/' | relative_url }}" method="get" role="search" aria-labelledby="quick-search-heading">
      <h2 id="quick-search-heading">Find the standard you need</h2>
      <p>Search by specification number or equipment name.</p>
      <label for="homeQuery">Specification or equipment</label>
      <input class="sfi__field" id="homeQuery" name="q" type="search" maxlength="200" placeholder="e.g. 16.1 or driver suit">
      <button class="sfi__btn primary" type="submit">Search specifications</button>
      <a href="{{ '/sfi-specs/#categories' | relative_url }}">Browse equipment categories &rarr;</a>
    </form>
  </div>
</section>
<section class="sfi-sect" aria-labelledby="services-heading">
  <div class="sfi-section-heading"><h2 id="services-heading">Supporting motorsports safety</h2><a href="{{ '/services/' | relative_url }}">All services &rarr;</a></div>
  <div class="sfi-service-grid">
    <article class="sfi-panel"><span class="sfi-panel-number" aria-hidden="true">01</span><h3>Specification programs</h3><p>Quality assurance standards developed with manufacturers, sanctioning bodies, and technical experts.</p><a href="{{ '/sfi-specs/' | relative_url }}">Find specifications &rarr;</a></article>
    <article class="sfi-panel"><span class="sfi-panel-number" aria-hidden="true">02</span><h3>Testing &amp; certification</h3><p>Laboratory testing and technical programs for racing equipment and safety personnel.</p><a href="{{ '/services/' | relative_url }}">Explore services &rarr;</a></article>
    <article class="sfi-panel"><span class="sfi-panel-number" aria-hidden="true">03</span><h3>Technical assistance</h3><p>Questions about a specification, program participation, or a product label? Connect with SFI.</p><a href="{{ '/news-events/#contact' | relative_url }}">Contact SFI &rarr;</a></article>
  </div>
</section>
<section class="sfi-sect sfi-home-update" aria-labelledby="updates-heading">
  <div><p class="sfi-eyebrow">From SFI</p><h2 id="updates-heading">News &amp; safety updates</h2></div>
  {% assign news = site.data.sfi_updates.news | first %}
  {% if news %}<div><time datetime="{{ news.published | date_to_xmlschema }}">{{ news.published | date: '%B %-d, %Y' }}</time><h3><a href="{{ news.url | escape }}">{{ news.title | escape }}</a></h3></div>{% endif %}
  <a href="{{ '/news-events/' | relative_url }}">All news &amp; contact &rarr;</a>
</section>
