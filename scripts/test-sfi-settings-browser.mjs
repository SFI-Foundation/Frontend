// Real Chromium → rendered Jekyll pages → isolated Flask → disposable SQLite.
// Usage: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-sfi-settings-browser.mjs <python> <backend> <site> <screenshots>
// Uses the backend's existing isolated runner; never connects to production.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { createRequire } from 'node:module';
import { once } from 'node:events';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';

// Select a visible settings section through its real navigation before editing.
async function setting(page, key) {
  const field = page.locator('#pref-' + key);
  if (!await field.isVisible()) {
    const id = await field.evaluate(node => node.closest('[data-settings-section]').id);
    const chooser = page.locator('.sfi-settings-sections');
    if (!await chooser.evaluate(node => node.open)) await chooser.locator('summary').click();
    await page.locator('[data-settings-link="' + id + '"]').click();
  }
  return field;
}
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [python, backend, site, output] = process.argv.slice(2);
assert.ok(python && backend && site && output, 'Supply Python, backend, built site, and screenshot directory');
await mkdir(output, { recursive: true });
const bridge = spawn(python, [path.resolve('scripts/sfi-settings-fixture.py'), path.resolve(backend)], { stdio: ['pipe', 'pipe', 'pipe'] });
let fixtureResolve, fixtureReject;
const fixturePromise = new Promise((resolve, reject) => { fixtureResolve = resolve; fixtureReject = reject; });
const startupTimer = setTimeout(() => fixtureReject(new Error('Isolated Flask startup timed out')), 30000);
bridge.stderr.resume(); // Do not print generated credentials or session material.
bridge.on('error', fixtureReject);
bridge.on('exit', code => {
  clearTimeout(startupTimer);
  const error = new Error(`Isolated Flask exited (${code})`);
  fixtureReject(error);
});
createInterface({ input: bridge.stdout }).on('line', line => {
  // The isolated parent can flush a buffered classifier diagnostic at exit.
  // Protocol messages are JSON objects; never echo arbitrary backend output.
  if (!line.trim().startsWith('{')) return;
  const data = JSON.parse(line);
  if (data.fixture) { clearTimeout(startupTimer); fixtureResolve(data.fixture); }
});
let browser;
const results = [];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
try {
  const fixture = await fixturePromise;
  assert.ok(fixture.socket, 'Browser cookie verification requires the isolated HTTP Unix socket; run outside socket-restricted sandbox');
  browser = await chromium.launch({ args: ['--no-sandbox'],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const widths = process.env.SFI_SETTINGS_WIDTHS ? process.env.SFI_SETTINGS_WIDTHS.split(',').map(Number) : [1440,1024,768,390,320];
  assert.ok(widths.length && widths.every(width=>[1440,1024,768,390,320].includes(width)), 'Use supported test widths');
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference', colorScheme: 'light' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.hostname === 'localhost' && url.port === '8605') {
        const headers = await req.allHeaders();
        // Send real browser cookies and CORS headers to the real HTTP server.
        const response = await new Promise((resolve, reject) => {
          const request = http.request({ socketPath: fixture.socket, path: url.pathname + url.search, method: req.method(), headers }, res => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve({ status: res.statusCode, headers: Object.fromEntries(Object.entries(res.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join('\n') : String(value)])), body: Buffer.concat(chunks) }));
          });
          request.on('error', reject);
          request.end(req.postDataBuffer());
        });
        return route.fulfill(response);
      }
      if (url.hostname !== 'localhost' || url.port !== '4000') return route.abort();
      let relative = decodeURIComponent(url.pathname).replace(/^\//, '');
      if (!relative || relative.endsWith('/')) relative += 'index.html';
      const file = path.resolve(site, relative);
      if (!file.startsWith(path.resolve(site) + path.sep)) return route.abort();
      try { return route.fulfill({ body: await readFile(file), contentType: types[path.extname(file)] || 'application/octet-stream' }); }
      catch { return route.fulfill({ status: 404, body: 'Missing test asset' }); }
    });

    const api = async (path, method = 'GET', body) => page.evaluate(async ({path, method, body}) => {
      const response = await fetch('http://localhost:8605' + path, {method, credentials:'include', headers:{'Content-Type':'application/json'}, ...(body === undefined ? {} : {body:JSON.stringify(body)})});
      return {status:response.status,data:await response.json()};
    },{path,method,body});
    async function noOverflow(name) {
      const overflow = await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>el.checkVisibility() && el.getBoundingClientRect().right > innerWidth + 1).slice(0,8).map(el=>({tag:el.tagName,id:el.id,text:el.textContent.slice(0,40),right:el.getBoundingClientRect().right})));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name}: overflow at ${width}: ${JSON.stringify(overflow)}`);
    }
    async function contrast() {
      return page.evaluate(()=>{
        const lum = color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
        return [...document.querySelectorAll('.sfi-settings label, .sfi-settings h1, .sfi-settings h2, .sfi-settings p, .sfi-settings a, .sfi-settings select, .sfi-settings button, .opencs-nav__link, .auth-msg')].filter(el=>el.checkVisibility()).flatMap(el=>{
          let parent=el,bg='rgb(255, 255, 255)';
          while(parent){const value=getComputedStyle(parent).backgroundColor;if(value!=='rgba(0, 0, 0, 0)' && value!=='transparent'){bg=value;break;}parent=parent.parentElement;}
          const color=getComputedStyle(el).color, values=[lum(bg),lum(color)].sort((a,b)=>b-a),ratio=(values[0]+.05)/(values[1]+.05);
          return ratio>=4.5?[]:[{tag:el.tagName,text:el.textContent.slice(0,45),color,bg,ratio}];
        });
      });
    }
    await page.goto('http://localhost:4000/');
    assert.equal(await page.locator('.sfi-settings-gear').count(), 0);
    // Guest preferences remain available at their existing URL.
    await page.goto('http://localhost:4000/settings/');
    await page.locator('#pref-theme').waitFor(); await noOverflow('initial settings');
    await page.locator('[data-settings-link="account"]').click();
    await page.waitForFunction(()=>document.getElementById('accountStatus').textContent.includes('Sign in'));
    assert.equal(await page.locator('#settingsAccountDetails').isVisible(),false);
    for (const theme of ['light','dark']) {
      await (await setting(page, 'theme')).selectOption(theme);
      assert.equal(await page.locator('html').getAttribute('data-sfi-theme'),theme);
      await page.evaluate(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))); });
      for (const accent of ['red','blue','green','purple','orange','teal','monochrome']) {
        await (await setting(page, 'accent')).selectOption(accent);
        await page.evaluate(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))); });
        assert.deepEqual(await contrast(),[],`AA text contrast for ${theme}/${accent}/${width}`);
      }
      await (await setting(page, 'accent')).selectOption('red');
      await page.locator('#appearance').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,`settings-${theme}-${width}.png`)});
    }
    await (await setting(page, 'theme')).selectOption('system');
    await page.emulateMedia({colorScheme:'dark'}); await page.waitForFunction(()=>document.documentElement.dataset.sfiTheme==='dark');
    await page.emulateMedia({colorScheme:'light'}); await page.waitForFunction(()=>document.documentElement.dataset.sfiTheme==='light');
    await (await setting(page, 'theme')).selectOption('dark');
    await (await setting(page, 'textSize')).selectOption('extra-large');
    await (await setting(page, 'enhancedFocus')).check(); await (await setting(page, 'lineSpacing')).check();
    await (await setting(page, 'letterSpacing')).check(); await (await setting(page, 'largeTargets')).check();
    await (await setting(page, 'readingFont')).check(); await (await setting(page, 'highContrast')).check();
    await (await setting(page, 'noTransitions')).check();
    await noOverflow('large accessibility settings');
    assert.deepEqual(await contrast(),[],'High-contrast text');
    await page.reload(); assert.equal(await page.locator('#pref-theme').inputValue(),'dark');
    assert.equal(await page.locator('#pref-textSize').inputValue(),'extra-large');
    assert.equal(await page.locator('#pref-enhancedFocus').isChecked(),true);
    await (await setting(page, 'theme')).focus(); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');
    await page.locator('#resetAccessibility').click();
    await (await setting(page, 'language')).selectOption('es');
    assert.equal(await page.locator('.sfi-settings-heading h1').textContent(),'Configuración');
    await page.locator('#settingsSearch').fill('tamaño');
    assert.equal(await page.locator('#accessibility').isVisible(),true);
    await page.locator('#settingsSearch').fill('nonsense-no-result');
    assert.equal(await page.locator('#settingsEmpty').isVisible(),true);
    await page.locator('#settingsSearch').fill('');
    await (await setting(page, 'language')).selectOption('ja');
    assert.equal(await page.locator('.sfi-settings-heading h1').textContent(),'設定');
    assert.equal(await page.locator('#restoreDefaults').textContent(),'Restore all defaults');
    await (await setting(page, 'language')).selectOption('en');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.documentElement.dataset.sfiMotion==='reduced');
    await page.emulateMedia({reducedMotion:'no-preference'});
    // Import/export exercises actual file controls; invalid identity data cannot apply.
    await page.locator('#importPreferences').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":1,"preferences":{"theme":"light","role":"Admin"}}')});
    await page.waitForFunction(()=>document.getElementById('settingsStatus').textContent.includes('Invalid preference'));
    assert.equal(await page.locator('#pref-theme').inputValue(),'dark');
    await page.locator('#importPreferences').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from('{"version":1,"preferences":{"theme":"light","resultsPerPage":10,"showMetadata":false,"pdfIndicators":false}}')});
    await page.waitForFunction(()=>document.getElementById('settingsStatus').textContent.includes('imported'));
    assert.equal(await page.locator('#pref-resultsPerPage').inputValue(),'10');
    const downloaded=page.waitForEvent('download'); await page.locator('#exportPreferences').click();
    const download=await downloaded; assert.equal(download.suggestedFilename(),'sfi-preferences-v1.json');
    // Native modal: opening, keyboard close, and focus return.
    await page.locator('#sfi-main').focus(); await page.keyboard.press('?');
    await page.locator('.sfi-shortcut-dialog').waitFor({state:'visible'}); await page.keyboard.press('Escape');
    assert.equal(await page.locator('.sfi-shortcut-dialog').isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'sfi-main');
    await page.locator('#settingsSearch').click(); await page.keyboard.type('?');
    assert.equal(await page.locator('.sfi-shortcut-dialog').isVisible(),false); await page.locator('#settingsSearch').fill('');
    // Real HttpOnly cookies and Flask profile, with no client-side role controls.
    await (await setting(page, 'theme')).selectOption('dark');
    await page.goto('http://localhost:4000/login/');
    await page.locator('#loginUid').fill('nonexistent_settings_test_user'); await page.locator('#loginPass').fill(fixture.password); await page.locator('#loginBtn').click();
    await page.locator('.auth-msg.error').waitFor({state:'visible'});
    assert.deepEqual(await contrast(),[],'Dark-theme authentication error contrast');
    await page.locator('#loginUid').fill(fixture.uid); await page.locator('#loginPass').fill(fixture.password); await page.locator('#loginBtn').click();
    await page.locator('#profileCard').waitFor({state:'visible'});
    await page.locator('#accountToggle').click();
    await page.locator('#accountMenu [href="/settings/"]').click();
    await page.locator('#settingsAccountDetails').waitFor({state:'visible'});
    assert.equal(await page.locator('#settingsAccountName').textContent(),'Integration Member');
    assert.equal((await api('/api/sfi/profile/roles')).status,403);
    page.once('dialog',d=>d.accept()); await page.locator('#clearPreferences').click();
    assert.equal((await api('/api/sfi/profile')).status,200,'Reset retains the authenticated session');
    await page.goto('http://localhost:4000/logout/'); await page.waitForURL('http://localhost:4000/login/');
    await page.locator('#loginUid').fill(fixture.admin_uid); await page.locator('#loginPass').fill(fixture.password); await page.locator('#loginBtn').click();
    await page.locator('#profileCard').waitFor({state:'visible'});
    await page.locator('#accountToggle').click();
    await page.locator('#accountMenu [href="/settings/"]').click();
    await page.locator('#settingsAccountDetails').waitFor({state:'visible'});
    await page.waitForFunction(()=>SFIPreferenceSync.status().state==='ready');
    assert.equal(await page.locator('#settingsAccountRole').textContent(),'Admin'); assert.equal((await api('/api/sfi/users')).status,200);
    // Seed a synthetic canonical item through the existing authorized API only.
    const created=await api('/api/sfi/specs','POST',{spec_number:`99.${[1440,1024,768,390,320].indexOf(width)+1}`,product_name:'Settings browser harness',category:'Testing'});
    assert.equal(created.status,201,JSON.stringify(created.data));
    await (await setting(page, 'resultsPerPage')).selectOption('10'); await (await setting(page, 'showMetadata')).uncheck(); await (await setting(page, 'pdfIndicators')).uncheck();
    await page.waitForFunction(()=>SFIPreferenceSync.status().state==='ready');
    await page.goto('http://localhost:4000/sfi-specs/?q=Settings');
    await page.waitForFunction(()=>SFIPreferenceSync.status().state==='ready');
    await page.waitForFunction(()=>document.querySelector('#sfiResults article'));
    await page.locator('#viewPublicBtn').click();
    await page.locator('#sfiSearch').waitFor({state:'visible'});
    assert.equal(await page.locator('#sfiResults a').count(),0,'Unapproved PDFs never have links');
    assert.equal(await page.locator('#sfiResults details').first().isVisible(),false);
    assert.ok(await page.locator('#sfiResults mark').count()>0);
    await page.locator('#sfi-main').focus(); await page.keyboard.press('/'); assert.equal(await page.evaluate(()=>document.activeElement.id),'sfiSearch');
    await noOverflow('canonical search');
    await page.goto('http://localhost:4000/settings/');
    // Semantics for basic screen-reader-oriented verification.
    assert.equal(await page.locator('main').count(),1); assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('[data-preference]').evaluateAll(inputs=>inputs.every(input=>document.querySelector(`label[for="${input.id}"]`))),true);
    assert.deepEqual(errors,[],'No browser JavaScript errors');
    results.push({width,guest:true,member:true,admin:true,themeAndAccents:true,contrast:true,keyboard:true,importExport:true,persistence:true,search:true,pdfGuard:true,overflow:false,errors});
    await context.close();
  }
} finally {
  await writeFile(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2));
  if (browser) await browser.close();
  const stopped = once(bridge, 'exit');
  bridge.stdin.end();
  const [code] = await stopped;
  assert.equal(code, 0, 'Isolated backend must shut down cleanly');
}
console.log('PASS: Settings controls, persistence, themes/accents, responsive layout, keyboard help, safe import/export, guest/member/admin accounts and canonical search/PDF protection.');
