/* 999920.com — interactive tools */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var CODES = window.LOVE_CODES || [], DIG = window.DIGITS || {}, Z = window.ZODIAC || [], REL = window.ZODIAC_REL || {}, FEST = window.FESTIVALS || [];
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var byCode = {}; CODES.forEach(function (c) { byCode[c.code] = c; });

  /* ======== 1. NUMBER DECODER ======== */
  function decode(num) {
    num = String(num).replace(/\D/g, "").slice(0, 24);
    if (!num) return null;
    if (byCode[num] && num.length > 1) return { input: num, exact: byCode[num], parts: [{ code: num, known: byCode[num] }] };
    // DP segmentation: minimise number of pieces, prefer known multi-digit codes
    var n = num.length, best = new Array(n + 1).fill(null); best[0] = { cost: 0, parts: [] };
    for (var i = 0; i < n; i++) {
      if (!best[i]) continue;
      for (var L = 1; L <= Math.min(7, n - i); L++) {
        var piece = num.substr(i, L), known = byCode[piece] && (L > 1 || piece === "8");
        var cost = best[i].cost + (known ? 1 : (L === 1 ? 2.2 : 99));
        if (!known && L > 1) continue;
        if (!best[i + L] || cost < best[i + L].cost) best[i + L] = { cost: cost, parts: best[i].parts.concat([{ code: piece, known: known ? byCode[piece] : null }]) };
      }
    }
    return { input: num, exact: null, parts: best[n].parts };
  }
  function vibe(parts) {
    var t = { love: 0, lucky: 0, fun: 0, avoid: 0 };
    parts.forEach(function (p) {
      if (p.known) t[p.known.tag]++; else {
        var d = p.code; if ("2059".indexOf(d) > -1) t.love += .5; if ("68".indexOf(d) > -1) t.lucky += .6; if (d === "4") t.avoid += .6;
      }
    });
    var top = Object.keys(t).sort(function (a, b) { return t[b] - t[a]; })[0];
    return { love: ["💞 Romantic", "badge red"], lucky: ["🍀 Lucky / prosperous", "badge green"], fun: ["😄 Playful slang", "badge"], avoid: ["⚠️ Use with care", "badge red"] }[t[top] ? top : "love"];
  }
  function renderDecode(res, out) {
    if (!res) { out.innerHTML = '<p class="muted">Type any number — e.g. 999920, 520, 1314, 5201314.</p>'; return; }
    var chips = res.parts.map(function (p) {
      if (p.known) return '<div class="chip' + (p.known.tag === "lucky" ? " gold" : "") + '"><b>' + p.code + '</b><span>' + esc(p.known.zh) + '</span><em>' + esc(p.known.en) + "</em></div>";
      var d = DIG[p.code] || {}; return '<div class="chip gold"><b>' + p.code + '</b><span>' + esc(d.zh || "") + '</span><em>' + esc(d.en || "") + "</em></div>";
    }).join("");
    var zh = res.parts.map(function (p) { return p.known ? p.known.zh.split(" / ")[0] : (DIG[p.code] ? DIG[p.code].zh.split(" / ")[0] : p.code); }).join("");
    var en = res.exact ? res.exact.en : res.parts.map(function (p) { return p.known ? p.known.en : (DIG[p.code] || {}).en; }).join(" · ");
    var py = res.exact ? res.exact.py : res.parts.map(function (p) { return p.known ? p.known.py : (DIG[p.code] || {}).py; }).join(" ");
    var v = vibe(res.parts);
    var share = "https://999920.com/decoder.html?n=" + res.input;
    out.innerHTML =
      '<div class="split-code">' + chips + "</div>" +
      '<p style="font-size:1.35rem;margin:6px 0"><span class="cn">' + esc(zh) + '</span></p>' +
      '<p class="muted" style="margin:0 0 6px"><em>' + esc(py) + "</em></p>" +
      '<p style="font-size:1.15rem;font-weight:700;margin:0 0 10px">“' + esc(en) + '”</p>' +
      '<span class="' + v[1] + '">' + v[0] + "</span>" +
      (res.exact ? ' <span class="badge green">Known code</span>' : ' <span class="badge">Homophone reading</span>') +
      '<div class="row" style="margin-top:16px">' +
      '<a class="btn btn-primary btn-sm" href="love-card.html?code=' + res.input + '">💌 Make a love card</a>' +
      '<button class="btn btn-ghost btn-sm" data-copy="' + res.input + " = " + esc(en) + '">Copy meaning</button>' +
      '<button class="btn btn-ghost btn-sm" data-share="native" data-url="' + share + '" data-text="' + res.input + " means “" + esc(en) + '” in Chinese number code">Share</button>' +
      "</div>";
  }
  document.querySelectorAll("[data-decoder]").forEach(function (box) {
    var inp = $("input", box), out = $(".result", box);
    var q = new URLSearchParams(location.search).get("n");
    if (q && inp) inp.value = q.replace(/\D/g, "");
    function go() { renderDecode(inp.value ? decode(inp.value) : null, out); }
    inp.addEventListener("input", go); go();
    box.querySelectorAll("[data-try]").forEach(function (b) { b.addEventListener("click", function () { inp.value = b.getAttribute("data-try"); go(); }); });
  });

  /* ======== 2. CODES TABLE ======== */
  var tbl = $("#codes-table");
  if (tbl) {
    var filt = "all", qq = "";
    function draw() {
      var rows = CODES.filter(function (c) { return (filt === "all" || c.tag === filt) && (!qq || (c.code + c.zh + c.py + c.en).toLowerCase().indexOf(qq) > -1); });
      tbl.innerHTML = rows.map(function (c) {
        var tg = { love: "badge red", lucky: "badge green", fun: "badge", avoid: "badge red" }[c.tag];
        return "<tr><td><b style='font-size:1.1rem'>" + c.code + "</b></td><td class='cn'>" + esc(c.zh) + "</td><td><em>" + esc(c.py) + "</em></td><td>" + esc(c.en) + "</td><td><span class='" + tg + "'>" + c.tag + "</span></td><td><button class='copy' data-copy='" + c.code + "'>Copy</button> <a class='copy' href='love-card.html?code=" + c.code + "'>Card</a></td></tr>";
      }).join("") || "<tr><td colspan=6>No codes match.</td></tr>";
    }
    document.querySelectorAll("[data-filter]").forEach(function (b) {
      b.addEventListener("click", function () { filt = b.getAttribute("data-filter"); document.querySelectorAll("[data-filter]").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    });
    var qs = $("#codes-search"); if (qs) qs.addEventListener("input", function () { qq = qs.value.toLowerCase(); draw(); });
    draw();
  }

  /* ======== 3. ZODIAC & LUCKY NUMBERS ======== */
  function zodiacOf(y) { return Z[((y - 4) % 12 + 12) % 12]; }
  function digitalRoot(s) { var n = String(s).replace(/\D/g, "").split("").reduce(function (a, b) { return a + +b; }, 0); while (n > 9) n = String(n).split("").reduce(function (a, b) { return a + +b; }, 0); return n; }
  var lf = $("#lucky-form");
  if (lf) lf.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = lf.dob.value; if (!d) return;
    var dt = new Date(d + "T00:00:00"), y = dt.getFullYear(), z = zodiacOf(y), root = digitalRoot(d);
    var early = dt.getMonth() < 1 || (dt.getMonth() === 1 && dt.getDate() < 21);
    var personal = [root, z.lucky[0], 9, 8].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var code = "" + z.lucky.join("") + root;
    $("#lucky-out").innerHTML =
      '<div class="grid g2"><div class="card"><div class="ico">' + z.emoji + '</div><h3>Year of the ' + z.en + ' <span class="cn">(' + z.zh + ')</span></h3><p>Traditional lucky numbers: <b>' + z.lucky.join(", ") + "</b><br>Lucky colours: " + z.colors + "</p>" +
      (early ? '<p class="small muted" style="margin-top:8px">Born in January/early February? The zodiac year starts at Lunar New Year, so check the previous animal (' + zodiacOf(y - 1).en + ") too.</p>" : "") + "</div>" +
      '<div class="card"><div class="ico">🔢</div><h3>Your personal number: ' + root + '</h3><p>Birth-date digit sum (numerology). Meaning in Chinese: <b class="cn">' + esc(DIG[root].zh) + "</b> — " + esc(DIG[root].note) + '.</p><p style="margin-top:8px">Your lucky set: <b>' + personal.join(" · ") + "</b></p></div></div>" +
      '<p class="center" style="margin-top:18px"><a class="btn btn-gold" href="decoder.html?n=' + code + '">Decode your lucky code ' + code + "</a></p>";
  });
  var cf = $("#compat-form");
  if (cf) {
    [cf.a, cf.b].forEach(function (s) { s.innerHTML = Z.map(function (z, i) { return "<option value='" + i + "'>" + z.emoji + " " + z.en + " " + z.zh + "</option>"; }).join(""); });
    cf.b.value = 1;
    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      var a = +cf.a.value, b = +cf.b.value, pair = function (arr) { return arr.some(function (g) { return g.indexOf(a) > -1 && g.indexOf(b) > -1; }); };
      var score, label, text;
      if (a === b) { score = 78; label = "Same sign — mirror match"; text = "You understand each other instinctively; watch for the same blind spots."; }
      else if (pair(REL.harmony)) { score = 96; label = "六合 Six Harmonies — ideal match"; text = "A classic 'secret friend' pairing: supportive, complementary and long-lasting — 久久!"; }
      else if (pair(REL.trine)) { score = 90; label = "三合 Trine — natural allies"; text = "Shared values and pace. A strong, cooperative partnership."; }
      else if (pair(REL.clash)) { score = 52; label = "六冲 Clash — opposites"; text = "Sparks fly both ways. Traditional advice: patience, compromise and a well-chosen wedding date."; }
      else { score = 72; label = "Neutral — build it together"; text = "No traditional bond or clash: your relationship is what you make it."; }
      $("#compat-out").innerHTML = '<div class="card center"><div class="score">' + score + '%</div><div class="meter" style="margin:10px 0"><i style="width:' + score + '%"></i></div><h3>' + label + "</h3><p>" + text + '</p><p class="small muted" style="margin-top:10px">For entertainment, based on traditional zodiac groupings.</p></div>';
    });
  }

  /* ======== 4. LOVE NAME CALCULATOR (for fun) ======== */
  var lc = $("#lovecalc-form");
  if (lc) lc.addEventListener("submit", function (e) {
    e.preventDefault();
    var s = (lc.n1.value + "❤" + lc.n2.value).toLowerCase().replace(/\s/g, ""), h = 0;
    var s2 = [lc.n1.value.toLowerCase().trim(), lc.n2.value.toLowerCase().trim()].sort().join("❤");
    for (var i = 0; i < s2.length; i++) h = (h * 31 + s2.charCodeAt(i)) >>> 0;
    var pct = 60 + (h % 40); if (s.length < 3) return;
    $("#lovecalc-out").innerHTML = '<div class="card center"><div class="score">' + pct + '%</div><div class="meter" style="margin:10px 0"><i style="width:' + pct + '%"></i></div><p>' + (pct > 90 ? "久久久久爱你 — a forever match!" : pct > 78 ? "520 energy: strong and sweet." : "Good foundations — keep writing your story.") + '</p><p class="small muted">Just for fun — real love is built, not calculated.</p></div>';
  });

  /* ======== 5. CALENDAR & COUNTDOWNS ======== */
  function nextDate(f, from) {
    from = from || new Date(); var today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    if (f.type === "fixed") {
      var p = f.md.split("-"), d = new Date(today.getFullYear(), +p[0] - 1, +p[1]);
      if (d < today) d = new Date(today.getFullYear() + 1, +p[0] - 1, +p[1]); return d;
    }
    for (var i = 0; i < f.dates.length; i++) { var x = new Date(f.dates[i] + "T00:00:00"); if (x >= today) return x; }
    return null;
  }
  function cd(d) {
    var ms = d - new Date(); if (ms < 0) ms = 0;
    var D = Math.floor(ms / 864e5), H = Math.floor(ms / 36e5) % 24, M = Math.floor(ms / 6e4) % 60, S = Math.floor(ms / 1e3) % 60;
    return "<div><b>" + D + "</b><small>days</small></div><div><b>" + H + "</b><small>hrs</small></div><div><b>" + M + "</b><small>min</small></div><div><b>" + S + "</b><small>sec</small></div>";
  }
  var cal = $("#calendar-grid"), mini = $("#next-festival");
  if (cal || mini) {
    var items = FEST.map(function (f) { return { f: f, d: nextDate(f) }; }).filter(function (x) { return x.d; }).sort(function (a, b) { return a.d - b.d; });
    var fmt = function (d) { return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" }); };
    function tick() {
      if (cal) cal.innerHTML = items.map(function (x) {
        return '<div class="card reveal in"><span class="badge red cn">' + esc(x.f.zh) + '</span><h3 style="margin-top:6px">' + esc(x.f.name) + '</h3><p class="small muted">' + fmt(x.d) + "</p><p>" + esc(x.f.desc) + '</p><div class="countdown">' + cd(x.d) + "</div></div>";
      }).join("");
      if (mini && items[0]) mini.innerHTML = '<p class="small muted" style="margin:0">Next love date</p><h3 style="margin:4px 0">' + esc(items[0].f.name) + ' <span class="cn">' + esc(items[0].f.zh) + '</span></h3><p class="small muted" style="margin:0">' + fmt(items[0].d) + '</p><div class="countdown">' + cd(items[0].d) + "</div>";
    }
    tick(); setInterval(tick, 1000);
  }

  /* ======== 6. AUSPICIOUS DATE (NUMBER-HARMONY) FINDER ======== */
  var df = $("#date-form");
  if (df) {
    var yNow = new Date().getFullYear();
    df.year.innerHTML = [0, 1, 2, 3].map(function (k) { return "<option>" + (yNow + k) + "</option>"; }).join(""); df.year.value = yNow + 1;
    df.addEventListener("submit", function (e) {
      e.preventDefault();
      var Y = +df.year.value, M = df.month.value, wk = df.weekend.checked, list = [];
      for (var d = new Date(Y, 0, 1); d.getFullYear() === Y; d.setDate(d.getDate() + 1)) {
        if (M !== "all" && d.getMonth() !== +M) continue;
        var mm = d.getMonth() + 1, dd = d.getDate(), md = "" + mm + (dd < 10 ? "0" : "") + dd, full = "" + Y + (mm < 10 ? "0" : "") + mm + (dd < 10 ? "0" : "") + dd;
        var s = 50, why = [];
        if (mm === 5 && dd === 20) { s += 40; why.push("520 = 我爱你"); }
        if (mm === 5 && dd === 21) { s += 32; why.push("521 = 我愿意"); }
        if (mm === 9 && dd === 9) { s += 36; why.push("9/9 = 久久 forever"); }
        if (mm === 2 && dd === 14) { s += 24; why.push("Valentine's Day"); }
        if (mm === 12 && dd === 12) { s += 14; why.push("12/12 double pair"); }
        if (md.indexOf("1314") > -1 || full.indexOf("1314") > -1) { s += 30; why.push("contains 1314 一生一世"); }
        var nines = (md.match(/9/g) || []).length, eights = (md.match(/8/g) || []).length, sixes = (md.match(/6/g) || []).length, fours = (md.match(/4/g) || []).length;
        if (nines) { s += nines * 9; why.push(nines + "× 9 (久)"); }
        if (eights) { s += eights * 7; why.push(eights + "× 8 (发)"); }
        if (sixes) { s += sixes * 5; why.push(sixes + "× 6 (顺)"); }
        if (fours) { s -= fours * 12; why.push(fours + "× 4 (avoid)"); }
        if (dd % 2 === 0 && mm % 2 === 0) { s += 6; why.push("even pair (好事成双)"); }
        if (mm === dd) { s += 8; why.push("mirror date"); }
        var dow = d.getDay(); if (wk && (dow === 0 || dow === 6)) { s += 8; why.push("weekend"); } else if (wk) s -= 6;
        FEST.forEach(function (f) { if (f.type === "dated" && f.dates.indexOf(full.slice(0, 4) + "-" + full.slice(4, 6) + "-" + full.slice(6)) > -1 && f.id === "qixi") { s += 30; why.push("Qixi 七夕"); } });
        list.push({ d: new Date(d), s: Math.max(0, Math.min(100, s)), why: why });
      }
      list.sort(function (a, b) { return b.s - a.s || a.d - b.d; });
      $("#date-out").innerHTML = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Date</th><th>Harmony score</th><th>Why</th><th></th></tr></thead><tbody>' +
        list.slice(0, 15).map(function (x, i) {
          var iso = x.d.getFullYear() + "-" + String(x.d.getMonth() + 1).padStart(2, "0") + "-" + String(x.d.getDate()).padStart(2, "0");
          return "<tr><td>" + (i + 1) + "</td><td><b>" + x.d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) + "</b></td><td><div class='meter' style='min-width:90px'><i style='width:" + x.s + "%'></i></div><small>" + x.s + "/100</small></td><td class='small'>" + (x.why.join(" · ") || "balanced digits") + "</td><td><a class='copy' href='get-quotes.html?date=" + iso + "'>Get quotes</a></td></tr>";
        }).join("") + "</tbody></table></div><p class='small muted' style='margin-top:10px'>Number-harmony scores are a modern, number-symbolism guide — not a traditional almanac (黄历) reading. For a traditional reading, consult a qualified practitioner.</p>";
    });
  }

  /* ======== 7. LOVE CARD GENERATOR (canvas) ======== */
  var cv = $("#love-canvas");
  if (cv) {
    var ctx = cv.getContext("2d"), f = $("#card-form"), theme = "crimson";
    var THEMES = {
      crimson: ["#7a0c1f", "#d81f3c", "#ffe29a", "#fff"], gold: ["#8a5a12", "#e8c26a", "#fff7e0", "#2a1a05"],
      blush: ["#f7c6d0", "#fff0f3", "#b3122b", "#5a0f1d"], night: ["#0f1030", "#3a1c5a", "#e8c26a", "#fff"], jade: ["#0c4a3a", "#1f8a5b", "#f3e6b3", "#fff"]
    };
    var qsC = new URLSearchParams(location.search).get("code"); if (qsC) f.code.value = qsC.replace(/\D/g, "").slice(0, 12);
    function wrap(t, x, y, maxW, lh) {
      var words = t.split(" "), line = "";
      words.forEach(function (w, i) { var test = line + w + " "; if (ctx.measureText(test).width > maxW && i) { ctx.fillText(line.trim(), x, y); line = w + " "; y += lh; } else line = test; });
      ctx.fillText(line.trim(), x, y);
    }
    function draw() {
      var T = THEMES[theme], W = cv.width, H = cv.height;
      var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, T[0]); g.addColorStop(1, T[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = .12; ctx.fillStyle = T[2];
      for (var i = 0; i < 26; i++) { var x = (i * 173) % W, y = (i * 97) % H; ctx.font = (18 + (i % 5) * 10) + "px serif"; ctx.fillText("❤", x, y); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = T[2]; ctx.lineWidth = 4; ctx.strokeRect(28, 28, W - 56, H - 56);
      ctx.lineWidth = 1; ctx.strokeRect(40, 40, W - 80, H - 80);
      var code = f.code.value.replace(/\D/g, "") || "999920", res = decode(code);
      var zh = res.parts.map(function (p) { return p.known ? p.known.zh.split(" / ")[0] : (DIG[p.code] ? DIG[p.code].zh.split(" / ")[0] : p.code); }).join("");
      var en = res.exact ? res.exact.en : res.parts.map(function (p) { return p.known ? p.known.en : (DIG[p.code] || {}).en; }).join(" · ");
      ctx.textAlign = "center"; ctx.fillStyle = T[3];
      ctx.font = "600 30px Inter, sans-serif"; ctx.fillText("To " + (f.to.value || "my love"), W / 2, 150);
      ctx.fillStyle = T[2]; ctx.font = "800 " + (code.length > 8 ? 96 : 130) + "px 'Playfair Display', Georgia, serif"; ctx.fillText(code, W / 2, 360);
      ctx.fillStyle = T[3]; ctx.font = "56px 'Noto Serif SC', serif"; ctx.fillText(zh, W / 2, 460);
      ctx.font = "italic 34px 'Playfair Display', Georgia, serif"; ctx.fillText("“" + en + "”", W / 2, 530);
      ctx.font = "26px Inter, sans-serif"; wrap(f.msg.value || "", W / 2, 620, W - 180, 36);
      ctx.font = "600 28px Inter, sans-serif"; ctx.fillText("— " + (f.from.value || "Yours forever"), W / 2, H - 110);
      ctx.globalAlpha = .7; ctx.font = "20px Inter, sans-serif"; ctx.fillText("Made with love at 999920.com", W / 2, H - 62); ctx.globalAlpha = 1;
    }
    f.addEventListener("input", draw);
    document.querySelectorAll("[data-card-theme]").forEach(function (b) {
      b.style.background = "linear-gradient(135deg," + THEMES[b.getAttribute("data-card-theme")][0] + "," + THEMES[b.getAttribute("data-card-theme")][1] + ")";
      b.addEventListener("click", function () { theme = b.getAttribute("data-card-theme"); document.querySelectorAll("[data-card-theme]").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    });
    $("#card-download").addEventListener("click", function () {
      var a = document.createElement("a"); a.download = "999920-love-card.png"; a.href = cv.toDataURL("image/png"); a.click();
    });
    $("#card-share").addEventListener("click", function () {
      var url = "https://999920.com/love-card.html?code=" + (f.code.value.replace(/\D/g, "") || "999920");
      cv.toBlob(function (blob) {
        var file = new File([blob], "love-card.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: "A love code for you", text: url }).catch(function () {});
        else copyText(url);
      });
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); draw();
  }

  /* ======== 8. GOLD VALUE CALCULATOR ======== */
  var gf = $("#gold-form");
  if (gf) {
    function calc() {
      var price = parseFloat(gf.price.value) || 0, unit = gf.unit.value, w = parseFloat(gf.weight.value) || 0, wu = gf.wunit.value, pur = parseFloat(gf.purity.value), labour = parseFloat(gf.labour.value) || 0;
      var perGram = unit === "g" ? price : unit === "oz" ? price / 31.1035 : unit === "tael" ? price / 37.429 : price / 1000;
      var grams = wu === "g" ? w : wu === "oz" ? w * 31.1035 : wu === "tael" ? w * 37.429 : wu === "kg" ? w * 1000 : w * 3.7429;
      var metal = perGram * grams * pur, total = metal + labour * grams;
      $("#gold-out").innerHTML = '<div class="grid g3"><div class="stat"><b>' + grams.toFixed(2) + ' g</b><span class="small muted">fine weight basis</span></div><div class="stat"><b>' + metal.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '</b><span class="small muted">melt value (' + (pur * 100).toFixed(2) + '% pure)</span></div><div class="stat"><b>' + total.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '</b><span class="small muted">est. retail incl. making charge</span></div></div>';
    }
    gf.addEventListener("input", calc); calc();
  }
})();
