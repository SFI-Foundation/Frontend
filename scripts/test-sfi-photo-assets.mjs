// Audit generated URLs, including candidates the browser may not select today.
import assert from 'node:assert/strict';
import { readFileSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import test from 'node:test';
import { JSDOM } from 'jsdom';

function auditPhotos(document, site) {
  const base = document.querySelector('.opencs-bar__brand').getAttribute('href');
  const resolveAsset = value => {
    assert.ok(value?.startsWith(base), `Image must use the site's relative_url prefix: ${value}`);
    const url = new URL(value, 'https://sfi.test');
    const file = path.resolve(site, decodeURIComponent(url.pathname.slice(base.length)));
    assert.ok(file.startsWith(path.resolve(site) + path.sep), 'Image stays inside build output');
    assert.ok(statSync(file).isFile(), `Missing generated image: ${value}`);
    assert.ok(statSync(file).size > 0, `Empty generated image: ${value}`);
  };
  for (const figure of document.querySelectorAll('[data-photograph]')) {
    assert.ok(figure.dataset.photograph, 'Missing photography record produced an empty ID');
    const img = figure.querySelector('img');
    assert.ok(Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0);
    assert.ok(img.hasAttribute('alt'));
    resolveAsset(img.getAttribute('src'));
    const sources = figure.querySelectorAll('source');
    assert.ok(sources.length > 0, 'Responsive picture must have a source');
    for (const source of sources) {
      const srcset = source.getAttribute('srcset');
      assert.ok(srcset?.trim(), 'Responsive srcset cannot be empty');
      for (const candidate of srcset.split(',')) {
        const [url, width] = candidate.trim().split(/\s+/);
        assert.match(width || '', /^[1-9]\d*w$/);
        resolveAsset(url);
      }
    }
  }
}

test('photo audit rejects missing responsive assets and stale empty Liquid records', () => {
  const site = mkdtempSync(path.join(os.tmpdir(), 'sfi-photo-regression-'));
  const markup = `<a class="opencs-bar__brand" href="/preview/"></a>
    <figure data-photograph="card-testing"><picture>
    <source srcset="/preview/images/card-480.webp 480w, /preview/images/card-960.webp 960w">
    <img src="/preview/images/card-960.jpg" width="960" height="640" alt=""></picture></figure>`;
  try {
    mkdirSync(path.join(site, 'images'));
    for (const file of ['card-480.webp', 'card-960.jpg']) writeFileSync(path.join(site, 'images', file), 'fixture');
    const document = new JSDOM(markup).window.document;
    assert.throws(() => auditPhotos(document, site), /card-960.webp/, 'A missing unselected srcset file must fail');
    writeFileSync(path.join(site, 'images/card-960.webp'), 'fixture');
    auditPhotos(document, site);
    document.querySelector('figure').dataset.photograph = '';
    document.querySelector('img').src = '/preview/images/-.jpg';
    document.querySelector('source').srcset = '';
    assert.throws(() => auditPhotos(document, site), /empty ID/);
    document.querySelector('figure').dataset.photograph = 'card-testing';
    document.querySelector('img').src = '/preview/images/card-960.jpg';
    assert.throws(() => auditPhotos(document, site), /srcset cannot be empty/);
  } finally {
    rmSync(site, { recursive: true, force: true });
  }
});

const site = process.env.SFI_BUILT_SITE;
test('all public photographs and every rendered responsive candidate exist in Jekyll output', {
  skip: !site && 'Set SFI_BUILT_SITE to the actual preview or production destination',
}, () => {
  let placements = 0;
  for (const route of ['', 'about', 'contact', 'services', 'history', 'news-events', 'sfi-specs', 'login', 'sfi-profile', 'quiz', 'admin', 'detect']) {
    const document = new JSDOM(readFileSync(path.join(site, route, 'index.html'), 'utf8')).window.document;
    auditPhotos(document, site);
    placements += document.querySelectorAll('[data-photograph]').length;
    if (!route) {
      const cards = [...document.querySelectorAll('.sfi-feature-card')];
      assert.equal(cards.length, 6);
      assert.equal(new Set(cards.map(card => card.querySelector('figure').dataset.photograph)).size, 6);
    }
    // Account-menu and noscript destinations are separate from primary page links.
    const nav = [...document.querySelectorAll('#navLinks > .opencs-nav__link')];
    const base = document.querySelector('.opencs-bar__brand').getAttribute('href');
    const active = nav.filter(a => a.hasAttribute('aria-current'));
    const target = `${base}${route}${route ? '/' : ''}`;
    assert.deepEqual(active.map(a => a.getAttribute('href')), nav.filter(a => a.getAttribute('href') === target).map(a => a.getAttribute('href')));
    assert.ok(!document.querySelector('.opencs-nav__link--specs'), 'Spec Search uses the normal link style');
  }
  assert.equal(placements, 13, 'Audit every public photographic placement');
});
