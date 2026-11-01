(function () {
  "use strict";
  var C = window.FUNNEL_CONFIG || {};
  var LEAD_KEY = "funnel_lead";
  var UTM_KEY = "funnel_utm";

  /* ---------- storage helpers (never throw) ---------- */
  function store(key, val) { try { sessionStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function load(key) { try { return JSON.parse(sessionStorage.getItem(key)) || null; } catch (e) { return null; } }

  /* ---------- UTM / click-id capture ---------- */
  (function captureUtm() {
    var p = new URLSearchParams(location.search);
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
    var utm = load(UTM_KEY) || {};
    var found = false;
    keys.forEach(function (k) { if (p.get(k)) { utm[k] = p.get(k); found = true; } });
    if (found || !utm.landing_page) {
      utm.landing_page = utm.landing_page || location.pathname;
      utm.referrer = utm.referrer || document.referrer || "";
      store(UTM_KEY, utm);
    }
  })();

  /* ---------- analytics ---------- */
  function track(event, data) {
    try { if (window.fbq) window.fbq("track", event, data || {}); } catch (e) {}
    try { if (window.gtag) window.gtag("event", event, data || {}); } catch (e) {}
  }
  (function loadAnalytics() {
    if (C.metaPixelId) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", C.metaPixelId);
      window.fbq("track", "PageView");
    }
    if (C.googleAnalyticsId) {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.googleAnalyticsId);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", C.googleAnalyticsId);
    }
  })();

  /* ---------- brand injection ---------- */
  function fillBrand() {
    var b = C.brand || {};
    document.querySelectorAll("[data-brand]").forEach(function (el) {
      var v = b[el.getAttribute("data-brand")];
      if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-brand-phone]").forEach(function (el) {
      if (b.phone) { el.textContent = b.phone; el.href = "tel:" + b.phone.replace(/[^\d+]/g, ""); }
      else el.remove();
    });
    document.querySelectorAll("[data-brand-email]").forEach(function (el) {
      if (b.email) { el.textContent = b.email; el.href = "mailto:" + b.email; }
    });
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    if (b.name) document.title = document.title.replace("{brand}", b.name);
  }

  /* ---------- social proof (only renders real, configured data) ---------- */
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function fillProof() {
    var statsEl = document.getElementById("stats");
    if (statsEl) {
      if (C.stats && C.stats.length) {
        statsEl.querySelector(".stats").innerHTML = C.stats.map(function (s) {
          return '<div class="center"><div class="stat-value">' + esc(s.value) + '</div><div class="stat-label">' + esc(s.label) + "</div></div>";
        }).join("");
      } else statsEl.remove();
    }
    var tEl = document.getElementById("testimonials");
    if (tEl) {
      if (C.testimonials && C.testimonials.length) {
        tEl.querySelector(".grid").innerHTML = C.testimonials.map(function (t) {
          return '<div class="card"><p class="quote">&ldquo;' + esc(t.quote) + '&rdquo;</p><div class="quote-by">' + esc(t.name) + "<small>" + esc(t.company) + "</small></div></div>";
        }).join("");
      } else tEl.remove();
    }
  }

  /* ---------- application (multi-step qualifier) ---------- */
  function initApplication() {
    var form = document.getElementById("apply-form");
    if (!form) return;
    var steps = Array.prototype.slice.call(form.querySelectorAll(".step"));
    var bar = document.querySelector(".progress-bar");
    var backBtn = document.getElementById("back");
    var nextBtn = document.getElementById("next");
    var errEl = document.getElementById("form-error");
    var i = 0;
    var started = false;

    function show(n) {
      steps.forEach(function (s, idx) { s.classList.toggle("active", idx === n); });
      bar.style.width = Math.round(((n + 1) / steps.length) * 100) + "%";
      backBtn.style.visibility = n === 0 ? "hidden" : "visible";
      nextBtn.textContent = n === steps.length - 1 ? "Submit & pick a time →" : "Continue →";
      errEl.textContent = "";
      var first = steps[n].querySelector("input, textarea");
      if (first && first.type !== "radio" && first.type !== "checkbox") first.focus();
    }

    function validate(step) {
      var radios = step.querySelectorAll("input[type=radio]");
      if (radios.length && !step.querySelector("input[type=radio]:checked")) return "Please choose an option.";
      var boxes = step.querySelectorAll("input[type=checkbox][data-group]");
      if (boxes.length && !step.querySelector("input[type=checkbox][data-group]:checked")) return "Pick at least one.";
      var req = step.querySelectorAll("[required]");
      for (var k = 0; k < req.length; k++) {
        if (!req[k].value.trim()) return "Please fill in " + (req[k].getAttribute("data-label") || "all required fields") + ".";
        if (!req[k].checkValidity()) return "Please enter a valid " + (req[k].getAttribute("data-label") || "value") + ".";
      }
      return "";
    }

    // Auto-advance on single-choice questions for a snappy feel.
    form.addEventListener("input", function () { errEl.textContent = ""; });
    form.addEventListener("change", function (e) {
      if (!started) { started = true; track("StartApplication"); }
      if (e.target.type === "radio" && i < steps.length - 1) setTimeout(next, 220);
    });

    function next() {
      var err = validate(steps[i]);
      if (err) { errEl.textContent = err; return; }
      if (i < steps.length - 1) { i++; show(i); } else submit();
    }
    nextBtn.addEventListener("click", next);
    backBtn.addEventListener("click", function () { if (i > 0) { i--; show(i); } });
    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); next(); }
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); next(); });

    function collect() {
      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (data[k]) data[k] = [].concat(data[k], v); else data[k] = v;
      });
      Object.keys(data).forEach(function (k) { if (Array.isArray(data[k])) data[k] = data[k].join(", "); });
      return data;
    }

    function isQualified(d) {
      var dq = C.disqualify || {};
      return !Object.keys(dq).some(function (k) { return (dq[k] || []).indexOf(d[k]) !== -1; });
    }

    function submit() {
      var d = collect();
      var qualified = isQualified(d);
      var payload = Object.assign({}, d, load(UTM_KEY) || {}, {
        qualified: qualified,
        submitted_at: new Date().toISOString(),
        source: "recruiting-funnel",
      });
      store(LEAD_KEY, payload);
      nextBtn.disabled = true;
      nextBtn.textContent = "Submitting…";
      track("Lead", { qualified: qualified });

      var go = function () { location.href = qualified ? "book.html" : "not-a-fit.html"; };
      if (!C.leadWebhookUrl) return go();

      // text/plain avoids a CORS preflight so most webhook tools (Zapier, Make, GHL) accept it.
      var done = false;
      var finish = function () { if (!done) { done = true; go(); } };
      setTimeout(finish, 4000); // never strand the lead on a slow webhook
      fetch(C.leadWebhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).then(finish, finish);
    }

    show(0);
  }

  /* ---------- booking page ---------- */
  function initBooking() {
    var holder = document.getElementById("calendar");
    if (!holder) return;
    var lead = load(LEAD_KEY) || {};
    if (lead.first_name) {
      var hi = document.getElementById("hello-name");
      if (hi) hi.textContent = ", " + lead.first_name;
    }
    if (!C.calendarUrl) {
      holder.innerHTML = '<div class="notice"><strong>Calendar not connected yet.</strong> Set <code>calendarUrl</code> in <code>assets/config.js</code> to your Calendly or Cal.com booking link.</div>';
      return;
    }
    var url;
    try { url = new URL(C.calendarUrl); } catch (e) { return; }
    var name = [lead.first_name, lead.last_name].filter(Boolean).join(" ");
    if (name) url.searchParams.set("name", name);
    if (lead.email) url.searchParams.set("email", lead.email);
    if (/calendly\.com$/.test(url.hostname)) {
      url.searchParams.set("embed_domain", location.hostname || "localhost");
      url.searchParams.set("embed_type", "Inline");
      url.searchParams.set("hide_gdpr_banner", "1");
      if (lead.company) url.searchParams.set("a1", lead.company);
      if (lead.phone) url.searchParams.set("location", lead.phone);
    }
    var f = document.createElement("iframe");
    f.className = "calendar-embed";
    f.src = url.toString();
    f.title = "Book your call";
    holder.appendChild(f);

    // Redirect to thank-you once booked (Calendly & Cal.com both postMessage).
    window.addEventListener("message", function (e) {
      var ev = e.data && (e.data.event || e.data.type);
      if (ev === "calendly.event_scheduled" || ev === "bookingSuccessful" || ev === "booking_successful") {
        track("Schedule");
        location.href = "thank-you.html";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillBrand();
    fillProof();
    initApplication();
    initBooking();
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () { track(el.getAttribute("data-track")); });
    });
  });
})();
