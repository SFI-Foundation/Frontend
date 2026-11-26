import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
const source = readFileSync(new URL('../_internal/manufacturer-demo.js', import.meta.url), 'utf8');
const context = vm.createContext({ Intl, Date }); vm.runInContext(source, context);
const { todayInZone, thresholdDate, evaluate, parseDate, sampleRecords, reminderPreviews } = context.SFIManufacturerDemo;

test('selected model previews use fixed expiration, calendar months and individual test statuses', () => {
  const records = sampleRecords();
  assert.equal(new Set(records.map(r => r.manufacturer)).size, 1);
  assert.equal(new Set(records.map(r => r.model)).size, records.length);
  const record = records[0];
  assert.equal(record.expires, '2027-03-31');
  assert.equal(record.tests.length, 3);
  assert.equal(new Set(record.tests.map(t => t.status)).size, 3);
  assert.equal(JSON.stringify(reminderPreviews(record).map(n => n.date)), JSON.stringify(['2027-01-31', '2027-03-17', '2027-03-31']));
  assert.equal(thresholdDate('2027-04-30', { months: 2 }), '2027-02-28');
  assert.equal(thresholdDate('2028-04-30', { months: 2 }), '2028-02-29');
  for (const notice of reminderPreviews(record)) {
    assert.match(notice.message, /Apex Glove G1.*2027-03-31/);
    assert.match(notice.recipient, /@example\.invalid$/);
  }
});

test('timezone day boundaries and DST transitions use calendar dates', () => {
  assert.equal(todayInZone('2026-11-10T01:00:00Z', 'America/Los_Angeles'), '2026-11-09');
  assert.equal(todayInZone('2026-11-10T01:00:00Z', 'UTC'), '2026-11-10');
  assert.equal(todayInZone('2026-03-08T09:59:59Z', 'America/Los_Angeles'), '2026-03-08');
  assert.equal(todayInZone('2026-03-08T10:00:00Z', 'America/Los_Angeles'), '2026-03-08');
  assert.equal(todayInZone('2026-11-01T09:00:00Z', 'America/Los_Angeles'), '2026-11-01');
  assert.throws(() => todayInZone('2026-11-10T01:00:00', 'UTC'), /timezone/);
  assert.throws(() => todayInZone('invalid', 'UTC'));
  assert.throws(() => parseDate('2026-02-30'));
});

test('calendar months clamp leap and month-end boundaries', () => {
  assert.equal(thresholdDate('2028-08-31', { months: 6 }), '2028-02-29');
  assert.equal(thresholdDate('2026-08-31', { months: 6 }), '2026-02-28');
  assert.equal(thresholdDate('2026-01-31', { months: 6 }), '2025-07-31');
  assert.equal(thresholdDate('2026-03-09', { days: 1 }), '2026-03-08');
  assert.throws(() => thresholdDate('2026-01-01', { days: -1 }));
});

test('threshold inclusive, expiration inclusive, overdue following day, disable six-month', () => {
  const record = { expires: '2026-11-10' };
  const intervals = [{ months: 6, enabled: true }, { days: 30, enabled: true }];
  assert.equal(evaluate(record, '2026-05-09', intervals).notices.length, 0);
  assert.equal(evaluate(record, '2026-05-10', intervals).notices.length, 1);
  assert.equal(evaluate(record, '2026-10-11', intervals).notices.length, 2);
  assert.equal(evaluate(record, '2026-11-10', intervals).status, 'Expires today');
  assert.equal(evaluate(record, '2026-11-11', intervals).status, 'Overdue');
  intervals[0].enabled = false;
  assert.equal(evaluate(record, '2026-06-01', intervals).notices.length, 0);
  intervals[1].enabled = false;
  assert.equal(evaluate(record, '2026-11-10', intervals).notices.length, 0);
});

