#!/usr/bin/env bash
# Build ONE offline basemap archive for this trip: Palawan + Cebu, from the
# Protomaps daily OpenStreetMap build. Run this once, on a normal connection.
#
#   ./make-tiles.sh            # default: z0-14, ~120-180 MB
#   ./make-tiles.sh 15         # sharper streets, ~250-320 MB (watch the budget)
#
# Result: philippines.pmtiles  — drop it next to the app (tiles/) or pick it
# with the "Choose .pmtiles file" button in the app.
set -euo pipefail

MAXZOOM="${1:-14}"
OUT="philippines.pmtiles"

# The trip's two clusters, as one bbox: west Palawan through Cebu.
#            minLon,  minLat,  maxLon,  maxLat
BBOX="117.8,8.9,124.4,12.6"

if ! command -v pmtiles >/dev/null 2>&1; then
  cat <<'MSG'
This needs the `pmtiles` CLI (a single binary, no runtime):

  macOS       brew install pmtiles
  Linux/Win   grab a release from
              https://github.com/protomaps/go-pmtiles/releases
              then put the `pmtiles` binary on your PATH

MSG
  exit 1
fi

# Protomaps publishes a daily planet build; extract only our bbox and zooms.
# `extract` uses HTTP range requests, so it downloads roughly the size of the
# output — not the whole planet.
SRC="https://build.protomaps.com/$(date -u +%Y%m%d).pmtiles"
if ! curl -sfI "$SRC" >/dev/null; then
  SRC="https://build.protomaps.com/$(date -u -d '2 days ago' +%Y%m%d 2>/dev/null \
        || date -u -v-2d +%Y%m%d).pmtiles"
fi

echo "source : $SRC"
echo "bbox   : $BBOX"
echo "zooms  : 0-$MAXZOOM"
echo

pmtiles extract "$SRC" "$OUT" --bbox="$BBOX" --maxzoom="$MAXZOOM"

echo
ls -lh "$OUT" | awk '{print "built  : " $9 "  " $5}'
echo "Now either leave it here (tiles/$OUT) and serve the app,"
echo "or open the app, go to Map → Streets, and pick this file."
