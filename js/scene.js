/* =========================================================================
   scene.js — ties the background to how far you have scrolled.

     progress 0.00 - 0.30 : full rain, stormy sky, big peonies behind the title
     progress 0.15 - 0.55 : rain thins out, stars and the moon fade in
     progress 0.60 - 1.00 : the peony garden rises along the bottom
     petals fall the whole way down, thickening as the garden blooms

   Change the STOPS below to re-time the whole scene.
   ========================================================================= */
(function () {
  "use strict";

  var STOPS = {
    rain:   { from: 0.06, to: 0.34 },  // rain goes from full to gone
    sky:    { from: 0.14, to: 0.52 },  // stars fade in
    garden: { from: 0.55, to: 0.90 }   // peonies rise
  };

  var body = document.body;
  var moon = document.querySelector(".moon");
  var heroPeonies = document.querySelector(".hero-peonies");
  var tint = document.querySelector(".sky-tint");
  var garden = document.querySelector(".garden");
  var stems = Array.prototype.slice.call(document.querySelectorAll(".stem-wrap"));

  /* every stem starts growing at a slightly different moment, so the garden
     comes up in a wave instead of all at once */
  var delays = stems.map(function (el, i) {
    return ((i * 0.37) % 1) * 0.42;
  });

  var ticking = false;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* smoothstep so the transitions ease instead of ramping linearly */
  function ramp(p, stop) {
    var t = clamp01((p - stop.from) / (stop.to - stop.from));
    return t * t * (3 - 2 * t);
  }

  function progress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return clamp01(window.scrollY / max);
  }

  function apply() {
    ticking = false;
    var p = progress();

    var clearing = ramp(p, STOPS.rain);      // 0 = pouring, 1 = clear
    var night    = ramp(p, STOPS.sky);       // 0 = storm,   1 = starry
    var bloom    = ramp(p, STOPS.garden);    // 0 = hidden,  1 = full garden

    var calm = body.classList.contains("calm");

    /* rain */
    var rainLevel = 1 - clearing;
    if (window.Rain) {
      window.Rain.setLevel(rainLevel);
      if (!calm) {
        if (rainLevel > 0.02 && !window.Rain.isRunning()) window.Rain.start();
        else if (rainLevel <= 0.02 && window.Rain.isRunning()) window.Rain.stop();
      }
    }

    /* petals — always falling, heaviest once the garden is in bloom */
    var petalLevel = 0.45 + 0.55 * bloom;
    if (window.Petals) {
      window.Petals.setLevel(petalLevel);
      if (!calm && !reduced.matches && !window.Petals.isRunning()) window.Petals.start();
    }

    /* the big blossoms behind the title fade out as the sky clears */
    if (heroPeonies) heroPeonies.style.opacity = (1 - night * 0.88).toFixed(3);

    /* stars */
    if (window.Sky) {
      window.Sky.setLevel(night);
      if (calm || reduced.matches) window.Sky.paintStatic(night);
      else if (night > 0.02) window.Sky.start();
      else window.Sky.stop();
    }

    /* moon + background tint */
    if (moon) {
      moon.style.opacity = night * 0.95;
      moon.style.transform = "translateY(" + (26 - night * 26).toFixed(1) + "px)";
    }
    if (tint) tint.style.opacity = night;

    /* garden — each stem rises out of the bottom edge on its own schedule */
    if (garden) {
      garden.style.opacity = clamp01(bloom * 2.6);
      for (var i = 0; i < stems.length; i++) {
        var d = delays[i];
        var g = clamp01((bloom - d) / (1 - d));
        g = g * g * (3 - 2 * g);
        stems[i].style.transform =
          "translateY(" + ((1 - g) * 100).toFixed(1) + "%) scale(" + (0.88 + g * 0.12).toFixed(3) + ")";
      }
    }

    body.classList.toggle("is-night", night > 0.5);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* pause every animation while the tab is in the background */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (window.Rain) window.Rain.stop();
      if (window.Sky) window.Sky.stop();
      if (window.Petals) window.Petals.stop();
    } else {
      apply();
    }
  });

  window.Scene = { update: apply, stops: STOPS };

  apply();
})();
