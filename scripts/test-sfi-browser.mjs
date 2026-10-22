// Real Chromium → rendered Jekyll pages → isolated Flask → disposable SQLite.
// Usage: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-sfi-browser.mjs <python> <backend> <site> <screenshots>
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
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const results = [];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
try {
  const fixture = await fixturePromise;
  assert.ok(fixture.socket, 'Browser cookie verification requires the isolated HTTP Unix socket; run outside socket-restricted sandbox');
  for (const width of [1440, 1024, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.hostname === 'localhost' && url.port === '8423') {
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
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
    }
    await page.goto('http://localhost:4000/login/#register');
    await page.locator('#registerFields').waitFor({ state: 'visible' });
    await capture('signup');
    await page.locator('#regName').fill('Disposable browser signup');
    await page.locator('#regUid').fill(`${fixture.uid}_new_${width}`);
    await page.locator('#regPass').fill(fixture.password);
    await page.locator('#regBtn').click();
    await page.locator('#profileCard').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#profileUid').textContent(), `@${fixture.uid}_new_${width}`);
    await page.goto('http://localhost:4000/logout/');
    await page.waitForURL('http://localhost:4000/login/');
    await page.locator('#authForm').waitFor({ state: 'visible' });
    // Use an existing disposable fixture, retaining actual cookie authentication.
    await page.locator('#tabLogin').click();
    await page.locator('#loginUid').fill(fixture.uid);
    await page.locator('#loginPass').fill(fixture.password);
    await page.locator('#loginBtn').click();
    await page.locator('#profileCard').waitFor({ state: 'visible' });
    await capture('account');
    await page.goto('http://localhost:4000/sfi-profile/');
    await page.locator('#profileContent').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#sfiProfileUid').textContent(), fixture.uid);
    assert.equal(await page.locator('#roleManagement').isVisible(), false);
    await page.locator('#profileNameInput').fill('Browser Review Member');
    await page.locator('#profileNameSave').click();
    await page.waitForFunction(() => document.getElementById('sfiProfileName').textContent === 'Browser Review Member');
    await page.locator('#interestQuiz summary').click();
    await page.locator('input[name="causes"][value="Motorsports safety"]').check();
    await page.locator('#interestSkills').fill('Browser test volunteering');
    await page.locator('#interestSave').click();
    await page.waitForFunction(() => document.getElementById('interestStatus').textContent.includes('saved'));
    await page.reload();
    await page.waitForFunction(() => document.getElementById('sfiProfileSkills').textContent === 'Browser test volunteering');
    await page.locator('#interestQuiz summary').click();
    await capture('profile-quiz');
    await page.locator('#interestClear').click();
    await page.waitForFunction(() => document.getElementById('interestStatus').textContent.includes('cleared'));
    await page.reload();
    await page.waitForFunction(() => document.getElementById('sfiProfileSkills').textContent === 'Not answered');
    await page.goto('http://localhost:4000/quiz/');
    await page.waitForFunction(() => QuizData.isRemote());
    await page.locator('#gearName').fill('Disposable browser helmet');
    await page.locator('#gearSpec').fill('31.1');
    await page.locator('#gearDate').fill('2026-01-01');
    await page.locator('#gearAddBtn').click();
    await page.waitForFunction(() => document.getElementById('gearList').textContent.includes('Disposable browser helmet'));
    await page.reload();
    await page.waitForFunction(() => document.getElementById('gearList').textContent.includes('Disposable browser helmet'));
    await capture('my-gear');
    await page.locator('#gearSortBtn').click();
    assert.equal(await page.locator('#sortLabel').textContent(), 'Name');
    await page.locator('.sfi__gear-item-remove').click();
    await page.waitForFunction(() => !document.getElementById('gearList').textContent.includes('Disposable browser helmet'));
    await page.locator('#chatFab').click();
    assert.equal(await page.locator('.sfi-chat-window').evaluate(el => getComputedStyle(el).opacity), '1', 'Reduced-motion chat must open immediately');
    assert.equal(await page.locator('.sfi-chat-window').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'Chat uses the shared SFI white surface');
    assert.equal(await page.locator('.sfi-chat-msg.bot').first().evaluate(el => getComputedStyle(el).color), 'rgb(26, 29, 35)', 'Chat text stays readable on its light surface');
    await capture('chatbot');
    await page.goto('http://localhost:4000/logout/');
    await page.waitForURL('http://localhost:4000/login/');
    await page.locator('#authForm').waitFor({ state: 'visible' });
    await page.goto('http://localhost:4000/sfi-profile/');
    await page.locator('#profileSignIn').waitFor({ state: 'visible' });
    await page.goto('http://localhost:4000/login/');
    await page.locator('#loginUid').fill(fixture.admin_uid);
    await page.locator('#loginPass').fill(fixture.password);
    await page.locator('#loginBtn').click();
    await page.locator('#profileCard').waitFor({ state: 'visible' });
    await page.goto('http://localhost:4000/sfi-profile/');
    await page.locator('#roleManagement').waitFor({ state: 'visible' });
    await page.locator('#roleManagement summary').click();
    await page.locator('#rolesLoad').click();
    await page.locator('#roleForm').waitFor({ state: 'visible' });
    await capture('admin-roles');
    // Exercise real spec CRUD only in this runner's disposable database.
    await page.goto('http://localhost:4000/sfi-specs/');
    await page.locator('#adminToggle').click();
    await page.locator('#fProduct').fill('Disposable browser helmet');
    await page.locator('#fSpecNum').fill('31.1');
    await page.locator('#fCategory').fill('Personal Protective Gear');
    await page.locator('#saveBtn').click();
    await page.waitForFunction(() => document.getElementById('sfiBody').textContent.includes('Disposable browser helmet'));
    await page.locator('#sfiSearch').fill('helmet');
    assert.equal(await page.locator('#sfiBody tr').count(), 1);
    await page.locator('#adminTableBody button').filter({ hasText: 'Edit' }).click();
    await page.waitForFunction(() => document.getElementById('fProduct').value === 'Disposable browser helmet');
    assert.equal(await page.locator('#fProduct').inputValue(), 'Disposable browser helmet');
    await capture('spec-search-details');
    await page.locator('#cancelBtn').click();
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#adminTableBody button').filter({ hasText: 'Delete' }).click();
    await page.waitForFunction(() => document.querySelectorAll('#sfiBody tr').length === 0);
    await page.goto('http://localhost:4000/logout/');
    await page.waitForURL('http://localhost:4000/login/');
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    results.push({ width, signup: true, cookieLogin: true, profileEdit: true, quizSaveReloadClear: true, myGearPersistence: true, specSearchAndCRUD: true, logout: true, adminRoleControls: true, reducedMotion: true, overflow: false, errors });
    await context.close();
  }
} finally {
  await writeFile(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
  const stopped = once(bridge, 'exit');
  bridge.stdin.end();
  const [code] = await stopped;
  assert.equal(code, 0, 'Isolated backend must shut down cleanly');
}
console.log('PASS: browser cookies, login/logout, profile edit, quiz persistence/clearing, My Gear, spec search/CRUD, role controls and layouts at five widths; isolated Flask HTTP + disposable SQLite. External AI/camera services were not exercised.');
