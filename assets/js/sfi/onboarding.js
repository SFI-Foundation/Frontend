// Optional profile classification and resource suggestions. Never permissions.
export function createOnboarding(request) {
    const el = id => document.getElementById(id);
    const form = el('preferencesForm');
    const details = el('onboardingQuiz');
    const fields = [...form.elements].filter(input => input.name);
    const multi = ['involvement', 'visit_reasons', 'disciplines', 'resources', 'update_interests'];
    const text = ['organization_name', 'organization_website', 'job_title', 'additional_notes'];
    let baseline = '';
    let saving = false;
    let initialized = false;
    let saved = {};

    function answers() {
        const result = {};
        multi.forEach(key => { result[key] = fields.filter(input => input.name === key && input.checked).map(input => input.value); });
        text.forEach(key => { result[key] = el(`pref-${key}`).value; });
        result.primary_goal = fields.find(input => input.name === 'primary_goal' && input.checked)?.value || null;
        return result;
    }
    const dirty = () => initialized && JSON.stringify(answers()) !== baseline;

    function fill(preferences) {
        saved = preferences;
        fields.forEach(input => {
            if (multi.includes(input.name)) input.checked = (preferences[input.name] || []).includes(input.value);
            else if (input.name === 'primary_goal') input.checked = (preferences.primary_goal || '') === input.value;
            else input.value = preferences[input.name] || '';
        });
        baseline = JSON.stringify(answers());
        initialized = true;
    }

    function recommend(preferences) {
        // Only real public routes; no manufacturer prototype or private dashboard.
        const links = {
            search: ['sfi-specs/', 'Search SFI specifications'],
            documents: ['sfi-specs/#search', 'Find specification documents'],
            services: ['services/', 'SFI programs and services'],
            about: ['about/', 'About SFI Foundation'],
            news: ['news-events/', 'SFI news and events'],
        };
        const order = [];
        const add = (...keys) => keys.forEach(key => { if (!order.includes(key)) order.push(key); });
        const goal = preferences.primary_goal;
        if (goal === 'about_sfi' || goal === 'exploring') add('about');
        if (goal === 'technical_resources') add('documents');
        if (goal === 'certification_requirements' || goal === 'manufacturer_information') add('services');
        if (goal === 'find_specification' || goal === 'research_equipment') add('search');
        if (preferences.resources?.includes('specification_documents')) add('documents');
        if (preferences.resources?.some(key => ['safety_news', 'events', 'technical_updates'].includes(key))) add('news');
        const involvement = preferences.involvement || [];
        if (involvement.includes('manufacturer')) add('services', 'search');
        if (involvement.includes('technical_inspector')) add('documents', 'search', 'services');
        if (involvement.includes('sanctioning_body')) add('documents', 'services', 'search');
        if (involvement.some(key => ['driver', 'race_team'].includes(key))) add('search', 'documents', 'services');
        if (involvement.includes('enthusiast')) add('about', 'search');
        add('search', 'about', 'services');
        const list = el('recommendedLinks');
        list.replaceChildren();
        order.slice(0, 3).forEach(key => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `${list.dataset.base}${links[key][0]}`;
            link.textContent = links[key][1];
            li.appendChild(link);
            list.appendChild(li);
        });
    }

    function clearErrors() {
        form.querySelectorAll('.sfi-pref-error').forEach(node => { node.textContent = ''; });
        fields.forEach(input => input.removeAttribute('aria-invalid'));
    }

    form.addEventListener('change', event => {
        const input = event.target;
        // Exclusive answers are explicit, optional choices, not a required step.
        const exclusive = { involvement: 'prefer_not_to_answer', disciplines: 'not_applicable' }[input.name];
        if (exclusive && input.checked) {
            fields.filter(other => other.name === input.name && other !== input &&
                (input.value === exclusive || other.value === exclusive)).forEach(other => { other.checked = false; });
        }
    });
    form.addEventListener('input', () => {
        if (!saving) el('preferencesStatus').textContent = dirty() ? 'You have unsaved preferences.' : '';
    });
    window.addEventListener('beforeunload', event => {
        if (dirty() || saving) { event.preventDefault(); event.returnValue = ''; }
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (saving || !initialized) return;
        clearErrors();
        if (!form.reportValidity()) return;
        // Send only changed fields so simultaneous edits to other fields survive.
        const current = answers();
        const original = JSON.parse(baseline);
        const changes = Object.fromEntries(Object.entries(current).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(original[key])));
        saving = true;
        fields.forEach(input => { input.disabled = true; });
        el('preferencesSave').disabled = el('preferencesSkip').disabled = true;
        form.setAttribute('aria-busy', 'true');
        el('preferencesStatus').textContent = 'Saving preferences…';
        try {
            const profile = await request('/preferences', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes),
            });
            fill(profile.preferences);
            recommend(profile.preferences);
            el('preferencesStatus').textContent = 'Your preferences have been saved. You can edit them anytime.';
        } catch (error) {
            el('preferencesStatus').textContent = error.message || 'Could not connect. Your changes have not been saved.';
            for (const [key, message] of Object.entries(error.fields || {})) {
                const node = el(`error-${key}`);
                if (node) node.textContent = message;
                fields.filter(input => input.name === key).forEach(input => input.setAttribute('aria-invalid', 'true'));
            }
        } finally {
            saving = false;
            fields.forEach(input => { input.disabled = false; });
            el('preferencesSave').disabled = el('preferencesSkip').disabled = false;
            form.removeAttribute('aria-busy');
            el('preferencesStatus').focus();
        }
    });
    el('preferencesSkip').addEventListener('click', () => {
        if (saving) return;
        if (dirty() && !window.confirm(window.SFII18n?.t('Discard unsaved preferences? Your saved answers will be kept.') || 'Discard unsaved preferences? Your saved answers will be kept.')) return;
        fill(saved);
        clearErrors();
        el('preferencesStatus').textContent = '';
        details.open = false;
        details.querySelector('summary').focus();
    });

    return {
        render(profile, scope) {
            if (scope !== 'all') return;
            fill(profile.preferences || {});
            recommend(profile.preferences || {});
            if (new URLSearchParams(window.location.search).get('onboarding') === '1') {
                details.open = true;
                el('preferencesHeading').focus();
            }
        },
    };
}
