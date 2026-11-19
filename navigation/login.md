---
layout: sfi
title: Sign In
nav_title: Sign In
description: Sign in to your SFI Foundation account.
permalink: /login/
---



<div class="auth-container">
  <h1 class="sfi-visually-hidden">SFI account</h1>
  <!-- Login/Register Form (shown when logged out) -->
  <div class="auth-card" id="authForm">
    <div class="auth-tabs">
      <button class="auth-tab active" id="tabLogin" type="button" aria-pressed="true" aria-controls="loginFields" onclick="switchTab('login')">Sign In</button>
      <button class="auth-tab" id="tabRegister" type="button" aria-pressed="false" aria-controls="registerFields" onclick="switchTab('register')">Create Account</button>
    </div>

    <div id="msgBox" class="auth-msg" role="status" aria-atomic="true"></div>

    <!-- Login Fields -->
    <form id="loginFields" novalidate>
      <h2>Welcome to SFI</h2>
      <p class="auth-sub">Sign in to your SFI Foundation account.</p>
      <div class="auth-field">
        <label for="loginUid">Username</label>
        <input type="text" id="loginUid" required aria-describedby="msgBox" placeholder="Your username" autocomplete="username">
      </div>
      <div class="auth-field">
        <label for="loginPass">Password</label>
        <input type="password" id="loginPass" required aria-describedby="msgBox" placeholder="Your password" autocomplete="current-password">
      </div>
      <button class="auth-submit" id="loginBtn" type="submit">Sign In</button>
    </form>

    <!-- Register Fields -->
    <form id="registerFields" class="auth-initially-hidden" novalidate>
      <h2>Get started</h2>
      <p class="auth-sub">Create your SFI Foundation account.</p>
      <div class="auth-field">
        <label for="regName">Display Name</label>
        <input type="text" id="regName" required aria-describedby="msgBox" placeholder="Your name" autocomplete="name">
      </div>
      <div class="auth-field">
        <label for="regUid">Username</label>
        <input type="text" id="regUid" required aria-describedby="msgBox" placeholder="Choose a username" autocomplete="username">
      </div>
      <div class="auth-field">
        <label for="regPass">Password</label>
        <input type="password" id="regPass" required aria-describedby="msgBox" placeholder="Min 8 characters" autocomplete="new-password">
      </div>
      <button class="auth-submit" id="regBtn" type="submit">Create Account</button>
    </form>
  </div>

  <!-- Profile Card (shown when logged in) -->
  <div class="auth-card auth-profile auth-initially-hidden" id="profileCard">
    <div class="auth-profile-avatar" id="profileAvatar"></div>
    <h3 id="profileName"></h3>
    <p class="auth-profile-uid" id="profileUid"></p>
    <div class="auth-profile-role" id="profileRole"></div>
    <p><a href="{{ '/sfi-profile/' | relative_url }}">Edit Preferences and Profile</a></p>
    <p><a href="{{ "/sfi-profile/?onboarding=1" | relative_url }}">Tell Us About Yourself</a> — optional motorsports preferences. <a href="{{ "/" | relative_url }}">Skip for Now</a></p>
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
  function clearMsg() { msgBox.className = 'auth-msg'; msgBox.textContent = ''; }
  function invalid(id, message) {
    var field = document.getElementById(id);
    field.setAttribute('aria-invalid', 'true');
    showMsg(message, 'error'); field.focus();
  }
  for (var id of ['loginUid', 'loginPass', 'regName', 'regUid', 'regPass']) {
    document.getElementById(id).addEventListener('input', function(event) { event.target.removeAttribute('aria-invalid'); });
  }


  window.switchTab = function(tab) {
    clearMsg();
    document.getElementById('tabLogin').setAttribute('aria-pressed', String(tab === 'login'));
    document.getElementById('tabRegister').setAttribute('aria-pressed', String(tab === 'register'));
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
    if (!window.SFIAuth) window.dispatchEvent(new CustomEvent('sfi-auth', { detail: user }));
  }

  function showForm() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('profileCard').style.display = 'none';
    if (!window.SFIAuth) window.dispatchEvent(new CustomEvent('sfi-auth', { detail: null }));
  }

  window.addEventListener?.('sfi-session', function(event) {
    if (event.detail.state === 'authenticated') showProfile(event.detail.user);
    else if (event.detail.state === 'guest') showForm();
    else if (!event.detail.user) document.getElementById('profileCard').style.display = 'none';
  });

  function authenticatedProfile(force = false) {
    if (window.SFIAuth) return window.SFIAuth.refresh(force).then(function(user) {
      if (user) return user;
      var error = new Error('Sign-in could not be verified. Please allow cookies and try again.');
      error.status = 401;
      throw error;
    });
    return fetch(API_BASE + '/api/sfi/profile', { credentials: 'include', cache: 'no-store' })
      .then(function(r) {
        if (!r.ok) {
          var error = new Error('Sign-in could not be verified. Please allow cookies and try again.');
          error.status = r.status;
          throw error;
        }
        return r.json();
      });
  }

  // Public /signup/ opens the existing SFI Create Account tab.
  if (window.location && window.location.hash === '#register') window.switchTab('register');

  // Check if already logged in
  authenticatedProfile()
    .then(function(data) { if (!window.SFIAuth) showProfile(data); })
    .catch(function(error) {
      if (error.status === 401) {
        if (!window.SFIAuth || window.SFIAuth.snapshot().state === 'guest') showForm();
      }
      else showMsg('Account information could not be loaded. Try again.', 'error');
    });

  window.doLogin = function() {
    clearMsg();
    var uid = document.getElementById('loginUid').value.trim();
    var pass = document.getElementById('loginPass').value;
    if (!uid || !pass) { invalid(!uid ? 'loginUid' : 'loginPass', 'Please fill in all fields.'); return; }

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
        return authenticatedProfile(true).then(function(user) {
          document.getElementById('loginPass').value = '';
          if (!window.SFIAuth) showProfile(user);
          window.SFIAuth?.notifyChange();
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
    if (!name || !uid || !pass) { invalid(!name ? 'regName' : !uid ? 'regUid' : 'regPass', 'Please fill in all fields.'); return; }
    if (pass.length < 8) { invalid('regPass', 'Password must be at least 8 characters.'); return; }
    if (uid.length < 2) { invalid('regUid', 'Username must be at least 2 characters.'); return; }

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
            return authenticatedProfile(true);
          });
        })
        .then(function(user) {
          document.getElementById('regPass').value = '';
          if (!window.SFIAuth) showProfile(user);
          window.SFIAuth?.notifyChange();
          window.location.assign('{{ "/sfi-profile/?onboarding=1" | relative_url }}');
        });
      } else {
        showMsg(res.data.message || 'Registration failed.', 'error');
      }
    })
    .catch(function(error) { showMsg(error.message || 'Could not connect to server.', 'error'); })
    .finally(function() { document.getElementById('regBtn').disabled = false; });
  };

  window.doLogout = function() {
    (window.SFIAuth ? window.SFIAuth.signOut() : fetch(API_BASE + '/api/authenticate', {
      method: 'DELETE',
      credentials: 'include'
    }))
    .then(function(response) {
      if (response && !response.ok && response.status !== 401) throw new Error('Sign out failed. Please try again.');
      showForm();
    })
    .catch(function(error) { document.getElementById('logoutMessage').textContent = error.message || 'Could not connect to server.'; });
  };

  // Native form submission supports Enter from every field without duplicate requests.
  document.getElementById('loginFields').addEventListener('submit', function(event) { event.preventDefault(); window.doLogin(); });
  document.getElementById('registerFields').addEventListener('submit', function(event) { event.preventDefault(); window.doRegister(); });
})();
</script>
