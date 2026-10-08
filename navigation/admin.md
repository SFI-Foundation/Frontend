---
layout: sfi
title: Admin Portal
description: Manage users, permission groups, and gear submissions.
permalink: /admin/
search_exclude: true
---

<style>
.adm-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px 60px;
  font-family: 'Inter', sans-serif;
  color: var(--sfi-text);
}

.adm-head { margin-bottom: 28px; }
.adm-head .adm-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--sfi-blue);
  margin-bottom: 6px;
}
.adm-head h1 {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--sfi-text);
  margin: 0 0 10px;
}
.adm-head h1 span { color: var(--sfi-blue); }
.adm-head p { color: var(--sfi-muted); max-width: 720px; line-height: 1.6; }

.adm-gate {
  padding: 48px 32px;
  border: 1px dashed var(--sfi-border-bright);
  border-radius: 16px;
  background: var(--sfi-surface2);
  text-align: center;
}
.adm-gate h2 { font-family: 'Oswald', sans-serif; color: var(--sfi-text); margin: 0 0 10px; letter-spacing: 1px; }
.adm-gate p { color: var(--sfi-muted); margin: 0 0 18px; }
.adm-gate .adm-btn { display: inline-block; }

.adm-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--sfi-border);
  margin: 18px 0 26px;
  flex-wrap: wrap;
}
.adm-tab {
  padding: 10px 18px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--sfi-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.adm-tab:hover { color: var(--sfi-text); }
.adm-tab.active { color: var(--sfi-blue); border-bottom-color: var(--sfi-blue); }
.adm-tab .count {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.7rem;
  background: var(--sfi-surface2);
  color: var(--sfi-blue);
  padding: 1px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
}

.adm-panel { display: none; }
.adm-panel.active { display: block; }

.adm-card {
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 16px;
}
.adm-card h3 {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--sfi-blue);
  margin: 0 0 12px;
}

.adm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.adm-table th, .adm-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--sfi-border);
}
.adm-table th {
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--sfi-muted);
  font-weight: 500;
}
.adm-table tr:last-child td { border-bottom: none; }
.adm-table td .chip-stack { display: flex; flex-wrap: wrap; gap: 4px; }

.adm-chip {
  display: inline-block;
  padding: 2px 8px;
  font-family: 'DM Mono', monospace;
  font-size: 0.64rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 3px;
  border: 1px solid var(--sfi-border);
  color: var(--sfi-muted);
  background: var(--sfi-surface2);
}
.adm-chip.admin { color: var(--sfi-blue); border-color: var(--sfi-border-bright); background: var(--sfi-surface2); }
.adm-chip.ok { color: var(--sfi-green); border-color: rgba(63,185,80,0.35); background: rgba(63,185,80,0.08); }
.adm-chip.warn { color: var(--sfi-blue); border-color: var(--sfi-border-bright); background: var(--sfi-surface2); }
.adm-chip.bad { color: var(--sfi-red); border-color: rgba(248,81,73,0.35); background: rgba(248,81,73,0.08); }

.adm-btn {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--sfi-border);
  background: transparent;
  color: var(--sfi-text);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
}
.adm-btn:hover { border-color: var(--sfi-blue); color: var(--sfi-blue); }
.adm-btn:active { transform: translateY(1px); }
.adm-btn.approve { color: var(--sfi-green); border-color: rgba(63,185,80,0.35); background: rgba(63,185,80,0.06); }
.adm-btn.approve:hover { background: rgba(63,185,80,0.15); border-color: var(--sfi-green); }
.adm-btn.reject { color: var(--sfi-red); border-color: rgba(248,81,73,0.35); background: rgba(248,81,73,0.06); }
.adm-btn.reject:hover { background: rgba(248,81,73,0.15); border-color: var(--sfi-red); }
.adm-btn.primary {
  background: var(--sfi-blue);
  color: var(--sfi-white);
  border-color: transparent;
}
.adm-btn.primary:hover { background: var(--sfi-blue-dark); transform: translateY(-1px); color: var(--sfi-white); }
.adm-btn.danger { color: var(--sfi-red); border-color: rgba(248,81,73,0.35); }
.adm-btn.small { font-size: 0.72rem; padding: 5px 10px; }

