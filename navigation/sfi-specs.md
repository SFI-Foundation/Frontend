---
layout: sfi
title: SFI Specifications
nav_title: Spec Search
description: Search SFI specifications by number, product name and category.
permalink: /sfi-specs/
body_class: sfi-spec-search
---

<header class="sfi-page-header">
  <div class="sfi-page-header-content">
    <h1>Find SFI Specifications</h1>
    <p>Search by specification number, equipment name, or category to find verified current documents.</p>
  </div>
</header>

<div class="sfi__container">

<div id="publicView">

  <div class="sfi__row sfi__hidden" id="backToAdminBar">
    <button type="button" class="sfi__btn primary" id="backToAdminBtn">&larr; Back to admin view</button>
  </div>

<script src="{{ "/assets/js/sfi/api-base.js" | relative_url }}"></script>

  <section class="sfi__section" id="search">
    <h2 class="sfi-visually-hidden">Search the catalog</h2>
    <form id="sfiSearchForm" class="sfi__form-row" role="search">
      <label for="sfiSearch">Specification number or product name</label>
      <input type="search" class="sfi__field" id="sfiSearch" maxlength="200" placeholder="e.g. 3.2A, 16.1, driver suit">
      <button type="submit" class="sfi__btn primary">Search</button>
      <button type="button" class="sfi__btn" id="sfiClear">Clear search</button>
    </form>
    <details class="sfi-filter-panel" id="sfiCategoryPanel" open>
    <summary>Filter by category: <span id="sfiSelectedCategory">All categories</span></summary>
    <div class="sfi__filters" id="sfiFilters" role="group" aria-label="Specification category">
      <button type="button" class="sfi__chip active" data-category="all" aria-pressed="true">All</button>
    </div>
    </details>
    <p class="sfi__count" id="sfiCount" role="status" aria-live="polite" tabindex="-1"></p>
    <div id="sfiResults" aria-busy="false"></div>
    <p class="sfi__empty" id="sfiNoResults" hidden></p>
    <button type="button" class="sfi__btn" id="sfiRetry" hidden>Retry loading specifications</button>
    <nav class="sfi__row" aria-label="Specification result pages">
      <button type="button" class="sfi__btn" id="sfiPrevious" disabled>Previous page</button>
      <button type="button" class="sfi__btn" id="sfiNext" disabled>Next page</button>
    </nav>
  </section>

  <section class="sfi__section" id="categories">
    <h2 class="sfi__title">Browse by category</h2>
    <div class="sfi__grid" id="catGrid"></div>
  </section>

  <section class="sfi__section" id="about">
    <details class="sfi-search-help"><summary>Understanding specifications &amp; document status</summary><p>Each SFI number identifies a type of racing equipment. Only verified current documents have a PDF action. Confirm product-specific recertification requirements with the manufacturer.</p><a href="{{ '/' | relative_url }}">About SFI Foundation &rarr;</a></details>
  </section>


