// ════════════════════════════════════════════════════
// Quiz Data – Gear Management & Business Logic
// Gear is loaded from /api/sfi/gear for the signed-in user.
// Falls back to localStorage if the user isn't authenticated
// (so the UI still works, just isn't centrally tracked).
// ════════════════════════════════════════════════════

const QuizData = (() => {
  const API_BASE = window.SFI_API_BASE;

  const CERT_LIFE_YEARS = 5;
  const WARN_DAYS = 90;
  const STORAGE_KEY = 'sfiMyGear';

  const CATEGORY_ICONS = {
    'Auto Racing': '\u{1F3CE}\u{FE0F}',
    'Drag Racing': '\u{1F3C1}',
    'Boat Racing': '\u{1F6A4}',
    'Personal Protective Gear, Restraints & Nets': '\u{1F6E1}\u{FE0F}',
    'Chassis': '\u{1F527}',
    'Fuel Related': '\u26FD',
    'Tractor Pulling': '\u{1F69C}',
  };

  let gear = [];
  let allSpecs = [];
  let authed = false;
  let remoteMode = false;
  let loadError = '';

  // ── Specs autocomplete ────────────────────────────
  function fetchSpecs() {
    return fetch(API_BASE + '/api/sfi/specs')
      .then(r => r.json())
      .then(data => { allSpecs = data; })
      .catch(() => {});
  }

  function getSpecs() { return allSpecs; }
  function getGear() { return gear; }
  function isAuthed() { return authed; }
  function isRemote() { return remoteMode; }
  function getLoadError() { return loadError; }
  function getCategoryIcon(category) {
    return category ? (CATEGORY_ICONS[category] || '\u{1F4CB}') : '\u{1F6E1}\u{FE0F}';
  }

  // ── Remote gear sync ──────────────────────────────
  async function loadGear() {
    loadError = '';
    try {
      const res = await fetch(API_BASE + '/api/sfi/gear', { credentials: 'include', cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        authed = false;
        remoteMode = false;
        gear = loadLocal();
        return gear;
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const items = await res.json();
      authed = true;
      remoteMode = true;
      if (!Array.isArray(items)) throw new Error('Invalid gear response');
      gear = items.map(normalize);
      return gear;
    } catch (err) {
      console.warn('gear API unreachable — using local cache:', err);
      remoteMode = false;
      authed = false;
      loadError = 'Could not sync with the server. Showing only gear saved on this device.';
      gear = loadLocal();
      return gear;
    }
  }

  function normalize(item) {
    return {
      id: item.id,
      name: item.name || '',
      spec: item.spec || 'Unknown',
      certDate: item.certDate || null,
      category: item.category || null,
      productName: item.productName || null,
      source: item.source || 'manual',
      status: ['pending', 'approved', 'rejected'].includes(item.status) ? item.status : null,
      reviewerId: item.reviewer_id ?? item.reviewerId ?? null,
      reviewedAt: item.reviewed_at ?? item.reviewedAt ?? null,
      reviewNote: item.reviewer_notes ?? item.reviewNote ?? '',
      userId: item.userId || null,
      ownerUid: item.owner ? item.owner.uid : null,
    };
  }

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(normalize); }
    catch { return []; }
  }

  function saveLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(gear)); } catch {}
  }

  async function addItem(name, spec, certDate, specData) {
    const payload = {
      name,
      spec: spec || 'Unknown',
      certDate: certDate || '',
      category: specData ? specData.category : '',
      productName: specData ? specData.product_name : '',
      source: 'manual',
    };

    if (remoteMode) {
      // Never mix server records into a shared device-only cache on failure.
      const res = await fetch(API_BASE + '/api/sfi/gear', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        const item = normalize(await res.json());
        gear = [item, ...gear];
        return item;
      }
      if (res.status === 401 || res.status === 403) {
        await loadGear();
        throw new Error('Your session changed. The item was not added; sign in again or retry in device-only mode.');
      }
      throw new Error('The server could not save this item. Your entry has been kept; please retry.');
    }

    // Local fallback
    const localItem = normalize({
      id: Date.now(),
      name: payload.name,
      spec: payload.spec,
      certDate: payload.certDate,
      category: payload.category,
      productName: payload.productName,
      source: payload.source,
    });
    gear = [localItem, ...gear];
    saveLocal();
    return localItem;
  }

  async function removeItem(id) {
    if (remoteMode) {
      const res = await fetch(API_BASE + '/api/sfi/gear/' + encodeURIComponent(id), {
        method: 'DELETE', credentials: 'include',
      });
      if (res.ok || res.status === 404) {
        gear = gear.filter(g => g.id !== id);
        return true;
      }
      if (res.status === 401 || res.status === 403) await loadGear();
      throw new Error('The item could not be removed from the server. Please retry after signing in.');
    }

    gear = gear.filter(g => g.id !== id);
    saveLocal();
    return true;
  }

  // ── Derived state ─────────────────────────────────
  function getReviewStatus(item) {
    if (!remoteMode) return null;
    const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
    return { status: item.status, label: labels[item.status] || 'Review unavailable',
      color: item.status === 'approved' ? 'good' : item.status === 'rejected' ? 'bad' : 'warn' };
  }

  // Calendar-day reminders are independent of staff review decisions.
  // The inherited five-year interval is an estimate, not a certification rule.
  function getStatus(item, now = new Date()) {
    if (!item.certDate) {
      return { status: 'unknown', label: 'No Date', days: null, color: 'warn' };
    }

    const cert = new Date(item.certDate + 'T00:00:00Z');
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.certDate) || !Number.isFinite(cert.getTime()) ||
        cert.toISOString().slice(0, 10) !== item.certDate || cert.getTime() > today) {
      return { status: 'unknown', label: 'Check cert date', days: null, color: 'warn' };
    }
    const year = cert.getUTCFullYear() + CERT_LIFE_YEARS;
    const month = cert.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const expiry = Date.UTC(year, month, Math.min(cert.getUTCDate(), lastDay));
    const daysLeft = (expiry - today) / (1000 * 60 * 60 * 24);

    if (daysLeft < 0) return { status: 'expired', label: 'Expired', days: daysLeft, color: 'expired' };
    if (daysLeft < WARN_DAYS) return { status: 'expiring', label: daysLeft === 0 ? 'Expires today' : 'Expiring soon', days: daysLeft, color: 'warn' };
    return { status: 'current', label: 'Current', days: daysLeft, color: 'good' };
  }

  function calcSafetyScore() {
    if (!gear.length) return { score: 0, current: 0, expiring: 0, expired: 0, noDate: 0, pending: 0, rejected: 0 };
    let current = 0, expiring = 0, expired = 0, noDate = 0, pending = 0, rejected = 0;
    gear.forEach(g => {
      const s = getStatus(g);
      if (s.status === 'current') current++;
      else if (s.status === 'expiring') expiring++;
      else if (s.status === 'expired') expired++;
      else noDate++;
      const review = getReviewStatus(g);
      if (review?.status === 'pending') pending++;
      if (review?.status === 'rejected') rejected++;
    });
    const denom = Math.max(gear.length, 1) * 100;
    const score = Math.round(((current * 100 + expiring * 50 + noDate * 25) / denom) * 100);
    return { score, current, expiring, expired, noDate, pending, rejected };
  }

  function sortGear(mode) {
    const sorted = [...gear];
    if (mode === 'urgency') {
      sorted.sort((a, b) => {
        const sa = getStatus(a), sb = getStatus(b);
        const pri = { expired: 0, expiring: 1, unknown: 2, current: 3 };
        if (pri[sa.status] !== pri[sb.status]) return (pri[sa.status] ?? 9) - (pri[sb.status] ?? 9);
        return (sa.days ?? Infinity) - (sb.days ?? Infinity);
      });
    } else if (mode === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => (a.certDate || '').localeCompare(b.certDate || ''));
    }
    return sorted;
  }

  return {
    fetchSpecs, getSpecs, getGear, getCategoryIcon,
    loadGear, addItem, removeItem,
    getStatus, getReviewStatus, calcSafetyScore, sortGear,
    isAuthed, isRemote, getLoadError,
  };
})();
