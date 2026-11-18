/* Non-sensitive preference state. Guest storage loads before CSS; account hydration is separate. */
(function (root) {
  'use strict';
  /** @typedef {'light'|'dark'|'system'} Theme */
  /** @typedef {'en'|'es'|'fr'|'de'|'zh-CN'|'ja'} Language */
  /** @typedef {{theme: Theme, accent: 'red'|'blue'|'green'|'purple'|'orange'|'teal'|'monochrome', language: Language, density: 'comfortable'|'compact',
   * corners: 'standard'|'rounded', textSize: 'system'|'small'|'default'|'large'|'extra-large', lineSpacing: boolean, letterSpacing: boolean,
   * underlineLinks: boolean, highContrast: boolean, enhancedFocus: boolean,
   * reducedMotion: boolean, noTransitions: boolean, largeTargets: boolean,
   * readingFont: boolean, contentWidth: 'standard'|'reading', reducedDistractions: boolean,
   * resultsPerPage: 10|20|50, showMetadata: boolean, rememberFilters: boolean,
   * highlightMatches: boolean, resultDensity: 'comfortable'|'compact', pdfIndicators: boolean,
   * shortcuts: boolean}} Preferences */
  const KEY = 'sfi.preferences.v1', FILTER_KEY = 'sfi.searchFilters.v1';
  const DEFAULTS = Object.freeze({ theme: 'system', accent: 'red', language: 'en',
    density: 'comfortable', corners: 'standard', textSize: 'system',
    lineSpacing: false, letterSpacing: false, underlineLinks: false,
    highContrast: false, enhancedFocus: false, reducedMotion: false,
    noTransitions: false, largeTargets: false, readingFont: false,
    contentWidth: 'standard', reducedDistractions: false, resultsPerPage: 20,
    showMetadata: true, rememberFilters: false, highlightMatches: true,
    resultDensity: 'comfortable', pdfIndicators: true, shortcuts: true });
  const ENUMS = Object.freeze({ theme: ['light', 'dark', 'system'],
    accent: ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'monochrome'],
    language: ['en', 'es', 'fr', 'de', 'zh-CN', 'ja'], density: ['comfortable', 'compact'],
    corners: ['standard', 'rounded'], textSize: ['system', 'small', 'default', 'large', 'extra-large'],
    contentWidth: ['standard', 'reading'], resultsPerPage: [10, 20, 50],
    resultDensity: ['comfortable', 'compact'] });
  const ACCENTS = Object.freeze({ red: ['#ad2828', '#861e1e', '#ffb4b0'],
    blue: ['#235f9a', '#16446f', '#a6cfff'], green: ['#21633f', '#174a2e', '#99ddb4'],
    purple: ['#7540a3', '#542b79', '#d8b7ff'], orange: ['#954900', '#713700', '#ffc493'],
    teal: ['#08666c', '#064b50', '#92dce2'], monochrome: ['#414955', '#252c35', '#d8e0eb'] });
  function validate(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(input))) throw new Error('Invalid preferences');
    const result = {};
    for (const key of Object.keys(input)) {
      if (!Object.hasOwn(DEFAULTS, key)) throw new Error('Unsupported preference');
      const value = input[key];
      if (ENUMS[key] ? !ENUMS[key].includes(value) : typeof value !== 'boolean') throw new Error('Invalid preference value');
      result[key] = value;
    }
    return result;
  }
  function parse(raw) {
    if (typeof raw !== 'string' || raw.length > 16384) throw new Error('Invalid preference file');
    const data = JSON.parse(raw);
    if (!data || Array.isArray(data) || Object.keys(data).length !== 2 ||
        data.version !== 1 || !Object.hasOwn(data, 'preferences')) throw new Error('Unsupported preference version');
    return { ...DEFAULTS, ...validate(data.preferences) };
  }
  let current = { ...DEFAULTS }, storageOK = true, recovered = false, accountMode = false;
  try { const raw = root.localStorage.getItem(KEY); if (raw) current = parse(raw); }
  catch (error) { recovered = error instanceof SyntaxError || error.message?.startsWith('Invalid') || error.message?.startsWith('Unsupported'); storageOK = recovered; }
  const system = root.matchMedia?.('(prefers-color-scheme: dark)');
  const motion = root.matchMedia?.('(prefers-reduced-motion: reduce)');
  function apply() {
    const html = root.document.documentElement;
    html.dataset.sfiTheme = current.theme === 'system' ? (system?.matches ? 'dark' : 'light') : current.theme;
    html.dataset.sfiAccent = current.accent;
    html.dataset.sfiTextSize = current.textSize;
    html.style.fontSize = ({ small: '87.5%', default: '100%', large: '112.5%', 'extra-large': '125%' })[current.textSize] || '';
    html.dataset.sfiMotion = current.reducedMotion || motion?.matches ? 'reduced' : 'normal';
    for (const key of ['density', 'corners', 'contentWidth', 'resultDensity']) html.dataset['sfi' + key[0].toUpperCase() + key.slice(1)] = current[key];
    for (const key of ['lineSpacing', 'letterSpacing', 'underlineLinks', 'highContrast', 'enhancedFocus', 'noTransitions', 'largeTargets', 'readingFont', 'reducedDistractions']) {
      html.dataset['sfi' + key[0].toUpperCase() + key.slice(1)] = String(current[key]);
    }
    // Allowlisted static palette only; no imported CSS or arbitrary values.
    const [accent, strong, linkDark] = ACCENTS[current.accent];
    html.style.setProperty('--sfi-accent', accent);
    html.style.setProperty('--sfi-accent-strong', strong);
    html.style.setProperty('--sfi-accent-link-dark', linkDark);
  }
  function announce() { apply(); root.dispatchEvent(new root.CustomEvent('sfi-preferences', { detail: { ...current } })); }
  function persist() {
    if (accountMode) return;
    try { root.localStorage.setItem(KEY, JSON.stringify({ version: 1, preferences: current })); storageOK = true; recovered = false; }
    catch { storageOK = false; }
  }
  function clearFilters() { try { root.localStorage.removeItem(FILTER_KEY); return true; } catch { return false; } }
  function update(patch) {
    current = { ...current, ...validate(patch) };
    if (!current.rememberFilters) clearFilters();
    persist(); announce(); return { ...current };
  }
  function reset(keys = Object.keys(DEFAULTS)) {
    const patch = {};
    for (const key of keys) { if (!Object.hasOwn(DEFAULTS, key)) throw new Error('Unsupported preference'); patch[key] = DEFAULTS[key]; }
    return update(patch);
  }
  function clear() {
    current = { ...DEFAULTS };
    try { if (!accountMode) root.localStorage.removeItem(KEY); root.localStorage.removeItem(FILTER_KEY); storageOK = true; recovered = false; }
    catch { storageOK = false; }
    announce();
  }
  function readCategory() {
    if (!current.rememberFilters) return null;
    try { const data = JSON.parse(root.localStorage.getItem(FILTER_KEY)); return data?.version === 1 && typeof data.category === 'string' && data.category.length <= 100 ? data.category : null; }
    catch { return null; }
  }
  function rememberCategory(category) {
    if (!current.rememberFilters || typeof category !== 'string' || category.length > 100) return;
    try { root.localStorage.setItem(FILTER_KEY, JSON.stringify({ version: 1, category })); } catch { storageOK = false; }
  }
  root.SFIPreferences = Object.freeze({ DEFAULTS, ENUMS, ACCENTS, KEY, FILTER_KEY, validate, parse,
    get: () => ({ ...current }), status: () => ({ storageOK, recovered }), update, reset, clear,
    clearFilters, readCategory, rememberCategory,
    clearGuest: () => {
      try { root.localStorage.removeItem(KEY); root.localStorage.removeItem(FILTER_KEY); storageOK = true; recovered = false; }
      catch { storageOK = false; }
      if (!accountMode) { current = { ...DEFAULTS }; announce(); }
    },
    accountMode: value => { accountMode = value; },
    replace: values => { current = { ...DEFAULTS, ...validate(values) }; announce(); },
    restoreGuest: () => {
      accountMode = false;
      try { const raw = root.localStorage.getItem(KEY); current = raw ? parse(raw) : { ...DEFAULTS }; }
      catch { current = { ...DEFAULTS }; }
      announce();
    },
    exportJSON: () => JSON.stringify({ version: 1, preferences: current }, null, 2),
    importJSON: raw => { const next = parse(raw); return update(next); } });
  system?.addEventListener('change', announce); motion?.addEventListener('change', announce);
  root.addEventListener('storage', event => {
    if (accountMode || (event.key !== KEY && event.key !== null)) return;
    try { current = event.newValue ? parse(event.newValue) : { ...DEFAULTS }; recovered = false; announce(); }
    catch { /* Another tab's invalid data cannot replace this tab's valid state. */ }
  });
  apply();
})(window);
