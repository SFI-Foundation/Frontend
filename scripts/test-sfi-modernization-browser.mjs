// Rendered Jekyll -> real browser cookies -> Flask HTTP Unix socket -> disposable DB.
// PLAYWRIGHT_MODULE=/path/playwright AXE_MODULE=/path/@axe-core/playwright node scripts/test-sfi-integrated-browser.mjs <python> <backend> <site> <output>
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const AxeBuilder = require(process.env.AXE_MODULE || '@axe-core/playwright').default;
const [python, backend, site, output] = process.argv.slice(2);
await mkdir(output, { recursive: true });
const bridge = spawn(python, [path.resolve('scripts/sfi-settings-fixture.py'), path.resolve(backend)], { stdio: ['pipe', 'pipe', 'pipe'] });
bridge.stderr.resume();
let fixtureResolve, fixtureReject;
const fixturePromise = new Promise((a,b) => { fixtureResolve=a; fixtureReject=b; });
const startup = setTimeout(()=>fixtureReject(new Error('Fixture startup timeout')),45000);
const pending = new Map(); let sequence = 0;
createInterface({input:bridge.stdout}).on('line',line=>{
  if(!line.startsWith('{')) return;
  const data=JSON.parse(line);
  if(data.fixture){clearTimeout(startup);fixtureResolve(data.fixture);}
  else if(pending.has(data.id)){pending.get(data.id)(data);pending.delete(data.id);}
});
bridge.on('exit', code=>fixtureReject(new Error('Fixture exited '+code)));
const proof=fields=>new Promise(resolve=>{const id=++sequence;pending.set(id,resolve);bridge.stdin.write(JSON.stringify({id,...fields})+'\n');});
const results={workflows:[],responsive:[],themes:[],accessibility:[],localization:[],untranslated:[],errors:[]};
let browser;
const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
try {
 const fixture=await fixturePromise;
 assert.ok(fixture.socket,'Live HTTP socket is required');
 browser=await chromium.launch({args:['--no-sandbox'], ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
 async function context(width=1440){
  const ctx=await browser.newContext({viewport:{width,height:1000},colorScheme:'light'});
  await ctx.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.hostname==='localhost' && url.port==='8605'){
    const headers=await req.allHeaders();
    const response=await new Promise((resolve,reject)=>{
     const call=http.request({socketPath:fixture.socket,path:url.pathname+url.search,method:req.method(),headers},res=>{
      const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:Object.fromEntries(Object.entries(res.headers).map(([k,v])=>[k,Array.isArray(v)?v.join('\n'):String(v)])),body:Buffer.concat(chunks)}));
     });call.on('error',reject);call.end(req.postDataBuffer());
    });return route.fulfill(response);
   }
   if(url.hostname!=='localhost'||url.port!=='4000')return route.abort();
   let relative=decodeURIComponent(url.pathname).replace(/^\//,'');if(!relative||relative.endsWith('/'))relative+='index.html';
   const file=path.resolve(site,relative);if(!file.startsWith(path.resolve(site)+path.sep))return route.abort();
   try{return route.fulfill({body:await readFile(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:'Missing test asset'});}
  });return ctx;
 }
 async function page(ctx){const p=await ctx.newPage();p.on('pageerror',e=>results.errors.push(e.message));return p;}
 async function goto(p,route){await p.goto('http://localhost:4000'+route);await p.waitForFunction(()=>window.SFIPreferenceSync && ['guest','ready','offlineGuest'].includes(SFIPreferenceSync.status().state));}
 async function api(p,route,method='GET',body){return p.evaluate(async({route,method,body})=>{const r=await fetch('http://localhost:8605'+route,{method,credentials:'include',headers:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,data:await r.json().catch(()=>null)};},{route,method,body});}
 async function login(p,uid){await goto(p,'/login/');await p.locator('#loginUid').fill(uid);await p.locator('#loginPass').fill(fixture.password);await p.locator('#loginBtn').click();await p.locator('#profileCard').waitFor({state:'visible'});await p.waitForFunction(()=>SFIPreferenceSync.status().state==='ready');}
 async function settled(p){await p.waitForFunction(()=>SFIPreferenceSync.status().state==='ready');}
 async function overflow(p,label){const bad=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(bad){await p.screenshot({path:path.join(output,'overflow.png'),fullPage:true}); const nodes=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>el.checkVisibility()&&el.getBoundingClientRect().right>innerWidth+1).slice(0,10).map(el=>({tag:el.tagName,id:el.id,cls:el.className,text:el.textContent.slice(0,55),right:el.getBoundingClientRect().right}))); throw new Error(label+' overflow '+JSON.stringify(nodes));}}

 const baseline=process.argv.includes('--baseline');
 // Explicitly synthetic canonical rows, created only through the protected API
 // in the fixture's disposable database. Never seed real/client databases.
 const seedContext=await context(), seedPage=await page(seedContext);
 await login(seedPage,fixture.admin_uid);
 for(let i=1;i<=23;i++)assert.equal((await api(seedPage,'/api/sfi/specs','POST',{spec_number:'99.'+i,product_name:'Synthetic QA equipment '+i,category:i%2?'QA restraints':'QA protection'})).status,201);
 await seedContext.close();

 const routes=['/','/sfi-specs/','/settings/','/sfi-profile/','/admin/','/login/','/about/','/news-events/','/contact/','/services/','/history/','/detect/','/quiz/','/photo-credits/'];
 for(const role of ['guest','member','admin']) {
  const ctx=await context(), p=await page(ctx); p.setDefaultTimeout(20000);
  if(role!=='guest')await login(p,role==='admin'?fixture.admin_uid:fixture.uid);
  for(const width of [375,768,1024,1440,1920]) {
   await p.setViewportSize({width,height:1000});
   for(const route of routes) {
    // Gear's canonical route is detected below by the built artifact audit.
    
    await goto(p,route);
    if(route==='/sfi-specs/'&&await p.locator('#viewPublicBtn').isVisible())await p.locator('#viewPublicBtn').click();
    await p.waitForTimeout(100);
    await overflow(p,role+' '+route+' '+width);
    if(!baseline) {
     assert.equal(await p.locator('#accountToggle').count(),0,'No account dropdown');
     const ids=await p.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);});
     assert.deepEqual(ids,[],route+' unique IDs');
     if(role!=='guest') {
      if(width<=800)await p.locator('#navToggle').click();
      assert.ok(await p.locator('#accountLinks').isVisible());
      assert.equal(await p.locator('#accountAdmin').isVisible(),role==='admin');
      if(width<=800) {await p.keyboard.press('Escape');assert.equal(await p.locator('#navToggle').getAttribute('aria-expanded'),'false');}
     }
    }
    if([375,1440].includes(width) && ['/','/sfi-specs/','/settings/','/sfi-profile/','/admin/','/login/'].includes(route)) {
     const slug=route==='/'?'home':route.split('/')[1];
     await p.screenshot({path:path.join(output,role+'-'+slug+'-'+width+'.png'),fullPage:true});
     if(route==='/'&&role==='admin') {
      if(width<=800)await p.locator('#navToggle').click();
      else if(baseline)await p.locator('#accountToggle').click();
      await p.screenshot({path:path.join(output,'navigation-'+width+'.png'),fullPage:false});
     }
    }
    if(!baseline&&width===1440) {
     const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
     results.accessibility.push({role,route,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    }
    results.responsive.push({role,route,width,overflow:false});
   }
  }
  if(!baseline) {
   await p.setViewportSize({width:1440,height:1000});
   for(const route of routes) {
    await goto(p,route);await p.evaluate(()=>SFIPreferences.update({theme:'dark',language:'es'}));
    if(role!=='guest')await settled(p);
    if(route==='/sfi-specs/'&&await p.locator('#viewPublicBtn').isVisible())await p.locator('#viewPublicBtn').click();
    await p.waitForTimeout(100);await overflow(p,role+' dark Spanish '+route);
    const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    results.accessibility.push({role,route,theme:'dark',language:'es',violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    if(['/settings/','/sfi-specs/'].includes(route))await p.screenshot({path:path.join(output,role+'-'+route.split('/')[1]+'-dark-es.png'),fullPage:true});
   }
   await goto(p,'/sfi-specs/');
   if(await p.locator('#viewPublicBtn').isVisible())await p.locator('#viewPublicBtn').click();
   await p.locator('#sfiSearch').fill('no synthetic matches');await p.locator('#sfiNoResults').waitFor({state:'visible'});
   await p.locator('#sfiClear').click();await p.locator('#sfiResults article').first().waitFor();
   assert.equal(await p.locator('#sfiResults a').count(),0,'Unapproved QA documents have no actions');
   await p.locator('#sfiSearch').fill('99.23');await p.waitForFunction(()=>document.querySelectorAll('#sfiResults article').length===1);
   await p.locator('#sfiClear').click();
   await p.route('**/api/sfi/specs**',route=>route.request().method()==='GET'?route.fulfill({status:503,contentType:'application/json',body:'{}'}):route.fallback());
   await p.locator('#sfiSearchForm button[type="submit"]').click();await p.locator('#sfiRetry').waitFor({state:'visible'});
   await p.unroute('**/api/sfi/specs**');await p.locator('#sfiRetry').click();await p.locator('#sfiResults article').first().waitFor();
   results.workflows.push(role+': canonical search, clear, no results, unapproved PDF, error and retry');
   await goto(p,'/settings/');await p.evaluate(()=>SFIPreferences.update({language:'en',theme:'light'}));
   if(role!=='guest')await settled(p);
   await p.locator('#settingsSearch').fill('zzzz unmatched');await p.locator('#settingsEmpty').waitFor({state:'visible'});
   await p.locator('#settingsSearch').press('Escape');assert.equal(await p.locator('#settingsSearch').inputValue(),'');
   if(!await p.locator('.sfi-settings-sections').evaluate(n=>n.open))await p.locator('.sfi-settings-sections summary').click();await p.locator('[data-settings-link="appearance"]').click();assert.equal(await p.locator('[data-settings-link="appearance"]').getAttribute('aria-current'),'location');
   if(role!=='guest') {
    await goto(p,'/admin/');
    if(role==='member') {await p.locator('#admGate').waitFor({state:'visible'});assert.equal((await api(p,'/api/sfi/profile/roles')).status,403);}
    else {await p.locator('#admMain').waitFor({state:'visible'});await p.locator('#tab-groups').click();await p.locator('#panel-groups').waitFor({state:'visible'});await p.locator('#tab-review').click();await p.locator('#panel-review').waitFor({state:'visible'});}
    await p.locator('#accountSignOut').click();await p.waitForURL('**/login/');assert.equal(await p.locator('#accountLinks').isVisible(),false);
   }
  }
  await ctx.close();console.log('Completed '+role);
 }
 assert.deepEqual(results.errors,[]);
 await writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));
 const violations=results.accessibility.filter(a=>a.violations.length);
 if(violations.length)throw new Error('Accessibility violations: '+JSON.stringify(violations));
 console.log(JSON.stringify({responsive:results.responsive.length,accessibility:results.accessibility.length,errors:results.errors.length}));
}finally{if(browser)await browser.close();bridge.stdin.end();bridge.kill();}
