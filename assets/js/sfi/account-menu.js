(() => {
  const account = document.getElementById('sfiAccount');
  if (!account || !window.SFIAuth) return;
  const el = id => document.getElementById(id);
  const trigger = el('accountToggle'), menu = el('accountMenu');
  const t = key => window.SFII18n?.t(key) || key;
  const items = () => [...menu.querySelectorAll('[role="menuitem"]')].filter(item => !item.hidden && !item.disabled);
  let signingOut = false;
  function close(restore = false) {
    menu.hidden = true; trigger.setAttribute('aria-expanded', 'false');
    if (restore && !trigger.hidden) trigger.focus();
  }
  function open(last = false) {
    if (trigger.hidden) return;
    menu.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    const available = items(); available[last ? available.length - 1 : 0]?.focus();
  }
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
    trigger.hidden = !authenticated;
    el('accountPending').hidden = state !== 'loading';
    el('accountRetry').hidden = !error || authenticated;
    el('accountRetry').textContent = t('Retry account check');
    el('accountPending').textContent = t('Checking account…');
    el('accountAdmin').hidden = !authenticated || user.can_manage_roles !== true;
    const name = authenticated ? displayName(user) : '';
    el('accountName').textContent = name;
    el('accountName').title = name;
    if (!authenticated) close();
    // Keep interface strings localized; user-supplied names never enter translation.
    for (const node of menu.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  }
  trigger.addEventListener('click', () => menu.hidden ? open() : close());
  trigger.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); open(event.key === 'ArrowUp'); }
  });
  account.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); event.stopPropagation(); close(true); }
    if (menu.hidden || !menu.contains(event.target)) return;
    const available = items(), index = available.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % available.length;
    if (event.key === 'ArrowUp') next = (index - 1 + available.length) % available.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = available.length - 1;
    if (next !== undefined) { event.preventDefault(); available[next]?.focus(); }
  });
  document.addEventListener('click', event => { if (!account.contains(event.target)) close(); });
  account.addEventListener('focusout', event => {
    // A null relatedTarget can mean the browser window lost focus. Closing in
    // a queued callback then can hide the menu during a click that restores it.
    if (event.relatedTarget && !account.contains(event.relatedTarget)) close();
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  el('navToggle')?.addEventListener('click', () => close());
  el('accountSignOut').addEventListener('click', async () => {
    if (signingOut) return;
    signingOut = true; el('accountSignOut').disabled = true; el('accountMessage').textContent = '';
    try {
      await window.SFIAuth.signOut(); close();
      el('accountSignIn').focus();
      if (document.querySelector('#profileContent, #settingsAccountDetails, #profileCard, #admMain')) {
        window.location.assign(el('accountSignIn').href);
      }
    } catch {
      el('accountMessage').textContent = t('Sign out failed. Please try again.');
    } finally { signingOut = false; el('accountSignOut').disabled = false; }
  });
  el('accountRetry').addEventListener('click', () => window.SFIAuth.refresh(true).catch(() => {}));
  window.addEventListener('sfi-session', render);
  window.addEventListener('resize', () => close());
  window.addEventListener('sfi-language', render);
  render();
})();
