// Compile the real Sass entry and check the changed rendered pages.
// npm run test:styles -- <built-site>
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

assert.ok(process.argv[2], 'Supply the Jekyll destination directory');
const root = fileURLToPath(new URL('../', import.meta.url));
const entry = readFileSync(path.join(root, 'assets/css/sfi.scss'), 'utf8');
const source = entry.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
assert.notEqual(source, entry, 'Sass entry retains Jekyll front matter');
const result = sass.compileString(source, { loadPaths: [path.join(root, '_sass')], logger: { warn() {}, debug() {} } });
assert.ok(result.loadedUrls.some(url => url.pathname.endsWith('/pages/_gear.scss')));
assert.ok(result.loadedUrls.some(url => url.pathname.endsWith('/pages/_admin.scss')));
assert.ok(result.loadedUrls.every(url => !url.pathname.includes('/legacy/')));
for (const line of result.css.split('\n')) {
  if (!line.trim().endsWith('{')) continue;
  const selector = line.trim().slice(0, -1).trim();
  if (selector.startsWith('@') || /^(?:from|to|[\d.]+%)(?:,\s*(?:from|to|[\d.]+%))*$/.test(selector)) continue;
  assert.ok(selector.startsWith('.sfi-site'), `Unscoped selector: ${selector}`);
}
for (const route of ['quiz', 'admin']) {
  const html = readFileSync(path.join(process.argv[2], route, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /<style\b|\sstyle=["']/i, `${route}: inline presentation`);
  const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
  assert.equal(styles.length, 1, `${route}: one generated Sass stylesheet`);
  assert.match(styles[0][0], /\/assets\/css\/sfi\.css/);
}
console.log(`PASS: scoped SFI Sass compiled (${result.loadedUrls.length} imports); quiz/admin use one generated stylesheet and no inline presentation`);
