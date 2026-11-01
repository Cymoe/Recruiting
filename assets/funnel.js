(function () {
  "use strict";
  var C = window.FUNNEL_CONFIG || {};

  /* ---------- analytics ---------- */
  function track(event, data) {
    try { if (window.fbq) window.fbq("track", event, data || {}); } catch (e) {}
    try { if (window.gtag) window.gtag("event", event, data || {}); } catch (e) {}
  }
  if (C.metaPixelId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", C.metaPixelId);
    window.fbq("track", "PageView");
  }
  if (C.googleAnalyticsId) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.googleAnalyticsId);
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", C.googleAnalyticsId);
  }

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  /* ---------- brand ---------- */
  function fillBrand() {
    var b = C.brand || {};
    document.querySelectorAll("[data-brand]").forEach(function (el) {
      var v = b[el.getAttribute("data-brand")];
      if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-brand-email]").forEach(function (el) {
      if (b.email) { el.textContent = b.email; el.href = "mailto:" + b.email; } else el.remove();
    });
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- video: autoplays muted with a "click to unmute" overlay ---------- */
  function initVideo() {
    var box = document.getElementById("video");
    if (!box) return;
    var raw = (C.videoUrl || "").trim();
    if (!raw) {
      box.innerHTML = '<div class="video-placeholder"><div><strong>Your video goes here</strong><br>Set <code>videoUrl</code> in <code>assets/config.js</code></div></div>';
      return;
    }
    var url; try { url = new URL(raw); } catch (e) { return; }
    var host = url.hostname.replace(/^www\./, "");
    var unmute = null;

    if (/\.(mp4|webm|mov)$/i.test(url.pathname)) {
      var v = document.createElement("video");
      v.src = raw; v.autoplay = true; v.muted = true; v.playsInline = true; v.loop = false;
      v.setAttribute("playsinline", "");
      box.appendChild(v);
      unmute = function () { v.muted = false; v.currentTime = 0; v.controls = true; v.play(); };
    } else if (host === "youtu.be" || /youtube\.com$/.test(host)) {
      var id = host === "youtu.be" ? url.pathname.slice(1) : (url.searchParams.get("v") || url.pathname.split("/").pop());
      var yt = frame("https://www.youtube.com/embed/" + encodeURIComponent(id) +
        "?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1");
      box.appendChild(yt);
      unmute = function () {
        ["unMute", "seekTo"].forEach(function (fn) {
          yt.contentWindow.postMessage(JSON.stringify({ event: "command", func: fn, args: fn === "seekTo" ? [0, true] : [] }), "*");
        });
      };
    } else if (/vimeo\.com$/.test(host)) {
      var vid = url.pathname.split("/").filter(Boolean).pop();
      var vm = frame("https://player.vimeo.com/video/" + encodeURIComponent(vid) + "?autoplay=1&muted=1&playsinline=1&title=0&byline=0&portrait=0");
      box.appendChild(vm);
      unmute = function () {
        vm.contentWindow.postMessage(JSON.stringify({ method: "setCurrentTime", value: 0 }), "*");
        vm.contentWindow.postMessage(JSON.stringify({ method: "setVolume", value: 1 }), "*");
      };
    } else if (/wistia\.(com|net)$/.test(host)) {
      var wid = url.pathname.split("/").filter(Boolean).pop();
      box.appendChild(frame("https://fast.wistia.net/embed/iframe/" + encodeURIComponent(wid) + "?videoFoam=true&playerColor=2aa8f2"));
    } else {
      box.appendChild(frame(raw));
    }

    if (unmute) {
      var o = document.createElement("button");
      o.className = "unmute";
      o.type = "button";
      o.innerHTML = '<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>' +
        "<span>Your Video Is Playing</span><span>Click To Unmute</span>";
      o.addEventListener("click", function () { unmute(); o.remove(); track("VideoUnmute"); });
      box.appendChild(o);
    }

    function frame(src) {
      var f = document.createElement("iframe");
      f.src = src;
      f.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
      f.allowFullscreen = true;
      f.title = "Video";
      return f;
    }
  }

  /* ---------- booking: iClosed widget is pasted in index.html; add a backup link ---------- */
  function initBooking() {
    var holder = document.getElementById("calendar");
    if (!holder) return;
    var widget = holder.querySelector(".iclosed-widget");
    if (!widget) return;
    setTimeout(function () {
      if (holder.querySelector("iframe")) return;
      widget.style.display = "none"; // collapse the empty 620px box
      var b = document.createElement("div");
      b.className = "fallback";
      b.innerHTML = "<p>Calendar not showing?</p>" +
        '<a class="btn" href="' + esc(widget.getAttribute("data-url")) + '">Open The Calendar →</a>';
      b.querySelector("a").addEventListener("click", function () { track("ClickBook"); });
      holder.appendChild(b);
    }, 8000);

    // Calendly / Cal.com / iClosed (if it posts a message): fire a conversion event when booked.
    window.addEventListener("message", function (e) {
      var d = e.data, ev = d && (d.event || d.type || d.action);
      if (typeof ev === "string" && /scheduled|booked|bookingSuccessful|booking_success/i.test(ev)) track("Schedule");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillBrand();
    initVideo();
    initBooking();
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () { track(el.getAttribute("data-track")); });
    });
  });
})();
