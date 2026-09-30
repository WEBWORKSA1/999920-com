/* 999920.com — core site behaviour */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Hidden inbox (assembled only when needed) ---------- */
  function inbox() {
    return (C._m || []).slice().reverse().map(function (n) { return String.fromCharCode(n ^ C._k); }).join("");
  }
  function endpoint() { return "https://formsubmit.co/ajax/" + (C.formAlias || inbox()); }

  /* ---------- Toast ---------- */
  var toastEl;
  window.toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  };
  window.copyText = function (t) {
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast("Copied: " + t); }, function () {
      var ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("Copied: " + t); } catch (e) {} ta.remove();
    });
  };

  /* ---------- Theme ---------- */
  var saved = store.get("theme"); if (saved) document.documentElement.setAttribute("data-theme", saved);
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]"); if (!t) return;
    var cur = document.documentElement.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next); store.set("theme", next);
  });

  /* ---------- Mobile nav ---------- */
  var mb = $(".menu-btn"), nl = $(".nav-links");
  if (mb && nl) mb.addEventListener("click", function () {
    var open = nl.classList.toggle("open"); mb.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* ---------- Mail links: address hidden under the link ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-mail]"); if (!a) return;
    e.preventDefault();
    var subj = encodeURIComponent(a.getAttribute("data-mail") || "Inquiry from 999920.com");
    window.location.href = "mailto:" + inbox() + "?subject=" + subj;
  });

  /* ---------- Copy buttons ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]"); if (b) copyText(b.getAttribute("data-copy"));
  });

  /* ---------- Share buttons ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-share]"); if (!b) return;
    var url = encodeURIComponent(b.getAttribute("data-url") || location.href);
    var text = encodeURIComponent(b.getAttribute("data-text") || document.title);
    var map = {
      x: "https://twitter.com/intent/tweet?text=" + text + "&url=" + url,
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + url,
      whatsapp: "https://wa.me/?text=" + text + "%20" + url,
      pinterest: "https://pinterest.com/pin/create/button/?url=" + url + "&description=" + text,
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + url,
      reddit: "https://www.reddit.com/submit?url=" + url + "&title=" + text
    };
    var k = b.getAttribute("data-share");
    if (k === "native" && navigator.share) { navigator.share({ title: document.title, text: decodeURIComponent(text), url: decodeURIComponent(url) }).catch(function(){}); return; }
    if (k === "copy" || (k === "native" && !navigator.share)) { copyText(decodeURIComponent(url)); return; }
    if (map[k]) window.open(map[k], "_blank", "noopener,width=640,height=560");
  });

  /* ---------- Forms (all routed to the single hidden inbox) ---------- */
  $$("form.js-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $(".form-status", form) || form.appendChild(Object.assign(document.createElement("p"), { className: "form-status" }));
      status.className = "form-status";
      var hp = form.querySelector("[name=_honey]"); if (hp && hp.value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("[type=submit]"); var old = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.innerHTML = "Sending…"; }
      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (k === "_honey") return;
        data[k] = data[k] ? data[k] + ", " + v : v;
      });
      data._subject = "[999920.com] " + (form.getAttribute("data-subject") || "Website form") + (data.name ? " — " + data.name : "");
      data._template = "table"; data._captcha = "false";
      data["Form"] = form.getAttribute("data-subject") || "Website form";
      data["Page"] = location.href; data["Submitted"] = new Date().toString();
      if (data.email) data._replyto = data.email;
      fetch(endpoint(), { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === "false" || j.success === false) throw new Error(j.message || "Send failed"); return j; }); })
        .then(function () {
          status.classList.add("ok");
          status.textContent = form.getAttribute("data-success") || "Thank you! Your message was sent — we'll reply within 1–2 business days.";
          form.reset(); if (form._resetSteps) form._resetSteps();
          if (window.gtag) gtag("event", "generate_lead", { form_name: data.Form });
        })
        .catch(function () {
          status.classList.add("err");
          status.innerHTML = "Sorry, that didn't go through. Please try again, or <a href='contact.html' data-mail='" + (form.getAttribute("data-subject") || "Inquiry") + "'>email us here</a>.";
        })
        .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = old; } });
    });
  });

  /* ---------- Multi-step forms ---------- */
  $$("form[data-steps]").forEach(function (form) {
    var steps = $$(".step", form), bars = $$(".steps i", form), i = 0;
    function show(n) {
      i = n; steps.forEach(function (s, k) { s.classList.toggle("active", k === n); });
      bars.forEach(function (b, k) { b.classList.toggle("on", k <= n); });
    }
    function valid() {
      var ok = true;
      $$("input,select,textarea", steps[i]).forEach(function (el) { if (ok && !el.checkValidity()) { el.reportValidity(); ok = false; } });
      var req = steps[i].getAttribute("data-require-radio");
      if (ok && req && !form.querySelector("[name='" + req + "']:checked")) { toast("Please choose an option"); ok = false; }
      return ok;
    }
    form.addEventListener("click", function (e) {
      if (e.target.closest("[data-next]")) { e.preventDefault(); if (valid()) show(Math.min(i + 1, steps.length - 1)); form.scrollIntoView({ behavior: "smooth", block: "start" }); }
      if (e.target.closest("[data-prev]")) { e.preventDefault(); show(Math.max(i - 1, 0)); }
    });
    form._resetSteps = function () { show(0); };
    show(0);
  });

  /* ---------- Newsletter prefill from URL (?service=...) ---------- */
  var qs = new URLSearchParams(location.search);
  $$("[data-prefill]").forEach(function (el) {
    var v = qs.get(el.getAttribute("data-prefill")); if (!v) return;
    if (el.type === "radio") {
      var key = v.toLowerCase(), val = el.value.toLowerCase();
      var alias = { ring: "ring", gold: "gold", custom: "custom", travel: "honeymoon", planner: "wedding planner" }[key] || key;
      if (val.indexOf(alias) > -1 && !document.querySelector("[name='" + el.name + "']:checked")) el.checked = true;
    } else el.value = v;
  });

  /* ---------- Cookie consent + AdSense loader ---------- */
  var cookie = $("#cookie");
  function loadAds() {
    var A = C.adsense || {};
    if (!A.enabled || !A.client || /X{6}/.test(A.client)) return;
    var s = document.createElement("script"); s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + A.client;
    document.head.appendChild(s);
    $$(".ad-box").forEach(function (box) {
      var slot = (A.slots || {})[box.getAttribute("data-slot")] || "";
      box.classList.add("live");
      box.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + A.client + '" data-ad-slot="' + slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }
  var consent = store.get("consent");
  if (!consent && cookie) cookie.classList.add("show");
  if (consent === "all") loadAds();
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-consent]"); if (!b) return;
    store.set("consent", b.getAttribute("data-consent")); cookie && cookie.classList.remove("show");
    if (b.getAttribute("data-consent") === "all") loadAds();
  });
  if (C.adsense && !C.adsense.enabled) $$(".ad-box").forEach(function (b) { b.textContent = "Advertisement space — available for sponsors"; });

  /* ---------- Donation buttons from config ---------- */
  $$("[data-donate]").forEach(function (el) {
    var k = el.getAttribute("data-donate"), url = (C.donate || {})[k];
    if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener"; }
    else { el.href = "support.html#pledge"; el.setAttribute("title", "Pledge via form — payment link sent by reply"); }
  });

  /* ---------- YouTube lite embeds ---------- */
  var vids = $("#video-grid");
  if (vids) {
    var list = ((C.youtube || {}).featured || []).filter(function (v) { return /^[\w-]{11}$/.test(v.id); });
    if (list.length) {
      vids.innerHTML = list.map(function (v) {
        return '<div><div class="video" data-yt="' + v.id + '" role="button" tabindex="0" aria-label="Play ' + v.title + '"><img loading="lazy" src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt=""><span class="play">▶</span></div><h3 style="margin-top:10px">' + v.title + "</h3></div>";
      }).join("");
    }
  }
  document.addEventListener("click", function (e) {
    var v = e.target.closest("[data-yt]"); if (!v) return;
    v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + v.getAttribute("data-yt") + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube video"></iframe>';
  });
  $$("[data-yt-channel]").forEach(function (a) { var u = (C.youtube || {}).channelUrl; if (u) a.href = u; });
  $$("[data-social]").forEach(function (a) { var u = (C.social || {})[a.getAttribute("data-social")]; if (u) { a.href = u; a.hidden = false; } else a.hidden = true; });

  /* ---------- Affiliate tag ---------- */
  if (C.amazonTag) $$("a[data-aff]").forEach(function (a) { a.href += (a.href.indexOf("?") > -1 ? "&" : "?") + "tag=" + encodeURIComponent(C.amazonTag); });

  /* ---------- Reveal, back-to-top, year ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  var tt = $(".to-top");
  if (tt) addEventListener("scroll", function () { tt.classList.toggle("show", scrollY > 700); }, { passive: true });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
