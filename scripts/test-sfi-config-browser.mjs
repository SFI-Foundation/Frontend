// Disposable backend only. Usage: PLAYWRIGHT_MODULE=... node scripts/test-sfi-config-browser.mjs SITE http://localhost:18423
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [site, backend] = process.argv.slice(2);
assert.equal(new URL(backend).hostname, 'localhost');
const origin = 'http://localhost:4600';
const server = createServer(async (request, response) => {
  let file = new URL(request.url, origin).pathname.replace(/^\/Frontend\//, '');
  if (!file || file.endsWith('/')) file += 'index.html';
  try {
    let body = await readFile(path.join(site, file));
    if (file === 'assets/js/sfi/api-base.js') body = Buffer.from(body.toString().replace('const configured = "";', `const configured = ${JSON.stringify(backend)};`));
    const type = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'}[path.extname(file)];
    response.writeHead(200, {'Content-Type': type || 'application/octet-stream'}).end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(4600, '127.0.0.1', resolve));
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.origin === backend || u.origin === origin) return route.continue();
    return route.fulfill({status:503,body:'External services excluded'});
  });
  await page.goto(origin + '/Frontend/sfi-specs/');
  await page.waitForFunction(() => document.querySelector('#statSpecs')?.textContent === '140');
  assert.equal(await page.locator('#sfiBody tr').count(), 140);
  assert.equal(await page.evaluate(() => window.SFI_API_BASE), backend);
  const result = await page.evaluate(async api => {
    const status = await fetch(api + '/api/sfi/classifier/status').then(r=>r.json());
    const preflight = await fetch(api + '/api/sfi/specs', {headers:{'X-Origin':'client'}});
    return {trained:status.trained, specs:preflight.status};
  }, backend);
  assert.deepEqual(result, {trained:true,specs:200});
  assert.equal(await page.locator('.sfi-nav').evaluate(el=>getComputedStyle(el).backgroundColor), 'rgb(26, 95, 168)');
  assert.deepEqual(errors, []);
  console.log('PASS: real browser CORS + preflight, 140 rendered spec rows, trained classifier status, custom API base, unchanged blue navigation, zero page errors');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
