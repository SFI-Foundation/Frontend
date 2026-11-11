import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const source = readFileSync(new URL('../assets/js/sfi/spec-search.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../navigation/sfi-specs.md', import.meta.url), 'utf8');
const item = { id: 1, canonical_id: '16.1', spec_number: '16.1', product_name: 'Driver Restraints', description: 'Demo description', categories: ['Auto Racing', 'Drag Racing'], revision_date: 'March 1, 2026', recertification_rules: [{ product: 'Demo', period: '2 Years' }], document_status: 'verified_current', view_spec_url: 'https://sfifoundation.com/wp-content/pdfs/specs/Spec_16.1.pdf' };
const settle = () => new Promise(resolve => setTimeout(resolve, 5));
function setup(handler) {
  const dom = new JSDOM(page, { url: 'http://localhost:4000/Frontend/sfi-specs/', runScripts: 'outside-only' });
  dom.window.fetch = async () => { throw new Error('Unexpected default fetch'); };
  dom.window.eval(source);
  const calls = [];
  const fetch = async url => {
    const parsed = new URL(url); calls.push(parsed);
    if (parsed.pathname.endsWith('/categories')) return { ok: true, json: async () => ['Auto Racing', 'Drag Racing'] };
    if (parsed.pathname.endsWith('/stats')) return { ok: true, json: async () => ({ by_category: { 'Auto Racing': 1, 'Drag Racing': 1 } }) };
    return handler(parsed);
  };
  const app = dom.window.SFISpecSearch.mount({ api: 'http://backend.test/api/sfi', fetch });
  return { dom, app, calls, doc: dom.window.document };
}
const result = (items = [item], total = items.length) => ({ ok: true, json: async () => ({ items, total, page: 1, limit: 20 }) });

test('accessible API search, category overlap, clear, pagination and labels', async () => {
  const { dom, app, calls, doc } = setup(() => result([item, item], 21));
  await app.load(); await settle();
  assert.equal(doc.querySelectorAll('#sfiResults article').length, 1);
  assert.match(doc.getElementById('sfiResults').textContent, /Current revision: March 1, 2026/);
  assert.match(doc.getElementById('sfiResults').textContent, /Auto Racing.*Drag Racing/s);
  assert.equal(doc.querySelector('label[for="sfiSearch"]').textContent, 'Specification number or product name');
  assert.equal(doc.getElementById('sfiCount').getAttribute('role'), 'status');
  assert.equal(doc.querySelector('#sfiResults a').getAttribute('rel'), 'noopener noreferrer');
  doc.getElementById('sfiSearch').value = '  16.1   ';
  doc.getElementById('sfiSearchForm').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(calls.at(-1).pathname, '/api/sfi/specs/search');
  assert.equal(calls.at(-1).searchParams.get('q'), '16.1');
  assert.equal(calls.at(-1).searchParams.get('format'), 'page');
  doc.querySelector('[data-category="Drag Racing"]').click(); await settle();
  assert.equal(calls.at(-1).searchParams.get('category'), 'Drag Racing');
  assert.equal(doc.querySelector('[data-category="Drag Racing"]').getAttribute('aria-pressed'), 'true');
  doc.getElementById('sfiNext').click(); await settle();
  assert.equal(calls.at(-1).searchParams.get('page'), '2');
  doc.getElementById('sfiClear').click(); await settle();
  assert.equal(doc.activeElement.id, 'sfiSearch');
  assert.equal(calls.at(-1).pathname, '/api/sfi/specs');
  assert.equal(doc.getElementById('sfiResults').getAttribute('aria-busy'), 'false');
  dom.window.close();
});

test('loading, empty and error states have actionable retry', async () => {
  let resolve;
  const { dom, app, doc } = setup(() => new Promise(r => { resolve = r; }));
  const loading = app.load();
  assert.equal(doc.getElementById('sfiResults').getAttribute('aria-busy'), 'true');
  resolve(result([])); await loading;
  assert.equal(doc.getElementById('sfiNoResults').hidden, false);
  assert.match(doc.getElementById('sfiCount').textContent, /^0/);
  const failure = app.load(); resolve({ ok: false, status: 503 }); await failure;
  assert.equal(doc.getElementById('sfiRetry').hidden, false);
  assert.match(doc.getElementById('sfiNoResults').textContent, /503/);
  dom.window.close();
});

test('stale responses never replace newer results', async () => {
  const resolvers = [];
  const { dom, app, doc } = setup(() => new Promise(resolve => resolvers.push(resolve)));
  const first = app.load(); const second = app.load();
  resolvers[1](result([{ ...item, product_name: 'Newest' }])); await second;
  resolvers[0](result([{ ...item, product_name: 'Stale' }])); await first;
  assert.match(doc.getElementById('sfiResults').textContent, /Newest/);
  assert.doesNotMatch(doc.getElementById('sfiResults').textContent, /Stale/);
  dom.window.close();
});

test('unverified, unsafe and outdated links cannot become actions; content escaped', () => {
  const { dom } = setup(() => result());
  const render = dom.window.SFISpecSearch.card;
  for (const change of [{ view_spec_url: 'javascript:alert(1)' }, { view_spec_url: 'https://evil.test/a.pdf' }, { view_spec_url: 'https://sfifoundation.com.evil.test/a.pdf' }, { document_status: 'outdated' }]) {
    const html = render({ ...item, ...change });
    assert.doesNotMatch(html, /<a /); assert.match(html, /unavailable/);
  }
  const html = render({ ...item, product_name: '<img src=x onerror=alert(1)>', description: '<script>bad()</script>' });
  assert.doesNotMatch(html, /<img|<script>/);
  assert.match(html, /&lt;script&gt;/);
  dom.window.close();
});
