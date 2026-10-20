---
layout: sfi
title: AI Equipment Detector
description: AI-powered detection of SFI motorsport safety equipment from images or camera feed.
permalink: /detect/
---

<style>
/* ── Dark palette (scoped to this page) ─────────── */
/* The shared `sfi` layout root is a LIGHT theme and never defines
   --sfi-cyan/--sfi-gold/--sfi-gold-dim etc. This page is authored DARK.
   Scope the dark palette to a .detect-page wrapper so the shared
   light header/nav/footer chrome is untouched, and paint the dark
   background behind the detect content. Values mirror sfifoundation.md. */
.detect-page {
  --sfi-dark: #0d1117;
  --sfi-bg: #0d1117;
  --sfi-surface: #161b27;
  --sfi-surface2: #1e2535;
  --sfi-surface3: #252d3f;
  --sfi-border: rgba(240,165,0,0.15);
  --sfi-border-bright: rgba(240,165,0,0.35);
  --sfi-gold: #F0A500;
  --sfi-gold-dim: rgba(240,165,0,0.6);
  --sfi-cyan: #00d4ff;
  --sfi-purple: #7c3aed;
  --sfi-text: #e6edf3;
  --sfi-muted: #8b949e;
  --sfi-green: #3fb950;
  --sfi-red: #f85149;
  --sfi-radius: 12px;
  --sfi-radius-sm: 8px;
  background: var(--sfi-bg);
  color: var(--sfi-text);
}

/* ── Detector Page Styles ──────────────────────── */
.detect-hero {
  background: linear-gradient(135deg, var(--sfi-bg) 0%, #0f1a12 40%, var(--sfi-bg) 100%);
  padding: 120px 20px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.detect-hero::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(ellipse at 40% 50%, rgba(0,212,255,0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 60% 40%, rgba(240,165,0,0.05) 0%, transparent 60%);
  animation: detectPulse 10s ease-in-out infinite alternate;
}
@keyframes detectPulse {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.04) rotate(1deg); }
}
.detect-hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
.detect-hero h1 {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.detect-hero h1 span { color: var(--sfi-cyan); }
.detect-hero-tag {
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  color: var(--sfi-muted);
  margin-bottom: 24px;
  line-height: 1.6;
}

/* Model status */
.model-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: 100px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: var(--sfi-muted);
  margin-bottom: 20px;
}
.model-status .dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--sfi-gold);
  animation: statusPulse 1.5s ease-in-out infinite;
}
.model-status.ready .dot {
  background: var(--sfi-green);
  animation: none;
}
.model-status.error .dot {
  background: var(--sfi-red);
  animation: none;
}
@keyframes statusPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.model-progress {
  width: 200px;
  height: 4px;
  background: var(--sfi-surface2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}
.model-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--sfi-gold), var(--sfi-cyan));
  border-radius: 2px;
  transition: width 0.3s;
  width: 0%;
}

