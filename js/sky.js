/* =========================================================================
   sky.js — the night sky that appears once the rain clears
   Exposes window.Sky = { setLevel(0..1), start(), stop() }
   ========================================================================= */
(function () {
  "use strict";

  var CONFIG = {
    density:      0.00022,  // stars per square pixel
    maxStars:     460,
    twinkleSpeed: 1.1,
    shootingOdds: 0.0022    // chance per frame once the sky is fully out
  };

  var canvas = document.getElementById("sky");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var stars = [];
  var shooters = [];
  var w = 0, h = 0, dpr = 1;
  var level = 0;          // 0 = hidden, 1 = full night sky
  var running = false;
  var rafId = null;
  var last = 0;
  var t = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function seed() {
    var target = Math.min(Math.round(w * h * CONFIG.density), CONFIG.maxStars);
    stars.length = 0;
    for (var i = 0; i < target; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.92,
        r: rand(0.4, 1.7),
        base: rand(0.25, 1),
        phase: Math.random() * Math.PI * 2,
        rate: rand(0.5, 2.2),
        warm: Math.random() < 0.18   // a few stars lean pink instead of white
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function addShooter() {
    var startX = rand(w * 0.15, w * 0.95);
    var startY = rand(h * 0.05, h * 0.4);
    shooters.push({
      x: startX, y: startY,
      vx: rand(-460, -260), vy: rand(120, 240),
      len: rand(70, 150),
      life: 1
    });
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt * CONFIG.twinkleSpeed;

    ctx.clearRect(0, 0, w, h);

    if (level > 0.01) {
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var twinkle = 0.55 + 0.45 * Math.sin(t * s.rate + s.phase);
        var a = s.base * twinkle * level;
        ctx.fillStyle = s.warm
          ? "rgba(240, 190, 205," + a + ")"
          : "rgba(255, 253, 250," + a + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // brighter stars get a soft bloom
        if (s.r > 1.3) {
          ctx.fillStyle = "rgba(255, 240, 245," + (a * 0.12) + ")";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (level > 0.85 && Math.random() < CONFIG.shootingOdds) addShooter();

      for (var j = shooters.length - 1; j >= 0; j--) {
        var sh = shooters[j];
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        sh.life -= dt * 0.75;
        if (sh.life <= 0 || sh.x < -200 || sh.y > h) { shooters.splice(j, 1); continue; }

        var nx = sh.vx, ny = sh.vy;
        var mag = Math.sqrt(nx * nx + ny * ny) || 1;
        var tailX = sh.x - (nx / mag) * sh.len;
        var tailY = sh.y - (ny / mag) * sh.len;

        var grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, "rgba(255,240,245," + (sh.life * level) + ")");
        grad.addColorStop(1, "rgba(255,240,245,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
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

  window.Sky = {
    start: start,
    stop: stop,
    resize: resize,
    setLevel: function (v) { level = Math.max(0, Math.min(1, v)); },
    getLevel: function () { return level; },
    /* static render for calm mode / reduced motion — stars, no twinkle */
    paintStatic: function (v) {
      stop();
      ctx.clearRect(0, 0, w, h);
      var lv = Math.max(0, Math.min(1, v));
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        ctx.fillStyle = s.warm
          ? "rgba(240, 190, 205," + s.base * lv + ")"
          : "rgba(255, 253, 250," + s.base * lv + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
})();
