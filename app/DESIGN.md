# Philippines Trip Companion — research, spec & design

A lean, **offline-first** web app to carry through a 20-night Philippines trip
(Cebu → Coron → Tao expedition → El Nido → Moalboal). Built as a single-page
PWA with **zero runtime dependencies** — no build step, no CDN, no tile server.

---

## 1. Research — what's out there, and the gap

| App | Strength | Why it's not enough here |
|---|---|---|
| **Wanderlog** | Day-by-day itinerary + map + collaboration; the best free planner | Offline maps are Pro-only ($39/yr); heavy, account-required, generic |
| **TripIt** | Auto-parses booking emails into a timeline | Organizer, not a planner — no map, no local knowledge, no calculators |
| **Polarsteps** | Beautiful auto-tracked route map | Journalling *after the fact*, not a pre-trip decision tool |
| **Maps.me / OsmAnd** | True offline vector maps + search | Just a map — no schedule, no budget, no trip-specific tips |
| **Google Maps offline** | Reliable offline tiles + directions | Manual per-area downloads; no itinerary, no per-day story |
| **XE / currency apps** | FX conversion | Single-purpose; nothing else |

**The gap this app fills.** Every real trip needs *five* things in one place that
works with **no signal** (critical: the Tao expedition has zero connectivity for
4 days, and Palawan data is patchy throughout):

1. **A schedule you can read at a glance** — "what is today, what's next."
2. **A map that tells the journey story** — the route, the hubs, and the
   *specific* pins that matter (which lagoon, which viewpoint, which beach),
   not a generic pin-drop.
3. **Calculators** — currency (PHP is unfamiliar) + tip/split + a live budget.
4. **Offline local knowledge** — fees, timing tricks, packing, scams, health.
5. **A booking checklist** that surfaces what's still urgent.

No single existing app does all five offline for *your* trip. So we build a
purpose-made one, seeded with this exact itinerary.

### Destination facts gathered (baked into the data)
- **Coron**: Kayangan Lake ₱300 + ₱200 eco fee (10-day), be at the landing
  before 8am; island-hop tours ₱1,500–2,500 incl. lunch; Barracuda Lake ₱200,
  world-class freediving; Mt Tapyas = 720 steps, sunset.
- **El Nido**: eco fee ₱400 (10-day, pay once), Tour A ~₱1,400 + ₱200/lagoon;
  book the earliest Tour A slot to beat crowds; Nacpan ~45 min north; Las
  Cabanas = the classic sunset.
- **Tao**: $550 low / $670 peak season + ~$5 env fee; sells out months ahead,
  strict cancellation; no wifi; pack a dry bag + power bank; add ~$90 protection.
- **Moalboal**: sardine run + turtles a 20 m swim off Panagsama, ₱100 env fee;
  Kawasan canyoneering ~₱1,200; Pescador Island marine sanctuary.
- **Logistics**: small domestic planes cap bags ~10–15 kg and overbook; island
  ATMs unreliable — draw pesos in Cebu; February is Palawan's dry, calm prime.

---

## 2. Spec — features

**Five tabs**, thumb-reachable bottom nav:

- **Today** — date-aware. Before the trip: a live countdown + urgent-booking
  nudge. During: today's card (place + plan), today's spots, and "coming up".
- **Plan** — the hub strip ("the shape") + a vertical timeline of all 22 days,
  colour-coded by hub, with type tags (highlight/beach/dive/travel/rest/…) and
  tappable mini-pins that jump to the map.
- **Map** — the centrepiece (see §3).
- **Money** — currency converter (PHP/USD/ILS, editable rates), tip & split
  calculator, and a live per-person budget that re-denominates on the fly.
- **Tips** — a persistent booking checklist with progress + urgency badges, and
  10 offline "know before you go" cards.

**Cross-cutting**
- Fully offline via service worker (cache-first shell + data).
- State (checklist, FX overrides, last converter pair) persists in localStorage.
- Installable (PWA manifest, standalone, add-to-home-screen).
- Online/offline indicator; auto-updating countdown.

---

## 3. The map (design rationale)

The user specifically wanted *"maps with pics, location, the journey of choosing
days and seeing routes with pinpoints on locations — highlights, recommendations
of restaurants, viewpoints."* Design decisions:

