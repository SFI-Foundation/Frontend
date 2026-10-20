---
layout: sfi
title: Login
description: Sign in to your SFI Foundation account.
permalink: /login/
---

<style>
.auth-container {
  max-width: 440px;
  margin: 120px auto 60px;
  padding: 0 20px;
}
.auth-card {
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: var(--sfi-radius);
  padding: 40px 36px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.4);
}
.auth-card h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: 0.02em;
}
#loginFields h2 {
  color: #000;
}
.auth-card .auth-sub {
  color: var(--sfi-muted);
  font-size: 0.88rem;
  margin: 0 0 28px;
}

/* Tabs */
.auth-tabs {
  display: flex;
  gap: 4px;
  background: var(--sfi-bg);
  border-radius: var(--sfi-radius-sm);
  padding: 4px;
  margin-bottom: 28px;
}
.auth-tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sfi-muted);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.auth-tab.active {
  background: var(--sfi-surface2);
  color: var(--sfi-gold);
}
.auth-tab:hover:not(.active) { color: var(--sfi-text); }

/* Form fields */
.auth-field {
  margin-bottom: 18px;
}
.auth-field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sfi-muted);
  margin-bottom: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.auth-field input {
  width: 100%;
  padding: 12px 16px;
  background: var(--sfi-bg);
  border: 1px solid var(--sfi-border);
  border-radius: var(--sfi-radius-sm);
  color: var(--sfi-text);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.auth-field input:focus {
  border-color: var(--sfi-gold);
  box-shadow: 0 0 0 3px rgba(240,165,0,0.1);
}
.auth-field input::placeholder { color: #3d4555; }

/* Submit button */
.auth-submit {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, var(--sfi-gold), var(--sfi-gold-dim));
  border: none;
  border-radius: var(--sfi-radius-sm);
  color: #000;
  font-family: 'Inter', sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s;
  margin-top: 6px;
  letter-spacing: 0.02em;
}
.auth-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(240,165,0,0.35);
}
.auth-submit:disabled {
  opacity: 0.5;
  cursor: default;
  transform: none;
  box-shadow: none;
}

/* Messages */
.auth-msg {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.84rem;
  margin-bottom: 18px;
  display: none;
  line-height: 1.4;
}
.auth-msg.error {
  display: block;
  background: rgba(248,81,73,0.1);
  border: 1px solid rgba(248,81,73,0.25);
  color: var(--sfi-red);
}
.auth-msg.success {
  display: block;
  background: rgba(63,185,80,0.1);
  border: 1px solid rgba(63,185,80,0.25);
  color: var(--sfi-green);
}

/* Logged-in profile card */
.auth-profile {
  text-align: center;
}
.auth-profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sfi-gold), var(--sfi-gold-dim));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: #000;
  margin: 0 auto 16px;
}
.auth-profile h3 {
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  color: #fff;
  margin: 0 0 4px;
}
.auth-profile .auth-profile-uid {
  color: var(--sfi-gold);
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0 0 4px;
}
.auth-profile .auth-profile-role {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 24px;
  background: rgba(240,165,0,0.12);
  color: var(--sfi-gold);
  border: 1px solid rgba(240,165,0,0.2);
}
.auth-logout {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(248,81,73,0.3);
  border-radius: var(--sfi-radius-sm);
  color: var(--sfi-red);
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.auth-logout:hover {
  background: rgba(248,81,73,0.08);
}

@media (max-width: 480px) {
  .auth-container { margin-top: 90px; }
  .auth-card { padding: 28px 22px; }
}
</style>

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
        <label>Username</label>
        <input type="text" id="loginUid" placeholder="Your username" autocomplete="username">
      </div>
      <div class="auth-field">
        <label>Password</label>
        <input type="password" id="loginPass" placeholder="Your password" autocomplete="current-password">
      </div>
      <button class="auth-submit" id="loginBtn" onclick="doLogin()">Sign In</button>
    </div>

    <!-- Register Fields -->
    <div id="registerFields" style="display:none;">
      <h2>Get started</h2>
      <p class="auth-sub">Create your SFI Foundation account.</p>
      <div class="auth-field">
        <label>Display Name</label>
        <input type="text" id="regName" placeholder="Your name" autocomplete="name">
      </div>
      <div class="auth-field">
        <label>Username</label>
        <input type="text" id="regUid" placeholder="Choose a username" autocomplete="username">
      </div>
      <div class="auth-field">
        <label>Password</label>
        <input type="password" id="regPass" placeholder="Min 6 characters" autocomplete="new-password">
      </div>
      <button class="auth-submit" id="regBtn" onclick="doRegister()">Create Account</button>
    </div>
  </div>

  <!-- Profile Card (shown when logged in) -->
  <div class="auth-card auth-profile" id="profileCard" style="display:none;">
    <div class="auth-profile-avatar" id="profileAvatar"></div>
    <h3 id="profileName"></h3>
    <p class="auth-profile-uid" id="profileUid"></p>
    <div class="auth-profile-role" id="profileRole"></div>
    <button class="auth-logout" onclick="doLogout()">Sign Out</button>
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
