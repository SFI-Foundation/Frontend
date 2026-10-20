// ════════════════════════════════════════════════════
// Detect Input – Upload & Camera Handling
// Single Responsibility: Accept images from the user
// via file upload, drag-drop, or camera capture.
// ════════════════════════════════════════════════════

const DetectInput = (() => {
  let cameraStream = null;
  let facingMode = 'environment';
  let _onImageReady = null;

  // Live detection loop state
  let _rafHandle = null;
  let _isInferring = false;
  let _lastInferTs = 0;
  const LIVE_INTERVAL_MS = 400;

  // Drag enter/leave counter (prevents flicker over child elements)
  let _dragDepth = 0;

  function init(onImageReady) {
    _onImageReady = onImageReady;
    setupUpload();
  }

  // Inline status messaging — reuses the existing model status line
  // instead of alert()/a new toast div (honors no-markup constraint).
  function setStatus(msg) {
    const el = document.getElementById('modelStatusText');
    if (el) el.textContent = msg;
  }

  function setupUpload() {
    const zone = document.getElementById('uploadZone');
    const input = document.getElementById('fileInput');

    zone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      _dragDepth++;
      zone.classList.add('ocs__callout');
    });
    // dragover must preventDefault so the drop event fires.
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    zone.addEventListener('dragleave', () => {
      _dragDepth = Math.max(0, _dragDepth - 1);
      if (_dragDepth === 0) zone.classList.remove('ocs__callout');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      _dragDepth = 0;
      zone.classList.remove('ocs__callout');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', () => {
      if (input.files.length) handleFile(input.files[0]);
      input.value = '';
    });

    // Click + keyboard to open the file picker (UI team adds tabindex/role).
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        input.click();
      }
    });
  }

  function handleFile(file) {
    if (!file.type || !file.type.startsWith('image/')) {
      setStatus('Please choose an image file (JPG, PNG, WebP).');
      return;
    }
    const MAX_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setStatus('Image is too large (max 20 MB).');
      return;
    }
    if (!DetectEngine.isReady()) {
      setStatus('Models are still loading - please wait.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => _onImageReady(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function switchTab(tab) {
    document.querySelectorAll('.detect-tab').forEach((t, i) => {
      const on = (tab === 'upload' && i === 0) || (tab === 'camera' && i === 1);
      t.classList.toggle('accent', on);
      t.classList.toggle('fill', on);
      t.setAttribute('aria-selected', String(on));
    });
    document.getElementById('uploadPanel').hidden = tab !== 'upload';
    document.getElementById('cameraPanel').hidden = tab !== 'camera';
    // Any switch away from camera tears down the stream + live loop.
    if (tab !== 'camera' && cameraStream) stopCamera();
  }

  async function startCamera() {
    try {
      if (cameraStream) stopCamera();
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      const video = document.getElementById('cameraVideo');
      video.srcObject = cameraStream;
      await video.play();

      setCameraButtons(true);
      startLiveLoop();
    } catch (err) {
      console.error('Camera error:', err);
      setStatus('Could not access camera. Please grant permission and try again.');
    }
  }

  function startLiveLoop() {
    const video = document.getElementById('cameraVideo');
    const overlay = document.getElementById('cameraOverlay');
    // The video element stays hidden: each frame is drawn into the overlay
    // canvas together with the last detected boxes, so the two always align.
    let liveRegions = [];

    const tick = async (ts) => {
      _rafHandle = requestAnimationFrame(tick);
      if (!cameraStream) return;
      if (!video.videoWidth) return;
      overlay.width = Math.min(overlay.parentElement.clientWidth, video.videoWidth);
      overlay.height = overlay.width * video.videoHeight / video.videoWidth;
      DetectRenderer.drawBoxesOnCanvas(overlay, video.videoWidth, video.videoHeight, liveRegions, [], video);
      if (_isInferring) return;
      if (ts - _lastInferTs < LIVE_INTERVAL_MS) return;
      if (!video.videoWidth) return;
      if (!DetectEngine.isReady()) return;
      _lastInferTs = ts;
      _isInferring = true;
      try {
        const regions = await DetectEngine.detectFrame(video);
        if (cameraStream) {
          liveRegions = regions.map(r => ({ bbox: r.bbox, cocoClass: r.class, cocoScore: r.score, mnetClasses: [] }));
        }
      } catch (e) {
        console.error('Live detect error:', e);
      } finally {
        _isInferring = false;
      }
    };

    _lastInferTs = 0;
    _rafHandle = requestAnimationFrame(tick);
  }

  function stopLiveLoop() {
    if (_rafHandle != null) {
      cancelAnimationFrame(_rafHandle);
      _rafHandle = null;
    }
    _isInferring = false;
    _lastInferTs = 0;
  }

  function stopCamera() {
    stopLiveLoop();
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    const video = document.getElementById('cameraVideo');
    video.srcObject = null;
    setCameraButtons(false);

    const overlay = document.getElementById('cameraOverlay');
    overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
  }

  function flipCamera() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera();
  }

  function captureAndAnalyze() {
    if (!DetectEngine.isReady()) return;
    const video = document.getElementById('cameraVideo');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    tempCanvas.getContext('2d').drawImage(video, 0, 0);

    const img = new Image();
    img.onload = () => _onImageReady(img);
    img.src = tempCanvas.toDataURL('image/jpeg', 0.9);
  }

  function setCameraButtons(streaming) {
    document.getElementById('btnStartCam').disabled = streaming;
    document.getElementById('btnCapture').disabled = !streaming;
    document.getElementById('btnFlip').disabled = !streaming;
    document.getElementById('btnStopCam').disabled = !streaming;
  }

  return { init, switchTab, startCamera, stopCamera, flipCamera, captureAndAnalyze };
})();
