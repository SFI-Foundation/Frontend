// Account-page presentation uses the shared, server-verified session state.
(() => {
  const sidebar = document.getElementById('accountSidebar');
  if (!sidebar || !window.SFIAuth) return;
  const layout = document.getElementById('accountLayout');
  const toggle = document.getElementById('accountSidebarToggle');
  const admin = document.getElementById('accountSidebarAdmin');
  const setOpen = open => toggle.setAttribute('aria-expanded', String(open));

  function render() {
    const { state, user } = window.SFIAuth.snapshot();
    const authenticated = state === 'authenticated' && Boolean(user);
    sidebar.hidden = !authenticated;
    layout.classList.toggle('sfi-account-layout--authenticated', authenticated);
    admin.hidden = !authenticated || user.can_manage_roles !== true;
    if (!authenticated) setOpen(false);
  }

  toggle.hidden = false;
  sidebar.classList.add('sfi-account-sidebar--enhanced');
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  sidebar.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('sfi-session', render);
  render();
})();
