// ════════════════════════════════════════════════════
// Quiz UI – Rendering & Autocomplete
// Single Responsibility: All DOM rendering (score ring,
// badges, gear list) and spec autocomplete dropdown.
// ════════════════════════════════════════════════════

const QuizUI = (() => {
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  // ── Autocomplete ──────────────────────────────────
  let selectedSpecData = null;

  function initAutocomplete() {
    const specInput = document.getElementById('gearSpec');
    const acList = document.getElementById('gearAC');

    specInput.addEventListener('input', () => {
      const q = specInput.value.trim().toLowerCase();
      selectedSpecData = null;
      const allSpecs = QuizData.getSpecs();
      if (q.length < 1 || !allSpecs.length) { acList.className = 'sfi__autocomplete-list'; return; }

      const matches = allSpecs.filter(s =>
        s.spec_number.toLowerCase().includes(q) ||
        s.product_name.toLowerCase().includes(q)
      ).slice(0, 8);

      if (!matches.length) { acList.className = 'sfi__autocomplete-list'; return; }

      acList.innerHTML = matches.map((s, i) => `
        <div class="sfi__autocomplete-item" data-idx="${i}">
          <strong>SFI ${escapeHtml(s.spec_number)}</strong> &mdash; ${escapeHtml(s.product_name)}
          <br><small>${escapeHtml(s.category)}</small>
        </div>
      `).join('');

      acList.querySelectorAll('.sfi__autocomplete-item').forEach((el, i) => {
        el.addEventListener('click', () => {
          const s = matches[i];
          specInput.value = s.spec_number;
          selectedSpecData = s;
          acList.className = 'sfi__autocomplete-list';
          if (!document.getElementById('gearName').value.trim()) {
            document.getElementById('gearName').value = s.product_name;
          }
        });
      });

      acList.className = 'sfi__autocomplete-list open';
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.sfi__autocomplete')) acList.className = 'sfi__autocomplete-list';
    });
  }

  function getSelectedSpec() { return selectedSpecData; }
  function clearSelectedSpec() { selectedSpecData = null; }

  function updateAuthBanner(remote, authed, syncError = '') {
    const banner = document.getElementById('gearAuthBanner');
    if (!banner) return;
    banner.textContent = '';
    if (syncError) {
      banner.className = 'sfi__notice warn';
      banner.textContent = syncError;
    } else if (remote) {
      banner.className = 'sfi__notice good';
      banner.appendChild(document.createTextNode(
        'Signed in — your gear is tracked in the central database. Administrators review new submissions.'
      ));
    } else {
      banner.className = 'sfi__notice warn';
      const strong = document.createElement('strong');
      strong.textContent = 'Not signed in.';
      banner.appendChild(strong);
      banner.appendChild(document.createTextNode(
        ' Items stay on this device only and are not visible to administrators. '
      ));
      const a = document.createElement('a');
      a.href = banner.dataset.loginUrl || '/login/';
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
    ring.setAttribute('stroke-dashoffset', String(count ? offset : circumference));

    const tone = score < 50 ? 'bad' : score < 75 ? 'warn' : 'good';
    ring.setAttribute('class', `value ${tone}`);

    document.getElementById('scoreNum').textContent = count ? score + '%' : '--';
  }

  function renderBadges(current, expiring, expired, noDate, count) {
    const badges = document.getElementById('scoreBadges');
    if (!count) { badges.innerHTML = ''; return; }

    let html = '';
    if (current) html += `<span class="sfi__badge good">${current} Current</span>`;
    if (expiring) html += `<span class="sfi__badge warn">${expiring} Expiring</span>`;
    if (expired) html += `<span class="sfi__badge bad">${expired} Expired</span>`;
    if (noDate) html += `<span class="sfi__badge warn">${noDate} No Date</span>`;
    badges.innerHTML = html;
  }

  function renderList(sorted) {
    const list = document.getElementById('gearList');
    if (!sorted.length) {
      list.innerHTML = `
        <div class="sfi__empty">
          Add your racing safety equipment above to start tracking certifications.<br>
          Type an SFI spec number to auto-fill from the database.
        </div>`;
      return;
    }

    list.innerHTML = sorted.map(g => {
      const s = QuizData.getStatus(g);
      const review = QuizData.getReviewStatus(g);
      let daysText = '';
      if (s.days !== null) {
        if (s.days < 0) daysText = `Expired ${Math.abs(s.days)} days ago`;
        else if (s.days === 0) daysText = 'Expires today';
        else if (s.days <= 30) daysText = `${s.days} days left`;
        else if (s.days <= 365) daysText = `${Math.round(s.days / 30)} months left`;
        else daysText = `${(s.days / 365).toFixed(1)} years left`;
      }

      const cardStatusClass = s.status === 'expired' ? 'expired'
        : review?.status === 'rejected' ? 'rejected'
        : s.color === 'warn' || review?.status === 'pending' ? 'warn' : 'good';

      const tagTone = s.color === 'expired' ? 'bad' : s.color;

      const reviewNote = (review?.status === 'rejected' && g.reviewNote)
        ? `<div class="sfi__gear-item-note">Reviewer: ${escapeHtml(g.reviewNote)}</div>`
        : '';

      const sourceTag = ['ai-detection', 'detector'].includes(g.source)
        ? '<span title="Saved from the AI Equipment Detector">AI detect</span>'
        : '';

      return `
        <div class="sfi__gear-item is-${cardStatusClass}">
          <div class="sfi__gear-item-info">
            <div class="sfi__gear-item-name">${escapeHtml(g.name)}</div>
            <div class="sfi__gear-item-spec">SFI ${escapeHtml(g.spec)}</div>
            <div class="sfi__gear-item-meta">
              ${g.category ? `<span>${escapeHtml(g.category)}</span>` : ''}
              ${g.certDate ? `<span>Cert: ${escapeHtml(g.certDate)}</span>` : '<span>No cert date</span>'}
              ${sourceTag}
            </div>
            ${reviewNote}
          </div>
          <div class="sfi__gear-item-status">
            ${review ? `<span class="sfi__badge ${review.color}" data-gear-review>${review.label}</span>` : ''}
            <span class="sfi__badge ${tagTone}" data-gear-expiry>${s.label}</span>
            ${daysText ? `<div class="sfi__gear-item-days">${daysText}</div>` : ''}
          </div>
          <button type="button" class="sfi__gear-item-remove" aria-label="Remove ${escapeHtml(g.name)}" title="Remove">&times;</button>
        </div>`;
    }).join('');
    list.querySelectorAll('.sfi__gear-item-remove').forEach((button, index) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try { await QuizApp.removeGear(sorted[index].id); }
        finally { button.disabled = false; }
      });
    });
  }

  return { initAutocomplete, getSelectedSpec, clearSelectedSpec, renderGear, updateAuthBanner };
})();
