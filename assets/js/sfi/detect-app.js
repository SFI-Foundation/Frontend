// ════════════════════════════════════════════════════
// Detect App – Orchestration & Init
// Single Responsibility: Wire modules together,
// run the analysis pipeline, manage UI state transitions.
// ════════════════════════════════════════════════════

const DetectApp = (() => {

  function init() {
    DetectInput.init(analyzeImage);
    DetectRenderer.buildCatRef();

    DetectEngine.loadModels((text, percent) => {
      const statusEl = document.getElementById('modelStatus');
      document.getElementById('modelStatusText').textContent = text;

      if (percent === -1) {
        statusEl.classList.replace('ocs__status-pill--neutral', 'ocs__status-pill--bad');
        return;
      }

      document.getElementById('modelProgress').value = percent;

      if (percent >= 100) {
        statusEl.classList.replace('ocs__status-pill--neutral', 'ocs__status-pill--good');
        document.getElementById('modelProgress').hidden = true;
        if (typeof DetectEngine.isDegraded === 'function' && DetectEngine.isDegraded()) {
          document.getElementById('modelStatusText').textContent =
            'Models ready (limited mode — classification unavailable)';
        }
      }
    });
  }

  async function analyzeImage(imgEl) {
    const area = document.getElementById('resultsArea');
    const overlay = document.getElementById('analyzingOverlay');
    const resultsDiv = document.getElementById('detectResults');

    area.hidden = false;
    overlay.hidden = false;
    resultsDiv.innerHTML = '';

    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await new Promise(r => setTimeout(r, 100));

    try {
      const { cocoResults, mnetResults } = await DetectEngine.runDetection(imgEl);
      const regionClassifications = await DetectEngine.classifyRegions(imgEl, cocoResults);
      const sfiResults = DetectEngine.mapToSFI(mnetResults, regionClassifications);

      DetectRenderer.drawBoundingBoxes(imgEl, regionClassifications, sfiResults);
      DetectRenderer.displayResults(sfiResults, mnetResults, cocoResults);
    } catch (err) {
      console.error('Analysis error:', err);
      resultsDiv.innerHTML = '<div class="ocs__callout alert-red"><strong>Analysis failed</strong><p>We couldn\'t process that image. Try a clearer, well-lit photo of a single piece of equipment, or a different file.</p></div>';
    }

    overlay.hidden = true;
  }

  return { init, analyzeImage };
})();

// Global helpers for onclick handlers in HTML
function switchTab(tab) { DetectInput.switchTab(tab); }
function startCamera() { DetectInput.startCamera(); }
function stopCamera() { DetectInput.stopCamera(); }
function flipCamera() { DetectInput.flipCamera(); }
function captureAndAnalyze() { DetectInput.captureAndAnalyze(); }

document.addEventListener('DOMContentLoaded', () => DetectApp.init());
