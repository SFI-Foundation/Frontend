---
layout: sfi
title: SFI News & Events
description: Latest SFI Foundation announcements, upcoming meetings and capstone events.
permalink: /news-events/
---

<header class="sfi-page-header">
  <div class="sfi-page-header-content">
    <h1>SFI <span class="gold">News &amp; Events</span></h1>
    <p>Upcoming meetings, recent announcements and events connected to our SFI Foundation capstone project.</p>
  </div>
</header>

<div class="sfi__container">
  <section class="sfi__section" aria-labelledby="capstone-about">
    <h2 class="sfi__title" id="capstone-about">Our Capstone Partnership</h2>
    <p>We are serving the SFI Foundation as part of our capstone project, building tools and experiences to make motorsports safety information easier to explore. This is a student capstone project; for official SFI announcements, always consult <a href="https://sfifoundation.com/">sfifoundation.com</a>.</p>
  </section>

  <section class="sfi__section" aria-labelledby="upcoming-events">
    <h2 class="sfi__title" id="upcoming-events">Upcoming SFI events</h2>
    <p>Meeting dates are automatically checked against the official <a href="https://sfifoundation.com/meeting-schedule/">SFI meeting schedule</a> each day. Confirm times and locations there before attending.</p>
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
  </section>

  <section class="sfi__section" aria-labelledby="capstone-events">
    <h2 class="sfi__title" id="capstone-events">Capstone demos &amp; N@TM events</h2>
    <p>Our team can publish Night at the Museum (N@TM) demos and other capstone presentations here as dates are confirmed.</p>
    {% assign capstone_count = 0 %}
    {% for event in site.data.sfi_capstone_events %}
      {% if event.date >= today %}
        {% assign capstone_count = capstone_count | plus: 1 %}
        <article class="sfi__card">
          <h3>{{ event.title | escape }}</h3>
          <p><strong>{{ event.date | escape }}</strong> &middot; {{ event.location | escape }}</p>
          <p>{{ event.description | escape }}</p>
        </article>
      {% endif %}
    {% endfor %}
    {% if capstone_count == 0 %}
      <p>No capstone demo date has been confirmed for this listing yet.</p>
    {% endif %}
  </section>

  <section class="sfi__section" aria-labelledby="recent-announcements">
    <h2 class="sfi__title" id="recent-announcements">Latest SFI announcements</h2>
    {% for news in site.data.sfi_updates.news limit:8 %}
      <article class="sfi__card">
        <h3>{{ news.title | escape }}</h3>
        <p>{{ news.published | escape }}</p>
        <p><a class="sfi__link" href="{{ news.url | escape }}">Read on the official SFI site &rarr;</a></p>
      </article>
    {% endfor %}
    <p><a class="sfi__link" href="https://sfifoundation.com/blog/">Explore all SFI news &rarr;</a></p>
  </section>

  <section class="sfi__section">
    <h2 class="sfi__title">Safety notices &amp; resources</h2>
    <p><a class="sfi__link" href="https://sfifoundation.com/notices/">Official SFI safety notices &rarr;</a></p>
    <p><a class="sfi__link" href="https://sfifoundation.com/articles/">Technical and safety articles &rarr;</a></p>
  </section>
</div>
