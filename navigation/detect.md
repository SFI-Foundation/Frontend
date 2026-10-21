---
layout: sfi
title: AI Equipment Detector
description: AI-powered detection of SFI motorsport safety equipment from images or camera feed.
permalink: /detect/
---


<header class="sfi-page-header">
  <div class="sfi-page-header-content">
    <h1>Equipment <span class="gold">Detector</span></h1>
    <p>Upload an image or use your camera to identify SFI-certified safety equipment. Detection runs in your browser; nothing is uploaded.</p>
  </div>
</header>

<div class="sfi__container">

  <section class="sfi__section">
    <div class="sfi__model-status" id="modelStatus">
      <span class="dot"></span>
      <span id="modelStatusText">Initializing models&hellip;</span>
    </div>
    <div class="sfi__meter sfi__model-progress" id="modelProgress">
      <div class="sfi__meter-fill" id="modelProgressBar"></div>
    </div>
  </section>

  <section class="sfi__section">
    <h2 class="sfi__title">Identify equipment</h2>
    <p class="sfi__lead">Choose an input method. Detected items are matched to SFI specification categories and outlined on the image.</p>

    <!-- a11y: switchTab() must keep aria-selected in sync with .active -->
    <div class="sfi__tabs" role="tablist" aria-label="Detection input method">
      <button type="button" class="sfi__tab active" id="tab-upload" role="tab" aria-selected="true" aria-controls="uploadPanel" onclick="switchTab('upload')">Upload image</button>
      <button type="button" class="sfi__tab" id="tab-camera" role="tab" aria-selected="false" aria-controls="cameraPanel" onclick="switchTab('camera')">Use camera</button>
    </div>

    <div id="uploadPanel" role="tabpanel" aria-labelledby="tab-upload">
      <div class="sfi__dropzone" id="uploadZone" tabindex="0" role="button" aria-label="Upload an image: drag and drop a file here, or activate to browse">
        <div class="sfi__dropzone-title">Drag and drop an image, or click to browse</div>
        <div class="sfi__dropzone-hint">JPG, PNG or WebP, up to 20 MB</div>
        <input type="file" id="fileInput" accept="image/*">
      </div>
    </div>

    <div id="cameraPanel" class="sfi__hidden" role="tabpanel" aria-labelledby="tab-camera">
      <div class="sfi__camera">
        <div class="sfi__camera-view" id="cameraPreview">
          <video id="cameraVideo" playsinline autoplay muted></video>
          <canvas id="cameraOverlay"></canvas>
        </div>
        <div class="sfi__camera-actions">
          <button type="button" class="sfi__btn primary" id="btnStartCam" onclick="startCamera()">Start camera</button>
          <button type="button" class="sfi__btn primary" id="btnCapture" onclick="captureAndAnalyze()" disabled>Capture and analyze</button>
          <button type="button" class="sfi__btn" id="btnFlip" onclick="flipCamera()" disabled>Flip camera</button>
          <button type="button" class="sfi__btn danger" id="btnStopCam" onclick="stopCamera()" disabled>Stop</button>
        </div>
      </div>
    </div>

    <div id="resultsArea" class="sfi__hidden">
      <div class="sfi__preview" id="resultWrap">
        <img id="resultImg" src="" alt="Analysis result">
        <canvas id="resultCanvas"></canvas>
        <div class="sfi__overlay sfi__hidden" id="analyzingOverlay">
          <span class="sfi__spinner"></span>
          <span>Analyzing equipment&hellip;</span>
        </div>
      </div>
      <div id="detectResults"></div>
    </div>
  </section>

  <section class="sfi__section">
    <h2 class="sfi__title">Detectable categories</h2>
    <p class="sfi__lead">Detections are mapped to these 15 SFI equipment categories, including clutches, helmets, roll cages, fuel cells and supercharger devices.</p>
    <div class="sfi__grid" id="catRefGrid"></div>
  </section>

  <section class="sfi__section">
    <div class="sfi__cta">
      <h2>Need the full spec database?</h2>
      <p>Search every SFI specification by number, name or category.</p>
      <a href="/sfi-specs/" class="sfi__btn">Open spec search</a>
    </div>
  </section>

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
