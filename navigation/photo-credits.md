---
layout: sfi
title: Photography credits
description: Sources and reuse licenses for photography on the SFI Foundation website.
permalink: /photo-credits/
search_exclude: true
---
<header class="sfi-page-header"><div class="sfi-page-header-content">
  <h1>Photography credits</h1>
  <p>Real motorsports photography, used under the licenses below.</p>
</div></header>
<section class="sfi-sect sfi-prose sfi-photo-credits" aria-label="Photo sources and licenses">
  <p>These photographs illustrate motorsports and protective equipment. They do not establish SFI certification, endorsement, or participation in the pictured activities. Event photographs are independent of the news announcements on this site.</p>
  {% for entry in site.data.sfi_photography %}
  {% assign photo = entry[1] %}
  <article id="{{ photo.id }}">
    <h2>{{ photo.title | escape }}</h2>
    <p>Photograph by <strong>{{ photo.photographer | escape }}</strong>.{% if photo.original_title %} Original title: {{ photo.original_title | escape }}.{% endif %} <a href="{{ photo.source | escape }}">Original source and attribution</a> · <a href="{{ photo.license_url | escape }}">{{ photo.license | escape }}</a>.</p>
    <p>{{ photo.caption | escape }} {% if photo.date_note %}{{ photo.date_note | escape }}{% endif %}</p>
    <p>{{ photo.modifications | escape }} These image derivatives are distributed under {{ photo.license | escape }}, separately from the website code.</p>
  </article>
  {% endfor %}
</section>
