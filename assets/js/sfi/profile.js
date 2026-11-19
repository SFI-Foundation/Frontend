import { pythonURI } from '../api/config.js';
import { createOnboarding } from './onboarding.js';

const element = id => document.getElementById(id);
const emptyInterests = () => ({ causes: [], participation: [], skills: '', volunteering: null, availability: '' });
let busy = false;
let editingName = false;
let renderedUid = null, renderedName = '';
const onboarding = createOnboarding(request);

function hideProfile(guest = true) {
    renderedUid = null; renderedName = '';
    element('profileContent').hidden = true;
    element('profileSignIn').hidden = !guest;
    for (const id of ['sfiProfileName', 'sfiProfileUid', 'sfiProfileRole']) element(id).textContent = '';
    element('profileNameInput').value = '';
    element('roleManagement').hidden = true;
    element('profileStatus').textContent = guest ? 'Please sign in to continue.' : 'Loading your profile…';
}

// Profile content and the header consume the same verified session. In
// particular, a background 401 must not leave a stale Admin profile visible.
window.addEventListener?.('sfi-session', event => {
    const { state, user } = event.detail;
    if (state === 'guest') { hideProfile(); return; }
    if (!user) { hideProfile(false); return; }
    if (!renderedUid || user.uid !== renderedUid) { render(user); return; }
    if (!editingName && element('profileNameInput').value === renderedName) element('profileNameInput').value = user.name;
    renderedName = user.name;
    element('sfiProfileName').textContent = user.name;
    element('sfiProfileUid').textContent = user.uid;
    element('sfiProfileRole').textContent = user.role_label || user.role;
    element('roleManagement').hidden = !user.can_manage_roles;
});

async function request(path, options = {}) {
    const epoch = window.SFIAuth?.snapshot().epoch;
    const response = await fetch(`${pythonURI}/api/sfi/profile${path}`, {
        credentials: 'include', cache: 'no-store', ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (window.SFIAuth && epoch !== window.SFIAuth.snapshot().epoch) {
        if (window.SFIAuth.snapshot().state === 'guest') {
            element('profileContent').hidden = true;
            element('profileSignIn').hidden = false;
        }
        throw new Error('Please sign in to continue.');
    }
    if (!response.ok) {
        if (response.status === 401) {
            hideProfile();
            if (window.SFIAuth) window.SFIAuth.clear();
            else window.dispatchEvent(new CustomEvent('sfi-auth', { detail: null }));
        }
        const error = new Error(response.status === 401 ? 'Please sign in to continue.' : data.message || 'Your profile could not be updated. Please try again.');
        error.fields = data.errors || {};
        throw error;
    }
    return data;
}

function render(profile, form = 'all') {
    renderedUid = profile.uid; renderedName = profile.name;
    const interests = profile.interests;
    const values = {
        sfiProfileName: profile.name, sfiProfileUid: profile.uid, sfiProfileRole: profile.role_label || profile.role,
        sfiProfileCauses: interests.causes.join(', ') || 'Not answered',
        sfiProfileParticipation: interests.participation.join(', ') || 'Not answered',
        sfiProfileSkills: interests.skills || 'Not answered',
        sfiProfileVolunteering: interests.volunteering === null ? 'Not answered' : interests.volunteering ? 'Yes' : 'No',
        sfiProfileAvailability: interests.availability || 'Not answered',
    };
    Object.entries(values).forEach(([id, value]) => { element(id).textContent = value; });
    if (form !== 'name') {
        ['causes', 'participation'].forEach(name => {
            document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
                input.checked = interests[name].includes(input.value);
            });
        });
        element('interestSkills').value = interests.skills;
        element('interestVolunteering').value = interests.volunteering === null ? '' : interests.volunteering ? 'yes' : 'no';
        element('interestAvailability').value = interests.availability;
    }
    if (form !== 'quiz') element('profileNameInput').value = profile.name;
    element('roleManagement').hidden = !profile.can_manage_roles;
    element('profileContent').hidden = false;
    element('profileSignIn').hidden = true;
    element('profileStatus').textContent = '';
    onboarding.render(profile, form);
    if (!window.SFIAuth || form !== 'all') window.dispatchEvent(new CustomEvent('sfi-auth', { detail: profile }));
    if (form !== 'all') window.SFIAuth?.notifyChange();
}

