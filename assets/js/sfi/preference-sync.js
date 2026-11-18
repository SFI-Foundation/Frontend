/* Account settings never enter persistent browser storage. Guest settings remain separate. */
(function (root) {
  'use strict';
  const store = root.SFIPreferences;
  let state = 'loading', revision = 0, applying = false, generation = 0;
  let timer, pending = {}, saving = null, user = null, loaded = false;
  const endpoint = () => root.SFI_API_BASE + '/api/sfi/settings';
  const labels = {
    loading: 'Loading account preferences…', guest: 'Saved on this browser',
    offlineGuest: 'Account service unavailable. Using browser preferences. Retry to load account settings.',
    ready: 'Saved to your account', saving: 'Saving to your account…',
    error: 'Account preferences unavailable. Changes have not been saved. Retry.',
    conflict: 'Preferences changed on another device. Reload account settings before saving.',
  };
  function signal(next) {
    state = next;
    root.dispatchEvent(new CustomEvent('sfi-preference-sync', { detail: status() }));
    const message = root.document.getElementById('preferenceSyncMessage');
    if (message) message.textContent = root.SFII18n?.t(labels[state]) || labels[state];
    const retry = root.document.getElementById('preferenceSyncRetry');
    if (retry) { retry.hidden = !['error', 'conflict', 'offlineGuest'].includes(state); retry.textContent = root.SFII18n?.t(state === 'conflict' ? 'Reload account settings' : 'Retry') || 'Retry'; }
  }
  function status() { return { state, message: labels[state], revision, canEdit: ['guest', 'offlineGuest'].includes(state) || (loaded && state !== 'conflict') }; }
  function replace(values) { applying = true; try { store.replace(values); } finally { applying = false; } }
  function guest() {
    generation++; user = null; pending = {}; clearTimeout(timer); revision = 0; loaded = false;
    applying = true; try { store.restoreGuest(); } finally { applying = false; }
    signal('guest');
  }
  async function load() {
    const ticket = ++generation;
    clearTimeout(timer); pending = {}; loaded = false; signal('loading');
    // Do not persist uncertain account state into the guest profile while loading.
    store.accountMode(true);
    try {
      const response = await fetch(endpoint(), { credentials: 'include', cache: 'no-store' });
      if (ticket !== generation) return;
      if (response.status === 401) { guest(); return; }
      if (!response.ok) throw new Error();
      const body = await response.json();
      if (ticket !== generation) return;
      store.validate(body.preferences);
      if (body.version !== 1 || !Number.isInteger(body.revision)) throw new Error();
      revision = body.revision; loaded = true;
      // Existing server settings always win. New accounts start at safe defaults;
      // importing guest preferences is an explicit user choice via import/export.
      replace(body.preferences); signal('ready');
    } catch {
      if (ticket !== generation) return;
      if (!user) {
        applying = true; try { store.restoreGuest(); } finally { applying = false; }
        signal('offlineGuest');
      } else signal('error');
    }
  }
  async function save() {
    if (saving === generation || !Object.keys(pending).length || !['ready', 'saving', 'error'].includes(state)) return;
    if (!loaded) return load();
    const ticket = generation, patch = pending; pending = {}; saving = ticket; signal('saving');
    try {
      const response = await fetch(endpoint(), { method: 'PATCH', credentials: 'include', cache: 'no-store',
        keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: 1, revision, preferences: patch }) });
      if (ticket !== generation) return;
      if (response.status === 401) { guest(); return; }
      if (response.status === 409) { pending = { ...patch, ...pending }; signal('conflict'); return; }
      if (!response.ok) throw new Error();
      const body = await response.json(); if (ticket !== generation) return; revision = body.revision;
      signal(Object.keys(pending).length ? 'saving' : 'ready');
    } catch { if (ticket === generation) { pending = { ...patch, ...pending }; signal('error'); } }
    finally { if (saving === ticket) saving = null; if (ticket === generation && state === 'saving') save(); }
  }
  let previous = store.get();
  root.addEventListener('sfi-preferences', () => {
    const next = store.get(), patch = {};
    for (const key of Object.keys(next)) if (next[key] !== previous[key]) patch[key] = next[key];
    previous = next;
    if (applying || ['guest', 'offlineGuest'].includes(state) || !Object.keys(patch).length) return;
    pending = { ...pending, ...patch };
    if (state === 'ready' || state === 'saving') { signal('saving'); clearTimeout(timer); timer = setTimeout(save, 300); }
  });
  root.addEventListener('sfi-auth', event => {
    const identity = event.detail?.uid || event.detail?.id || null;
    if (!identity) { guest(); return; }
    if (user !== identity) { user = identity; load(); }
  });
  root.addEventListener('sfi-language', () => signal(state));
  root.addEventListener('pagehide', () => { clearTimeout(timer); save(); });
  root.SFIPreferenceSync = { status, reload: load, retry: () => state === 'conflict' || !loaded ? load() : save(), logout: guest };
  function start() {
    const bar = root.document.createElement('div'); bar.className = 'sfi-sync-status';
    bar.innerHTML = '<span id="preferenceSyncMessage" role="status"></span> <button id="preferenceSyncRetry" type="button" hidden></button>';
    root.document.querySelector('main')?.prepend(bar);
    root.document.getElementById('preferenceSyncRetry').addEventListener('click', root.SFIPreferenceSync.retry);
    load();
  }
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start); else start();
})(window);
