// Real Chromium → rendered Jekyll pages → isolated Flask → disposable SQLite.
// Usage: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-sfi-account-browser.mjs <python> <backend> <site> <screenshots>
// Uses the backend's existing isolated runner; never connects to production.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { createRequire } from 'node:module';
import { once } from 'node:events';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { AxeBuilder } = require(process.env.AXE_MODULE || '@axe-core/playwright');
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
  const audits = [];
  for (const width of process.env.SFI_ACCOUNT_SMOKE ? [1440] : [1440, 1024, 768, 375, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', hasTouch: width <= 768, isMobile: width <= 375 });
    const page = await context.newPage(), errors = [];
    page.setDefaultTimeout(15000);
    console.log(`START ${width}px`);
    let profileStatus = 0, profileOffline = false, profileDelay = 0;
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.origin === 'http://localhost:8605') {
        if (url.pathname === '/api/sfi/profile' && req.method() === 'GET') {
          if (profileDelay) await new Promise(resolve => setTimeout(resolve, profileDelay));
          if (profileOffline) return route.abort('failed');
          if (profileStatus) return route.fulfill({ status: profileStatus, contentType: 'application/json', body: '{}' });
        }
        const headers = await req.allHeaders();
        const response = await new Promise((resolve, reject) => {
          const request = http.request({ socketPath: fixture.socket, path: url.pathname + url.search, method: req.method(), headers }, res => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve({ status: res.statusCode, headers: Object.fromEntries(Object.entries(res.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join('\n') : String(value)])), body: Buffer.concat(chunks) }));
          });
          request.on('error', reject); request.end(req.postDataBuffer());
        });
        return route.fulfill(response);
      }
      if (url.origin !== 'http://localhost:4000') return route.abort();
      let relative = decodeURIComponent(url.pathname).replace(/^\//, '');
      if (!relative || relative.endsWith('/')) relative += 'index.html';
      const file = path.resolve(site, relative);
      if (!file.startsWith(path.resolve(site) + path.sep)) return route.abort();
      try { return route.fulfill({ body: await readFile(file), contentType: types[path.extname(file)] || 'application/octet-stream' }); }
      catch { return route.fulfill({ status: 404, body: 'Missing test asset' }); }
    });
    async function nav(target = page) {
      if (await target.locator('#navToggle').isVisible() && await target.locator('#navToggle').getAttribute('aria-expanded') !== 'true') await target.locator('#navToggle').click();
    }
    async function signedIn(name, target = page) {
      await target.waitForFunction(expected => document.getElementById('accountName').textContent === expected, name);
      assert.equal(await target.locator('#accountSignIn').evaluate(el => el.hidden), true);
    }
    async function capture(label) {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: horizontal overflow at ${width}`);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `${label}-${width}.png`) });
    }
    async function login(uid, expected) {
      console.log(`LOGIN ${width}px`);
      await page.goto('http://localhost:4000/login/');
      await page.waitForFunction(() => window.SFIAuth?.snapshot().state === 'guest');
      await page.locator('#loginUid').fill(uid); await page.locator('#loginPass').fill(fixture.password);
      await page.locator('#loginBtn').click(); await signedIn(expected);
      assert.equal(await page.locator('#navAuth').textContent(), 'My Profile', 'Footer follows the same authenticated session');
      console.log(`AUTHENTICATED ${width}px`);
      assert.equal(new URL(page.url()).pathname, '/login/', 'Successful login updates navigation without a reload');
    }
    await page.goto('http://localhost:4000/'); await nav();
    console.log(`GUEST ${width}px`);
    await page.locator('#accountSignIn').waitFor();
    await capture('signed-out');
    assert.equal(await page.locator('#accountToggle').isVisible(), false);
    await login(fixture.uid, width === 1440 ? 'Integration Member' : `Integration Member ${[1440,1024,768,375,320][[1440,1024,768,375,320].indexOf(width)-1]}`);
    await page.goto('http://localhost:4000/'); await signedIn(await page.locator('#accountName').textContent());
    profileDelay = 300;
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#accountSignIn').evaluate(el => el.hidden), true, 'No signed-out flash during a valid-session check');
    await page.waitForFunction(() => window.SFIAuth.snapshot().state === 'authenticated'); profileDelay = 0;
    console.log(`REFRESH ${width}px`);
    await nav(); await capture('signed-in');
    await page.locator('#accountToggle').focus(); await page.keyboard.press('ArrowDown');
    assert.match(await page.evaluate(() => document.activeElement.textContent), /My Profile/);
    await page.keyboard.press('End'); assert.equal(await page.evaluate(() => document.activeElement.id), 'accountSignOut');
    await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown');
    assert.match(await page.evaluate(() => document.activeElement.textContent), /Account Settings/);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'none');
    await page.keyboard.press('Escape'); assert.equal(await page.locator('#accountMenu').isVisible(), false);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'accountToggle');
    await page.locator('#accountToggle').click(); await page.locator('h1').click();
    assert.equal(await page.locator('#accountMenu').isVisible(), false);
    await nav();
    await page.locator('#accountToggle').click(); await page.keyboard.press('Tab');
    assert.equal(await page.locator('#accountMenu').isVisible(), false, 'Tab leaves and closes the menu');
    await page.locator('#accountToggle').click();
    assert.equal(await page.locator('#accountAdmin').isVisible(), false);
    await capture('dropdown');
    const memberForbidden = await page.evaluate(async () => (await fetch(window.SFI_API_BASE + '/api/sfi/profile/roles', { credentials: 'include' })).status);
    assert.equal(memberForbidden, 403);
    let peer;
    if (width === 1440) {
      peer = await context.newPage(); await peer.goto('http://localhost:4000/'); await signedIn('Integration Member', peer);
    }
    await page.locator('#accountMenu a').first().click();
    await page.locator('#profileNameInput').waitFor();
    const name = `Integration Member ${width}`;
    await page.locator('#profileNameInput').fill(name); await page.locator('#profileNameSave').click(); await signedIn(name);
    console.log(`PROFILE ${width}px`);
    if (peer) await signedIn(name, peer);
    await nav(); await page.locator('#accountToggle').click();
    await page.locator('#accountMenu a').nth(1).click();
    await page.locator('#settingsAccountDetails').waitFor();
    assert.equal(await page.locator('#settingsAccountName').textContent(), name);
    // Self-reported staff classification is retained as onboarding data only.
    await page.evaluate(async () => {
      const response = await fetch(window.SFI_API_BASE + '/api/sfi/profile/preferences', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ involvement: ['sfi_staff'] }) });
      if (!response.ok) throw new Error('Onboarding save failed');
      await window.SFIAuth.refresh(true);
    });
    assert.equal(await page.locator('#accountAdmin').evaluate(el => el.hidden), true);
    await page.goto('http://localhost:4000/'); await signedIn(name); await nav();
    for (const theme of ['light', 'dark']) for (const language of ['en', 'es']) {
      for (const accent of ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'monochrome']) {
        if (process.env.SFI_ACCOUNT_SMOKE && accent !== 'red') continue;
        await page.evaluate(values => window.SFIPreferences.update(values), { theme, language, accent });
        await page.locator('#accountToggle').click();
        assert.equal(await page.locator('#accountMenu').isVisible(), true);
        assert.equal(await page.locator('#accountMenu a').first().textContent(), language === 'es' ? 'Mi perfil' : 'My Profile');
        assert.equal(await page.locator('#accountName').textContent(), name);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}/${theme}/${language}/${accent} overflow`);
        const audit = await new AxeBuilder({ page }).include('.opencs-bar').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        audits.push({ width, theme, language, accent, violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) });
        assert.deepEqual(audits.at(-1).violations, [], 'Header WCAG accessibility');
        if (accent === 'purple') await capture(`dropdown-${theme}-${language}`);
        await page.keyboard.press('Escape');
      }
    }
    await page.evaluate(() => window.SFIPreferences.update({ theme: 'light', language: 'en', accent: 'red' }));
    await page.waitForFunction(() => window.SFIPreferenceSync.status().state === 'ready');
    profileStatus = 503;
    await page.evaluate(() => window.SFIAuth.refresh(true).catch(() => {})); await signedIn(name);
    profileStatus = 0; profileOffline = true;
    await page.evaluate(() => window.SFIAuth.refresh(true).catch(() => {})); await signedIn(name);
    profileOffline = false; await page.evaluate(() => window.SFIAuth.refresh(true));
    if (peer) {
      await peer.goto('http://localhost:4000/sfi-profile/'); await peer.locator('#profileContent').waitFor();
    }
    await page.locator('#accountToggle').click(); await page.locator('#accountSignOut').click();
    try { await page.locator('#accountSignIn').waitFor(); }
    catch (failure) {
      console.log('LOGOUT UI', await page.evaluate(() => ({ state: window.SFIAuth.snapshot().state, message: document.getElementById('accountMessage').textContent, disabled: document.getElementById('accountSignOut').disabled })));
      await page.screenshot({ path: path.join(output, 'logout-failure.png') });
      throw failure;
    }
    assert.equal(await page.locator('#accountName').textContent(), '');
    assert.equal(await page.locator('#navAuth').textContent(), 'Sign In');
    if (peer) {
      await peer.locator('#profileSignIn').waitFor(); assert.equal(await peer.locator('#profileContent').isVisible(), false);
    }
    // Switch identities using only the normal sign-in UI and actual browser cookies.
    await login(fixture.admin_uid, 'Integration Admin');
    await page.goto('http://localhost:4000/'); await signedIn('Integration Admin'); await nav();
    await page.locator('#accountToggle').click(); await page.locator('#accountAdmin').waitFor();
    const adminAllowed = await page.evaluate(async () => (await fetch(window.SFI_API_BASE + '/api/sfi/profile/roles', { credentials: 'include' })).status);
    assert.equal(adminAllowed, 200);
    await page.locator('#accountAdmin').click(); await page.locator('#admMain').waitFor();
    await page.goto('http://localhost:4000/'); await signedIn('Integration Admin'); await nav();
    if (peer) {
      await signedIn('Integration Admin', peer); await peer.close();
    }
    // Expire the browser's actual HTTP-only cookie; Flask must reject the next lookup.
    const cookies = await context.cookies('http://localhost:8605');
    const authCookie = cookies.find(cookie => cookie.name === 'jwt_python_flask'); assert.ok(authCookie?.httpOnly);
    await context.addCookies([{ ...authCookie, expires: Math.floor(Date.now() / 1000) - 1 }]);
    await page.evaluate(() => window.SFIAuth.refresh(true));
    assert.equal(await page.locator('#accountSignIn').evaluate(el => el.hidden), false);
    assert.equal(await page.locator('#accountName').textContent(), '');
    await context.clearCookies();
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    results.push({ width, passed: true });
    await context.close();
    console.log(`PASS ${width}px: login, refresh, profile, dropdown, authorization, themes/languages, failures, logout and expiry`);
  }
  await writeFile(path.join(output, 'results.json'), JSON.stringify({ results, audits }, null, 2));
} finally {
  if (browser) await browser.close();
  bridge.stdin.end();
  await Promise.race([once(bridge, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))]);
  if (bridge.exitCode === null) bridge.kill('SIGTERM');
}
