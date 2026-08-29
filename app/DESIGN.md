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

## 5b. Enrichment pass (curated highlights + cash blueprint)

Two supplied assets were folded in:

- **`philippines_highlights.csv`** → every matching point of interest gained a
  curated **Google Maps link** (used as the pin's "Open in Maps" target when
  present), an **official/booking URL** ("Book / info" action on the card), a
  one-line **review recommendation** (shown as a quote), and sharper prices.
  Two **food pins** that were missing — *Levine's Rooftop* (Coron) and *Bella
  Vita Pizza* (El Nido) — were added, so the map's `food` filter is now
  populated and both appear on their respective days.
- **Operational blueprint** → a new **Cash plan** module on the Money tab: four
  rules (draw fee-free at HSBC Cebu; decline DCC; expect card surcharges;
  islands run dry) plus a per-leg liquidity forecast with a risk badge, a
  recommended draw amount, and where to get it. A matching "Decline DCC" tip was
  added, and airport notes now flag AirSWIFT's 7 kg hand-luggage limit.

**One blueprint recommendation was deliberately *not* adopted:** IndexedDB
raster-tile caching. The vector-coastline renderer already gives fully offline
maps with **no online provisioning step** and at a fraction of the storage of
cached tiles, so swapping in a heavier tile-caching scheme would be a regression
for this use case. Documented here so the choice is explicit.

## 5c. Skill-driven roast v2 (imported UI/UX skills)

Imported five well-recommended skills (see `.claude/skills/SOURCES.md`) and used
them as a review rubric: Anthropic's **frontend-design** and **webapp-testing**
and **web-artifacts-builder**, the community **ux-designer** (WCAG 2.2 AA
rubric), and the **frontend-design-toolkit** collection. What they flagged, and
what changed:

| Roast (skill) | Finding | Fix |
|---|---|---|
| **frontend-design** | Design sat in a known "AI-slop" bucket — near-black bg + one accent, with type as a neutral system-sans delivery vehicle (no personality). | Added a **serif display face** (`--display`, system serifs only so it stays offline) on headlines, day titles, section headers and place names — an editorial travel-journal voice that grounds the design in its subject. |
| **ux-designer / a11y** | **No visible keyboard focus** anywhere (WCAG 2.4.7). | Global `:focus-visible` ring; a dedicated focus style for SVG map pins. |
| **ux-designer / a11y** | Clickable **cards, hub chips, mini-pins, checklist rows and map pins weren't keyboard-operable** (WCAG 2.1.1). | `role`/`tabindex` + a delegated Enter/Space handler; pins made focusable with `aria-label` and their own key handler; checklist rows are `role="checkbox"` with live `aria-checked`. |
| **ux-designer / contrast** | Measured contrast: `--dim` muted text and the coral/violet chip labels were **below 4.5:1** on cards. | Lightened `--dim` and added AA-verified text tints (`--teal-t`/`--coral-t`/`--violet-t`); re-checked every pair with a contrast script. |
| **ux-designer / motion** | Route-draw animation and card transitions ignored **`prefers-reduced-motion`**. | Global reduced-motion media query neutralises animation/transition. |
| **ux-designer / touch** | Several targets under the **44px** minimum (zoom buttons, filter/mode/quick chips). | Bumped to ≥44px (zoom) / ≥40px (chip rows); only the non-actionable countdown readout remains smaller by design. |
| **ux-designer / type** | Body text at 12–13px, below the **16px** readability floor. | Base to 16px; day/tip/popup/cash body text bumped to 13.5–15px. |
| **webapp-testing** | — | Confirmed the practice already in use: every change is verified by driving the app in headless Chromium at 390×844 and screenshotting; this pass added keyboard-path and touch-target assertions. |

Verified after v2: 0 console/page errors; Tab reaches cards with a visible ring;
Enter toggles the checklist (`aria-checked` flips) and opens a focused pin's
card; contrast script passes; only one sub-40px element remains (an
informational readout, not a touch action).

## 5d. From planner to trip hub (one-knife pass)

Turned the app into the single hub the traveller reaches for — replacing the
scatter of Google Maps, notes/mail, Apple Calendar, a calculator, Translate,
and self-sent links — **without adding tab sprawl**. The nav stays five tabs;
the old "Tips" tab became **Kit**, a single accordion drawer.

| Real-world tool it replaces | In-app |
|---|---|
| Google Maps / Google knowledge | Map + place cards, with an Open-in-Maps handoff for live nav |
| Notes / mail (tickets, deck lists) | **Saved & tickets** vault (links, notes, ticket refs) + **Packing lists** |
| Apple Calendar (itinerary + reminders) | **Add to Calendar** — generates a real `.ics` of all 22 days; Today's "now / next" |
| Calculator (ILS↔USD↔PHP) | Money tab (converter + tip + cash plan) |
| Google Translate | offline **Phrasebook** (Tagalog) + a Translate handoff link |
| Sending yourself links | **＋ Save** on any place, or quick-add note/link |
| "Gamify it, push me, take photos" | **Quests**: 17 photo/do/culture/rest goals, points, adventure-score bar, celebratory toast |
| "Goals + when to rest / do hobbies" | Per-day **nudge** on Today, keyed to the day's character (highlight → go for it; rest → recharge; expedition → phone away) |

