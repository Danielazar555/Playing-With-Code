/* Offline-first service worker. Cache-first for the app shell so the
   whole planner works on the Tao expedition with zero signal. */
const CACHE = "ph-trip-v1";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "map.js",
  "data/trip.js",
  "data/coast.js",
  "manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // don't touch cross-origin (e.g. Maps links)
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
