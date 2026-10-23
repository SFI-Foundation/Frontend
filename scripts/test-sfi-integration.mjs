// Runs real rendered client JavaScript against Flask + a disposable SQLite DB.
// Uses HTTP over a Unix socket if allowed, otherwise real WSGI over pipes.
// The fallback is explicitly reported and does not claim live-server verification.
// Usage: node scripts/test-sfi-integration.mjs <python> <backend-review-dir> <built-site>
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import http from 'node:http';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { documentFor, execute, settle } from './test-sfi-profile.mjs';

const [python, backend, site] = process.argv.slice(2);
assert.ok(python && backend && site, 'Supply Python executable, backend directory and built-site directory');

test('rendered SFI login/profile/quiz/role UI → real Flask authentication → persistent SQLite', { timeout: 120000 }, async () => {
    const bridge = spawn(python, [`${backend}/testing/test_sfi_profile.py`, '--bridge'], { stdio: ['pipe', 'pipe', 'pipe'] });
    // Never echo generated test credentials, JWTs or response bodies to logs.
    let stderr = '';
    bridge.stderr.on('data', data => { stderr += data; });
    const pending = new Map();
    let fixtureResolve, fixtureReject;
    const fixturePromise = new Promise((resolve, reject) => { fixtureResolve = resolve; fixtureReject = reject; });
    const startupTimer = setTimeout(() => fixtureReject(new Error('Isolated Flask startup timed out')), 30000);
    bridge.on('error', fixtureReject);
    bridge.on('exit', code => {
        clearTimeout(startupTimer);
        const error = new Error(`Isolated Flask process exited (${code}): ${stderr.slice(-1800)}`);
        fixtureReject(error);
        for (const task of pending.values()) task.reject(error);
    });
    const lines = createInterface({ input: bridge.stdout });
    lines.on('line', line => {
        const data = JSON.parse(line);
        if (data.fixture) { clearTimeout(startupTimer); fixtureResolve(data.fixture); }
        else {
            const task = pending.get(data.id);
            pending.delete(data.id);
            if (data.failure) task.reject(new Error(data.failure));
            else task.resolve(data);
        }
    });
    let sequence = 0;
    let socketPath;
    const cookies = new Map();
    function call(data) {
        const id = ++sequence;
        return new Promise((resolve, reject) => {
            pending.set(id, { resolve, reject });
            bridge.stdin.write(JSON.stringify({ id, ...data }) + '\n');
        });
    }
    async function fetch(url, options = {}) {
        assert.equal(options.credentials, 'include');
        if (!socketPath) {
            const response = await call({ path: new URL(url).pathname, method: options.method || 'GET', body: options.body,
                                         headers: { Origin: 'http://localhost:4000', ...options.headers } });
            assert.equal(response.headers['Access-Control-Allow-Origin'], 'http://localhost:4000');
            assert.equal(response.headers['Access-Control-Allow-Credentials'], 'true');
            return { ...response, json: async () => response.data };
        }
        return new Promise((resolve, reject) => {
            const request = http.request({
                socketPath, path: new URL(url).pathname, method: options.method || 'GET',
                headers: { Origin: 'http://localhost:4000', Cookie: Array.from(cookies, ([name, value]) => `${name}=${value}`).join('; '), ...options.headers },
            }, response => {
                for (const cookie of response.headers['set-cookie'] || []) {
                    const [pair] = cookie.split(';');
                    const index = pair.indexOf('=');
                    if (/max-age=0/i.test(cookie)) cookies.delete(pair.slice(0, index));
                    else cookies.set(pair.slice(0, index), pair.slice(index + 1));
                }
                let body = '';
                response.on('data', chunk => { body += chunk; });
                response.on('end', () => {
                    try {
                        assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:4000');
                        assert.equal(response.headers['access-control-allow-credentials'], 'true');
                        resolve({ ok: response.statusCode >= 200 && response.statusCode < 300,
                                  status: response.statusCode, json: async () => JSON.parse(body) });
                    } catch (error) { reject(error); }
                });
            });
            request.on('error', reject);
            request.end(options.body);
        });
    }
    async function until(condition, message) {
        for (let count = 0; count < 500; count++) {
            if (condition()) return;
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        throw new Error(message);
    }
    function profile() {
        const document = documentFor(readFileSync(`${site}/sfi-profile/index.html`, 'utf8'));
        execute(readFileSync(`${site}/assets/js/sfi/profile.js`, 'utf8'), document, fetch);
        return { document, el: id => document.getElementById(id) };
    }
    try {
        const fixture = await fixturePromise;
        socketPath = fixture.socket;
        console.log(socketPath ? 'Integration transport: live HTTP over Unix socket' : 'Integration transport: actual Flask WSGI over pipes; socket binding prohibited');
        const loginHTML = readFileSync(`${site}/login/index.html`, 'utf8');
        const loginDocument = documentFor(loginHTML);
        const source = Array.from(loginHTML.matchAll(/<script type="module">([\s\S]*?)<\/script>/g), m => m[1]).find(text => text.includes('window.doLogin'));
        assert.ok(source, 'Rendered SFI login script must exist');
        const login = execute(source, loginDocument, fetch);
        await until(() => loginDocument.getElementById('authForm').style.display === 'block', 'Login screen not displayed');
        loginDocument.getElementById('loginUid').value = fixture.uid;
        loginDocument.getElementById('loginPass').value = fixture.password;
        login.window.doLogin();
        await until(() => loginDocument.getElementById('profileCard').style.display === 'block', 'Real login failed');
        let current = profile();
        await until(() => current.el('sfiProfileUid').textContent === fixture.uid, 'Profile did not retrieve authenticated identity');
        assert.equal(current.el('sfiProfileRole').textContent, 'Member');
        assert.equal(current.el('roleManagement').hidden, true);
        current.el('profileNameInput').value = 'Updated Integration Member';
        current.el('profileNameForm').events.submit({ preventDefault() {} });
        await until(() => current.el('sfiProfileName').textContent === 'Updated Integration Member', 'Display name did not save');
        current.document.inputs.find(input => input.value === 'Motorsports safety').checked = true;
        current.document.inputs.find(input => input.value === 'Volunteer').checked = true;
        current.el('interestSkills').value = 'Integration test mentoring';
        current.el('interestVolunteering').value = 'yes';
        current.el('interestAvailability').value = 'Monthly';
        current.el('interestForm').events.submit({ preventDefault() {} });
        await until(() => current.el('interestStatus').textContent.includes('saved'), 'Quiz did not save');
        await call({ reconnect: true });
        current = profile();
        await until(() => current.el('sfiProfileSkills').textContent === 'Integration test mentoring', 'Quiz did not survive a fresh database connection');
        assert.equal(current.el('sfiProfileName').textContent, 'Updated Integration Member');
        assert.equal(current.el('interestAvailability').value, 'Monthly');
        current.el('interestSkills').value = 'Updated mentoring';
        current.el('interestForm').events.submit({ preventDefault() {} });
        await until(() => current.el('sfiProfileSkills').textContent === 'Updated mentoring', 'Quiz update failed');
        assert.equal((await fetch('http://localhost:8423/api/sfi/profile/roles/1', { credentials: 'include', method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'Admin' }) })).status, 403);
        login.window.doLogout();
        await until(() => loginDocument.getElementById('authForm').style.display === 'block', 'Logout failed');
        assert.equal((await fetch('http://localhost:8423/api/sfi/profile', { credentials: 'include' })).status, 401);
        loginDocument.getElementById('loginUid').value = fixture.admin_uid;
        loginDocument.getElementById('loginPass').value = fixture.password;
        login.window.doLogin();
        await until(() => loginDocument.getElementById('profileUid').textContent === '@' + fixture.admin_uid, 'Admin login failed');
        current = profile();
        await until(() => current.el('sfiProfileUid').textContent === fixture.admin_uid, 'Admin profile failed');
        assert.equal(current.el('roleManagement').hidden, false);
        current.el('rolesLoad').events.click();
        await until(() => current.el('roleUser').children.length > 0, 'Admin user list failed');
        current.el('roleValue').value = 'Volunteer';
        current.el('roleForm').events.submit({ preventDefault() {} });
        await until(() => current.el('roleStatus').textContent.includes('Role saved'), 'Admin role assignment failed');
        const result = await (await fetch('http://localhost:8423/api/sfi/profile/roles', { credentials: 'include' })).json();
        assert.equal(result.users.find(user => user.uid === fixture.uid).role, 'Volunteer');
        await settle();
        assert.equal(pending.size, 0);
    } finally {
        clearTimeout(startupTimer);
        bridge.stdin.end();
        lines.close();
        bridge.kill();
    }
});
