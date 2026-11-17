// Check actual Jekyll output, including whole-card links and fragment targets.
// npm run test:redesign -- /path/to/built-site
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import * as sass from 'sass';

const site = process.argv[2];
assert.ok(site, 'Supply a completed Jekyll build destination');
const documentAt = (route) => new JSDOM(readFileSync(path.join(site, route, 'index.html'), 'utf8')).window.document;
const home = documentAt('');
const cards = [...home.querySelectorAll('.sfi-feature-grid > a')];
assert.equal(cards.length, 6);
assert.equal(new Set(cards.map(card => card.href)).size, 6);
for (const card of cards) {
  assert.equal(card.querySelectorAll('a, button, input').length, 0, 'No nested interactive controls');
  assert.ok(home.getElementById(card.getAttribute('aria-labelledby'))?.textContent.trim());
  const url = new URL(card.href, 'https://example.test');
  const target = documentAt(url.pathname);
  if (url.hash) assert.ok(target.getElementById(url.hash.slice(1)), `${url}: fragment exists`);
  const image = card.querySelector('img');
  assert.equal(image.alt, '', 'Linked photo is decorative; heading names the link');
  assert.equal(image.getAttribute('loading'), 'lazy');
}
const hero = home.querySelector('.sfi-home-hero img');
assert.equal(hero.getAttribute('fetchpriority'), 'high');
assert.equal(hero.getAttribute('loading'), 'eager');
assert.equal(hero.alt, '');
assert.ok(home.querySelector('.sfi-home-hero a[href="/sfi-specs/"]'));
assert.ok(home.querySelector('.sfi-home-hero a[href="/about/"]'));
assert.ok(!home.querySelector('.sfi-role-grid'), 'Detailed program information lives off the homepage');
assert.ok(documentAt('about').getElementById('manufacturers-role'));
assert.ok(documentAt('services').getElementById('testing'));

const photoIds = [];
for (const route of ['', 'about', 'services', 'contact', 'history', 'news-events', 'sfi-specs']) {
  const doc = documentAt(route);
  assert.equal(doc.querySelectorAll('h1').length, 1, `${route}: one page heading`);
  assert.equal(doc.querySelectorAll('link[rel="stylesheet"]').length, 1);
  assert.equal(doc.querySelectorAll('style').length, 0);
  assert.equal(doc.querySelectorAll('[style]').length, 0, `${route}: no inline presentation`);
  assert.ok(doc.querySelector('nav[aria-label="Primary navigation"]'));
  assert.ok(doc.querySelector('footer a[href="/photo-credits/"]'));
  photoIds.push(...[...doc.querySelectorAll('main [data-photograph]')].map(node => node.dataset.photograph));
  for (const img of doc.querySelectorAll('main img')) {
    assert.ok(img.hasAttribute('alt'));
    assert.ok(img.getAttribute('width') && img.getAttribute('height'));
    assert.ok(existsSync(path.join(site, img.getAttribute('src'))));
  }
}
assert.equal(photoIds.length, 13, 'Every public photographic placement is audited');
assert.equal(new Set(photoIds).size, photoIds.length, 'No photograph repeats across the public site');
const manifest = JSON.parse(readFileSync(new URL('../docs/site-photography/image-manifest.json', import.meta.url), 'utf8'));
const originals = photoIds.map(id => manifest[id].source_sha256);
assert.equal(new Set(originals).size, originals.length, 'Renaming the same photograph does not make it unique');
assert.equal(new Set(photoIds.map(id => decodeURI(manifest[id].original_url))).size, photoIds.length, 'Different crops of one source cannot bypass the no-repeat rule');
const credits = documentAt('photo-credits');
for (const id of photoIds) {
  assert.ok(credits.getElementById(id)?.querySelector('a[href*="creativecommons.org/"]'), `${id}: public license attribution`);
  for (const file of manifest[id].files) {
    const bytes = readFileSync(path.join(site, file.path));
    assert.equal(bytes.length, file.bytes, `${file.path}: expected optimized asset`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `${file.path}: recorded photo provenance`);
  }
}
const contact = documentAt('contact');
assert.equal(contact.querySelectorAll('main form').length, 0, 'Do not imply a submission service exists');
assert.ok(contact.querySelector('main a[href="mailto:sfi@sfifoundation.com"]'));
assert.ok(contact.querySelector('main a[href="tel:+18584518868"]'));
assert.match(contact.querySelector('main address').textContent, /15708 Pomerado Road.*Suite N208.*Poway, CA 92064/);

const entry = readFileSync(new URL('../assets/css/sfi.scss', import.meta.url), 'utf8').replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
const compiled = sass.compileString(entry, { loadPaths: [new URL('../_sass', import.meta.url).pathname], logger: { warn() {}, debug() {} } });
for (const partial of ['components/_image-banner.scss', 'components/_feature-grid.scss', 'pages/_home.scss', 'pages/_contact.scss']) {
  assert.ok(compiled.loadedUrls.some(url => url.pathname.endsWith(partial)), `${partial}: connected to real entry`);
}
// Sass JS and Jekyll's newer embedded Sass serialize this custom-property
// font name with different quote styles. Both spell the same CSS family.
// Canonicalize only that known declaration; compare all other output exactly.
const normalize = css => css.replace(/\/\*# sourceMappingURL=.*?\*\//gs, '')
  .replace(/(--sfi-font:\s*)["']Inter["'](, Arial, sans-serif;)/g, '$1Inter$2').trim();
assert.equal(normalize(readFileSync(path.join(site, 'assets/css/sfi.css'), 'utf8')), normalize(compiled.css));
console.log('PASS: 13 unique photographs across the public site, licensed asset hashes, six accessible linked photo cards, destinations, contact actions, and actual compiled Sass');
