/* =========================================================================
   content.js — pulls the Writing posts and the Gallery drawings straight
   out of the repo, so adding a file to a folder is all it takes to publish.

     writing/*.md   -> the Writing section
     gallery/*.jpg  -> the Gallery section  (png, jpeg, webp, gif, svg too)

   On github.io it reads the folder through the public GitHub API.
   On localhost it reads the directory listing from the dev server, so the
   page looks the same while you are working on it.
   ========================================================================= */
(function () {
  "use strict";

  /* On a *.github.io address the account and repository are worked out from
     the URL, so this keeps working if the repo is transferred or renamed.
     The values below are only the fallback. */
  var CONFIG = {
    owner: "Ivyyyy24381",
    repo: "Athena_personal_website",
    branch: "main",
    writingDir: "writing",
    galleryDir: "gallery"
  };

  (function detectRepo() {
    var host = /^([\w-]+)\.github\.io$/i.exec(location.hostname);
    if (!host) return;
    CONFIG.owner = host[1];
    var seg = location.pathname.split("/").filter(Boolean)[0];
    CONFIG.repo = (seg && !/\.html?$/i.test(seg)) ? seg : host[1] + ".github.io";
  })();

  var IMAGE_RE = /\.(jpe?g|png|webp|gif|svg|avif)$/i;
  var VIDEO_RE = /\.(mp4|webm|mov|m4v)$/i;
  var local = ["localhost", "127.0.0.1", ""].indexOf(location.hostname) !== -1;

  /* ---------------------------------------------------------------- utils */
  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function titleize(name) {
    return name
      .replace(/\.[^.]+$/, "")                          // drop the extension
      .replace(/^\d{4}[-_]\d{2}([-_]\d{2})?[-_]?/, "")  // drop a date prefix
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})/.exec(iso || "");
    if (!m) return "";
    return MONTHS[parseInt(m[2], 10) - 1] + " " + m[1];
  }

  /* --------------------------------------------------- listing a folder */
  function listFolder(dir) {
    if (local) {
      /* the dev server serves a plain HTML directory listing */
      return fetch(dir + "/").then(function (r) {
        if (!r.ok) throw new Error("no folder");
        return r.text();
      }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        return Array.prototype.map.call(doc.querySelectorAll("a"), function (a) {
          var name = decodeURIComponent(a.getAttribute("href") || "").replace(/\/$/, "");
          return { name: name, url: dir + "/" + name };
        }).filter(function (f) { return f.name && f.name.indexOf("/") === -1; });
      });
    }

    var api = "https://api.github.com/repos/" + CONFIG.owner + "/" + CONFIG.repo +
              "/contents/" + dir + "?ref=" + CONFIG.branch;

    return fetch(api).then(function (r) {
      if (!r.ok) throw new Error("github " + r.status);
      return r.json();
    }).then(function (items) {
      /* the files are published alongside the page, so use the relative
         path — same origin, properly cached, and it works for video seeking */
      return items.filter(function (i) { return i.type === "file"; })
                  .map(function (i) { return { name: i.name, url: dir + "/" + i.name }; });
    });
  }

  /* ------------------------------------------------- markdown (a subset) */
  function mdToHtml(md) {
    var blocks = [];

    /* pull fenced code out first so nothing else touches it */
    md = md.replace(/```[\s\S]*?```/g, function (block) {
      var body = block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
      blocks.push("<pre><code>" + esc(body) + "</code></pre>");
      return " BLOCK" + (blocks.length - 1) + " ";
    });

    md = esc(md);

    function inline(t) {
      return t
        .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
        .replace(/_([^_\n]+)_/g, "<em>$1</em>");
    }

    var out = [];
    var list = null;   // "ul" | "ol" | null

    function closeList() {
      if (list) { out.push("</" + list + ">"); list = null; }
    }

    md.split(/\n/).forEach(function (line) {
      var t = line.trim();

      if (!t) { closeList(); return; }

      if (/^ BLOCK\d+ $/.test(t)) { closeList(); out.push(t); return; }

      var h = /^(#{1,4})\s+(.*)$/.exec(t);
      if (h) {
        closeList();
        var n = Math.min(h[1].length + 1, 5);
        out.push("<h" + n + ">" + inline(h[2]) + "</h" + n + ">");
        return;
      }

      if (/^(-{3,}|\*{3,})$/.test(t)) { closeList(); out.push("<hr>"); return; }

      if (/^&gt;\s?/.test(t)) {
        closeList();
        out.push("<blockquote>" + inline(t.replace(/^&gt;\s?/, "")) + "</blockquote>");
        return;
      }

      var ul = /^[-*+]\s+(.*)$/.exec(t);
      if (ul) {
        if (list !== "ul") { closeList(); out.push("<ul>"); list = "ul"; }
        out.push("<li>" + inline(ul[1]) + "</li>");
        return;
      }

      var ol = /^\d+[.)]\s+(.*)$/.exec(t);
      if (ol) {
        if (list !== "ol") { closeList(); out.push("<ol>"); list = "ol"; }
        out.push("<li>" + inline(ol[1]) + "</li>");
        return;
      }

      closeList();
      out.push("<p>" + inline(t) + "</p>");
    });
    closeList();

    return out.join("\n").replace(/ BLOCK(\d+) /g, function (_, i) { return blocks[i]; });
  }

  /* front matter:  ---  title: ...  --- */
  function parseFrontMatter(text) {
    var meta = {};
    var m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
    if (m) {
      m[1].split(/\r?\n/).forEach(function (line) {
        var kv = /^([A-Za-z_-]+)\s*:\s*(.*)$/.exec(line.trim());
        if (kv) meta[kv[1].toLowerCase()] = kv[2].replace(/^["']|["']$/g, "").trim();
      });
      text = text.slice(m[0].length);
    }
    return { meta: meta, body: text };
  }

  function excerptOf(body) {
    var line = body.split(/\n\s*\n/)
      .map(function (b) { return b.trim(); })
      .filter(function (b) { return b && b.charAt(0) !== "#" && b.slice(0, 2) !== "!["; })[0] || "";

    line = line.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
               .replace(/[*_`>#]/g, "")
               .replace(/\s+/g, " ")
               .trim();

    return line.length > 155 ? line.slice(0, 152).replace(/\s\S*$/, "") + "…" : line;
  }

  /* ----------------------------------------------------------- writing */
  function loadWriting() {
    var listEl = document.getElementById("writing-list");
    var noteEl = document.getElementById("writing-note");
    if (!listEl || !noteEl) return;

    listFolder(CONFIG.writingDir).then(function (files) {
      var posts = files.filter(function (f) {
        return /\.md$/i.test(f.name) && !/^readme\.md$/i.test(f.name);
      });

      if (!posts.length) {
        noteEl.textContent =
          "Nothing here yet - add a .md file to the writing/ folder and it will show up.";
        return;
      }

      return Promise.all(posts.map(function (f) {
        return fetch(f.url).then(function (r) { return r.text(); }).then(function (text) {
          var parsed = parseFrontMatter(text);
          var heading = /^#\s+(.*)$/m.exec(parsed.body);
          var dateInName = /^(\d{4}-\d{2}(?:-\d{2})?)/.exec(f.name);
          return {
            title: parsed.meta.title || (heading && heading[1]) || titleize(f.name),
            date: parsed.meta.date || (dateInName && dateInName[1]) || "",
            excerpt: parsed.meta.excerpt || parsed.meta.summary || excerptOf(parsed.body),
            html: mdToHtml(parsed.body.replace(/^#\s+.*$/m, ""))
          };
        });
      })).then(function (parsed) {
        parsed.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

        listEl.innerHTML = parsed.map(function (p, i) {
          return "<li>" +
            (p.date ? '<span class="when">' + esc(formatDate(p.date)) + "</span>" : "") +
            "<h3>" + esc(p.title) + "</h3>" +
            (p.excerpt ? "<p>" + esc(p.excerpt) + "</p>" : "") +
            '<button class="post-toggle" type="button" aria-expanded="false" aria-controls="post-' + i + '">' +
              '<span class="post-toggle-label">Read</span><span class="post-arrow" aria-hidden="true">&rarr;</span>' +
            "</button>" +
            '<div class="post-body" id="post-' + i + '"><div class="post-body-inner">' + p.html + "</div></div>" +
          "</li>";
        }).join("");

        noteEl.hidden = true;
        wirePosts(listEl);
      });
    }).catch(function () {
      noteEl.innerHTML =
        "Posts load from the <code>writing/</code> folder once the repository is public on GitHub.";
    });
  }

  function wirePosts(listEl) {
    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".post-toggle");
      if (!btn) return;
      var li = btn.closest("li");
      var open = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector(".post-toggle-label").textContent = open ? "Close" : "Read";
    });
  }

  /* ----------------------------------------------------------- gallery */
  var images = [];

  function loadGallery() {
    var gridEl = document.getElementById("gallery-grid");
    var noteEl = document.getElementById("gallery-note");
    if (!gridEl || !noteEl) return;

    listFolder(CONFIG.galleryDir).then(function (files) {
      images = files.filter(function (f) {
        return IMAGE_RE.test(f.name) || VIDEO_RE.test(f.name);
      }).map(function (f) {
        f.video = VIDEO_RE.test(f.name);
        return f;
      });

      if (!images.length) {
        noteEl.textContent =
          "No drawings yet - drop image or video files into the gallery/ folder and they will appear here.";
        return;
      }

      gridEl.innerHTML = images.map(function (f, i) {
        var caption = titleize(f.name);
        var media = f.video
          ? '<video src="' + f.url + '" muted loop playsinline preload="metadata"></video>' +
            '<span class="shot-badge" aria-hidden="true">&#9654;</span>'
          : '<img src="' + f.url + '" alt="' + esc(caption) + '" loading="lazy">';

        return '<button class="shot' + (f.video ? " is-video" : "") + '" type="button" data-i="' + i +
                 '" aria-label="Open ' + esc(caption) + (f.video ? " (animation)" : "") + '">' +
                 media +
                 '<span class="shot-caption">' + esc(caption) + "</span>" +
               "</button>";
      }).join("");

      noteEl.hidden = true;
      wirePreviews(gridEl);
      wireLightbox(gridEl);
    }).catch(function () {
      noteEl.innerHTML =
        "Drawings load from the <code>gallery/</code> folder once the repository is public on GitHub.";
    });
  }

  /* video tiles play quietly while the pointer is over them */
  function wirePreviews(gridEl) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    gridEl.addEventListener("pointerenter", function (e) {
      var v = e.target.closest && e.target.closest(".shot.is-video");
      if (v) { var el = v.querySelector("video"); if (el) el.play().catch(function () {}); }
    }, true);

    gridEl.addEventListener("pointerleave", function (e) {
      var v = e.target.closest && e.target.closest(".shot.is-video");
      if (v) {
        var el = v.querySelector("video");
        if (el) { el.pause(); el.currentTime = 0; }
      }
    }, true);
  }

  function wireLightbox(gridEl) {
    var box = document.getElementById("lightbox");
    var img = document.getElementById("lb-img");
    var vid = document.getElementById("lb-video");
    var cap = document.getElementById("lb-caption");
    if (!box) return;

    var current = 0;

    function show(i) {
      current = (i + images.length) % images.length;
      var item = images[current];
      var caption = titleize(item.name);

      if (item.video) {
        img.hidden = true;
        img.removeAttribute("src");
        vid.hidden = false;
        vid.src = item.url;
        vid.play().catch(function () {});
      } else {
        vid.pause();
        vid.hidden = true;
        vid.removeAttribute("src");
        img.hidden = false;
        img.src = item.url;
        img.alt = caption;
      }
      cap.textContent = caption;
    }

    function open(i) {
      show(i);
      box.hidden = false;
      document.body.classList.add("lb-open");
      box.querySelector(".lb-close").focus();
    }

    function close() {
      box.hidden = true;
      vid.pause();
      document.body.classList.remove("lb-open");
    }

    gridEl.addEventListener("click", function (e) {
      var shot = e.target.closest(".shot");
      if (shot) open(parseInt(shot.dataset.i, 10));
    });

    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "ArrowLeft") show(current - 1);
    });
  }

  loadWriting();
  loadGallery();
})();