test('one accessible selection drives details, reminders, filters, edits and reset without services', () => {
  const page = readFileSync(new URL('../_internal/manufacturer-demo.md', import.meta.url), 'utf8');
  const dom = new JSDOM(page, { url: 'http://localhost:4600/sfi-manufacturer-demo/', runScripts: 'outside-only' });
  dom.window.fetch = () => { throw new Error('Demo attempted a network request'); };
  dom.window.eval(source);
  const doc = dom.window.document;
  const input = id => doc.getElementById(id).dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  const chosen = () => doc.querySelector('#demoRows button[aria-pressed="true"]');
  const dates = () => [...doc.querySelectorAll('#demoBoardMessages summary time')].map(t => t.dateTime);
  assert.equal(doc.querySelectorAll('#demoRows button').length, 5);
  assert.equal(chosen().dataset.modelId, 'DEMO-001');
  assert.equal(doc.querySelectorAll('#demoModelDetails tbody tr').length, 3);
  for (const status of ['Passed', 'Pending', 'Retest required']) assert.ok(doc.getElementById('demoModelDetails').textContent.includes(status));
  assert.equal(doc.querySelectorAll('#demoBoardMessages details').length, 3);
  assert.deepEqual(dates(), ['2027-01-31', '2027-03-17', '2027-03-31']);
  assert.equal(doc.querySelector('#demoBoardMessages details').open, false);
  assert.equal(doc.getElementById('demoCertification'), null);
  doc.querySelector('[data-model-id="DEMO-003"]').click();
  assert.equal(chosen().dataset.modelId, 'DEMO-003');
  assert.match(doc.getElementById('demoModelHeading').textContent, /Apex Glove G2/);
  assert.match(doc.getElementById('demoBoardMessages').textContent, /Apex Glove G2/);
  assert.doesNotMatch(doc.getElementById('demoBoardMessages').textContent, /Apex Glove G1/);
  assert.equal(dates()[0], '2027-06-30');
  doc.getElementById('demoSearch').value = 'Apex Glove G2'; input('demoSearch');
  assert.equal(doc.querySelectorAll('#demoRows button').length, 1);
  const expiration = doc.getElementById('demoExpiration');
  expiration.value = '2000-01-01'; expiration.dispatchEvent(new dom.window.Event('change'));
  assert.match(doc.getElementById('demoRows').textContent, /Overdue/);
  assert.equal(dates()[2], '2000-01-01');
  doc.getElementById('demoStatus').value = 'Current sample'; input('demoStatus');
  assert.equal(doc.querySelectorAll('#demoRows button').length, 0);
  assert.equal(doc.getElementById('demoDetails').hidden, true);
  assert.equal(expiration.disabled, true);
  doc.getElementById('demoReset').click();
  assert.equal(doc.getElementById('demoSearch').value, '');
  assert.equal(doc.getElementById('demoStatus').value, '');
  assert.equal(doc.getElementById('demoInstant').value, '2026-11-25T20:00:00.000Z');
  assert.equal(doc.getElementById('demoZone').value, 'America/Los_Angeles');
  assert.equal(expiration.value, '2027-03-31');
  assert.equal(chosen().dataset.modelId, 'DEMO-001');
  assert.deepEqual(dates(), ['2027-01-31', '2027-03-17', '2027-03-31']);
  assert.equal(doc.querySelectorAll('#demoRows button').length, 5);
  assert.equal(doc.getElementById('demoDetails').hidden, false);
  chosen().focus();
  chosen().dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  assert.equal(chosen().dataset.modelId, 'DEMO-003');
  assert.equal(doc.activeElement, chosen());
  doc.getElementById('interval-six').checked = true; input('interval-six');
  assert.match(doc.getElementById('demoMessages').textContent, /PREVIEW ONLY/);
  doc.getElementById('demoReset').click();
  assert.equal(doc.querySelectorAll('#demoIntervals input:checked').length, 0);
  assert.match(doc.getElementById('demoMessages').textContent, /disabled/);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|\/api\//);
  dom.window.close();
});

test('invalid simulated time and expiration report errors without corrupting records', () => {
  const page = readFileSync(new URL('../_internal/manufacturer-demo.md', import.meta.url), 'utf8');
  const dom = new JSDOM(page, { runScripts: 'outside-only' }); dom.window.eval(source);
  const doc = dom.window.document;
  const date = doc.getElementById('demoExpiration'); date.value = '';
  date.dispatchEvent(new dom.window.Event('change'));
  assert.equal(date.getAttribute('aria-invalid'), 'true');
  assert.match(doc.getElementById('demoError').textContent, /valid/);
  assert.equal(doc.querySelector('#demoBoardMessages summary time').dateTime, '2027-01-31');
  const instant = doc.getElementById('demoInstant'); instant.value = 'bad';
  instant.dispatchEvent(new dom.window.Event('input'));
  assert.equal(instant.getAttribute('aria-invalid'), 'true');
  doc.getElementById('demoReset').click();
  assert.equal(doc.getElementById('demoError').textContent, '');
  assert.equal(date.getAttribute('aria-invalid'), 'false');
  assert.equal(instant.getAttribute('aria-invalid'), 'false');
  dom.window.close();
});

test('every reminder input has an individual label, feedback, and disabled state', () => {
  const page = readFileSync(new URL('../_internal/manufacturer-demo.md', import.meta.url), 'utf8');
  const dom = new JSDOM(page, { runScripts: 'outside-only' });
  dom.window.eval(source);
  const doc = dom.window.document;
  for (const input of doc.querySelectorAll('#demoIntervals input')) {
    assert.equal(input.labels.length, 1, input.id);
    assert.equal(input.labels[0].htmlFor, input.id);
  }
  doc.getElementById('interval-six').checked = true;
  doc.getElementById('interval-six').dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  const input = doc.getElementById('value-six');
  input.value = '0'; input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.match(doc.getElementById('error-six').textContent, /1 to 24/);
  assert.equal(doc.getElementById('demoMessages').children.length, 0);
  input.value = '5'; input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(input.getAttribute('aria-invalid'), 'false');
  assert.equal(doc.getElementById('demoError').textContent, '');
  doc.getElementById('interval-six').checked = false;
  doc.getElementById('interval-six').dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(input.disabled, true);
  dom.window.close();
});
