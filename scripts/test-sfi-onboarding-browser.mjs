// Real Chromium → rendered Jekyll pages → isolated Flask → disposable SQLite.
// Usage: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-sfi-onboarding-browser.mjs <python> <backend> <site> <screenshots>
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
const [python, backend, site, output] = process.argv.slice(2);
assert.ok(python && backend && site && output, 'Supply Python, backend, built site, and screenshot directory');
await mkdir(output, { recursive: true });
const bridge = spawn(python, [path.resolve(backend, 'testing/test_sfi_profile.py'), '--bridge'], { stdio: ['pipe', 'pipe', 'pipe'] });
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
  for (const width of [1440, 1024, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
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
    async function capture(name) {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: overflow at ${width}`);
      const contrastFailures = await page.evaluate(() => {
        const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
        const luminance = color => rgb(color).map(value => {
          const c = value / 255;
          return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
        }).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0);
        return [...document.querySelectorAll('.sfi-profile h1, .sfi-profile h2, #preferencesForm legend, #preferencesForm label, .sfi-pref-hint, #preferencesSave')]
          .filter(el => el.checkVisibility()).flatMap(el => {
            const color = getComputedStyle(el).color;
            let parent = el, background = 'rgb(255, 255, 255)';
            while (parent) {
              const bg = getComputedStyle(parent).backgroundColor;
              if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { background = bg; break; }
              parent = parent.parentElement;
            }
            const values = [luminance(color), luminance(background)].sort((a, b) => b - a);
            const ratio = (values[0] + .05) / (values[1] + .05);
            return ratio >= 4.5 ? [] : [{ tag: el.tagName, ratio }];
          });
      });
      assert.deepEqual(contrastFailures, [], 'Questionnaire text meets AA normal-text contrast');
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
    }
    await page.goto('http://localhost:4000/login/#register');
    await page.locator('#registerFields').waitFor({ state: 'visible' });
    await page.locator('#regName').fill('Disposable motorsports participant');
    await page.locator('#regUid').fill(`${fixture.uid}_onboarding_${width}`);
    await page.locator('#regPass').fill(fixture.password);
    await page.locator('#regBtn').click();
    await page.waitForURL('**/sfi-profile/?onboarding=1');
    await page.locator('#preferencesForm').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#roleManagement').isVisible(), false);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'preferencesHeading');
    await capture('new-user');
    let preferenceWrites = 0;
    page.on('request', request => {
      if (request.url().endsWith('/api/sfi/profile/preferences') && request.method() === 'PATCH') preferenceWrites++;
    });
    await page.locator('#preferencesSkip').click();
    assert.equal(preferenceWrites, 0, 'Skip must not persist or consent');
    await page.locator('#onboardingQuiz summary').focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.name), 'involvement');
    await page.keyboard.press('Space');
    assert.equal(await page.locator('input[value="manufacturer"]').isChecked(), true);
    const outline = await page.locator('input[value="manufacturer"]').evaluate(el => getComputedStyle(el).outlineStyle);
    assert.notEqual(outline, 'none', 'Keyboard selection has a visible focus indicator');
    // Every offered machine identifier crosses the real API validator. Exclusive
    // unanswered options are tested separately by unit/API suites.
    for (const field of ['involvement', 'visit_reasons', 'disciplines', 'resources', 'update_interests']) {
      for (const input of await page.locator(`input[name="${field}"]`).all()) {
        if (['prefer_not_to_answer', 'not_applicable'].includes(await input.inputValue())) continue;
        await input.check();
      }
    }
    await page.locator('input[name="primary_goal"][value="technical_resources"]').check();
    await page.locator('#pref-organization_name').fill('Synthetic browser racing organization');
    await page.locator('#pref-organization_website').fill('https://example.org/racing');
    await page.locator('#pref-job_title').fill('Safety Engineer');
    await page.locator('#pref-additional_notes').fill('<script>window.untrustedExecuted=true</script>');
    await page.locator('#preferencesSave').click();
    await page.waitForFunction(() => document.getElementById('preferencesStatus').textContent.includes('have been saved'));
    assert.equal(await page.evaluate(() => window.untrustedExecuted), undefined);
    assert.equal(await page.locator('#roleManagement').isVisible(), false);
    const api = async (path, method = 'GET', body) => page.evaluate(async ({ path, method, body }) => {
      const response = await fetch('http://localhost:8605' + path, {
        method, credentials: 'include', headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      return { status: response.status, data: await response.json() };
    }, { path, method, body });
    let profile = await api('/api/sfi/profile');
    assert.equal(profile.data.preferences.involvement.includes('sfi_staff'), true);
    assert.equal(profile.data.role, 'User');
    assert.equal(profile.data.can_manage_roles, false);
    for (const route of ['/api/sfi/profile/roles', '/api/sfi/users', '/api/sfi/gear/all']) {
      assert.equal((await api(route)).status, 403, 'Self-reported claims never grant permissions');
    }
    await page.reload();
    await page.locator('#preferencesForm').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#pref-job_title').inputValue(), 'Safety Engineer');
    assert.equal(await page.locator('input[value="manufacturer"]').isChecked(), true);
    await capture('saved-preferences');
    // Native browser constraints prevent malformed URLs without a write.
    const previousWrites = preferenceWrites;
    await page.locator('#pref-organization_website').fill('invalid website');
    await page.locator('#preferencesSave').click();
    assert.equal(preferenceWrites, previousWrites);
    await page.locator('#pref-organization_website').fill('https://example.org/racing');
    await page.locator('#pref-job_title').fill('Technical Inspector');
    await page.locator('#preferencesSave').click();
    await page.waitForFunction(() => document.getElementById('preferencesStatus').textContent.includes('have been saved'));
    await page.reload();
    await page.locator('#preferencesForm').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#pref-job_title').inputValue(), 'Technical Inspector');
    profile = await api('/api/sfi/profile');
    assert.equal(profile.data.preferences.organization_name, 'Synthetic browser racing organization');
    assert.equal(profile.data.preferences.additional_notes, '<script>window.untrustedExecuted=true</script>');
    for (const href of await page.locator('#recommendedLinks a').evaluateAll(links => links.map(a => a.href))) {
      const response = await page.goto(href);
      assert.equal(response.status(), 200, 'Recommended page exists');
    }
    await page.goto('http://localhost:4000/sfi-profile/');
    await page.locator('#profileContent').waitFor({ state: 'visible' });
    await page.locator('#onboardingQuiz summary').click();
    await page.locator('#pref-job_title').fill('Unsaved edit');
    // Navigating with a dirty form triggers the browser's native leave guard.
    let guarded = false;
    page.once('dialog', async dialog => { guarded = dialog.type() === 'beforeunload'; await dialog.dismiss(); });
    await page.goto('http://localhost:4000/about/').catch(() => {});
    assert.equal(guarded, true);
    assert.equal(await page.locator('#pref-job_title').inputValue(), 'Unsaved edit');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#preferencesSkip').click();
    await page.goto('http://localhost:4000/logout/');
    await page.waitForURL('http://localhost:4000/login/');
    await page.locator('#loginUid').fill(fixture.admin_uid);
    await page.locator('#loginPass').fill(fixture.password);
    await page.locator('#loginBtn').click();
    await page.locator('#profileCard').waitFor({ state: 'visible' });
    await page.goto('http://localhost:4000/sfi-profile/?onboarding=1');
    await page.locator('#roleManagement').waitFor({ state: 'visible' });
    await page.locator('input[value="enthusiast"]').check();
    await page.locator('#preferencesSave').click();
    await page.waitForFunction(() => document.getElementById('preferencesStatus').textContent.includes('have been saved'));
    assert.equal((await api('/api/sfi/profile/roles')).status, 200);
    assert.equal((await api('/api/sfi/users')).status, 200);
    assert.equal((await api('/api/sfi/profile')).data.role, 'Admin');
    await capture('administrator-profile');
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    results.push({ width, signupOnboarding: true, skipWithoutWrite: true, fullSaveReloadEdit: true,
      keyboardCheckbox: true, focusIndicator: true, unsavedGuard: true, safeText: true,
      optionAPICompatibility: true, realRecommendations: true, claimsDenied: true,
      adminLoginAndAuthorization: true, overflow: false, errors });
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
console.log('PASS: registration → optional onboarding → real Flask save → reload → edit, keyboard, mobile, safe rendering, public links, denied self-reported claims and preserved administrator access at five widths. Disposable SQLite only.');
