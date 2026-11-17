(function (root) {
  'use strict';
  const prefs = root.SFIPreferences, i18n = root.i18next, resources = root.SFILocales;
  if (!prefs || !i18n || !resources) return;
  i18n.init({ lng: prefs.get().language, fallbackLng: 'en', supportedLngs: Object.keys(resources),
    resources, initAsync: false, keySeparator: false, nsSeparator: false,
    returnNull: false, interpolation: { escapeValue: false } });
  const t = (key, values = {}) => i18n.t(key, { defaultValue: resources.en.translation[key] || key, ...values });
  function translate(scope = root.document) {
    scope.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    for (const [attr, data] of [['aria-label', 'i18nLabel'], ['placeholder', 'i18nPlaceholder'], ['title', 'i18nTitle']]) {
      scope.querySelectorAll(`[data-${data.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}]`).forEach(el => el.setAttribute(attr, t(el.dataset[data])));
    }
    // Editorial content stays English. Mark translated fragments individually.
    scope.querySelectorAll('[data-i18n], [data-i18n-label], [data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18n || el.dataset.i18nLabel || el.dataset.i18nPlaceholder;
      el.lang = Object.hasOwn(resources[prefs.get().language]?.translation || {}, key) ? prefs.get().language : 'en';
    });
  }
  function changed() {
    i18n.changeLanguage(prefs.get().language); translate();
    root.dispatchEvent(new root.CustomEvent('sfi-language'));
  }
  root.SFII18n = { t, translate,
    number: value => new Intl.NumberFormat(prefs.get().language).format(value),
    date: (value, options = {}) => new Intl.DateTimeFormat(prefs.get().language, options).format(value) };
  root.addEventListener('sfi-preferences', changed);
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => translate());
  else translate();
})(window);
