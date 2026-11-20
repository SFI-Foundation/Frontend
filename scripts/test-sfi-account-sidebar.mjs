import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
function fixture(snapshot) {
  const sidebar = read('_includes/sfi/account-sidebar.html').replace(/{%[\s\S]*?%}/g, '');
  const dom = new JSDOM(`<div id="accountLayout">${sidebar}</div>`, { url: 'https://sfi.test/sfi-profile/', runScripts: 'outside-only' });
  const w = dom.window;
  w.SFIAuth = { snapshot: () => snapshot };
  w.eval(read('assets/js/sfi/account-sidebar.js'));
  return { w, el: id => w.document.getElementById(id),
    session(value) { snapshot = value; w.dispatchEvent(new w.Event('sfi-session')); },
    close() { w.close(); } };
}

test('sidebar follows verified sessions and revokes administration on account changes', () => {
  const h = fixture({ state: 'loading', user: null });
  try {
    assert.equal(h.el('accountSidebar').hidden, true);
    h.session({ state: 'authenticated', user: { role: 'Admin', can_manage_roles: false } });
    assert.equal(h.el('accountSidebar').hidden, false);
    assert.equal(h.el('accountSidebarAdmin').hidden, true, 'Role text cannot grant sidebar permissions');
    h.session({ state: 'authenticated', user: { can_manage_roles: true } });
    assert.equal(h.el('accountSidebarAdmin').hidden, false);
    h.session({ state: 'authenticated', user: { can_manage_roles: false } });
    assert.equal(h.el('accountSidebarAdmin').hidden, true);
    h.session({ state: 'guest', user: null });
    assert.equal(h.el('accountSidebar').hidden, true);
    assert.equal(h.el('accountLayout').classList.contains('sfi-account-layout--authenticated'), false);
  } finally { h.close(); }
});

test('compact navigation supports keyboard activation, Escape and session reset', () => {
  const h = fixture({ state: 'authenticated', user: { can_manage_roles: false } });
  try {
    const button = h.el('accountSidebarToggle');
    assert.equal(button.getAttribute('aria-controls'), 'accountSidebarNav');
    button.click(); // Native button activation also handles Enter and Space.
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    h.el('accountSidebarNav').querySelector('a').focus();
    h.el('accountSidebarNav').dispatchEvent(new h.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(h.w.document.activeElement, button);
    button.click();
    h.session({ state: 'unavailable', user: null });
    assert.equal(button.getAttribute('aria-expanded'), 'false');
  } finally { h.close(); }
});

test('new sidebar headings use the existing English/Spanish localization system', () => {
  const h = fixture({ state: 'authenticated', user: { can_manage_roles: true } });
  try {
    h.w.matchMedia = () => ({ matches: false, addEventListener() {} });
    for (const file of ['preferences.js', '../vendor/i18next.min.js', 'locales.js', 'localization.js']) {
      h.w.eval(read('assets/js/sfi/' + file));
    }
    h.w.eval("SFIPreferences.update({ language: 'es' })");
    h.w.SFII18n.translate();
    assert.equal(h.el('accountSidebarToggle').textContent, 'Navegación de la cuenta');
    assert.equal(h.el('accountSidebarNav').getAttribute('aria-label'), 'Navegación de la cuenta');
    assert.equal(h.el('sidebarAdminHeading').textContent, 'Administración');
    assert.equal(h.el('sidebarSessionHeading').textContent, 'Sesión');
    h.w.eval("SFIPreferences.update({ language: 'en' })");
    h.w.SFII18n.translate();
    assert.equal(h.el('sidebarSessionHeading').textContent, 'Session');
  } finally { h.close(); }
});
