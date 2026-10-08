---
layout: sfi
title: Admin Portal
description: Manage users, permission groups, and gear submissions.
permalink: /admin/
search_exclude: true
---

<div class="adm-wrap">
  <div class="adm-head">
    <div class="adm-eyebrow">SFI Foundation</div>
    <h1>Admin <span>Portal</span></h1>
    <p>Manage users, permission groups, and moderate gear submitted by members. Administrators see the centralized gear database and can approve or reject records from lower groups.</p>
  </div>

  <div id="admGate" class="adm-gate adm-hidden">
    <h2>Administrators only</h2>
    <p id="admGateMsg">Sign in with an account that belongs to the <code>administrators</code> group to continue.</p>
    <a href="/login/" class="adm-btn primary">Sign In</a>
  </div>

  <div id="admMain" class="adm-hidden">
    <dl class="adm-summary" aria-label="Dashboard summary" aria-live="polite">
      <div class="adm-stat"><dt>Total users</dt><dd id="statUsers">—</dd></div>
      <div class="adm-stat"><dt>Total groups</dt><dd id="statGroups">—</dd></div>
      <div class="adm-stat"><dt>Pending gear reviews</dt><dd id="statPending">—</dd></div>
    </dl>
    <div class="adm-tabs" role="tablist" aria-label="Admin dashboard sections">
      <button type="button" class="adm-tab active" id="tab-pending" role="tab" aria-controls="panel-pending" aria-selected="true" tabindex="0" data-panel="panel-pending">Pending Gear <span class="count" id="cntPending">0</span></button>
      <button type="button" class="adm-tab" id="tab-gear" role="tab" aria-controls="panel-gear" aria-selected="false" tabindex="-1" data-panel="panel-gear">All Gear <span class="count" id="cntGear">0</span></button>
      <button type="button" class="adm-tab" id="tab-users" role="tab" aria-controls="panel-users" aria-selected="false" tabindex="-1" data-panel="panel-users">Users <span class="count" id="cntUsers">0</span></button>
      <button type="button" class="adm-tab" id="tab-groups" role="tab" aria-controls="panel-groups" aria-selected="false" tabindex="-1" data-panel="panel-groups">Groups <span class="count" id="cntGroups">0</span></button>
    </div>

    <!-- ── Pending Gear ───────────────────────────── -->
    <section role="tabpanel" aria-labelledby="tab-pending" id="panel-pending" class="adm-panel active">
      <div class="adm-card">
        <h3>Awaiting Review</h3>
        <div id="pendingBody" class="adm-loading">Loading pending submissions…</div>
      </div>
    </section>

    <!-- ── All Gear ────────────────────────────────── -->
    <section role="tabpanel" aria-labelledby="tab-gear" id="panel-gear" class="adm-panel">
      <div class="adm-card">
        <h3>Centralized Gear Database</h3>
        <div id="gearBody" class="adm-loading">Loading gear…</div>
      </div>
    </section>

    <!-- ── Users ───────────────────────────────────── -->
    <section role="tabpanel" aria-labelledby="tab-users" id="panel-users" class="adm-panel">
      <div class="adm-card">
        <h3>Users</h3>
        <div id="usersBody" class="adm-loading">Loading users…</div>
      </div>
    </section>

    <!-- ── Groups ─────────────────────────────────── -->
    <section role="tabpanel" aria-labelledby="tab-groups" id="panel-groups" class="adm-panel">
      <div class="adm-card">
        <h3>Create a new group</h3>
        <div class="adm-row adm-form-fields">
          <input class="adm-input" id="newGroupName" aria-label="Group name" placeholder="Group name (e.g. inspectors)">
          <input class="adm-input" id="newGroupDesc" aria-label="Group description" placeholder="Description (optional)">
        </div>
        <div class="adm-row adm-permissions">
          <label class="adm-row adm-permission-label"><input type="checkbox" id="newPermApprove"> Approve gear</label>
          <label class="adm-row adm-permission-label"><input type="checkbox" id="newPermView"> View all gear</label>
          <label class="adm-row adm-permission-label"><input type="checkbox" id="newPermGroups"> Manage groups</label>
          <label class="adm-row adm-permission-label"><input type="checkbox" id="newPermUsers"> Manage users</label>
          <button class="adm-btn primary" id="createGroupBtn">Create Group</button>
          <span class="adm-msg" id="newGroupMsg"></span>
        </div>
      </div>
      <div id="groupsBody" class="adm-loading">Loading groups…</div>
    </section>
  </div>
