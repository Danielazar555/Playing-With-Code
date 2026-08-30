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

## 5h. UI/UX Pro Max design-system pass

Ran the vendored **ui-ux-pro-max** generator's real tool (fetched `search.py` +
its data corpus from upstream) against the app:
`search.py "travel trip planner offline field guide dark nautical" --design-system`.
Treated the output as a second opinion, not law (the skill says so itself).

**Validated / no change:** it independently recommended **"adventure orange +
map teal"** (amber accent + teal secondary) for a travel product — essentially
the **brass (#e6b45c) + lagoon-aqua (#2bb8c6)** pairing we already shipped. Good
confirmation the palette direction is right.

**Adopted (its pre-delivery checklist flagged two real gaps):**
- `cursor: pointer` on every clickable — added to all `role="button"`/`checkbox`
  elements and tappable divs (cards, chips, quest checks, points strip, kit
  headers), not just native buttons.
- **Hover states with 150–300ms transitions**, guarded behind `@media (hover:hover)`
  so touch is unaffected and `prefers-reduced-motion` still neutralises them:
  cards lift, chips/buttons brighten their edge, the score plate warms.

**Reasoned overrides (documented, not silently ignored):**
- **Typography "Inter / Inter"** — declined. Inter is the exact overused "safe"
  face that `frontend-design` and `artifact-design` both name as an AI-slop
  tell; our Fraunces/Palatino + Archivo + IBM Plex Mono is more distinctive and
  on-theme. Switching would regress the identity.
- **Style "Aurora UI" + "Scroll-Triggered Storytelling"** — declined. Mesh-gradient
  and landing-page-narrative tropes are the wrong genre for an offline field
  tool; the flat nautical-chart system is the deliberate, subject-grounded choice.

A **Palawan Field Manual** overview artifact was published beforehand as a
snapshot of the app at this point.

## 5i. App-grade refinement (Pro Max `pro-rules.md`)

Feedback: the UI still read as a hobby project rather than a shipped app. Pulled
the tool's `pro-rules.md` — its stated purpose is *"when the user reports the UI
'doesn't look professional'"* — and rebuilt the visual layer against it.

**Root cause: everything was a floating rounded card.** Five rounds of appended
patches had also left the stylesheet with competing rules (the cascade-collision
risk `frontend-design` warns about). `styles.css` was rewritten from scratch as
one tokenised system.

| Rule (pro-rules.md) | Was | Now |
|---|---|---|
| Grouped lists over card stacks | every item a bordered, shadowed, floating box | **`.kit-group` / `.list-group`** — one inset surface, hairline dividers between rows (the native Settings pattern). Kit, Today's quests, spots and Coming-up all group. |
| 4/8pt spacing rhythm | ad-hoc 11/13/15/17/22px | `--sp1…--sp8` tokens (4→40), used everywhere |
| Consistent icon sizing | mixed 17/18/20/21/22/23px | `--icon-sm:20` / `--icon-md:24` only |
| Stroke consistency | 1.6 and 1.7 mixed | single `--stroke:1.75` |
| Press states must not shift layout | `transform:scale(.985)` on tap | background-only `:active` — bounds never move |
| Elevation, not glow | heavy drop-shadow on every card | elevation via surface lightness (`--s1`/`--s2`); one `--lift` shadow reserved for genuinely floating UI (popup, toast) |
| One accent | aqua + brass + teal + coral + violet + sun all competing | **`--accent` = interactive**, **`--brass` = earned only**, semantic colours for status only |
| Filled/outline discipline | quest circle showed the category icon *and* a camera button beside it | quest circle is a plain tick control; category no longer duplicated |

Also: tab bar slimmed to 56pt with a proper translucent blur, hero is the only
serif moment, `.q-pts` colour now comes from the system (muted → brass when
earned) instead of an inline per-category colour, and toast copy dropped emoji
for plain product strings ("Quest complete · +25").

**Regression caught and fixed:** renaming the colour tokens broke 16 inline
`var(--…)` references in `app.js` (the selected tip-% state had gone invisible).
All remapped, and a check now asserts every token referenced in JS resolves.

Verified: 0 console errors, no horizontal overflow, keyboard toggles quests and
checklist rows, no touch target under 32px, still boots offline.

## 5j. Sunshine pass — Philippine flag colours & a living hero

Brief: make it alive, colourful and fun to watch, using the Philippine flag,
sunshine, water and island elements — *without* losing the app-grade structure
from §5i. So the grouped lists, 4/8pt rhythm, icon tokens and press rules all
stayed exactly as they were; the life comes from colour, one animated scene and
warmer words.

**Palette — the flag, verified for contrast.** Royal blue #0038A8 deepened into
the ground (`--bg #04182f`, surfaces #0a2547 / #123763), **flag sun #FCD116** as
the energy/earned colour, a tropical **lagoon #3fd9e4** as the single
interactive accent. Flag red #CE1126 measures only **3.17:1** on these grounds,
so it fills only — `--bad #ff7b6b` is the AA-safe text tint (7.05:1). All text
tokens re-verified: ink 16.9:1, ink-2 10.7:1, ink-3 7.5:1.

**A living hero.** An inline-SVG scene behind every hero: the **8-ray Philippine
sun** (slowly rotating), island silhouettes with palms on the horizon, and three
**drifting water bands** at different speeds. A scrim gradient sits between scene
and copy so text stays fully legible over the water. All motion is disabled
under `prefers-reduced-motion`.

**Colour where it helps navigation.** Kit rows got solid tropical **icon tiles**
(the iOS-Settings pattern) — sun, palm, lagoon, coral, plum, sky — so sections
are findable by colour, not just text. Leg colours, map pins and the map's route
line moved onto the same tropical set; the score bar is a sunrise gradient with a
warm glow.

**Words.** ~15 strings rewritten warmer and more specific — *"Sand day. Swim,
read, chase the light. Nowhere to be."*, *"No signal out here, and that's the
point. Phone away, eyes up."*

**Two real bugs found and fixed on the map:**
1. **Labels rendered backwards.** Measured per-glyph positions and found x
   *decreasing* across the string. Cause: `body{letter-spacing:-.01em}` (added in
   §5i) inherits as an **absolute −0.16px**, which exceeds the entire glyph
   advance at the map's ~0.18px SVG font size. Fixed with `letter-spacing:normal`
   on `.map-svg`, with a comment so it isn't reintroduced.
2. **Stacked labels.** The two Mactan hubs share coordinates, so their labels
   overlaid each other. They now merge into one — "1·6 Mactan". The label halo
   also dropped from 29% to 14% of font size.

## 5k. Vendored assets — icons, celebration, empty-state art

Researched icon sets, illustration sources and motion libraries for this class of
app. Hard constraint: the app must boot with **no network**, so anything adopted
has to be vendored, small and permissively licensed.

**Adopted — Lucide icons (ISC).** Replaced the 30 hand-drawn glyphs with 34
real Lucide icons, inlined as an SVG `<symbol>` sprite (~7 KB). Lucide is the set
the tool's own `pro-rules.md` names, and it fixes the optical inconsistency of a
hand-rolled family. `--stroke` moved to 2 to match Lucide's 24px grid. A build
check asserts every `#i-*` referenced in JS exists in the sprite.

**Built rather than imported:**
- **Celebration burst** — a ~1.5 KB `celebrate()` in the Philippine flag colours
  fires when a quest is newly completed. `canvas-confetti` (ISC) would have cost
  ~25 KB, a large share of an offline payload for one flourish; rolling our own
  also let it use the flag palette. Silent under `prefers-reduced-motion`, and
  the canvas removes itself when the animation ends (verified).
- **Empty-state scenes** — `emptyArt()` draws small sun/island/palm/water scenes
  for the empty journal, passport and saved vault, in the same visual language as
  the hero rather than importing a clashing illustration set.

**Rejected, with reasons** (full table in `app/CREDITS.md`): FormKit AutoAnimate
(animates children of a *persistent* parent; this app replaces whole sections via
`innerHTML`, so it would have nothing to animate), unDraw/Storyset (different
illustration language, attribution burden), flag-icons (the 8-ray sun is already
a stronger mark than a rectangular flag).

The service-worker cache was bumped to `ph-trip-v2` so existing installs pick up
the new sprite and palette.

## 5l. Borrowed elegance — what the comparison apps do well

Went back through the apps benchmarked in §1 and §5e and took the signature
elements worth having, keeping each one small:

| Borrowed from | Their element | Ours |
|---|---|---|
| **Polarsteps**, Atlas Obscura | "Where am I in this trip" at a glance | **Trip progress rail** under the top bar — one 3px bar, a segment per leg sized by its days and coloured by that leg, lit behind you and dimmed ahead, with a marker on today. Before departure it previews the journey's shape instead of reading as an empty bar. |
| **Polarsteps** | The trip's *numbers* — its most-loved screen | **Journey stats** on Plan: 1,114 km, 5 island bases, 20 nights, 37 places. The distance is real — a haversine sum along the actual hub sequence (`GEO_DIST`, reused from the map), not a hardcoded figure. |
| **Wanderlog**, Rome2Rio | The hop, not just the destination | **Leg distance** on travel days — "✈ ≈ 453 km" — computed between the hubs the day moves between. Verified against geography: Cebu→Coron 453, Coron→Tao 64, Tao→El Nido 63, El Nido→Moalboal 458, Moalboal→Mactan 77 (sums to the 1,114 total). |
| Modern app convention | Content that arrives rather than snapping in | **A 35 ms stagger** on tab change only — deliberately *not* on every state toggle, so completing a quest doesn't re-animate the list. Disabled under `prefers-reduced-motion`. |

Deliberately still not taken: Polarsteps' background GPS tracking and social feed
(needs a server, an account and battery — against the offline/private ethos), and
Duolingo-style streaks (the dark-pattern guardrail from §5e stands).

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