/* Tab system */
.detect-tabs {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-bottom: 32px;
}
.detect-tab {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 28px;
  border: 1px solid var(--sfi-border);
  background: var(--sfi-surface);
  color: var(--sfi-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.detect-tab:first-child { border-radius: 10px 0 0 10px; }
.detect-tab:last-child { border-radius: 0 10px 10px 0; }
.detect-tab.active {
  background: rgba(240,165,0,0.12);
  border-color: var(--sfi-gold);
  color: var(--sfi-gold);
}
.detect-tab:hover:not(.active) {
  background: var(--sfi-surface2);
  color: var(--sfi-text);
}

/* Upload area */
.upload-zone {
  border: 2px dashed var(--sfi-border-bright);
  border-radius: var(--sfi-radius);
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(240,165,0,0.02);
  position: relative;
}
.upload-zone:hover, .upload-zone.dragover {
  border-color: var(--sfi-gold);
  background: rgba(240,165,0,0.06);
  transform: translateY(-2px);
}
.upload-zone:focus-visible {
  outline: 2px solid var(--sfi-gold);
  outline-offset: 3px;
}
.upload-zone-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
  opacity: 0.6;
}
.upload-zone-text {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: var(--sfi-muted);
  margin-bottom: 8px;
}
.upload-zone-hint {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: var(--sfi-muted);
  opacity: 0.6;
}
.upload-zone input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Camera area */
.camera-zone {
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: var(--sfi-radius);
  padding: 32px;
  text-align: center;
}
.camera-preview {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 640px;
  background: #000;
  border-radius: var(--sfi-radius-sm);
  overflow: hidden;
  aspect-ratio: 4/3;
}
.camera-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.camera-preview canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.camera-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}
.cam-btn {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid var(--sfi-border);
  background: var(--sfi-surface2);
  color: var(--sfi-text);
  cursor: pointer;
  transition: all 0.2s;
}
.cam-btn:hover { border-color: var(--sfi-gold); background: rgba(240,165,0,0.1); }
.cam-btn.primary {
  background: linear-gradient(135deg, var(--sfi-gold), var(--sfi-gold-dim));
  color: #000;
  border: none;
}
.cam-btn.primary:hover { box-shadow: 0 4px 16px rgba(240,165,0,0.3); }
.cam-btn.danger { border-color: var(--sfi-red); color: var(--sfi-red); }
.cam-btn.danger:hover { background: rgba(248,81,73,0.1); }
.cam-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Results canvas container */
.result-canvas-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 800px;
  border-radius: var(--sfi-radius-sm);
  overflow: hidden;
  background: #000;
  margin-bottom: 24px;
}
.result-canvas-wrap img {
  width: 100%;
  display: block;
}
.result-canvas-wrap canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
}

/* Results list */
.detect-results {
  margin-top: 32px;
}
.detect-results-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}
.detect-result-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: var(--sfi-radius-sm);
  padding: 16px 20px;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}
.detect-result-card:hover { border-color: var(--sfi-border-bright); }
.detect-result-color {
  width: 6px;
  height: 48px;
  border-radius: 3px;
  flex-shrink: 0;
}
.detect-result-info { flex: 1; }
.detect-result-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--sfi-text);
  margin-bottom: 2px;
}
.detect-result-items {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: var(--sfi-muted);
  line-height: 1.4;
}
.detect-result-conf {
  font-family: 'Oswald', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  flex-shrink: 0;
}
.detect-save-btn {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 7px 12px;
  background: transparent;
  color: var(--sfi-gold);
  border: 1px solid rgba(240,165,0,0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
  white-space: nowrap;
}
.detect-save-btn:hover:not(:disabled) {
  background: rgba(240,165,0,0.14);
  border-color: var(--sfi-gold);
  transform: translateY(-1px);
}
.detect-save-btn[data-state="saving"] { color: var(--sfi-muted); border-color: rgba(240,165,0,0.2); }
.detect-save-btn[data-state="saved"]  { color: var(--sfi-green); border-color: rgba(63,185,80,0.45); background: rgba(63,185,80,0.08); cursor: default; }
.detect-save-btn[data-state="auth"]   { color: var(--sfi-cyan); border-color: rgba(0,212,255,0.45); }
.detect-save-btn[data-state="error"]  { color: var(--sfi-red); border-color: rgba(248,81,73,0.45); }
.detect-save-btn:disabled { opacity: 0.9; cursor: default; }

.detect-save-hint {
  margin-top: 18px;
  padding: 12px 16px;
  border: 1px dashed rgba(240,165,0,0.35);
  border-radius: 10px;
  background: rgba(240,165,0,0.04);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: var(--sfi-muted);
  line-height: 1.55;
}
.detect-save-hint a { color: var(--sfi-gold); font-weight: 600; text-decoration: none; }
.detect-save-hint a:hover { text-decoration: underline; }

.detect-result-conf-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: var(--sfi-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: right;
}
.no-results {
  text-align: center;
  padding: 40px;
  color: var(--sfi-muted);
  font-family: 'Inter', sans-serif;
}

/* Confidence bars (markup emitted by renderer team; CSS only here).
   Place .detect-conf-bar as a block child of .detect-result-info so the
   track spans the flex:1 info column width. Fill width is set inline as %. */
.detect-conf-bar {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--sfi-surface2);
  overflow: hidden;
  margin-top: 6px;
}
.detect-conf-bar-fill {
  height: 100%;
  border-radius: 999px;
  width: 0%; /* width set inline as a % by the renderer */
  background: linear-gradient(90deg, var(--sfi-gold), var(--sfi-cyan));
  transition: width 0.4s ease;
}

