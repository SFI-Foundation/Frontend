// Usage: node scripts/test-sfi-api-config.mjs BUILT_SITE
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
const site = process.argv[2];
const source = await readFile(path.join(site, 'assets/js/sfi/api-base.js'), 'utf8');
for (const [host, expected] of [['localhost', 'http://localhost:8423'], ['127.0.0.1', 'http://localhost:8423'], ['sfi-foundation.github.io', 'https://greppers-be.opencodingsociety.com']]) {
  const context = vm.createContext({ window: {}, location: { hostname: host } });
  vm.runInContext(source, context);
  assert.equal(context.window.SFI_API_BASE, expected);
  const auth = await readFile(path.join(site, 'assets/js/api/config.js'), 'utf8');
  assert.ok(auth.includes("import '../sfi/api-base.js'"));
  vm.runInContext(auth.replace(/^import .*;$/mg, '').replaceAll('export ', '') + '\nwindow.authBase = pythonURI; window.opts = fetchOptions;', context);
  assert.equal(context.window.authBase, expected);
  assert.equal(context.window.opts.credentials, 'include');
  const requests = [];
  context.fetch = async (url, opts) => { requests.push({ url, opts }); return { ok: true, json: async () => [] }; };
  vm.runInContext(await readFile(path.join(site, 'assets/js/sfi/quiz-data.js'), 'utf8') + '\nwindow.quiz = QuizData;', context);
  await context.window.quiz.fetchSpecs();
  assert.equal(requests[0].url, expected + '/api/sfi/specs');
}
const override = vm.createContext({window: {}, location: {hostname: 'localhost'}});
vm.runInContext(source.replace('const configured = "";', 'const configured = "https://configured.example/";'), override);
assert.equal(override.window.SFI_API_BASE, 'https://configured.example');
for (const route of ['quiz', 'detect', 'sfi-specs']) {
  const html = await readFile(path.join(site, route, 'index.html'), 'utf8');
  assert.ok(html.includes('/Frontend/assets/js/sfi/api-base.js'));
  assert.ok(!html.includes('greppers-be.opencodingsociety.com'));
}
console.log('PASS: local/loopback/Pages defaults, custom URL, auth credentials, quiz requests, and generated SFI script references');
