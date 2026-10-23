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
    <a href="{{ '/login/' | relative_url }}" class="adm-btn primary">Sign In</a>
  </div>

  <div id="admMain" class="adm-hidden">
    <dl class="adm-summary" aria-label="Dashboard summary" aria-live="polite">
      <div class="adm-stat"><dt>Total users</dt><dd id="statUsers">—</dd></div>
      <div class="adm-stat"><dt>Total groups</dt><dd id="statGroups">—</dd></div>
      <div class="adm-stat"><dt>Pending gear reviews</dt><dd id="statPending">—</dd></div>
    </dl>
    <div class="adm-tabs" role="tablist" aria-label="Admin dashboard sections">
      <button type="button" class="adm-tab active" id="tab-users" role="tab" aria-controls="panel-users" aria-selected="true" tabindex="0" data-panel="panel-users">Users <span class="count" id="cntUsers">—</span></button>
      <button type="button" class="adm-tab" id="tab-groups" role="tab" aria-controls="panel-groups" aria-selected="false" tabindex="-1" data-panel="panel-groups">Groups <span class="count" id="cntGroups">—</span></button>
      <button type="button" class="adm-tab" id="tab-review" role="tab" aria-controls="panel-review" aria-selected="false" tabindex="-1" data-panel="panel-review">Gear Review</button>
    </div>

    <section role="tabpanel" aria-labelledby="tab-review" id="panel-review" class="adm-panel" tabindex="0">
      <div class="adm-row adm-review-toolbar">
        <label for="gearView">Gear view</label>
        <select id="gearView" class="adm-input">
          <option value="pending">Pending reviews</option>
          <option value="all">All gear</option>
        </select>
      </div>
      <div id="pendingView" class="adm-card">
        <h3>Awaiting Review <span class="count" id="cntPending">—</span></h3>
        <div id="pendingBody" class="adm-loading">Loading pending submissions…</div>
      </div>
      <div id="allGearView" class="adm-card" hidden>
        <h3>Centralized Gear Database <span class="count" id="cntGear">—</span></h3>
        <div id="gearBody" class="adm-loading">Loading gear…</div>
      </div>
    </section>

    <!-- ── Users ───────────────────────────────────── -->
    <section role="tabpanel" aria-labelledby="tab-users" id="panel-users" class="adm-panel active" tabindex="0">
      <div class="adm-card">
        <h3>Users</h3>
        <div id="usersBody" class="adm-loading">Loading users…</div>
      </div>
    </section>

    <!-- ── Groups ─────────────────────────────────── -->
    <section role="tabpanel" aria-labelledby="tab-groups" id="panel-groups" class="adm-panel" tabindex="0">
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

<script src="{{ '/assets/js/sfi/api-base.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/admin.js' | relative_url }}" defer></script>
