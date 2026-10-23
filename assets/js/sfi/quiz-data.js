// ════════════════════════════════════════════════════
// Quiz Data – Gear Management & Business Logic
// Gear is loaded from /api/sfi/gear for the signed-in user.
// Falls back to localStorage if the user isn't authenticated
// (so the UI still works, just isn't centrally tracked).
// ════════════════════════════════════════════════════

const QuizData = (() => {
  const API_BASE = window.SFI_API_BASE;

  const CERT_LIFE_YEARS = 5;
  const WARN_DAYS = 180;
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
  function getCategoryIcon(category) {
    return category ? (CATEGORY_ICONS[category] || '\u{1F4CB}') : '\u{1F6E1}\u{FE0F}';
  }

  // ── Remote gear sync ──────────────────────────────
  async function loadGear() {
    try {
      const res = await fetch(API_BASE + '/api/sfi/gear', { credentials: 'include' });
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
      gear = items.map(normalize);
      return gear;
    } catch (err) {
      console.warn('gear API unreachable — using local cache:', err);
      remoteMode = false;
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
      status: item.status || 'approved',           // local items are implicitly approved
      reviewerId: item.reviewerId || null,
      reviewedAt: item.reviewedAt || null,
      reviewNote: item.reviewNote || '',
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
      try {
        const res = await fetch(API_BASE + '/api/sfi/gear', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const item = normalize(await res.json());
          gear = [item, ...gear];
          return item;
        }
        if (res.status === 401 || res.status === 403) {
          remoteMode = false;
          authed = false;
        }
      } catch (err) {
        console.warn('add gear remote failed — saving locally:', err);
      }
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
      status: 'approved',
    });
    gear = [localItem, ...gear];
    saveLocal();
    return localItem;
  }

  async function removeItem(id) {
    if (remoteMode) {
      try {
        const res = await fetch(API_BASE + '/api/sfi/gear/' + encodeURIComponent(id), {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok || res.status === 404) {
          gear = gear.filter(g => g.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('remove gear remote failed — updating locally:', err);
      }
    }

    gear = gear.filter(g => g.id !== id);
    saveLocal();
    return true;
  }

  // ── Derived state ─────────────────────────────────
  function getStatus(item) {
    if (item.status === 'rejected') {
      return { status: 'rejected', label: 'Rejected', days: null, color: 'expired' };
    }
    if (item.status === 'pending') {
      return { status: 'pending', label: 'Pending review', days: null, color: 'warn' };
    }
    if (!item.certDate) {
      return { status: 'unknown', label: 'No Date', days: null, color: 'warn' };
    }

    const cert = new Date(item.certDate);
    const expiry = new Date(cert);
    expiry.setFullYear(expiry.getFullYear() + CERT_LIFE_YEARS);
    const now = new Date();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'expired', label: 'Expired', days: daysLeft, color: 'expired' };
    if (daysLeft <= WARN_DAYS) return { status: 'expiring', label: 'Expiring Soon', days: daysLeft, color: 'warn' };
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
      else if (s.status === 'pending') pending++;
      else if (s.status === 'rejected') rejected++;
      else noDate++;
    });
    const denom = Math.max(gear.length, 1) * 100;
    const score = Math.round(((current * 100 + expiring * 50 + noDate * 25 + pending * 25) / denom) * 100);
    return { score, current, expiring, expired, noDate, pending, rejected };
  }

  function sortGear(mode) {
    const sorted = [...gear];
    if (mode === 'urgency') {
      sorted.sort((a, b) => {
        const sa = getStatus(a), sb = getStatus(b);
        const pri = { rejected: -1, expired: 0, expiring: 1, pending: 2, unknown: 3, current: 4 };
        if (pri[sa.status] !== pri[sb.status]) return (pri[sa.status] || 9) - (pri[sb.status] || 9);
        return (sa.days || 9999) - (sb.days || 9999);
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
    getStatus, calcSafetyScore, sortGear,
    isAuthed, isRemote,
  };
})();
