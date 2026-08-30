# Third-party assets

Everything here is **vendored into the repo** — the app must boot with no
network, so nothing is loaded from a CDN at runtime.

| Asset | Source | Licence | Where |
|---|---|---|---|
| **Lucide icons** (34 glyphs) | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) — lucide.dev | ISC | Inlined as an SVG `<symbol>` sprite at the top of `index.html` (~7 KB). Drawn on a 24px grid at stroke-width 2, which `--stroke` matches. |

## Considered and deliberately not used

- **canvas-confetti** (ISC, ~25 KB) — replaced by a purpose-built ~1.5 KB burst
  (`celebrate()` in `app.js`) in the Philippine flag colours. 25 KB is a large
  share of an offline app's payload for one flourish, and rolling our own let the
  celebration use the flag palette and respect `prefers-reduced-motion`.
- **FormKit AutoAnimate** (MIT, ~2.5 KB) — genuinely good, but it animates
  children entering/leaving a *persistent* parent. This app re-renders whole
  sections via `innerHTML`, so every child is replaced at once and AutoAnimate
  would have nothing to animate. Not worth restructuring rendering for.
- **unDraw / Storyset illustrations** — a different illustration language than
  the app's hero scene. Empty states are drawn in-house (`emptyArt()`) so the
  sun / island / water motif stays consistent, with no attribution burden.
- **flag-icons** (MIT) — the flag's 8-ray sun is already the app's mark and is
  more distinctive than a rectangular flag graphic.