</div><!-- /publicView -->

  <section class="sfi__section sfi__hidden" id="adminView">
    <div class="sfi__row" style="justify-content:space-between;align-items:center;">
      <h2 class="sfi__title">Manage SFI specifications</h2>
      <button type="button" class="sfi__btn" id="viewPublicBtn">View as public</button>
    </div>

    <div class="sfi__filters" id="adminTabs" role="tablist" aria-label="Admin sections">
      <button type="button" class="sfi__chip active" role="tab" id="tabBtn-manage" aria-controls="panel-manage" aria-selected="true" data-tab="manage">Manage</button>
      <button type="button" class="sfi__chip" role="tab" id="tabBtn-explore" aria-controls="panel-explore" aria-selected="false" data-tab="explore">Explore</button>
    </div>
    <div id="adminMsg" class="sfi__message" role="status" aria-live="polite"></div>

    <div id="panel-manage" role="tabpanel" aria-labelledby="tabBtn-manage">
      <div class="sfi__stats" id="adminStats"></div>

      <div class="sfi__form-panel">
        <h3 id="formTitle">Add new specification</h3>
        <input type="hidden" id="editId">
        <div class="sfi__form-grid">
          <input class="sfi__field" id="fProduct" placeholder="Product name *" aria-label="Product name">
          <input class="sfi__field" id="fSpecNum" placeholder="Spec number (e.g. 3.3) *" aria-label="Spec number">
          <input class="sfi__field" id="fCategory" placeholder="Category *" aria-label="Category">
          <input class="sfi__field" id="fSubcategory" placeholder="Subcategory" aria-label="Subcategory">
          <input class="sfi__field" id="fEffDate" placeholder="Current revision date" aria-label="Current revision date">
          <input class="sfi__field" id="fSpecPdf" placeholder="Spec PDF filename" aria-label="Spec PDF filename">
          <input class="sfi__field" id="fMfrPdf" placeholder="Manufacturer PDF" aria-label="Manufacturer PDF">
          <input class="sfi__field" id="fProdPdf" placeholder="Products PDF" aria-label="Products PDF">
        </div>
        <div class="sfi__row">
          <button type="button" class="sfi__btn primary" id="saveBtn">Save spec</button>
          <button type="button" class="sfi__btn sfi__hidden" id="cancelBtn">Cancel</button>
        </div>
      </div>

      <h3 class="sfi__subtitle">Canonical specifications</h3>
      <p>Archive hides the complete canonical identity. Historical rows and related records are retained.</p>
      <label><input type="checkbox" id="showArchived"> Show archived specifications</label>
      <input type="search" class="sfi__field" id="adminFilter" placeholder="Search specs (typos are OK)" aria-label="Search specifications">
      <div id="adminHint" class="sfi__hint"></div>
      <div class="sfi__filters" id="adminChips"></div>
      <div class="sfi__count" id="adminCount"></div>
      <div class="sfi__table-scroll">
        <table class="sfi__table" id="adminTable">
          <thead>
            <tr>
              <th>ID</th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="spec_number">Spec #</button></th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="product_name">Product</button></th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="category">Category</button></th>
              <th aria-sort="none"><button type="button" class="sfi__sort" data-sort="revision_date">Current revision</button></th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="adminTableBody"></tbody>
        </table>
      </div>
    </div>

    <div id="panel-explore" class="sfi__hidden" role="tabpanel" aria-labelledby="tabBtn-explore">
      <div id="exploreSlot"></div>
    </div>
  </section>

</div>

<style>
.sfi__sort { background: none; border: 0; padding: 0; color: inherit; font: inherit; font-weight: inherit; cursor: pointer; }
.sfi__sort::after { content: ' \2195'; opacity: .4; }
th[aria-sort="ascending"] .sfi__sort::after { content: ' \25B2'; opacity: 1; }
th[aria-sort="descending"] .sfi__sort::after { content: ' \25BC'; opacity: 1; }
</style>

<script src="{{ '/assets/js/sfi/spec-search.js' | relative_url }}"></script>
<script>
// ── API Configuration ────────────────────────────
const API_BASE = window.SFI_API_BASE;
const API = API_BASE + "/api/sfi";

// ═══════════════ FUZZY SEARCH ENGINE ═══════════════

// Levenshtein distance between two strings
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Score how well a query word matches a target word (0 = no match, 1 = perfect)
function wordScore(query, target) {
  if (target.includes(query)) return 1;
  if (query.length <= 1) return 0;
  // Prefix match bonus
  if (target.startsWith(query.slice(0, Math.max(2, query.length - 1)))) return 0.85;
  const dist = levenshtein(query, target);
  const maxLen = Math.max(query.length, target.length);
  const similarity = 1 - dist / maxLen;
  // Allow up to ~30% character errors
  return similarity >= 0.65 ? similarity : 0;
}

// Score how well a query matches a spec's searchable text
function fuzzyMatch(query, spec) {
  const hay = `${spec.product_name} ${spec.spec_number} ${spec.category} ${spec.subcategory || ''}`.toLowerCase();
  const hayWords = hay.split(/[\s,\-\/&()]+/).filter(Boolean);
  const qWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!qWords.length) return 1; // empty query matches all

  let totalScore = 0;
  for (const qw of qWords) {
    // Exact substring match in full haystack
    if (hay.includes(qw)) { totalScore += 1; continue; }
    // Best fuzzy word match
    let best = 0;
    for (const hw of hayWords) {
      const s = wordScore(qw, hw);
      if (s > best) best = s;
    }
    totalScore += best;
  }
  return totalScore / qWords.length;
}

// Build a vocabulary of known words from specs for "did you mean" suggestions
let knownWords = [];
function buildVocabulary() {
  const wordSet = new Set();
  specs.forEach(s => {
    `${s.product_name} ${s.category} ${s.subcategory || ''}`
      .toLowerCase()
      .split(/[\s,\-\/&()]+/)
      .filter(w => w.length > 2)
      .forEach(w => wordSet.add(w));
  });
  knownWords = [...wordSet];
}

