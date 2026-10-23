---
---
// Shared by classic SFI scripts and the authentication ES module.
(() => {
  const configured = {{ site.sfi_api_base | default: "" | jsonify }};
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  window.SFI_API_BASE = (configured || (local
    ? 'http://localhost:8423'
    : 'https://greppers-be.opencodingsociety.com')).replace(/\/+$/, '');
})();
