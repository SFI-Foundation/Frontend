/* Real localhost board walkthrough. No mocked search, catalog, or PDF requests.
   PLAYWRIGHT_MODULE=/path/to/playwright CHROME_PATH=/path/to/chromium node scripts/test-sfi-board-review-browser.cjs */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const frontend = process.env.SFI_BOARD_URL || 'http://localhost:4600';
const backend = process.env.SFI_BOARD_API || 'http://localhost:8606';
const evidence = process.env.SFI_QA_EVIDENCE || '/tmp/sfi-board-browser-evidence';
const results = { checks: [], pageErrors: [], screenshots: [] };
const check = message => { results.checks.push(message); console.log('PASS:', message); };
(async () => {
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => results.pageErrors.push(error.message));
    const idle = () => page.waitForFunction(() => document.querySelector('#sfiResults')?.getAttribute('aria-busy') === 'false');
    async function search(query) {
      await page.getByLabel('Specification number or product name', { exact: true }).fill(query);
      await page.locator('#sfiSearchForm').evaluate(form => form.requestSubmit());
      await idle();
    }
    async function shot(name) {
      await page.screenshot({ path: path.join(evidence, name), fullPage: true });
      results.screenshots.push(name);
    }
    await page.goto(frontend + '/');
    await page.locator('.sfi-home-hero-actions').getByRole('link', { name: 'Find Specifications' }).click();
    await page.waitForURL(frontend + '/sfi-specs/');
    await idle();
    assert.equal(await page.evaluate(() => window.SFI_API_BASE), backend);
    for (const [query, number] of [['1.1', '1.1'], ['racing gloves', '3.3']]) {
      await search(query);
      assert.match(await page.locator('#sfiResults article').first().getAttribute('aria-label'), new RegExp('^SFI ' + number.replace('.', '\\.') + '$'));
      assert.equal(await page.locator(`#sfiResults article[aria-label="SFI ${number}"]`).count(), 1);
      const identities = await page.locator('#sfiResults article').evaluateAll(cards => cards.map(c => c.getAttribute('aria-label')));
      assert.equal(identities.length, new Set(identities).size);
      assert.equal(await page.locator('#sfiFilters [data-category="all"]').getAttribute('aria-pressed'), 'true');
      const action = page.locator(`#sfiResults article[aria-label="SFI ${number}"]`).getByRole('link', { name: /View specification/ });
      const url = await action.getAttribute('href');
      assert.equal(await action.getAttribute('target'), '_blank');
      const popupPromise = context.waitForEvent('page');
      const pdfRequest = context.waitForEvent('request', { predicate: request => request.url() === url });
      await action.click();
      const popup = await popupPromise;
      assert.equal((await pdfRequest).url(), url);
      await popup.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
      // Headless Chromium may download PDFs instead of displaying the built-in viewer.
      if (popup.url() && popup.url() !== 'about:blank') assert.equal(popup.url(), url);
      await popup.close();
      const pdf = await context.request.get(url);
      assert.equal(pdf.status(), 200);
      assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
      await shot(`search-${number}.png`);
      check(`${query}: exact target once, All categories, approved link opens new tab, actual official PDF returns 200 and PDF bytes`);
    }
    await search('3.2A');
    const unavailable = page.locator('#sfiResults article').first();
    assert.match(await unavailable.innerText(), /Current PDF unavailable for review/);
    assert.equal(await unavailable.locator('a').count(), 0);
    await shot('unavailable-pdf.png');
    check('unapproved PDF has visible unavailable state and no actionable link');
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    await idle();
    const all = [];
    while (true) {
      all.push(...await page.locator('#sfiResults article').evaluateAll(cards => cards.map(c => c.getAttribute('aria-label'))));
      if (await page.locator('#sfiNext').isDisabled()) break;
      await page.locator('#sfiNext').click(); await idle();
    }
    const stats = await (await context.request.get(backend + '/api/sfi/stats')).json();
    assert.equal(all.length, stats.total_specs);
    assert.equal(all.length, new Set(all).size);
    check(`all ${all.length} specifications appear once across public result pages`);
    const mutations = [];
    page.on('request', request => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) mutations.push(request.url()); });
    await page.goto(frontend + '/sfi-manufacturer-demo/');
    await page.waitForSelector('#demoRows button');
    await page.waitForFunction(() => window.SFIAuth?.snapshot().state === 'guest');
    assert.doesNotMatch(await page.locator('body').innerText(), /Account service unavailable|Retry account check/);
    assert.equal(await page.locator('#demoRows button').count(), 5);
    const multi = page.locator('#demoModelDetails');
    assert.equal(await page.locator('#demoRows button[aria-pressed="true"]').getAttribute('data-model-id'), 'DEMO-001');
    assert.equal(await multi.locator('tbody tr').count(), 3);
    for (const value of ['SFI 3.3', 'Passed', 'Pending', 'Retest required']) assert.ok((await multi.innerText()).includes(value));
    assert.deepEqual(await multi.locator('time').evaluateAll(times => times.map(t => t.dateTime)), ['2027-02-15', '2027-03-31']);
    assert.match(await page.locator('.sfi-demo').textContent(), /racer.*product recertification period.*separate requirement/);
    await shot('manufacturer-models.png');
    check('five compact model rows, G1 selected, three individual tests, retest and expiration dates');
    const dates = await page.locator('#demoBoardMessages summary time').evaluateAll(times => times.map(t => t.dateTime));
    assert.deepEqual(dates, ['2027-01-31', '2027-03-17', '2027-03-31']);
    for (const preview of await page.locator('#demoBoardMessages details').all()) {
      await preview.locator('summary').click();
      const text = await preview.innerText();
      for (const value of ['Apex Glove G1', '2027-03-31', 'quality@example.invalid', 'PREVIEW ONLY']) assert.ok(text.includes(value));
      await preview.locator('summary').click();
    }
    await page.locator('#boardNoticeHeading').scrollIntoViewIfNeeded();
    await shot('three-reminder-previews.png');
    await page.locator('[data-model-id="DEMO-003"]').click();
    assert.equal(await page.locator('#demoModelHeading').innerText(), 'Apex Glove G2');
    assert.match(await page.locator('#demoBoardMessages').textContent(), /Apex Glove G2/);
    assert.doesNotMatch(await page.locator('#demoBoardMessages').textContent(), /Apex Glove G1/);
    assert.equal(await page.locator('#demoBoardMessages summary time').first().getAttribute('datetime'), '2027-06-30');
    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    assert.equal(await page.locator('#demoRows button[aria-pressed="true"]').getAttribute('data-model-id'), 'DEMO-001');
    assert.deepEqual(await page.locator('#demoBoardMessages summary time').evaluateAll(times => times.map(t => t.dateTime)), dates);
    await page.reload();
    assert.equal(await page.locator('#demoRows button[aria-pressed="true"]').getAttribute('data-model-id'), 'DEMO-001');
    assert.deepEqual(mutations, []);
    check('three expandable reminders, shared selection, month-end clamp, reset and refresh defaults, no mutation requests');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await shot('dashboard-mobile.png');
    await page.goto(frontend + '/sfi-specs/'); await idle(); await search('racing gloves');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await shot('search-mobile.png');
    check('mobile search, dashboard and reminder cards fit the viewport');
    for (const [mode, origin] of [['production', process.env.SFI_PUBLIC_URL], ['development flag off', process.env.SFI_DEMO_OFF_URL]]) {
      assert.ok(origin, `Set URL for ${mode} artifact`);
      const response = await page.goto(origin + '/sfi-manufacturer-demo/');
      assert.equal(response.status(), 404);
      assert.equal(await page.locator('#demoRows, #demoBoardMessages').count(), 0);
      assert.equal((await context.request.get(origin + '/_internal/manufacturer-demo.js')).status(), 404);
      assert.equal((await context.request.get(origin + '/_internal/manufacturer-demo.md')).status(), 404);
      check(`${mode}: dashboard, reminders and fictional dataset absent through localhost HTTP`);
    }
    assert.deepEqual(results.pageErrors, []);
    check('zero browser JavaScript exceptions');
  } catch (error) {
    results.failure = error.stack;
    throw error;
  } finally {
    fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(results, null, 2) + '\n');
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
