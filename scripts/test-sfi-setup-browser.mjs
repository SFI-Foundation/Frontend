import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Usage: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-sfi-setup-browser.mjs SITE [BASEURL] [SCREENSHOT]
// Set SFI_SMOKE_ORIGIN to check real HTTP responses instead of intercepting files.
const origin = process.env.SFI_SMOKE_ORIGIN || 'http://sfi.test';
const liveHTTP = Boolean(process.env.SFI_SMOKE_ORIGIN);
const [site, base = '', screenshot] = process.argv.slice(2);
assert.ok(site, 'Supply a generated site directory');
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const context = await browser.newContext();
const page = await context.newPage();
const missing = [], errors = [], responses = [], assets = new Map();
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};
await page.route('**/*',async route=>{
 const u=new URL(route.request().url());
 if(u.origin!==origin)return route.fulfill({status:503,body:'External services excluded from static smoke test'});
 if(base && !u.pathname.startsWith(base+'/')){missing.push(u.pathname);return route.fulfill({status:404,body:'Path escaped project base'});}
 if(liveHTTP)return route.continue();
 let name=u.pathname.slice(base.length).replace(/^\//,'');if(!name || name.endsWith('/'))name+='index.html';
 try{await route.fulfill({body:await readFile(path.join(site,name)),contentType:types[path.extname(name)]||'application/octet-stream'});}
 catch{missing.push(name);await route.fulfill({status:404,body:'Missing generated file'});}
});
page.on('response', response => {
 const url = new URL(response.url());
 if (url.origin !== origin) return;
 if (response.status() >= 400) missing.push({url: url.pathname, status: response.status()});
 if (/\.(css|png|js)$/.test(url.pathname)) assets.set(url.pathname, response.status());
});
page.on('pageerror',e=>errors.push(e.message));
try{
 for(const route of ['', 'about/','history/','specs/','services/','contact/','quiz/','detect/','sfi-specs/','login/','admin/','sfi-profile/','capstone/sfi-repo-setup/']){
  await page.goto(origin+base+'/'+route,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(200);
  assert.equal(await page.locator('.sfi-nav').count(),1);
  assert.equal(await page.locator('.sfi-footer').count(),1);
  assert.equal(await page.locator('.sfi-nav a[href="'+base+'/about/"]').count(),1);
  assert.equal(await page.locator('link[rel="stylesheet"]').getAttribute('href'),base+'/assets/css/sfi.css');
  assert.equal(await page.locator('.sfi-nav').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(26, 95, 168)');
  assert.equal(await page.locator('.sfi-header').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  assert.match(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily),/Inter/);
  assert.ok(await page.locator('.sfi-logo-img').evaluate(async el=>{await el.decode();return el.naturalWidth>0;}),'SFI logo loads');
  responses.push(route||'/');
 }
 await page.goto(origin+base+'/',{waitUntil:'domcontentloaded'});
 await page.locator('.sfi-nav a[href="'+base+'/about/"]').click();
 assert.equal(new URL(page.url()).pathname,base+'/about/');
 assert.equal(assets.get(base+'/assets/css/sfi.css'),200,'Compiled SFI CSS responds 200');
 assert.equal(assets.get(base+'/images/sfi/SFI-Logo.png'),200,'SFI logo responds 200');
 assert.deepEqual(missing,[]);
 assert.deepEqual(errors,[]);
 if (screenshot) await page.screenshot({path:screenshot,fullPage:true});
 console.log(JSON.stringify({result:'PASS',origin,mode:liveHTTP?'HTTP':'generated-file interception',base,pages:responses.length,navigationClick:'About',missingLocalRequests:missing,pageErrors:errors,stylesheetStatus:assets.get(base+'/assets/css/sfi.css'),logoStatus:assets.get(base+'/images/sfi/SFI-Logo.png'),navigationColor:'rgb(26, 95, 168)',headerColor:'rgb(255, 255, 255)',bodyFont:'Inter',externalServices:'blocked; API functionality not tested'}));
}finally{await browser.close();}
