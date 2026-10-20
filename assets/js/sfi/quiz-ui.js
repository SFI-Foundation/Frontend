// ════════════════════════════════════════════════════
// Quiz UI – Rendering & Autocomplete
// Single Responsibility: All DOM rendering (score ring,
// badges, gear list) and spec autocomplete dropdown.
// ════════════════════════════════════════════════════

const QuizUI = (() => {

  // ── Autocomplete ──────────────────────────────────
  let selectedSpecData = null;

  function initAutocomplete() {
    const specInput = document.getElementById('gearSpec');
    const acList = document.getElementById('gearAC');

    specInput.addEventListener('input', () => {
      const q = specInput.value.trim().toLowerCase();
      selectedSpecData = null;
      const allSpecs = QuizData.getSpecs();
      if (q.length < 1 || !allSpecs.length) { acList.className = 'gear-autocomplete'; return; }

      const matches = allSpecs.filter(s =>
        s.spec_number.toLowerCase().includes(q) ||
        s.product_name.toLowerCase().includes(q)
      ).slice(0, 8);

      if (!matches.length) { acList.className = 'gear-autocomplete'; return; }

      acList.innerHTML = matches.map((s, i) => `
        <div class="gear-ac-item" data-idx="${i}">
          <strong>SFI ${s.spec_number}</strong> &mdash; ${s.product_name}
          <br><small>${s.category}</small>
        </div>
      `).join('');

      acList.querySelectorAll('.gear-ac-item').forEach((el, i) => {
        el.addEventListener('click', () => {
          const s = matches[i];
          specInput.value = s.spec_number;
          selectedSpecData = s;
          acList.className = 'gear-autocomplete';
          if (!document.getElementById('gearName').value.trim()) {
            document.getElementById('gearName').value = s.product_name;
          }
        });
      });

      acList.className = 'gear-autocomplete open';
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.gear-spec-wrap')) acList.className = 'gear-autocomplete';
    });
  }

  function getSelectedSpec() { return selectedSpecData; }
  function clearSelectedSpec() { selectedSpecData = null; }

  function updateAuthBanner(remote, authed) {
    const banner = document.getElementById('gearAuthBanner');
    if (!banner) return;
    banner.textContent = '';
    if (remote) {
      banner.className = 'gear-auth-banner remote';
      banner.appendChild(document.createTextNode(
        'Signed in — your gear is tracked in the central database. Administrators review new submissions.'
      ));
    } else {
      banner.className = 'gear-auth-banner local';
      const strong = document.createElement('strong');
      strong.textContent = 'Not signed in.';
      banner.appendChild(strong);
      banner.appendChild(document.createTextNode(
        ' Items stay on this device only and are not visible to administrators. '
      ));
      const a = document.createElement('a');
      a.href = '/login';
      a.textContent = 'Sign in';
      banner.appendChild(a);
      banner.appendChild(document.createTextNode(' to sync your gear.'));
    }
  }

  // ── Gear List Rendering ───────────────────────────
  function renderGear(sortMode) {
    const gear = QuizData.getGear();
    const { score, current, expiring, expired, noDate } = QuizData.calcSafetyScore();

    renderScoreRing(score, gear.length);
    renderBadges(current, expiring, expired, noDate, gear.length);

    document.getElementById('gearListTitle').textContent = `My Equipment (${gear.length})`;

    const sorted = QuizData.sortGear(sortMode);
    renderList(sorted);
  }

  function renderScoreRing(score, count) {
    const ring = document.getElementById('scoreRing');
    const circumference = 2 * Math.PI * 68;
    const offset = circumference - (score / 100) * circumference;
    ring.style.strokeDashoffset = count ? offset : circumference;

    let ringColor = 'var(--sfi-green)';
    if (score < 50) ringColor = 'var(--sfi-red)';
    else if (score < 75) ringColor = 'var(--sfi-gold)';
    ring.style.stroke = ringColor;

    document.getElementById('scoreNum').textContent = count ? score + '%' : '--';
  }

  function renderBadges(current, expiring, expired, noDate, count) {
    const badges = document.getElementById('scoreBadges');
    if (!count) { badges.innerHTML = ''; return; }

    let html = '';
    if (current) html += `<span class="gear-badge good">${current} Current</span>`;
    if (expiring) html += `<span class="gear-badge warn">${expiring} Expiring</span>`;
    if (expired) html += `<span class="gear-badge bad">${expired} Expired</span>`;
    if (noDate) html += `<span class="gear-badge warn">${noDate} No Date</span>`;
    badges.innerHTML = html;
  }

  function renderList(sorted) {
    const list = document.getElementById('gearList');
    if (!sorted.length) {
      list.innerHTML = `
        <div class="gear-empty">
          <div class="gear-empty-icon">&#128737;&#65039;</div>
          Add your racing safety equipment above to start tracking certifications.<br>
          Type an SFI spec number to auto-fill from the database.
        </div>`;
      return;
    }

    list.innerHTML = sorted.map(g => {
      const s = QuizData.getStatus(g);
      const icon = QuizData.getCategoryIcon(g.category);
      let daysText = '';
      if (s.days !== null) {
        if (s.days < 0) daysText = `Expired ${Math.abs(s.days)} days ago`;
        else if (s.days === 0) daysText = 'Expires today';
        else if (s.days <= 30) daysText = `${s.days} days left`;
        else if (s.days <= 365) daysText = `${Math.round(s.days / 30)} months left`;
        else daysText = `${(s.days / 365).toFixed(1)} years left`;
      }

      const cardStatusClass =
        s.status === 'pending' ? 'pending'
        : s.status === 'rejected' ? 'rejected'
        : s.color === 'expired' ? 'expired'
        : s.color === 'warn' ? 'warn'
        : 'good';

      const tagClass =
        s.status === 'pending' ? 'pending'
        : s.status === 'rejected' ? 'rejected'
        : s.color;

      const reviewNote = (s.status === 'rejected' && g.reviewNote)
        ? `<div class="gear-review-note">Reviewer: ${g.reviewNote}</div>`
        : '';

      const sourceTag = g.source === 'ai-detection'
        ? '<span title="Saved from the AI Equipment Detector">AI detect</span>'
        : '';

      return `
        <div class="gear-item status-${cardStatusClass}">
          <div class="gear-item-icon">${icon}</div>
          <div class="gear-item-info">
            <div class="gear-item-name">${g.name}</div>
            <div class="gear-item-spec">SFI ${g.spec}</div>
            <div class="gear-item-meta">
              ${g.category ? `<span>${g.category}</span>` : ''}
              ${g.certDate ? `<span>Cert: ${g.certDate}</span>` : '<span>No cert date</span>'}
              ${sourceTag}
            </div>
            ${reviewNote}
          </div>
          <div class="gear-item-status">
            <div class="gear-status-tag ${tagClass}">${s.label}</div>
            ${daysText ? `<div class="gear-days-left">${daysText}</div>` : ''}
          </div>
          <button class="gear-item-del" onclick="removeGear(${g.id})" title="Remove">&times;</button>
        </div>`;
    }).join('');
  }

  return { initAutocomplete, getSelectedSpec, clearSelectedSpec, renderGear, updateAuthBanner };
})();
