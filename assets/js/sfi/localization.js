/* Shared i18next DOM adapter for static Liquid pages and asynchronously rendered UI. */
(function (root) {
  'use strict';
  const prefs = root.SFIPreferences, i18n = root.i18next, resources = root.SFILocales;
  if (!prefs || !i18n || !resources) return;
  i18n.init({ lng: prefs.get().language, fallbackLng: 'en', supportedLngs: Object.keys(resources),
    resources, initAsync: false, keySeparator: false, nsSeparator: false,
    returnNull: false, interpolation: { escapeValue: false } });
  const missing = new Set(), bindings = new WeakMap();
  const templates = Object.keys(resources.en.translation).filter(key => key.includes('{{')).map(key => {
    const names = [...key.matchAll(/{{(\w+)}}/g)].map(match => match[1]);
    const pattern = key.split(/{{\w+}}/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.+?)');
    return { key, names, pattern: new RegExp('^' + pattern + '$') };
  });
  const normalize = text => text.replace(/\s+/g, ' ').trim();
  const excluded = 'script,style,code,pre,textarea,[data-no-translate],[translate="no"],.sfi__result-title,.sfi__technical-text,.sfi__gear-item-name,.sfi__autocomplete-item,#roleUser,#settingsAccountName,#profileName,#profileUid,#profileAvatar,#sfiProfileName,#sfiProfileUid,#sfiProfileSkills';
  const t = (key, values = {}) => {
    if (!Object.hasOwn(resources[prefs.get().language]?.translation || {}, key)) missing.add(key);
    return i18n.t(key, { defaultValue: resources.en.translation[key] || key, ...values });
  };
  function bind(node, property, value) {
    const all = bindings.get(node) || {};
    let saved = all[property];
    // A renderer replaced the content: bind the new source instead of stale text.
    if (!saved || value !== saved.output) {
      saved = { source: value, key: normalize(value), values: {} };
      if (!Object.hasOwn(resources.en.translation, saved.key)) {
        for (const entry of templates) {
          const match = saved.key.match(entry.pattern);
          if (match) { saved.key = entry.key; saved.values = Object.fromEntries(entry.names.map((name, i) => [name, match[i + 1]])); break; }
        }
      }
    }
    if (!Object.hasOwn(resources.en.translation, saved.key)) return;
    const translated = t(saved.key, saved.values);
    const output = saved.source.replace(saved.source.trim(), translated);
    if (value !== output) {
      if (property === 'text' && node.parentElement?.tagName === 'OPTION' && !node.parentElement.hasAttribute('value')) node.parentElement.setAttribute('value', node.parentElement.value);
      if (property === 'text') node.nodeValue = output;
      else node.setAttribute(property, output);
    }
    all[property] = { ...saved, output }; bindings.set(node, all);
  }
  function translate(scope = root.document) {
    root.document.documentElement.lang = prefs.get().language;
    const preview = root.document.getElementById('sfiLanguagePreview');
    if (preview) preview.hidden = ['en', 'es'].includes(prefs.get().language);
    const title = root.document.querySelector('title');
    if (title) { title.dataset.sourceTitle ||= title.textContent; const parts = title.dataset.sourceTitle.split(' | '); title.textContent = parts.map(part => t(part)).join(' | '); }
    scope.querySelectorAll('time[datetime]').forEach(el => {
      const value = el.getAttribute('datetime');
      if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return;
      const date = new Date(value.slice(0, 10) + 'T12:00:00Z');
      if (Number.isNaN(date.valueOf())) return;
      const formatted = new Intl.DateTimeFormat(prefs.get().language, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
      if (el.textContent !== formatted) el.textContent = formatted;
    });
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.closest(excluded)) return;
      const text = t(el.dataset.i18n);
      if (el.textContent !== text) el.textContent = text;
      el.lang = Object.hasOwn(resources[prefs.get().language]?.translation || {}, el.dataset.i18n) ? prefs.get().language : 'en';
    });
    const walker = root.document.createTreeWalker(scope, root.NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest(excluded + ',[data-i18n]')) continue;
      bind(node, 'text', node.nodeValue);
    }
    scope.querySelectorAll('[aria-label],[placeholder],[title],[alt],[data-i18n-label],[data-i18n-placeholder],[data-i18n-title]').forEach(el => {
      if (el.closest(excluded)) return;
      for (const [attr, data] of [['aria-label', 'i18nLabel'], ['placeholder', 'i18nPlaceholder'], ['title', 'i18nTitle'], ['alt', 'i18nAlt']]) {
        if (el.dataset[data]) { const value = t(el.dataset[data]); if (el.getAttribute(attr) !== value) el.setAttribute(attr, value); }
        else if (el.hasAttribute(attr)) bind(el, attr, el.getAttribute(attr));
      }
    });
  }
  function changed() {
    i18n.changeLanguage(prefs.get().language); translate();
    root.dispatchEvent(new root.CustomEvent('sfi-language'));
  }
  root.SFII18n = { t, translate, missing: () => [...missing].sort(),
    number: value => new Intl.NumberFormat(prefs.get().language).format(value),
    date: (value, options = {}) => new Intl.DateTimeFormat(prefs.get().language, options).format(new Date(value)) };
  root.addEventListener('sfi-preferences', changed);
  function start() {
    const preview = root.document.createElement('p');
    preview.id = 'sfiLanguagePreview'; preview.className = 'sfi-sync-status'; preview.lang = 'en';
    preview.dataset.i18n = 'This language is a partial preview. Missing translations use English.';
    root.document.querySelector('main')?.prepend(preview);
    translate();
    // Existing page modules render after network requests. Observe changes in the
    // shared shell, preserving source bindings for reversible runtime switching.
    let queued = false;
    const observer = new root.MutationObserver(() => {
      if (queued) return; queued = true;
      queueMicrotask(() => { queued = false; observer.disconnect(); if (!root.document?.body) return; translate(); observe(); });
    });
    function observe() { observer.observe(root.document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'] }); }
    observe();
  }
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start); else start();
})(window);
