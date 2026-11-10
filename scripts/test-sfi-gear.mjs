import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adminClient, backendFixture, quizClient, response, settle } from './sfi-gear-test-helpers.mjs';

const pending = () => ({ id: 1, name: 'Helmet', spec: '31.1', certDate: '2020-01-01',
  status: 'pending', owner: { id: 5, uid: 'racer', name: 'Racer' } });
const writes = state => state.requests.filter(r => r.method === 'PUT');

test('pending and rejected gear retain independent expiry warnings and review notes', async t => {
  const b = backendFixture([pending(), { ...pending(), id: 2, status: 'rejected', reviewer_notes: 'Recertify first', reviewNote: 'Old alias' }]);
  const h = await quizClient(b.fetch); t.after(() => h.dom.window.close());
  const cards = h.document.querySelectorAll('.sfi__gear-item');
  assert.equal(cards[0].querySelector('[data-gear-review]').textContent, 'Pending');
  assert.equal(cards[1].querySelector('[data-gear-review]').textContent, 'Rejected');
  assert.ok([...cards].every(c => c.querySelector('[data-gear-expiry]').textContent === 'Expired'));
  assert.match(cards[1].textContent, /Recertify first/);
  assert.doesNotMatch(cards[1].textContent, /Old alias/);
});

test('approved badge remains visible beside current or missing expiry dates', async t => {
  const b = backendFixture([{ ...pending(), status: 'approved', certDate: '2026-01-01' },
    { ...pending(), id: 2, status: 'approved', certDate: '' }]);
  const h = await quizClient(b.fetch); t.after(() => h.dom.window.close());
  assert.equal(h.document.querySelectorAll('[data-gear-review]').length, 2);
  assert.ok([...h.document.querySelectorAll('[data-gear-review]')].every(badge => badge.textContent === 'Approved'));
  assert.match(h.document.getElementById('gearList').textContent, /No Date/);
  assert.match(h.document.getElementById('gearList').textContent, /Current/);
});

test('device-only gear survives add/reload/remove with no staff review badges or notes', async t => {
  const b = backendFixture(); b.state.authed = false;
  const local = [{ ...pending(), status: 'rejected', reviewNote: 'Stale server note' }];
  const h = await quizClient(b.fetch, local); t.after(() => h.dom.window.close());
  assert.equal(h.document.querySelectorAll('[data-gear-review]').length, 0);
  assert.doesNotMatch(h.document.getElementById('gearList').textContent, /Stale server note/);
  const item = await h.data.addItem('Harness', '16.1', '2026-01-01', null);
  await h.data.loadGear();
  assert.equal(h.data.getGear().length, 2);
  await h.data.removeItem(item.id);
  await h.data.loadGear();
  assert.equal(h.data.getGear().length, 1);
  assert.equal(b.state.requests.filter(r => ['POST', 'DELETE'].includes(r.method)).length, 0);
});

test('calendar expiry handles today, 89/90-day boundary, invalid dates and leap day', async t => {
  const h = await quizClient(backendFixture().fetch); t.after(() => h.dom.window.close());
  const now = new h.window.Date(2026, 9, 28, 23, 59);
  for (const [certDate, status, days] of [
    ['2021-10-28', 'expiring', 0], ['2022-01-25', 'expiring', 89],
    ['2022-01-26', 'current', 90], ['2021-10-27', 'expired', -1],
  ]) {
    const result = h.data.getStatus({ certDate }, now);
    assert.equal(result.status, status, certDate);
    assert.equal(result.days, days, certDate);
  }
  for (const certDate of [null, '', 'invalid', '2026-02-30', '2027-01-01']) {
    const result = h.data.getStatus({ certDate }, now);
    assert.equal(result.status, 'unknown'); assert.equal(result.days, null);
  }
  const leap = h.data.getStatus({ certDate: '2020-02-29' }, new h.window.Date(2025, 1, 28, 23));
  assert.equal(leap.days, 0);
});

