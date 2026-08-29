/* ============================================================
   App shell — tabs, Today, Plan, Map, Money, Tips.
   State (checklist, FX overrides) persists in localStorage.
   ============================================================ */
(function () {
  const T = window.TRIP, POI = T.pois;
  const view = document.getElementById("view");
  const tabbar = document.getElementById("tabbar");
  const $ = (s, r) => (r || document).querySelector(s);

  // ---- persisted state ----
  const LS = {
    get(k, d) { try { const v = localStorage.getItem("ph_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("ph_" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const state = {
    checks: LS.get("checks", {}),
    fx: Object.assign({}, T.meta.fx, LS.get("fx", {})),
    fxFrom: LS.get("fxFrom", "USD"),
    fxTo: LS.get("fxTo", "PHP"),
    tab: "today"
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

  // ---- dates / countdown ----
  const DEPART = new Date("2027-02-12T00:00:00");
  const TRIP_START = new Date("2027-02-13T00:00:00");
  function todayIndex() {
    // Which day of the trip is "today"? clamp to schedule. Uses real date.
    const now = new Date();
    const diff = Math.floor((now - DEPART) / 86400000);
    if (diff < 0) return -1;               // before trip
    if (diff >= T.days.length) return T.days.length; // after
    return diff;
  }
  function fmtCountdown() {
    const now = new Date();
    const d = Math.ceil((DEPART - now) / 86400000);
    if (d > 1) return "✈ " + d + " days";
    if (d === 1) return "✈ tomorrow!";
    const idx = todayIndex();
    if (idx >= 0 && idx < T.days.length) return "Day " + (idx + 1) + "/" + T.days.length;
    return "🏠 home";
  }

  // ---- top bar ----
  $("#tbTitle").textContent = "Philippines";
  $("#tbSub").textContent = T.meta.dates;
  function paintTop() {
    $("#countdown").textContent = fmtCountdown();
    const off = !navigator.onLine;
    $("#netDot").classList.toggle("off", off);
    $("#netDot").title = off ? "offline — cached & ready" : "online";
  }
  window.addEventListener("online", paintTop);
  window.addEventListener("offline", paintTop);

  // ---- money helpers ----
  function toPHP(v, cur) { return v * (state.fx[cur] || 1); }
  function conv(v, from, to) { return toPHP(v, from) / (state.fx[to] || 1); }
  const money = (v, cur) => {
    const sym = { PHP:"₱", USD:"$", ILS:"₪" }[cur] || "";
    return sym + (Math.round(v)).toLocaleString();
  };

  /* ======================= TODAY ======================= */
  function renderToday() {
    view.classList.remove("nopad");
    const idx = todayIndex();
    let html = "";

    if (idx < 0) {
      // pre-trip
      const now = new Date();
      const dleft = Math.ceil((DEPART - now) / 86400000);
      const urgent = T.checklist.filter(c => c.urgent && !state.checks[c.id]);
      html += `<div class="hero"><div class="wave">🌊</div>
        <div class="eyebrow">Countdown</div>
        <h2>${dleft} days to go</h2>
        <div class="where">${esc(T.meta.subtitle)}</div>
        <p>${esc(T.meta.dates)} · ${T.days.length} days on the ground</p>
        <div class="pill-row">
          <span class="pill">🛬 Land Cebu</span>
          <span class="pill">🚤 Coron 5n</span>
          <span class="pill">🛶 Tao 4n</span>
          <span class="pill">🏖️ El Nido 6n</span>
          <span class="pill">🐢 Moalboal 3n</span>
        </div></div>`;
      if (urgent.length) {
        html += `<div class="callout"><div class="ic">⚠️</div><div>
          <div class="t">${urgent.length} urgent booking${urgent.length>1?"s":""} still open</div>
          <div class="b">${urgent.map(c=>esc(c.t)).join(" · ")}</div></div></div>`;
      }
      html += nextThreeDaysCard(0);
    } else if (idx >= T.days.length) {
      html += `<div class="hero"><div class="wave">🏠</div>
        <div class="eyebrow">Wrapped</div><h2>Trip complete</h2>
        <p>Land TLV and start planning the next one. 🌴</p></div>`;
    } else {
      const day = T.days[idx];
      const hub = T.hubs.find(h => h.id === day.hub);
      html += `<div class="hero"><div class="wave">🌴</div>
        <div class="eyebrow">Today · ${esc(day.d)}</div>
        <h2>${esc(day.title)}</h2>
        <div class="where">${hub ? "📍 " + esc(hub.name) : "In transit"}</div>
        <p>${esc(day.body)}</p></div>`;
      if (day.pins && day.pins.length) {
        html += `<div class="section-h">Today's spots</div>`;
        html += day.pins.map(pinCard).join("");
        html += `<button class="link-btn" data-goday="${idx}">See today on the map ◈</button>`;
      }
      html += nextThreeDaysCard(idx + 1);
    }
    view.innerHTML = html;
    wireCommon();
  }

  function nextThreeDaysCard(start) {
    const items = T.days.slice(start, start + 3);
    if (!items.length) return "";
    let h = `<div class="section-h">Coming up</div>`;
    items.forEach((d, i) => {
      h += `<div class="card tap" data-goday="${start + i}">
        <div class="day-top"><span class="day-date">${esc(d.d)}</span>
          <span class="type-tag t-${d.type}">${d.type}</span></div>
        <div class="day-title">${esc(d.title)}</div>
        <div class="day-body">${esc(d.body)}</div></div>`;
    });
    return h;
  }

  function pinCard(id) {
    const p = POI[id]; if (!p) return "";
    const m = window.MAP_CATS[p.cat] || {};
    return `<div class="card tap" data-poi="${id}">
      <div class="day-top"><span class="pop-cat" style="color:${m.c}">${m.g||"◦"} ${esc(p.cat)}${p.star?" · ★":""}</span></div>
      <div class="day-title" style="margin-top:2px">${esc(p.name)}</div>
      ${p.fee?`<div class="pop-fee">💳 ${esc(p.fee)}</div>`:""}
      <div class="day-body">${esc(p.note||"")}</div></div>`;
  }

  /* ======================= PLAN ======================= */
  function renderPlan() {
    view.classList.remove("nopad");
    let html = `<div class="section-h">The shape</div><div class="hub-strip">`;
    T.hubs.forEach((h, i) => {
      html += `<div class="hub-chip" data-gohub="${h.id}">
        <div class="hc-n">${esc(h.name)}</div>
        <div class="hc-x">${h.nights} night${h.nights>1?"s":""}</div>
        <div class="hc-bar" style="background:${h.color}"></div></div>`;
    });
    html += `</div>`;

    const idx = todayIndex();
    html += `<div class="section-h">Day by day</div>`;
    T.days.forEach((d, i) => {
      const hub = T.hubs.find(h => h.id === d.hub);
      const isNow = i === idx;
      const dotColor = hub ? hub.color : "#6f8aa1";
      const last = i === T.days.length - 1;
      html += `<div class="day">
        <div class="day-rail">
          <div class="day-dot" style="background:${dotColor}${isNow?";box-shadow:0 0 0 4px #2ea9c955":""}"></div>
          ${last?"":'<div class="day-line"></div>'}
        </div>
        <div class="day-c">
          <div class="card tap ${isNow?"now":""}" data-goday="${i}" style="${isNow?"border-color:var(--aqua)":""}">
            <div class="day-top">
              <span class="day-date">${esc(d.d)}${isNow?" · TODAY":""}</span>
              <span class="type-tag t-${d.type}">${d.type}</span>
            </div>
            <div class="day-title">${esc(d.title)}</div>
            <div class="day-body">${esc(d.body)}</div>
            ${(d.pins&&d.pins.length)?`<div class="day-pins">${d.pins.map(id=>{
              const p=POI[id];return p?`<span class="mini-pin" data-poi="${id}"><b>◦</b> ${esc(p.name)}</span>`:"";
            }).join("")}</div>`:""}
          </div>
        </div></div>`;
    });
    view.innerHTML = html;
    wireCommon();
  }

  /* ======================= MAP ======================= */
  let MAP = null;
  function renderMap() {
    view.classList.add("nopad");
    view.innerHTML = `<div id="mapWrap" style="position:relative;width:100%;height:100%">
      <div id="mapCanvas" style="position:absolute;inset:0"></div>
      <div class="map-topbar"><div class="map-modes" id="mapModes"></div></div>
      <div class="map-filters"><div class="filter-row" id="mapFilters"></div></div>
    </div>`;
    const canvas = $("#mapCanvas");
    MAP = new window.TripMap(canvas, T, window.COAST, {});

    // mode chips: Journey + each hub
    const modes = $("#mapModes");
    let mh = `<button class="mode-chip on" data-mode="journey">🧭 Journey</button>`;
    T.hubs.forEach(h => { mh += `<button class="mode-chip" data-mode="${h.id}">${esc(h.name)}</button>`; });
    modes.innerHTML = mh;
    modes.addEventListener("click", (e) => {
      const b = e.target.closest(".mode-chip"); if (!b) return;
      modes.querySelectorAll(".mode-chip").forEach(x => x.classList.toggle("on", x === b));
      if (b.dataset.mode === "journey") MAP.showJourney();
      else MAP.focusHub(b.dataset.mode);
    });

    // category filters
    const cats = window.MAP_CATS;
    const filters = $("#mapFilters");
    let fh = "";
    for (const k in cats) fh += `<button class="fchip" data-cat="${k}"><span class="dot" style="background:${cats[k].c}"></span>${k}</button>`;
    filters.innerHTML = fh;
    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".fchip"); if (!b) return;
      const off = b.classList.toggle("off");
      MAP.setFilter(b.dataset.cat, !off);
    });

    if (pendingDay != null) { const d = T.days[pendingDay]; pendingDay = null;
      // switch mode chip to the hub
      const day = d;
      if (day && day.hub) {
        modes.querySelectorAll(".mode-chip").forEach(x => x.classList.toggle("on", x.dataset.mode === day.hub));
      }
      requestAnimationFrame(() => MAP.focusDay(day));
    } else if (pendingHub) { const hb = pendingHub; pendingHub = null;
      modes.querySelectorAll(".mode-chip").forEach(x => x.classList.toggle("on", x.dataset.mode === hb));
      requestAnimationFrame(() => MAP.focusHub(hb));
    } else if (pendingPoi) { const id = pendingPoi; pendingPoi = null;
      const p = POI[id];
      if (p && p.hub) modes.querySelectorAll(".mode-chip").forEach(x => x.classList.toggle("on", x.dataset.mode === p.hub));
      requestAnimationFrame(() => { if (p&&p.hub) MAP.focusHub(p.hub); MAP.openPoi(id); });
    }
  }

  /* ======================= MONEY ======================= */
  function renderMoney() {
    view.classList.remove("nopad");
    const cur = T.meta.currencies;
    const opt = (sel) => cur.map(c => `<option ${c===sel?"selected":""}>${c}</option>`).join("");
    let html = `
    <div class="calc">
      <h3>💱 Currency converter</h3>
      <div class="fx-row">
        <input id="fxInput" type="number" inputmode="decimal" value="100">
        <select id="fxFrom">${opt(state.fxFrom)}</select>
        <button class="fx-swap" id="fxSwap">⇅</button>
        <select id="fxTo">${opt(state.fxTo)}</select>
      </div>
      <div id="fxOut" style="font-size:26px;font-weight:700;color:var(--aqua);margin:6px 2px"></div>
      <div class="quick-row" id="fxQuick"></div>
      <div class="fx-note">Rates are editable estimates — tap a rate to adjust before you travel.</div>
      <div class="quick-row" id="fxRates"></div>
    </div>

    <div class="calc">
      <h3>🧮 Tip & split</h3>
      <div class="fx-row">
        <input id="tipBill" type="number" inputmode="decimal" value="1000" placeholder="Bill">
        <select id="tipCur">${opt("PHP")}</select>
      </div>
      <div class="quick-row" id="tipPct"></div>
      <div class="fx-row" style="margin-top:8px">
        <span style="font-size:13px;color:var(--mut)">Split between</span>
        <input id="tipPpl" type="number" inputmode="numeric" value="2" style="max-width:80px">
        <span style="font-size:13px;color:var(--mut)">people</span>
      </div>
      <div class="tip-calc-grid" style="margin-top:10px">
        <div class="tc-out"><div class="v" id="tipTip">–</div><div class="l">tip</div></div>
        <div class="tc-out"><div class="v" id="tipTotal">–</div><div class="l">total</div></div>
        <div class="tc-out"><div class="v" id="tipEach">–</div><div class="l">each</div></div>
        <div class="tc-out"><div class="v" id="tipEachUsd">–</div><div class="l">each (USD)</div></div>
      </div>
      <div class="fx-note">Tipping isn't obligatory in the Philippines — 5–10% for good service is generous.</div>
    </div>

    <div class="calc">
      <h3>🏧 Cash plan — draw pesos before the islands</h3>
      <div class="cash-rules">
        ${T.cash.rules.map(r => `<div class="cash-rule"><span class="n">▹</span><span>${esc(r)}</span></div>`).join("")}
      </div>
      <div style="margin-top:6px">
        ${T.cash.phases.map(ph => {
          const rk = ph.risk.startsWith("Low") ? "Moderate" : ph.risk;
          return `<div class="cash-phase">
            <div class="cash-risk risk-${rk}">${esc(ph.risk)}</div>
            <div class="cash-body">
              <div class="cash-hub">${esc(ph.hub)}</div>
              <div class="cash-draw">💵 ${esc(ph.draw)} · ${esc(ph.where)}</div>
              <div class="cash-note">${esc(ph.note)}</div>
            </div></div>`;
        }).join("")}
      </div>
    </div>

    <div class="calc" id="budCard">
      <h3>💰 Trip budget (per person)</h3>
      <div class="fx-row" style="margin-bottom:12px">
        <span style="font-size:13px;color:var(--mut)">Show in</span>
        <select id="budCur">${opt("USD")}</select>
      </div>
      <div id="budRows"></div>
    </div>`;
    view.innerHTML = html;
    wireMoney();
  }

  function wireMoney() {
    const inp = $("#fxInput"), from = $("#fxFrom"), to = $("#fxTo"), out = $("#fxOut");
    function fxCalc() {
      const v = parseFloat(inp.value) || 0;
      state.fxFrom = from.value; state.fxTo = to.value;
      LS.set("fxFrom", state.fxFrom); LS.set("fxTo", state.fxTo);
      const r = conv(v, from.value, to.value);
      out.textContent = money(r, to.value);
      // quick amounts
      const quick = [100, 500, 1000, 5000];
      $("#fxQuick").innerHTML = quick.map(q => `<button data-q="${q}">${money(q, from.value)}</button>`).join("");
    }
    [inp, from, to].forEach(e => e.addEventListener("input", fxCalc));
    $("#fxSwap").addEventListener("click", () => { const a = from.value; from.value = to.value; to.value = a; fxCalc(); });
    $("#fxQuick").addEventListener("click", e => { const q = e.target.dataset.q; if (q) { inp.value = q; fxCalc(); } });
    fxCalc(); // initial render of result + quick amounts

    // editable rates
    const rates = $("#fxRates");
    function paintRates() {
      rates.innerHTML = T.meta.currencies.filter(c => c !== "PHP")
        .map(c => `<button data-rate="${c}">1 ${c} = ₱${state.fx[c]}</button>`).join("");
    }
    paintRates();
    rates.addEventListener("click", e => {
      const c = e.target.dataset.rate; if (!c) return;
      const v = prompt("How many pesos (₱) per 1 " + c + "?", state.fx[c]);
      const n = parseFloat(v);
      if (n > 0) { state.fx[c] = n; LS.set("fx", { USD: state.fx.USD, ILS: state.fx.ILS }); paintRates(); fxCalc(); tipCalc(); paintBudget(); }
    });

    // tip
    let tipP = 10;
    const bill = $("#tipBill"), tcur = $("#tipCur"), ppl = $("#tipPpl");
    function paintPct() {
      $("#tipPct").innerHTML = [0,5,10,15].map(p => `<button data-p="${p}" style="${p===tipP?"background:var(--teal);color:#04141c;border-color:var(--teal)":""}">${p}%</button>`).join("");
    }
    function tipCalc() {
      const b = parseFloat(bill.value) || 0;
      const n = Math.max(1, parseInt(ppl.value) || 1);
      const tip = b * tipP / 100, total = b + tip, each = total / n;
      $("#tipTip").textContent = money(tip, tcur.value);
      $("#tipTotal").textContent = money(total, tcur.value);
      $("#tipEach").textContent = money(each, tcur.value);
      $("#tipEachUsd").textContent = money(conv(each, tcur.value, "USD"), "USD");
    }
    paintPct(); tipCalc();
    $("#tipPct").addEventListener("click", e => { const p = e.target.dataset.p; if (p!=null){ tipP = +p; paintPct(); tipCalc(); } });
    [bill, tcur, ppl].forEach(e => e.addEventListener("input", tipCalc));

    // budget
    const budCur = $("#budCur");
    function paintBudget() {
      const c = budCur.value;
      let lo = 0, hi = 0, rows = "";
      T.budget.forEach(b => {
        const rl = conv(b.lo, "USD", c), rh = conv(b.hi, "USD", c);
        lo += rl; hi += rh;
        rows += `<div class="bud-row"><span class="bud-k">${esc(b.k)}</span>
          <span class="bud-v">${money(rl,c)} – ${money(rh,c)}</span></div>`;
      });
      rows += `<div class="bud-total"><span>Ballpark total</span>
        <span class="bud-v">${money(lo,c)} – ${money(hi,c)}</span></div>`;
      rows += `<div class="range-lbl" style="margin-top:14px"><span>lean</span><span>comfortable</span></div>
        <div class="bar" style="background:linear-gradient(90deg,var(--teal),var(--sun))"></div>
        <div class="fx-note">Excludes the Tao booking-protection add-on (~$90) and travel insurance.</div>`;
      $("#budRows").innerHTML = rows;
    }
    budCur.addEventListener("change", paintBudget);
    paintBudget();
  }

  /* ======================= TIPS ======================= */
  function renderTips() {
    view.classList.remove("nopad");
    const done = T.checklist.filter(c => state.checks[c.id]).length;
    let html = `<div class="section-h">Before you go — checklist</div>
      <div class="progress"><i style="width:${Math.round(done/T.checklist.length*100)}%"></i></div>
      <div class="card">`;
    T.checklist.forEach(c => {
      const on = !!state.checks[c.id];
      html += `<div class="check ${on?"done":""}" data-check="${c.id}">
        <div class="box">${on?"✓":""}</div>
        <div class="lbl">${esc(c.t)}</div>
        ${c.urgent&&!on?`<span class="u">now</span>`:""}</div>`;
    });
    html += `</div>`;

    html += `<div class="callout"><div class="ic">🛶</div><div>
      <div class="t">Tao drives the whole schedule</div>
      <div class="b">Tao doesn't sail daily and sells out months ahead. Pick your expedition date first, then slot Coron & El Nido nights around it. Cancellation is strict — 50% forfeit inside 30 days, nothing inside 14.</div></div></div>`;

    html += `<div class="section-h">Know before you go</div>`;
    T.tips.forEach(t => {
      html += `<div class="card"><div class="tip">
        <div class="ic">${t.icon}</div>
        <div><div class="t">${esc(t.t)}</div><div class="b">${esc(t.b)}</div></div>
      </div></div>`;
    });

    html += `<div class="center-mut">Everything here works offline. Add to Home Screen for a full-screen app.</div>`;
    view.innerHTML = html;
    view.querySelectorAll(".check").forEach(el => el.addEventListener("click", () => {
      const id = el.dataset.check;
      state.checks[id] = !state.checks[id];
      LS.set("checks", state.checks);
      renderTips();
    }));
  }

  /* ======================= navigation ======================= */
  let pendingDay = null, pendingHub = null, pendingPoi = null;
  function go(tab) {
    state.tab = tab;
    tabbar.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    view.scrollTop = 0;
    ({ today: renderToday, plan: renderPlan, map: renderMap, money: renderMoney, tips: renderTips }[tab] || renderToday)();
    paintTop();
  }
  tabbar.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(b.dataset.tab); });

  function wireCommon() {
    view.querySelectorAll("[data-goday]").forEach(el => el.addEventListener("click", () => {
      pendingDay = +el.dataset.goday; go("map");
    }));
    view.querySelectorAll("[data-gohub]").forEach(el => el.addEventListener("click", () => {
      pendingHub = el.dataset.gohub; go("map");
    }));
    view.querySelectorAll("[data-poi]").forEach(el => el.addEventListener("click", (e) => {
      e.stopPropagation(); pendingPoi = el.dataset.poi; go("map");
    }));
  }

  // countdown ticker
  setInterval(paintTop, 60000);
  paintTop();
  go("today");
})();
