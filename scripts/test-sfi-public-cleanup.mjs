// Assert the production artifact, including data and secrets, not only CSS visibility.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
const root = path.resolve(import.meta.dirname, '..');
const site = process.env.SFI_BUILT_SITE;

test('public search source contains no research UI or demo navigation', () => {
  const source = readFileSync(path.join(root, 'navigation/sfi-specs.md'), 'utf8');
  assert.doesNotMatch(source, /safetyCanvas|safety-showcase|classifyInput|classifyBtn|ML accuracy|classifier\/status|sfi-manufacturer-demo|panel-classifier/i);
  for (const id of ['sfiSearchForm', 'sfiFilters', 'sfiResults', 'sfiNext', 'sfiPrevious', 'statSpecs']) assert.ok(source.includes(`id="${id}"`));
  assert.match(readFileSync(path.join(root, '_config.yml'), 'utf8'), /sfi_manufacturer_demo: false/);
});

test('production artifact excludes prototypes, QA, docs, scripts and credential files', { skip: !site && 'Set SFI_BUILT_SITE to a completed production-mode build' }, () => {
  for (const name of ['sfi-manufacturer-demo', 'assets/js/sfi/manufacturer-demo.js', '_internal', 'qa-evidence', 'docs/sfi-phase1.md', 'scripts', '.env', '.env.local']) {
    assert.equal(existsSync(path.join(site, name)), false, `Unexpected public output: ${name}`);
  }
  const html = readFileSync(path.join(site, 'sfi-specs/index.html'), 'utf8');
  assert.doesNotMatch(html, /safetyCanvas|classifyInput|ML accuracy|manufacturer-demo/i);
});

test('no known committed credential values or provider tokens in generated assets', { skip: !site && 'Set SFI_BUILT_SITE' }, () => {
  // Read known exposures privately in memory; never emit values or response bodies.
  const originals = [['.env', root], ['_includes/slim_sidebar.html',root], ['_posts/Foundation/B-tools_and_equipment/2025-08-06-flask-api.md',root], ['scripts/old/rds_init.py', path.resolve(root, '../Backend')], ['scripts/old/update_data.py', path.resolve(root, '../Backend')]];
  const needles = [];
  for (const [file, repo] of originals) {
    const base = repo.endsWith('Backend') ? 'b134c76fa75cdac857975d306cd7fc75780c85b3' : '77915a71106e82a215ac3da54fab129290d221bc';
    const source = execFileSync('git', ['show', `${base}:${file}`], { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    for (const line of source.split('\n')) {
      if (!/password|secret|token|api_key/i.test(line) || !line.includes('=')) continue;
      let value = line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
      if (value.length >= 8 && !/replace|example|placeholder|process\.|os\.|\{|\}/i.test(value)) needles.push(value);
    }
  }
  assert.ok(needles.length > 0, 'Known exposure baseline was not loaded');
  const tokens = /AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|ghp_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
  let scanned = 0;
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(filename);
      else {
        assert.ok(!/^(?:\.env(?:\..*)?|.*\.(?:pem|key|p12|pfx))$/.test(entry.name), `Private file present: ${path.relative(site, filename)}`);
        const data = readFileSync(filename); scanned++;
        for (const value of needles) assert.equal(data.includes(Buffer.from(value)), false, `Known credential exposure in ${path.relative(site, filename)}`);
        if (/\.(?:html|css|js|mjs|json|txt|xml|map|yml)$/i.test(filename)) assert.equal(tokens.test(data.toString()), false, `Potential provider credential in ${path.relative(site, filename)}`);
        assert.equal(data.includes(Buffer.from('Fictional Apex Safety Lab')), false, `Fictional manufacturer data in ${path.relative(site, filename)}`);
      }
    }
  }
  walk(site);
  assert.ok(scanned > 100);
  console.log(`Scanned ${scanned} generated files; known secrets and fictional manufacturer records absent`);
});
