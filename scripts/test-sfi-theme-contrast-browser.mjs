// Real rendered gear markup and the detector CTA, tested with the built CSS.
// Usage: PLAYWRIGHT_MODULE=... SFI_AXE_CORE=/path/to/axe.min.js node scripts/test-sfi-theme-contrast-browser.mjs BUILT_SITE
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { backendFixture, quizClient } from './sfi-gear-test-helpers.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
assert.ok(process.argv[2] && process.env.SFI_AXE_CORE, 'Supply built site and SFI_AXE_CORE');
const site = path.resolve(process.argv[2]);
const css = await readFile(path.join(site, 'assets/css/sfi.css'), 'utf8');
const fixture = backendFixture([
  { id: 1, name: 'Pending helmet', spec: '31.1', certDate: '2026-01-01', status: 'pending' },
  { id: 2, name: 'Rejected helmet', spec: '31.1', certDate: '2026-01-01', status: 'rejected', reviewer_notes: 'Needs inspection' },
]);
const gear = await quizClient(fixture.fetch);
const cards = gear.document.getElementById('gearList').innerHTML;
const detector = new JSDOM(await readFile(new URL('../navigation/detect.md', import.meta.url), 'utf8'));
const cta = detector.window.document.querySelector('.sfi__cta').outerHTML;
gear.dom.window.close(); detector.window.close();
const browser = await chromium.launch({ args: ['--no-sandbox'], ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const failures = [];
let scans = 0;
try {
  for (const width of [1440, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1200 }, reducedMotion: 'reduce' });
    await page.setContent('<!doctype html><html lang="en"><head><title>Theme contrast regression</title></head><body class="sfi-site"><main><h1>Theme contrast regression</h1><div class="sfi__gear">' + cards + '</div>' + cta + '</main></body></html>');
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ path: path.join(site, 'assets/js/sfi/preferences.js') });
    await page.addScriptTag({ path: process.env.SFI_AXE_CORE });
    for (const theme of ['light', 'dark']) {
      for (const accent of ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'monochrome']) {
        for (const highContrast of [false, true]) {
          await page.evaluate(values => SFIPreferences.update(values), { theme, accent, highContrast });
          const results = await page.evaluate(async () => {
            const result = await axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } });
            return result.violations.flatMap(rule => rule.nodes.map(node => ({ target: node.target, summary: node.failureSummary })));
          });
          scans++;
          if (results.length) failures.push({ width, theme, accent, highContrast, violations: results });
        }
      }
    }
    await page.close();
  }
} finally { await browser.close(); }
assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 3), null, 2));
console.log(`PASS: ${scans} axe color-contrast scans of real pending/rejected gear cards and detector CTA across light/dark, seven accents, high contrast and desktop/phone widths.`);
