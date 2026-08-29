/* ============================================================
   TripMap — dependency-free SVG map.
   Renders real coastline geometry (window.COAST) + trip pins,
   with pan / zoom, an animated journey route, category filters,
   and click-to-open place cards. No tiles, works fully offline.
   ============================================================ */
(function () {
  const SVGNS = "http://www.w3.org/2000/svg";
  const R = 6371;

  // Equirectangular projection with latitude correction; y flipped for screen.
  function project(lng, lat, lat0) {
    const x = lng * Math.cos(lat0 * Math.PI / 180);
    const y = -lat;
    return [x, y];
  }
  // Haversine, km
  function dist(a, b) {
    const t = Math.PI / 180;
    const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
    const la1 = a.lat * t, la2 = b.lat * t;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  const CAT = {
    beach:     { c:"#e8b23a", g:"◗" },
    lagoon:    { c:"#2ea9c9", g:"❍" },
    viewpoint: { c:"#c065b8", g:"▲" },
    food:      { c:"#e2603a", g:"●" },
    dive:      { c:"#2f7dd1", g:"✦" },
    transport: { c:"#8aa0b6", g:"✈" },
    camp:      { c:"#e8823a", g:"⌂" },
    town:      { c:"#5a6b7e", g:"◉" },
    springs:   { c:"#d9534f", g:"♨" }
  };

  function el(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function TripMap(host, trip, coast, opts) {
    this.host = host;
    this.trip = trip;
    this.coast = coast;
    this.opts = opts || {};
    this.lat0 = 11.4;               // reference latitude for x-correction
    this.filters = new Set(Object.keys(CAT));
    this.activeHub = null;          // hub id to zoom/limit to, or null = whole journey
    this.selectedPoi = null;
    this.onSelect = this.opts.onSelect || function () {};
    this._build();
    this.showJourney();
  }

  TripMap.prototype._build = function () {
    const h = this.host;
    h.innerHTML = "";
    h.classList.add("map-host");
    const svg = el("svg", { class:"map-svg", xmlns:SVGNS }, h);
    this.svg = svg;
    this.gSea = el("g", null, svg);
    this.gLand = el("g", { class:"land" }, svg);
    this.gRoute = el("g", { class:"route" }, svg);
    this.gPins = el("g", { class:"pins" }, svg);
    this.gLabels = el("g", { class:"labels" }, svg);

    // popup overlay (HTML, positioned over svg)
    this.pop = document.createElement("div");
    this.pop.className = "map-pop";
    this.pop.hidden = true;
    h.appendChild(this.pop);

    // zoom controls
    const ctl = document.createElement("div");
    ctl.className = "map-ctl";
    ctl.innerHTML =
      '<button data-a="in" aria-label="Zoom in">+</button>' +
      '<button data-a="out" aria-label="Zoom out">−</button>' +
      '<button data-a="fit" aria-label="Fit journey">⤢</button>';
    h.appendChild(ctl);
    ctl.addEventListener("click", (e) => {
      const a = e.target.dataset.a;
      if (a === "in") this._zoomBy(0.7);
      else if (a === "out") this._zoomBy(1.42);
      else if (a === "fit") this.activeHub ? this.focusHub(this.activeHub) : this.showJourney();
    });

    // interaction
    this._wire();
    this._ro = new ResizeObserver(() => this._applyView());
    this._ro.observe(h);
  };

  // ---- geometry helpers ----
  TripMap.prototype._pathFor = function (ring) {
    let d = "";
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = project(ring[i][0], ring[i][1], this.lat0);
      d += (i ? "L" : "M") + x.toFixed(4) + " " + y.toFixed(4);
    }
    return d + "Z";
  };

  TripMap.prototype._drawLand = function (regions) {
    this.gLand.innerHTML = "";
    const seen = regions || Object.keys(this.coast);
    for (const key of seen) {
      const rings = this.coast[key];
      if (!rings) continue;
      for (const ring of rings) {
        el("path", { d: this._pathFor(ring) }, this.gLand);
      }
    }
  };

  // Compute a bounding box (projected) from a list of {lng,lat} points, with padding frac.
  TripMap.prototype._bboxOf = function (pts, pad, minSpan) {
    let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
    for (const p of pts) {
      const [x,y] = project(p.lng, p.lat, this.lat0);
      minx=Math.min(minx,x); maxx=Math.max(maxx,x);
      miny=Math.min(miny,y); maxy=Math.max(maxy,y);
    }
    let w = maxx-minx || 0.2, hh = maxy-miny || 0.2;
    const p = pad==null?0.18:pad;
    minx-=w*p; maxx+=w*p; miny-=hh*p; maxy+=hh*p;
    // enforce a minimum extent so single-point clusters don't over-zoom
    const ms = minSpan || 0;
    if (ms) {
      const cx=(minx+maxx)/2, cy=(miny+maxy)/2;
      if (maxx-minx < ms) { minx=cx-ms/2; maxx=cx+ms/2; }
      if (maxy-miny < ms) { miny=cy-ms/2; maxy=cy+ms/2; }
    }
    // keep aspect square-ish, expand smaller side
    w = maxx-minx; hh = maxy-miny;
    if (w < hh) { const d=(hh-w)/2; minx-=d; maxx+=d; }
    else { const d=(w-hh)/2; miny-=d; maxy+=d; }
    return { x:minx, y:miny, w:maxx-minx, h:maxy-miny };
  };

  TripMap.prototype._setView = function (box, animate) {
    this._view = box;
    this._applyView(animate);
  };

  // Robust pixel width of the map host (falls back before layout settles).
  TripMap.prototype._pxW = function () {
    const w = this.host.getBoundingClientRect().width || this.host.clientWidth || 0;
    return w > 20 ? w : 390;
  };

  TripMap.prototype._applyView = function (animate) {
    if (!this._view) return;
    const b = this._view;
    this.svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.w} ${b.h}`);
    // sea background rect
    this.gSea.innerHTML = "";
    el("rect", { x:b.x-b.w, y:b.y-b.h, width:b.w*3, height:b.h*3, class:"sea" }, this.gSea);
    this._scalePins();
    this._layoutLabels();
    this._positionPop();
  };

  // Keep pin markers a constant screen size regardless of zoom.
  TripMap.prototype._scalePins = function () {
    if (!this._view) return;
    const scale = this._view.w / this._pxW(); // world units per px
    const r = 7 * scale;
    this._pinR = r;
    this.gPins.querySelectorAll("circle.pin").forEach(c => {
      c.setAttribute("r", c.classList.contains("star") ? r*1.25 : r);
      c.setAttribute("stroke-width", scale*1.6);
    });
    this.gPins.querySelectorAll("circle.hub").forEach(c => {
      c.setAttribute("r", r*1.7);
      c.setAttribute("stroke-width", scale*2.4);
    });
    this.gRoute.querySelectorAll("path,line").forEach(l => l.setAttribute("stroke-width", scale*2.2));
    this.gRoute.querySelectorAll("path.halo").forEach(l => l.setAttribute("stroke-width", scale*5));
  };

  // ---- rendering pins & routes ----
  TripMap.prototype._pinsForHub = function (hubId) {
    const out = [];
    for (const id in this.trip.pois) {
      const p = this.trip.pois[id];
      if (!hubId || p.hub === hubId) out.push([id, p]);
    }
    return out;
  };

  TripMap.prototype._drawPins = function (list) {
    this.gPins.innerHTML = "";
    for (const [id, p] of list) {
      if (!this.filters.has(p.cat)) continue;
      const [x, y] = project(p.lng, p.lat, this.lat0);
      const meta = CAT[p.cat] || CAT.town;
      const c = el("circle", {
        class: "pin" + (p.star ? " star" : ""),
        cx:x, cy:y, r:0.01, fill: meta.c,
        "data-id": id
      }, this.gPins);
      c.addEventListener("click", (e) => { e.stopPropagation(); this.openPoi(id); });
    }
    this._scalePins();
  };

  TripMap.prototype._drawRoute = function (hubs) {
    this.gRoute.innerHTML = "";
    if (hubs.length < 2) { this._drawHubDots(hubs); return; }
    let d = "";
    hubs.forEach((hb, i) => {
      const [x, y] = project(hb.lng, hb.lat, this.lat0);
      d += (i ? "L" : "M") + x.toFixed(4) + " " + y.toFixed(4);
    });
    el("path", { d, class:"halo", fill:"none" }, this.gRoute);
    const line = el("path", { d, class:"line", fill:"none" }, this.gRoute);
    // dash-draw animation
    try {
      const len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.getBoundingClientRect();
      line.style.transition = "stroke-dashoffset 1.1s ease";
      requestAnimationFrame(() => { line.style.strokeDashoffset = 0; });
    } catch (e) {}
    this._drawHubDots(hubs);
  };

  TripMap.prototype._drawHubDots = function (hubs) {
    this.gLabels.innerHTML = "";
    hubs.forEach((hb, i) => {
      const [x, y] = project(hb.lng, hb.lat, this.lat0);
      const c = el("circle", { class:"hub", cx:x, cy:y, r:0.02, fill: hb.color, "data-hub":hb.id }, this.gPins);
      c.addEventListener("click", (e) => { e.stopPropagation(); this.focusHub(hb.id); });
      const t = el("text", { class:"hub-label", "data-bx":x, "data-by":y, "data-hub":hb.id }, this.gLabels);
      t.textContent = (i+1) + "  " + hb.name;
    });
    this._layoutLabels();
  };

  // Position + size labels from their stored base coords every view change
  // (absolute, so nothing compounds across pan/zoom frames).
  TripMap.prototype._layoutLabels = function () {
    if (!this._view) return;
    const scale = this._view.w / this._pxW();
    const off = (this._pinR || 0.05) * 1.7;
    this.gLabels.querySelectorAll("text").forEach(t => {
      const bx = +t.getAttribute("data-bx"), by = +t.getAttribute("data-by");
      t.setAttribute("x", bx + off);
      t.setAttribute("y", by + off * 0.3);
      t.setAttribute("font-size", 11 * scale);
      t.setAttribute("stroke-width", 3.2 * scale);
    });
  };

  // ---- public view modes ----
  TripMap.prototype.showJourney = function () {
    this.activeHub = null;
    this._drawLand(); // all regions
    const hubs = this.trip.hubs;
    this._drawRoute(hubs);
    this._drawPins(this._pinsForHub(null).filter(([id,p]) => p.star || p.cat==="transport"));
    this._setView(this._bboxOf(hubs, 0.22));
    this.closePop();
  };

  TripMap.prototype.focusHub = function (hubId) {
    const hub = this.trip.hubs.find(h => h.id === hubId);
    if (!hub) return;
    this.activeHub = hubId;
    // detailed regional geometry only (overview is too coarse when zoomed in)
    this._drawLand([hub.region]);
    const pins = this._pinsForHub(hubId);
    this._drawRoute([hub]); // just the hub dot
    this._drawPins(pins);
    const pts = pins.map(([id,p]) => p).concat([hub]);
    this._setView(this._bboxOf(pts.length?pts:[hub], 0.28, 0.22));
    this.closePop();
    if (this.opts.onHub) this.opts.onHub(hubId);
  };

  TripMap.prototype.focusDay = function (day) {
    // Route/zoom to the pins of one day
    if (!day) return;
    if (day.hub) {
      const hub = this.trip.hubs.find(h => h.id === day.hub);
      if (hub) this._drawLand([hub.region]);
    }
    const pins = (day.pins||[]).map(id => [id, this.trip.pois[id]]).filter(x=>x[1]);
    this.activeHub = day.hub;
    this._drawPins(this._pinsForHub(day.hub));
    const hub = this.trip.hubs.find(h => h.id === day.hub);
    this._drawRoute(hub ? [hub] : []);
    const pts = pins.map(([id,p]) => p);
    if (hub) pts.push(hub);
    if (pts.length) this._setView(this._bboxOf(pts, 0.35, 0.12));
    // highlight the day's pins
    this.gPins.querySelectorAll("circle.pin").forEach(c => {
      c.classList.toggle("dim", !(day.pins||[]).includes(c.dataset.id));
    });
    if (pins.length) this.openPoi(pins[0][0], true);
  };

  TripMap.prototype.setFilter = function (cat, on) {
    if (on) this.filters.add(cat); else this.filters.delete(cat);
    if (this.activeHub) this._drawPins(this._pinsForHub(this.activeHub));
    else this._drawPins(this._pinsForHub(null).filter(([id,p]) => p.star || p.cat==="transport"));
  };

  // ---- POI popup ----
  TripMap.prototype.openPoi = function (id, keepView) {
    const p = this.trip.pois[id];
    if (!p) return;
    this.selectedPoi = id;
    const meta = CAT[p.cat] || CAT.town;
    const mapHref = p.url || ("https://www.google.com/maps/search/?api=1&query=" + p.lat + "," + p.lng);
    this.pop.innerHTML =
      `<button class="pop-x" aria-label="Close">×</button>` +
      `<div class="pop-cat" style="color:${meta.c}">${meta.g} ${p.cat}${p.star?' · ★ highlight':''}</div>` +
      `<h4>${p.name}</h4>` +
      (p.fee ? `<div class="pop-fee">💳 ${p.fee}</div>` : "") +
      `<p>${p.note||""}</p>` +
      (p.rec ? `<p class="pop-rec">“${p.rec}”</p>` : "") +
      `<div class="pop-act">` +
        `<a target="_blank" rel="noopener" href="${mapHref}">Open in Maps ↗</a>` +
        (p.book ? `<a target="_blank" rel="noopener" href="${p.book}">Book / info ↗</a>` : "") +
      `</div>`;
    this.pop.hidden = false;
    this.pop.querySelector(".pop-x").addEventListener("click", () => this.closePop());
    this._popTarget = [p.lng, p.lat];
    this._positionPop();
    // pulse the pin
    this.gPins.querySelectorAll("circle.pin").forEach(c => c.classList.toggle("sel", c.dataset.id===id));
    this.onSelect(id, p);
  };

  TripMap.prototype._positionPop = function () {
    if (this.pop.hidden || !this._popTarget || !this._view) return;
    const rect = this.host.getBoundingClientRect();
    const [lng, lat] = this._popTarget;
    const [wx, wy] = project(lng, lat, this.lat0);
    const px = (wx - this._view.x) / this._view.w * rect.width;
    const py = (wy - this._view.y) / this._view.h * rect.height;
    const pw = this.pop.offsetWidth || 240, ph = this.pop.offsetHeight || 140;
    let left = px - pw/2, top = py - ph - 16;
    left = Math.max(8, Math.min(rect.width - pw - 8, left));
    if (top < 8) top = py + 18;
    this.pop.style.left = left + "px";
    this.pop.style.top = top + "px";
  };

  TripMap.prototype.closePop = function () {
    this.pop.hidden = true;
    this._popTarget = null;
    this.selectedPoi = null;
    this.gPins.querySelectorAll("circle.pin.sel").forEach(c => c.classList.remove("sel"));
  };

  // ---- pan / zoom interaction ----
  TripMap.prototype._zoomBy = function (f) {
    if (!this._view) return;
    const b = this._view, cx = b.x + b.w/2, cy = b.y + b.h/2;
    const nw = b.w*f, nh = b.h*f;
    this._setView({ x:cx-nw/2, y:cy-nh/2, w:nw, h:nh });
  };

  TripMap.prototype._wire = function () {
    const svg = this.svg, host = this.host;
    let drag = null;
    const toWorld = (clientX, clientY) => {
      const rect = host.getBoundingClientRect(), b = this._view;
      return [ b.x + (clientX-rect.left)/rect.width*b.w,
               b.y + (clientY-rect.top)/rect.height*b.h ];
    };
    host.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".map-ctl") || e.target.closest(".map-pop")) return;
      // Don't capture yet — capturing here would steal the click from a pin.
      drag = { x:e.clientX, y:e.clientY, vx:this._view.x, vy:this._view.y, moved:false, id:e.pointerId, cap:false, onPin: !!e.target.closest("circle") };
    });
    host.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const rect = host.getBoundingClientRect(), b = this._view;
      const dx = (e.clientX-drag.x)/rect.width*b.w;
      const dy = (e.clientY-drag.y)/rect.height*b.h;
      if (!drag.moved && Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y) > 4) {
        drag.moved = true;
        try { host.setPointerCapture(drag.id); drag.cap = true; } catch (err) {}
        host.classList.add("grab");
      }
      if (drag.moved) this._setView({ x:drag.vx-dx, y:drag.vy-dy, w:b.w, h:b.h });
    });
    // A tap on empty sea closes the popup; a tap on a pin is handled by the pin.
    const end = () => {
      if (drag && !drag.moved && !drag.onPin) this.closePop();
      if (drag && drag.cap) { try { host.releasePointerCapture(drag.id); } catch (err) {} }
      drag = null; host.classList.remove("grab");
    };
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);
    host.addEventListener("wheel", (e) => {
      e.preventDefault();
      const [wx, wy] = toWorld(e.clientX, e.clientY);
      const f = e.deltaY > 0 ? 1.12 : 0.89;
      const b = this._view;
      const nw = b.w*f, nh = b.h*f;
      // zoom toward cursor
      this._setView({
        x: wx - (wx-b.x)*(nw/b.w),
        y: wy - (wy-b.y)*(nh/b.h),
        w: nw, h: nh
      });
    }, { passive:false });
  };

  window.TripMap = TripMap;
  window.MAP_CATS = CAT;
})();
