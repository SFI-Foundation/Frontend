// Real-browser review against a built site and the existing local API.
// Tooling paths are configurable; dependencies need not be added to the website.
const { chromium } = require(process.env.SFI_PLAYWRIGHT_MODULE || 'playwright');
const AxeBuilder = require(process.env.SFI_AXE_MODULE || '@axe-core/playwright').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const site = process.env.SFI_UI_URL || 'http://localhost:4600';
const output = path.resolve(process.env.SFI_UI_OUTPUT || 'qa-evidence/redesign');
const routes = ['', 'contact', 'about', 'services', 'history', 'news-events', 'sfi-specs', 'login', 'sfi-profile', 'quiz', 'admin', 'detect', 'photo-credits'];
const report = { layouts: [], accessibility: [], pageErrors: [], assetErrors: [], consoleErrors: [], imageResponses: [], imageCandidates: [], navigation: [], expectedAuthResponses: 0, checks: [] };
const checkedImages = new Set();
let browser;
fs.mkdirSync(path.join(output, 'screenshots'), { recursive: true });

(async () => {
  try {
    browser = await chromium.launch({ executablePath: process.env.SFI_CHROMIUM, args: ['--no-sandbox'] });
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      // Anonymous account probes are expected on the signed-out review.
      if (/status of 401|401 \(UNAUTHORIZED\)/i.test(message.text())) return;
      report.consoleErrors.push({ text: message.text(), url: message.location().url });
    });
    page.on('response', response => {
      if (response.request().resourceType() === 'image') report.imageResponses.push({ url: response.url(), status: response.status() });
      if (response.status() === 401) report.expectedAuthResponses++;
      if (response.status() >= 400 && /\/(assets|images)\//.test(response.url())) report.assetErrors.push(response.url());
    });
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        assert.equal((await page.goto(`${site}/${route}${route ? '/' : ''}`)).status(), 200);
        if (route === 'sfi-specs') {
          await page.waitForFunction(() => document.querySelector('#sfiResults')?.getAttribute('aria-busy') === 'false');
          await page.waitForSelector('#sfiResults article');
          const box = await page.locator('#sfiSearch').boundingBox();
          assert.ok(box.y + box.height < 600, 'Search stays near the top');
        }
        for (const img of await page.locator('.opencs-bar img, main picture img').all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(n => n.decode());
          assert.ok(await img.evaluate(n => n.naturalWidth > 0));
          if (await img.evaluate(n => !!n.closest('picture'))) assert.match(await img.evaluate(n => new URL(n.currentSrc).pathname), /\.webp$/);
        }
        const candidates = await page.locator('picture').evaluateAll(pictures => pictures.flatMap(picture => [
          picture.querySelector('img').src,
          ...[...picture.querySelectorAll('source')].flatMap(source => source.srcset.split(',').map(candidate => new URL(candidate.trim().split(/\s+/)[0], location.href).href)),
        ]));
        for (const url of candidates) {
          if (checkedImages.has(url)) continue;
          const response = await page.request.get(url);
          report.imageCandidates.push({ url, status: response.status(), bytes: (await response.body()).length });
          assert.equal(response.status(), 200, `Photo candidate must return 200: ${url}`);
          assert.match(response.headers()['content-type'], /^image\//);
          checkedImages.add(url);
        }
        const nav = page.locator('#navLinks');
        await page.mouse.move(0, 850);
        const navigation = await nav.locator('a').evaluateAll(links => links.map(link => {
          const style = getComputedStyle(link);
          return { text: link.textContent.trim(), href: link.getAttribute('href'), active: link.getAttribute('aria-current'), background: style.backgroundColor, font: style.fontFamily, size: style.fontSize, weight: style.fontWeight, padding: style.padding, borderBottom: style.borderBottomColor, borderWidth: style.borderBottomWidth, account: link.classList.contains('opencs-nav__link--account') };
        }));
        const normal = navigation.filter(link => !link.account);
        assert.equal(new Set(normal.map(link => JSON.stringify([link.font, link.size, link.weight, link.padding]))).size, 1, 'Normal links share typography and spacing');
        for (const link of normal) assert.equal(link.background, 'rgba(0, 0, 0, 0)', 'Normal navigation has no permanent filled background');
        const expectedActive = navigation.filter(link => link.href === new URL(page.url()).pathname);
        assert.deepEqual(navigation.filter(link => link.active).map(link => link.href), expectedActive.map(link => link.href), `${route}: only current page is highlighted`);
        for (const link of normal.filter(link => link.active)) {
          assert.notEqual(link.borderBottom, 'rgba(0, 0, 0, 0)');
          assert.equal(link.borderWidth, '2px');
        }
        report.navigation.push({ route, width, links: navigation });
        await page.evaluate(() => scrollTo(0, 0));
        const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(dimensions.scrollWidth <= width, `${route}: overflow at ${width}`);
        report.layouts.push({ route, ...dimensions });
        if (['', 'contact', 'about', 'services', 'history', 'news-events', 'sfi-specs', 'photo-credits'].includes(route)) {
          const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
          report.accessibility.push({ route, width, violations: results.violations });
          assert.equal(results.violations.length, 0, `${route}: axe violations at ${width}`);
          await page.screenshot({ path: path.join(output, 'screenshots', `after-${route || 'home'}-${width}.png`), fullPage: true });
        }
        if (['', 'contact', 'sfi-specs'].includes(route)) {
          const toggle = page.locator('#navToggle');
          if (await toggle.isVisible()) await toggle.click();
          await page.locator('.opencs-bar').screenshot({ path: path.join(output, 'screenshots', `navigation-${route || 'home'}-${width}.png`) });
          if (await toggle.isVisible()) await toggle.click();
        }
        if (route === '') {
          const columns = await page.locator('.sfi-feature-grid').evaluate(n => getComputedStyle(n).gridTemplateColumns.split(' ').length);
          assert.equal(columns, width <= 600 ? 1 : width <= 1000 ? 2 : 3);
          // Header screenshot toggles use the pointer; switch to keyboard modality
          // before checking the cards' :focus-visible outlines.
          await page.keyboard.press('Tab');
          for (const card of await page.locator('.sfi-feature-card').all()) {
            const image = card.locator('img');
            const photo = await image.evaluate(n => {
              const style = getComputedStyle(n);
              const box = n.getBoundingClientRect();
              return { source: n.currentSrc, naturalWidth: n.naturalWidth, width: box.width, height: box.height, fit: style.objectFit, visibility: style.visibility, opacity: style.opacity };
            });
            assert.ok(photo.naturalWidth > 0 && photo.width > 200 && photo.height >= 260);
            assert.equal(photo.fit, 'cover');
            assert.equal(photo.visibility, 'visible');
            assert.equal(photo.opacity, '1');
            for (const text of await card.locator('h3, p').all()) {
              assert.equal(await text.evaluate(n => getComputedStyle(n).color), 'rgb(255, 255, 255)', 'Photo text stays white despite legacy card rules');
            }
            await card.focus();
            assert.equal(await card.evaluate(n => getComputedStyle(n).outlineStyle), 'solid');
            const destination = await card.getAttribute('href');
            assert.equal((await page.request.get(site + destination.split('#')[0])).status(), 200);
          }
          report.checks.push(`${width}px: navigation grid columns, card destinations, and keyboard focus`);
        }
      }
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(site);
    const toggle = page.locator('#navToggle');
    await toggle.focus();
    await page.keyboard.press('Space');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Home');
    const menuScan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    assert.equal(menuScan.violations.length, 0);
    await page.screenshot({path: path.join(output, 'screenshots', 'after-mobile-menu-375.png')});
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.ok(await toggle.evaluate(n => n === document.activeElement));
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'sfi-main');
    report.checks.push('Keyboard menu, Escape focus return, and skip link');

    // Follow each whole-card link, including both Services fragments.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(site);
    const destinations = await page.locator('.sfi-feature-card').evaluateAll(ns => ns.map(n => n.getAttribute('href')));
    for (let index = 0; index < destinations.length; index++) {
      await page.goto(site);
      await page.locator('.sfi-feature-card').nth(index).click();
      assert.equal(page.url(), new URL(destinations[index], site).href);
      const hash = new URL(page.url()).hash;
      if (hash) assert.equal(await page.locator(hash).count(), 1);
    }
    await page.goto(site + '/contact/');
    assert.ok(await page.locator('main a[href="mailto:sfi@sfifoundation.com"]').first().isVisible());
    assert.ok(await page.locator('main a[href="tel:+18584518868"]').first().isVisible());
    report.checks.push('Six actual card clicks reach their destinations; Contact email and phone actions remain available');

    // Search reads the real existing backend. No catalog/admin writes.
    await page.goto(site + '/sfi-specs/');
    await page.waitForSelector('#sfiResults article');
    const search = async query => {
      await page.getByLabel('Specification number or product name').fill(query);
      await page.locator('#sfiSearchForm button[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false');
    };
    await search('16.1');
    assert.equal(await page.locator('#sfiResults article').count(), 1);
    const verified = page.locator('#sfiResults a');
    assert.equal(await verified.count(), 1);
    assert.match(await verified.getAttribute('href'), /^https:\/\/(?:www\.)?sfifoundation.com\//);
    for (const number of ['20.1/1', '20.1/2']) {
      await search(number);
      assert.equal(await page.locator('#sfiResults article').count(), 1);
      assert.equal(await page.locator('#sfiResults a').count(), 0, 'Unapproved PDF is not actionable');
    }
    await search('no-match-redesign-check');
    assert.equal(await page.locator('#sfiResults article').count(), 0);
    assert.ok(await page.locator('#sfiNoResults').isVisible());
    await page.locator('#sfiClear').click();
    await page.waitForSelector('#sfiResults article');
    const categoryButton = page.locator('#sfiFilters button:not([data-category="all"])').first();
    const category = await categoryButton.getAttribute('data-category');
    await categoryButton.click();
    await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false');
    assert.equal(await categoryButton.getAttribute('aria-pressed'), 'true');
    const categoryResults = await page.locator('#sfiResults article').count();
    assert.ok(categoryResults > 0);
    for (const article of await page.locator('#sfiResults article').all()) assert.ok((await article.innerText()).includes(category));
    await page.locator('#sfiClear').click();
    await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false');
    await page.waitForSelector('#sfiResults article');
    report.checks.push(`Real API category filter: ${category}, ${categoryResults} matching results, clear restores catalog`);
    const identities = [];
    do {
      await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false');
      identities.push(...await page.locator('#sfiResults article').evaluateAll(ns => ns.map(n => n.getAttribute('aria-label'))));
      if (await page.locator('#sfiNext').isDisabled()) break;
      await page.locator('#sfiNext').click();
    } while (identities.length < 300);
    assert.equal(identities.length, new Set(identities).size);
    assert.ok(identities.length > 100);
    report.checks.push(`Real API: exact canonical searches, restricted PDF links, empty/reset state, and ${identities.length} unique paginated results`);

    // JPEG fallback still decodes; no new image formats are assumed mandatory.
    await page.goto(site);
    await page.locator('picture source').evaluateAll(ns => ns.forEach(n => n.type = 'image/x-unsupported'));
    for (const img of await page.locator('main picture img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(n => n.decode());
      assert.match(await img.evaluate(n => new URL(n.currentSrc).pathname), /\.jpg$/);
    }
    const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: {width: 375, height: 812} });
    await noJS.goto(site);
    for (const link of await noJS.locator('#navLinks a').all()) assert.ok(await link.isVisible());
    await noJS.close();
    report.checks.push('JPEG fallback and navigation without JavaScript');
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.assetErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.ok(report.imageResponses.length > 0);
    assert.ok(report.imageResponses.every(response => response.status === 200), 'Every observed browser image response is HTTP 200');
    console.log(`PASS: ${report.layouts.length} responsive layouts; ${report.accessibility.length} axe scans; keyboard navigation; live API search; image loading`);
    report.checks.forEach(check => console.log('PASS:', check));
  } catch (error) {
    report.failure = error.stack;
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser?.close();
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
  }
})();
