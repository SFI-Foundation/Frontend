---
layout: sfi
title: News & Events
nav_title: News & Events
description: Official SFI announcements and upcoming specification review meetings.
permalink: /news-events/
---
<header class="sfi-page-header">
  <div class="sfi-page-header-content">
    <h1><span class="gold">News</span> &amp; Events</h1>
    <p>Updates from SFI and upcoming specification review meetings.</p>
  </div>
</header>
<div class="sfi-sect sfi-two-grid sfi-news-grid">
  <section aria-labelledby="latest-news">
    <h2 id="latest-news">Latest announcements</h2>
    <ul class="sfi-news-list">
      {% for news in site.data.sfi_updates.news limit:3 %}
      <li>
        <time datetime="{{ news.published | date_to_xmlschema }}">{{ news.published | date: '%B %-d, %Y' }}</time>
        <h3><a href="{{ news.url | escape }}">{{ news.title | escape }}</a></h3>
      </li>
      {% endfor %}
    </ul>
    <p><a href="https://sfifoundation.com/blog/">More official SFI announcements &rarr;</a></p>
  </section>
  <section aria-labelledby="upcoming-meetings">
    <h2 id="upcoming-meetings">Upcoming meetings</h2>
    {% assign today = 'now' | date: '%Y-%m-%d' %}
    {% assign meeting_count = 0 %}
    {% for event in site.data.sfi_updates.events %}
      {% if event.start >= today %}
        {% assign meeting_count = meeting_count | plus: 1 %}
        <article class="sfi-event-row">
          <time datetime="{{ event.start | escape }}">{{ event.date_label | escape }}</time>
          <h3>{{ event.title | escape }}</h3>
          <p>{{ event.location | escape }}</p>
          <a href="{{ event.url | escape }}">Confirm sessions and location &rarr;</a>
        </article>
      {% endif %}
    {% endfor %}
    {% if meeting_count == 0 %}
      <p>No upcoming meetings are listed in the current update. Check the official schedule for the latest dates.</p>
    {% endif %}
    <p><a href="https://sfifoundation.com/meeting-schedule/">Official meeting schedule &rarr;</a></p>
    <p><a href="https://sfifoundation.com/notices/">Safety notices &amp; product alerts &rarr;</a></p>
  </section>
</div>
