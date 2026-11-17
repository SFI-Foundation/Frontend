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
        statusEl.classList.add('error');
        return;
      }

      document.getElementById('modelProgressBar').style.width = percent + '%';

      if (percent >= 100) {
        statusEl.classList.add('ready');
        document.getElementById('modelProgress').classList.add('sfi__hidden');
        if (typeof DetectEngine.isDegraded === 'function' && DetectEngine.isDegraded()) {
          document.getElementById('modelStatusText').textContent =
            'Models ready (limited mode — classification unavailable)';
        }
      }
    });
  }

  async function analyzeImage(imgEl) {
    const area = document.getElementById('resultsArea');
    const resultImg = document.getElementById('resultImg');
    const overlay = document.getElementById('analyzingOverlay');
    const resultsDiv = document.getElementById('detectResults');

    resultImg.src = imgEl.src;
    area.classList.remove('sfi__hidden');
    overlay.classList.remove('sfi__hidden');
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
      resultsDiv.innerHTML = '<div class="sfi__notice bad"><strong>Analysis failed.</strong> We couldn\'t process that image. Try a clearer, well-lit photo of a single piece of equipment, or a different file.</div>';
    }

    overlay.classList.add('sfi__hidden');
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