</div>

<script>
(function () {
  const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:8423'
    : 'https://greppers-be.opencodingsociety.com';

  const gate = document.getElementById('admGate');
  const gateMsg = document.getElementById('admGateMsg');
  const main = document.getElementById('admMain');

  const state = { me: null, users: [], groups: [], pending: [], allGear: [] };

  async function api(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = new Error('HTTP ' + res.status);
      err.status = res.status;
      err.body = await res.text().catch(() => '');
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  // ── Boot ────────────────────────────────────────────
  async function boot() {
    try {
      state.me = await api('/api/sfi/me');
    } catch (err) {
      showGate(err.status === 401 || err.status === 403
        ? 'You must be signed in to access the admin portal.'
        : 'Unable to reach the admin API. Is the backend running?');
      return;
    }
    if (!state.me.isAdmin) {
      showGate('Your account is not in the administrators group. Ask an existing administrator to add you.');
      return;
    }
    main.classList.remove('adm-hidden');
    wireTabs();
    await Promise.all([loadPending(), loadAllGear(), loadUsers(), loadGroups()]);
  }

  function showGate(message) {
    gate.classList.remove('adm-hidden');
    if (message) gateMsg.textContent = message;
  }

  function wireTabs() {
    const tabs = Array.from(document.querySelectorAll('.adm-tab'));
    function activate(btn) {
      tabs.forEach(t => {
        const selected = t === btn;
        t.classList.toggle('active', selected);
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      document.querySelectorAll('.adm-panel').forEach(p => p.classList.toggle('active', p.id === btn.dataset.panel));
    }
    tabs.forEach((btn, index) => {
      btn.addEventListener('click', () => activate(btn));
      btn.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
    document.getElementById('createGroupBtn').addEventListener('click', createGroup);
  }

  function updateCount(section, count) {
    document.getElementById('cnt' + section).textContent = String(count);
    const stat = document.getElementById('stat' + section);
    if (stat) stat.textContent = String(count);
  }

  function showLoadError(section, bodyId) {
    updateCount(section, '—');
    const body = document.getElementById(bodyId);
    body.className = '';
    body.textContent = '';
    const message = makeEmpty('Unable to load this section. Check the backend connection and try again.');
    message.setAttribute('role', 'alert');
    body.appendChild(message);
  }

  function tableRegion(table, label) {
    const region = document.createElement('div');
    region.className = 'adm-table-scroll';
    region.tabIndex = 0;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', label + ' table. Scroll horizontally to see all columns.');
    region.appendChild(table);
    return region;
  }

  // ── Pending Gear ────────────────────────────────────
  async function loadPending() {
    try { state.pending = await api('/api/sfi/gear/pending'); }
    catch { showLoadError('Pending', 'pendingBody'); return; }
    renderPending();
  }

  function renderPending() {
    updateCount('Pending', state.pending.length);
    const body = document.getElementById('pendingBody');
    body.className = '';
    body.textContent = '';
    if (!state.pending.length) {
      body.appendChild(makeEmpty('No pending submissions. The queue is clear.'));
      return;
    }
    const table = makeGearTable(state.pending, true);
    body.appendChild(tableRegion(table, body.id === 'usersBody' ? 'Users' : 'Pending gear reviews'));
  }

  function makeGearTable(items, showActions) {
    const table = document.createElement('table');
    table.className = 'adm-table';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Owner', 'Item', 'SFI', 'Category', 'Source', 'Status', showActions ? 'Review' : 'Created']
      .forEach(h => { const th = document.createElement('th'); th.textContent = h; headRow.appendChild(th); });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    items.forEach(g => tbody.appendChild(makeGearRow(g, showActions)));
    table.appendChild(tbody);
    return table;
  }

  function makeGearRow(g, showActions) {
    const row = document.createElement('tr');
    const owner = g.owner ? (g.owner.name + ' · ' + g.owner.uid) : '—';
    [
      owner,
      g.name,
      'SFI ' + (g.spec || '—'),
      g.category || '—',
      g.source || 'manual',
    ].forEach(v => { const td = document.createElement('td'); td.textContent = v; row.appendChild(td); });

    const statusTd = document.createElement('td');
    const chip = document.createElement('span');
    chip.className = 'adm-chip ' + (g.status === 'approved' ? 'ok' : g.status === 'rejected' ? 'bad' : 'warn');
    chip.textContent = g.status;
    statusTd.appendChild(chip);
    row.appendChild(statusTd);

    const lastTd = document.createElement('td');
    if (showActions) {
      const approveBtn = document.createElement('button');
      approveBtn.className = 'adm-btn approve small';
      approveBtn.textContent = 'Approve';
      approveBtn.addEventListener('click', () => reviewGear(g.id, 'approved', ''));
      const rejectBtn = document.createElement('button');
      rejectBtn.className = 'adm-btn reject small';
            rejectBtn.textContent = 'Reject';
      rejectBtn.addEventListener('click', () => {
        const note = prompt('Reason for rejecting this submission? (optional)') || '';
        reviewGear(g.id, 'rejected', note);
      });
      lastTd.appendChild(approveBtn);
      lastTd.appendChild(rejectBtn);
    } else {
      lastTd.textContent = g.createdAt ? new Date(g.createdAt).toLocaleDateString() : '—';
    }
    row.appendChild(lastTd);
    return row;
  }

  async function reviewGear(id, status, note) {
    try {
      await api('/api/sfi/gear/' + id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      await Promise.all([loadPending(), loadAllGear()]);
    } catch (err) {
      alert('Review failed: ' + (err.body || err.message));
    }
  }

  // ── All Gear ────────────────────────────────────────
  async function loadAllGear() {
    try { state.allGear = await api('/api/sfi/gear/all'); }
    catch { showLoadError('Gear', 'gearBody'); return; }
    renderAllGear();
  }

  function renderAllGear() {
    updateCount('Gear', state.allGear.length);
    const body = document.getElementById('gearBody');
    body.className = '';
    body.textContent = '';
    if (!state.allGear.length) {
      body.appendChild(makeEmpty('No gear recorded yet.'));
      return;
    }
    body.appendChild(tableRegion(makeGearTable(state.allGear, false), 'All gear'));
  }

  // ── Users ───────────────────────────────────────────
  async function loadUsers() {
    try { state.users = await api('/api/sfi/users'); }
    catch { showLoadError('Users', 'usersBody'); return; }
    renderUsers();
  }

  function renderUsers() {
    updateCount('Users', state.users.length);
    const body = document.getElementById('usersBody');
    body.className = '';
    body.textContent = '';
    if (!state.users.length) {
      body.appendChild(makeEmpty('No users to display.'));
      return;
    }
    const table = document.createElement('table');
    table.className = 'adm-table';
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['User', 'Username', 'Role', 'Groups'].forEach(h => { const th = document.createElement('th'); th.textContent = h; hr.appendChild(th); });
    thead.appendChild(hr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    state.users.forEach(u => {
      const tr = document.createElement('tr');
      [u.name, u.uid, u.role].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.appendChild(td); });
      const gtd = document.createElement('td');
      const stack = document.createElement('div');
      stack.className = 'chip-stack';
      u.groups.forEach(gr => {
        const ch = document.createElement('span');
        ch.className = 'adm-chip' + (gr.name === 'administrators' ? ' admin' : '');
        ch.textContent = gr.name;
        stack.appendChild(ch);
      });
      gtd.appendChild(stack);
      tr.appendChild(gtd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    body.appendChild(tableRegion(table, body.id === 'usersBody' ? 'Users' : 'Pending gear reviews'));
  }

  // ── Groups ──────────────────────────────────────────
  async function loadGroups() {
    try { state.groups = await api('/api/sfi/groups'); }
    catch { showLoadError('Groups', 'groupsBody'); return; }
    const detailed = await Promise.all(
      state.groups.map(g => api('/api/sfi/groups/' + g.id).catch(() => g))
    );
    state.groups = detailed;
    renderGroups();
  }

  function renderGroups() {
    updateCount('Groups', state.groups.length);
    const body = document.getElementById('groupsBody');
    body.className = '';
    body.textContent = '';
    if (!state.groups.length) {
      body.appendChild(makeEmpty('No groups configured.'));
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'adm-group-grid';
    state.groups.forEach(g => grid.appendChild(renderGroupCard(g)));
    body.appendChild(grid);
  }

  function renderGroupCard(g) {
    const card = document.createElement('div');
    card.className = 'adm-group-card';

    const h = document.createElement('h4');
    h.textContent = g.name;
    card.appendChild(h);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = (g.description || '—') + ' · ' + (g.memberCount || (g.members ? g.members.length : 0)) + ' member(s)';
    card.appendChild(meta);

    const perms = document.createElement('div');
    perms.className = 'adm-perm-row';
    const entries = [
      ['approve', g.permissions && g.permissions.can_approve_gear],
      ['view all', g.permissions && g.permissions.can_view_all_gear],
      ['manage groups', g.permissions && g.permissions.can_manage_groups],
      ['manage users', g.permissions && g.permissions.can_manage_users],
    ];
    entries.forEach(([label, on]) => {
      const p = document.createElement('span');
      p.className = 'adm-perm' + (on ? ' on' : '');
      p.textContent = label;
      perms.appendChild(p);
    });
    card.appendChild(perms);

    const memList = document.createElement('div');
    memList.className = 'adm-members';
    (g.members || []).forEach(m => {
      const chip = document.createElement('span');
      chip.className = 'adm-member-chip';
      chip.textContent = m.name + ' (' + m.uid + ')';
      if (!(g.name === 'administrators' && m.uid === 'admin')) {
        const x = document.createElement('button');
        x.textContent = '×';
        x.title = 'Remove from group';
        x.addEventListener('click', () => removeMember(g.id, m.id));
        chip.appendChild(x);
      }
      memList.appendChild(chip);
    });
    card.appendChild(memList);

    const addRow = document.createElement('div');
    addRow.className = 'adm-row';
    const sel = document.createElement('select');
    sel.className = 'adm-input';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Add member…';
    sel.appendChild(placeholder);
    const existingIds = new Set((g.members || []).map(m => m.id));
    state.users.forEach(u => {
      if (existingIds.has(u.id)) return;
      const opt = document.createElement('option');
      opt.value = String(u.id);
      opt.textContent = u.name + ' (' + u.uid + ')';
      sel.appendChild(opt);
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'adm-btn small';
    addBtn.textContent = 'Add';
    addBtn.addEventListener('click', () => {
      if (!sel.value) return;
      addMember(g.id, parseInt(sel.value, 10));
    });
    addRow.appendChild(sel);
    addRow.appendChild(addBtn);

    if (g.name !== 'administrators') {
      const del = document.createElement('button');
      del.className = 'adm-btn danger small';
      del.textContent = 'Delete group';
      del.addEventListener('click', () => deleteGroup(g.id, g.name));
      addRow.appendChild(del);
    }

    card.appendChild(addRow);
    return card;
  }

  async function createGroup() {
    const name = document.getElementById('newGroupName').value.trim();
    const description = document.getElementById('newGroupDesc').value.trim();
    const permissions = {
      can_approve_gear: document.getElementById('newPermApprove').checked,
      can_view_all_gear: document.getElementById('newPermView').checked,
      can_manage_groups: document.getElementById('newPermGroups').checked,
      can_manage_users: document.getElementById('newPermUsers').checked,
    };
    const msg = document.getElementById('newGroupMsg');
    msg.className = 'adm-msg';
    msg.textContent = '';
    if (!name) {
      msg.textContent = 'Group name required';
      msg.className = 'adm-msg error';
      return;
    }
    try {
      await api('/api/sfi/groups', { method: 'POST', body: JSON.stringify({ name, description, permissions }) });
      msg.textContent = 'Created';
      msg.className = 'adm-msg success';
      document.getElementById('newGroupName').value = '';
      document.getElementById('newGroupDesc').value = '';
      ['newPermApprove', 'newPermView', 'newPermGroups', 'newPermUsers'].forEach(id => {
        document.getElementById(id).checked = false;
      });
      await loadGroups();
    } catch (err) {
      msg.textContent = 'Failed: ' + (err.body || err.message);
      msg.className = 'adm-msg error';
    }
  }

  async function addMember(groupId, userId) {
    try {
      await api('/api/sfi/groups/' + groupId + '/members', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      await loadGroups();
    } catch (err) {
      alert('Add member failed: ' + (err.body || err.message));
    }
  }

  async function removeMember(groupId, userId) {
    if (!confirm('Remove this user from the group?')) return;
    try {
      await api('/api/sfi/groups/' + groupId + '/members/' + userId, { method: 'DELETE' });
      await loadGroups();
    } catch (err) {
      alert('Remove failed: ' + (err.body || err.message));
    }
  }

  async function deleteGroup(groupId, name) {
    if (!confirm('Delete the group "' + name + '"? Members will lose its permissions.')) return;
    try {
      await api('/api/sfi/groups/' + groupId, { method: 'DELETE' });
      await loadGroups();
    } catch (err) {
      alert('Delete failed: ' + (err.body || err.message));
    }
  }

  function makeEmpty(text) {
    const div = document.createElement('div');
    div.className = 'adm-empty';
    div.textContent = text;
    return div;
  }

  boot();
})();
</script>

