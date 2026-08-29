/* =========================================================================
   petals.js — peony petals drifting down over the whole page
   Exposes window.Petals = { start(), stop(), setLevel(0..1) }
   ========================================================================= */
(function () {
  "use strict";

  var CONFIG = {
    density:   0.00007,   // petals per square pixel
    maxPetals: 90,
    minFall:   26,        // px per second
    maxFall:   96,
    wind:      -14,       // sideways drift, negative = to the left
    colors: [
      "232, 183, 194",    // pale peony pink
      "209, 142, 157",
      "196, 120, 139",
      "251, 233, 237",    // near white
      "168, 59, 77"       // deep burgundy petal
    ]
  };

  var canvas = document.getElementById("petals");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var petals = [];
  var w = 0, h = 0, dpr = 1;
  var level = 1;
  var running = false;
  var rafId = null;
  var last = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makePetal(seedAbove) {
    var depth = Math.random();                 // 0 = far, 1 = close
    var size = rand(7, 15) * (0.6 + depth);
    return {
      x: rand(-0.08 * w, 1.08 * w),
      y: seedAbove ? rand(-h * 0.4, -10) : rand(0, h),
      w: size,
      h: size * rand(1.25, 1.75),
      fall: rand(CONFIG.minFall, CONFIG.maxFall) * (0.55 + depth),
      spin: rand(-1.6, 1.6),                   // radians per second
      angle: Math.random() * Math.PI * 2,
      flip: Math.random() * Math.PI * 2,       // fakes the petal turning over
      flipRate: rand(0.6, 2.1),
      swayAmp: rand(10, 42),
      swayRate: rand(0.35, 0.95),
      phase: Math.random() * Math.PI * 2,
      alpha: 0.3 + depth * 0.55,
      blur: depth < 0.3,
      color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)]
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
    target = Math.max(18, Math.min(target, CONFIG.maxPetals));
    petals.length = 0;
    for (var i = 0; i < target; i++) petals.push(makePetal(false));
  }

  /* one peony petal: a rounded teardrop, notched at the tip */
  function petalPath(pw, ph) {
    ctx.beginPath();
    ctx.moveTo(0, -ph / 2);
    ctx.bezierCurveTo(pw * 0.62, -ph * 0.38, pw * 0.54, ph * 0.34, 0, ph / 2);
    ctx.bezierCurveTo(-pw * 0.54, ph * 0.34, -pw * 0.62, -ph * 0.38, 0, -ph / 2);
    ctx.closePath();
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, w, h);

    if (level > 0.01) {
      var t = now / 1000;
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];

        p.y += p.fall * dt;
        p.x += (CONFIG.wind * dt) + Math.sin(t * p.swayRate + p.phase) * p.swayAmp * dt;
        p.angle += p.spin * dt;
        p.flip += p.flipRate * dt;

        if (p.y - p.h > h || p.x < -0.12 * w || p.x > 1.12 * w) {
          petals[i] = makePetal(true);
          continue;
        }

        var turn = Math.cos(p.flip);                 // -1..1, petal edge-on at 0
        var face = Math.abs(turn);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(Math.max(0.18, face), 1);
        ctx.globalAlpha = p.alpha * level * (0.45 + face * 0.55);
        ctx.fillStyle = "rgb(" + p.color + ")";
        petalPath(p.w, p.h);
        ctx.fill();

        /* a lighter crease down the middle gives the petal some body */
        ctx.globalAlpha *= 0.35;
        ctx.fillStyle = "rgba(255, 245, 248, .9)";
        petalPath(p.w * 0.38, p.h * 0.82);
        ctx.fill();
        ctx.restore();
      }
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

  window.Petals = {
    start: start,
    stop: stop,
    resize: resize,
    isRunning: function () { return running; },
    setLevel: function (v) { level = Math.max(0, Math.min(1, v)); },
    getLevel: function () { return level; }
  };
})();
