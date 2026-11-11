/* Public search uses the existing Flask catalog, including its ranking and counts. */
(function (root) {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function verifiedUrl(item) {
    try {
      const url = new URL(item.view_spec_url);
      return item.document_status === 'verified_current' && url.protocol === 'https:' &&
        ['sfifoundation.com', 'www.sfifoundation.com'].includes(url.hostname) &&
        !url.username && !url.password && (!url.port || url.port === '443') &&
        url.pathname.startsWith('/wp-content/') && url.pathname.toLowerCase().endsWith('.pdf') ? url.href : null;
    } catch { return null; }
  }
  function card(item) {
    const url = verifiedUrl(item);
    const status = { not_checked: 'Not checked', verified_current: 'Verified current', rejected: 'Rejected or mismatched', temporarily_unavailable: 'Temporarily unavailable', needs_review: 'Needs manual review' }[item.document_status] || 'Needs manual review';
    const rules = (item.recertification_rules || []).map(r => `<li>${escape(r.product)}: ${escape(r.period || 'Not provided')}</li>`).join('');
    return `<article class="sfi__result sfi__spec-card" aria-label="SFI ${escape(item.spec_number)}">
      <div class="sfi__result-body"><h3 class="sfi__result-title">SFI ${escape(item.spec_number)} — ${escape(item.product_name)}</h3>
      ${item.description && item.description !== item.product_name ? `<p>${escape(item.description)}</p>` : ''}
      <p>${(item.categories || [item.category]).map(c => `<span class="sfi__badge info">${escape(c)}</span>`).join(' ')}</p>
      <p>Current revision: ${escape(item.revision_date || 'Not verified')}</p>
      ${rules ? `<details><summary>Product recertification information</summary><ul>${rules}</ul><p>Manufacturer retesting is a separate requirement. Confirm product-specific rules with the manufacturer.</p></details>` : '<p>Recertification information not provided.</p>'}
      <p>PDF status: <strong>${escape(status)}</strong></p>
      ${url ? `<a class="sfi__link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">View specification (PDF, opens in new tab)</a>` : `<p>Current PDF unavailable for review${item.local_document_available ? ' — a local document is retained privately' : ''}.</p>`}
      ${(item.warnings || []).length ? '<p>Source review pending. Consult the official specification before use.</p>' : ''}
      </div></article>`;
  }
  function mount({ api, document: doc = root.document, fetch: get = root.fetch.bind(root), onCatalog = () => {} }) {
    const el = id => doc.getElementById(id);
    let category = 'all', page = 1, total = 0, requestId = 0, timer;
    const limit = 20;
    function setCategory(next) {
      clearTimeout(timer); category = next; page = 1;
      for (const b of el('sfiFilters').querySelectorAll('button')) {
        const active = b.dataset.category === category;
        b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));
      }
      return load();
    }
    async function json(path) {
      const response = await get(`${api}${path}`);
      if (!response.ok) throw new Error(`Catalog request failed (${response.status}). Please retry.`);
      return response.json();
    }
    async function filters() {
      try {
        const [cats, stats] = await Promise.all([json('/categories'), json('/stats')]);
        el('sfiFilters').replaceChildren();
        for (const c of ['all', ...cats]) {
          const button = doc.createElement('button'); button.type = 'button';
          button.className = 'sfi__chip'; button.dataset.category = c; button.textContent = c === 'all' ? 'All' : c;
          button.setAttribute('aria-pressed', String(c === category)); button.classList.toggle('active', c === category);
          el('sfiFilters').append(button);
        }
        el('catGrid').replaceChildren();
        for (const [cat, count] of Object.entries(stats.by_category || {})) {
          const b = doc.createElement('button'); b.type = 'button'; b.className = 'sfi__category';
          b.textContent = `${cat}: ${count} specifications`; b.addEventListener('click', () => { setCategory(cat); el('sfiSearch').focus(); });
          el('catGrid').append(b);
        }
      } catch { /* Search request presents the actionable error. */ }
    }
    async function load() {
      clearTimeout(timer);
      const id = ++requestId;
      const requestedPage = page;
      const query = el('sfiSearch').value.trim().replace(/\s+/g, ' ');
      el('sfiCount').textContent = 'Loading specifications…'; el('sfiResults').setAttribute('aria-busy', 'true');
      el('sfiResults').replaceChildren(); el('sfiNoResults').hidden = true; el('sfiRetry').hidden = true;
      const params = new URLSearchParams({ format: 'page', page, limit, category });
      if (query) params.set('q', query);
      try {
        const data = await json(`/specs${query ? '/search' : ''}?${params}`);
        if (id !== requestId) return;
        if (!Array.isArray(data.items) || !Number.isInteger(data.total)) throw new Error('Unexpected catalog response.');
        // Defensive identity check, while server owns category and revision aggregation.
        const items = [...new Map(data.items.map(item => [item.canonical_id || item.spec_number, item])).values()];
        total = data.total; onCatalog(items);
        el('sfiResults').innerHTML = items.map(card).join('');
        el('sfiCount').textContent = total ? `Showing ${(requestedPage - 1) * limit + 1}–${(requestedPage - 1) * limit + items.length} of ${total} specifications` : '0 specifications';
        el('sfiNoResults').textContent = 'No specifications match. Try a number or product name, or select All.';
        el('sfiNoResults').hidden = !!items.length;
      } catch (error) {
        if (id !== requestId) return;
        total = 0; el('sfiCount').textContent = 'Specifications could not be loaded.';
        el('sfiNoResults').textContent = error.message; el('sfiNoResults').hidden = false; el('sfiRetry').hidden = false;
      } finally {
        if (id === requestId) {
          el('sfiResults').setAttribute('aria-busy', 'false');
          el('sfiPrevious').disabled = page <= 1; el('sfiNext').disabled = page * limit >= total;
        }
      }
    }
    el('sfiSearchForm').addEventListener('submit', e => { e.preventDefault(); clearTimeout(timer); page = 1; load(); });
    el('sfiSearch').addEventListener('input', () => {
      clearTimeout(timer); ++requestId; page = 1; total = 0;
      el('sfiPrevious').disabled = true; el('sfiNext').disabled = true;
      el('sfiResults').replaceChildren(); el('sfiResults').setAttribute('aria-busy', 'true');
      el('sfiCount').textContent = 'Waiting for search…';
      el('sfiNoResults').hidden = true; el('sfiRetry').hidden = true;
      timer = setTimeout(load, 250);
    });
    el('sfiClear').addEventListener('click', () => { clearTimeout(timer); el('sfiSearch').value = ''; page = 1; el('sfiSearch').focus(); load(); });
    el('sfiFilters').addEventListener('click', e => { const b = e.target.closest('[data-category]'); if (b) setCategory(b.dataset.category); });
    el('sfiRetry').addEventListener('click', () => { filters(); load(); });
    el('sfiPrevious').addEventListener('click', () => { if (page > 1) { page--; load(); } });
    el('sfiNext').addEventListener('click', () => { if (page * limit < total) { page++; load(); } });
    let saved;
    try { saved = root.localStorage?.getItem('sfiCat'); root.localStorage?.removeItem('sfiCat'); } catch {}
    if (saved) category = saved;
    filters();
    return { load, setCategory };
  }
  root.SFISpecSearch = { mount, card, verifiedUrl };
})(typeof window === 'undefined' ? globalThis : window);