test('urgency sort puts expired first and does not discard zero-day deadlines', async t => {
  const b = backendFixture([
    { ...pending(), id: 1, certDate: '2026-01-01', status: 'rejected' },
    { ...pending(), id: 2, certDate: '2021-10-28' },
    { ...pending(), id: 3, certDate: '2020-01-01' },
    { ...pending(), id: 4, certDate: '2022-01-25' },
  ]);
  const h = await quizClient(b.fetch); t.after(() => h.dom.window.close());
  assert.deepEqual(Array.from(h.data.sortGear('urgency'), g => g.id), [3, 2, 4, 1]);
  assert.deepEqual(Array.from(h.data.getGear(), g => g.id), [1, 2, 3, 4]);
});

test('gear and reviewer strings render as text without executable markup', async t => {
  const payload = '<img src=x onerror="alert(1)">';
  const b = backendFixture([{ ...pending(), name: payload, spec: payload, category: payload,
    id: '1);alert(1)//', status: 'rejected', reviewer_notes: payload }]);
  const h = await quizClient(b.fetch); t.after(() => h.dom.window.close());
  const list = h.document.getElementById('gearList');
  assert.equal(list.querySelectorAll('img,script,[onclick]').length, 0);
  assert.match(list.textContent, /<img/);
  assert.equal(list.querySelector('button').getAttribute('aria-label'), 'Remove ' + payload);
  assert.equal(h.alerts.length, 0);
});

test('failed remote writes retain inputs and records without populating a local cache', async t => {
  const b = backendFixture([pending()]);
  const h = await quizClient(b.fetch, [], true); t.after(() => h.dom.window.close());
  b.state.writeFailure = 503;
  h.document.getElementById('gearName').value = 'Keep my entry';
  h.document.getElementById('gearAddBtn').click();
  await settle();
  assert.equal(h.document.getElementById('gearName').value, 'Keep my entry');
  assert.equal(h.document.getElementById('gearAddBtn').disabled, false);
  assert.equal(h.data.getGear().length, 1);
  await assert.rejects(h.data.removeItem(1));
  assert.equal(h.data.getGear().length, 1);
  assert.equal(h.window.localStorage.getItem('sfiMyGear'), '[]');
  assert.ok(h.alerts.length > 0);
});

test('server failure displays a device-only cache without pretending its review is current', async t => {
  const b = backendFixture(); b.state.loadFailure = 503;
  const h = await quizClient(b.fetch, [pending()], true); t.after(() => h.dom.window.close());
  assert.equal(h.data.isRemote(), false);
  assert.equal(h.data.isAuthed(), false);
  assert.match(h.document.getElementById('gearAuthBanner').textContent, /Could not sync/);
  assert.equal(h.document.querySelectorAll('[data-gear-review]').length, 0);
});

test('admin rejection opens an accessible notes form; cancel and blank notes send nothing', async t => {
  const b = backendFixture([pending()]);
  const h = await adminClient(b.fetch); t.after(() => h.dom.window.close());
  const row = h.document.querySelector('#pendingBody tbody tr');
  row.querySelector('.reject').click();
  const form = row.querySelector('form');
  assert.equal(form.hidden, false);
  assert.equal(form.querySelector('textarea').required, true);
  const textarea = form.querySelector('textarea');
  textarea.value = '  ';
  form.dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(writes(b.state).length, 0);
  assert.match(row.querySelector('[role="alert"]').textContent, /Enter a rejection reason/);
  [...form.querySelectorAll('button')].find(b => b.textContent === 'Cancel').click();
  assert.equal(form.hidden, true);
  assert.equal(writes(b.state).length, 0);
});

