# Offline street basemap (optional)

The app's **Chart** map always works and needs no download — real coastlines,
the route and every pin, ~110 KB, already inside the app.

**Streets** adds full OpenStreetMap detail — street names, towns, buildings —
from a single local file. Nothing is fetched at runtime.

## Build it (once, on wifi)

```bash
./make-tiles.sh          # z0–14  ≈ 120–180 MB   ← recommended
./make-tiles.sh 15       # z0–15  ≈ 250–320 MB   (check your 300 MB budget)
```

Covers `117.8,8.9 → 124.4,12.6` — Palawan (Coron, Linapacan, El Nido) through
Cebu and Moalboal, i.e. every place in the itinerary.

## Use it

Either:
- leave `philippines.pmtiles` in this folder and serve the app
  (`python3 -m http.server` in `app/`), or
- open the app → **Map** → **Streets** → *Choose .pmtiles file*.
  It is stored on your device (IndexedDB) and reopens automatically.

The picker route works even from `file://`, because PMTiles reads a picked
`File` directly — no server needed.

## Why PMTiles

One file instead of tens of thousands of tiles, and the reader fetches only the
few kilobytes for the tiles on screen. Vector tiles also stay sharp at any zoom
and are restyled to the app's palette rather than shipped as fixed images.

Data © OpenStreetMap contributors (ODbL); basemap build by Protomaps.