.adm-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.adm-input {
  flex: 1;
  min-width: 160px;
  padding: 9px 12px;
  border: 1px solid var(--sfi-border);
  background: var(--sfi-surface2);
  color: var(--sfi-text);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
}
.adm-input:focus { outline: none; border-color: var(--sfi-blue); }

.adm-group-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
.adm-group-card {
  background: var(--sfi-surface2);
  border: 1px solid var(--sfi-border);
  border-radius: 12px;
  padding: 16px 18px;
}
.adm-group-card h4 {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--sfi-text);
  margin: 0 0 4px;
}
.adm-group-card .meta { font-size: 0.78rem; color: var(--sfi-muted); margin-bottom: 10px; }
.adm-perm-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.adm-perm { padding: 3px 8px; font-size: 0.68rem; font-family: 'DM Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 3px; border: 1px solid var(--sfi-border); color: var(--sfi-muted); }
.adm-perm.on { color: var(--sfi-blue); border-color: var(--sfi-border-bright); background: var(--sfi-surface2); }

.adm-members { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 10px; }
.adm-member-chip {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 20px;
  border: 1px solid var(--sfi-border);
  background: var(--sfi-surface);
  color: var(--sfi-text);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.adm-member-chip button {
  background: none;
  border: none;
  color: var(--sfi-muted);
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1;
  padding: 0 0 0 2px;
}
.adm-member-chip button:hover { color: var(--sfi-red); }

.adm-empty {
  padding: 22px;
  color: var(--sfi-muted);
  font-style: italic;
  text-align: center;
  border: 1px dashed var(--sfi-border);
  border-radius: 10px;
}

.adm-loading { color: var(--sfi-muted); font-style: italic; }
.adm-msg { font-size: 0.8rem; padding: 6px 10px; border-radius: 6px; display: none; }
.adm-msg.success { display: inline-block; background: rgba(63,185,80,0.1); color: var(--sfi-green); }
.adm-msg.error { display: inline-block; background: rgba(248,81,73,0.1); color: var(--sfi-red); }
</style>

<div class="adm-wrap">
  <div class="adm-head">
    <div class="adm-eyebrow">SFI Foundation</div>
    <h1>Admin <span>Portal</span></h1>
    <p>Manage users, permission groups, and moderate gear submitted by members. Administrators see the centralized gear database and can approve or reject records from lower groups.</p>
  </div>

  <div id="admGate" class="adm-gate" style="display:none;">
    <h2>Administrators only</h2>
    <p id="admGateMsg">Sign in with an account that belongs to the <code>administrators</code> group to continue.</p>
    <a href="/login/" class="adm-btn primary">Sign In</a>
  </div>

  <div id="admMain" style="display:none;">
    <div class="adm-tabs" role="tablist">
      <button type="button" class="adm-tab active" data-panel="panel-pending">Pending Gear <span class="count" id="cntPending">0</span></button>
      <button type="button" class="adm-tab" data-panel="panel-gear">All Gear <span class="count" id="cntGear">0</span></button>
      <button type="button" class="adm-tab" data-panel="panel-users">Users <span class="count" id="cntUsers">0</span></button>
      <button type="button" class="adm-tab" data-panel="panel-groups">Groups <span class="count" id="cntGroups">0</span></button>
    </div>

    <!-- ── Pending Gear ───────────────────────────── -->
    <section id="panel-pending" class="adm-panel active">
      <div class="adm-card">
        <h3>Awaiting Review</h3>
        <div id="pendingBody" class="adm-loading">Loading pending submissions…</div>
      </div>
    </section>

    <!-- ── All Gear ────────────────────────────────── -->
    <section id="panel-gear" class="adm-panel">
      <div class="adm-card">
        <h3>Centralized Gear Database</h3>
        <div id="gearBody" class="adm-loading">Loading gear…</div>
      </div>
    </section>

    <!-- ── Users ───────────────────────────────────── -->
    <section id="panel-users" class="adm-panel">
      <div class="adm-card">
        <h3>Users</h3>
        <div id="usersBody" class="adm-loading">Loading users…</div>
      </div>
    </section>

    <!-- ── Groups ─────────────────────────────────── -->
    <section id="panel-groups" class="adm-panel">
      <div class="adm-card">
        <h3>Create a new group</h3>
        <div class="adm-row" style="margin-bottom:10px;">
          <input class="adm-input" id="newGroupName" placeholder="Group name (e.g. inspectors)">
          <input class="adm-input" id="newGroupDesc" placeholder="Description (optional)">
        </div>
        <div class="adm-row" style="gap:16px;">
          <label class="adm-row" style="font-size:0.78rem;gap:6px;"><input type="checkbox" id="newPermApprove"> Approve gear</label>
          <label class="adm-row" style="font-size:0.78rem;gap:6px;"><input type="checkbox" id="newPermView"> View all gear</label>
          <label class="adm-row" style="font-size:0.78rem;gap:6px;"><input type="checkbox" id="newPermGroups"> Manage groups</label>
          <label class="adm-row" style="font-size:0.78rem;gap:6px;"><input type="checkbox" id="newPermUsers"> Manage users</label>
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
    main.style.display = 'block';
    wireTabs();
    await Promise.all([loadPending(), loadAllGear(), loadUsers(), loadGroups()]);
  }

  function showGate(message) {
    gate.style.display = 'block';
    if (message) gateMsg.textContent = message;
  }

  function wireTabs() {
    document.querySelectorAll('.adm-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.panel;
        document.querySelectorAll('.adm-tab').forEach(t => t.classList.toggle('active', t === btn));
        document.querySelectorAll('.adm-panel').forEach(p => p.classList.toggle('active', p.id === target));
      });
    });
    document.getElementById('createGroupBtn').addEventListener('click', createGroup);
  }

  // ── Pending Gear ────────────────────────────────────
  async function loadPending() {
    try { state.pending = await api('/api/sfi/gear/pending'); }
    catch { state.pending = []; }
    renderPending();
  }

  function renderPending() {
    document.getElementById('cntPending').textContent = String(state.pending.length);
    const body = document.getElementById('pendingBody');
    body.className = '';
    body.textContent = '';
    if (!state.pending.length) {
      body.appendChild(makeEmpty('No pending submissions. The queue is clear.'));
      return;
    }
    const table = makeGearTable(state.pending, true);
    body.appendChild(table);
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
      rejectBtn.style.marginLeft = '6px';
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
    catch { state.allGear = []; }
    renderAllGear();
  }

  function renderAllGear() {
    document.getElementById('cntGear').textContent = String(state.allGear.length);
    const body = document.getElementById('gearBody');
    body.className = '';
    body.textContent = '';
    if (!state.allGear.length) {
      body.appendChild(makeEmpty('No gear recorded yet.'));
      return;
    }
    body.appendChild(makeGearTable(state.allGear, false));
  }

  // ── Users ───────────────────────────────────────────
  async function loadUsers() {
    try { state.users = await api('/api/sfi/users'); }
    catch { state.users = []; }
    renderUsers();
  }

  function renderUsers() {
    document.getElementById('cntUsers').textContent = String(state.users.length);
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
    body.appendChild(table);
  }

  // ── Groups ──────────────────────────────────────────
  async function loadGroups() {
    try { state.groups = await api('/api/sfi/groups'); }
    catch { state.groups = []; }
    const detailed = await Promise.all(
      state.groups.map(g => api('/api/sfi/groups/' + g.id).catch(() => g))
    );
    state.groups = detailed;
    renderGroups();
  }

  function renderGroups() {
    document.getElementById('cntGroups').textContent = String(state.groups.length);
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
