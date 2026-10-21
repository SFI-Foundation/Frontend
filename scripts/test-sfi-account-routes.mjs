// Client checks for public aliases and the independent SFI sign-out flow.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { documentFor, execute, settle } from './test-sfi-profile.mjs';
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('public account aliases keep SFI destinations and classroom forms remain available', () => {
    for (const [file, target] of [
        ['navigation/authentication/login.md', '/login/'],
        ['navigation/signup.md', '/login/#register'],
        ['navigation/authentication/profile.md', '/sfi-profile/'],
    ]) {
        const source = read(file);
        assert.match(source, /layout: sfi-redirect/);
        assert.ok(source.includes(`sfi_redirect: "${target}"`));
    }
    for (const name of ['login', 'signup', 'profile', 'logout']) {
        assert.ok(read(`navigation/classroom/${name}.md`).includes(`permalink: /classroom/${name}/`));
    }
    assert.match(read('navigation/classroom/login.md'), /handleGoogleSignIn/);
    assert.match(read('navigation/classroom/signup.md'), /signupOptionsJava/);
    assert.match(read('navigation/classroom/profile.md'), /layout: profile/);
    assert.match(read('navigation/classroom/logout.md'), /await handleLogout\(\)/);
});

test('signup alias selects the existing Create Account tab without changing authentication', async () => {
    const html = read('navigation/login.md');
    const document = documentFor(html);
    const source = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
    execute('window.location = { hash: "#register" };\n' + source, document,
        async () => ({ ok: false, status: 401, json: async () => ({}) }));
    await settle();
    assert.equal(document.getElementById('registerFields').style.display, 'block');
    assert.equal(document.getElementById('loginFields').style.display, 'none');
    assert.equal(document.getElementById('authForm').style.display, 'block');
});

async function logoutHarness(responses, base = '/Frontend') {
    const nodes = {
        signOutStatus: { textContent: '' },
        signOutRetry: { hidden: false, addEventListener(type, callback) { this[type] = callback; } },
    };
    const calls = [], redirects = [], events = [];
    vm.runInNewContext(read('assets/js/sfi/logout.js').replace(/^import .*;\s*$/m, ''), {
        document: { getElementById: id => nodes[id] },
        pythonURI: 'https://backend.example', URL,
        window: { location: { href: `https://sfi.example${base}/logout/`, replace: url => redirects.push(url) },
                  dispatchEvent: event => events.push(event) },
        CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
        fetch: async (url, options) => {
            calls.push({ url, options });
            const response = responses.shift();
            if (response instanceof Error) throw response;
            return response;
        },
    });
    await settle();
    return { nodes, calls, redirects, events };
}

test('SFI logout deletes the Python cookie session and returns to the baseurl login', async () => {
    const h = await logoutHarness([{ ok: true, status: 200 }]);
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].url, 'https://backend.example/api/authenticate');
    assert.equal(h.calls[0].options.method, 'DELETE');
    assert.equal(h.calls[0].options.credentials, 'include');
    assert.deepEqual(h.redirects, ['https://sfi.example/Frontend/login/']);
    assert.equal(h.events[0].type, 'sfi-auth');
    assert.equal(h.events[0].detail, null);
});

test('SFI logout treats an expired cookie as signed out and offers retry on failure', async () => {
    const expired = await logoutHarness([{ ok: false, status: 401 }], '');
    assert.deepEqual(expired.redirects, ['https://sfi.example/login/']);
    const h = await logoutHarness([{ ok: false, status: 500 }, { ok: true, status: 200 }]);
    assert.equal(h.redirects.length, 0);
    assert.equal(h.nodes.signOutRetry.hidden, false);
    assert.match(h.nodes.signOutStatus.textContent, /failed/);
    h.nodes.signOutRetry.click();
    await settle();
    assert.equal(h.redirects.length, 1);
    const offline = await logoutHarness([new Error('Offline')]);
    assert.equal(offline.redirects.length, 0);
    assert.equal(offline.nodes.signOutRetry.hidden, false);
});
