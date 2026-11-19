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


 const checked=[],expectedConsole=[],unexpectedConsole=[];
 for(const role of ['guest','member','admin']){
  const ctx=await context(),p=await page(ctx);
  p.on('console',message=>{
   if(message.type()!=='error')return;
   const text=message.text();
   // Offline third-party models and rejected guest requests are intentional in
   // this isolated environment; preserve them in the result, do not hide them.
   const expected=text.startsWith('Failed to load resource:') || text.startsWith('TensorFlow.js runtime failed to initialize:') || text.startsWith('COCO-SSD load failed:') || text.startsWith('MobileNet load failed:');
   (expected?expectedConsole:unexpectedConsole).push({role,url:p.url(),message:text});
  });
  if(role!=='guest')await login(p,role==='admin'?fixture.admin_uid:fixture.uid);
  for(const route of ['/','/sfi-specs/','/settings/','/sfi-profile/','/admin/','/login/','/about/','/news-events/','/contact/','/services/','/history/','/detect/','/quiz/','/photo-credits/']){
   await goto(p,route);await p.waitForTimeout(150);checked.push({role,route});
  }
  await ctx.close();
 }
 await writeFile(path.join(output,'console-results.json'),JSON.stringify({checked,expectedConsole,unexpectedConsole,pageErrors:results.errors},null,2));
 assert.deepEqual(unexpectedConsole,[]);assert.deepEqual(results.errors,[]);
 console.log(JSON.stringify({pages:checked.length,expectedOfflineOrAuthorizationErrors:expectedConsole.length,unexpectedConsole:unexpectedConsole.length,pageErrors:results.errors.length}));
}finally{if(browser)await browser.close();bridge.stdin.end();bridge.kill();}
