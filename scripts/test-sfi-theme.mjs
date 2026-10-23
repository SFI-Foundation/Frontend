// Generated-output checks: node scripts/test-sfi-theme.mjs /path/to/built-site
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const site = process.argv[2];
assert.ok(site, 'Supply a Jekyll build destination');
const css = readFileSync(path.join(site, 'assets/css/sfi.css'), 'utf8');
assert.ok(css.length > 30000, 'Complete shared and page styles must compile');
assert.ok(!css.includes('@import "'), 'Sass imports must resolve');
const definitions = new Set([...css.matchAll(/(--sfi-[\w-]+)\s*:/g)].map(m => m[1]));
for (const m of css.matchAll(/var\((--sfi-[\w-]+)/g)) assert.ok(definitions.has(m[1]), `Undefined token ${m[1]}`);
for (const selector of ['.sfi-header', '.sfi-nav', '.auth-card', '.sfi-profile', '.adm-wrap', '.sfi__container', '.sfi-chat-window']) {
  assert.ok(css.includes(`.sfi-site ${selector}`), `Missing scoped component ${selector}`);
}
assert.match(css, /--sfi-blue:\s*#1a5fa8/i);
assert.match(css, /--sfi-bg:\s*#f4f5f7/i);
assert.match(css, /--sfi-white:\s*#fff/i);
assert.match(css, /--sfi-gold:\s*#f0a500/i);
assert.match(css, /["']?Inter["']?/);
assert.match(css, /["']?Oswald["']?/);
assert.match(css, /:focus-visible/);
assert.doesNotMatch(css, /color-scheme:\s*dark/i);
assert.match(css, /#e8a020/i, 'Spec Search retains its yellow navigation accent');
assert.match(css, /max-width: 600px/);
assert.match(css, /max-width: 900px/);
const pages = ['', 'about', 'history', 'specs', 'services', 'contact', 'quiz', 'detect', 'sfi-specs', 'login', 'sfi-profile', 'admin', 'signup', 'profile', 'logout', 'sfifoundation', '404.html', 'sfi-ml.html', 'sfi-database.html', 'capstone/sfi-ml-blog'];
let references = 0;
let destinations = 0;
for (const name of pages) {
  const html = readFileSync(path.join(site, ...(name.endsWith('.html') ? [name] : [name, 'index.html'])), 'utf8');
  assert.match(html, /<body class="sfi-site(?: [^"<>]+)?">/);
  for (const branding of ['Open Coding Society', 'School Email Verification', '/images/logo.png']) {
    assert.ok(!html.includes(branding), `${name}: classroom branding must stay out of SFI`);
  }
  assert.ok(!/<style[\s>]/i.test(html), `${name}: appearance belongs in Sass`);
  const styles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)];
  assert.equal(styles.length, 1, `${name}: one public theme`);
  assert.ok(styles[0][1].endsWith('/assets/css/sfi.css'));
  assert.ok(!html.includes('href="/sfifoundation/"'), 'Logo must link to the real homepage');
  for (const match of html.matchAll(/<(?:link|img|script)\b[^>]+(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/')) continue;
    // Allows a GitHub Pages baseurl before a known asset directory.
    const asset = url.split(/[?#]/)[0].replace(/^.*?\/(assets|images)\//, '$1/').replace(/^\//, '');
    assert.ok(existsSync(path.join(site, asset)), `${name}: missing ${url}`);
    references++;
  }
  for (const match of html.matchAll(/<a\b[^>]+href="([^"]+)"/g)) {
    const url = match[1];
    if (url.startsWith('#')) {
      const id = decodeURIComponent(url.slice(1));
      if (id) assert.ok(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `${name}: missing anchor ${url}`);
    } else if (url.startsWith('/') && !url.startsWith('//')) {
      const relative = url.split(/[?#]/)[0].replace(/^\//, '');
      assert.ok([relative, `${relative}.html`, path.join(relative, 'index.html')].some(file => existsSync(path.join(site, file))), `${name}: missing destination ${url}`);
      destinations++;
    }
  }
  const navigation = html.match(/<ul class="sfi-nav-links"[^>]*>([\s\S]*?)<\/ul>/)?.[1];
  assert.ok(navigation, `${name}: shared navigation exists`);
  const labels = [...navigation.matchAll(/<li[^>]*><a[^>]*>([^<]+)<\/a>/g)].map(m => m[1]);
  assert.deepEqual(labels, ['About', 'History', 'Specs', 'Services', 'Contact', 'My Gear', 'Detect', 'Spec Search', 'Sign In']);
}
console.log(`PASS: ${pages.length} SFI pages, ${references} asset references, ${destinations} internal destinations, scoped blue-and-white CSS, tokens, navigation and responsive/focus rules`);

for (const [name, target] of [['signup/index.html', '/login/#register'], ['profile/index.html', '/sfi-profile/'], ['login.html', '/login/'], ['sfifoundation/index.html', '/']]) {
  const html = readFileSync(path.join(site, name), 'utf8');
  const redirect = html.match(/<meta http-equiv="refresh" content="0; url=([^"]+)"/);
  assert.ok(redirect && redirect[1].endsWith(target), `${name}: expected SFI redirect ${target}`);
  assert.ok(!html.includes('School Email Verification'));
}
for (const name of ['login', 'signup', 'profile', 'logout']) {
  assert.ok(existsSync(path.join(site, 'classroom', name, 'index.html')), `Preserve classroom ${name}`);
}
console.log('PASS: public account aliases, SFI sign-out, and preserved classroom account pages');

const classroomProfile = readFileSync(path.join(site, 'classroom/profile/index.html'), 'utf8');
assert.match(classroomProfile, /id="sidebar-profile" href="[^"<>]*\/classroom\/profile\/"/);
assert.match(classroomProfile, /id="loginArea" href="[^"<>]*\/classroom\/login\/"/);
console.log('PASS: classroom profile navigation stays within classroom account routes');

const prototype = readFileSync(path.join(site, 'classroom/sfi-prototype/index.html'), 'utf8');
assert.ok(prototype.includes('Send a Message') && prototype.includes('SFI Specs Assistant'));
console.log('PASS: legacy SFI landing aliases the public homepage; review prototype retained');
