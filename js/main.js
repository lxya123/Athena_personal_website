/* =========================================================================
   main.js — nav, scroll reveal, active-section highlight, calm mode
   ========================================================================= */
(function () {
  "use strict";

  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- mobile menu ---- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- scroll reveal ---- */
  var revealables = document.querySelectorAll(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---- highlight the nav link for the section in view ---- */
  var sections = document.querySelectorAll("main section[id]");
  var links = {};
  document.querySelectorAll(".nav a").forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- calm mode: stops rain, flicker, and drifting peonies ---- */
  var calmBtn = document.getElementById("motion-toggle");
  var STORAGE_KEY = "athena:calm";

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { return false; }
  }
  function writeStored(on) {
    try { localStorage.setItem(STORAGE_KEY, on ? "1" : "0"); } catch (e) { /* private mode */ }
  }

  function setCalm(on) {
    body.classList.toggle("calm", on);
    if (calmBtn) {
      calmBtn.setAttribute("aria-pressed", String(on));
      calmBtn.querySelector(".motion-label").textContent = on ? "Calm mode: on" : "Calm mode";
    }
    if (on) {
      if (window.Rain) window.Rain.stop();
      if (window.Sky) window.Sky.stop();
      if (window.Petals) window.Petals.stop();
    }
    /* let the scene re-apply the right rain / star / garden levels */
    if (window.Scene) window.Scene.update();
  }

  var startCalm = reduced || readStored();
  setCalm(startCalm);

  if (calmBtn) {
    calmBtn.addEventListener("click", function () {
      var next = !body.classList.contains("calm");
      setCalm(next);
      writeStored(next);
    });
  }

  /* ---- footer year ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