async function load() {
    element('profileRetry').hidden = true;
    try {
        const profile = window.SFIAuth ? await window.SFIAuth.refresh() : await request('');
        if (profile) render(profile);
        else hideProfile();
    }
    catch (error) {
        element('profileStatus').textContent = error.message || 'Could not connect to server.';
        element('profileRetry').hidden = false;
    }
}

async function save(answers, cleared = false) {
    if (busy || editingName) return;
    busy = true;
    element('interestSave').disabled = element('interestClear').disabled = true;
    element('profileNameSave').disabled = true;
    // Keep the form stable while saving, so a response cannot overwrite newer edits.
    const fields = document.querySelectorAll('#interestForm input, #interestForm textarea, #interestForm select');
    fields.forEach(field => { field.disabled = true; });
    element('interestStatus').textContent = 'Saving…';
    try {
        render(await request('/interests', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(answers),
        }), 'quiz');
        element('interestStatus').textContent = cleared ? 'Your saved answers have been cleared.' : 'Your answers have been saved.';
    } catch (error) {
        element('interestStatus').textContent = error.message || 'Could not connect to server. Your changes have not been saved.';
    } finally {
        busy = false;
        fields.forEach(field => { field.disabled = false; });
        element('interestSave').disabled = element('interestClear').disabled = false;
        element('profileNameSave').disabled = false;
    }
}

element('interestForm').addEventListener('submit', event => {
    event.preventDefault();
    const selected = name => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`), input => input.value);
    const volunteering = element('interestVolunteering').value;
    save({
        causes: selected('causes'), participation: selected('participation'),
        skills: element('interestSkills').value,
        volunteering: volunteering === '' ? null : volunteering === 'yes',
        availability: element('interestAvailability').value,
    });
});
element('interestClear').addEventListener('click', () => save(emptyInterests(), true));
element('profileRetry').addEventListener('click', load);

element('profileNameForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || editingName) return;
    editingName = true;
    element('profileNameSave').disabled = element('profileNameInput').disabled = true;
    element('interestSave').disabled = element('interestClear').disabled = true;
    try {
        render(await request('', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: element('profileNameInput').value.trim() }),
        }), 'name');
        element('profileNameStatus').textContent = 'Your name has been saved.';
    } catch (error) { element('profileNameStatus').textContent = error.message; }
    finally {
        editingName = false;
        element('profileNameSave').disabled = element('profileNameInput').disabled = false;
        element('interestSave').disabled = element('interestClear').disabled = false;
    }
});

let roleUsers = [];
element('rolesLoad').addEventListener('click', async () => {
    element('rolesLoad').disabled = true;
    try {
        const data = await request('/roles');
        roleUsers = data.users.filter(user => user.id !== data.current_user_id);
        for (const [id, values] of [['roleUser', roleUsers.map(user => [String(user.id), `${user.name} (@${user.uid})`])],
                                    ['roleValue', data.roles.map(role => [role, role === 'User' ? 'User (legacy Member)' : role])]]) {
            const select = element(id);
            select.replaceChildren();
            values.forEach(([value, text]) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = text;
                select.appendChild(option);
            });
        }
        element('roleForm').hidden = roleUsers.length === 0;
        element('roleStatus').textContent = roleUsers.length ? '' : 'No other users to manage.';
        element('roleValue').value = roleUsers[0]?.role || 'Member';
    } catch (error) { element('roleStatus').textContent = error.message; }
    finally { element('rolesLoad').disabled = false; }
});
element('roleUser').addEventListener('change', () => {
    element('roleValue').value = roleUsers.find(user => String(user.id) === element('roleUser').value)?.role || 'Member';
});
element('roleForm').addEventListener('submit', async event => {
    event.preventDefault();
    element('roleSave').disabled = true;
    try {
        const result = await request(`/roles/${element('roleUser').value}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: element('roleValue').value }),
        });
        const user = roleUsers.find(user => user.id === result.id);
        if (user) user.role = result.role;
        element('roleStatus').textContent = `Role saved for @${result.uid}.`;
    } catch (error) { element('roleStatus').textContent = error.message; }
    finally { element('roleSave').disabled = false; }
});
load();
