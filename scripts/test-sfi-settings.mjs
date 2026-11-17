import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
function setup({ raw, blocked = false, dark = false, motion = false, page = false } = {}) {
  const dom = new JSDOM(page ? read('navigation/settings.html') : '<html><head></head><body class="sfi-site"><input id="sfiSearch"><button>Control</button><p tabindex="0">Content</p><a data-i18n="Settings">Settings</a></body></html>', { url: 'https://sfi.test/settings/', runScripts: 'outside-only' });
  const w = dom.window, media = {};
  w.matchMedia = query => media[query] ||= { matches: query.includes('color-scheme') ? dark : motion, listeners: [], addEventListener(_, fn) { this.listeners.push(fn); } };
  if (raw) w.localStorage.setItem('sfi.preferences.v1', raw);
  w.localStorage.setItem('session', 'do-not-touch'); w.localStorage.setItem('sfiMyGear', 'keep-gear');
  if (blocked) Object.defineProperty(w, 'localStorage', { get() { throw new w.DOMException('Storage blocked', 'SecurityError'); } });
  w.fetch = async () => ({ ok: false, status: 401 });
  const load = file => w.eval(read(file));
  load('assets/js/sfi/preferences.js');
  const prefs = w.SFIPreferences;
  const update = value => prefs.update(w.JSON.parse(JSON.stringify(value)));
  const plain = value => JSON.parse(JSON.stringify(value));
  const reload = () => load('assets/js/sfi/preferences.js');
  const locale = () => { for (const file of ['assets/js/vendor/i18next.min.js','assets/js/sfi/locales.js','assets/js/sfi/localization.js']) load(file); };
  return { dom, w, media, prefs, update, plain, reload, locale, load };
}
function check(name, fn) { test(name, async () => { const h = setup(); try { await fn(h); } finally { h.dom.window.close(); } }); }
check('default preferences are complete, non-sensitive and browser-local', ({prefs,w}) => {
  assert.equal(prefs.get().theme,'system'); assert.equal(prefs.get().resultsPerPage,20);
  assert.equal(prefs.get().rememberFilters,false); assert.equal(prefs.get().language,'en');
  assert.equal(w.document.documentElement.dataset.sfiTheme,'light');
  assert.doesNotMatch(prefs.exportJSON(), /session|role|password|email|token|uid/);
});
check('light/dark themes and OS changes preserve an explicit selection', ({update,w,media}) => {
  const system = media['(prefers-color-scheme: dark)'];
  system.matches = true; system.listeners.forEach(fn=>fn()); assert.equal(w.document.documentElement.dataset.sfiTheme,'dark');
  update({theme:'light'}); system.listeners.forEach(fn=>fn()); assert.equal(w.document.documentElement.dataset.sfiTheme,'light');
  update({theme:'dark'}); system.matches=false; system.listeners.forEach(fn=>fn()); assert.equal(w.document.documentElement.dataset.sfiTheme,'dark');
  update({theme:'system'}); assert.equal(w.document.documentElement.dataset.sfiTheme,'light');
});
check('all seven accents update static shared tokens and have white-text AA contrast', ({prefs,update,w}) => {
  const luminance = hex => hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  for (const [accent,colors] of Object.entries(prefs.ACCENTS)) {
    update({accent}); assert.equal(w.document.documentElement.style.getPropertyValue('--sfi-accent'),colors[0]);
    assert.ok(1.05/(luminance(colors[0])+.05)>=4.5, accent);
    assert.ok(1.05/(luminance(colors[1])+.05)>=4.5, accent+' hover');
  }
});
check('theme and accessibility survive storage reload', ({prefs,update,reload,w}) => {
  update({theme:'dark',textSize:'extra-large',enhancedFocus:true,lineSpacing:true,readingFont:true}); reload();
  assert.equal(w.SFIPreferences.get().theme,'dark'); assert.equal(w.SFIPreferences.get().lineSpacing,true);
  assert.equal(w.document.documentElement.style.fontSize,'125%'); assert.equal(w.document.documentElement.dataset.sfiEnhancedFocus,'true');
});
check('OS reduced motion cannot be overridden by normal animations', ({w,update,media}) => {
  const motion=media['(prefers-reduced-motion: reduce)']; motion.matches=true; motion.listeners.forEach(fn=>fn());
  update({reducedMotion:false}); assert.equal(w.document.documentElement.dataset.sfiMotion,'reduced');
  motion.matches=false; motion.listeners.forEach(fn=>fn()); assert.equal(w.document.documentElement.dataset.sfiMotion,'normal');
  update({reducedMotion:true}); assert.equal(w.document.documentElement.dataset.sfiMotion,'reduced');
});
check('schema rejects unknown keys, identity, prototype pollution and wrong types', ({prefs,w}) => {
  for (const patch of [{role:'Admin'},{token:'secret'},{uid:1},{theme:'evil'},{resultsPerPage:1000},{resultsPerPage:'20'},{highContrast:'true'},[],null]) {
    assert.throws(()=>prefs.validate(w.JSON.parse(JSON.stringify(patch))));
  }
  assert.throws(()=>prefs.validate(w.JSON.parse('{"__proto__":{"isAdmin":true}}')));
  assert.equal({}.isAdmin,undefined);
});
check('invalid imports are atomic and credentials/roles cannot enter the store', ({prefs,update}) => {
  update({theme:'dark'});
  for (const raw of ['{','[]','null','{"version":2,"preferences":{}}','{"version":1,"preferences":{"theme":"light","role":"Admin"}}','{"version":1,"preferences":{},"token":"x"}','x'.repeat(20000)]) {
    assert.throws(()=>prefs.importJSON(raw)); assert.equal(prefs.get().theme,'dark');
  }
  prefs.importJSON('{"version":1,"preferences":{"language":"es","resultsPerPage":50}}');
  assert.equal(prefs.get().language,'es'); assert.equal(prefs.get().theme,'system');
});
test('malformed stored JSON and invalid schema recover to safe defaults', () => {
  for (const raw of ['{','null','{"version":1,"preferences":{"accent":"url(javascript:evil)"}}']) {
    const h=setup({raw}); assert.equal(h.prefs.get().accent,'red'); assert.equal(h.prefs.status().recovered,true); h.dom.window.close();
  }
});
test('blocked storage preserves in-memory settings and reports failure', () => {
  const h=setup({blocked:true}); h.update({theme:'dark'});
  assert.equal(h.prefs.get().theme,'dark'); assert.equal(h.prefs.status().storageOK,false); h.prefs.clear();
  assert.equal(h.prefs.get().theme,'system'); h.dom.window.close();
});
check('resets touch only preferences and remembered filters', ({prefs,update,w,plain}) => {
  update({theme:'dark',rememberFilters:true}); prefs.rememberCategory('Auto Racing'); assert.equal(prefs.readCategory(),'Auto Racing');
  prefs.reset(['theme']); assert.equal(prefs.get().theme,'system'); assert.equal(prefs.get().rememberFilters,true);
  prefs.clear(); assert.equal(w.localStorage.getItem(prefs.KEY),null); assert.equal(w.localStorage.getItem(prefs.FILTER_KEY),null);
  assert.equal(w.localStorage.getItem('session'),'do-not-touch'); assert.equal(w.localStorage.getItem('sfiMyGear'),'keep-gear');
  assert.deepEqual(plain(prefs.get()),plain(prefs.DEFAULTS));
});
check('remembered categories require opt-in; search text is never stored', ({prefs,update,w}) => {
  prefs.rememberCategory('Auto Racing'); assert.equal(prefs.readCategory(),null);
  update({rememberFilters:true}); prefs.rememberCategory('Auto Racing'); assert.equal(prefs.readCategory(),'Auto Racing');
  assert.deepEqual(JSON.parse(w.localStorage.getItem(prefs.FILTER_KEY)),{version:1,category:'Auto Racing'});
  update({rememberFilters:false}); assert.equal(w.localStorage.getItem(prefs.FILTER_KEY),null);
});
check('cross-tab updates apply and invalid updates cannot replace valid state', ({w,prefs}) => {
  w.dispatchEvent(new w.StorageEvent('storage',{key:prefs.KEY,newValue:'{"version":1,"preferences":{"theme":"dark"}}'}));
  assert.equal(prefs.get().theme,'dark');
  w.dispatchEvent(new w.StorageEvent('storage',{key:prefs.KEY,newValue:'broken'})); assert.equal(prefs.get().theme,'dark');
  w.dispatchEvent(new w.StorageEvent('storage',{key:prefs.KEY,newValue:null})); assert.equal(prefs.get().theme,'system');
});
check('language switches immediately, locale formats numbers and missing keys fall back', ({locale,update,w}) => {
  locale(); update({language:'es'}); assert.equal(w.SFII18n.t('Settings'),'Configuración');
  assert.equal(w.document.querySelector('[data-i18n]').textContent,'Configuración');
  update({language:'ja'}); assert.equal(w.SFII18n.t('Settings'),'設定');
  assert.equal(w.SFII18n.t('Restore all defaults'),'Restore all defaults');
  assert.equal(w.SFII18n.t('Unregistered safe text'),'Unregistered safe text');
  assert.equal(w.SFII18n.number(12345),new Intl.NumberFormat('ja').format(12345));
});
check('English/Spanish dictionaries have identical nonempty keys and all static new text has translations', ({locale,w}) => {
  locale(); const resources=w.SFILocales;
  assert.deepEqual(Object.keys(resources.en.translation),Object.keys(resources.es.translation));
  for(const value of Object.values(resources.es.translation)) assert.equal(typeof value,'string');
  const page = new JSDOM(read('navigation/settings.html') + read('_includes/sfi/nav.html'));
  for(const node of page.window.document.querySelectorAll('[data-i18n]')) {
    if (node.dataset.i18n.includes('{{')) continue;
    assert.ok(Object.hasOwn(resources.en.translation,node.dataset.i18n),node.dataset.i18n);
  }
  for (const path of ['index.md','navigation/sfi-specs.md','navigation/about.md','navigation/news-events.md','navigation/contact.md','navigation/login.md']) {
    const source=read(path); const title=(source.match(/^nav_title: (.+)$/m)||source.match(/^title: (.+)$/m))[1];
    assert.ok(Object.hasOwn(resources.es.translation,title), 'Navigation translation: '+title);
  }
  const settings = read('assets/js/sfi/settings.js');
  for(const match of settings.matchAll(/\['(?:appearance|language|accessibility|search|shortcuts)', '\w+', '([^']+)'(?:, '([^']+)')?\]/g)) {
    assert.ok(Object.hasOwn(resources.en.translation,match[1]),match[1]);
    if(match[2]) assert.ok(Object.hasOwn(resources.es.translation,match[2]),match[2]);
  }
  page.window.close();
});
check('keyboard shortcuts avoid editable controls, browser modifiers and disabled mode', ({w,load,update}) => {
  const input=w.document.getElementById('sfiSearch'); input.getClientRects=()=>[{}]; load('assets/js/sfi/shortcuts.js');
  const press=(target,key,extras={})=>{const e=new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...extras}); target.dispatchEvent(e); return e;};
  assert.equal(press(w.document.body,'/').defaultPrevented,true); assert.equal(w.document.activeElement,input);
  assert.equal(press(input,'/').defaultPrevented,false); assert.equal(press(w.document.querySelector('button'),'?').defaultPrevented,false);
  assert.equal(press(w.document.body,',',{ctrlKey:true}).defaultPrevented,false);
  assert.equal(press(w.document.body,'/',{metaKey:true}).defaultPrevented,false);
  update({shortcuts:false}); assert.equal(press(w.document.body,'/').defaultPrevented,false);
});
test('settings controls save, settings search filters categories, guest account shows sign-in', async () => {
  const h=setup({page:true}); try {
    h.locale(); h.load('assets/js/sfi/settings.js'); await new Promise(r=>setImmediate(r));
    const doc=h.w.document; const theme=doc.getElementById('pref-theme'); theme.value='dark'; theme.dispatchEvent(new h.w.Event('change'));
    assert.equal(h.prefs.get().theme,'dark'); assert.equal(doc.getElementById('settingsAccountDetails').hidden,true);
    assert.equal(doc.getElementById('settingsSignIn').hidden,false);
    const search=doc.getElementById('settingsSearch'); search.value='dark mode'; search.dispatchEvent(new h.w.Event('input'));
    assert.equal(doc.getElementById('appearance').hidden,false); assert.equal(doc.getElementById('notifications').hidden,true);
    search.value='no possible setting here'; search.dispatchEvent(new h.w.Event('input')); assert.equal(doc.getElementById('settingsEmpty').hidden,false);
    const labels=[...doc.querySelectorAll('[data-preference]')]; assert.equal(labels.length,Object.keys(h.prefs.DEFAULTS).length);
    labels.forEach(control=>assert.ok(doc.querySelector(`label[for="${control.id}"]`)));
  } finally { h.dom.window.close(); }
});
test('authenticated account values are rendered as text and read via credentialed no-store GET', async () => {
  const h=setup({page:true}); try {
    let request; h.w.SFI_API_BASE='https://backend.test';
    h.w.fetch=async (url,options)=>{request={url,options};return {ok:true,status:200,json:async()=>({name:'<img src=x onerror=alert(1)>',role:'User',role_label:'Member'})};};
    h.locale(); h.load('assets/js/sfi/settings.js'); await new Promise(r=>setImmediate(r));
    assert.equal(request.url,'https://backend.test/api/sfi/profile'); assert.equal(request.options.credentials,'include'); assert.equal(request.options.cache,'no-store'); assert.equal(request.options.method,undefined);
    assert.equal(h.w.document.getElementById('settingsAccountDetails').hidden,false);
    assert.equal(h.w.document.querySelector('#settingsAccountName img'),null);
    assert.equal(h.w.document.getElementById('settingsAccountRole').textContent,'Member');
    const search=h.w.document.getElementById('settingsSearch'); search.value='onerror'; search.dispatchEvent(new h.w.Event('input'));
    assert.equal(h.w.document.getElementById('account').hidden,true,'Settings search never indexes personal account values');
  } finally { h.dom.window.close(); }
});


test('blocked-storage warning and authenticated status survive live translation', async () => {
  const h=setup({page:true,blocked:true}); try {
    h.w.fetch=async()=>({ok:true,status:200,json:async()=>({name:'Test member',role_label:'Member'})});
    h.locale(); h.load('assets/js/sfi/settings.js'); await new Promise(r=>setImmediate(r));
    assert.match(h.w.document.getElementById('settingsStorage').textContent,/Storage is unavailable/);
    h.update({language:'es'});
    assert.match(h.w.document.getElementById('settingsStorage').textContent,/almacenamiento no está disponible/);
    assert.equal(h.w.document.getElementById('accountStatus').textContent,'');
  } finally { h.dom.window.close(); }
});
