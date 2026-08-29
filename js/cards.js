/* =========================================================================
   cards.js — the Interests cards: expand to read more, tilt toward the cursor
   ========================================================================= */
(function () {
  "use strict";

  var cards = Array.prototype.slice.call(document.querySelectorAll(".feature-card"));
  if (!cards.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var MAX_TILT = 6;   // degrees

  var openCard = null;

  /* ---- expand / collapse ---- */
  function setOpen(card, open) {
    var btn = card.querySelector(".fc-more");
    var label = card.querySelector(".fc-more-label");

    card.classList.toggle("is-open", open);
    if (btn) btn.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Close" : "Read more";

    if (open) {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    }
  }

  function close() {
    if (!openCard) return;
    setOpen(openCard, false);
    openCard = null;
  }

  cards.forEach(function (card) {
    var btn = card.querySelector(".fc-more");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var isOpen = card.classList.contains("is-open");

      if (openCard && openCard !== card) setOpen(openCard, false);

      if (isOpen) {
        setOpen(card, false);
        openCard = null;
      } else {
        setOpen(card, true);
        openCard = card;

        /* if the card ended up above the fold after the layout shifted, bring it back */
        requestAnimationFrame(function () {
          var box = card.getBoundingClientRect();
          if (box.top < 70) {
            window.scrollTo({
              top: window.scrollY + box.top - 90,
              behavior: reduced.matches ? "auto" : "smooth"
            });
          }
        });
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !openCard) return;
    var btn = openCard.querySelector(".fc-more");
    close();
    if (btn) btn.focus();
  });

  /* ---- tilt toward the pointer ---- */
  function tiltable(card) {
    return fine.matches &&
           !reduced.matches &&
           !document.body.classList.contains("calm") &&
           !card.classList.contains("is-open");
  }

  cards.forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      if (!tiltable(card)) return;
      var box = card.getBoundingClientRect();
      var px = (e.clientX - box.left) / box.width - 0.5;   // -0.5 .. 0.5
      var py = (e.clientY - box.top) / box.height - 0.5;
      card.style.setProperty("--ry", (px * MAX_TILT * 2).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-py * MAX_TILT * 2).toFixed(2) + "deg");
    });

    card.addEventListener("pointerleave", function () {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });
})();
