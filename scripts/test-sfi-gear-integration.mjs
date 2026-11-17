// Source client + real Flask + disposable SQLite. No credentials are logged.
// Usage: node scripts/test-sfi-gear-integration.mjs <python> <backend-PR28-dir>
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { createInterface } from 'node:readline';
import { test } from 'node:test';
import { adminClient, quizClient } from './sfi-gear-test-helpers.mjs';

const [python, backend] = process.argv.slice(2);
assert.ok(python && backend, 'Supply Python executable and backend directory with PR #28');

test('member submission → real admin PUT review → persisted owner status and notes', { timeout: 90000 }, async () => {
  const bridge = spawn(python, [`${backend}/testing/test_sfi_profile.py`, '--bridge'], { stdio: ['pipe', 'pipe', 'pipe'] });
  const lines = createInterface({ input: bridge.stdout });
  const tasks = new Map(); let sequence = 0; let socketPath; let owner; let admin;
  const cookies = new Map();
  let ready, failed;
  const fixturePromise = new Promise((resolve, reject) => { ready = resolve; failed = reject; });
  const timer = setTimeout(() => failed(new Error('Isolated backend startup timed out')), 30000);
  bridge.stderr.on('data', () => {}); // Test credentials and JWTs must stay private.
  bridge.on('error', failed);
  bridge.on('exit', () => {
    const error = new Error('Isolated backend exited'); failed(error);
    for (const task of tasks.values()) task.reject(error);
  });
  lines.on('line', line => {
    let value; try { value = JSON.parse(line); } catch { return; }
    if (value.fixture) { clearTimeout(timer); ready(value.fixture); return; }
    const task = tasks.get(value.id); tasks.delete(value.id);
    if (value.failure) task?.reject(new Error('Isolated request failed'));
    else task?.resolve(value);
  });
  const call = data => new Promise((resolve, reject) => {
    const id = ++sequence; tasks.set(id, { resolve, reject });
    bridge.stdin.write(JSON.stringify({ id, ...data }) + '\n');
  });
  const fetch = async (url, options = {}) => {
    assert.equal(options.credentials, 'include');
    const target = new URL(url);
    const path = target.pathname + target.search;
    if (!socketPath) {
      const result = await call({ path, method: options.method || 'GET', body: options.body,
        headers: { Origin: 'http://localhost:4000', ...options.headers } });
      return { ok: result.ok, status: result.status, json: async () => result.data,
        text: async () => JSON.stringify(result.data) };
    }
    return new Promise((resolve, reject) => {
      const request = http.request({ socketPath, path, method: options.method || 'GET',
        headers: { Origin: 'http://localhost:4000', Cookie: Array.from(cookies, ([k, v]) => `${k}=${v}`).join('; '), ...options.headers },
      }, response => {
        for (const cookie of response.headers['set-cookie'] || []) {
          const pair = cookie.split(';')[0], equals = pair.indexOf('=');
          if (/max-age=0/i.test(cookie)) cookies.delete(pair.slice(0, equals));
          else cookies.set(pair.slice(0, equals), pair.slice(equals + 1));
        }
        let text = '';
        response.on('data', chunk => { text += chunk; });
        response.on('end', () => resolve({ ok: response.statusCode >= 200 && response.statusCode < 300,
          status: response.statusCode, json: async () => JSON.parse(text), text: async () => text }));
      });
      request.on('error', reject); request.end(options.body);
    });
  };
  const until = async predicate => {
    for (let count = 0; count < 500; count++) {
      if (predicate()) return;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Client state did not update after the real API request');
  };
  const login = async (uid, password) => {
    const result = await fetch('https://backend.test/api/authenticate', {
      credentials: 'include', method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, password }),
    });
    assert.equal(result.status, 200);
  };
  const logout = async () => {
    assert.equal((await fetch('https://backend.test/api/authenticate', { credentials: 'include', method: 'DELETE' })).status, 200);
  };
  try {
    const fixture = await fixturePromise; socketPath = fixture.socket;
    console.log(socketPath ? 'Transport: live HTTP over Unix socket' : 'Transport: real Flask WSGI over pipes; socket binding unavailable');
    await login(fixture.uid, fixture.password);
    owner = await quizClient(fetch);
    const first = await owner.data.addItem('Track helmet', '31.1', '2020-01-01', null);
    const second = await owner.data.addItem('Track suit', '3.2A', '2026-01-01', null);
    owner.ui.renderGear('urgency');
    assert.ok([...owner.document.querySelectorAll('[data-gear-review]')].every(b => b.textContent === 'Pending'));
    assert.match(owner.document.getElementById('gearList').textContent, /Expired/);
    assert.equal((await fetch('https://backend.test/api/sfi/gear/pending', { credentials: 'include' })).status, 403);
    await logout(); await login(fixture.admin_uid, fixture.password);
    admin = await adminClient(fetch);
    await until(() => admin.document.querySelector(`[data-gear-id="${first.id}"] .approve`));
    admin.document.querySelector(`[data-gear-id="${first.id}"] .approve`).click();
    await until(() => admin.document.getElementById('cntPending').textContent === '1');
    const row = admin.document.querySelector(`#pendingBody [data-gear-id="${second.id}"]`);
    row.querySelector('.reject').click();
    const form = row.querySelector('form'); form.querySelector('textarea').value = 'Recertification required';
    form.dispatchEvent(new admin.window.Event('submit', { bubbles: true, cancelable: true }));
    await until(() => admin.document.getElementById('cntPending').textContent === '0');
    await call({ reconnect: true });
    await logout(); await login(fixture.uid, fixture.password);
    await owner.data.loadGear(); owner.ui.renderGear('urgency');
    const saved = owner.data.getGear();
    assert.equal(saved.find(g => g.id === first.id).status, 'approved');
    assert.equal(saved.find(g => g.id === second.id).reviewNote, 'Recertification required');
    assert.match(owner.document.getElementById('gearList').textContent, /Approved/);
    assert.match(owner.document.getElementById('gearList').textContent, /Rejected/);
    assert.match(owner.document.getElementById('gearList').textContent, /Recertification required/);
    assert.equal(owner.window.localStorage.getItem('sfiMyGear'), '[]');
    await logout(); await owner.data.loadGear(); owner.ui.renderGear('urgency');
    assert.equal(owner.document.querySelectorAll('[data-gear-review]').length, 0);
    assert.equal(owner.data.getGear().length, 0);
  } finally {
    clearTimeout(timer); owner?.dom.window.close(); admin?.dom.window.close();
    bridge.stdin.end(); lines.close(); bridge.kill();
  }
});