Design discipline (frontend-design + ux-designer): one accent per component,
quests grouped by hub, an accordion so the drawer is scannable not a wall, and
new state (quests, packing, saved, open-section) all persisted in localStorage
and working fully offline. The gamification stays honest — the Quests lead reads
"points for the memories, not the metrics."

## 5e. Competitive research → adopted patterns

Researched award-winning / widely-praised apps sharing our features and adopted
the highest-value, least-sloppy ideas (full reasoning in the chat log):

| Source app (why praised) | Pattern | Decision |
|---|---|---|
| **Polarsteps** — most-loved travel tracker | The trip becomes a **visual timeline you fill with photos + notes as you go** | **Adopted** — Trip journal |
| **Journo / Travel Diaries** — top journal apps | **Capture a photo + line on the spot**, dated automatically | **Adopted** — inline photo capture (device camera) |
| **SubQuester / Stamp'd** — gamified passports | Rewards as **collectible passport stamps**, not a bare number | **Adopted** — passport stamp grid |
| **Atlas Obscura** — "Been There" tracking | A record of what you've done | **Adapted** — the journal is our been-there |
| **Duolingo** (critique literature) | Streaks/leaderboards drift into **dark patterns** (guilt, shame) | **Guardrail** — no streaks, no leaderboards, copy stays shame-free ("skip any that aren't you") |
| Polarsteps live GPS + social sharing | Auto-track + broadcast | **Skipped** — needs a server, account, battery; breaks offline/private ethos |
| Rome2Rio / AI itinerary generators | Multimodal search / auto-plans | **Skipped** — transport is fixed; a hand-crafted plan is the anti-slop point |

**Implementation.** Photos are captured with the device camera (`<input capture>`),
**downscaled client-side** to ~900px JPEG and stored in **IndexedDB** (blobs kept
out of localStorage's ~5 MB cap); memory metadata (title, note, date, quest link)
lives in localStorage. A completed quest can mint a **stamp** and a **journal
entry** in one tap of 📸. Everything stays on-device and works offline — no
account, no upload, matching the app's ethos while delivering the single
most-praised mechanic we were missing (the fill-as-you-go trip diary).

## 5f. Visual redesign — "Expedition log / nautical chart"

User feedback: the UI looked cheap. Re-ran the `frontend-design` skill and
diagnosed it honestly — it was sitting in AI-slop cluster #2 (near-black + one
accent + stacked outlined cards), with **emoji as UI chrome** the biggest cheap
tell, plus murky low-contrast surfaces and one monotonous rhythm.

Committed to a single deliberate direction grounded in the subject (a 20-night
sea passage), and rebuilt the visual system:

- **Palette** redefined at the token level (so it cascades everywhere): deep
  ocean ink with real value separation, warm **brass/sand** for earned things,
  one **lagoon-aqua** primary + **sunset-coral** accent. All text re-verified
  ≥4.5:1 with the contrast script.
- **Signature texture**: a faint nautical-chart **graticule** across the app and
  **bathymetric depth rings** behind the hero headline — unmistakably sea/chart.
- **Icon system**: a consistent inline-SVG **line-icon set** (a hidden `<symbol>`
  sprite) replaces emoji in the nav, section headers, quests, quick-actions,
  Kit headers, Money headers, and the alert callout. Scoped as `svg.ic` so it
  never collides with the few emoji kept as *expressive content* (nudges/tips).
- **Surfaces**: glass "chart plates" — layered gradient + soft shadow + hairline
  top-light — instead of hard 1px outlines. Varied rhythm; the brass score plate
  reads distinct from the cool cards.
- **Type**: bigger, more confident serif display; a **mono** voice for
  coordinates/dates/data (the chart register).
- **Details**: hub-colored dots on the leg pills and quest groups (no emoji), a
  ghost capture button so photo quests no longer show a confusing twin camera,
  an active-tab indicator bar.

Kept the whole quality floor intact (keyboard focus, reduced-motion, ≥44px,
offline). Verified across every tab in headless Chromium: 0 errors, photo
capture + stamps still work, still boots offline.

## 5g. Map redesign + full emoji sweep (with UI/UX Pro Max)

Installed four more skills at the user's request — **ui-ux-pro-max** and its
**design** companion (`nextlevelbuilder/ui-ux-pro-max-skill`), plus the
**superpowers** brainstorming + writing-plans "planner" skills
(`obra/superpowers-skills`); provenance in `.claude/skills/SOURCES.md`. UI/UX
Pro Max's priority rules (esp. #4 "SVG icons — no emoji") drove this pass:

- **Map carried into the chart system**: deep-ocean palette matching the app,
  a nautical-chart graticule over the sea, warm-brass route lines, category pin
  colors on the new palette, glass mode/filter chips and a gradient popup with a
  proper Save chip and mono price.
- **Full emoji sweep**: every remaining emoji-as-icon became an SVG from the
  sprite — the per-day nudge, all 11 tip cards, the Journey chip, the cash-plan
  draw line, the Tao callout, the hero location pin. Removed the giant emoji
  hero watermark (the bathymetric rings already carry that texture). Emoji now
  survive only as genuinely-expressive content (toasts, packing/phrase group
  labels).

Verified across every tab in headless Chromium (incl. a faked mid-trip date to
exercise the nudge): 0 errors, photo capture + stamps intact, boots offline.

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