test('admin PUT rejection refreshes queues and the owner sees it after reload', async t => {
  const b = backendFixture([pending()]);
  const admin = await adminClient(b.fetch); t.after(() => admin.dom.window.close());
  admin.document.querySelector('#pendingBody .reject').click();
  const form = admin.document.querySelector('#pendingBody form');
  form.querySelector('textarea').value = '  Expired label  ';
  form.dispatchEvent(new admin.window.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  const write = writes(b.state)[0];
  assert.equal(write.path, '/api/sfi/gear/1/review');
  assert.equal(write.options.credentials, 'include');
  assert.deepEqual(JSON.parse(write.options.body), { status: 'rejected', notes: 'Expired label' });
  assert.equal(admin.document.getElementById('cntPending').textContent, '0');
  assert.match(admin.document.getElementById('gearBody').textContent, /Expired label/);
  const owner = await quizClient(b.fetch); t.after(() => owner.dom.window.close());
  assert.match(owner.document.getElementById('gearList').textContent, /Rejected/);
  assert.match(owner.document.getElementById('gearList').textContent, /Expired label/);
});

test('admin approval uses PUT and prevents duplicate submissions while saving', async t => {
  const b = backendFixture([pending()]); let finish;
  b.state.waitForReview = new Promise(resolve => { finish = resolve; });
  const h = await adminClient(b.fetch); t.after(() => h.dom.window.close());
  const button = h.document.querySelector('#pendingBody .approve');
  button.click(); button.click();
  assert.equal(button.disabled, true);
  assert.equal(writes(b.state).length, 1);
  finish(); await settle();
  assert.equal(b.state.gear[0].status, 'approved');
  assert.equal(h.document.getElementById('cntPending').textContent, '0');
  assert.match(h.document.getElementById('gearReviewMessage').textContent, /approved/);
});

test('failed review keeps notes and row visible and restores usable controls', async t => {
  const b = backendFixture([pending()]); b.state.reviewFailure = 500;
  const h = await adminClient(b.fetch); t.after(() => h.dom.window.close());
  h.document.querySelector('#pendingBody .reject').click();
  const form = h.document.querySelector('#pendingBody form');
  form.querySelector('textarea').value = 'Keep this reason';
  form.dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(form.querySelector('textarea').value, 'Keep this reason');
  assert.equal(form.querySelector('button').disabled, false);
  assert.match(h.document.querySelector('#pendingBody [role="alert"]').textContent, /not saved/);
  assert.equal(b.state.gear[0].status, 'pending');
});

test('expired/revoked admin access hides private dashboard data', async t => {
  for (const status of [401, 403]) {
    const b = backendFixture([pending()]); b.state.reviewFailure = status;
    const h = await adminClient(b.fetch); t.after(() => h.dom.window.close());
    h.document.querySelector('#pendingBody .approve').click(); await settle();
    assert.equal(h.document.getElementById('admMain').classList.contains('adm-hidden'), true);
    assert.equal(h.document.getElementById('admGate').classList.contains('adm-hidden'), false);
    assert.match(h.document.getElementById('admGateMsg').textContent, status === 401 ? /session expired/ : /permission/);
  }
});

test('unknown remote review status is not presented as approved', async t => {
  const b = backendFixture([{ ...pending(), status: undefined }]);
  const h = await quizClient(b.fetch); t.after(() => h.dom.window.close());
  assert.equal(h.document.querySelector('[data-gear-review]').textContent, 'Review unavailable');
});

test('a saved decision with a failed queue refresh offers retry without claiming fresh data', async t => {
  const b = backendFixture([pending()]);
  const h = await adminClient(b.fetch); t.after(() => h.dom.window.close());
  b.state.pendingFailure = 503;
  h.document.querySelector('#pendingBody .approve').click(); await settle();
  assert.equal(b.state.gear[0].status, 'approved');
  assert.match(h.document.getElementById('gearReviewMessage').textContent, /Review saved; use Try again/);
  assert.doesNotMatch(h.document.getElementById('gearReviewMessage').textContent, /Lists refreshed/);
  b.state.pendingFailure = 0;
  h.document.querySelector('#pendingBody button').click(); await settle();
  assert.equal(h.document.getElementById('cntPending').textContent, '0');
});

test('dashboard recognizes the trusted Admin role and denies an ordinary member', async t => {
  for (const role of ['Admin', 'User']) {
    const b = backendFixture([pending()]); b.state.admin = false; b.state.role = role;
    const h = await adminClient(b.fetch); t.after(() => h.dom.window.close());
    assert.equal(h.document.getElementById('admMain').classList.contains('adm-hidden'), role !== 'Admin');
    assert.equal(b.state.requests.some(r => r.path.endsWith('/pending')), role === 'Admin');
  }
});
