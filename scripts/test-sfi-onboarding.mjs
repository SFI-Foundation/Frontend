import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const page = readFileSync(new URL('../navigation/sfi-profile.html', import.meta.url), 'utf8');
const source = readFileSync(new URL('../assets/js/sfi/onboarding.js', import.meta.url), 'utf8');
const settle = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };

function harness(initial = {}, query = '') {
    const dom = new JSDOM(page, { url: `https://sfi.test/sfi-profile/${query}`, runScripts: 'outside-only' });
    const { window } = dom;
    const document = window.document;
    document.getElementById('recommendedLinks').dataset.base = '/';
    let stored = structuredClone(initial), fail = null, confirm = true;
    const writes = [];
    window.confirm = () => confirm;
    window.request = async (path, options) => {
        assert.equal(path, '/preferences');
        assert.equal(options.method, 'PATCH');
        assert.equal(options.headers['Content-Type'], 'application/json');
        if (fail) throw fail;
        const body = JSON.parse(options.body);
        writes.push(body);
        stored = { ...stored, ...body };
        return { preferences: structuredClone(stored) };
    };
    vm.runInContext(source.replace('export function', 'function') + '\nwindow.controller = createOnboarding(window.request);', dom.getInternalVMContext());
    window.controller.render({ preferences: stored }, 'all');
    const el = id => document.getElementById(id);
    const check = (name, value) => {
        const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
        input.checked = true;
        input.dispatchEvent(new window.Event('change', { bubbles: true }));
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
    };
    const submit = () => el('preferencesForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    return { window, document, el, check, submit, writes, stored: () => stored,
        failure: value => { fail = value; }, confirm: value => { confirm = value; } };
}

test('onboarding supports empty, partial, full, reload and later edits', async () => {
    const h = harness({}, '?onboarding=1');
    assert.equal(h.el('onboardingQuiz').open, true);
    assert.equal(h.document.activeElement.id, 'preferencesHeading');
    h.submit();
    await settle();
    assert.deepEqual(h.writes[0], {});
    for (const name of ['involvement', 'visit_reasons', 'disciplines', 'resources', 'update_interests']) {
        const first = h.document.querySelector(`input[name="${name}"]`);
        h.check(name, first.value);
    }
    h.check('primary_goal', 'technical_resources');
    h.el('pref-organization_name').value = 'Synthetic Racing';
    h.el('pref-organization_website').value = 'https://example.org';
    h.el('pref-job_title').value = 'Engineer';
    h.el('pref-additional_notes').value = '<img src=x onerror=alert(1)>';
    h.submit();
    assert.equal(h.el('preferencesSave').disabled, true);
    await settle();
    assert.equal(h.writes[1].involvement[0], 'manufacturer');
    assert.equal(h.writes[1].organization_name, 'Synthetic Racing');
    assert.match(h.el('preferencesStatus').textContent, /saved/);
    const reload = harness(h.stored());
    assert.equal(reload.el('pref-additional_notes').value, '<img src=x onerror=alert(1)>');
    assert.equal(reload.document.querySelectorAll('img').length, 0);
    assert.equal(reload.document.querySelector('input[value="manufacturer"]').checked, true);
    reload.el('pref-job_title').value = 'Inspector';
    reload.submit();
    await settle();
    assert.deepEqual(reload.writes[0], { job_title: 'Inspector' });
    assert.equal(reload.stored().organization_name, 'Synthetic Racing');
});

test('skip does not write, asks before discarding, and unsaved changes protect navigation', () => {
    const h = harness({ involvement: ['driver'] }, '?onboarding=1');
    h.el('preferencesSkip').click();
    assert.equal(h.writes.length, 0);
    assert.equal(h.el('onboardingQuiz').open, false);
    h.el('onboardingQuiz').open = true;
    h.el('pref-job_title').value = 'Unsaved';
    const event = new h.window.Event('beforeunload', { cancelable: true });
    h.window.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
    h.confirm(false);
    h.el('preferencesSkip').click();
    assert.equal(h.el('pref-job_title').value, 'Unsaved');
    h.confirm(true);
    h.el('preferencesSkip').click();
    assert.equal(h.el('pref-job_title').value, '');
    assert.equal(h.writes.length, 0);
    assert.equal(h.document.activeElement, h.el('onboardingQuiz').querySelector('summary'));
});

