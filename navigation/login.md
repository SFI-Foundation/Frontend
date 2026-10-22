---
layout: sfi
title: Login
description: Sign in to your SFI Foundation account.
permalink: /login/
---



<div class="auth-container">
  <!-- Login/Register Form (shown when logged out) -->
  <div class="auth-card" id="authForm">
    <div class="auth-tabs">
      <button class="auth-tab active" id="tabLogin" onclick="switchTab('login')">Sign In</button>
      <button class="auth-tab" id="tabRegister" onclick="switchTab('register')">Create Account</button>
    </div>

    <div id="msgBox" class="auth-msg"></div>

    <!-- Login Fields -->
    <div id="loginFields">
      <h2>Welcome to SFI</h2>
      <p class="auth-sub">Sign in to your SFI Foundation account.</p>
      <div class="auth-field">
        <label for="loginUid">Username</label>
        <input type="text" id="loginUid" placeholder="Your username" autocomplete="username">
      </div>
      <div class="auth-field">
        <label for="loginPass">Password</label>
        <input type="password" id="loginPass" placeholder="Your password" autocomplete="current-password">
      </div>
      <button class="auth-submit" id="loginBtn" onclick="doLogin()">Sign In</button>
    </div>

    <!-- Register Fields -->
    <div id="registerFields" class="auth-initially-hidden">
      <h2>Get started</h2>
      <p class="auth-sub">Create your SFI Foundation account.</p>
      <div class="auth-field">
        <label for="regName">Display Name</label>
        <input type="text" id="regName" placeholder="Your name" autocomplete="name">
      </div>
      <div class="auth-field">
        <label for="regUid">Username</label>
        <input type="text" id="regUid" placeholder="Choose a username" autocomplete="username">
      </div>
      <div class="auth-field">
        <label for="regPass">Password</label>
        <input type="password" id="regPass" placeholder="Min 8 characters" autocomplete="new-password">
      </div>
      <button class="auth-submit" id="regBtn" onclick="doRegister()">Create Account</button>
    </div>
  </div>

  <!-- Profile Card (shown when logged in) -->
  <div class="auth-card auth-profile auth-initially-hidden" id="profileCard">
    <div class="auth-profile-avatar" id="profileAvatar"></div>
    <h3 id="profileName"></h3>
    <p class="auth-profile-uid" id="profileUid"></p>
    <div class="auth-profile-role" id="profileRole"></div>
    <p><a href="{{ '/sfi-profile/' | relative_url }}">View profile and optional interest quiz</a></p>
    <p id="logoutMessage" role="status"></p>
    <button class="auth-logout" onclick="doLogout()">Sign Out</button>
  </div>
</div>

<script type="module">
import { pythonURI as API_BASE } from '{{ "/assets/js/api/config.js" | relative_url }}';
(function() {

  var msgBox = document.getElementById('msgBox');

  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.className = 'auth-msg ' + type;
  }
  function clearMsg() { msgBox.className = 'auth-msg'; }

  window.switchTab = function(tab) {
    clearMsg();
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
    document.getElementById('loginFields').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerFields').style.display = tab === 'register' ? 'block' : 'none';
  };

  function showProfile(user) {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('profileCard').style.display = 'block';
    document.getElementById('profileAvatar').textContent = (user.name || user.uid || '?')[0].toUpperCase();
    document.getElementById('profileName').textContent = user.name || user.uid;
    document.getElementById('profileUid').textContent = '@' + user.uid;
    document.getElementById('profileRole').textContent = user.role || 'User';
    // Broadcast login state for nav
    window.dispatchEvent(new CustomEvent('sfi-auth', { detail: user }));
  }

  function showForm() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('profileCard').style.display = 'none';
    window.dispatchEvent(new CustomEvent('sfi-auth', { detail: null }));
  }

  function authenticatedProfile() {
    return fetch(API_BASE + '/api/id', { credentials: 'include', cache: 'no-store' })
      .then(function(r) {
        if (!r.ok) throw new Error('Sign-in could not be verified. Please allow cookies and try again.');
        return r.json();
      });
  }

  // Public /signup/ opens the existing SFI Create Account tab.
  if (window.location && window.location.hash === '#register') window.switchTab('register');

  // Check if already logged in
  authenticatedProfile()
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
        return authenticatedProfile().then(function(user) {
          document.getElementById('loginPass').value = '';
          showProfile(user);
        });
      } else {
        showMsg(res.data.message || 'Invalid credentials.', 'error');
      }
    })
    .catch(function(error) { showMsg(error.message || 'Could not connect to server.', 'error'); })
    .finally(function() { document.getElementById('loginBtn').disabled = false; });
  };

  window.doRegister = function() {
    clearMsg();
    var name = document.getElementById('regName').value.trim();
    var uid = document.getElementById('regUid').value.trim();
    var pass = document.getElementById('regPass').value;
    if (!name || !uid || !pass) { showMsg('Please fill in all fields.', 'error'); return; }
    if (pass.length < 8) { showMsg('Password must be at least 8 characters.', 'error'); return; }
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
        .then(function(r2) {
          return r2.json().then(function(data) {
            if (!r2.ok) throw new Error(data.message || 'Account created. Please sign in.');
            return authenticatedProfile();
          });
        })
        .then(function(user) {
          document.getElementById('regPass').value = '';
          showProfile(user);
        });
      } else {
        showMsg(res.data.message || 'Registration failed.', 'error');
      }
    })
    .catch(function(error) { showMsg(error.message || 'Could not connect to server.', 'error'); })
    .finally(function() { document.getElementById('regBtn').disabled = false; });
  };

  window.doLogout = function() {
    fetch(API_BASE + '/api/authenticate', {
      method: 'DELETE',
      credentials: 'include'
    })
    .then(function(response) {
      if (!response.ok && response.status !== 401) throw new Error('Sign out failed. Please try again.');
      showForm();
    })
    .catch(function(error) { document.getElementById('logoutMessage').textContent = error.message || 'Could not connect to server.'; });
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
