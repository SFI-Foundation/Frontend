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
      if (q.length < 1 || !allSpecs.length) { acList.hidden = true; return; }

      const matches = allSpecs.filter(s =>
        s.spec_number.toLowerCase().includes(q) ||
        s.product_name.toLowerCase().includes(q)
      ).slice(0, 8);

      if (!matches.length) { acList.hidden = true; return; }

      acList.innerHTML = matches.map((s, i) => `
        <li data-idx="${i}">
          <strong>SFI ${s.spec_number}</strong> &mdash; ${s.product_name}
          <br><small>${s.category}</small>
        </li>
      `).join('');

      acList.querySelectorAll('li').forEach((el, i) => {
        el.addEventListener('click', () => {
          const s = matches[i];
          specInput.value = s.spec_number;
          selectedSpecData = s;
          acList.hidden = true;
          if (!document.getElementById('gearName').value.trim()) {
            document.getElementById('gearName').value = s.product_name;
          }
        });
      });

      acList.hidden = false;
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#gearSpec, #gearAC')) acList.hidden = true;
    });
  }

  function getSelectedSpec() { return selectedSpecData; }
  function clearSelectedSpec() { selectedSpecData = null; }

  function updateAuthBanner(remote, authed) {
    const banner = document.getElementById('gearAuthBanner');
    if (!banner) return;
    banner.textContent = '';
    if (remote) {
      banner.classList.remove('alert-yellow');
      banner.appendChild(document.createTextNode(
        'Signed in — your gear is tracked in the central database. Administrators review new submissions.'
      ));
    } else {
      banner.classList.add('alert-yellow');
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
    ring.value = count ? score : 0;

    document.getElementById('scoreNum').textContent = count ? score + '%' : '--';
  }

  function renderBadges(current, expiring, expired, noDate, count) {
    const badges = document.getElementById('scoreBadges');
    if (!count) { badges.innerHTML = ''; return; }

    let html = '';
    if (current) html += `<span class="ocs__status-pill ocs__status-pill--good">${current} Current</span>`;
    if (expiring) html += `<span class="ocs__status-pill ocs__status-pill--warn">${expiring} Expiring</span>`;
    if (expired) html += `<span class="ocs__status-pill ocs__status-pill--bad">${expired} Expired</span>`;
    if (noDate) html += `<span class="ocs__status-pill ocs__status-pill--warn">${noDate} No Date</span>`;
    badges.innerHTML = html;
  }

  function renderList(sorted) {
    const list = document.getElementById('gearList');
    if (!sorted.length) {
      list.innerHTML = `
        <div class="ocs__callout">
          &#128737;&#65039; Add your racing safety equipment above to start tracking certifications.<br>
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

      const tagClass =
        s.status === 'pending' ? 'neutral'
        : s.status === 'rejected' ? 'bad'
        : s.color === 'expired' ? 'bad'
        : s.color === 'warn' ? 'warn'
        : 'good';

      const reviewNote = (s.status === 'rejected' && g.reviewNote)
        ? `<p class="ocs__text">Reviewer: ${g.reviewNote}</p>`
        : '';

      const sourceTag = g.source === 'ai-detection'
        ? '<span title="Saved from the AI Equipment Detector">AI detect</span>'
        : '';

      return `
        <div class="ocs__card">
          <h3>${icon} ${g.name} <span class="ocs__status-pill ocs__status-pill--${tagClass}">${s.label}</span></h3>
          <p class="ocs__text">SFI ${g.spec}${daysText ? ` &middot; ${daysText}` : ''}</p>
          <div class="ocs__links">
            ${g.category ? `<span>${g.category}</span>` : ''}
            ${g.certDate ? `<span>Cert: ${g.certDate}</span>` : '<span>No cert date</span>'}
            ${sourceTag}
          </div>
          ${reviewNote}
          <button class="ocs__btn small alert-red" onclick="removeGear(${g.id})" title="Remove">&times; Remove</button>
        </div>`;
    }).join('');
  }

  return { initAutocomplete, getSelectedSpec, clearSelectedSpec, renderGear, updateAuthBanner };
})();