// Find the best correction for a query word
function correctWord(word) {
  if (word.length <= 2) return null;
  let bestWord = null, bestDist = Infinity;
  for (const kw of knownWords) {
    if (kw.includes(word) || word.includes(kw)) return null; // already matches
    const d = levenshtein(word, kw);
    const threshold = word.length <= 4 ? 1 : Math.ceil(word.length * 0.35);
    if (d <= threshold && d < bestDist) {
      bestDist = d;
      bestWord = kw;
    }
  }
  return bestWord;
}

// Build a "did you mean" suggestion from the query
function getSuggestion(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  let changed = false;
  const corrected = words.map(w => {
    const fix = correctWord(w);
    if (fix && fix !== w) { changed = true; return fix; }
    return w;
  });
  return changed ? corrected.join(' ') : null;
}

// ═══════════════ SPEC SEARCH ═══════════════
let specs = [];
const specSearch = window.SFISpecSearch.mount({ api: API, onCatalog(items) { specs = items; buildVocabulary(); } });
function loadSpecs() { return specSearch.load(); }
function filterByCategory(category) { return specSearch.setCategory(category); }

// ═══════════════ ADMIN PANEL ═══════════════
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

let adminSpecs = [];
let isAdminUser = false;
let adminCategory = 'all';
let adminSort = { key: null, dir: 1 };

// Public sections that the admin view shows inside its tabs. They are moved
// (not cloned) so their element IDs and event handlers keep working.
const SECTION_SLOTS = { categories: 'exploreSlot', about: 'exploreSlot' };
const sectionMarkers = {};

function moveSections(toAdmin) {
  Object.keys(SECTION_SLOTS).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (toAdmin) {
      if (!sectionMarkers[id]) {
        sectionMarkers[id] = document.createComment(id);
        el.parentNode.insertBefore(sectionMarkers[id], el);
      }
      document.getElementById(SECTION_SLOTS[id]).appendChild(el);
    } else if (sectionMarkers[id] && sectionMarkers[id].parentNode) {
      sectionMarkers[id].parentNode.insertBefore(el, sectionMarkers[id].nextSibling);
    }
  });
}

function setAdminTab(name) {
  if (!['manage', 'explore'].includes(name)) name = 'manage';
  ['manage', 'explore'].forEach(t => {
    document.getElementById(`panel-${t}`).classList.toggle('sfi__hidden', t !== name);
    const btn = document.getElementById(`tabBtn-${t}`);
    btn.classList.toggle('active', t === name);
    btn.setAttribute('aria-selected', String(t === name));
  });
  try { sessionStorage.setItem('sfiAdminTab', name); } catch (e) {}
}

function setView(view) {
  const admin = view === 'admin';
  moveSections(admin);
  document.getElementById('adminView').classList.toggle('sfi__hidden', !admin);
  document.getElementById('publicView').classList.toggle('sfi__hidden', admin);
  document.getElementById('backToAdminBar').classList.toggle('sfi__hidden', admin || !isAdminUser);
  if (admin) {
    let tab = 'manage';
    try { tab = sessionStorage.getItem('sfiAdminTab') || 'manage'; } catch (e) {}
    setAdminTab(tab);
  }
  try { sessionStorage.setItem('sfiSpecsView', view); } catch (e) {}
}

document.getElementById('viewPublicBtn').addEventListener('click', () => setView('public'));
document.getElementById('backToAdminBtn').addEventListener('click', () => setView('admin'));
document.getElementById('adminTabs').addEventListener('click', e => {
  const btn = e.target.closest('[data-tab]');
  if (btn) setAdminTab(btn.dataset.tab);
});
// "Search the full database" link in the showcase points at the public search
document.getElementById('exploreSlot').addEventListener('click', e => {
  const link = e.target.closest('a[href="#search"]');
  if (link) { e.preventDefault(); setAdminTab('manage'); }
});

function showMsg(text, type) {
  const el = document.getElementById('adminMsg');
  el.textContent = text;
  el.className = `sfi__message ${type}`;
  setTimeout(() => { el.className = 'sfi__message'; }, 4000);
}

async function loadAdminStats() {
  try {
    const response = await fetch(`${API}/stats`);
    if (!response.ok) return;
    const d = await response.json();
    document.getElementById('adminStats').innerHTML = `
      <div class="sfi__stat"><div class="sfi__stat-value">${d.total_specs}</div><div class="sfi__stat-label">Total specs</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value">${d.total_categories}</div><div class="sfi__stat-label">Categories</div></div>
      <div class="sfi__stat"><div class="sfi__stat-value">${d.total_subcategories}</div><div class="sfi__stat-label">Subcategories</div></div>`;
  } catch (e) {}
}

