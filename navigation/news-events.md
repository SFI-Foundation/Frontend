---
layout: sfi
title: News & Contact
nav_title: News & Contact
description: SFI announcements, specification review meetings and contact information.
permalink: /news-events/
---
<header class="sfi-page-header"><div class="sfi-page-header-content"><p class="sfi-eyebrow">Stay connected</p><h1>News &amp; Contact</h1><p>Updates from SFI and direct help with specifications, testing, and certification.</p></div></header>
<div class="sfi-sect sfi-content-grid">
  <div>
    <section aria-labelledby="recent-announcements"><h2 id="recent-announcements">Latest announcements</h2><ul class="sfi-news-list">
    {% for news in site.data.sfi_updates.news limit:3 %}<li><time datetime="{{ news.published | date_to_xmlschema }}">{{ news.published | date: '%B %-d, %Y' }}</time><h3><a href="{{ news.url | escape }}">{{ news.title | escape }}</a></h3></li>{% endfor %}
    </ul><p><a href="https://sfifoundation.com/blog/">All official SFI news &rarr;</a></p></section>
    <section aria-labelledby="upcoming-events"><h2 id="upcoming-events">Specification review meetings</h2>
    {% assign today = 'now' | date: '%Y-%m-%d' %}
    {% assign count = 0 %}
    {% for event in site.data.sfi_updates.events %}
      {% if event.start >= today %}
        {% assign count = count | plus: 1 %}
        <article class="sfi__card">
          <h3>{{ event.title | escape }}</h3>
          <p><strong>{{ event.date_label | escape }}</strong> &middot; {{ event.location | escape }}</p>
          <p><a class="sfi__link" href="{{ event.url | escape }}">Confirm official schedule &rarr;</a></p>
        </article>
      {% endif %}
    {% endfor %}
    {% if count == 0 %}
      <p>No upcoming official SFI meetings are currently listed. Check the official meeting schedule for new announcements.</p>
    {% endif %}

    <p><a href="https://sfifoundation.com/meeting-schedule/">Confirm the official meeting schedule &rarr;</a></p></section>
    {% assign today = 'now' | date: '%Y-%m-%d' %}
    {% for event in site.data.sfi_capstone_events %}{% if event.date >= today %}<article class="sfi-panel"><h3>{{ event.title | escape }}</h3><p>{{ event.date | escape }} · {{ event.location | escape }}</p><p>{{ event.description | escape }}</p></article>{% endif %}{% endfor %}
  </div>
  <section id="contact" class="sfi-panel sfi-contact-panel" aria-labelledby="contact-heading"><p class="sfi-eyebrow">Get in touch</p><h2 id="contact-heading">Contact SFI</h2><p>For specification questions, testing, program participation, or suspected counterfeit labels.</p><address><a href="mailto:sfi@sfifoundation.com">sfi@sfifoundation.com</a><br><a href="tel:+18584518868">(858) 451-8868</a><p>15708 Pomerado Road<br>Suite N208<br>Poway, CA 92064</p><span>Fax: (858) 451-9268</span></address><p><a href="https://sfifoundation.com/notices/">Official safety notices &rarr;</a></p></section>
</div>
