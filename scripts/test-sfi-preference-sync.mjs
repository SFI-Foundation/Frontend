import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const source=name=>readFileSync(new URL('../assets/js/sfi/'+name,import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
function fixture(handler){
 const dom=new JSDOM('<main></main>',{url:'http://localhost:4000/',runScripts:'outside-only'}),w=dom.window;
 w.matchMedia=()=>({matches:false,addEventListener(){}});w.SFI_API_BASE='http://localhost:8605';w.fetch=async(...args)=>{const r=await handler(...args);return {...r,json:async()=>w.JSON.parse(JSON.stringify(await r.json()))};};
 w.eval(source('preferences.js'));w.eval(source('preference-sync.js'));
 return {dom,w,patch:p=>w.SFIPreferences.update(w.JSON.parse(JSON.stringify(p)))};
}
const response=(status,data)=>({status,ok:status>=200&&status<300,json:async()=>data});
test('server preferences override guests; logout restores guest values without account leakage',async()=>{
 let loggedIn=false,record={theme:'dark',language:'es'},revision=1;
 const h=fixture(async(_,options={})=>{
  if(!loggedIn)return response(401,{});
  if(options.method==='PATCH'){const body=JSON.parse(options.body);assert.equal(body.revision,revision);record={...record,...body.preferences};revision++;}
  return response(200,{version:1,revision,preferences:record});
 });
 try{
  await tick();h.patch({accent:'blue'});const guest=h.w.localStorage.getItem(h.w.SFIPreferences.KEY);
  loggedIn=true;h.w.dispatchEvent(new h.w.CustomEvent('sfi-auth',{detail:{uid:'synthetic'}}));await tick();
  assert.equal(h.w.document.getElementById('preferenceSyncStatus'),null,'Successful hydration leaves no status wrapper or spacing');
  assert.equal(h.w.SFIPreferences.get().language,'es');assert.equal(h.w.SFIPreferences.get().accent,'red');
  h.patch({accent:'purple'});await new Promise(r=>setTimeout(r,350));assert.equal(record.accent,'purple');
  assert.equal(h.w.document.getElementById('preferenceSyncMessage'),null,'Successful saves leave no persistent message');
  assert.equal(h.w.localStorage.getItem(h.w.SFIPreferences.KEY),guest);
  loggedIn=false;h.w.dispatchEvent(new h.w.CustomEvent('sfi-auth',{detail:null}));assert.equal(h.w.SFIPreferences.get().accent,'blue');assert.equal(h.w.SFIPreferences.get().language,'en');
 }finally{h.dom.window.close();}
});
test('failed initial account save retries revision zero without losing the edit',async()=>{
 let failing=true,record={},revision=0;
 const h=fixture(async(_,options={})=>{
  if(options.method==='PATCH'){if(failing)return response(503,{});record=JSON.parse(options.body).preferences;revision++;}
  return response(200,{version:1,revision,preferences:record});
 });
 try{
  await tick();h.patch({theme:'dark'});await new Promise(r=>setTimeout(r,350));
  assert.equal(h.w.SFIPreferenceSync.status().state,'error');assert.equal(h.w.SFIPreferences.get().theme,'dark');
  assert.match(h.w.document.getElementById('preferenceSyncMessage').textContent,/Changes have not been saved/);
  assert.equal(h.w.document.getElementById('preferenceSyncRetry').hidden,false);
  failing=false;h.w.document.getElementById('preferenceSyncRetry').click();await tick();
  assert.equal(record.theme,'dark');assert.equal(h.w.SFIPreferenceSync.status().state,'ready');
  assert.equal(h.w.document.getElementById('preferenceSyncStatus'),null,'Retry success removes the complete notice');
  // A later failure must recreate actionable feedback after the row was removed.
  failing=true;h.patch({accent:'blue'});await new Promise(r=>setTimeout(r,350));
  assert.equal(h.w.document.getElementById('preferenceSyncRetry').hidden,false);
 }finally{h.dom.window.close();}
});
test('late account responses cannot reapply settings after logout',async()=>{
 let resolveJSON;
 const h=fixture(async()=>({status:200,ok:true,json:()=>new Promise(resolve=>{resolveJSON=resolve;})}));
 try{
  await tick();h.w.SFIPreferenceSync.logout();resolveJSON({version:1,revision:1,preferences:{language:'es',theme:'dark'}});await tick();
  assert.equal(h.w.SFIPreferenceSync.status().state,'guest');assert.equal(h.w.SFIPreferences.get().language,'en');
 }finally{h.dom.window.close();}
});
test('shared localization updates nested and dynamic UI while protecting user content',async()=>{
 const h=fixture(async()=>response(401,{}));
 try{
  await tick();h.w.document.querySelector('main').innerHTML='<h1>Safety Standards That Drive <span>Motorsports Forward</span></h1><p data-no-translate>Home</p><div id="status"></div><select><option>Monthly</option></select><time datetime="2026-11-18">November 18, 2026</time><img alt="Analysis result">';
  h.w.eval(readFileSync(new URL('../assets/js/vendor/i18next.min.js',import.meta.url),'utf8'));
  h.w.eval(source('locales.js'));h.w.eval(source('localization.js'));
  h.patch({language:'es'});await tick();assert.match(h.w.document.querySelector('h1').textContent,/Normas de seguridad/);assert.equal(h.w.document.querySelector('[data-no-translate]').textContent,'Home');
  h.w.document.querySelector('#status').textContent='Your name has been saved.';await tick();assert.equal(h.w.document.querySelector('#status').textContent,'Tu nombre se ha guardado.');
  assert.equal(h.w.document.querySelector('option').textContent,'Mensualmente');assert.equal(h.w.document.querySelector('select').value,'Monthly');
  assert.equal(h.w.document.querySelector('img').alt,'Resultado del análisis');
  assert.match(h.w.document.querySelector('time').textContent,/noviembre/);assert.equal(h.w.document.documentElement.lang,'es');
  h.patch({language:'en'});await tick();assert.match(h.w.document.querySelector('h1').textContent,/Safety Standards/);assert.equal(h.w.document.querySelector('#status').textContent,'Your name has been saved.');
  assert.equal(h.w.document.querySelector('img').alt,'Analysis result');
  assert.equal(h.w.SFII18n.t('Synthetic missing interface key'),'Synthetic missing interface key');
  assert.ok(h.w.SFII18n.missing().includes('Synthetic missing interface key'));
 }finally{h.dom.window.close();}
});
test('a previous account save cannot block the next account saving',async()=>{
 let account='first',releaseFirst,secondSaved=false;
 const h=fixture(async(_,options={})=>{
  if(options.method==='PATCH'){
   if(account==='first')return new Promise(resolve=>{releaseFirst=()=>resolve(response(200,{version:1,revision:2,preferences:{theme:'dark'}}));});
   secondSaved=true;return response(200,{version:1,revision:2,preferences:JSON.parse(options.body).preferences});
  }
  return response(200,{version:1,revision:1,preferences:{}});
 });
 try{
  await tick();h.patch({theme:'dark'});await new Promise(r=>setTimeout(r,350));assert.equal(typeof releaseFirst,'function');
  h.w.SFIPreferenceSync.logout();account='second';h.w.dispatchEvent(new h.w.CustomEvent('sfi-auth',{detail:{uid:'second'}}));await tick();
  h.patch({accent:'purple'});await new Promise(r=>setTimeout(r,350));assert.equal(secondSaved,true);
  releaseFirst();await tick();assert.equal(h.w.SFIPreferenceSync.status().state,'ready');assert.equal(h.w.SFIPreferences.get().accent,'purple');assert.equal(h.w.SFIPreferences.get().theme,'system');
 }finally{h.dom.window.close();}
});
test('guests retain local persistence when the account service is unavailable',async()=>{
 const h=fixture(async()=>{throw new Error('synthetic offline');});
 try{
  await tick();assert.equal(h.w.SFIPreferenceSync.status().state,'offlineGuest');assert.equal(h.w.SFIPreferenceSync.status().canEdit,true);
  h.patch({theme:'dark',language:'es'});const saved=JSON.parse(h.w.localStorage.getItem(h.w.SFIPreferences.KEY));assert.equal(saved.preferences.language,'es');assert.equal(saved.preferences.theme,'dark');
 }finally{h.dom.window.close();}
});
