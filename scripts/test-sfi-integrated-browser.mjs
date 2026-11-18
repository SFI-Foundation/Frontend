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
const results={workflows:[],responsive:[],themes:[],accessibility:[],untranslated:[],errors:[]};
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
 const a=await context(),pa=await page(a);
 await goto(pa,'/');assert.match(await pa.locator('h1').innerText(),/Safety Standards/);
 await pa.locator('.sfi-settings-gear').click();await pa.locator('#pref-language').selectOption('es');
 await goto(pa,'/');assert.match(await pa.locator('h1').innerText(),/Normas de seguridad/);assert.equal(await pa.locator('html').getAttribute('lang'),'es');
 await goto(pa,'/login/');assert.equal(await pa.locator('label[for="loginUid"]').innerText(),'Nombre de usuario');
 await pa.locator('#loginBtn').click();assert.match(await pa.locator('#msgBox').innerText(),/Completa/);
 await pa.locator('#loginUid').fill(fixture.uid);await pa.locator('#loginPass').fill(fixture.password);await pa.locator('#loginBtn').click();await pa.locator('#profileCard').waitFor({state:'visible'});await settled(pa);
 // New accounts intentionally use defaults, rather than silently adopting guest preferences.
 assert.equal(await pa.evaluate(()=>SFIPreferences.get().language),'en');
 await goto(pa,'/sfi-profile/');
 await pa.route('**/api/sfi/profile',route=>route.request().method()==='PUT'?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Your profile could not be saved. Please try again.'})}):route.fallback());
 await pa.locator('#profileNameInput').fill('Synthetic Unsaved');await pa.locator('#profileNameSave').click();await pa.waitForFunction(()=>document.getElementById('profileNameStatus').textContent.includes('could not'));
 assert.equal(await pa.locator('#profileNameInput').inputValue(),'Synthetic Unsaved');await pa.unroute('**/api/sfi/profile');
 await pa.locator('#profileNameInput').fill('Synthetic Updated Profile');await pa.locator('#profileNameSave').click();await pa.waitForFunction(()=>document.getElementById('profileNameStatus').textContent.includes('saved'));
 await pa.reload();await pa.locator('#profileNameInput').waitFor();await pa.waitForFunction(()=>document.getElementById('profileNameInput').value==='Synthetic Updated Profile');
 assert.equal((await proof({proof_uid:fixture.uid})).data.name,'Synthetic Updated Profile');
 assert.equal((await api(pa,'/api/sfi/profile/roles')).status,403);
 assert.equal((await api(pa,'/api/sfi/profile','PUT',{name:'x'})).status,400);
 await goto(pa,'/settings/');
 for(const [key,value]of Object.entries({theme:'dark',accent:'purple',language:'es',textSize:'large'}))await pa.locator('#pref-'+key).selectOption(value);
 await settled(pa);
 const dbA=(await proof({proof_uid:fixture.uid})).data;assert.equal(dbA.preferences.language,'es');assert.equal(dbA.preferences.accent,'purple');
 // No account settings persist into the guest localStorage key.
 assert.equal(await pa.evaluate(()=>JSON.parse(localStorage.getItem(SFIPreferences.KEY)).preferences.theme),'system');
 const b=await context(390),pb=await page(b);await login(pb,fixture.uid);
 assert.equal(await pb.evaluate(()=>SFIPreferences.get().language),'es');assert.equal(await pb.locator('html').getAttribute('data-sfi-theme'),'dark');
 await goto(pb,'/settings/');assert.equal(await pb.locator('#pref-accent').inputValue(),'purple');assert.equal(await pb.locator('#pref-textSize').inputValue(),'large');
 await pb.locator('#pref-accent').selectOption('teal');await settled(pb);await pa.reload();await settled(pa);assert.equal(await pa.locator('#pref-accent').inputValue(),'teal');
 await goto(pa,'/sfi-profile/');assert.equal(await pa.locator('#profileNameSave').innerText(),'Guardar nombre');await pa.reload();assert.equal(await pa.locator('#profileNameSave').innerText(),'Guardar nombre');
 results.workflows.push('English -> Spanish homepage/login/profile/settings; reload persistence; real profile DB update; two independent browser contexts retrieve DB preferences; reverse device update; account data excluded from guest storage');
 // Optimistic conflict and failed saves must remain visible and recoverable.
 await goto(pa,'/settings/');await goto(pb,'/settings/');await pa.locator('#pref-accent').selectOption('blue');await settled(pa);await pb.locator('#pref-accent').selectOption('orange');await pb.waitForFunction(()=>SFIPreferenceSync.status().state==='conflict');
 await pb.locator('#preferenceSyncRetry').click();await settled(pb);assert.equal(await pb.locator('#pref-accent').inputValue(),'blue');
 await pb.route('**/api/sfi/settings',route=>route.request().method()==='PATCH'?route.fulfill({status:503,contentType:'application/json',body:'{}'}):route.fallback());
 await pb.locator('#pref-accent').selectOption('green');await pb.waitForFunction(()=>SFIPreferenceSync.status().state==='error');assert.equal(await pb.locator('#pref-accent').inputValue(),'green');
 await pb.unroute('**/api/sfi/settings');await pb.locator('#preferenceSyncRetry').click();await settled(pb);assert.equal((await proof({proof_uid:fixture.uid})).data.preferences.accent,'green');
 results.workflows.push('stale device conflicts prevent overwrites; failed save retains interaction, shows error and retries successfully');
 await goto(pa,'/logout/');await pa.waitForURL('**/login/');await pa.waitForFunction(()=>SFIPreferenceSync.status().state==='guest');assert.equal(await pa.evaluate(()=>SFIPreferences.get().language),'es');
 await login(pa,fixture.admin_uid);assert.equal(await pa.evaluate(()=>SFIPreferences.get().language),'en');
 assert.equal((await api(pa,'/api/sfi/users')).status,200);await goto(pa,'/admin/');await pa.locator('#admMain').waitFor({state:'visible'});
 await goto(pa,'/sfi-profile/');await pa.locator('#profileNameInput').fill('Synthetic Admin Profile');await pa.locator('#profileNameSave').click();await pa.waitForFunction(()=>document.getElementById('profileNameStatus').textContent.includes('saved'));assert.equal((await proof({proof_uid:fixture.admin_uid})).data.name,'Synthetic Admin Profile');
 // Catalog seed through the real authorized API; technical source names remain unchanged.
 for(let i=0;i<23;i++)assert.equal((await api(pa,'/api/sfi/specs','POST',{spec_number:'99.'+(i+1),product_name:'Synthetic Equipment '+i,category:'Testing'})).status,201);
 await goto(pa,'/settings/');await pa.locator('#pref-language').selectOption('es');await pa.locator('#pref-resultsPerPage').selectOption('10');await settled(pa);
 await goto(pa,'/sfi-specs/');await pa.locator('#viewPublicBtn').click();await pa.locator('#sfiResults article').first().waitFor();
 assert.equal(await pa.locator('#sfiResults article').count(),10);assert.match(await pa.locator('#sfiCount').innerText(),/especificaciones/);assert.equal(await pa.locator('#sfiResults a').count(),0);assert.match(await pa.locator('#sfiResults').innerText(),/vigente no está disponible/);
 await pa.locator('#sfiNext').click();await pa.waitForFunction(()=>document.getElementById('sfiCount').textContent.includes('11'));await pa.locator('#sfiSearch').fill('99.23');await pa.waitForFunction(()=>document.querySelectorAll('#sfiResults article').length===1);
 results.workflows.push('admin and member profile persistence; admin-only API authorization; canonical search, Spanish results, page size, pagination, filtering and unapproved-PDF protection');
 const routes=['/','/about/','/history/','/services/','/news-events/','/contact/','/sfi-specs/','/login/','/sfi-profile/','/settings/','/admin/','/quiz/','/detect/'];
 const accents=['red','blue','green','purple','orange','teal','monochrome'];
 for(const width of (process.env.SFI_SKIP_MATRIX ? [] : [1440,1024,768,390,320])){
  await pa.setViewportSize({width,height:1000});
  for(const route of routes){
   console.log('Matrix',width,route); await goto(pa,route);
   if(route==='/sfi-specs/'&&await pa.locator('#viewPublicBtn').isVisible())await pa.locator('#viewPublicBtn').click();
   for(const theme of ['light','dark'])for(const accent of (width===1440?accents:['purple'])){
    await pa.evaluate(({theme,accent})=>SFIPreferences.update({theme,accent,textSize:'extra-large',largeTargets:true,enhancedFocus:true,highContrast:true,underlineLinks:true,lineSpacing:true,reducedMotion:true}),{theme,accent});
    const visual=await pa.evaluate(()=>({background:getComputedStyle(document.body).backgroundColor,accent:getComputedStyle(document.body).getPropertyValue('--sfi-blue').trim(),size:getComputedStyle(document.documentElement).fontSize,motion:document.documentElement.dataset.sfiMotion}));
    assert.equal(visual.background,theme==='dark'?'rgb(16, 24, 32)':'rgb(255, 255, 255)');
    assert.equal(visual.accent,await pa.evaluate(value=>SFIPreferences.ACCENTS[value][0],accent));
    assert.equal(visual.size,'20px');assert.equal(visual.motion,'reduced');
    await overflow(pa,`${route} ${width} ${theme} ${accent}`);
    results.themes.push({route,width,theme,accent,overflow:false});
   }
   if(width===1440){
    const axe=await new AxeBuilder({page:pa}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    results.accessibility.push({route,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
   }
  }
  if(width<=768){await goto(pa,'/');await pa.locator('#navToggle').click();assert.equal(await pa.locator('#navToggle').getAttribute('aria-expanded'),'true');await pa.keyboard.press('Escape');assert.equal(await pa.locator('#navToggle').getAttribute('aria-expanded'),'false');}
  results.responsive.push({width,routes:routes.length});
 }
 await goto(pa,'/settings/');await pa.evaluate(()=>SFIPreferences.update({theme:'system',highContrast:false,textSize:'large',accent:'purple'}));await settled(pa);await pa.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});assert.equal(await pa.locator('html').getAttribute('data-sfi-theme'),'dark');assert.equal(await pa.locator('html').getAttribute('data-sfi-motion'),'reduced');
 if(process.env.SFI_SKIP_MATRIX){await pa.setViewportSize({width:320,height:1000});await overflow(pa,'final updated Settings at 320px');}
 await pa.locator('#settingsAccountDetails').waitFor({state:'visible'});await pa.screenshot({path:path.join(output,'spanish-dark-settings.png'),fullPage:true});await goto(pa,'/');await pa.screenshot({path:path.join(output,'spanish-home-mobile.png'),fullPage:true});
 await pa.locator('#sfi-main').focus();await pa.keyboard.press('?');await pa.locator('.sfi-shortcut-dialog').waitFor({state:'visible'});await pa.keyboard.press('Escape');assert.equal(await pa.locator('.sfi-shortcut-dialog').isVisible(),false);
 await goto(pa,'/settings/');await pa.locator('#pref-language').selectOption('en');await settled(pa);await goto(pa,'/');assert.match(await pa.locator('h1').innerText(),/Safety Standards/);
 if(!process.env.SFI_SKIP_MATRIX)results.workflows.push('five widths; all seven accents light/dark on all 13 active SFI routes at desktop; enlarged text/high contrast/focus/links/motion/targets');
 // Keyboard access to the persistent gear and normal public registration flow.
 await pa.evaluate(()=>{document.body.tabIndex=-1;document.body.focus();});
 await pa.keyboard.press('Tab');assert.equal(await pa.locator('.sfi-skip-link').evaluate(el=>el===document.activeElement),true);
 await pa.keyboard.press('Tab');await pa.keyboard.press('Tab');assert.equal(await pa.locator('.sfi-settings-gear').evaluate(el=>el===document.activeElement),true);
 await pa.keyboard.press('Enter');await pa.locator('#pref-theme').waitFor();
 const c=await context(),pc=await page(c);await goto(pc,'/login/#register');
 await pc.locator('#regName').fill('Synthetic Registered User');await pc.locator('#regUid').fill('synthetic_registered_user');await pc.locator('#regPass').fill(fixture.password);await pc.locator('#regBtn').click();
 await pc.waitForURL('**/sfi-profile/?onboarding=1');await pc.locator('#profileNameInput').waitFor();await pc.waitForFunction(()=>document.getElementById('profileNameInput').value==='Synthetic Registered User');
 await pc.locator('input[name="involvement"][value="manufacturer"]').check();await pc.locator('#preferencesSave').click();await pc.waitForFunction(()=>document.getElementById('preferencesStatus').textContent.includes('saved'));
 assert.equal((await api(pc,'/api/sfi/profile/roles')).status,403);assert.equal(await pc.locator('#roleManagement').isVisible(),false);
 assert.equal((await proof({proof_uid:'synthetic_registered_user'})).data.role,'User');
 await c.close();
 const offline=await context(),po=await page(offline);
 await po.route('**/api/sfi/settings',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
 await goto(po,'/settings/');assert.equal(await po.evaluate(()=>SFIPreferenceSync.status().state),'offlineGuest');await po.locator('#pref-theme').selectOption('dark');await po.reload();await po.waitForFunction(()=>SFIPreferenceSync.status().state==='offlineGuest');assert.equal(await po.locator('#pref-theme').inputValue(),'dark');
 await po.unroute('**/api/sfi/settings');await po.locator('#preferenceSyncRetry').click();await po.waitForFunction(()=>SFIPreferenceSync.status().state==='guest');await offline.close();
 results.workflows.push('guest settings persist through an account-service outage and retry without requiring an account');
 results.workflows.push('OS system dark/reduced motion; keyboard dialog and gear navigation; return to English; public registration and optional manufacturer onboarding remain unprivileged');
 assert.deepEqual(results.errors,[],'No JavaScript errors');
 await a.close();await b.close();
} finally {
 await writeFile(path.join(output,'integrated-results.json'),JSON.stringify(results,null,2));
 if(browser)await browser.close();bridge.stdin.end();
}
console.log('Integrated browser checks completed; inspect accessibility violations in results JSON.');
