// Usage: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-sfi-visual.mjs <built-site> <output-dir>
// Optional third argument: approved homepage screenshot directory; requires byte-identical desktop/mobile captures.
// Captures public SFI pages without server sockets or production mutations.
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [site, output, baseline] = process.argv.slice(2);
assert.ok(site && output, 'Supply built-site and output directories');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const results = [];
const routes = ['', 'about/', 'history/', 'specs/', 'services/', 'contact/', 'quiz/', 'detect/', 'sfi-specs/', 'login/', 'login/#register', 'sfi-profile/', 'admin/', '404.html', 'sfi-ml.html', 'sfi-database.html', 'capstone/sfi-ml-blog/'];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    // Serve generated files through browser interception; no listening socket required.
    await page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() !== 'GET') return route.abort();
      // Never contact the production API during visual inspection.
      if (url.hostname === 'greppers-be.opencodingsociety.com') return route.fulfill({ status: 401, contentType: 'application/json', body: '{"message":"Visual test: signed out"}', headers: { 'access-control-allow-origin': 'http://sfi.test', 'access-control-allow-credentials': 'true' } });
      if (url.hostname !== 'sfi.test') return route.continue();
      let relative = decodeURIComponent(url.pathname).replace(/^\//, '');
      if (!relative || relative.endsWith('/')) relative += 'index.html';
      const file = path.resolve(site, relative);
      if (!file.startsWith(path.resolve(site) + path.sep)) return route.abort();
      try { await route.fulfill({ body: await readFile(file), contentType: types[path.extname(file)] || 'application/octet-stream' }); }
      catch { await route.fulfill({ status: 404, body: 'Missing local asset' }); }
    });
    for (const route of routes) {
      const errors = [];
      const listener = error => errors.push(error.message);
      page.on('pageerror', listener);
      // A fragment-only goto keeps the previous document and does not rerun
      // the signup initializer. Each captured state needs a fresh document.
      await page.goto('about:blank');
      await page.goto(`http://sfi.test/${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(244, 245, 247)');
      await page.waitForTimeout(500);
      const theme = await page.evaluate(() => ({
        header: getComputedStyle(document.querySelector('.sfi-header')).backgroundColor,
        navigation: getComputedStyle(document.querySelector('.sfi-nav')).backgroundColor,
        bodyFont: getComputedStyle(document.body).fontFamily,
      }));
      assert.deepEqual(await page.evaluate(() => Array.from(document.styleSheets, sheet => sheet.href)),
        ['http://sfi.test/assets/css/sfi.css'], 'Browser loads only the compiled SFI stylesheet');
      assert.equal(theme.header, 'rgb(255, 255, 255)', 'SFI header stays white');
      assert.equal(theme.navigation, 'rgb(26, 95, 168)', 'SFI navigation stays blue');
      assert.match(theme.bodyFont, /Inter/);
      if (route === 'login/#register') assert.ok(await page.locator('#registerFields').isVisible(), 'Signup hash must select Create Account');
      if (!route) {
        const cards = page.locator('.sfi-experience-card');
        assert.equal(await cards.count(), 4, 'All four Core Experience destinations are available');
        for (const [index, destination] of ['/sfi-specs/#search', '/sfi-specs/#classify', '/detect/', '/quiz/'].entries()) {
          assert.equal(await cards.nth(index).getAttribute('href'), destination);
          const bounds = await cards.nth(index).boundingBox();
          assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'Feature cards stay inside viewport');
          await cards.nth(index).focus();
          assert.notEqual(await cards.nth(index).evaluate(el => getComputedStyle(el).outlineStyle), 'none');
        }
        const copy = await page.locator('.sfi-hero-copy').boundingBox();
        const logo = await page.locator('.sfi-hero-logo').boundingBox();
        assert.ok(copy.x >= 16 && copy.x + copy.width <= width, 'Hero text has a visible gutter');
        assert.ok(await page.locator('.sfi-hero-logo').evaluate(el => el.complete && el.naturalWidth > 0), 'Official hero logo loads');
        assert.ok(width > 800 ? logo.x >= copy.x + copy.width : logo.y >= copy.y + copy.height,
          'Hero logo aligns beside text on desktop and below on mobile');
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const name = route.replace(/[^a-z0-9]+/gi, '-') || 'home';
      await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
      if (!route && baseline) {
        assert.deepEqual(await readFile(path.join(output, `home-${width}.png`)),
          await readFile(path.join(baseline, `home-${width}.png`)),
          `Approved homepage screenshot changed at ${width}px`);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.ok(!overflow, `${route} overflows at ${width}px`);
      if (width === 390) {
        await page.locator('#navToggle').click();
        assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'), 'true');
        assert.ok(await page.locator('#navLinks').isVisible());
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route}: expanded mobile navigation overflows`);
        if (!route) await page.screenshot({ path: path.join(output, `menu-${width}.png`), fullPage: true });
        await page.locator('#navToggle').click();
      }
      // Keyboard modality matters: programmatic focus after clicking a mobile
      // menu is deliberately not :focus-visible in Chromium.
      await page.keyboard.press('Tab');
      await page.locator('.sfi-skip-link').focus();
      const focus = await page.locator('.sfi-skip-link').evaluate(element => getComputedStyle(element).outlineStyle);
      assert.notEqual(focus, 'none');
      assert.deepEqual(errors, [], `${route}: JavaScript errors`);
      results.push({ route, width, overflow, focus, theme, errors });
      page.off('pageerror', listener);
    }
    await context.close();
  }
} finally {
  await writeFile(path.join(output, 'visual-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(`PASS: ${routes.length} SFI routes at desktop/mobile; white header, blue navigation, Inter typography, keyboard focus, responsive layout and runtime errors checked. Inspect screenshots for visual comparison. Only GET requests were permitted; authenticated browser flows are not covered.`);

if (baseline) console.log('PASS: desktop/mobile homepage PNG captures exactly match the approved local baseline.');
