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
  function sampleRecords(today) {
    const offset = days => { const date = parseDate(today); date.setUTCDate(date.getUTCDate() + days); return iso(date); };
    return [
      { id: 'DEMO-001', manufacturer: 'Fictional Apex Safety Lab', spec: 'DEMO-SUIT', revision: 'Synthetic revision A', expires: offset(30) },
      { id: 'DEMO-002', manufacturer: 'Example Track Components', spec: 'DEMO-HARNESS', revision: 'Synthetic revision B', expires: offset(-5) },
      { id: 'DEMO-003', manufacturer: 'Imaginary Fuel Systems', spec: 'DEMO-CELL', revision: 'Synthetic revision C', expires: offset(170) },
      { id: 'DEMO-004', manufacturer: 'Sample Chassis Workshop', spec: 'DEMO-CAGE', revision: 'Synthetic revision D', expires: offset(400) },
      { id: 'DEMO-005', manufacturer: 'Fictional Apex Safety Lab', spec: 'DEMO-NET', revision: 'Synthetic revision E', expires: offset(0) }
    ];
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function mount(doc = root.document) {
    const el = id => doc.getElementById(id);
    const instant = new Date();
    el('demoInstant').value = instant.toISOString();
    el('demoZone').value = 'America/Los_Angeles';
    const initial = todayInZone(instant, el('demoZone').value);
    let records = sampleRecords(initial);
    const intervals = [
      { id: 'six', months: 6, enabled: false }, { id: 'ninety', days: 90, enabled: false },
      { id: 'thirty', days: 30, enabled: false }, { id: 'seven', days: 7, enabled: false }
    ];
    function render() {
      try {
        const today = todayInZone(el('demoInstant').value, el('demoZone').value);
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
        const selected = all.filter(r => (!q || `${r.manufacturer} ${r.spec} ${r.id}`.toLowerCase().includes(q)) && (!status || r.status === status));
        el('demoSummary').textContent = `Demo date ${today} (${el('demoZone').value}). ${selected.length} of ${all.length} sample registrations. ${all.filter(r => r.days < 0).length} overdue; ${all.filter(r => r.days >= 0 && r.notices.length).length} upcoming.`;
        el('demoRows').innerHTML = selected.map(r => `<article class="sfi__result"><div class="sfi__result-body"><h3>${escape(r.manufacturer)}</h3><p>${escape(r.id)} · ${escape(r.spec)} · ${escape(r.revision)}</p><p><strong>${escape(r.status)}</strong> · Sample expiration ${escape(r.expires)} · ${r.days} days remaining</p><label>Change sample expiration <input class="sfi__field" type="date" data-demo-id="${r.id}" value="${r.expires}" required></label></div></article>`).join('') || '<p>No sample records match.</p>';
        el('demoUpcoming').innerHTML = all.filter(r => r.days <= 0 || r.notices.length).map(r => `<li>${escape(r.manufacturer)} — ${escape(r.expires)}: ${escape(r.status)}</li>`).join('') || '<li>No upcoming or overdue samples under these intervals.</li>';
        el('demoMessages').innerHTML = !intervals.some(i => i.enabled) ? '<li>Reminder previews are disabled. No notifications are sent.</li>' : all.flatMap(r => r.days < 0 ? [`<li>PREVIEW ONLY: ${escape(r.manufacturer)}, sample ${escape(r.id)} expired on ${r.expires}. Please review this fictional registration.</li>`] : r.notices.map(i => `<li>PREVIEW ONLY (${i.months != null ? i.months + ' months' : i.days + ' days'}): ${escape(r.manufacturer)}, sample ${escape(r.id)} expires on ${r.expires}. Please review the sample registration. No notification has been sent.</li>`)).join('') || '<li>No enabled notice is due.</li>';
        el('demoError').textContent = '';
      } catch (error) {
        el('demoError').textContent = error.message;
      }
    }
    for (const id of ['demoControls', 'demoIntervals']) el(id).addEventListener('input', render);
    el('demoRows').addEventListener('change', event => {
      const target = event.target;
      if (!target.dataset.demoId) return;
      try { parseDate(target.value); records = records.map(r => r.id === target.dataset.demoId ? { ...r, expires: target.value } : r); render(); }
      catch (error) { el('demoError').textContent = error.message; }
    });
    render();
    return { render };
  }
  root.SFIManufacturerDemo = { parseDate, todayInZone, thresholdDate, evaluate, sampleRecords, mount };
  if (root.document?.getElementById('demoControls')) mount();
})(typeof window === 'undefined' ? globalThis : window);
