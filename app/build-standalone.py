#!/usr/bin/env python3
"""
Bundle the app into ONE self-contained .html file.

Why: the app normally needs a static server (separate .css/.js files + a service
worker). Inlining everything produces a file you can double-click and open
straight from disk (file://) — no server, no install, no network — and the same
bundle can be published as a hosted page.

Outputs (into dist/):
  philippines-trip.html   full document, for opening locally
  artifact-body.html      same page without <!doctype>/<html>/<head>/<body>,
                          for hosts that supply their own document skeleton

Run:  python3 build-standalone.py
"""
import pathlib, re, sys, datetime

HERE = pathlib.Path(__file__).parent
DIST = HERE / "dist"
DIST.mkdir(exist_ok=True)

def read(p):
    f = HERE / p
    if not f.exists():
        sys.exit(f"missing: {p}")
    return f.read_text(encoding="utf-8")

html   = read("index.html")
css    = read("styles.css")
scripts = ["data/coast.js", "data/trip.js", "map.js", "app.js"]

# --- the <svg> icon sprite + the #app markup, lifted straight from index.html ---
body_start = html.index("<!-- Icons: Lucide")
body_end   = html.index("<script src=")
body = html[body_start:body_end].strip()

# strip the closing </div> of #app? no — body already contains the full #app block.
banner = (f"<!-- Palawan trip companion — self-contained build "
          f"({datetime.date.today().isoformat()}).\n"
          f"     Everything is inlined: no server, no network, no dependencies.\n"
          f"     Open this file directly in a browser. -->")

js = []
for s in scripts:
    js.append(f"/* ==== {s} ==== */\n" + read(s))

# On file:// there is no service worker and IndexedDB may be unavailable; both
# are optional here, so the bundle simply skips SW registration and lets the
# app's existing try/catch handle storage.
runtime_note = """
/* ==== standalone runtime ====
   No service worker in a single-file build (it needs an http origin).
   The app already guards localStorage/IndexedDB, so photo storage degrades
   gracefully to notes-only when a browser blocks storage on file:// URLs. */
(function () {
  try {
    var probe = "__t";
    localStorage.setItem(probe, "1"); localStorage.removeItem(probe);
  } catch (e) {
    document.documentElement.setAttribute("data-nostore", "1");
  }
})();
"""

scripts_block = "<script>\n" + runtime_note + "\n" + "\n\n".join(js) + "\n</script>"

title = "Palawan — trip companion"
icon = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' "
        "viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🧭%3C/text%3E%3C/svg%3E")

full = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#04182f">
<title>{title}</title>
<link rel="icon" href="{icon}">
{banner}
<style>
{css}
</style>
</head>
<body>
{body}
{scripts_block}
</body>
</html>
"""

# Host-supplied-skeleton variant: title + style + content, no document wrapper.
artifact = f"""<title>{title}</title>
<style>
{css}
</style>
{body}
{scripts_block}
"""

(DIST / "philippines-trip.html").write_text(full, encoding="utf-8")
(DIST / "artifact-body.html").write_text(artifact, encoding="utf-8")

kb = lambda s: f"{len(s)/1024:.0f} KB"
print(f"dist/philippines-trip.html  {kb(full)}")
print(f"dist/artifact-body.html     {kb(artifact)}")
