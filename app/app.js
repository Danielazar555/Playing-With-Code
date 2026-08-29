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
    quests: LS.get("quests", {}),   // {questId: true}
    packs: LS.get("packs", {}),     // {"group|item": true}
    saved: LS.get("saved", []),     // [{id,kind,text,url,poi,ts}]
    memories: LS.get("memories", []), // [{id,ts,title,note,questId,photo(idbKey)}]
    kitOpen: LS.get("kitOpen", "quests"),
    tab: "today"
  };

  /* ---- IndexedDB photo store (blobs kept out of localStorage's ~5MB cap) ---- */
  const IDB = (function () {
    let dbp;
    function db() {
      if (!dbp) dbp = new Promise((res, rej) => {
        try {
          const r = indexedDB.open("phtrip", 1);
          r.onupgradeneeded = () => r.result.createObjectStore("photos");
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      });
      return dbp;
    }
    return {
      async put(k, blob) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction("photos", "readwrite"); t.objectStore("photos").put(blob, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
      async get(k) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction("photos", "readonly"); const q = t.objectStore("photos").get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); },
      async del(k) { const d = await db(); return new Promise((res) => { const t = d.transaction("photos", "readwrite"); t.objectStore("photos").delete(k); t.oncomplete = res; t.onerror = res; }); }
    };
  })();

  // Downscale a photo client-side so memories stay light and fully local.
  function downscale(file, max, q) {
    return new Promise((res) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let w = img.width, h = img.height;
        const s = Math.min(1, (max || 900) / Math.max(w, h));
        w = Math.round(w * s); h = Math.round(h * s);
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        c.toBlob(b => res(b), "image/jpeg", q || 0.72);
      };
      img.onerror = () => res(null);
      img.src = url;
    });
  }
  function pickPhoto(cb) {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*"; inp.setAttribute("capture", "environment");
    inp.onchange = () => cb(inp.files && inp.files[0] ? inp.files[0] : null);
    inp.click();
  }
  async function storePhoto(file) {
    if (!file) return null;
    try { const b = await downscale(file); if (!b) return null; const key = "p" + Date.now() + Math.floor(Math.random()*99); await IDB.put(key, b); return key; }
    catch (e) { return null; }
  }
  function addMemory(m) {
    m.id = "m" + Date.now() + Math.floor(Math.random()*99); m.ts = m.ts || Date.now();
    state.memories.unshift(m); LS.set("memories", state.memories);
  }
  async function delMemory(id) {
    const m = state.memories.find(x => x.id === id);
    if (m && m.photo) { try { await IDB.del(m.photo); } catch (e) {} }
    state.memories = state.memories.filter(x => x.id !== id); LS.set("memories", state.memories);
  }
  // Attach a photo to a quest and mark it done — the "capture the moment" loop.
  function questPhoto(q, after) {
    pickPhoto(async (file) => {
      const key = await storePhoto(file);
      if (!state.quests[q.id]) toggleQuest(q.id);
      addMemory({ title: q.t, questId: q.id, note: "", photo: key });
      toast(key ? "📸 Memory saved" : "🏆 Quest done");
      if (after) after();
    });
  }

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
  const icon = (n, cls) => `<svg class="ic${cls ? " " + cls : ""}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

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

  /* ======================= gamification ======================= */
  const QCAT = { photo:{n:"camera",c:"var(--sun)"}, do:{n:"wave",c:"var(--aqua)"},
                 culture:{n:"chat",c:"var(--violet-t)"}, rest:{n:"moon",c:"var(--teal-t)"} };
  const questsFor = (hub) => T.quests.filter(q => q.hub === hub);
  function questStats() {
    const done = T.quests.filter(q => state.quests[q.id]);
    const pts = done.reduce((s, q) => s + q.pts, 0);
    const total = T.quests.reduce((s, q) => s + q.pts, 0);
    return { count: done.length, of: T.quests.length, pts, total };
  }
  function toggleQuest(id) {
    state.quests[id] = !state.quests[id];
    LS.set("quests", state.quests);
  }
  // Personalised nudge from the day's character.
  const NUDGE = {
    highlight:{i:"🔥",t:"Big one today",b:"This is a headline day — go early, go for it, get the shot."},
    dive:{i:"🤿",t:"Adventure day",b:"Adrenaline on the menu. Warm up, hydrate, then send it."},
    beach:{i:"🏖️",t:"Slow it down",b:"Beach day. Swim, read, chase the light — no rush."},
    rest:{i:"😌",t:"Recharge",b:"A rest day is part of the plan. Journal, nap, do your own thing."},
    expedition:{i:"🛶",t:"Off the grid",b:"No signal, no schedule. Be all the way here — phone away."},
    travel:{i:"🚐",t:"Moving day",b:"Transit today. Snacks, water, podcasts. Save your energy."},
    transit:{i:"✈️",t:"On the move",b:"Long haul. Rest when you can; the good part is close."}
  };

  /* ======================= saved / vault ======================= */
  function addSaved(item) {
    item.id = "s" + Date.now() + Math.floor(Math.random()*99);
    item.ts = Date.now();
    state.saved.unshift(item);
    LS.set("saved", state.saved);
  }
  function delSaved(id) {
    state.saved = state.saved.filter(s => s.id !== id);
    LS.set("saved", state.saved);
  }
  function toast(msg) {
    let el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }
  // Save-place hook used by the map popup
  window.__savePlace = (id) => {
    const p = POI[id]; if (!p) return;
    if (state.saved.some(s => s.poi === id)) { toast("Already saved"); return; }
    addSaved({ kind:"place", text:p.name, url:p.url || ("https://www.google.com/maps/search/?api=1&query="+p.lat+","+p.lng), poi:id });
    toast("★ Saved to your list");
  };

  /* ======================= calendar (.ics) ======================= */
  function isoForDay(i) {
    const d = new Date(DEPART.getTime() + i * 86400000);
    return d.getFullYear() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  }
  function buildICS() {
    const nl = "\r\n";
    let out = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//PH Trip//EN","CALSCALE:GREGORIAN"].join(nl) + nl;
    T.days.forEach((d, i) => {
      const start = isoForDay(i), end = isoForDay(i + 1);
      const hub = T.hubs.find(h => h.id === d.hub);
      out += ["BEGIN:VEVENT",
        "UID:phtrip-" + i + "@local",
        "DTSTART;VALUE=DATE:" + start,
        "DTEND;VALUE=DATE:" + end,
        "SUMMARY:" + icsEsc((hub?("["+hub.name+"] "):"") + d.title),
        "DESCRIPTION:" + icsEsc(d.body),
        "END:VEVENT"].join(nl) + nl;
    });
    out += "END:VCALENDAR" + nl;
    return out;
  }
  const icsEsc = (s) => String(s).replace(/[\\,;]/g, m => "\\" + m).replace(/\n/g, "\\n");
  function downloadICS() {
    try {
      const blob = new Blob([buildICS()], { type:"text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "philippines-2027.ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("📅 Calendar file ready");
    } catch (e) { toast("Couldn't create calendar file"); }
  }

  /* ======================= TODAY ======================= */
  function legPills() {
    const legs = [["mactan1","Cebu"],["coron","Coron"],["tao","Tao"],["elnido","El Nido"],["moalboal","Moalboal"]];
    return legs.map(([id,label]) => {
      const h = T.hubs.find(x => x.id === id) || {};
      return `<span class="pill"><i class="leg-dot" style="background:${h.color||'#8caeaa'}"></i>${label} · ${h.nights||1}n</span>`;
    }).join("");
  }
  function pointsStrip() {
    const s = questStats();
    const pct = s.total ? Math.round(s.pts / s.total * 100) : 0;
    return `<div class="pts-strip" data-gokit="quests" role="button" tabindex="0" aria-label="Adventure score, ${s.pts} points">
      <div class="pts-badge">${icon("award")}<b>${s.pts}</b></div>
      <div class="pts-body">
        <div class="pts-top"><b>Adventure score</b><span>${s.count}/${s.of} · ${s.pts} pts</span></div>
        <div class="pts-bar"><i style="width:${pct}%"></i></div>
      </div>
      <div class="pts-arrow">${icon("chevron")}</div>
    </div>`;
  }
  function questCard(q) {
    const on = !!state.quests[q.id];
    const m = QCAT[q.cat] || QCAT.do;
    const hasPhoto = state.memories.some(x => x.questId === q.id && x.photo);
    return `<div class="quest ${on?"done":""}">
      <div class="q-check" style="${on?'':'color:'+m.c}" data-quest="${q.id}" role="checkbox" tabindex="0" aria-checked="${on}" aria-label="${esc(q.t)}">${on?"✓":icon(m.n)}</div>
      <div class="q-body" data-quest="${q.id}"><div class="q-t">${esc(q.t)}</div><div class="q-h">${esc(q.h)}</div></div>
      <button class="q-cam ${hasPhoto?'has':''}" data-qcam="${q.id}" aria-label="Add a photo for ${esc(q.t)}">${icon("camera","ic-sm")}</button>
      <div class="q-pts" style="color:${m.c}">+${q.pts}</div>
    </div>`;
  }
  function stampGrid() {
    const done = T.quests.filter(q => state.quests[q.id]);
    if (!done.length) return `<div class="passport-empty">Your passport is empty — complete a quest to earn your first stamp.</div>`;
    return `<div class="stamp-grid">` + done.map(q => {
      const m = QCAT[q.cat] || QCAT.do;
      const hub = T.hubs.find(h => h.id === q.hub);
      const col = hub ? hub.color : "var(--aqua)";
      return `<div class="stamp" style="border-color:${col};color:${col}" title="${esc(q.t)}">${icon(m.n)}<b>${esc((hub?hub.name:"Anywhere").split(" ")[0])}</b></div>`;
    }).join("") + `</div>`;
  }
  function quickAdd() {
    return `<div class="quick-add">
      <button class="qa-btn" id="qaMem">${icon("camera","ic-sm")} Memory</button>
      <button class="qa-btn" data-gokit="saved">${icon("link","ic-sm")} Save link</button>
      <button class="qa-btn" id="qaCal">${icon("calendar","ic-sm")} Calendar</button>
    </div>`;
  }
  // Load memory thumbnails from IndexedDB after render; clean up old URLs.
  let _thumbUrls = [];
  function loadThumbs(root) {
    _thumbUrls.forEach(u => URL.revokeObjectURL(u)); _thumbUrls = [];
    (root || view).querySelectorAll("img[data-photo]").forEach(async (img) => {
      try {
        const blob = await IDB.get(img.dataset.photo);
        if (blob) { const u = URL.createObjectURL(blob); _thumbUrls.push(u); img.src = u; }
        else img.closest(".mem-photo") && img.closest(".mem-photo").classList.add("noimg");
      } catch (e) {}
    });
  }

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
        <div class="pill-row">${legPills()}</div></div>`;
      html += pointsStrip();
      if (urgent.length) {
        html += `<div class="callout"><div class="ic">${icon('alert','ic-alert')}</div><div>
          <div class="t">${urgent.length} urgent booking${urgent.length>1?"s":""} still open</div>
          <div class="b">${urgent.map(c=>esc(c.t)).join(" · ")}</div></div></div>`;
      }
      html += quickAdd();
      html += nextThreeDaysCard(0);
    } else if (idx >= T.days.length) {
      const s = questStats();
      html += `<div class="hero"><div class="wave">🏠</div>
        <div class="eyebrow">Wrapped</div><h2>Trip complete</h2>
        <p>You scored ${s.pts} points across ${s.count} adventures. 🌴 Start planning the next one.</p></div>`;
      html += pointsStrip();
    } else {
      const day = T.days[idx];
      const hub = T.hubs.find(h => h.id === day.hub);
      const n = NUDGE[day.type] || NUDGE.rest;
      html += `<div class="hero"><div class="wave">🌴</div>
        <div class="eyebrow">Today · ${esc(day.d)}</div>
        <h2>${esc(day.title)}</h2>
        <div class="where">${hub ? "📍 " + esc(hub.name) : "In transit"}</div>
        <p>${esc(day.body)}</p></div>`;
      html += pointsStrip();
      html += `<div class="nudge"><div class="ic">${n.i}</div>
        <div><div class="t">${esc(n.t)}</div><div class="b">${esc(n.b)}</div></div></div>`;
      // today's quests: day's hub + any global not-yet-done
      const todays = questsFor(day.hub).concat(questsFor(null).filter(q => !state.quests[q.id])).slice(0, 4);
      if (todays.length) {
        html += `<div class="section-h">Today's quests</div>` + todays.map(questCard).join("");
      }
      html += quickAdd();
      if (day.pins && day.pins.length) {
        html += `<div class="section-h">Today's spots</div>`;
        html += day.pins.map(pinCard).join("");
        html += `<button class="link-btn" data-goday="${idx}">See today on the map ◈</button>`;
      }
      html += nextThreeDaysCard(idx + 1);
    }
    view.innerHTML = html;
    wireToday();
    wireCommon();
  }

  function wireToday() {
    view.querySelectorAll("[data-quest]").forEach(el => el.addEventListener("click", () => {
      const id = el.dataset.quest, was = !!state.quests[id];
      toggleQuest(id);
      if (!was) toast("🏆 +" + (T.quests.find(q=>q.id===id)||{}).pts + " — nice!");
      renderToday();
    }));
    view.querySelectorAll("[data-qcam]").forEach(el => el.addEventListener("click", (e) => {
      e.stopPropagation(); const q = T.quests.find(x => x.id === el.dataset.qcam);
      if (q) questPhoto(q, renderToday);
    }));
    view.querySelectorAll("[data-gokit]").forEach(el => el.addEventListener("click", () => {
      state.kitOpen = el.dataset.gokit; LS.set("kitOpen", state.kitOpen); go("kit");
    }));
    const cal = $("#qaCal"); if (cal) cal.addEventListener("click", downloadICS);
    const mem = $("#qaMem"); if (mem) mem.addEventListener("click", () => {
      const idx = todayIndex(); const day = (idx>=0 && idx<T.days.length) ? T.days[idx] : null;
      pickPhoto(async (file) => {
        const key = await storePhoto(file);
        addMemory({ title: day ? day.title : "Memory", note: "", photo: key });
        toast(key ? "📸 Added to your journal" : "Journal note added");
        state.kitOpen = "journal"; LS.set("kitOpen", state.kitOpen); go("kit");
      });
    });
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
    let html = `<button class="cal-btn" id="planCal">${icon('calendar')} Add whole itinerary to Calendar</button>`;
    html += `<div class="section-h">The shape</div><div class="hub-strip">`;
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
    const pc = $("#planCal"); if (pc) pc.addEventListener("click", downloadICS);
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
    MAP = new window.TripMap(canvas, T, window.COAST, { onSave: (id) => window.__savePlace(id) });

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
      <h3>${icon('swap')} Currency converter</h3>
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
      <h3>${icon('calc')} Tip & split</h3>
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
      <h3>${icon('cash')} Cash plan — draw pesos before the islands</h3>
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
      <h3>${icon('money')} Trip budget (per person)</h3>
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

  /* ======================= KIT (accordion) ======================= */
  function kitSection(key, iconName, title, sub, bodyHtml) {
    const open = state.kitOpen === key;
    return `<div class="kit-sec ${open?"open":""}">
      <button class="kit-head" data-sec="${key}" aria-expanded="${open}">
        <span class="kh-ic">${icon(iconName)}</span>
        <span class="kh-t">${title}<span class="kh-sub">${sub}</span></span>
        <span class="kh-x">${icon("chevron")}</span>
      </button>
      <div class="kit-body" ${open?"":"hidden"}>${open?bodyHtml():""}</div>
    </div>`;
  }

  function bQuests() {
    let h = `<div class="kit-lead">Tick these off as you live them, and tap the camera to pin the moment. Points are for the memories, not the metrics — skip any that aren't you.</div>`;
    h += `<div class="kit-grp">Your passport</div>` + stampGrid();
    const groups = [["coron","Coron"],["tao","Tao"],["elnido","El Nido"],["moalboal","Moalboal"],[null,"Anywhere"]];
    groups.forEach(([hub,label]) => {
      const qs = questsFor(hub); if (!qs.length) return;
      const col = hub ? ((T.hubs.find(x=>x.id===hub)||{}).color||"var(--aqua)") : "var(--aqua)";
      h += `<div class="kit-grp"><i class="grp-dot" style="background:${col}"></i>${label}</div>` + qs.map(questCard).join("");
    });
    return h;
  }
  function bJournal() {
    let h = `<div class="kit-lead">Your trip, as you live it. Snap a photo, jot a line — it stays on your phone.</div>`;
    h += `<div class="save-form">
      <button class="qa-btn" id="jPhoto">${icon('camera','ic-sm')} Add a photo</button>
      <div id="jThumb" class="j-thumb" hidden></div>
      <input id="jNote" placeholder="What happened? (optional)">
      <button id="jAdd" class="qa-btn">${icon('plus','ic-sm')} Add to journal</button>
    </div>`;
    if (!state.memories.length) {
      h += `<div class="kit-empty">No entries yet. Every quest photo lands here, or add your own moments above — you'll have the whole trip in one scroll by the end.</div>`;
      return h;
    }
    // group by day (calendar date)
    const byDay = {};
    state.memories.forEach(m => { const k = new Date(m.ts).toDateString(); (byDay[k] = byDay[k] || []).push(m); });
    Object.keys(byDay).forEach(k => {
      const d = new Date(k);
      h += `<div class="kit-grp">${d.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}</div>`;
      byDay[k].forEach(m => {
        h += `<div class="mem">
          ${m.photo ? `<div class="mem-photo"><img data-photo="${m.photo}" alt=""></div>` : ""}
          <div class="mem-body">
            <div class="mem-t">${esc(m.title || "Moment")}</div>
            ${m.note ? `<div class="mem-n">${esc(m.note)}</div>` : ""}
          </div>
          <button class="si-del" data-delmem="${m.id}" aria-label="Delete memory">${icon('x','ic-sm')}</button>
        </div>`;
      });
    });
    return h;
  }
  function bSaved() {
    let h = `<div class="save-form">
      <input id="svText" placeholder="Paste a link, or jot a note / ticket ref…">
      <input id="svUrl" placeholder="Optional link (https://…)" inputmode="url">
      <button id="svAdd" class="qa-btn">${icon('plus','ic-sm')} Save</button>
    </div>`;
    if (!state.saved.length) {
      h += `<div class="kit-empty">Nothing saved yet. Drop restaurant links, a ticket reference, or a tip you want to remember — it all lives here, offline. You can also ★ Save any place from the map.</div>`;
    } else {
      h += state.saved.map(s => {
        const ic = icon(s.kind==="place"?"bookmark":s.url?"link":"chat");
        const body = s.url
          ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.text)} ↗</a>`
          : `<span>${esc(s.text)}</span>`;
        return `<div class="saved-item"><span class="si-ic">${ic}</span>
          <div class="si-body">${body}</div>
          <button class="si-del" data-del="${s.id}" aria-label="Delete">${icon('x','ic-sm')}</button></div>`;
      }).join("");
    }
    return h;
  }
  function bPacking() {
    let total = 0, done = 0;
    T.packing.forEach(g => g.items.forEach(it => { total++; if (state.packs[g.g+"|"+it]) done++; }));
    let h = `<div class="progress"><i style="width:${total?Math.round(done/total*100):0}%"></i></div>`;
    T.packing.forEach(g => {
      h += `<div class="kit-grp">${esc(g.g)}</div><div class="card" style="margin-bottom:10px">`;
      g.items.forEach(it => {
        const k = g.g+"|"+it, on = !!state.packs[k];
        h += `<div class="check ${on?"done":""}" data-pack="${esc(k)}" role="checkbox" tabindex="0" aria-checked="${on}">
          <div class="box">${on?"✓":""}</div><div class="lbl">${esc(it)}</div></div>`;
      });
      h += `</div>`;
    });
    return h;
  }
  function bPhrases() {
    let h = `<div class="kit-lead">A little Tagalog goes a long way. <a href="https://translate.google.com/?sl=en&tl=tl" target="_blank" rel="noopener">Open Google Translate ↗</a> for anything else.</div>`;
    T.phrases.forEach(sec => {
      h += `<div class="kit-grp">${esc(sec.g)}</div><div class="card" style="margin-bottom:10px">`;
      sec.items.forEach(([en, tl, pr]) => {
        h += `<div class="phrase"><div class="ph-en">${esc(en)}</div>
          <div class="ph-tl">${esc(tl)}</div><div class="ph-pr">${esc(pr)}</div></div>`;
      });
      h += `</div>`;
    });
    return h;
  }
  function bChecklist() {
    const done = T.checklist.filter(c => state.checks[c.id]).length;
    let h = `<div class="progress"><i style="width:${Math.round(done/T.checklist.length*100)}%"></i></div><div class="card">`;
    T.checklist.forEach(c => {
      const on = !!state.checks[c.id];
      h += `<div class="check ${on?"done":""}" data-check="${c.id}">
        <div class="box">${on?"✓":""}</div><div class="lbl">${esc(c.t)}</div>
        ${c.urgent&&!on?`<span class="u">now</span>`:""}</div>`;
    });
    return h + `</div>`;
  }
  function bTips() {
    let h = `<div class="callout"><div class="ic">🛶</div><div>
      <div class="t">Tao drives the whole schedule</div>
      <div class="b">Pick your Tao date first, then slot Coron & El Nido around it. It sells out months ahead; cancellation is strict — 50% inside 30 days, nothing inside 14.</div></div></div>`;
    T.tips.forEach(t => {
      h += `<div class="card"><div class="tip"><div class="ic">${t.icon}</div>
        <div><div class="t">${esc(t.t)}</div><div class="b">${esc(t.b)}</div></div></div></div>`;
    });
    return h;
  }

  function renderKit() {
    view.classList.remove("nopad");
    const s = questStats();
    const savedN = state.saved.length;
    let packDone = 0, packTot = 0;
    T.packing.forEach(g => g.items.forEach(it => { packTot++; if (state.packs[g.g+"|"+it]) packDone++; }));
    const chkDone = T.checklist.filter(c => state.checks[c.id]).length;
    const memN = state.memories.length;
    let html = pointsStrip();
    html += kitSection("quests","flag","Quests & passport",`${s.count}/${s.of} · ${s.pts} pts`, bQuests);
    html += kitSection("journal","book","Trip journal", memN?`${memN} ${memN===1?"entry":"entries"}`:"photos · notes", bJournal);
    html += kitSection("saved","bookmark","Saved & tickets", savedN?`${savedN} saved`:"links · notes · vault", bSaved);
    html += kitSection("packing","bag","Packing lists",`${packDone}/${packTot} packed`, bPacking);
    html += kitSection("phrases","chat","Phrasebook","offline Tagalog", bPhrases);
    html += kitSection("checklist","check","Booking checklist",`${chkDone}/${T.checklist.length} done`, bChecklist);
    html += kitSection("tips","bulb","Tips & know-how",`${T.tips.length} cards`, bTips);
    html += `<div class="center-mut">Everything here works offline. Add to Home Screen for the full app.</div>`;
    view.innerHTML = html;
    wireKit();
  }

  function wireKit() {
    // accordion
    view.querySelectorAll(".kit-head").forEach(el => el.addEventListener("click", () => {
      state.kitOpen = state.kitOpen === el.dataset.sec ? "" : el.dataset.sec;
      LS.set("kitOpen", state.kitOpen); renderKit();
    }));
    // quests
    view.querySelectorAll("[data-quest]").forEach(el => el.addEventListener("click", () => {
      const id = el.dataset.quest, was = !!state.quests[id];
      toggleQuest(id); if (!was) toast("🏆 +" + (T.quests.find(q=>q.id===id)||{}).pts + " — nice!");
      renderKit();
    }));
    view.querySelectorAll("[data-qcam]").forEach(el => el.addEventListener("click", (e) => {
      e.stopPropagation(); const q = T.quests.find(x => x.id === el.dataset.qcam);
      if (q) questPhoto(q, renderKit);
    }));
    // journal: stage a photo, then add note
    let staged = null;
    const jp = $("#jPhoto");
    if (jp) jp.addEventListener("click", () => pickPhoto((file) => {
      staged = file;
      const t = $("#jThumb");
      if (t) { t.hidden = false; t.textContent = file ? ("📷 " + (file.name || "photo ready")) : "No photo"; }
    }));
    const jAdd = $("#jAdd");
    if (jAdd) jAdd.addEventListener("click", async () => {
      const note = ($("#jNote").value || "").trim();
      if (!staged && !note) { toast("Add a photo or a line first"); return; }
      const key = await storePhoto(staged);
      const idx = todayIndex(); const day = (idx>=0 && idx<T.days.length) ? T.days[idx] : null;
      addMemory({ title: day ? day.title : "Moment", note, photo: key });
      toast("📖 Added to your journal"); renderKit();
    });
    view.querySelectorAll("[data-delmem]").forEach(el => el.addEventListener("click", async () => { await delMemory(el.dataset.delmem); renderKit(); }));
    // packing
    view.querySelectorAll("[data-pack]").forEach(el => el.addEventListener("click", () => {
      const k = el.dataset.pack; state.packs[k] = !state.packs[k]; LS.set("packs", state.packs); renderKit();
    }));
    // checklist
    view.querySelectorAll("[data-check]").forEach(el => el.addEventListener("click", () => {
      const id = el.dataset.check; state.checks[id] = !state.checks[id]; LS.set("checks", state.checks); renderKit();
    }));
    // saved add / delete
    const add = $("#svAdd");
    if (add) add.addEventListener("click", () => {
      const text = ($("#svText").value || "").trim();
      let url = ($("#svUrl").value || "").trim();
      if (!text && !url) { toast("Type a note or link first"); return; }
      if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
      addSaved({ kind: url ? "link" : "note", text: text || url, url: url || "" });
      toast("Saved ✓"); renderKit();
    });
    view.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", () => { delSaved(el.dataset.del); renderKit(); }));
    a11y();
    loadThumbs();
  }

  /* ======================= navigation ======================= */
  let pendingDay = null, pendingHub = null, pendingPoi = null;
  function go(tab) {
    state.tab = tab;
    tabbar.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    view.scrollTop = 0;
    ({ today: renderToday, plan: renderPlan, map: renderMap, money: renderMoney, kit: renderKit }[tab] || renderToday)();
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
    a11y();
  }

  // Make non-native clickable elements keyboard-operable (WCAG 2.1.1).
  function a11y() {
    view.querySelectorAll("[data-goday],[data-gohub],[data-poi]").forEach(el => {
      if (el.tagName === "BUTTON" || el.dataset.a11y) return;
      el.dataset.a11y = "1";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
    });
    view.querySelectorAll(".check").forEach(el => {
      el.setAttribute("role", "checkbox");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-checked", el.classList.contains("done") ? "true" : "false");
    });
  }
  // One delegated key handler: Enter/Space activates role=button/checkbox.
  view.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target.closest('[role="button"],[role="checkbox"]');
    // SVG elements (map pins) have no .click(); they handle their own keydown.
    if (t && view.contains(t) && typeof t.click === "function") { e.preventDefault(); t.click(); }
  });

  // countdown ticker
  setInterval(paintTop, 60000);
  paintTop();
  go("today");
})();
