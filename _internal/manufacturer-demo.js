/* Isolated, synthetic-only prototype. No account, storage, notification or API access. */
(function (root) {
  'use strict';
  const DAY = 86400000;
  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Use a valid YYYY-MM-DD date.');
    const instant = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(+instant) || instant.toISOString().slice(0, 10) !== value) throw new Error('Invalid calendar date.');
    return instant;
  }
  const iso = value => value.toISOString().slice(0, 10);
  function todayInZone(instant, zone) {
    if (typeof instant === 'string' && !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(instant)) throw new Error('Include a timezone offset or Z in the preview instant.');
    const date = new Date(instant);
    if (!Number.isFinite(+date)) throw new Error('Invalid preview instant.');
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  function thresholdDate(expiration, interval) {
    const target = parseDate(expiration);
    if (interval.months != null) {
      if (!Number.isInteger(interval.months) || interval.months < 1 || interval.months > 24) throw new Error('Months must be 1–24.');
      const day = target.getUTCDate();
      target.setUTCDate(1); target.setUTCMonth(target.getUTCMonth() - interval.months);
      const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
      target.setUTCDate(Math.min(day, last));
    } else {
      if (!Number.isInteger(interval.days) || interval.days < 1 || interval.days > 730) throw new Error('Days must be 1–730.');
      target.setUTCDate(target.getUTCDate() - interval.days);
    }
    return iso(target);
  }
  function evaluate(record, today, intervals) {
    const days = Math.round((parseDate(record.expires) - parseDate(today)) / DAY);
    const notices = intervals.filter(i => i.enabled && today >= thresholdDate(record.expires, i) && days >= 0);
    return { ...record, days, status: days < 0 ? 'Overdue' : days === 0 ? 'Expires today' : notices.length ? 'Upcoming' : 'Current sample', notices };
  }
  function sampleRecords() {
    const record = (id, model, spec, expires, nextRetest, tests) => ({
      id, model, manufacturer: 'Fictional Apex Safety Lab', spec,
      revision: 'Fictional certification record', expires, nextRetest,
      recipient: 'quality@example.invalid', tests
    });
    return [
      record('DEMO-001', 'Apex Glove G1', '3.3', '2027-03-31', '2027-02-15', [
        { name: 'Thermal performance', status: 'Passed (sample)' },
        { name: 'Flame resistance', status: 'Pending (sample)' },
        { name: 'Seam integrity', status: 'Retest required (sample)' }
      ]),
      record('DEMO-002', 'Apex Clutch C1', '1.1', '2026-11-20', '2026-11-10', [
        { name: 'Rotational performance', status: 'Retest required (sample)' }
      ]),
      record('DEMO-003', 'Apex Glove G2', '3.3', '2027-08-31', '2027-07-15', [
        { name: 'Thermal performance', status: 'Passed (sample)' },
        { name: 'Flame resistance', status: 'Passed (sample)' }
      ]),
      record('DEMO-004', 'Apex Flywheel F1', '1.1', '2028-01-31', '2027-12-15', [
        { name: 'Rotational performance', status: 'Pending (sample)' }
      ]),
      record('DEMO-005', 'Apex Glove G3', '3.3', '2026-11-25', '2026-11-01', [
        { name: 'Thermal performance', status: 'Pending (sample)' }
      ])
    ];
  }
  function reminderPreviews(record) {
    return [
      { label: 'Two calendar months before expiration', date: thresholdDate(record.expires, { months: 2 }) },
      { label: 'Two weeks before expiration', date: thresholdDate(record.expires, { days: 14 }) },
      { label: 'On the expiration date', date: iso(parseDate(record.expires)) }
    ].map(notice => ({ ...notice, model: record.model, expires: record.expires,
      recipient: record.recipient,
      message: `PREVIEW ONLY: ${record.manufacturer}, the fictional manufacturer certification record ${record.id} for ${record.model} ${notice.date === record.expires ? 'expires today' : 'will expire'} on ${record.expires}. Please review the model's required tests and contact SFI about renewal requirements. This is illustrative; no message has been sent.`
    }));
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function mount(doc = root.document) {
    const el = id => doc.getElementById(id);
    const defaultInstant = '2026-11-25T20:00:00.000Z';
    let records = sampleRecords(), selectedId = 'DEMO-001';
    const intervals = [
      { id: 'six', months: 6, enabled: false }, { id: 'ninety', days: 90, enabled: false },
      { id: 'thirty', days: 30, enabled: false }, { id: 'seven', days: 7, enabled: false }
    ];
    const dateLabel = date => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(parseDate(date));
    const time = date => `<time datetime="${date}">${dateLabel(date)}</time>`;
    const statusLabel = status => status.replace(' (sample)', '').replace('Current sample', 'Current');
    const badge = status => `<span class="sfi-demo-status ${status.startsWith('Passed') || status === 'Current sample' ? 'is-good' : status.startsWith('Retest') || status === 'Overdue' ? 'is-bad' : 'is-pending'}">${escape(statusLabel(status))}</span>`;
    function renderDetails(record) {
      el('demoDetails').hidden = !record;
      el('demoExpiration').disabled = !record;
      if (!record) { el('demoExpiration').value = ''; return; }
      el('demoExpiration').value = record.expires;
      el('demoExpiration').setAttribute('aria-label', `Selected model expiration: ${record.model}`);
      el('demoModelDetails').innerHTML = `<div class="sfi-demo-section-heading"><div><p class="sfi-demo-eyebrow">Selected model · ${record.id}</p><h2 id="demoModelHeading">${escape(record.model)}</h2></div>${badge(record.status)}</div>
        <p class="sfi-demo-spec">Applicable specification <strong>SFI ${escape(record.spec)}</strong></p>
        <dl class="sfi-demo-dates"><div><dt>Next manufacturer retest</dt><dd>${time(record.nextRetest)}</dd></div><div><dt>Certification expiration</dt><dd>${time(record.expires)}</dd></div></dl>
        <table class="sfi-demo-tests"><caption>Required tests <span>(illustrative)</span></caption><thead><tr><th scope="col">Test</th><th scope="col">Status</th></tr></thead><tbody>${record.tests.map(t => `<tr><th scope="row">${escape(t.name)}</th><td>${badge(t.status)}</td></tr>`).join('')}</tbody></table>`;
      el('demoBoardMessages').innerHTML = reminderPreviews(record).map(n => `<details class="sfi-demo-reminder"><summary><span>${escape(n.label)}</span>${time(n.date)}<span class="sfi-demo-message-label">Message</span></summary><div class="sfi-demo-message"><p><strong>Fictional recipient:</strong> ${escape(n.recipient)}</p><p>${escape(n.message)}</p></div></details>`).join('');
    }
    function render() {
      try {
        const today = todayInZone(el('demoInstant').value, el('demoZone').value);
        el('demoInstant').setAttribute('aria-invalid', 'false');
        let invalid = false;
        for (const i of intervals) {
          i.enabled = el('interval-' + i.id).checked;
          const input = el('value-' + i.id);
          input.disabled = !i.enabled;
          const value = Number(input.value);
          const valid = !i.enabled || (input.value !== '' && input.checkValidity());
          input.setAttribute('aria-invalid', String(!valid));
          el('error-' + i.id).textContent = valid ? '' : `Enter a whole number from ${input.min} to ${input.max}.`;
          invalid ||= !valid;
          if (i.months != null) i.months = value; else i.days = value;
          if (i.enabled && valid) thresholdDate(today, i);
        }
        if (invalid) {
          el('demoMessages').replaceChildren(); el('demoUpcoming').replaceChildren();
          throw new Error('Correct the highlighted reminder intervals to update previews.');
        }
        const all = records.map(r => evaluate(r, today, intervals)).sort((a, b) => a.expires.localeCompare(b.expires) || a.id.localeCompare(b.id));
        const q = el('demoSearch').value.trim().toLowerCase(), status = el('demoStatus').value;
        const visible = all.filter(r => (!q || `${r.manufacturer} ${r.model} ${r.spec} ${r.id}`.toLowerCase().includes(q)) && (!status || r.status === status));
        if (visible.length && !visible.some(r => r.id === selectedId)) selectedId = visible[0].id;
        el('demoCount').textContent = `${visible.length} / ${all.length}`;
        el('demoSummary').textContent = `${visible.length} of ${all.length} models. Simulated date: ${dateLabel(today)} (${el('demoZone').value}).`;
        const focusedId = doc.activeElement?.dataset.modelId;
        el('demoRows').innerHTML = visible.map(r => `<li><button type="button" data-model-id="${r.id}" aria-pressed="${r.id === selectedId}" aria-controls="demoDetails"><span class="sfi-demo-model-name"><strong>${escape(r.model)}${r.id === selectedId ? ' <span class="sfi-demo-selection" aria-hidden="true">✓</span>' : ''}</strong><span>SFI ${escape(r.spec)} · ${r.id}</span></span><span class="sfi-demo-model-state">${badge(r.status)}${time(r.expires)}</span></button></li>`).join('') || '<li class="sfi-demo-empty">No models match. Change the filters or reset the demo.</li>';
        if (focusedId) el('demoRows').querySelector(`[data-model-id="${focusedId}"]`)?.focus();
        renderDetails(visible.find(r => r.id === selectedId));
        el('demoUpcoming').innerHTML = all.filter(r => r.days <= 0 || r.notices.length).map(r => `<li>${escape(r.model)} — ${escape(r.expires)}: ${escape(r.status)}</li>`).join('') || '<li>No upcoming or overdue samples under these intervals.</li>';
        el('demoMessages').innerHTML = !intervals.some(i => i.enabled) ? '<li>Reminder previews are disabled. No notifications are sent.</li>' : all.flatMap(r => r.days < 0 ? [`<li>PREVIEW ONLY: ${escape(r.manufacturer)}, sample ${escape(r.id)} expired on ${r.expires}. Please review this fictional registration.</li>`] : r.notices.map(i => `<li>PREVIEW ONLY (${i.months != null ? i.months + ' months' : i.days + ' days'}): ${escape(r.manufacturer)}, sample ${escape(r.id)} expires on ${r.expires}. Please review the sample registration. No notification has been sent.</li>`)).join('') || '<li>No enabled notice is due.</li>';
        el('demoError').textContent = '';
      } catch (error) {
        try { todayInZone(el('demoInstant').value, el('demoZone').value); }
        catch { el('demoInstant').setAttribute('aria-invalid', 'true'); }
        el('demoError').textContent = error.message;
      }
    }
    function reset() {
      records = sampleRecords(); selectedId = 'DEMO-001';
      el('demoSearch').value = ''; el('demoStatus').value = '';
      el('demoInstant').value = defaultInstant; el('demoZone').value = 'America/Los_Angeles';
      el('demoExpiration').setAttribute('aria-invalid', 'false');
      for (const [index, i] of intervals.entries()) {
        el('interval-' + i.id).checked = false;
        el('value-' + i.id).value = [6, 90, 30, 7][index];
      }
      el('demoControlsDisclosure').querySelectorAll('details').forEach(d => { d.open = false; });
      render();
    }
    for (const id of ['demoFilters', 'demoIntervals']) el(id).addEventListener('input', render);
    for (const id of ['demoInstant', 'demoZone']) el(id).addEventListener('input', render);
    el('demoRows').addEventListener('click', event => {
      const button = event.target.closest('button[data-model-id]');
      if (!button) return;
      selectedId = button.dataset.modelId; render();
    });
    el('demoRows').addEventListener('keydown', event => {
      const buttons = [...el('demoRows').querySelectorAll('button')];
      const index = buttons.indexOf(doc.activeElement);
      if (index < 0 || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus(); buttons[next].click();
    });
    el('demoExpiration').addEventListener('change', event => {
      try {
        parseDate(event.target.value);
        event.target.setAttribute('aria-invalid', 'false');
        records = records.map(r => r.id === selectedId ? { ...r, expires: event.target.value } : r);
        render();
      } catch (error) {
        event.target.setAttribute('aria-invalid', 'true'); el('demoError').textContent = error.message;
      }
    });
    el('demoReset').addEventListener('click', reset);
    reset();
    return { render, reset };
  }
  root.SFIManufacturerDemo = { parseDate, todayInZone, thresholdDate, evaluate, sampleRecords, reminderPreviews, mount };
  if (root.document?.getElementById('demoControls')) mount();
})(typeof window === 'undefined' ? globalThis : window);