function adminPdfLinks(s) {
  const url = window.SFISpecSearch.verifiedUrl(s);
  return url ? `<a class="sfi__link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">View specification</a>` : 'Current PDF unavailable';
}

function adminSortValue(s, key) {
  if (key === 'revision_date') return Date.parse(s.revision_date) || 0;
  return String(s[key] || '');
}

function renderAdminChips() {
  const cats = [...new Set(adminSpecs.flatMap(s => s.categories || [s.category]))].sort();
  if (adminCategory !== 'all' && !cats.includes(adminCategory)) adminCategory = 'all';
  document.getElementById('adminChips').innerHTML = ['all', ...cats].map(c =>
    `<button type="button" class="sfi__chip${c === adminCategory ? ' active' : ''}" data-category="${esc(c)}">${c === 'all' ? 'All' : esc(c)}</button>`).join('');
}

function renderAdminTable() {
  const q = document.getElementById('adminFilter').value.trim();
  const hintEl = document.getElementById('adminHint');
  let rows = adminCategory === 'all' ? adminSpecs : adminSpecs.filter(s => (s.categories || [s.category]).includes(adminCategory));

  let relevance = false;
  if (q) {
    rows = rows.map(s => ({ s, score: fuzzyMatch(q, s) })).filter(x => x.score >= 0.55)
      .sort((a, b) => b.score - a.score).map(x => x.s);
    relevance = true;
    const suggestion = getSuggestion(q);
    if (suggestion && rows.length < 5) {
      hintEl.innerHTML = `Did you mean: <strong style="cursor:pointer" data-suggest="${esc(suggestion)}">${esc(suggestion)}</strong>?`;
      hintEl.className = 'sfi__hint visible';
    } else { hintEl.className = 'sfi__hint'; }
  } else { hintEl.className = 'sfi__hint'; }

  if (adminSort.key) {
    const k = adminSort.key;
    rows = [...rows].sort((a, b) => {
      const x = adminSortValue(a, k), y = adminSortValue(b, k);
      const c = typeof x === 'number' ? x - y : x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' });
      return c * adminSort.dir;
    });
  }
  document.querySelectorAll('#adminTable th[aria-sort]').forEach(th => {
    const key = th.querySelector('[data-sort]').dataset.sort;
    th.setAttribute('aria-sort', adminSort.key === key ? (adminSort.dir === 1 ? 'ascending' : 'descending') : 'none');
  });

  document.getElementById('adminChips').querySelectorAll('.sfi__chip').forEach(b =>
    b.classList.toggle('active', b.dataset.category === adminCategory));
  document.getElementById('adminCount').textContent = `Showing ${rows.length} of ${adminSpecs.length} specs`;
  document.getElementById('adminTableBody').innerHTML = rows.length ? rows.map(s => `
      <tr>
        <td>${s.id}</td>
        <td class="num">SFI ${esc(s.spec_number)}</td>
        <td>${esc(s.product_name)}</td>
        <td><span class="sfi__badge info">${esc(s.category)}</span></td>
        <td>${esc(s.revision_date) || '\u2014'}</td>
        <td>${adminPdfLinks(s)}</td>
        <td>
          <button type="button" class="sfi__btn small" onclick="editSpec(${s.id})">Edit</button>
          <button type="button" class="sfi__btn small danger" onclick="deleteSpec(${s.id})">${s.archived ? 'Restore' : 'Archive'}</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="7">No specs match.</td></tr>';
}

async function loadAdminTable() {
  try {
    const archived = document.getElementById('showArchived').checked;
    const res = await fetch(`${API}/specs${archived ? '/archived' : ''}`, { credentials: 'include' });
    adminSpecs = await res.json();
    renderAdminChips();
    renderAdminTable();
  } catch (e) {}
}

document.getElementById('showArchived').addEventListener('change', loadAdminTable);
document.getElementById('adminFilter').addEventListener('input', renderAdminTable);
document.getElementById('adminChips').addEventListener('click', e => {
  const chip = e.target.closest('.sfi__chip');
  if (!chip) return;
  adminCategory = chip.dataset.category;
  renderAdminTable();
});
document.getElementById('adminHint').addEventListener('click', e => {
  const sug = e.target.closest('[data-suggest]');
  if (!sug) return;
  document.getElementById('adminFilter').value = sug.dataset.suggest;
  renderAdminTable();
});
document.querySelector('#adminTable thead').addEventListener('click', e => {
  const btn = e.target.closest('[data-sort]');
  if (!btn) return;
  const key = btn.dataset.sort;
  adminSort = adminSort.key === key ? { key, dir: -adminSort.dir } : { key, dir: 1 };
  renderAdminTable();
});

function clearForm() {
  ['editId','fProduct','fSpecNum','fCategory','fSubcategory','fEffDate','fSpecPdf','fMfrPdf','fProdPdf']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('formTitle').textContent = 'Add New Specification';
  document.getElementById('cancelBtn').classList.add('sfi__hidden');
}

async function editSpec(id) {
  try {
    const res = await fetch(`${API}/specs/${id}`);
    const s = await res.json();
    document.getElementById('editId').value = s.id;
    document.getElementById('fProduct').value = s.product_name;
    document.getElementById('fSpecNum').value = s.spec_number;
    document.getElementById('fCategory').value = s.category;
    document.getElementById('fSubcategory').value = s.subcategory || '';
    document.getElementById('fEffDate').value = s.revision_date || '';
    document.getElementById('fSpecPdf').value = s.spec_pdf || '';
    document.getElementById('fMfrPdf').value = s.manufacturer_pdf || '';
    document.getElementById('fProdPdf').value = s.products_pdf || '';
    document.getElementById('formTitle').textContent = `Editing Spec #${s.id}`;
    document.getElementById('cancelBtn').classList.remove('sfi__hidden');
  } catch (e) { showMsg('Failed to load spec', 'error'); }
}

