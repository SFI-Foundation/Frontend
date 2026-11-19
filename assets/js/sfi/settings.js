/* Declarative controls share the same validated store as the rest of the site. */
(function (root) {
  'use strict';
  const store = root.SFIPreferences, i18n = root.SFII18n, doc = root.document;
  const el = id => doc.getElementById(id), t = (key, values) => i18n.t(key, values);
  const mount = el('settingsControls');
  if (!mount) return;
  const appearance = ['theme', 'accent', 'density', 'corners', 'textSize'];
  const accessibility = ['textSize', 'lineSpacing', 'letterSpacing', 'underlineLinks', 'highContrast', 'enhancedFocus', 'reducedMotion', 'noTransitions', 'largeTargets', 'readingFont', 'contentWidth', 'reducedDistractions'];
  const search = ['resultsPerPage', 'showMetadata', 'rememberFilters', 'highlightMatches', 'resultDensity', 'pdfIndicators'];
  const labels = { system: 'System', light: 'Light', dark: 'Dark', red: 'SFI Red', blue: 'Blue', green: 'Green', purple: 'Purple', orange: 'Orange', teal: 'Teal', monochrome: 'Monochrome', comfortable: 'Comfortable', compact: 'Compact', standard: 'Standard', rounded: 'Rounded', small: 'Small', default: 'Default', large: 'Large', 'extra-large': 'Extra Large', reading: 'Reading width', en: 'English', es: 'Spanish', fr: 'French — preview', de: 'German — preview', 'zh-CN': 'Simplified Chinese — preview', ja: 'Japanese — preview' };
  const fields = [
    ['appearance', 'theme', 'Theme', 'Follows your operating system when System is selected.'],
    ['appearance', 'accent', 'Accent color'], ['appearance', 'density', 'Interface spacing'],
    ['appearance', 'corners', 'Interface corners'], ['accessibility', 'textSize', 'Text size'],
    ['language', 'language', 'Website language'],
    ['accessibility', 'lineSpacing', 'Increased line spacing'], ['accessibility', 'letterSpacing', 'Increased letter spacing'],
    ['accessibility', 'underlineLinks', 'Underline links'], ['accessibility', 'highContrast', 'High contrast'],
    ['accessibility', 'enhancedFocus', 'Enhanced focus indicators'],
    ['accessibility', 'reducedMotion', 'Reduce animations', 'Operating system reduced-motion preferences always take priority.'],
    ['accessibility', 'noTransitions', 'Disable nonessential transitions'], ['accessibility', 'largeTargets', 'Larger interactive targets'],
    ['accessibility', 'readingFont', 'Reading-friendly system font', 'Uses the available system sans-serif font without downloading fonts.'],
    ['accessibility', 'contentWidth', 'Content width'], ['accessibility', 'reducedDistractions', 'Reduce visual distractions', 'Hides decorative photography; content and navigation remain available.'],
    ['search', 'resultsPerPage', 'Results per page'], ['search', 'showMetadata', 'Show optional revision metadata'],
    ['search', 'rememberFilters', 'Remember last category filter', 'Stores only the selected category on this browser, never your search text.'],
    ['search', 'highlightMatches', 'Highlight matching search terms'], ['search', 'resultDensity', 'Search result spacing'],
    ['search', 'pdfIndicators', 'Show PDF status indicators', 'PDF approval and access rules always apply, including when indicators are hidden.'],
    ['shortcuts', 'shortcuts', 'Enable keyboard shortcuts']
  ];
  // All display text is assigned as text nodes, including translations and account data.
  function text(tag, key, className) {
    const node = doc.createElement(tag); node.dataset.i18n = key; node.textContent = t(key);
    if (className) node.className = className; return node;
  }
  for (const [category, key, title, hint] of fields) {
    const group = { textSize: 'Text & readability', reducedMotion: 'Motion & interaction', readingFont: 'Reading preferences' }[key];
    if (group) el('settings-accessibility-fields').append(text('h3', group));
    const row = doc.createElement('div'); row.className = 'sfi-setting-row';
    const copy = doc.createElement('div'), label = text('label', title);
    label.htmlFor = 'pref-' + key; copy.append(label);
    const control = doc.createElement(store.ENUMS[key] ? 'select' : 'input');
    control.id = 'pref-' + key; control.dataset.preference = key;
    if (store.ENUMS[key]) {
      for (const value of store.ENUMS[key]) {
        const option = doc.createElement('option'); option.value = value;
        const title = key === 'textSize' && value === 'system' ? 'System font size' : labels[value];
        if (title) { option.dataset.i18n = title; option.textContent = t(title); }
        else option.textContent = i18n.number(value);
        control.append(option);
      }
    } else { control.type = 'checkbox'; control.setAttribute('role', 'switch'); }
    if (hint) { const help = text('p', hint); help.id = 'hint-' + key; copy.append(help); control.setAttribute('aria-describedby', help.id); }
    control.addEventListener('change', () => {
      const value = control.type === 'checkbox' ? control.checked : key === 'resultsPerPage' ? Number(control.value) : control.value;
      store.update({ [key]: value }); status(root.SFIPreferenceSync?.status().message || 'Changes saved.');
    });
    row.append(copy, control); el('settings-' + category + '-fields').append(row);
  }
  function message(node, key) {
    if (key) node.dataset.i18n = key;
    else delete node.dataset.i18n;
    node.textContent = key ? t(key) : '';
    node.lang = Object.hasOwn(root.SFILocales[store.get().language]?.translation || {}, key) ? store.get().language : 'en';
  }
  function sync() {
    const prefs = store.get();
    doc.querySelectorAll('[data-preference]').forEach(input => {
      input.disabled = root.SFIPreferenceSync?.status().canEdit === false;
      if (input.type === 'checkbox') input.checked = prefs[input.dataset.preference];
      else input.value = prefs[input.dataset.preference];
    });
    const state = store.status(), remote = root.SFIPreferenceSync?.status();
    const storage = el('settingsStorage');
    storage.hidden = remote?.state === 'ready';
    message(storage, remote?.state === 'ready' ? null : remote && !['guest', 'offlineGuest'].includes(remote.state) ? remote.message : !state.storageOK ? 'Storage is unavailable. Changes apply for this page only.' : state.recovered ? 'Stored preferences were invalid. Safe defaults were restored.' : (remote?.message || 'Saved on this browser'));
    i18n.translate(mount);
  }
  function status(message) {
    const node = el('settingsStatus');
    const remote = root.SFIPreferenceSync?.status();
    if (remote && !['guest', 'offlineGuest', 'ready'].includes(remote.state) && ['Changes saved.', 'Preferences imported.'].includes(message)) message = remote.message;
    node.textContent = t((remote && !['guest', 'offlineGuest'].includes(remote.state)) || store.status().storageOK ? message : 'Storage is unavailable. Changes apply for this page only.');
    node.lang = ['en', 'es'].includes(store.get().language) ? store.get().language : 'en';
  }
  root.addEventListener('sfi-preferences', sync);
  root.addEventListener('sfi-preference-sync', sync);
  root.addEventListener('sfi-language', () => { sync(); filter(); el('settingsStatus').textContent = ''; });
  for (const [id, keys] of [['resetAppearance', appearance], ['resetAccessibility', accessibility], ['resetSearch', search]]) {
    el(id).addEventListener('click', () => { store.reset(keys); status('Changes saved.'); });
  }
  el('clearFilters').addEventListener('click', () => status(store.clearFilters() ? 'Search filters cleared.' : 'Filters could not be cleared because storage is unavailable.'));
  el('clearPreferences').addEventListener('click', () => {
    if (root.confirm(t('Clear guest preferences on this browser? Your account settings and saved gear will be preserved.'))) { store.clearGuest(); status('Local preferences cleared.'); }
  });
  el('restoreDefaults').addEventListener('click', () => {
    if (root.confirm(t('Restore all preferences to defaults? Your account and saved gear will be preserved.'))) { store.reset(); status('Changes saved.'); }
  });
  el('exportPreferences').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' }));
    const link = doc.createElement('a'); link.href = url; link.download = 'sfi-preferences-v1.json';
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  el('importPreferences').addEventListener('change', async event => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 16384) throw new Error('Oversize file');
      store.importJSON(await file.text()); status('Preferences imported.');
    } catch { el('settingsStatus').textContent = t('Invalid preference file. Choose a version 1 SFI preferences JSON file with supported values only.'); }
    event.target.value = '';
  });
  function filter() {
    const query = el('settingsSearch').value.trim().toLocaleLowerCase(store.get().language);
    let visible = 0;
    doc.querySelectorAll('[data-settings-section]').forEach(section => {
      const searchable = [...section.querySelectorAll('[data-i18n]')].map(node => node.textContent + ' ' + node.dataset.i18n).join(' ');
      const aliases = section.dataset.settingsKeywords || '';
      const match = !query || (searchable + ' ' + aliases).toLocaleLowerCase(store.get().language).includes(query);
      section.hidden = !match; if (match) visible++;
      doc.querySelector(`[data-settings-link="${section.id}"]`).hidden = !match;
    });
    el('settingsEmpty').hidden = visible !== 0;
  }
  el('settingsSearch').addEventListener('input', filter);
  doc.querySelectorAll('[data-settings-link]').forEach(link => link.addEventListener('click', () => {
    const heading = el(link.dataset.settingsLink).querySelector('h2'); heading.focus();
  }));
  // One read-only account lookup per Settings page. No authentication or personal data enters the store.
  let accountRequested = false;
  async function loadAccount() {
    message(el('accountStatus'), 'Loading account…'); el('accountRetry').hidden = true;
    try {
      const response = await fetch(root.SFI_API_BASE + '/api/sfi/profile', { credentials: 'include', cache: 'no-store' });
      if (response.status === 401) {
        message(el('accountStatus'), 'Sign in to view your account and edit your profile.');
        el('settingsSignIn').hidden = false; el('settingsAccountDetails').hidden = true; return;
      }
      if (!response.ok) throw new Error('Account unavailable');
      const profile = await response.json();
      el('settingsAccountName').textContent = profile.name;
      el('settingsAccountRole').textContent = profile.role_label || profile.role;
      el('settingsAccountDetails').hidden = false; el('settingsSignIn').hidden = true;
      message(el('accountStatus'), '');
    } catch { message(el('accountStatus'), 'Account information could not be loaded. Try again.'); el('accountRetry').hidden = false; }
  }
  function requestAccount() { if (!accountRequested) { accountRequested = true; loadAccount(); } }
  el('accountRetry').addEventListener('click', loadAccount);
  root.addEventListener('hashchange', () => { if (root.location.hash === '#account') requestAccount(); });
  doc.querySelector('[data-settings-link="account"]').addEventListener('click', requestAccount);
  if (root.location.hash === '#account') requestAccount();
  requestAccount();
  sync(); filter();
})(window);