test('exclusive answers, save failure, accessible field errors, and retry retain edits', async () => {
    const h = harness();
    h.check('involvement', 'driver');
    h.check('involvement', 'prefer_not_to_answer');
    assert.equal(h.document.querySelector('input[value="driver"]').checked, false);
    h.check('involvement', 'manufacturer');
    assert.equal(h.document.querySelector('input[value="prefer_not_to_answer"]').checked, false);
    h.check('disciplines', 'road_racing');
    h.check('disciplines', 'not_applicable');
    assert.equal(h.document.querySelector('input[value="road_racing"]').checked, false);
    const error = new Error('Check your organization.');
    error.fields = { organization_name: 'Use at most 200 characters.' };
    h.failure(error);
    h.el('pref-organization_name').value = 'Keep this edit';
    h.submit();
    await settle();
    assert.equal(h.el('pref-organization_name').value, 'Keep this edit');
    assert.equal(h.el('pref-organization_name').getAttribute('aria-invalid'), 'true');
    assert.match(h.el('error-organization_name').textContent, /200/);
    assert.equal(h.document.activeElement.id, 'preferencesStatus');
    assert.equal(h.el('preferencesSave').disabled, false);
    h.failure(null);
    h.submit();
    await settle();
    assert.equal(h.el('pref-organization_name').hasAttribute('aria-invalid'), false);
    assert.equal(h.stored().organization_name, 'Keep this edit');
});

test('other profile saves preserve edits and recommendations use real public routes only', () => {
    for (const involvement of ['manufacturer', 'driver', 'sanctioning_body', 'technical_inspector', 'enthusiast', 'sfi_staff']) {
        const h = harness({ involvement: [involvement] });
        h.el('pref-job_title').value = 'Unsaved';
        h.window.controller.render({ preferences: {} }, 'name');
        h.window.controller.render({ preferences: {} }, 'quiz');
        assert.equal(h.el('pref-job_title').value, 'Unsaved');
        const links = [...h.el('recommendedLinks').querySelectorAll('a')];
        assert.equal(links.length, 3);
        for (const link of links) assert.match(link.pathname, /^\/(sfi-specs|specs|services|about|news-events)\/$/);
        assert.equal(h.el('roleManagement').hidden, true);
    }
    assert.equal(/value="(?:Admin|administrator)"/.test(page.split('<details id="roleManagement"')[0]), false);
    assert.match(page, /do not subscribe you to email/);
});

test('complete profile integration reveals onboarding before focus and handles an expired session', async () => {
    const dom = new JSDOM(page, { url: 'https://sfi.test/sfi-profile/?onboarding=1', runScripts: 'outside-only' });
    const { window } = dom;
    let expired = false;
    window.pythonURI = 'https://api.sfi.test';
    window.fetch = async (url, options) => {
        assert.equal(options.credentials, 'include');
        assert.equal(options.cache, 'no-store');
        return { ok: !expired, status: expired ? 401 : 200, json: async () => ({
            name: 'Synthetic Racer', uid: 'synthetic', role: 'User', can_manage_roles: false,
            preferences: {}, interests: { causes: [], participation: [], skills: '', volunteering: null, availability: '' },
        }) };
    };
    const profileSource = readFileSync(new URL('../assets/js/sfi/profile.js', import.meta.url), 'utf8');
    vm.runInContext(source.replace('export function', 'function') + '\n' + profileSource.replace(/^import .*;\s*$/gm, ''), dom.getInternalVMContext());
    await settle();
    const el = id => window.document.getElementById(id);
    assert.equal(el('profileContent').hidden, false);
    assert.equal(window.document.activeElement.id, 'preferencesHeading');
    el('pref-additional_notes').value = 'Keep this unsaved note';
    expired = true;
    el('preferencesForm').dispatchEvent(new window.Event('submit', { cancelable: true }));
    await settle();
    assert.equal(el('profileContent').hidden, true);
    assert.equal(el('profileSignIn').hidden, false);
    assert.match(el('profileStatus').textContent, /sign in/);
    assert.equal(el('pref-additional_notes').value, 'Keep this unsaved note');
});
