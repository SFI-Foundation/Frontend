// Rendered-page fixtures only; real backend persistence is tested separately.
// PLAYWRIGHT_MODULE=... node scripts/test-sfi-gear-browser.mjs <built-site> [screenshots]
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const site = path.resolve(process.argv[2]);
const shots = process.argv[3];
if (shots) await mkdir(shots, { recursive: true });
const html = await readFile(path.join(site, 'quiz/index.html'), 'utf8');
const base = html.match(/src="([^"]*)\/assets\/js\/sfi\/quiz-data\.js"/)[1];
const fixture = () => [
  { id: 1, name: 'Track helmet', spec: '31.1', certDate: '2020-01-01', status: 'pending' },
  { id: 2, name: 'Racing harness', spec: '16.1', certDate: '2022-01-25', status: 'approved' },
  { id: 3, name: 'Driving suit', spec: '3.2A', certDate: '2026-01-01', status: 'rejected', reviewer_notes: 'Please upload a readable certification label before resubmitting.' },
  { id: 4, name: 'Gloves', spec: '3.3/5', certDate: '2026-01-01', status: 'approved' },
].map(g => ({ ...g, owner: { id: 5, name: 'Test Racer', uid: 'racer' } }));
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
try {
  for (const width of [320, 375, 768, 1440]) {
    for (const mode of ['remote', 'local', 'outage']) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      const gear = fixture(); const writes = [];
      await page.addInitScript(({ local }) => {
        const NativeDate = Date;
        window.Date = class extends NativeDate {
          constructor(...args) { super(...(args.length ? args : ['2026-10-28T12:00:00Z'])); }
          static now() { return new NativeDate('2026-10-28T12:00:00Z').getTime(); }
        };
        if (local) localStorage.setItem('sfiMyGear', JSON.stringify(local));
      }, { local: mode === 'remote' ? null : gear });
      await page.route('**/*', async route => {
        const request = route.request(); const url = new URL(request.url());
        if (url.pathname.startsWith('/api/')) {
          const headers = { 'access-control-allow-origin': 'http://sfi.test', 'access-control-allow-credentials': 'true',
            'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS' };
          if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
          let body = [];
          if (url.pathname === '/api/sfi/me') body = { isAdmin: true };
          else if (url.pathname.endsWith('/pending')) body = gear.filter(g => g.status === 'pending');
          else if (url.pathname.endsWith('/all') || url.pathname === '/api/sfi/gear') body = gear;
          else if (request.method() === 'PUT') {
            writes.push({ path: url.pathname, body: request.postDataJSON() });
            const item = gear.find(g => g.id === Number(url.pathname.split('/').at(-2)));
            Object.assign(item, { status: writes.at(-1).body.status, reviewer_notes: writes.at(-1).body.notes });
            body = item;
          }
          const status = url.pathname === '/api/sfi/gear' && mode !== 'remote' ? (mode === 'local' ? 401 : 503) : 200;
          return route.fulfill({ status, json: body, headers });
        }
        if (url.hostname !== 'sfi.test') return route.abort();
        const pathname = base && url.pathname.startsWith(base + '/') ? url.pathname.slice(base.length) : url.pathname;
        const file = path.join(site, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
        try { return route.fulfill({ body: await readFile(file), contentType: file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.png') ? 'image/png' : 'text/html' }); }
        catch { return route.fulfill({ status: 404, body: '' }); }
      });
      await page.goto('http://sfi.test' + base + '/quiz/');
      await page.locator('.sfi__gear-item').first().waitFor();
      assert.equal(await page.locator('.sfi__gear-item').count(), 4);
      assert.equal(await page.locator('[data-gear-review]').count(), mode === 'remote' ? 4 : 0);
      assert.equal(await page.locator('.sfi__gear-item').first().locator('[data-gear-expiry]').textContent(), 'Expired');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}/${mode}: horizontal overflow`);
      assert.equal(await page.locator('#gearAuthBanner a').count(), mode === 'local' ? 1 : 0);
      if (mode === 'local') assert.equal(await page.locator('#gearAuthBanner a').getAttribute('href'), base + '/login/');
      if (mode === 'outage') assert.match(await page.locator('#gearAuthBanner').textContent(), /Could not sync/);
      if (shots && mode === 'remote' && [375, 1440].includes(width)) {
        await page.waitForFunction(() => {
          const ring = document.getElementById('scoreRing');
          return Math.abs(parseFloat(getComputedStyle(ring).strokeDashoffset) - Number(ring.getAttribute('stroke-dashoffset'))) < 1;
        });
        await page.screenshot({ path: path.join(shots, `my-gear-${width}.png`), fullPage: true });
      }
      if (mode === 'remote') {
        await page.goto('http://sfi.test' + base + '/admin/');
        await page.locator('#tab-review').click();
        await page.getByRole('button', { name: 'Reject Track helmet', exact: true }).click();
        const form = page.locator('#pendingBody form');
        assert.equal(await form.isVisible(), true);
        await form.locator('textarea').fill('   ');
        await form.getByRole('button', { name: 'Submit rejection' }).click();
        assert.equal(writes.length, 0);
        assert.match(await page.locator('#pendingBody [role="alert"]').textContent(), /Enter a rejection reason/);
        await form.locator('textarea').fill('Please recertify this helmet.');
        if (shots && width === 375) {
          await page.locator('.adm-head').scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(shots, 'admin-review-375.png'), fullPage: true });
        }
        await form.getByRole('button', { name: 'Submit rejection' }).click();
        await page.waitForFunction(() => document.getElementById('cntPending').textContent === '0');
        assert.deepEqual(writes, [{ path: '/api/sfi/gear/1/review', body: { status: 'rejected', notes: 'Please recertify this helmet.' } }]);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}/admin: horizontal overflow`);
      }
      assert.deepEqual(errors, []);
      await page.close(); console.log(`PASS ${width}px ${mode}`);
    }
  }
} finally { await browser.close(); }
