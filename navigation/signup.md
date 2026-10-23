---
layout: sfi
title: Sign Up
permalink: /signup/
search_exclude: true
---

<style>
  #login-container {
      width: min(100% - 32px, 440px);
      margin: 40px auto;
      display: flex;
      justify-content: center;
  }

  .signup-card {
      width: 100%;
      min-width: 0;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 24px;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
      background: #fff;
  }

  #signupForm label {
      display: block;
      font-weight: 600;
  }

  #signupForm input:not([type="checkbox"]) {
      display: block;
      width: 100%;
      min-height: 44px;
      margin-top: 6px;
      padding: 10px 12px;
      border: 1px solid #9ca3af;
      border-radius: 4px;
      font: inherit;
  }

  #signupForm input[type="checkbox"] {
      width: 20px;
      height: 20px;
      vertical-align: middle;
  }

  #signupForm button[type="submit"] {
      min-height: 44px;
      padding: 10px 20px;
  }

  @media (max-width: 480px) {
      #login-container { width: calc(100% - 32px); margin: 24px auto; }
      .signup-card { padding: 20px 16px; }
  }

  .signup-card h1 {
      margin-bottom: 20px;
  }
</style>

<div id="login-container">
  <div class="signup-card">
    <h1 id="signupTitle">Sign Up</h1>
    <form id="signupForm" onsubmit="signup(); return false;">
      <p>
        <label>
          Name:
          <input type="text" name="name" id="name" required>
        </label>
      </p>
      <p>
        <label>
          Github Id:
          <input type="text" name="signupUid" id="signupUid" required>
        </label>
      </p>
      <p>
        <label>
          SID:
          <input type="text" name="sid" id="sid" required>
        </label>
      </p>
      <p>
        <label>
          Password:
          <input type="password" name="signupPassword" id="signupPassword" required>
        </label>
      </p>
      <p>
        <label>
          <input type="checkbox" name="kasmNeeded" id="kasmNeeded">
          Kasm Server Needed
        </label>
      </p>
      <p>
        <button type="submit" class="medium filledHighlight primary">Sign Up</button>
      </p>
      <p id="signupMessage" style="color: green;"></p>
    </form>
  </div>
</div>

<script type="module">
  import { javaURI } from '{{ site.baseurl }}/assets/js/api/config.js';
  import { pythonURI } from '{{ site.baseurl }}/assets/js/api/config.js';

  // Sign up function to handle form submission
  window.signup = function() {
    const signupOptionsJava = {
      URL: `${javaURI}/api/person/create`,
      method: "POST",
      cache: "no-cache",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        uid: document.getElementById("signupUid").value,
        sid: document.getElementById("sid").value,
        email: document.getElementById("signupUid").value + "@gmail.com",
        dob: "11-01-2024",  // Static date for now, you can modify this
        name: document.getElementById("name").value,
        password: document.getElementById("signupPassword").value,
        kasmServerNeeded: document.getElementById("kasmNeeded").checked,
      })
    };

    const signupOptionsPython = {
      URL: `${pythonURI}/api/user`,
      method: "POST",
      cache: "no-cache",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        uid: document.getElementById("signupUid").value,
        sid: document.getElementById("sid").value,
        email: document.getElementById("signupUid").value + "@gmail.com",
        dob: "11-01-2024",  // Static date for now, you can modify this
        name: document.getElementById("name").value,
        password: document.getElementById("signupPassword").value,
        kasmServerNeeded: document.getElementById("kasmNeeded").checked,
      })
    };

    // Debugging: Check if the request is set up correctly
    console.log('Sending request:', signupOptionsJava, signupOptionsPython);

    // Send the request to the server
    fetch(signupOptionsJava.URL, signupOptionsJava)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById("signupMessage").innerText = "Sign up successful!";
        } else {
          document.getElementById("signupMessage").innerText = "Sign up failed: " + data.message;
        }
      })
      .catch(error => {
        document.getElementById("signupMessage").innerText = "Error: " + error.message;
        console.error('Error during signup:', error);
      });

    fetch(signupOptionsPython.URL, signupOptionsPython)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById("signupMessage").innerText = "Sign up successful!";
        } else {
          document.getElementById("signupMessage").innerText = "Sign up failed: " + data.message;
        }
      })
      .catch(error => {
        document.getElementById("signupMessage").innerText = "Error: " + error.message;
        console.error('Error during signup:', error);
      });
  };
</script>
