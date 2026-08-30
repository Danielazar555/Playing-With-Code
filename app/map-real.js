/* ============================================================
   Real offline basemap — MapLibre GL + PMTiles.

   The built-in chart map (map.js) always works and needs no download.
   This adds an optional *street-level* basemap from a single local
   .pmtiles archive (OpenStreetMap data), for when you want street
   names, towns and building footprints in your hand with no signal.

   Two ways the archive is found, both fully offline:
     1. served next to the app at  tiles/philippines.pmtiles
        (read with HTTP range requests — only the tiles on screen)
     2. picked once with the file button; the archive is kept in
        IndexedDB and reopened automatically next time

   Nothing here runs unless the user switches to "Streets", so the app
   costs nothing extra until then.
   ============================================================ */
(function () {
  const SERVED_URL = "tiles/philippines.pmtiles";
  const IDB_DB = "phtrip_basemap", IDB_STORE = "files", IDB_KEY = "basemap";

  /* ---------- tiny IndexedDB blob store (the archive can be ~200 MB) ---------- */
  const store = {
    _db: null,
    open() {
      if (this._db) return this._db;
      this._db = new Promise((res, rej) => {
        try {
          const r = indexedDB.open(IDB_DB, 1);
          r.onupgradeneeded = () => r.result.createObjectStore(IDB_STORE);
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      });
      return this._db;
    },
    async put(blob, name) {
      const d = await this.open();
      return new Promise((res, rej) => {
        const t = d.transaction(IDB_STORE, "readwrite");
        t.objectStore(IDB_STORE).put({ blob, name, ts: Date.now() }, IDB_KEY);
        t.oncomplete = res; t.onerror = () => rej(t.error);
      });
    },
    async get() {
      const d = await this.open();
      return new Promise((res) => {
        const t = d.transaction(IDB_STORE, "readonly");
        const q = t.objectStore(IDB_STORE).get(IDB_KEY);
        q.onsuccess = () => res(q.result || null);
        q.onerror = () => res(null);
      });
    },
    async clear() {
      const d = await this.open();
      return new Promise((res) => {
        const t = d.transaction(IDB_STORE, "readwrite");
        t.objectStore(IDB_STORE).delete(IDB_KEY);
        t.oncomplete = res; t.onerror = res;
      });
    }
  };

  /* ---------- style: Protomaps basemap v4 layer names, our palette ---------- */
  const C = {
    sea:      "#04182f",
    earth:    "#0d2b3f",
    green:    "#123a34",
    water:    "#0a2547",
    road:     "#2b4f72",
    roadHi:   "#3c6a94",
    building: "#143352",
    text:     "#dbe9f7",
    halo:     "#04182f"
  };

  function vectorStyle(srcKey, maxZoom) {
    return {
      version: 8,
      glyphs: null,                       // no font server offline; labels use
      sources: {                          // the renderer's built-in fallback
        base: { type: "vector", url: "pmtiles://" + srcKey, attribution:
          "© OpenStreetMap contributors · Protomaps" }
      },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": C.sea } },
        { id: "earth", type: "fill", source: "base", "source-layer": "earth",
          paint: { "fill-color": C.earth } },
        { id: "landuse", type: "fill", source: "base", "source-layer": "landuse",
          paint: { "fill-color": C.green, "fill-opacity": 0.55 } },
        { id: "water", type: "fill", source: "base", "source-layer": "water",
          paint: { "fill-color": C.water } },
        { id: "buildings", type: "fill", source: "base", "source-layer": "buildings",
          minzoom: 14, paint: { "fill-color": C.building, "fill-opacity": 0.8 } },
        { id: "roads-minor", type: "line", source: "base", "source-layer": "roads",
          minzoom: 11,
          filter: ["!=", ["get", "kind"], "highway"],
          paint: { "line-color": C.road,
                   "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.4, 16, 2.4] } },
        { id: "roads-major", type: "line", source: "base", "source-layer": "roads",
          filter: ["==", ["get", "kind"], "highway"],
          paint: { "line-color": C.roadHi,
                   "line-width": ["interpolate", ["linear"], ["zoom"], 7, 0.6, 16, 4] } },
        { id: "boundaries", type: "line", source: "base", "source-layer": "boundaries",
          paint: { "line-color": "#2c4a6b", "line-dasharray": [3, 2], "line-width": 0.8 } }
      ],
      // Protomaps archives are usually built to z15; clamp so MapLibre
      // overzooms the deepest tiles instead of requesting missing ones.
      maxzoom: maxZoom || 15
    };
  }

  function rasterStyle(srcKey, maxZoom) {
    return {
      version: 8,
      sources: { base: { type: "raster", tiles: ["pmtiles://" + srcKey + "/{z}/{x}/{y}"],
                         tileSize: 256, maxzoom: maxZoom || 15,
                         attribution: "© OpenStreetMap contributors" } },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": C.sea } },
        { id: "base", type: "raster", source: "base" }
      ]
    };
  }

  /* ---------- the layer ---------- */
  function RealMap(host, trip, opts) {
    this.host = host; this.trip = trip; this.opts = opts || {};
    this.map = null; this.archive = null;
  }

  // Resolve an archive: an explicit File, the IndexedDB copy, or the served file.
  RealMap.prototype.resolve = async function (file) {
    if (file) {
      const p = new pmtiles.PMTiles(new pmtiles.FileSource(file));
      await p.getHeader();                       // throws if it isn't a PMTiles
      try { await store.put(file, file.name); } catch (e) { /* quota — still usable now */ }
      return p;
    }
    const saved = await store.get().catch(() => null);
    if (saved && saved.blob) {
      try {
        const f = saved.blob instanceof File
          ? saved.blob : new File([saved.blob], saved.name || "basemap.pmtiles");
        const p = new pmtiles.PMTiles(new pmtiles.FileSource(f));
        await p.getHeader();
        return p;
      } catch (e) { /* fall through to the served copy */ }
    }
    const p = new pmtiles.PMTiles(SERVED_URL);
    await p.getHeader();                          // rejects when not deployed
    return p;
  };

  RealMap.prototype.mount = async function (file) {
    const archive = await this.resolve(file);
    this.archive = archive;

    const hdr = await archive.getHeader();
    let meta = {};
    try { meta = await archive.getMetadata(); } catch (e) {}

    const protocol = new pmtiles.Protocol();
    if (!RealMap._protocolAdded) {
      maplibregl.addProtocol("pmtiles", protocol.tile);
      RealMap._protocolAdded = true;
    }
    RealMap._protocol = protocol;
    protocol.add(archive);
    const key = archive.source.getKey();

    // tileType 1 = MVT (vector); 2/3/4 = png/jpeg/webp raster
    const isVector = hdr.tileType === 1;
    const style = isVector ? vectorStyle(key, hdr.maxZoom) : rasterStyle(key, hdr.maxZoom);

    // Warn (once, in console) if a vector archive doesn't carry the layer names
    // this style paints — that is the usual cause of an "empty" basemap.
    if (isVector && meta && meta.vector_layers) {
      const have = new Set(meta.vector_layers.map(l => l.id));
      const want = ["earth", "water", "roads"];
      const missing = want.filter(w => !have.has(w));
      if (missing.length) {
        console.warn("[basemap] archive lacks expected layers:", missing.join(", "),
                     "— it has:", [...have].join(", "),
                     "\nThis style targets a Protomaps basemap build.");
        this.layerWarning = missing;
      }
    }

    this.host.innerHTML = "";
    this.map = new maplibregl.Map({
      container: this.host,
      style,
      center: this.opts.center || [120.5, 11.2],
      zoom: this.opts.zoom || 6.2,
      minZoom: hdr.minZoom || 0,
      maxZoom: Math.min(18, (hdr.maxZoom || 15) + 2),
      attributionControl: { compact: true }
    });
    this.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    this.map.on("load", () => this._overlay());
    return { hdr, meta, isVector };
  };

  // Our own route + places drawn on top of the street data.
  RealMap.prototype._overlay = function () {
    const T = this.trip, map = this.map;
    const hubs = T.hubs;
    map.addSource("route", { type: "geojson", data: {
      type: "Feature", geometry: { type: "LineString",
        coordinates: hubs.map(h => [h.lng, h.lat]) } } });
    map.addLayer({ id: "route-halo", type: "line", source: "route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#04182f", "line-width": 7, "line-opacity": .7 } });
    map.addLayer({ id: "route", type: "line", source: "route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#fcd116", "line-width": 3 } });

    const cats = window.MAP_CATS || {};
    for (const id in T.pois) {
      const p = T.pois[id];
      const el = document.createElement("button");
      el.className = "rm-pin" + (p.star ? " star" : "");
      el.style.background = (cats[p.cat] || {}).c || "#3fd9e4";
      el.setAttribute("aria-label", p.name);
      el.addEventListener("click", () => {
        new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat([p.lng, p.lat])
          .setHTML(`<div class="rm-pop"><b>${escapeHtml(p.name)}</b>` +
                   (p.fee ? `<i>${escapeHtml(p.fee)}</i>` : "") +
                   `<p>${escapeHtml(p.note || "")}</p></div>`)
          .addTo(map);
      });
      new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
    }
    hubs.forEach((h, i) => {
      const el = document.createElement("div");
      el.className = "rm-hub";
      el.style.background = h.color;
      el.textContent = i + 1;
      new maplibregl.Marker({ element: el }).setLngLat([h.lng, h.lat]).addTo(map);
    });
  };

  RealMap.prototype.fitHub = function (hubId) {
    const h = this.trip.hubs.find(x => x.id === hubId);
    if (h && this.map) this.map.flyTo({ center: [h.lng, h.lat], zoom: 12, duration: 700 });
  };
  RealMap.prototype.fitAll = function () {
    if (!this.map) return;
    const b = new maplibregl.LngLatBounds();
    this.trip.hubs.forEach(h => b.extend([h.lng, h.lat]));
    this.map.fitBounds(b, { padding: 48, duration: 700 });
  };
  RealMap.prototype.destroy = function () {
    if (this.map) { try { this.map.remove(); } catch (e) {} this.map = null; }
  };

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
  }

  RealMap.hasStoredArchive = async function () {
    try { const s = await store.get(); return !!(s && s.blob); } catch (e) { return false; }
  };
  RealMap.forget = () => store.clear();
  RealMap.available = () =>
    typeof maplibregl !== "undefined" && typeof pmtiles !== "undefined";

  window.RealMap = RealMap;
})();
