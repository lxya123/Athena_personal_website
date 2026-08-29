/* =========================================================================
   rain.js — canvas rainfall for the background layer
   Exposes window.Rain = { start(), stop(), setLevel(0..1), toggle(on) }
   Tuning knobs live in CONFIG below.
   ========================================================================= */
(function () {
  "use strict";

  var CONFIG = {
    density:    0.00016, // drops per square pixel (raise for heavier rain)
    minSpeed:   380,     // px per second
    maxSpeed:   980,
    minLength:  9,
    maxLength:  26,
    wind:       -0.22,   // negative = falls to the left
    color:      "200, 190, 205",
    splashes:   true,
    maxSplashes: 60
  };

  var canvas = document.getElementById("rain");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var drops = [];
  var splashes = [];
  var w = 0, h = 0, dpr = 1;
  var rafId = null;
  var last = 0;
  var running = false;
  var level = 1;   // 0..1 — how heavy the rain is right now (scroll-driven)

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeDrop(seedAbove) {
    var depth = Math.random();               // 0 = far away, 1 = close to camera
    return {
      x: rand(-0.1 * w, 1.1 * w),
      y: seedAbove ? rand(-h, 0) : rand(0, h),
      len: rand(CONFIG.minLength, CONFIG.maxLength) * (0.5 + depth),
      speed: rand(CONFIG.minSpeed, CONFIG.maxSpeed) * (0.5 + depth),
      alpha: 0.12 + depth * 0.38,
      width: depth > 0.75 ? 1.6 : 1
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = Math.round(w * h * CONFIG.density);
    target = Math.max(60, Math.min(target, 420));
    drops.length = 0;
    for (var i = 0; i < target; i++) drops.push(makeDrop(false));
  }

  function addSplash(x, y) {
    if (!CONFIG.splashes || splashes.length >= CONFIG.maxSplashes) return;
    splashes.push({ x: x, y: y, r: 0, max: rand(5, 14), life: 1 });
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, w, h);

    // --- drops ---
    ctx.lineCap = "round";
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      var dy = d.speed * dt;
      var dx = dy * CONFIG.wind;

      ctx.strokeStyle = "rgba(" + CONFIG.color + "," + (d.alpha * level) + ")";
      ctx.lineWidth = d.width;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * CONFIG.wind, d.y - d.len);
      ctx.stroke();

      d.x += dx;
      d.y += dy;

      if (d.y - d.len > h) {
        if (d.width > 1) addSplash(d.x, h - rand(0, 6));
        drops[i] = makeDrop(true);
      } else if (d.x < -0.15 * w || d.x > 1.15 * w) {
        drops[i] = makeDrop(true);
      }
    }

    // --- splash ripples along the bottom ---
    for (var j = splashes.length - 1; j >= 0; j--) {
      var s = splashes[j];
      s.r += 26 * dt;
      s.life -= 1.8 * dt;
      if (s.life <= 0 || s.r > s.max) { splashes.splice(j, 1); continue; }
      ctx.strokeStyle = "rgba(" + CONFIG.color + "," + (s.life * 0.28 * level) + ")";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r, s.r * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    ctx.clearRect(0, 0, w, h);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();

  window.Rain = {
    start: start,
    stop: stop,
    resize: resize,
    isRunning: function () { return running; },
    setLevel: function (v) { level = Math.max(0, Math.min(1, v)); },
    getLevel: function () { return level; },
    toggle: function (on) { on ? start() : stop(); }
  };
})();