async function deleteSpec(id) {
  const spec = adminSpecs.find(x => x.id === id);
  const label = spec ? `SFI ${spec.spec_number} \u2013 ${spec.product_name}` : 'this spec';
  const restoring = !!spec?.archived;
  if (!confirm(`${restoring ? 'Restore' : 'Archive'} canonical ${label}? This affects all ${spec?.legacy_ids?.length || 1} associated rows; history and related records are retained.`)) return;
  try {
    const res = await fetch(`${API}/specs/${id}${restoring ? '/restore' : ''}`, { method: restoring ? 'POST' : 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm_canonical_id: spec.canonical_id }) });
    if (res.ok) { showMsg(restoring ? 'Canonical specification restored' : 'Canonical specification archived', 'success'); loadAdminTable(); loadAdminStats(); loadSpecs(); }
    else { showMsg('Canonical operation failed; reload and retry', 'error'); }
  } catch (e) { showMsg('Error connecting to API', 'error'); }
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  const body = {
    product_name: document.getElementById('fProduct').value.trim(),
    spec_number: document.getElementById('fSpecNum').value.trim(),
    category: document.getElementById('fCategory').value.trim(),
    subcategory: document.getElementById('fSubcategory').value.trim(),
    revision_date: document.getElementById('fEffDate').value.trim(),
    spec_pdf: document.getElementById('fSpecPdf').value.trim(),
    manufacturer_pdf: document.getElementById('fMfrPdf').value.trim(),
    products_pdf: document.getElementById('fProdPdf').value.trim(),
  };
  if (!body.product_name || !body.spec_number || !body.category) {
    showMsg('Product name, spec number, and category are required', 'error');
    return;
  }
  const editId = document.getElementById('editId').value;
  try {
    let res;
    if (editId) {
      res = await fetch(`${API}/specs/${editId}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      res = await fetch(`${API}/specs`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (res.ok) { showMsg(editId ? 'Spec updated' : 'Spec created', 'success'); clearForm(); loadAdminTable(); loadAdminStats(); loadSpecs(); }
    else { const err = await res.json(); showMsg(err.error || 'Save failed', 'error'); }
  } catch (e) { showMsg('Error connecting to API', 'error'); }
});

document.getElementById('cancelBtn').addEventListener('click', clearForm);

// Only admins get the manage view. The backend enforces this too (401/403);
// hiding is just UX.
async function revealAdminPanel() {
  try {
    const res = await fetch(`${API}/me`, { credentials: 'include' });
    if (!res.ok) return;
    const me = await res.json();
    if (me.isAdmin || me.role === 'Admin') {
      isAdminUser = true;
      let view = 'admin';
      try { view = sessionStorage.getItem('sfiSpecsView') || 'admin'; } catch (e) {}
      loadAdminStats();
      loadAdminTable();
      setView(view === 'public' ? 'public' : 'admin');
    }
  } catch (e) {}
}

// ═══════════════ INIT ═══════════════
revealAdminPanel();
loadSpecs();
</script>
