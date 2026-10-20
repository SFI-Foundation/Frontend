// ════════════════════════════════════════════════════
// Detect Renderer – Visual Output
// Single Responsibility: Draw bounding boxes on canvas,
// render result cards, and build the category reference grid.
// ════════════════════════════════════════════════════

const DetectRenderer = (() => {

  const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:8423'
    : 'https://greppers-be.opencodingsociety.com';

  let _lastResults = [];

  function pickRepresentativeProduct(cat) {
    return (cat.items && cat.items.length > 0) ? cat.items[0] : cat.name;
  }

  async function saveToMyGear(result, btn) {
    const cat = result.cat;
    const productName = pickRepresentativeProduct(cat);
    const payload = {
      name: productName,
      spec: 'Unknown',
      category: cat.name,
      productName: productName,
      certDate: '',
      source: 'ai-detection',
    };

    btn.disabled = true;
    btn.dataset.state = 'saving';
    btn.textContent = 'Saving…';

    try {
      const res = await fetch(API_BASE + '/api/sfi/gear', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        btn.dataset.state = 'auth';
        btn.textContent = 'Sign in to save';
        btn.disabled = false;
        return;
      }
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      const saved = await res.json();
      btn.dataset.state = 'saved';
      btn.textContent = saved.status === 'approved' ? 'Saved · Approved' : 'Saved · Pending review';
    } catch (err) {
      console.error('save to gear failed:', err);
      btn.dataset.state = 'error';
      btn.textContent = 'Save failed — retry';
      btn.disabled = false;
    }
  }

  function injectSaveButtons() {
    const cards = document.querySelectorAll('#detectResults .detect-result-card');
    cards.forEach((card, idx) => {
      if (card.querySelector('.detect-save-btn')) return;
      const rightCol = card.lastElementChild;
      if (!rightCol) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'detect-save-btn';
      btn.dataset.resultIdx = String(idx);
      btn.textContent = '+ Save to My Gear';
      btn.title = 'Save this detection to My Gear';
      btn.addEventListener('click', () => {
        const result = _lastResults[idx];
        if (result) saveToMyGear(result, btn);
      });
      rightCol.appendChild(btn);
    });
  }

  // Polyfill roundRect
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      if (typeof r === 'number') r = [r, r, r, r];
      this.moveTo(x + r[0], y);
      this.lineTo(x + w - r[1], y);
      this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
      this.lineTo(x + w, y + h - r[2]);
      this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
      this.lineTo(x + r[3], y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
      this.lineTo(x, y + r[0]);
      this.quadraticCurveTo(x, y, x + r[0], y);
      this.closePath();
      return this;
    };
  }

  // Draws scaled bounding boxes for `regions` (bbox in SOURCE pixel coords:
  // srcW x srcH) onto `canvas`, scaling to the canvas's CURRENT width/height.
  // The CALLER is responsible for sizing the canvas before calling.
  // Reused by both the still-result canvas and the live camera overlay.
  function drawBoxesOnCanvas(canvas, srcW, srcH, regions, sfiResults) {
    if (!canvas || !srcW || !srcH) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / srcW;
    const scaleY = canvas.height / srcH;

    regions.forEach(region => {
      const fallback = sfiResults.length > 0 ? sfiResults[0].cat : SFI_CATEGORIES[0];
      const bestCat = DetectEngine.matchRegionToCategory(region, fallback);

      const [x, y, w, h] = region.bbox;
      const sx = x * scaleX, sy = y * scaleY, sw = w * scaleX, sh = h * scaleY;
      const color = bestCat.color;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.strokeRect(sx, sy, sw, sh);

      ctx.fillStyle = color + '15';
      ctx.fillRect(sx, sy, sw, sh);

      const label = bestCat.name;
      ctx.font = 'bold 13px Inter, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const labelH = 22;
      const labelY = sy > labelH + 4 ? sy - labelH - 2 : sy + 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(sx, labelY, textWidth + 14, labelH, 4);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.fillText(label, sx + 7, labelY + 15);
    });

    if (regions.length === 0 && sfiResults.length > 0) {
      const cat = sfiResults[0].cat;
      const color = cat.color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      ctx.font = 'bold 16px Inter, sans-serif';
      const label = cat.name + ' (image-level)';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(12, 12, tw + 20, 28, 6);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillText(label, 22, 32);
      ctx.setLineDash([]);
    }
  }

  // Thin wrapper for the still-image path: computes display size from
  // #resultWrap, sizes the canvas, then delegates to drawBoxesOnCanvas.
  function drawBoundingBoxes(imgEl, regions, sfiResults) {
    const canvas = document.getElementById('resultCanvas');
    const wrap = document.getElementById('resultWrap');
    const displayWidth = wrap.clientWidth;
    const displayHeight = imgEl.naturalHeight * (displayWidth / imgEl.naturalWidth);

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.height = displayHeight + 'px';

    drawBoxesOnCanvas(canvas, imgEl.naturalWidth, imgEl.naturalHeight, regions, sfiResults);
  }

  function displayResults(sfiResults, globalMnet, cocoResults) {
    _lastResults = sfiResults;
    const div = document.getElementById('detectResults');
    div.setAttribute('role', 'list');

    const n = sfiResults.length;
    const summaryText = n > 0
      ? `Detected ${n} categor${n === 1 ? 'y' : 'ies'}`
      : 'No equipment detected';
    const summaryHtml = `<div class="detect-results-summary" role="status" aria-live="polite">${summaryText}</div>`;

    if (n === 0) {
      div.innerHTML = `
        ${summaryHtml}
        <div class="no-results">
          <p style="font-size:1.5rem;margin-bottom:8px;">&#128269;</p>
          <p>No SFI equipment detected in this image.</p>
          <p style="font-size:0.8rem;opacity:0.6;margin-top:4px;">
            Try an image of motorsport safety equipment &mdash; helmets, harnesses, roll cages, wheels, etc.
          </p>
        </div>`;
      return;
    }

    let html = summaryHtml + '<div class="detect-results-title">Detected SFI Equipment Categories</div>';

    sfiResults.forEach(result => {
      const rawConf = result.confidence;
      const conf = rawConf;
      const barWidth = Math.max(0, Math.min(100, rawConf));
      const confColor = conf >= 60 ? 'var(--sfi-green)' : conf >= 30 ? 'var(--sfi-gold)' : 'var(--sfi-muted)';
      html += `
        <div class="detect-result-card" role="listitem">
          <div class="detect-result-color" style="background:${result.cat.color}"></div>
          <div class="detect-result-info">
            <div class="detect-result-name">${result.cat.name}</div>
            <div class="detect-result-items">${result.cat.items.slice(0, 3).join(' &bull; ')}${result.cat.items.length > 3 ? ' &bull; +' + (result.cat.items.length - 3) + ' more' : ''}</div>
          </div>
          <div style="text-align:right;">
            <div class="detect-result-conf" style="color:${confColor}">${conf}%</div>
            <div class="detect-result-conf-label">confidence</div>
            <div class="detect-conf-bar"><div class="detect-conf-bar-fill" style="width:${barWidth}%"></div></div>
          </div>
        </div>`;
    });

    html += `
      <p class="detect-disclaimer">AI estimate &mdash; verify against the official SFI spec.</p>`;

    // Small helper panel asking the user to save any / all detected gear.
    html += `
      <div class="detect-save-hint">
        <span>Seen your gear? Save it to <a href="/quiz/">My Gear</a> — administrators review submissions and keep one clean record.</span>
      </div>`;

    html += `
      <details style="margin-top:20px;">
        <summary style="font-family:'Inter',sans-serif;font-size:0.8rem;color:var(--sfi-muted);cursor:pointer;padding:8px 0;">
          Show raw model output
        </summary>
        <div style="background:var(--sfi-surface);border:1px solid var(--sfi-border);border-radius:8px;padding:16px;margin-top:8px;font-family:monospace;font-size:0.75rem;color:var(--sfi-muted);line-height:1.8;">
          <strong style="color:var(--sfi-text);">COCO-SSD Detections:</strong><br>
          ${cocoResults.length === 0 ? 'None' : cocoResults.map(d => `${d.class} (${Math.round(d.score * 100)}%)`).join(', ')}<br><br>
          <strong style="color:var(--sfi-text);">MobileNet Classifications:</strong><br>
          ${globalMnet.slice(0, 5).map(p => `${p.className} (${Math.round(p.probability * 100)}%)`).join('<br>')}
        </div>
      </details>`;

    div.innerHTML = html;
    injectSaveButtons();
  }

  function buildCatRef() {
    const grid = document.getElementById('catRefGrid');
    grid.innerHTML = SFI_CATEGORIES.map(cat => `
      <div class="cat-ref-item">
        <div class="cat-ref-name">
          <span class="cat-ref-dot" style="background:${cat.color}"></span>
          ${cat.name}
        </div>
        <div class="cat-ref-specs">${cat.items.join('<br>')}</div>
      </div>
    `).join('');
  }

  return { drawBoundingBoxes, displayResults, buildCatRef, drawBoxesOnCanvas };
})();
