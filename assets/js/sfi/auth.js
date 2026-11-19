/* UI state for the existing HTTP-only cookie session. No identity is persisted. */
(() => {
  const root = window;
  let user = null, state = 'loading', error = false, generation = 0, epoch = 0;
  let pending, controller;
  const snapshot = () => ({ user, state, error, epoch });
  const signal = () => root.dispatchEvent(new CustomEvent('sfi-session', { detail: snapshot() }));
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('sfi-account-changes') : null;
  const notifyChange = () => channel?.postMessage('changed'); // Never transmit identity or credentials.

  function setProfile(profile) {
    if (!profile || typeof profile.uid !== 'string' || !profile.uid.trim()
        || typeof profile.can_manage_roles !== 'boolean') throw new Error('Invalid account response');
    user = profile; state = 'authenticated'; error = false; signal();
    return profile;
  }
  function clear() {
    generation++; epoch++; controller?.abort(); pending = null;
    user = null; state = 'guest'; error = false; signal();
  }
  function refresh(force = false) {
    if (pending && !force) return pending;
    controller?.abort();
    const ticket = ++generation;
    const requestController = controller = new AbortController();
    const timeout = setTimeout(() => requestController.abort(), 10000);
    pending = (async () => {
      try {
        const response = await fetch(root.SFI_API_BASE + '/api/sfi/profile', {
          credentials: 'include', cache: 'no-store', signal: requestController.signal,
        });
        if (ticket !== generation) return user;
        if (response.status === 401) { clear(); return null; }
        if (!response.ok) throw new Error('Account service unavailable');
        const profile = await response.json();
        if (ticket !== generation) return user;
        return setProfile(profile);
      } catch (failure) {
        if (ticket !== generation) return user;
        // A timeout, invalid response, 403 or 5xx is not proof of logout.
        error = true; state = user ? 'authenticated' : 'unavailable'; signal();
        throw failure;
      } finally {
        clearTimeout(timeout);
        if (ticket === generation) pending = null;
      }
    })();
    return pending;
  }
  const recheck = () => refresh().catch(() => {});
  async function signOut() {
    const response = await fetch(root.SFI_API_BASE + '/api/authenticate', {
      method: 'DELETE', credentials: 'include', cache: 'no-store',
    });
    if (!response.ok && response.status !== 401) throw new Error('Sign out failed. Please try again.');
    clear(); notifyChange();
  }
  root.SFIAuth = { snapshot, refresh, setProfile, clear, signOut, notifyChange };
  // Compatibility with existing profile/authentication modules. Only the
  // authenticated profile response has the server's verified permission flag.
  root.addEventListener('sfi-auth', event => {
    // A view switching to its sign-in form is not evidence that the cookie
    // expired. Revalidate legacy notifications instead of clearing a verified
    // account (or cancelling a newer successful sign-in) from presentation UI.
    if (!event.detail) { refresh(true).catch(() => {}); return; }
    if (typeof event.detail.can_manage_roles === 'boolean') {
      generation++; controller?.abort(); pending = null; setProfile(event.detail);
    } else refresh(true).catch(() => {});
  });
  if (channel) channel.onmessage = event => {
    if (event.data !== 'changed') return;
    generation++; epoch++; controller?.abort(); pending = null;
    user = null; state = 'loading'; error = false;
    root.SFIPreferenceSync?.logout(); signal();
    // Reload existing private page controllers so they cannot retain another
    // account's profile or unsaved form. Public pages only need a fresh lookup.
    if (root.document.querySelector('#profileContent, #settingsAccountDetails, #profileCard, #admMain')) {
      root.location.reload();
    } else recheck();
  };
  root.addEventListener('focus', recheck);
  root.addEventListener('online', recheck);
  root.addEventListener('pageshow', event => { if (event.persisted) recheck(); });
  root.document.addEventListener('visibilitychange', () => { if (!root.document.hidden) recheck(); });
  setInterval(() => { if (!root.document.hidden) recheck(); }, 60000);
  recheck();
})();
