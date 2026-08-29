# 🏝️ Philippines Trip Companion

An offline-first web app for a 20-night Philippines trip —
**Cebu → Coron → Tao expedition → El Nido → Moalboal → home** (Feb–Mar 2027).

Schedule · interactive island map · currency/tip/budget calculators · offline
tips & booking checklist. **No build step, no dependencies, works with no signal.**

![tabs: Today · Plan · Map · Money · Tips](DESIGN.md)

## Run it

It's a static site — serve the `app/` folder over HTTP (a service worker needs
`http://`, not `file://`):

```bash
cd app
python3 -m http.server 8099
# open http://localhost:8099/
```

Then **Add to Home Screen** on your phone for a full-screen, installable app.
After the first load it works entirely offline — essential for the no-wifi Tao
expedition and patchy Palawan data.

## What's inside

- **Today** — countdown before you fly, then a date-aware "what's today / what's
  next" once the trip starts.
- **Plan** — the hub strip + a full day-by-day timeline; tap any day to see it
  on the map.
- **Map** — real island coastlines (no tiles, fully offline) with the journey
  route, colour-coded filterable pins, and a place card on every pin.
- **Money** — currency converter (PHP/USD/ILS, editable rates), tip & split,
  and a live per-person budget.
- **Tips** — persistent booking checklist + offline "know before you go" cards.

## Make it your trip

Everything is data-driven — edit **`data/trip.js`** (hubs, days, points of
interest, tips, budget) and every screen updates. See **`DESIGN.md`** for the
research, spec, design rationale, and the QA review.

## Notes

- Prices and fees are 2026 research estimates — confirm when you book.
- Coastline geometry: Natural Earth (public domain), simplified.
- State (checklist, FX rates) is stored locally in your browser only.