- **Real coastline, no tiles.** Tile servers need a network and an API key and
  break offline. Instead we ship **actual island geometry** (Natural Earth,
  simplified with Douglas–Peucker) as ~110 KB of JSON — the true shapes of the
  Bacuit archipelago, Coron Island, Linapacan and south Cebu — rendered as SVG.
  It works on the boat with the phone in airplane mode.
- **Two zoom stories.** *Journey* mode draws the whole archipelago with the
  route line threading all six hubs in order (numbered, colour-coded, animated
  draw-in). *Hub* mode zooms to one base and shows its detailed regional
  geometry with every categorised pin.
- **Pinpoints with meaning.** Nine categories (lagoon, beach, viewpoint, dive,
  camp, springs, town, transport, food), each colour + glyph coded, filterable.
  Tapping a pin opens a card: category, ★highlight flag, fee, a one-line local
  tip, and a one-tap "Open in Maps" hand-off for live navigation when online.
- **Days link to the map.** Any day or spot in Plan/Today deep-links into the
  map, focused on that hub with the day's pins highlighted.

Interaction: drag to pan, wheel/pinch to zoom, buttons for zoom & fit. Pin
markers and labels stay a constant screen size at any zoom.

---

## 4. Visual design

- **Coastal dark theme** — deep sea navy ground, aqua/teal/sun accents, tropical
  but legible in bright sun. Dark-first (you'll use it outdoors at night too).
- System font stack, 15px base, generous tap targets (≥40px), safe-area insets
  for notched phones.
- Cards with soft borders; colour semantics carried consistently (each hub has a
  colour used on its timeline dot, hub chip, and map route node).

---

## 5. QA roast — issues found in review, and fixes

Reviewed by running the app in headless Chromium at phone size and screenshotting
every tab + interaction. Findings and resolutions:

| # | Roast (what was wrong / not UX-friendly) | Fix |
|---|---|---|
| 1 | **Map labels rendered gigantic** — on first paint the map host reports ~0 px width, so world-units-per-pixel exploded and label/stroke sizes were set from garbage. | Added a robust `_pxW()` with a sane fallback; recompute label size every view change from a **stored base coord** so nothing compounds. |
| 2 | **Single-POI hubs (Mactan) over-zoomed** into a blocky coarse polygon. | Draw only the *detailed* regional geometry on hub focus (drop the coarse "overview"); enforce a **minimum zoom span** so a lone pin still shows an area. |
| 3 | **Tapping a pin never opened its card** — `setPointerCapture` on pointer-down stole the click from the pin. | Capture the pointer **only once a real drag starts** (>4px), and treat a stationary tap on a pin as a pin tap, on empty sea as "close card". |
| 4 | **Map filter bar hidden behind the tab bar** (both pinned to the bottom). | Lift the filter bar by `--tab-h + safe-area` so all category chips are reachable. |
| 5 | **Currency converter blank on load** — listeners attached but never fired once. | Call `fxCalc()` on mount so the result (₱5,850) and quick amounts show immediately. |

Verified after fixes: **0 console/page errors** across all tabs; pin cards open;
checklist state persists to localStorage; and the app **boots fully offline from
the service-worker cache** (the make-or-break requirement for the Tao days).

---

## 6. Architecture / files

```
app/
  index.html              shell + bottom tab nav
  styles.css              design system (one stylesheet)
  app.js                  tabs, Today/Plan/Money/Tips, calculators, state
  map.js                  dependency-free SVG map (pan/zoom/pins/route/cards)
  sw.js                   cache-first service worker (offline)
  manifest.webmanifest    installable PWA metadata
  data/
    trip.js               ALL trip content (hubs, days, POIs, tips, budget)
    coast.js              ~110 KB real coastline geometry (Natural Earth)
  DESIGN.md               this document
  README.md               how to run
```

To change the trip, edit **`data/trip.js`** only — every screen reads from it.

**Data source:** coastline from Natural Earth (public domain) via the
`nvkelso/natural-earth-vector` GeoJSON, clipped to the trip regions and
simplified. Prices/fees are 2026 research estimates — verify at booking time.
