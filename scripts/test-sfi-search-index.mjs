// Check the actual Liquid template and, when provided, the production artifact.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const fields = ['title', 'content', 'url', 'relUrl', 'date'];
function parseIndex(text) {
  const records = Object.values(JSON.parse(text));
  assert.ok(records.length > 0);
  for (const record of records) {
    assert.deepEqual(Object.keys(record).sort(), [...fields].sort());
    for (const field of fields) assert.equal(typeof record[field], 'string', field);
    assert.ok(record.relUrl.startsWith('/'));
  }
  return records;
}

test('real Jekyll search template encodes quotes and controls in posts and pages', () => {
  const ruby = String.raw`
    Dir.mktmpdir('sfi-index-fixture-') do |source|
      FileUtils.mkdir_p(File.join(source, 'assets/js'))
      FileUtils.mkdir_p(File.join(source, '_posts'))
      FileUtils.cp(ARGV.fetch(0), File.join(source, 'assets/js/search-data.json'))
      post_title = 'Quoted "post" &amp; title'
      page_title = "Quoted \"page\"\t title"
      File.write(File.join(source, '_posts/2026-01-01-fixture.md'),
        "---\ntitle: #{JSON.generate(post_title)}\n---\nANSI \e[31mred\e[0m and quoted text.\n")
      File.write(File.join(source, 'fixture.md'),
        "---\ntitle: #{JSON.generate(page_title)}\npermalink: /fixture/\n---\nANSI \e[32mgreen\e[0m and quoted text.\n")
      Jekyll.logger.log_level = :error
      config = Jekyll.configuration('source' => source,
        'destination' => File.join(source, '_site'), 'url' => 'https://fixture.test',
        'plugins' => [], 'theme' => nil, 'disable_disk_cache' => true)
      Jekyll::Site.new(config).process
      STDOUT.write(File.read(File.join(source, '_site/assets/js/search-data.json')))
    end
  `;
  const text = execFileSync('bundle', ['exec', 'ruby', '-rjekyll', '-rjson',
    '-rtmpdir', '-rfileutils', '-e', ruby, path.join(root, 'assets/js/search-data.json')],
  { cwd: root, encoding: 'utf8' });
  const records = parseIndex(text);
  assert.ok(records.some(record => record.title === 'Quoted "post" & title'));
  assert.ok(records.some(record => record.title === 'Quoted "page"\t title'));
  assert.ok(records.some(record => record.content.includes('\u001b[31m')));
  assert.ok(records.some(record => record.content.includes('\u001b[32m')));
});

test('complete production search index parses with its existing field contract', {
  skip: !process.env.SFI_BUILT_SITE && 'Set SFI_BUILT_SITE to a fresh Jekyll destination',
}, () => {
  const records = parseIndex(readFileSync(path.join(process.env.SFI_BUILT_SITE,
    'assets/js/search-data.json'), 'utf8'));
  assert.ok(records.length > 100, 'Audit the complete site index');
});
