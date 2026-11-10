// Fixture-only dashboard check: PLAYWRIGHT_MODULE=... node scripts/test-sfi-admin.mjs <built-site>
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
assert.ok(process.argv[2], 'Supply a built-site directory');
const site = path.resolve(process.argv[2]);
const base = (process.env.SFI_BASEURL || '').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
try {
  for (const width of [375, 768, 1440]) {
    for (const mode of ['populated', 'empty', 'error', 'denied']) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let retryWorks = false;
      const long = 'LongName'.repeat(25);
      const user = { id: 1, uid: long, name: long, role: 'admin', groups: [{ name: long }] };
      const gear = { id: 1, name: long, owner: user, spec: '3.2A', category: long, status: 'pending' };
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith('/api/')) {
          const me = url.pathname === '/api/sfi/me';
          const body = me ? { isAdmin: mode !== 'denied' } : mode === 'empty' ? []
            : url.pathname.endsWith('/users') ? [user]
            : url.pathname.endsWith('/groups') ? [{ id: 1, name: long, description: long, members: [user] }]
            : url.pathname.endsWith('/groups/1') ? { id: 1, name: long, description: long, members: [user] }
            : [gear];
          return route.fulfill({ status: mode === 'error' && !me && !retryWorks ? 503 : 200,
            json: body, headers: { 'access-control-allow-origin': 'http://sfi.test', 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS' } });
        }
        if (url.hostname !== 'sfi.test') return route.abort();
        const pathname = base && url.pathname.startsWith(base + '/') ? url.pathname.slice(base.length) : url.pathname;
        const file = path.join(site, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
        try { return route.fulfill({ body: await readFile(file), contentType: file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html' }); }
        catch { return route.fulfill({ status: 404, body: '' }); }
      });
      await page.goto('http://sfi.test' + base + '/admin/');
      if (mode === 'denied') {
        await page.locator('#admGate').waitFor({ state: 'visible' });
        assert.equal(await page.locator('#admMain').isVisible(), false);
      } else {
        await page.waitForFunction(() => document.querySelector('#statUsers').textContent !== '—' || document.querySelector('#usersBody [role="alert"]'));
        assert.equal(await page.locator('[role="tab"]').count(), 3);
        const cards = await page.locator('.adm-stat').evaluateAll(elements => elements.map(el => ({ x: el.offsetLeft, y: el.offsetTop })));
        assert.equal(cards[0].y === cards[1].y, width > 600, 'Summary cards stack only on phones');
        for (const id of ['users', 'groups', 'review']) {
          await page.locator('#tab-' + id).click();
          assert.equal(await page.locator('.adm-panel:visible').count(), 1);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}/${mode}/${id}: overflow`);
        }
        if (mode === 'populated') {
          const region = page.locator('#pendingBody .adm-table-scroll');
          await region.waitFor();
          assert.equal(await region.evaluate(el => el.scrollWidth > el.clientWidth), width < 768, 'Phone table scrolls inside its region');
        }
        await page.selectOption('#gearView', 'all');
        assert.equal(await page.locator('#pendingView').isVisible(), false);
        assert.equal(await page.locator('#allGearView').isVisible(), true);
        await page.locator('#tab-users').focus();
        await page.keyboard.press('End');
        assert.equal(await page.locator('#tab-review').getAttribute('aria-selected'), 'true');
        await page.keyboard.press('Home');
        assert.equal(await page.locator('#tab-users').getAttribute('aria-selected'), 'true');
        if (mode === 'empty') {
          assert.equal(await page.locator('#statUsers').textContent(), '0');
          assert.match(await page.locator('#usersBody').textContent(), /No users/);
        }
        if (mode === 'error') {
          assert.equal(await page.locator('#statUsers').textContent(), '—');
          retryWorks = true;
          await page.locator('#usersBody button').click();
          await page.waitForFunction(() => document.querySelector('#statUsers').textContent === '1');
        }
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS ${width}px ${mode}`);
    }
  }
} finally { await browser.close(); }
