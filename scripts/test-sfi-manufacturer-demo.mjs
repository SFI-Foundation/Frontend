import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
const source = readFileSync(new URL('../assets/js/sfi/manufacturer-demo.js', import.meta.url), 'utf8');
const context = vm.createContext({ Intl, Date }); vm.runInContext(source, context);
const { todayInZone, thresholdDate, evaluate, parseDate } = context.SFIManufacturerDemo;

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

test('demo uses synthetic records only, supports search and changes, never contacts services', () => {
  const page = readFileSync(new URL('../navigation/sfi-manufacturer-demo.md', import.meta.url), 'utf8');
  const dom = new JSDOM(page, { url: 'http://localhost:4000/Frontend/sfi-manufacturer-demo/', runScripts: 'outside-only' });
  dom.window.fetch = () => { throw new Error('Demo attempted a network request'); };
  dom.window.eval(source);
  const doc = dom.window.document;
  assert.equal(doc.querySelectorAll('#demoRows article').length, 5);
  assert.match(doc.body.textContent, /fictional/);
  assert.match(doc.getElementById('demoMessages').textContent, /PREVIEW ONLY/);
  const before = doc.querySelectorAll('#demoMessages li').length;
  doc.getElementById('interval-six').checked = false;
  doc.getElementById('interval-six').dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.ok(doc.querySelectorAll('#demoMessages li').length < before);
  doc.getElementById('demoSearch').value = 'Imaginary';
  doc.getElementById('demoSearch').dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(doc.querySelectorAll('#demoRows article').length, 1);
  const date = doc.querySelector('[data-demo-id="DEMO-003"]'); date.value = '2000-01-01';
  date.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.match(doc.getElementById('demoRows').textContent, /Overdue/);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|\/api\//);
  dom.window.close();
});