/* Error card for analyze failures (markup emitted by detect-app.js;
   CSS only here). Mirrors the result-card shape with a red accent. */
.detect-error-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(248,81,73,0.08);
  border: 1px solid rgba(248,81,73,0.4);
  border-left: 3px solid var(--sfi-red);
  border-radius: var(--sfi-radius-sm);
  padding: 16px 20px;
  margin-top: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--sfi-text);
  line-height: 1.5;
}
.detect-error-card strong { color: var(--sfi-red); font-family: 'Oswald', sans-serif; }

/* Analyzing overlay */
.analyzing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(6,10,20,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: var(--sfi-radius-sm);
}
.analyzing-spinner {
  width: 48px; height: 48px;
  border: 3px solid var(--sfi-surface2);
  border-top-color: var(--sfi-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.analyzing-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--sfi-gold);
  font-weight: 600;
}

/* Category grid at bottom */
.cat-ref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.cat-ref-item {
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: var(--sfi-radius-sm);
  padding: 16px;
  transition: border-color 0.2s;
}
.cat-ref-item:hover { border-color: var(--sfi-border-bright); }
.cat-ref-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}
.cat-ref-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--sfi-text);
  margin-bottom: 4px;
}
.cat-ref-specs {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: var(--sfi-muted);
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 600px) {
  .upload-zone { padding: 40px 20px; }
  .camera-zone { padding: 16px; }
  .detect-tabs { flex-direction: column; align-items: stretch; }
  .detect-tab { border-radius: 8px !important; }
  .detect-result-card { flex-wrap: wrap; }
  /* Stack camera controls; make the primary capture button the large
     full-width primary action at the top of the stack. */
  .camera-controls { flex-direction: column; }
  .cam-btn { width: 100%; }
  #btnCapture { width: 100%; padding: 16px; font-size: 1rem; order: -1; }
}
</style>

<!-- ── Dark-themed page wrapper (scopes the dark palette) ── -->
<div class="detect-page">

<!-- ── Hero ───────────────────────────────────────── -->
<div class="detect-hero">
  <div class="detect-hero-content">
    <h1>AI EQUIPMENT <span>DETECTOR</span></h1>
    <p class="detect-hero-tag">
      Upload an image or use your camera to identify SFI-certified motorsport safety equipment.
      Powered by on-device machine learning &mdash; nothing leaves your browser.
    </p>
    <div class="model-status" id="modelStatus">
      <span class="dot"></span>
      <span id="modelStatusText">Initializing models&hellip;</span>
    </div>
    <div class="model-progress" id="modelProgress">
      <div class="model-progress-bar" id="modelProgressBar"></div>
    </div>
  </div>
</div>

