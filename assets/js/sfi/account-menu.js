// Persistent secondary navigation uses the verified session and backend capabilities.
(() => {
  const account = document.getElementById('sfiAccount');
  if (!account || !window.SFIAuth) return;
  const el = id => document.getElementById(id);
  const t = key => window.SFII18n?.t(key) || key;
  let signingOut = false;
  function displayName(profile) {
    const clean = value => typeof value === 'string' ? value.trim() : '';
    const full = [clean(profile.first_name), clean(profile.last_name)].filter(Boolean).join(' ');
    // SFI stores its editable full name in `name`; no separate name columns exist.
    return full || clean(profile.name) || clean(profile.uid) || clean(profile.username)
      || clean(profile.email).split('@')[0].replace(/[._-]+/g, ' ') || t('My Account');
  }
  function render() {
    const { state, user, error } = window.SFIAuth.snapshot();
    const authenticated = state === 'authenticated' && user;
    el('accountSignIn').hidden = state !== 'guest';
    account.hidden = !authenticated;
    el('accountPending').hidden = state !== 'loading';
    el('accountSessionRetry').hidden = !error || authenticated;
    el('accountSessionRetry').textContent = t('Retry account check');
    el('accountPending').textContent = t('Checking account…');
    el('accountAdmin').hidden = !authenticated || user.can_manage_roles !== true;
    for (const link of account.querySelectorAll('a')) {
      if (new URL(link.href).pathname === location.pathname) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const name = authenticated ? displayName(user) : '';
    el('accountName').textContent = name;
    el('accountName').title = name;

    // Keep interface strings localized; user-supplied names never enter translation.
    for (const node of account.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  }
  el('accountSignOut').addEventListener('click', async () => {
    if (signingOut) return;
    signingOut = true; el('accountSignOut').disabled = true; el('accountMessage').textContent = '';
    try {
      await window.SFIAuth.signOut();
      el('accountSignIn').focus();
      if (document.querySelector('#profileContent, #settingsAccountDetails, #profileCard, #admMain')) {
        window.location.assign(el('accountSignIn').href);
      }
    } catch {
      el('accountMessage').textContent = t('Sign out failed. Please try again.');
    } finally { signingOut = false; el('accountSignOut').disabled = false; }
  });
  el('accountSessionRetry').addEventListener('click', () => window.SFIAuth.refresh(true).catch(() => {}));
  window.addEventListener('sfi-session', render);
  window.addEventListener('sfi-language', render);
  render();
})();
