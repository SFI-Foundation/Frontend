import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 15));
const profile = (values = {}) => ({ uid: 'test-member', name: 'Alex Rivera', can_manage_roles: false, ...values });
const response = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const channels = new Set();
function fixture(handler) {
  const markup = read('_includes/sfi/nav.html').replace(/{%[\s\S]*?%}/g, '').replace(/{{[\s\S]*?}}/g, '/');
  const footer = read('_includes/sfi/footer.html');
  const dom = new JSDOM(markup + '<main><button id="outside">Outside</button></main>' + footer.replace(/<script>[\s\S]*?<\/script>/, ''), { url: 'http://localhost:4000/', runScripts: 'outside-only' });
  const w = dom.window;
  w.SFI_API_BASE = 'http://localhost:8605';
  w.AbortController = AbortController;
  w.BroadcastChannel = class {
    constructor() { channels.add(this); }
    postMessage(data) { this.lastMessage = data; for (const peer of channels) if (peer !== this) peer.onmessage?.({ data }); }
  };
  w.fetch = handler;
  w.eval(read('assets/js/sfi/auth.js'));
  w.eval(read('assets/js/sfi/account-menu.js'));
  w.eval(footer.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/{{[\s\S]*?}}/g, '"/"'));
  return { w, dom, el: id => w.document.getElementById(id), close() { channels.clear(); dom.window.close(); } };
}
test('initial neutral state never flashes Sign In; only 401 establishes signed out', async () => {
  let release;
  const h = fixture(() => new Promise(resolve => { release = resolve; }));
  try {
    assert.equal(h.el('accountSignIn').hidden, true);
    assert.equal(h.el('accountPending').hidden, false);
    assert.equal(h.el('navAuth').textContent, 'Checking account…');
    release(response(401, {})); await tick();
    assert.equal(h.el('accountSignIn').hidden, false);
    assert.equal(h.el('accountToggle').hidden, true);
    assert.equal(h.el('accountName').textContent, '');
    assert.equal(h.el('navAuth').textContent, 'Sign In');
  } finally { h.close(); }
});
test('server profile replaces Sign In, name precedence is safe, and onboarding never grants admin', async () => {
  const h = fixture(async (url, options) => {
    assert.equal(url, 'http://localhost:8605/api/sfi/profile');
    assert.equal(options.credentials, 'include'); assert.equal(options.cache, 'no-store');
    return response(200, profile({ role: 'Admin', preferences: { involvement: ['sfi_staff'] } }));
  });
  try {
    await tick();
    assert.equal(h.el('accountName').textContent, 'Alex Rivera');
    assert.equal(h.el('navAuth').textContent, 'My Profile');
    assert.equal(h.el('accountSignIn').hidden, true);
    assert.equal(h.el('accountAdmin').hidden, true);
    for (const [values, expected] of [
      [{ first_name: 'Maya', last_name: 'Chen' }, 'Maya Chen'],
      [{ name: ' ', uid: 'handle' }, 'handle'],
      [{ name: '', uid: '', email: 'sam.rivera@example.org' }, 'sam rivera'],
      [{ name: '<img src=x onerror=alert(1)>' }, '<img src=x onerror=alert(1)>'],
    ]) {
      const original = h.w.SFIAuth.snapshot;
      h.w.SFIAuth.snapshot = () => ({ state: 'authenticated', user: profile(values) });
      h.w.dispatchEvent(new h.w.CustomEvent('sfi-session'));
      h.w.SFIAuth.snapshot = original;
      assert.equal(h.el('accountName').textContent, expected);
      assert.equal(h.el('accountName').children.length, 0);
    }
  } finally { h.close(); }
});
test('dropdown supports keyboard, Escape, focus leaving, and outside clicks', async () => {
  const h = fixture(async () => response(200, profile()));
  const key = (node, value) => node.dispatchEvent(new h.w.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
  try {
    await tick(); h.el('accountToggle').click();
    assert.equal(h.el('accountMenu').hidden, false);
    assert.equal(h.w.document.activeElement.textContent, 'My Profile');
    key(h.w.document.activeElement, 'End');
    assert.equal(h.w.document.activeElement.id, 'accountSignOut');
    key(h.w.document.activeElement, 'ArrowDown');
    assert.equal(h.w.document.activeElement.textContent, 'My Profile');
    key(h.w.document.activeElement, 'Escape');
    assert.equal(h.el('accountMenu').hidden, true);
    assert.equal(h.w.document.activeElement.id, 'accountToggle');
    key(h.el('accountToggle'), 'ArrowUp');
    assert.equal(h.w.document.activeElement.id, 'accountSignOut');
    h.el('accountSignOut').dispatchEvent(new h.w.FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await tick(); assert.equal(h.el('accountMenu').hidden, false, 'Window focus restoration must not swallow a menu click');
    h.el('outside').click(); assert.equal(h.el('accountMenu').hidden, true);
    h.el('accountToggle').click(); h.el('outside').focus(); await tick();
    assert.equal(h.el('accountMenu').hidden, true);
  } finally { h.close(); }
});
test('profile edits update the name immediately and backend permission controls the admin item', async () => {
  const h = fixture(async () => response(200, profile()));
  try {
    await tick();
    h.w.dispatchEvent(new h.w.CustomEvent('sfi-auth', { detail: profile({ name: 'Updated Member' }) }));
    assert.equal(h.el('accountName').textContent, 'Updated Member');
    h.w.dispatchEvent(new h.w.CustomEvent('sfi-auth', { detail: profile({ can_manage_roles: true }) }));
    assert.equal(h.el('accountAdmin').hidden, false);
    h.w.SFIAuth.clear();
    assert.equal(h.el('accountAdmin').hidden, true);
    assert.equal(h.el('accountName').textContent, '');
  } finally { h.close(); }
});
test('temporary errors retain verified identity; failed logout retains it; successful logout clears it', async () => {
  let status = 200, offline = false;
  const h = fixture(async () => { if (offline) throw new Error('Network'); return response(status, profile()); });
  try {
    await tick();
    for (const code of [403, 500, 503]) {
      status = code; await assert.rejects(h.w.SFIAuth.refresh());
      assert.equal(h.el('accountName').textContent, 'Alex Rivera');
      assert.equal(h.el('navAuth').textContent, 'My Profile');
      assert.equal(h.el('accountSignIn').hidden, true);
    }
    offline = true; await assert.rejects(h.w.SFIAuth.refresh());
    assert.equal(h.el('accountName').textContent, 'Alex Rivera');
    await assert.rejects(h.w.SFIAuth.signOut());
    assert.equal(h.el('accountSignIn').hidden, true);
    offline = false; status = 200; await h.w.SFIAuth.signOut();
    assert.equal(h.el('accountSignIn').hidden, false);
    assert.equal(h.el('accountName').textContent, '');
    assert.equal(h.el('navAuth').textContent, 'Sign In');
  } finally { h.close(); }
});
test('initial network failure remains unknown and has a retry; expiry clears identity', async () => {
  let status = 503;
  const h = fixture(async () => response(status, profile()));
  try {
    await tick(); assert.equal(h.el('accountSignIn').hidden, true); assert.equal(h.el('accountRetry').hidden, false);
    status = 200; h.el('accountRetry').click(); await tick();
    assert.equal(h.el('accountName').textContent, 'Alex Rivera');
    status = 401; await h.w.SFIAuth.refresh();
    assert.equal(h.el('accountSignIn').hidden, false); assert.equal(h.el('accountName').textContent, '');
  } finally { h.close(); }
});
test('late responses cannot resurrect an account after logout or replace a new login', async () => {
  let release;
  const h = fixture(async (_, options) => options.method === 'DELETE' ? response(200, {}) : new Promise(resolve => { release = resolve; }));
  try {
    await h.w.SFIAuth.signOut(); release(response(200, profile())); await tick();
    assert.equal(h.el('accountName').textContent, '');
    const pending = h.w.SFIAuth.refresh();
    h.w.dispatchEvent(new h.w.CustomEvent('sfi-auth', { detail: profile({ uid: 'second', name: 'Second Account' }) }));
    release(response(200, profile())); await pending;
    assert.equal(h.el('accountName').textContent, 'Second Account');
  } finally { h.close(); }
});
test('tab messages carry no identity and revalidate the current cookie account', async () => {
  let account = profile();
  const a = fixture(async () => response(200, account)), b = fixture(async () => response(200, account));
  try {
    await tick();
    account = profile({ uid: 'second', name: 'Second Account' }); a.w.SFIAuth.notifyChange();
    assert.equal(b.el('accountName').textContent, ''); await tick();
    assert.equal(b.el('accountName').textContent, 'Second Account');
    assert.ok([...channels].every(channel => !channel.lastMessage || channel.lastMessage === 'changed'));
    assert.equal(a.w.localStorage.length, 0); assert.equal(b.w.localStorage.length, 0);
  } finally { a.close(); b.close(); }
});
test('English/Spanish labels change while user content is excluded from translation', async () => {
  const h = fixture(async () => response(200, profile({ name: 'Home' })));
  try {
    await tick(); h.w.matchMedia = () => ({ matches: false, addEventListener() {} });
    for (const file of ['assets/js/sfi/preferences.js', 'assets/js/vendor/i18next.min.js', 'assets/js/sfi/locales.js', 'assets/js/sfi/localization.js']) h.w.eval(read(file));
    h.w.SFIPreferences.update(h.w.JSON.parse('{"language":"es"}')); await tick();
    assert.equal(h.el('accountName').textContent, 'Home');
    assert.equal(h.el('accountMenu').querySelector('a').textContent, 'Mi perfil');
    assert.equal(h.el('accountSignOut').textContent, 'Cerrar sesión');
    h.w.SFIPreferences.update(h.w.JSON.parse('{"language":"en"}')); await tick();
    assert.equal(h.el('accountMenu').querySelector('a').textContent, 'My Profile');
  } finally { h.close(); }
});
