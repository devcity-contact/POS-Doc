/* RetailOS documentation site — shared behaviour.
   Builds the top bar, sidebar, on-this-page TOC, search, theme toggle,
   copy buttons and Mermaid diagrams. Works from file:// with no server. */
(function () {
  "use strict";

  // Single source of truth for navigation. Add a page here and in search-index.js.
  var NAV = [
    { group: "Start here", items: [
      ["index.html", "Overview"],
      ["glossary.html", "Glossary"]
    ]},
    { group: "Business analysis", items: [
      ["requirements.html", "Requirements & scope"],
      ["roadmap.html", "Roadmap & phases"],
      ["mvp.html", "MVP build list"],
      ["plans.html", "Plans"],
      ["build-order.html", "Build order"]
    ]},
    { group: "User interface", items: [
      ["ui-screens.html", "Screens & navigation"],
      ["ui-design.html", "UI design & wireframes"],
      ["stitch-prompts.html", "Google Stitch prompts"],
      ["prototype/index.html", "Clickable prototype ↗"]
    ]},
    { group: "Architecture", items: [
      ["architecture.html", "System architecture"],
      ["tech-stack.html", "Technology stack"],
      ["modules.html", "Backend modules"],
      ["extensions.html", "Industry extensions"],
      ["data-model.html", "Data model"],
      ["data-dictionary.html", "Data dictionary"],
      ["offline-sync.html", "Offline & sync"],
      ["flows.html", "Key flows"],
      ["api.html", "API design"],
      ["endpoints.html", "API endpoints"]
    ]},
    { group: "Security", items: [
      ["security.html", "Security architecture"]
    ]},
    { group: "Operations", items: [
      ["deployment.html", "Deployment & CI/CD"],
      ["operations.html", "Monitoring & runbooks"],
      ["cost.html", "Cost & scaling"]
    ]},
    { group: "Engineering", items: [
      ["dev-guide.html", "Developer guide"],
      ["repository.html", "Repository & GitHub"],
      ["branches.html", "Branches & naming"],
      ["adr.html", "Decision records"],
      ["ai-guide.html", "Guide for AI agents"]
    ]}
  ];

  var FLAT = [];
  NAV.forEach(function (g) { g.items.forEach(function (i) { FLAT.push(i); }); });

  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (here === "") here = "index.html";

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }

  function slug(t) {
    return t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }

  // ---------- Top bar ----------
  var topbar = document.getElementById("topbar");
  if (topbar) {
    topbar.className = "topbar";
    topbar.innerHTML =
      '<button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu">☰</button>' +
      '<a class="brand" href="index.html"><span class="brand-mark">R</span>RetailOS <small>System design · DevCity</small></a>' +
      '<div class="search-wrap"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      '<input id="search" type="search" placeholder="Search the docs  ( / )" autocomplete="off" aria-label="Search">' +
      '<div class="search-results" id="searchResults" role="listbox"></div></div>' +
      '<button class="icon-btn" id="themeBtn" aria-label="Toggle theme">◐ Theme</button>';
  }

  // ---------- Sidebar ----------
  var sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.className = "sidebar";
    var html = "";
    NAV.forEach(function (g) {
      html += "<h4>" + g.group + "</h4>";
      g.items.forEach(function (i) {
        html += '<a href="' + i[0] + '"' + (i[0] === here ? ' class="active" aria-current="page"' : "") + ">" + i[1] + "</a>";
      });
    });
    sidebar.innerHTML = html;
  }
  var menuBtn = document.getElementById("menuBtn");
  if (menuBtn) menuBtn.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });

  // ---------- Headings: ids + anchors + TOC ----------
  var article = document.querySelector(".content article") || document.querySelector(".content");
  var heads = article ? article.querySelectorAll("h2, h3") : [];
  var used = {};
  Array.prototype.forEach.call(heads, function (h) {
    if (!h.id) {
      var s = slug(h.textContent) || "section";
      while (used[s]) s += "-x";
      h.id = s;
    }
    used[h.id] = true;
    var a = document.createElement("a");
    a.className = "anchor"; a.href = "#" + h.id; a.textContent = "#"; a.setAttribute("aria-label", "Link to section");
    h.appendChild(a);
  });
  var toc = document.getElementById("toc");
  if (toc && heads.length) {
    toc.className = "toc";
    var t = "<h5>On this page</h5>";
    Array.prototype.forEach.call(heads, function (h) {
      var txt = h.firstChild && h.firstChild.nodeType === 3 ? h.childNodes[0].textContent : h.textContent.replace(/#$/, "");
      t += '<a class="' + (h.tagName === "H3" ? "l3" : "l2") + '" href="#' + h.id + '">' + txt.trim() + "</a>";
    });
    toc.innerHTML = t;
    var links = toc.querySelectorAll("a");
    var onScroll = function () {
      var cur = null;
      Array.prototype.forEach.call(heads, function (h) { if (h.getBoundingClientRect().top < 120) cur = h.id; });
      Array.prototype.forEach.call(links, function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + cur); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Prev / next ----------
  if (article && !document.querySelector(".page-nav")) {
    var idx = -1;
    FLAT.forEach(function (i, n) { if (i[0] === here) idx = n; });
    if (idx >= 0) {
      var nav = document.createElement("nav");
      nav.className = "page-nav";
      var prev = FLAT[idx - 1], next = FLAT[idx + 1];
      nav.innerHTML =
        (prev ? '<a href="' + prev[0] + '"><small>← Previous</small>' + prev[1] + "</a>" : "<span></span>") +
        (next ? '<a class="next" href="' + next[0] + '"><small>Next →</small>' + next[1] + "</a>" : "<span></span>");
      article.appendChild(nav);
    }
  }

  // ---------- Tables: wrap for horizontal scroll ----------
  Array.prototype.forEach.call(document.querySelectorAll(".content table"), function (tb) {
    if (tb.parentElement.classList.contains("table-wrap")) return;
    var w = document.createElement("div"); w.className = "table-wrap";
    tb.parentNode.insertBefore(w, tb); w.appendChild(tb);
  });

  // ---------- Copy buttons ----------
  Array.prototype.forEach.call(document.querySelectorAll(".content pre:not(.mermaid)"), function (pre) {
    var b = document.createElement("button");
    b.className = "copy-btn"; b.type = "button"; b.textContent = "Copy";
    b.addEventListener("click", function () {
      var txt = pre.innerText.replace(/Copy$/, "").trim();
      var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1200); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
    });
    pre.appendChild(b);
  });

  // ---------- Search ----------
  var input = document.getElementById("search");
  var box = document.getElementById("searchResults");
  var INDEX = window.SEARCH_INDEX || [];
  var sel = -1;
  function render(q) {
    q = q.trim().toLowerCase();
    if (!q) { box.classList.remove("open"); return; }
    var words = q.split(/\s+/);
    var hits = INDEX.map(function (e) {
      var hay = (e.t + " " + (e.k || "")).toLowerCase();
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var p = hay.indexOf(words[i]);
        if (p < 0) return null;
        score += p === 0 ? 3 : 1;
        if (e.t.toLowerCase().indexOf(words[i]) >= 0) score += 2;
      }
      return { e: e, s: score };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 14);
    sel = -1;
    box.innerHTML = hits.length
      ? hits.map(function (h) { return '<a href="' + h.e.u + '"><div>' + h.e.t + '</div><div class="sr-page">' + h.e.p + "</div></a>"; }).join("")
      : '<div class="sr-empty">No matches. Try a module name, table, or flow.</div>';
    box.classList.add("open");
  }
  if (input) {
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (ev) {
      var items = box.querySelectorAll("a");
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        sel = ev.key === "ArrowDown" ? Math.min(sel + 1, items.length - 1) : Math.max(sel - 1, 0);
        Array.prototype.forEach.call(items, function (a, n) { a.classList.toggle("sel", n === sel); });
      } else if (ev.key === "Enter" && items.length) {
        location.href = items[Math.max(sel, 0)].getAttribute("href");
      } else if (ev.key === "Escape") { box.classList.remove("open"); input.blur(); }
    });
    document.addEventListener("click", function (ev) { if (!ev.target.closest(".search-wrap")) box.classList.remove("open"); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        ev.preventDefault(); input.focus();
      }
    });
  }

  // ---------- Fit-to-width toggle for large diagrams ----------
  Array.prototype.forEach.call(document.querySelectorAll("[data-fit-toggle]"), function (b) {
    b.addEventListener("click", function () {
      var t = document.getElementById(b.getAttribute("data-fit-toggle")); if (!t) return;
      var on = t.classList.toggle("fit");
      b.textContent = on ? "Actual size" : "Fit to width";
    });
  });

  // ---------- Theme + Mermaid ----------
  function isDark() {
    var t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  var diagrams = document.querySelectorAll("pre.mermaid");
  Array.prototype.forEach.call(diagrams, function (d) { d.dataset.src = d.textContent; });

  function drawDiagrams() {
    if (!window.mermaid || !diagrams.length) return;
    window.mermaid.initialize({
      startOnLoad: false,
      theme: isDark() ? "dark" : "default",
      securityLevel: "strict",
      fontFamily: "Segoe UI, system-ui, sans-serif",
      flowchart: { curve: "basis", htmlLabels: true },
      sequence: { mirrorActors: false, showSequenceNumbers: false },
      er: { useMaxWidth: true }
    });
    Array.prototype.forEach.call(diagrams, function (d) {
      d.removeAttribute("data-processed");
      d.textContent = d.dataset.src;
    });
    try { window.mermaid.run({ nodes: diagrams }); } catch (e) { /* source stays readable */ }
  }
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store("retailos-theme", next);
    drawDiagrams();
  });
  drawDiagrams();
})();
