/* Public search uses the existing Flask catalog, including its ranking and counts. */
(function (root) {
  "use strict";
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function verifiedUrl(item) {
    try {
      const url = new URL(item.view_spec_url);
      return item.document_status === "verified_current" &&
        url.protocol === "https:" &&
        ["sfifoundation.com", "www.sfifoundation.com"].includes(url.hostname) &&
        !url.username &&
        !url.password &&
        (!url.port || url.port === "443") &&
        url.pathname.startsWith("/wp-content/") &&
        url.pathname.toLowerCase().endsWith(".pdf")
        ? url.href
        : null;
    } catch {
      return null;
    }
  }
  function card(item, preferences = {}) {
    const url = verifiedUrl(item);
    const status =
      {
        not_checked: "Not checked",
        verified_current: "Verified current",
        rejected: "Rejected or mismatched",
        temporarily_unavailable: "Temporarily unavailable",
        needs_review: "Needs manual review",
      }[item.document_status] || "Needs manual review";
    const rules = (item.recertification_rules || [])
      .map(
        (r) =>
          `<li>${escape(r.product)}: ${escape(r.period || "Not provided")}</li>`,
      )
      .join("");
    return `<article class="sfi__result sfi__spec-card" aria-label="SFI ${escape(item.spec_number)}">
      <div class="sfi__result-body"><h3 class="sfi__result-title">SFI ${escape(item.spec_number)} — ${escape(item.product_name)}</h3>
      <p class="sfi__result-categories">${(item.categories || [item.category]).map((c) => `<span class="sfi__badge info">${escape(c)}</span>`).join(" ")}</p>
      <div class="sfi__document-action"><span class="sfi__document-status ${url ? "verified" : ""}"${preferences.pdfIndicators === false ? " hidden" : ""}>PDF status: <strong>${escape(status)}</strong></span>
      ${url ? `<a class="sfi__link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">View specification (PDF, opens in new tab)</a>` : '<span class="sfi__muted">Current PDF unavailable for review.</span>'}</div>
      <details${preferences.showMetadata === false ? " hidden" : ""}><summary>Revision &amp; recertification details</summary>
        <p><span data-i18n="Current revision">Current revision</span>: ${escape(item.revision_date || "Not verified")}</p>
        ${item.description && item.description !== item.product_name ? `<p data-no-translate>${escape(item.description)}</p>` : ""}
        ${rules ? `<ul data-no-translate>${rules}</ul><p>Manufacturer retesting is a separate requirement. Confirm product-specific rules with the manufacturer.</p>` : "<p>Recertification information not provided.</p>"}
        ${(item.warnings || []).length ? "<p>Source review pending. Consult the official specification before use.</p>" : ""}
      </details>
      </div></article>`;
  }
  function mount({
    api,
    document: doc = root.document,
    fetch: get = root.fetch.bind(root),
    onCatalog = () => {},
  }) {
    const el = (id) => doc.getElementById(id);
    let category = "all",
      page = 1,
      total = 0,
      requestId = 0,
      timer;
    const prefs = () => root.SFIPreferences?.get() || { resultsPerPage: 20, showMetadata: true, pdfIndicators: true, highlightMatches: false };
    const t = (key, values) => root.SFII18n?.t(key, values) || key.replace(/{{(\w+)}}/g, (_, name) => values?.[name] ?? '');
    const number = value => root.SFII18n?.number(value) || String(value);
    let limit = prefs().resultsPerPage, lastItems = [], lastQuery = '', lastPage = 1, hasResults = false;
    function render() {
      el('sfiResults').innerHTML = lastItems.map(item => card(item, prefs())).join('');
      el('sfiCount').textContent = total ? t('Showing {{start}}–{{end}} of {{total}} specifications', {
        start: number((lastPage - 1) * limit + 1), end: number((lastPage - 1) * limit + lastItems.length), total: number(total)
      }) : t('0 specifications');
      if (prefs().highlightMatches && lastQuery) {
        const tokens = [...new Set(lastQuery.toLocaleLowerCase().split(/\s+/))].filter(Boolean).slice(0, 10).sort((a, b) => b.length - a.length);
        for (const title of el('sfiResults').querySelectorAll('.sfi__result-title')) {
          const text = title.textContent, folded = text.toLocaleLowerCase();
          const fragment = doc.createDocumentFragment(); let offset = 0;
          while (offset < text.length) {
            let start = text.length, match = '';
            for (const token of tokens) { const index = folded.indexOf(token, offset); if (index !== -1 && index < start) { start = index; match = token; } }
            fragment.append(doc.createTextNode(text.slice(offset, start)));
            if (!match) break;
            const mark = doc.createElement('mark'); mark.textContent = text.slice(start, start + match.length); fragment.append(mark);
            offset = start + match.length;
          }
          title.replaceChildren(fragment);
        }
      }
    }
    root.addEventListener?.('sfi-preferences', () => {
      if (limit !== prefs().resultsPerPage) { limit = prefs().resultsPerPage; page = 1; load(); }
      else if (hasResults && el('sfiResults').getAttribute('aria-busy') !== 'true') render();
    });
    root.addEventListener?.('sfi-language', () => {
      if (el('sfiSelectedCategory')) el('sfiSelectedCategory').textContent = category === 'all' ? t('All categories') : category;
      const all = el('sfiFilters').querySelector('[data-category="all"]');
      if (all) all.textContent = t('All');
      el('catGrid').querySelectorAll('[data-count]').forEach(meta => { meta.textContent = t('{{count}} specifications', { count: number(Number(meta.dataset.count)) }); });
      if (hasResults && el('sfiResults').getAttribute('aria-busy') !== 'true') render();
    });
    function setCategory(next) {
      clearTimeout(timer);
      category = next;
      root.SFIPreferences?.rememberCategory(next);
      if (el("sfiSelectedCategory"))
        el("sfiSelectedCategory").textContent =
          next === "all" ? t("All categories") : next;
      page = 1;
      for (const b of el("sfiFilters").querySelectorAll("button")) {
        const active = b.dataset.category === category;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      return load();
    }
    async function json(path) {
      const response = await get(`${api}${path}`);
      if (!response.ok)
        throw new Error(
          t("Catalog request failed ({{status}}). Please retry.", { status: response.status }),
        );
      return response.json();
    }
    async function filters() {
      try {
        const [cats, stats] = await Promise.all([
          json("/categories"),
          json("/stats"),
        ]);
        if (category !== 'all' && !cats.includes(category)) {
          category = 'all'; page = 1; root.SFIPreferences?.rememberCategory('all');
          if (el('sfiSelectedCategory')) el('sfiSelectedCategory').textContent = t('All categories');
          load();
        }
        el("sfiFilters").replaceChildren();
        for (const c of ["all", ...cats]) {
          const button = doc.createElement("button");
          button.type = "button";
          button.className = "sfi__chip";
          button.dataset.category = c;
          button.textContent = c === "all" ? t("All") : c;
          button.setAttribute("aria-pressed", String(c === category));
          button.classList.toggle("active", c === category);
          el("sfiFilters").append(button);
        }
        el("catGrid").replaceChildren();
        for (const [cat, count] of Object.entries(stats.by_category || {})) {
          const b = doc.createElement("button");
          b.type = "button";
          b.className = "sfi__category";
          const name = doc.createElement("span");
          name.className = "sfi__category-name";
          name.textContent = cat;
          const meta = doc.createElement("span");
          meta.className = "sfi__category-count";
          meta.dataset.count = count;
          meta.textContent = t("{{count}} specifications", { count: number(count) });
          b.append(name, meta);
          b.addEventListener("click", () => {
            setCategory(cat);
            el("sfiSearch").focus();
          });
          el("catGrid").append(b);
        }
      } catch {
        /* Search request presents the actionable error. */
      }
    }
    async function load() {
      clearTimeout(timer);
      const id = ++requestId;
      const requestedPage = page;
      const query = el("sfiSearch").value.trim().replace(/\s+/g, " ");
      el("sfiPrevious").disabled = true;
      el("sfiNext").disabled = true;
      hasResults = false;
      el("sfiCount").textContent = t("Loading specifications…");
      el("sfiResults").setAttribute("aria-busy", "true");
      el("sfiResults").replaceChildren();
      el("sfiNoResults").hidden = true;
      el("sfiRetry").hidden = true;
      const params = new URLSearchParams({
        format: "page",
        page,
        limit,
        category,
      });
      if (query) params.set("q", query);
      try {
        const data = await json(`/specs${query ? "/search" : ""}?${params}`);
        if (id !== requestId) return;
        if (!Array.isArray(data.items) || !Number.isInteger(data.total))
          throw new Error(t("Unexpected catalog response."));
        // Defensive identity check, while server owns category and revision aggregation.
        const items = [
          ...new Map(
            data.items.map((item) => [
              item.canonical_id || item.spec_number,
              item,
            ]),
          ).values(),
        ];
        total = data.total;
        onCatalog(items);
        lastItems = items; lastQuery = query; lastPage = requestedPage; hasResults = true;
        root.SFIPreferences?.rememberCategory(category);
        render();
        el("sfiNoResults").textContent =
          t("No specifications match. Try a number or product name, or select All.");
        el("sfiNoResults").hidden = !!items.length;
      } catch (error) {
        if (id !== requestId) return;
        total = 0;
        el("sfiCount").textContent = t("Specifications could not be loaded.");
        el("sfiNoResults").textContent = error.message;
        el("sfiNoResults").hidden = false;
        el("sfiRetry").hidden = false;
      } finally {
        if (id === requestId) {
          el("sfiResults").setAttribute("aria-busy", "false");
          el("sfiPrevious").disabled = page <= 1;
          el("sfiNext").disabled = page * limit >= total;
        }
      }
    }
    el("sfiSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(timer);
      page = 1;
      load();
    });
    el("sfiSearch").addEventListener("input", () => {
      clearTimeout(timer);
      ++requestId;
      page = 1;
      total = 0;
      el("sfiPrevious").disabled = true;
      el("sfiNext").disabled = true;
      el("sfiResults").replaceChildren();
      el("sfiResults").setAttribute("aria-busy", "true");
      el("sfiCount").textContent = t("Waiting for search…");
      el("sfiNoResults").hidden = true;
      el("sfiRetry").hidden = true;
      timer = setTimeout(load, 250);
    });
    el("sfiClear").addEventListener("click", () => {
      clearTimeout(timer);
      el("sfiSearch").value = "";
      el("sfiSearch").focus();
      setCategory("all");
    });
    el("sfiFilters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-category]");
      if (b) setCategory(b.dataset.category);
    });
    el("sfiRetry").addEventListener("click", () => {
      filters();
      load();
    });
    async function changePage(next) {
      page = next;
      const loading = load();
      const id = requestId;
      await loading;
      // Keep keyboard and viewport position with the new results, including
      // when the activated pagination button becomes disabled on the last page.
      if (id === requestId) el("sfiCount").focus();
    }
    el("sfiPrevious").addEventListener("click", () => {
      if (page > 1) changePage(page - 1);
    });
    el("sfiNext").addEventListener("click", () => {
      if (page * limit < total) changePage(page + 1);
    });
    let saved;
    try {
      saved = root.localStorage?.getItem("sfiCat");
      root.localStorage?.removeItem("sfiCat");
    } catch {}
    if (saved) category = saved;
    else category = root.SFIPreferences?.readCategory() || 'all';
    // A GET form on the homepage delegates to this canonical search implementation.
    const query = new URLSearchParams(root.location?.search || "").get("q");
    if (query !== null) el("sfiSearch").value = query.slice(0, 200);
    if (
      el("sfiCategoryPanel") &&
      root.matchMedia?.("(max-width: 600px)").matches
    )
      el("sfiCategoryPanel").open = false;
    if (el("sfiSelectedCategory"))
      el("sfiSelectedCategory").textContent =
        category === "all" ? t("All categories") : category;
    filters();
    return { load, setCategory };
  }
  root.SFISpecSearch = { mount, card, verifiedUrl };
})(typeof window === "undefined" ? globalThis : window);
