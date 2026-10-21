// Dependency-free DOM/HTTP simulations. Run: node --test scripts/test-sfi-profile.mjs
// These check client behavior; Flask tests separately exercise real database persistence.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('navigation/sfi-profile.html');
const loginPage = read('navigation/login.md');
const defaults = () => ({ causes: [], participation: [], skills: '', volunteering: null, availability: '' });
const user = () => ({ name: 'SFI Member', uid: 'member', role: 'User', interests: defaults() });
const settle = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setImmediate(resolve)); };

function documentFor(html) {
    const nodes = new Map();
    function node(id, props = {}) {
        const result = {
            id, value: '', textContent: '', checked: false, disabled: false, hidden: false,
            style: {}, classList: { toggle() {} }, events: {},
            children: [],
            replaceChildren() { this.children = []; this.value = ''; },
            appendChild(child) { this.children.push(child); if (!this.value) this.value = child.value || ''; },
            addEventListener(type, callback) { this.events[type] = callback; },
            ...props,
        };
        Object.defineProperty(result, 'innerHTML', { set() { throw Error('Use textContent for user data'); } });
        return result;
    }
    for (const match of html.matchAll(/id="([^"]+)"/g)) nodes.set(match[1], node(match[1]));
    const inputs = Array.from(html.matchAll(/<input type="checkbox" name="([^"]+)" value="([^"]+)"/g),
        match => node('', { name: match[1], value: match[2] }));
    return {
        nodes, inputs,
        createElement: tag => node('', { tagName: tag }),
        getElementById: id => { assert.ok(nodes.has(id), `Missing element: ${id}`); return nodes.get(id); },
        querySelectorAll: selector => {
            if (selector.startsWith('#interestForm ')) return [...inputs, nodes.get('interestSkills'), nodes.get('interestVolunteering'), nodes.get('interestAvailability')];
            const [, name] = selector.match(/name="([^"]+)"/);
            return inputs.filter(input => input.name === name && (!selector.endsWith(':checked') || input.checked));
        },
    };
}

function execute(source, document, fetch) {
    const events = [];
    const window = { dispatchEvent: event => events.push(event) };
    vm.runInNewContext(source.replace(/^import .*;\s*$/m, ''), {
        document, fetch, window, pythonURI: 'http://localhost:8423', API_BASE: 'http://localhost:8423',
        CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
        console,
    });
    return { window, events };
}

function quizHarness() {
    const document = documentFor(page);
    let stored = user();
    let failure = 0;
    const writes = [];
    const fetch = async (url, options) => {
        assert.equal(options.credentials, 'include');
        assert.equal(options.cache, 'no-store');
        assert.ok(url.startsWith('http://localhost:8423/api/sfi/profile'));
        if (failure) return { ok: false, status: failure, json: async () => ({ message: 'Unable to save answers' }) };
        if (options.method === 'PUT' && url.endsWith('/interests')) {
            assert.equal(options.headers['Content-Type'], 'application/json');
            const answers = JSON.parse(options.body);
            writes.push(answers);
            stored.interests = answers;
        } else if (options.method === 'PUT') {
            assert.equal(url, 'http://localhost:8423/api/sfi/profile');
            stored.name = JSON.parse(options.body).name;
        }
        return { ok: true, status: 200, json: async () => structuredClone(stored) };
    };
    const result = execute(read('assets/js/sfi/profile.js'), document, fetch);
    return { ...result, document, writes, fail: status => { failure = status; }, stored: () => stored };
}

test('profile renders identity and quiz saves, reloads, updates and clears', async () => {
    const h = quizHarness();
    const el = id => h.document.getElementById(id);
    await settle();
    assert.equal(el('sfiProfileName').textContent, 'SFI Member');
    assert.equal(el('sfiProfileUid').textContent, 'member');
    assert.equal(el('sfiProfileRole').textContent, 'User');
    assert.equal(el('sfiProfileCauses').textContent, 'Not answered');
    h.document.inputs.find(input => input.value === 'Motorsports safety').checked = true;
    h.document.inputs.find(input => input.value === 'Volunteer').checked = true;
    el('interestSkills').value = '<img src=x onerror=alert(1)>';
    el('interestVolunteering').value = 'yes';
    el('interestAvailability').value = 'Monthly';
    el('interestForm').events.submit({ preventDefault() {} });
    assert.equal(el('interestSave').disabled, true);
    await settle();
    assert.deepEqual(h.writes[0], {
        causes: ['Motorsports safety'], participation: ['Volunteer'],
        skills: '<img src=x onerror=alert(1)>', volunteering: true, availability: 'Monthly',
    });
    assert.equal(el('sfiProfileSkills').textContent, '<img src=x onerror=alert(1)>');
    assert.match(el('interestStatus').textContent, /saved/);
    el('interestSkills').value = 'Unsaved edit';
    el('profileRetry').events.click();
    await settle();
    assert.equal(el('interestSkills').value, h.stored().interests.skills);
    el('interestSkills').value = 'Mentoring';
    el('interestForm').events.submit({ preventDefault() {} });
    await settle();
    assert.equal(el('sfiProfileSkills').textContent, 'Mentoring');
    el('interestClear').events.click();
    await settle();
    assert.deepEqual(h.writes.at(-1), defaults());
    assert.equal(el('sfiProfileSkills').textContent, 'Not answered');
    assert.equal(el('interestSkills').value, '');
});