<!-- ── Main Detector ─────────────────────────────── -->
<section class="sfi-sect">
  <div class="sfi-sect-label">Detect</div>
  <div class="sfi-sect-title">Identify Equipment</div>
  <div class="sfi-sect-desc">
    Choose an input method below. The AI will detect and classify motorsport safety equipment
    into SFI specification categories with bounding boxes.
  </div>

  <!-- Tabs -->
  <!-- a11y: switchTab() (input team) must keep aria-selected in sync with .active -->
  <div class="detect-tabs" role="tablist" aria-label="Detection input method">
    <button type="button" class="detect-tab active" id="tab-upload" role="tab" aria-selected="true" aria-controls="uploadPanel" onclick="switchTab('upload')">Upload Image</button>
    <button type="button" class="detect-tab" id="tab-camera" role="tab" aria-selected="false" aria-controls="cameraPanel" onclick="switchTab('camera')">Use Camera</button>
  </div>

  <!-- Upload panel -->
  <div id="uploadPanel" role="tabpanel" aria-labelledby="tab-upload">
    <!-- a11y: Enter/Space keydown activation handler is added by the input team on #uploadZone -->
    <div class="upload-zone" id="uploadZone" tabindex="0" role="button" aria-label="Upload an image: drag and drop a file here, or activate to browse">
      <span class="upload-zone-icon">&#128247;</span>
      <div class="upload-zone-text">Drag & drop an image here, or click to browse</div>
      <div class="upload-zone-hint">Supports JPG, PNG, WebP &bull; Max 20 MB</div>
      <input type="file" id="fileInput" accept="image/*">
    </div>
  </div>

  <!-- Camera panel -->
  <div id="cameraPanel" role="tabpanel" aria-labelledby="tab-camera" style="display:none;">
    <div class="camera-zone">
      <div class="camera-preview" id="cameraPreview">
        <video id="cameraVideo" playsinline autoplay muted></video>
        <canvas id="cameraOverlay"></canvas>
      </div>
      <div class="camera-controls">
        <button class="cam-btn primary" id="btnStartCam" onclick="startCamera()">Start Camera</button>
        <button class="cam-btn primary" id="btnCapture" onclick="captureAndAnalyze()" disabled>Capture & Analyze</button>
        <button class="cam-btn" id="btnFlip" onclick="flipCamera()" disabled>Flip Camera</button>
        <button class="cam-btn danger" id="btnStopCam" onclick="stopCamera()" disabled>Stop</button>
      </div>
    </div>
  </div>

  <!-- Results area -->
  <div id="resultsArea" style="display:none; margin-top:40px;">
    <div style="text-align:center;">
      <div class="result-canvas-wrap" id="resultWrap">
        <img id="resultImg" src="" alt="Analysis result">
        <canvas id="resultCanvas"></canvas>
        <div class="analyzing-overlay" id="analyzingOverlay" style="display:none;">
          <div class="analyzing-spinner"></div>
          <div class="analyzing-text">Analyzing equipment&hellip;</div>
        </div>
      </div>
    </div>
    <div class="detect-results" id="detectResults"></div>
  </div>
</section>

<div class="sfi-divider"><hr></div>

<!-- ── Category Reference ────────────────────────── -->
<section class="sfi-sect">
  <div class="sfi-sect-label">Reference</div>
  <div class="sfi-sect-title">Detectable Categories</div>
  <div class="sfi-sect-desc">
    The AI maps detections to these 15 major SFI equipment categories, covering
    clutches, helmets, roll cages, fuel cells, supercharger devices, and more.
  </div>
  <div class="cat-ref-grid" id="catRefGrid"></div>
</section>

<div class="sfi-divider"><hr></div>

<section class="sfi-sect">
  <div class="sfi-cta-banner">
    <h2>NEED THE FULL SPEC DATABASE?</h2>
    <p>Search all SFI specifications by number, name, or category.</p>
    <a href="/sfi-specs/" class="sfi-btn sfi-btn-primary">Open Spec Search &rarr;</a>
  </div>
</section>

</div><!-- /.detect-page -->

<!-- ── Scripts: each file has a single responsibility ── -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js"></script>
<script src="{{ '/assets/js/sfi/sfi-categories.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-engine.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-input.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-renderer.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-app.js' | relative_url }}"></script>
