/* Real localhost acceptance, no mocked application requests. Credentials and tokens never logged.
   PLAYWRIGHT_MODULE=/path/to/playwright CHROME_PATH=/path/to/chrome node scripts/test-sfi-public-browser.cjs */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const frontend = 'http://localhost:4000', backend = 'http://localhost:8605';
const evidence = path.resolve(process.env.SFI_QA_EVIDENCE || 'qa-evidence');
const results = { checks: [], screenshots: [], pageErrors: [], consoleErrors: [], failedRequests: [], expectedHttpErrors: [] };
const desktop = {width:1440,height:1000}, mobile = {width:390,height:844};
let browser;
function check(text) { results.checks.push(text); console.log('PASS:',text); }
(async () => {
 fs.mkdirSync(evidence,{recursive:true});
 try {
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:desktop});
  const page=await context.newPage();
  page.on('pageerror',e=>results.pageErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')results.consoleErrors.push({text:m.text(),url:m.location().url});});
  page.on('requestfailed',r=>results.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('dialog',d=>d.dismiss());
  const request=context.request;
  async function api(route,options={}) { return request.fetch(backend+route,options); }
  async function go(url){await page.waitForLoadState('networkidle');return page.goto(url);}
  async function idle(){await page.waitForFunction(()=>document.querySelector('#sfiResults')?.getAttribute('aria-busy')==='false');}
  async function search(q){await page.getByLabel('Specification number or product name').fill(q);await page.locator('#sfiSearchForm').getByRole('button',{name:'Search',exact:true}).click();await idle();}
  async function shot(name,searchArea=false){
   if(searchArea)await page.locator(page.viewportSize().width<600?'#sfiResults':'#search').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-65));
   await page.screenshot({path:path.join(evidence,name),animations:'disabled'});
   results.screenshots.push({file:name,viewport:page.viewportSize()});
  }
  assert.equal((await api('/api/sfi/health')).status(),200);
  const before=await (await api('/api/sfi/specs?limit=200')).json();
  const snapshot=before.map(s=>({number:s.spec_number,status:s.document_status,url:s.view_spec_url}));
  assert.equal(before.length,111);assert.equal(new Set(before.map(s=>s.canonical_id)).size,111);
  const counts={};for(const s of before)counts[s.document_status]=(counts[s.document_status]||0)+1;
  results.catalogStatuses=counts;
  await go(frontend+'/sfi-specs/');await page.waitForSelector('#sfiResults article');await idle();
  assert.equal(await page.locator('#safetyCanvas,#safety-showcase,#classify,#classifyInput,#classifyBtn,#statModel,#panel-classifier').count(),0);
  assert.equal(await page.locator('a[href*="sfi-manufacturer-demo"]').count(),0);
  assert.doesNotMatch(await page.locator('#publicView').innerText(),/ML accuracy|ML part classifier|interactive safety showcase/i);
  assert.ok((await page.locator('#search').boundingBox()).y<850);
  assert.equal(await page.locator('#statsBar .sfi__stat').count(),3);
  await shot('desktop-specification-page.png');
  check('public page shows three catalog statistics, compact search and no car, ML controls, accuracy card or demo links');
  for(const [viewport,label]of [[desktop,'desktop'],[mobile,'mobile']]){
   await page.setViewportSize(viewport);await go(frontend+'/sfi-specs/');await page.waitForSelector('#sfiResults article');await idle();
   await shot(`${label}-specification-page.png`);
   if(label==='mobile'){assert.equal(await page.locator('.sfi-page-header').evaluate(e=>getComputedStyle(e).paddingTop),'24px');await page.locator('#search').scrollIntoViewIfNeeded();await shot('mobile-search-controls.png');await page.evaluate(()=>scrollTo(0,0));}
   if(label==='mobile')await page.getByRole('button',{name:'Open navigation menu'}).click();
   await shot(`${label}-public-navigation.png`);
   if(label==='mobile')await page.getByRole('button',{name:'Close navigation menu'}).click();
   for(const q of ['16.1','20.1/1','20.1/2']){
    await search(q);assert.equal(await page.locator('#sfiResults article').count(),1);
    assert.match(await page.locator('#sfiResults h3').innerText(),new RegExp('SFI '+q.replaceAll('.','\\.')));
    if(q==='16.1')assert.equal(await page.locator('#sfiResults a').count(),1);
    else {assert.equal(await page.locator('#sfiResults a').count(),0);assert.match(await page.locator('#sfiResults').innerText(),/Rejected or mismatched/);}
    await shot(`${label}-search-${q.replace('/','-')}.png`,true);
   }
   await search('10.1G');assert.equal(await page.locator('#sfiResults a').count(),0);
   assert.match(await page.locator('#sfiResults').innerText(),/unavailable/i);
   await shot(`${label}-pdf-unavailable.png`,true);
   await search('driver restraint');assert.ok(await page.locator('#sfiResults article').count()>0);
   await page.getByRole('button',{name:'Clear search',exact:true}).click();await idle();
   const categories=await (await api('/api/sfi/categories')).json();
   for(const category of categories){
    await page.locator('#sfiFilters button').filter({hasText:category}).filter({visible:true}).first().click();await idle();
    const cards=page.locator('#sfiResults article');assert.ok(await cards.count()>0);
    for(const card of await cards.all())assert.ok((await card.locator('.sfi__badge').allTextContents()).includes(category));
   }
   await page.locator('#sfiFilters [data-category="all"]').click();await idle();await shot(`${label}-all-categories.png`,true);
   const ids=[];
   while(true){
    ids.push(...await page.locator('#sfiResults article').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))));
    if(await page.locator('#sfiNext').isDisabled())break;
    await page.locator('#sfiNext').click();await idle();
   }
   assert.equal(ids.length,111);assert.equal(new Set(ids).size,111);
   await page.locator('#sfiPrevious').click();await idle();assert.match(await page.locator('#sfiCount').innerText(),/81.*100.*111/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   check(`${label}: exact and slash searches, product search, every category, All deduplication over six pages, previous-page action, verified/unavailable states and viewport fit`);
  }
  await page.setViewportSize(desktop);await search('16.1');
  const url=await page.locator('#sfiResults a').getAttribute('href');
  assert.match(url,/^https:\/\/(www\.)?sfifoundation.com\/wp-content\/.*\.pdf$/);
  assert.equal(await page.locator('#sfiResults a').getAttribute('rel'),'noopener noreferrer');
  const popupPromise=context.waitForEvent('page');await page.locator('#sfiResults a').click();const popup=await popupPromise;
  await popup.waitForLoadState('domcontentloaded').catch(()=>{});assert.equal(popup.url(),url);await popup.close();
  const pdf=await request.get(url);assert.equal(pdf.status(),200);assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');
  check('verified PDF opens official document in separate tab; actual response is 200 PDF bytes');
  // Every internal public nav link resolves against the actual localhost build.
  await go(frontend+'/sfi-specs/');await page.waitForSelector('#sfiResults article');
  const links=await page.locator('.sfi-nav a').evaluateAll(es=>es.map(e=>e.href));
  assert.ok(links.length>5);
  for(const url of new Set(links)){if(url.startsWith(frontend))assert.equal((await request.get(url)).status(),200,`Navigation failed: ${new URL(url).pathname}`);}
  check('public navigation has no dead internal links');
  for(const [viewport,label]of [[desktop,'desktop'],[mobile,'mobile']]){
   await page.setViewportSize(viewport);
   const response=await go(frontend+'/sfi-manufacturer-demo/');assert.equal(response.status(),404);
   assert.equal(await page.locator('#demoRows').count(),0);assert.doesNotMatch(await page.locator('body').innerText(),/Fictional Apex Safety Lab/);
   await shot(`${label}-manufacturer-demo-blocked.png`);
  }
  for(const route of ['/assets/js/sfi/manufacturer-demo.js','/_internal/manufacturer-demo.js','/_internal/manufacturer-demo.md','/_internal/specification-research.md','/qa-evidence/browser-results.json','/.env']){
   assert.equal((await request.get(frontend+route)).status(),404);
  }
  for(const route of ['/api/sfi/manufacturers','/api/sfi/manufacturer-demo','/api/sfi/classifier/status','/api/sfi/classify'])assert.equal((await api(route)).status(),404);
  check('production-mode static preview blocks manufacturer page, dataset, research files, environment files and QA; backend exposes no manufacturer data');
  if(process.env.SFI_QA_DEMO_OFF_URL){
    const origin=process.env.SFI_QA_DEMO_OFF_URL;
    assert.equal((await request.get(origin+'/sfi-manufacturer-demo/')).status(),404);
    assert.equal((await request.get(origin+'/_internal/manufacturer-demo.js')).status(),404);
    check('same development output rebuilt with flag off removes stale manufacturer route and fictional dataset over real HTTP');
  }

  const allowed=await api('/api/sfi/stats',{headers:{Origin:frontend}});
  assert.equal(allowed.headers()['access-control-allow-origin'],frontend);assert.equal(allowed.headers()['access-control-allow-credentials'],'true');
  const preflight=await api('/api/sfi/specs',{method:'OPTIONS',headers:{Origin:frontend,'Access-Control-Request-Method':'POST'}});assert.equal(preflight.status(),204);
  const denied=await api('/api/sfi/stats',{headers:{Origin:'https://untrusted.invalid'}});assert.equal(denied.status(),403);assert.equal(denied.headers()['access-control-allow-origin'],undefined);
  check('credentialed local CORS and preflight allowed; unknown origin denied');
  assert.equal((await api('/api/sfi/specs',{method:'POST',data:{}})).status(),401);
  // Use synthetic local-only role selector, then actual auth-required API.
  await go(backend+'/local-demo/');await page.getByRole('button',{name:'Use synthetic member'}).click();await page.waitForURL(frontend+'/sfi-specs/');
  assert.equal((await api('/api/id')).status(),200);assert.equal((await api('/api/sfi/specs',{method:'POST',data:{}})).status(),403);
  await go(backend+'/local-demo/');await page.getByRole('button',{name:'Use synthetic admin'}).click();await page.waitForURL(frontend+'/sfi-specs/');
  await page.waitForSelector('#adminView:not(.sfi__hidden)');assert.equal((await api('/api/sfi/specs',{method:'POST',data:{}})).status(),400);
  const logout=await api('/api/authenticate',{method:'DELETE'});assert.equal(logout.status(),200);
  assert.equal((await api('/api/id')).status(),401);
  check('actual auth decorators: anonymous 401, member 403, admin input validation, normal logout revokes cookie');
  assert.ok(process.env.SFI_QA_PYTHON, 'Set SFI_QA_PYTHON to the backend environment');
  const credential = spawnSync(process.env.SFI_QA_PYTHON, ['-c', `
import sqlite3,secrets
from werkzeug.security import generate_password_hash
connection=sqlite3.connect('/tmp/sfi-public-cleanup-local.db')
assert connection.execute('SELECT id FROM phase1_local_sandbox WHERE id=1').fetchone()
value=secrets.token_urlsafe(32)
connection.execute('UPDATE users SET _password=? WHERE _uid=?',(generate_password_hash(value,'pbkdf2:sha256'), 'phase1-synthetic-member'))
connection.commit();connection.close()
print(value)
`], {encoding:'utf8'});
  assert.equal(credential.status,0,'Synthetic credential preparation failed');
  const login=await api('/api/authenticate',{method:'POST',data:{uid:'phase1-synthetic-member',password:credential.stdout.trim()}});
  assert.equal(login.status(),200,'Normal password authentication failed');
  assert.equal((await api('/api/id')).status(),200);
  assert.equal((await api('/api/authenticate',{method:'DELETE'})).status(),200);
  assert.equal((await api('/api/id')).status(),401);
  check('normal password login, signed authentication cookie, current-user API and logout work over real localhost HTTP with a disposable synthetic credential');

  const after=await (await api('/api/sfi/specs?limit=200')).json();assert.deepEqual(after.map(s=>({number:s.spec_number,status:s.document_status,url:s.view_spec_url})),snapshot);
  check('complete PDF status and verified URL snapshot unchanged after acceptance');
  // Print the shareable report from its local artifact, never publish it.
  const report=await context.newPage();await report.goto('file://'+path.resolve(__dirname,'../../Backend/docs/sfi-pdf-discrepancies-for-jennifer.html'));
  await report.pdf({path:path.join(evidence,'sfi-pdf-discrepancies-for-jennifer.pdf'),preferCSSPageSize:true,printBackground:true});await report.close();
  assert.deepEqual(results.pageErrors,[]);
  // Browser reports deliberate 401/404/403 checks as errors; reject every other console failure.
  results.unexpectedConsoleErrors=results.consoleErrors.filter(e=>!/^Failed to load resource: the server responded with a status of (401|403|404) /.test(e.text));
  assert.deepEqual(results.unexpectedConsoleErrors,[]);
  assert.deepEqual(results.failedRequests,[]);
  check('no page exceptions, unexpected console errors or failed requests');
 } catch(e){results.failure=e.stack;console.error(e.message);process.exitCode=1;}
 finally{if(browser)await browser.close();fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify(results,null,2)+'\n');}
})();
