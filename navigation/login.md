---
layout: opencs
title: Login
description: Sign in to your SFI Foundation account.
permalink: /login/
---

<div class="ocs__container">
  <!-- Login/Register Form (shown when logged out) -->
  <div class="ocs__card" id="authForm">
    <div class="ocs__links">
      <button class="ocs__btn pill small accent fill" id="tabLogin" onclick="switchTab('login')">Sign In</button>
      <button class="ocs__btn pill small" id="tabRegister" onclick="switchTab('register')">Create Account</button>
    </div>

    <div id="msgBox" class="ocs__callout" hidden></div>

    <!-- Login Fields -->
    <div id="loginFields">
      <h2 class="ocs__section-title">Welcome to SFI</h2>
      <p class="ocs__description">Sign in to your SFI Foundation account.</p>
      <input class="ocs__input" type="text" id="loginUid" placeholder="Your username" autocomplete="username">
      <input class="ocs__input" type="password" id="loginPass" placeholder="Your password" autocomplete="current-password">
      <button class="ocs__btn accent fill" id="loginBtn" onclick="doLogin()">Sign In</button>
    </div>

    <!-- Register Fields -->
    <div id="registerFields" hidden>
      <h2 class="ocs__section-title">Get started</h2>
      <p class="ocs__description">Create your SFI Foundation account.</p>
      <input class="ocs__input" type="text" id="regName" placeholder="Display name" autocomplete="name">
      <input class="ocs__input" type="text" id="regUid" placeholder="Choose a username" autocomplete="username">
      <input class="ocs__input" type="password" id="regPass" placeholder="Min 6 characters" autocomplete="new-password">
      <button class="ocs__btn accent fill" id="regBtn" onclick="doRegister()">Create Account</button>
    </div>
  </div>

  <!-- Profile Card (shown when logged in) -->
  <div class="ocs__card" id="profileCard" hidden>
    <span class="ocs__badge" id="profileAvatar"></span>
    <h3 id="profileName"></h3>
    <p class="ocs__text" id="profileUid"></p>
    <span class="ocs__status-pill ocs__status-pill--neutral" id="profileRole"></span>
    <div class="ocs__links">
      <button class="ocs__btn alert-red" onclick="doLogout()">Sign Out</button>
    </div>
  </div>
</div>

<script>
(function() {
  var API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8423'
    : 'https://greppers-be.opencodingsociety.com';

  var msgBox = document.getElementById('msgBox');

  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.hidden = false;
    msgBox.classList.toggle('alert-red', type === 'error');
  }
  function clearMsg() { msgBox.hidden = true; }

  window.switchTab = function(tab) {
    clearMsg();
    ['tabLogin', 'tabRegister'].forEach(function(id) {
      var on = id === (tab === 'login' ? 'tabLogin' : 'tabRegister');
      document.getElementById(id).classList.toggle('accent', on);
      document.getElementById(id).classList.toggle('fill', on);
    });
    document.getElementById('loginFields').hidden = tab !== 'login';
    document.getElementById('registerFields').hidden = tab !== 'register';
  };

  function showProfile(user) {
    document.getElementById('authForm').hidden = true;
    document.getElementById('profileCard').hidden = false;
    document.getElementById('profileAvatar').textContent = (user.name || user.uid || '?')[0].toUpperCase();
    document.getElementById('profileName').textContent = user.name || user.uid;
    document.getElementById('profileUid').textContent = '@' + user.uid;
    document.getElementById('profileRole').textContent = user.role || 'User';
    // Broadcast login state for nav
    window.dispatchEvent(new CustomEvent('sfi-auth', { detail: user }));
  }

  function showForm() {
    document.getElementById('authForm').hidden = false;
    document.getElementById('profileCard').hidden = true;
    window.dispatchEvent(new CustomEvent('sfi-auth', { detail: null }));
  }

  // Check if already logged in
  fetch(API_BASE + '/api/id', { credentials: 'include' })
    .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function(data) { showProfile(data); })
    .catch(function() { showForm(); });

  window.doLogin = function() {
    clearMsg();
    var uid = document.getElementById('loginUid').value.trim();
    var pass = document.getElementById('loginPass').value;
    if (!uid || !pass) { showMsg('Please fill in all fields.', 'error'); return; }

    document.getElementById('loginBtn').disabled = true;

    fetch(API_BASE + '/api/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ uid: uid, password: pass })
    })
    .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
    .then(function(res) {
      if (res.ok) {
        showMsg('Signed in!', 'success');
        setTimeout(function() { showProfile(res.data.user || { uid: uid, name: uid }); }, 500);
      } else {
        showMsg(res.data.message || 'Invalid credentials.', 'error');
      }
    })
    .catch(function() { showMsg('Could not connect to server.', 'error'); })
    .finally(function() { document.getElementById('loginBtn').disabled = false; });
  };

  window.doRegister = function() {
    clearMsg();
    var name = document.getElementById('regName').value.trim();
    var uid = document.getElementById('regUid').value.trim();
    var pass = document.getElementById('regPass').value;
    if (!name || !uid || !pass) { showMsg('Please fill in all fields.', 'error'); return; }
    if (pass.length < 6) { showMsg('Password must be at least 6 characters.', 'error'); return; }
    if (uid.length < 2) { showMsg('Username must be at least 2 characters.', 'error'); return; }

    document.getElementById('regBtn').disabled = true;

    fetch(API_BASE + '/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: name, uid: uid, password: pass })
    })
    .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, status: r.status, data: d }; }); })
    .then(function(res) {
      if (res.ok || res.status === 200) {
        showMsg('Account created! Signing you in...', 'success');
        // Auto-login after register
        return fetch(API_BASE + '/api/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ uid: uid, password: pass })
        })
        .then(function(r2) { return r2.json(); })
        .then(function(d2) {
          setTimeout(function() { showProfile(d2.user || { uid: uid, name: name }); }, 600);
        });
      } else {
        showMsg(res.data.message || 'Registration failed.', 'error');
      }
    })
    .catch(function() { showMsg('Could not connect to server.', 'error'); })
    .finally(function() { document.getElementById('regBtn').disabled = false; });
  };

  window.doLogout = function() {
    fetch(API_BASE + '/api/authenticate', {
      method: 'DELETE',
      credentials: 'include'
    })
    .then(function() { showForm(); })
    .catch(function() { showForm(); });
  };

  // Enter key submits
  document.getElementById('loginPass').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') window.doLogin();
  });
  document.getElementById('regPass').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') window.doRegister();
  });
})();
</script>
