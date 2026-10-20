---
layout: opencs
title: AI Equipment Detector
description: AI-powered detection of SFI motorsport safety equipment from images or camera feed.
permalink: /detect/
---

<div class="ocs__container">

<!-- ── Hero ───────────────────────────────────────── -->
<span class="ocs__badge">SFI Foundation</span>
<h1>AI Equipment Detector</h1>
<p class="ocs__description">
  Upload an image or use your camera to identify SFI-certified motorsport safety equipment.
  Powered by on-device machine learning &mdash; nothing leaves your browser.
</p>
<p class="ocs__status-pill ocs__status-pill--neutral" id="modelStatus" role="status">
  <span id="modelStatusText">Initializing models&hellip;</span>
</p>
<progress id="modelProgress" value="0" max="100"></progress>

<!-- ── Main Detector ─────────────────────────────── -->
<section>
  <span class="ocs__badge">Detect</span>
  <h2 class="ocs__section-title">Identify Equipment</h2>
  <p class="ocs__description">
    Choose an input method below. The AI will detect and classify motorsport safety equipment
    into SFI specification categories with bounding boxes.
  </p>

  <!-- Tabs -->
  <!-- a11y: switchTab() (input team) must keep aria-selected in sync with the accent/fill state -->
  <div class="ocs__links" role="tablist" aria-label="Detection input method">
    <button type="button" class="detect-tab ocs__btn pill small accent fill" id="tab-upload" role="tab" aria-selected="true" aria-controls="uploadPanel" onclick="switchTab('upload')">Upload Image</button>
    <button type="button" class="detect-tab ocs__btn pill small" id="tab-camera" role="tab" aria-selected="false" aria-controls="cameraPanel" onclick="switchTab('camera')">Use Camera</button>
  </div>

  <!-- Upload panel -->
  <div id="uploadPanel" role="tabpanel" aria-labelledby="tab-upload">
    <!-- a11y: Enter/Space keydown activation handler is added by the input team on #uploadZone -->
    <div class="ocs__card" id="uploadZone" tabindex="0" role="button" aria-label="Upload an image: drag and drop a file here, or activate to browse">
      <p class="ocs__text">&#128247; Drag & drop an image here, or click to browse</p>
      <p class="ocs__text">Supports JPG, PNG, WebP &bull; Max 20 MB</p>
      <input type="file" id="fileInput" accept="image/*" hidden>
    </div>
  </div>

  <!-- Camera panel -->
  <div id="cameraPanel" role="tabpanel" aria-labelledby="tab-camera" hidden>
    <div class="ocs__card">
      <video id="cameraVideo" playsinline autoplay muted hidden></video>
      <canvas id="cameraOverlay"></canvas>
      <div class="ocs__links">
        <button class="ocs__btn accent fill" id="btnStartCam" onclick="startCamera()">Start Camera</button>
        <button class="ocs__btn accent fill" id="btnCapture" onclick="captureAndAnalyze()" disabled>Capture & Analyze</button>
        <button class="ocs__btn" id="btnFlip" onclick="flipCamera()" disabled>Flip Camera</button>
        <button class="ocs__btn alert-red" id="btnStopCam" onclick="stopCamera()" disabled>Stop</button>
      </div>
    </div>
  </div>

  <!-- Results area -->
  <div id="resultsArea" hidden>
    <div id="resultWrap">
      <canvas id="resultCanvas"></canvas>
    </div>
    <p class="ocs__callout" id="analyzingOverlay" hidden>Analyzing equipment&hellip;</p>
    <div id="detectResults"></div>
  </div>
</section>

<!-- ── Category Reference ────────────────────────── -->
<section>
  <span class="ocs__badge">Reference</span>
  <h2 class="ocs__section-title">Detectable Categories</h2>
  <p class="ocs__description">
    The AI maps detections to these 15 major SFI equipment categories, covering
    clutches, helmets, roll cages, fuel cells, supercharger devices, and more.
  </p>
  <div class="ocs__hub-grid" id="catRefGrid"></div>
</section>

<div class="ocs__callout">
  <h2>Need the full spec database?</h2>
  <p>Search all SFI specifications by number, name, or category.</p>
  <div class="ocs__links">
    <a href="/sfi-specs/" class="ocs__btn accent fill">Open Spec Search &rarr;</a>
  </div>
</div>

</div>

<!-- ── Scripts: each file has a single responsibility ── -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js"></script>
<script src="{{ '/assets/js/sfi/sfi-categories.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-engine.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-input.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-renderer.js' | relative_url }}"></script>
<script src="{{ '/assets/js/sfi/detect-app.js' | relative_url }}"></script>
