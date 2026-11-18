// Reproducible source color inventory and built-page localization coverage.
// node scripts/audit-sfi-preferences.mjs <built-site> <report-directory>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
const [site,output='docs/preferences-evidence']=process.argv.slice(2);
fs.mkdirSync(output,{recursive:true});
const scope={window:{}};vm.runInNewContext(fs.readFileSync('assets/js/sfi/locales.js','utf8'),scope);
const locales=scope.window.SFILocales,keys=locales.en.translation;
function files(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(root,entry.name)):[path.join(root,entry.name)]);}
const colors=[];
for(const file of [...files('_sass/sfi'),...files('assets/js/sfi')]){
 if(file.endsWith('/locales.js'))continue;
 fs.readFileSync(file,'utf8').split('\n').forEach((text,index)=>{
  if(!/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(|hsla?\(/i.test(text))return;
  const category=/legacy|chatbot/.test(file)?'disconnected legacy/reference':/tokens|properties|settings|preferences\.js/.test(file)?'central theme palettes':/admin/.test(file)?'fixed status tints':/feature-grid|image-banner|footer|home|content|detect|specs|mixins|accessibility/.test(file)?'inverted imagery, camera, status or shadow':/form|auth/.test(file)?'accent focus token or fixed white button foreground':'fixed status tint or inverted control foreground';
  colors.push({file,line:index+1,category,source:text.trim()});
 });
}
fs.writeFileSync(path.join(output,'color-inventory.json'),JSON.stringify(colors,null,2)+'\n');
const routes=['','about','history','services','news-events','contact','sfi-specs','login','sfi-profile','settings','admin','quiz','detect','photo-credits'];
const coverage=[];
for(const route of routes){
 const dom=new JSDOM(fs.readFileSync(path.join(site,route,'index.html'),'utf8'));
 const walker=dom.window.document.createTreeWalker(dom.window.document.body,dom.window.NodeFilter.SHOW_TEXT);
 const found=new Set(),untranslated=new Set();let node;
 while((node=walker.nextNode())){
  if(node.parentElement.closest('script,style,code,pre,textarea,[data-no-translate],time,.sfi-footer-contact'))continue;
  const value=node.nodeValue.replace(/\s+/g,' ').trim();
  if(!/[a-zA-Z]{3}/.test(value))continue;
  if(Object.hasOwn(keys,value)){found.add(value);continue;}
  if(/^(SFI Foundation|SFI$|PDF$|Esc$|https?:|\d|sfi@|Fax:|Suite N208$|Poway, CA 92064$)/.test(value))continue;
  untranslated.add(value);
 }
 coverage.push({route:'/'+(route?route+'/':''),translatedStaticStrings:found.size,untranslated:[...untranslated]});dom.window.close();
}
const report={languages:Object.fromEntries(Object.entries(locales).map(([lang,value])=>[lang,{keys:Object.keys(value.translation).length,designation:['en','es'].includes(lang)?'application UI':'partial preview'}])),routes:coverage,limitations:['Official specifications, document text, news source titles, manufacturer identities, attribution/legal text and user content intentionally remain unchanged.','Coverage counts static rendered UI; browser and unit tests separately verify dynamic account/search messages.','Archived classroom and vendor projects use separate layouts and are outside the SFI application interface.']};
fs.writeFileSync(path.join(output,'localization-coverage.json'),JSON.stringify(report,null,2)+'\n');
const missing=coverage.flatMap(item=>item.untranslated.map(text=>({route:item.route,text})));
console.log(JSON.stringify({colorFindings:colors.length,languageKeys:report.languages,untranslated:missing},null,2));
if(missing.length)process.exitCode=1;
