/* Real localhost acceptance. No API mocking. Synthetic negative transport fixture
   is optional, explicit, and confined to the prepared disposable QA database.
   Usage: PLAYWRIGHT_MODULE=... CHROME_PATH=... node scripts/test-sfi-phase1-browser.cjs
*/
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const evidence = path.resolve(process.env.SFI_QA_EVIDENCE || '../qa-evidence');
const frontend = 'http://localhost:4000';
const backend = 'http://localhost:8605';
const results = { desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 }, checks: [], screenshots: [], httpErrors: [], pageErrors: [], consoleErrors: [], failedRequests: [], apiStatuses: {} };
let browser;
let negativeApplied = false, archiveApplied = false;
const sampleNumber='98.2/' + (Math.floor(Date.now()/1000)%999+1);
const raceNumber=sampleNumber.replace('98.2/','98.3/');
const check = text => { results.checks.push(text); console.log('PASS:', text); };
function negative(mode) {
  assert.ok(process.env.SFI_QA_PYTHON && process.env.SFI_QA_NEGATIVE_HELPER, 'Explicit disposable QA helper required');
  const result = spawnSync(process.env.SFI_QA_PYTHON, [process.env.SFI_QA_NEGATIVE_HELPER, mode], { env: { ...process.env, PYTHON_DOTENV_DISABLED: '1' }, encoding: 'utf8', timeout: 30000 });
  assert.equal(result.status, mode === 'reject' ? 1 : 0, result.stderr);
}
async function run() {
  fs.mkdirSync(evidence, { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: results.desktop });
  const page = await context.newPage();
  page.on('dialog', dialog => dialog.accept());
  page.on('pageerror', error => results.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') results.consoleErrors.push({ text: message.text(), url: message.location().url }); });
  page.on('requestfailed', request => results.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('response', response => { if(response.status()>=400)results.httpErrors.push({url:response.url(),status:response.status()}); if (response.url().startsWith(backend)) results.apiStatuses[response.status()] = (results.apiStatuses[response.status()] || 0) + 1; });
  async function shot(filename, target) {
    if (target === '#sfiSearchForm') target = '#search';
    if (target) await page.locator(target).evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 72));
    await page.screenshot({ path: path.join(evidence, filename), animations: 'disabled' });
    results.screenshots.push({ filename, viewport: page.viewportSize() });
  }
  async function search(query) {
    const input = page.getByLabel('Specification number or product name');
    await input.fill(query); await input.press('Enter');
    await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false');
  }
  async function api(method, route, data) {
    const response = await page.evaluate(async ({method,route,data,backend}) => {
      const res = await fetch(backend + route, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
      return { status: res.status, json: await res.json() };
    }, {method,route,data,backend});
    return response;
  }
  await page.goto(frontend + '/sfi-specs/');
  await page.waitForSelector('#sfiResults article');
  assert.equal((await context.request.get(backend + '/api/sfi/health')).status(), 200);
  await shot('01-spec-desktop.png');
  await shot('01-spec-desktop-search.png', '#sfiSearchForm');
  for (const [number, filename] of [['16.1','03-search-16.1.png'], ['20.1/1','04-search-20.1-1.png'], ['20.1/2','05-search-20.1-2.png']]) {
    await search(number);
    assert.equal(await page.locator('#sfiResults article').count(), 1);
    assert.match(await page.locator('#sfiResults article').getAttribute('aria-label'), new RegExp(number.replace('.', '\\.')));
    await shot(filename, '#sfiSearchForm');
    if (number.startsWith('20.1/')) {
      assert.equal(await page.locator('#sfiResults a').count(), 0);
      assert.match(await page.locator('#sfiResults').innerText(), /Rejected or mismatched/);
    }
  }
  check('exact 16.1, 20.1/1 and 20.1/2 search; qualified identities separate and non-actionable');
  for (const query of ['Driver Restraint', 'HaRnEsS', 'restra']) {
    await search(query);
    assert.ok(await page.locator('#sfiResults article').count() > 0);
  }
  await search('harness');
  const lower = await page.locator('#sfiResults article').allTextContents();
  await search('HaRnEsS');
  assert.deepEqual(await page.locator('#sfiResults article').allTextContents(), lower);
  check('product names, mixed-case keywords and partial searches');
  await search('');
  await page.locator('[data-category="all"]').click();
  await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false');
  await shot('06-all-categories.png', '#sfiSearchForm');
  const allIds = [];
  do {
    allIds.push(...await page.locator('#sfiResults article').evaluateAll(nodes => nodes.map(n => n.getAttribute('aria-label'))));
    if (await page.locator('#sfiNext').isDisabled()) break;
    await page.locator('#sfiNext').click();
    await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false');
  } while (allIds.length < 300);
  assert.equal(allIds.length, 111);
  assert.equal(new Set(allIds).size, allIds.length);
  check('empty search browses all 111 identities; pagination has no duplicate cards');
  await search('16.1');
  const input = page.getByLabel('Specification number or product name');
  await input.fill('20.1/1'); await input.fill('20.1/2');
  await page.waitForFunction(() => document.querySelector('#sfiResults').getAttribute('aria-busy') === 'false' && document.querySelector('#sfiResults').textContent.includes('20.1/2'));
  assert.equal(await page.locator('#sfiResults article').count(), 1);
  check('rapid typing resolves to latest input after debounce');
  await search('16.1');
  const link = page.locator('#sfiResults a');
  const official = await link.getAttribute('href');
  await shot('07-verified-pdf-action.png', '#sfiSearchForm');
  const popupPromise = context.waitForEvent('page');
  await link.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded').catch(() => {});
  assert.match(popup.url(), /^https:\/\/(www\.)?sfifoundation.com\/wp-content\//);
  await popup.waitForTimeout(2500); // Allow the browser PDF viewer to paint.
  await popup.screenshot({ path: path.join(evidence, '07-opened-verified-pdf.png') });
  results.screenshots.push({ filename: '07-opened-verified-pdf.png', viewport: results.desktop });
  await popup.close();
  const pdfResponse = await context.request.get(official);
  assert.equal(pdfResponse.status(), 200);
  assert.equal((await pdfResponse.body()).subarray(0,5).toString(), '%PDF-');
  check('verified official PDF action opens a new tab and serves PDF bytes');
  await search('20.1/1'); await shot('08-unverified-pdf.png', '#sfiSearchForm');
  await search('10.1G');
  assert.equal(await page.locator('#sfiResults a').count(), 0);
  check('unverified and missing PDFs expose no current-document action');
  if (process.env.SFI_QA_NEGATIVE_HELPER) {
    negative('reject'); negativeApplied = true;
    await search('16.1');
    assert.equal(await page.locator('#sfiResults a').count(), 0);
    assert.match(await page.locator('#sfiResults').innerText(), /Rejected or mismatched/);
    await shot('08-negative-revalidation.png', '#sfiSearchForm');
    negative('restore'); negativeApplied = false;
    await search('16.1'); assert.equal(await page.locator('#sfiResults a').count(), 1);
    check('standalone CLI negative validation persists rejection through real API and removes browser action');
  }
  await page.setViewportSize(results.mobile);
  await search('20.1/2'); await shot('02-spec-mobile.png', '#sfiSearchForm');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.ok((await page.locator('#sfiSearch').boundingBox()).height < 70);
  check('390×844 mobile search fits viewport with compact input height');
  await page.setViewportSize(results.desktop);
  // Real synthetic accounts use the normal authorization decorators.
  assert.equal((await api('POST','/api/sfi/specs',{spec_number:'98.2',product_name:'Synthetic',category:'QA'})).status,401);
  await page.goto(backend + '/local-demo/');
  await page.getByRole('button',{name:'Use synthetic member'}).click();
  await page.waitForURL(frontend + '/sfi-specs/');
  assert.equal((await api('POST','/api/sfi/specs',{spec_number:'98.2',product_name:'Synthetic',category:'QA'})).status,403);
  await page.goto(backend + '/local-demo/');
  await page.getByRole('button',{name:'Use synthetic admin'}).click();
  await page.waitForURL(frontend + '/sfi-specs/');
  await page.waitForSelector('#adminView:not(.sfi__hidden)');
  await page.waitForFunction(() => document.querySelectorAll('#adminTableBody tr').length > 1);
  await page.getByRole('button',{name:'Save spec',exact:true}).click();
  assert.match(await page.locator('#adminMsg').innerText(), /required/);
  await shot('11-input-validation.png', '#adminView');
  for (const malformed of [[], null, {spec_number:'SFI',product_name:'x',category:'QA'}, {spec_number:['16.1'],product_name:'x',category:'QA'}]) {
    assert.equal((await api('POST','/api/sfi/specs',malformed)).status,400);
  }
  check('anonymous/member writes denied; admin malformed inputs return 400 and visible feedback');
  await page.getByLabel('Product name',{exact:true}).fill('Fictional QA Repair Record');
  await page.getByLabel('Spec number',{exact:true}).fill(sampleNumber);
  await page.getByLabel('Category',{exact:true}).fill('Fictional QA');
  await page.getByRole('button',{name:'Save spec',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#adminMsg').textContent === 'Spec created');
  let sample = await api('GET','/api/sfi/specs/search?q='+encodeURIComponent(sampleNumber));
  const sampleId = sample.json[0].id;
  const row = () => page.locator('#adminTableBody tr').filter({hasText:'SFI '+sampleNumber});
  await row().getByRole('button',{name:'Edit',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#editId').value !== '');
  await page.getByRole('button',{name:'Save spec',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#adminMsg').textContent === 'Spec updated');
  await row().getByRole('button',{name:'Edit',exact:true}).click();
  await page.getByLabel('Product name',{exact:true}).fill('Fictional QA Edited Record');
  await page.getByRole('button',{name:'Save spec',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#adminTableBody').textContent.includes('Fictional QA Edited Record'));
  const existing = (await api('GET','/api/sfi/specs/search?q=16.1')).json[0];
  await page.locator('#adminTableBody tr').filter({hasText:'SFI 16.1'}).first().getByRole('button',{name:'Edit',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#fSpecNum').value === '16.1');
  await page.getByRole('button',{name:'Save spec',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#adminMsg').textContent === 'Spec updated');
  assert.equal((await api('GET',`/api/sfi/specs/${existing.id}`)).json.view_spec_url, official);
  check('UI valid add, unchanged verified save, and product edit work through real API');
  const duplicate=(await api('GET','/api/sfi/specs/search?q=3.2A')).json[0];
  if (process.env.SFI_QA_NEGATIVE_HELPER) { negative('backup-archive'); archiveApplied=true; }
  for (const [number,id] of [[sampleNumber,sampleId],['3.2A',duplicate.id]]) {
    const originalCount = (await api('GET',`/api/sfi/specs/${id}`)).json.legacy_ids.length;
    assert.equal((await api('DELETE',`/api/sfi/specs/${id}`)).status,409);
    await page.locator('#adminTableBody tr').filter({hasText:`SFI ${number}`}).first().getByRole('button',{name:'Archive',exact:true}).click();
    await page.waitForFunction(number => !Array.from(document.querySelectorAll('#adminTableBody tr')).some(tr => tr.querySelector('td.num')?.textContent === 'SFI ' + number),number);
    assert.equal((await api('GET',`/api/sfi/specs/${id}`)).status,410);
    const archived = (await api('GET','/api/sfi/specs/archived')).json.find(s => s.spec_number === number);
    assert.equal(archived.legacy_ids.length,originalCount);
    if (number === '3.2A') {
      assert.ok(originalCount > 1);
      await page.getByLabel('Show archived specifications').check();
      await page.waitForFunction(() => document.querySelector('#adminTableBody').textContent.includes('SFI 3.2A'));
      await page.locator('#adminTableBody tr').filter({hasText:'SFI 3.2A'}).first().getByRole('button',{name:'Restore',exact:true}).click();
      await page.waitForFunction(() => !Array.from(document.querySelectorAll('#adminTableBody tr')).some(tr => tr.querySelector('td.num')?.textContent === 'SFI 3.2A'));
      assert.equal((await api('GET',`/api/sfi/specs/${id}`)).json.document_status,'needs_review');
      await page.getByLabel('Show archived specifications').uncheck();
      if (archiveApplied) { negative('restore-archive'); archiveApplied=false; } // Reset only this QA experiment.
    }
  }
  await shot('12-admin-canonical-management.png','#adminView');
  check('canonical archive for single and multiple legacy rows; exact confirmation, retained IDs, admin restore');
  // Real browser fetches also exercise the database's concurrent identity guard.
  const raceData = {spec_number:raceNumber,product_name:'Fictional concurrent QA',category:'Fictional QA'};
  const races = await Promise.all([api('POST','/api/sfi/specs',raceData),api('POST','/api/sfi/specs',raceData)]);
  assert.deepEqual(races.map(r=>r.status).sort(),[201,409]);
  const winner = races.find(r=>r.status===201).json;
  await api('DELETE',`/api/sfi/specs/${winner.id}`,{confirm_canonical_id:raceNumber});
  check('concurrent real HTTP creates produce one 201 and one 409');
  await page.goto(backend + '/local-demo/');
  await page.getByRole('button',{name:'Use synthetic member'}).click();
  await page.waitForURL(frontend + '/sfi-specs/');
  const helmet=(await api('POST','/api/sfi/gear',{name:'Fictional QA review helmet',spec:'31.1',certDate:'2026-01-01'})).json;
  const suit=(await api('POST','/api/sfi/gear',{name:'Fictional QA review suit',spec:'3.2A',certDate:'2026-01-01'})).json;
  assert.equal((await api('PUT',`/api/sfi/gear/${helmet.id}/review`,{status:'approved',notes:''})).status,403);
  await page.goto(backend + '/local-demo/');
  await page.getByRole('button',{name:'Use synthetic admin'}).click();
  await page.waitForURL(frontend + '/sfi-specs/');
  await page.goto(frontend+'/admin/');
  await page.getByRole('tab',{name:'Gear Review',exact:true}).click();
  await page.getByRole('button',{name:'Approve Fictional QA review helmet',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#gearReviewMessage').textContent.includes('Gear approved.'));
  await page.getByRole('button',{name:'Reject Fictional QA review suit',exact:true}).click();
  await page.getByLabel('Rejection reason for Fictional QA review suit',{exact:true}).fill('Fictional QA recertification review');
  await page.getByRole('button',{name:'Submit rejection',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#gearReviewMessage').textContent.includes('Gear rejected'));
  const moderated=(await api('GET','/api/sfi/gear/all')).json;
  assert.equal(moderated.find(g=>g.id===helmet.id).status,'approved');
  assert.equal(moderated.find(g=>g.id===suit.id).reviewNote,'Fictional QA recertification review');
  await shot('13-existing-gear-review.png','#panel-review');
  await api('DELETE',`/api/sfi/gear/${helmet.id}`);
  await api('DELETE',`/api/sfi/gear/${suit.id}`);
  check('existing gear review client PUT alias: member denied, real admin UI approval/rejection and persisted notes');
  const notifications=[];
  page.on('request',request=>{if(request.method()==='POST')notifications.push(request.url())});
  await page.goto(frontend + '/sfi-manufacturer-demo/');
  await page.waitForSelector('#demoRows article');
  assert.equal(await page.locator('#demoRows article').count(),5);
  assert.match(await page.locator('h1').innerText(),/prototype/);
  assert.match(await page.locator('.sfi-page-header').innerText(),/fictional/);
  await shot('09-manufacturer-dashboard.png','#demoHeading');
  await page.getByLabel('Search sample manufacturers or registrations').fill('Imaginary');
  assert.equal(await page.locator('#demoRows article').count(),1);
  await page.getByLabel('Search sample manufacturers or registrations').fill('');
  await page.getByLabel('Status',{exact:true}).selectOption('Overdue');
  assert.equal(await page.locator('#demoRows article').count(),1);
  await page.getByLabel('Status',{exact:true}).selectOption('Upcoming');
  assert.ok(await page.locator('#demoRows article').count()>0);
  await page.getByLabel('Status',{exact:true}).selectOption('');
  check('manufacturer dashboard has five fictional samples; search, overdue and upcoming filters');
  for(const [id,label] of [['six','Calendar-month'],['ninety','90-day'],['thirty','30-day'],['seven','7-day']]) {
    const control=page.getByLabel(`${label} notice interval (${id==='six'?'months':'days'})`,{exact:true});
    assert.equal(await control.count(),1);
    assert.equal(await control.evaluate(el=>el.labels.length),1);
    await page.getByLabel(`${label} notice enabled`,{exact:true}).focus();
    await page.keyboard.press('Tab');
    assert.equal(await control.evaluate(el=>el===document.activeElement),true);
    const focus=await control.evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
    assert.notEqual(focus.style,'none');assert.notEqual(focus.width,'0px');
    assert.match(await control.ariaSnapshot(),new RegExp(label));
  }
  await page.getByLabel('Calendar-month notice interval (months)',{exact:true}).fill('0');
  assert.equal(await page.locator('#value-six').getAttribute('aria-invalid'),'true');
  assert.match(await page.locator('#demoError').innerText(),/Correct/);
  await shot('11-reminder-validation.png','#noticeHeading');
  await page.getByLabel('Calendar-month notice interval (months)',{exact:true}).fill('5');
  assert.equal(await page.locator('#value-six').getAttribute('aria-invalid'),'false');
  const before=await page.locator('#demoMessages li').count();
  await page.getByLabel('Calendar-month notice enabled',{exact:true}).uncheck();
  assert.equal(await page.locator('#value-six').isDisabled(),true);
  assert.ok(await page.locator('#demoMessages li').count()<before);
  for(const id of ['ninety','thirty','seven'])await page.locator('#interval-'+id).uncheck();
  assert.equal(await page.locator('#demoMessages li').count(),1); // Separate overdue preview remains.
  assert.match(await page.locator('#demoMessages').innerText(),/PREVIEW ONLY/);
  for(const id of ['six','ninety','thirty','seven'])await page.locator('#interval-'+id).check();
  await page.getByLabel('Calendar-month notice interval (months)',{exact:true}).fill('6');
  await page.locator('[data-demo-id="DEMO-003"]').fill('2000-01-01');
  await page.locator('[data-demo-id="DEMO-003"]').dispatchEvent('change');
  assert.match(await page.locator('#demoRows article').filter({hasText:'DEMO-003'}).innerText(),/Overdue/);
  await shot('10-reminder-settings.png','#noticeHeading');
  await page.setViewportSize(results.mobile);
  await shot('09-manufacturer-mobile.png','#demoHeading');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await shot('10-reminder-mobile.png','#noticeHeading');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(notifications,[]);
  await page.reload();
  assert.equal(await page.locator('#value-six').inputValue(),'6');
  assert.notEqual(await page.locator('[data-demo-id="DEMO-003"]').inputValue(),'2000-01-01');
  check('reminder labels, keyboard order, visible focus, screen reader names, validation, disabled intervals, expiration edit, and reset; no POSTs or notifications');
  assert.deepEqual(results.pageErrors,[]);
  check('zero page JavaScript exceptions; localhost API and credentialed CORS exercised');
}
// Archive dialogs are accepted centrally, and all artifacts remain local.
(async()=>{
 try {
   await run();
 } catch(error) { results.failure = error.stack; console.error(error); process.exitCode=1; }
 finally {
   if (negativeApplied) negative('restore');
   if (archiveApplied) negative('restore-archive');
   if (browser) await browser.close();
   fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify(results,null,2)+'\n');
 }
})();