test('failed quiz save keeps edits and expired authentication hides private profile', async () => {
    const h = quizHarness();
    const el = id => h.document.getElementById(id);
    await settle();
    h.fail(500);
    el('interestSkills').value = 'Keep this unsaved edit';
    el('interestForm').events.submit({ preventDefault() {} });
    await settle();
    assert.equal(el('interestSkills').value, 'Keep this unsaved edit');
    assert.equal(el('interestSave').disabled, false);
    assert.equal(el('interestStatus').textContent, 'Unable to save answers');
    h.fail(401);
    el('interestForm').events.submit({ preventDefault() {} });
    await settle();
    assert.equal(el('profileContent').hidden, true);
    assert.equal(el('profileSignIn').hidden, false);
    assert.equal(h.events.at(-1).detail, null);
});

test('profile load failure offers a working retry', async () => {
    const h = quizHarness();
    await settle();
    h.fail(503);
    h.document.getElementById('profileRetry').events.click();
    await settle();
    assert.equal(h.document.getElementById('profileRetry').hidden, false);
    h.fail(0);
    h.document.getElementById('profileRetry').events.click();
    await settle();
    assert.equal(h.document.getElementById('profileContent').hidden, false);
    assert.equal(h.document.getElementById('profileRetry').hidden, true);
});

test('name and quiz editing preserve unsaved changes in the other form', async () => {
    const h = quizHarness();
    const el = id => h.document.getElementById(id);
    await settle();
    el('interestSkills').value = 'Unsaved skills';
    el('profileNameInput').value = 'Updated Name';
    el('profileNameForm').events.submit({ preventDefault() {} });
    await settle();
    assert.equal(el('sfiProfileName').textContent, 'Updated Name');
    assert.equal(el('interestSkills').value, 'Unsaved skills');
    el('profileNameInput').value = 'Unsaved name';
    el('interestForm').events.submit({ preventDefault() {} });
    await settle();
    assert.equal(el('profileNameInput').value, 'Unsaved name');
    assert.equal(el('sfiProfileSkills').textContent, 'Unsaved skills');
});

function loginHarness(respond) {
    const document = documentFor(loginPage);
    const source = loginPage.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
    const result = execute(source, document, async (url, options) => {
        assert.equal(options.credentials, 'include');
        const [status, data] = respond(url, options);
        return { ok: status >= 200 && status < 300, status, json: async () => data };
    });
    return { ...result, document };
}

test('login requires a working authentication cookie and signup requires eight characters', async () => {
    const h = loginHarness((url, options) => options.method === 'POST' ? [200, { user: user() }] : [401, {}]);
    await settle();
    h.document.getElementById('loginUid').value = 'member';
    h.document.getElementById('loginPass').value = 'test-only-password';
    h.window.doLogin();
    await settle();
    assert.equal(h.document.getElementById('profileCard').style.display, 'none');
    assert.match(h.document.getElementById('msgBox').textContent, /allow cookies/);
    h.document.getElementById('regName').value = 'Member';
    h.document.getElementById('regUid').value = 'member';
    h.document.getElementById('regPass').value = 'short';
    h.window.doRegister();
    assert.match(h.document.getElementById('msgBox').textContent, /8 characters/);
});

test('signup reports failed automatic login; failed logout leaves profile visible', async () => {
    const h = loginHarness((url, options) => {
        if (url.endsWith('/api/user')) return [200, user()];
        if (options.method === 'DELETE') return [500, {}];
        if (options.method === 'POST') return [401, { message: 'Please sign in again.' }];
        return [200, user()];
    });
    await settle();
    h.window.doLogout();
    await settle();
    assert.equal(h.document.getElementById('profileCard').style.display, 'block');
    assert.match(h.document.getElementById('logoutMessage').textContent, /failed/);
    h.document.getElementById('regName').value = 'Member';
    h.document.getElementById('regUid').value = 'member';
    h.document.getElementById('regPass').value = 'test-only-password';
    h.window.doRegister();
    await settle();
    assert.equal(h.document.getElementById('msgBox').textContent, 'Please sign in again.');
});

export { documentFor, execute, settle };
