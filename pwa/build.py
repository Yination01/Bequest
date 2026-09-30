#!/usr/bin/env python3
"""Inline all sources into a single self-contained index.html.
The workspace preview runs in a sandboxed iframe with no network, so external
<script>/<link> files will not load. Everything must be inline."""
import base64, pathlib

d = pathlib.Path(__file__).parent
css   = (d/'style.css').read_text()
data  = (d/'data.js').read_text()
events= (d/'events.js').read_text()
ach   = (d/'achievements.js').read_text()
diff  = (d/'difficulty.js').read_text()
sysm  = (d/'systems.js').read_text()
care  = (d/'careers.js').read_text()
econ  = (d/'economy.js').read_text()
asst  = (d/'assets.js').read_text()
soc   = (d/'social.js').read_text()
shp   = (d/'shop.js').read_text()
mkt   = (d/'market.js').read_text()
avat  = (d/'avatar.js').read_text()
egg   = (d/'easter.js').read_text()
coach = (d/'coach.js').read_text()
sound = (d/'sound.js').read_text()
eulogy= (d/'eulogy.js').read_text()
will  = (d/'will.js').read_text()
school= (d/'school.js').read_text()
court = (d/'court.js').read_text()
invest= (d/'invest.js').read_text()
health= (d/'health.js').read_text()
crash = (d/'crash.js').read_text()
adminl= (d/'adminlink.js').read_text()
a11y  = (d/'a11y.js').read_text()
i18n  = (d/'i18n.js').read_text()
game  = (d/'game.js').read_text()
# Derive the inline icon from the committed PNG so the build has no hidden
# dependency on a generated file. Falls back to the cache if it exists.
def _icon_data_uri():
    cache = d / '.icon-b64.txt'
    if cache.exists():
        return 'data:image/png;base64,' + cache.read_text().strip()
    png = d / 'icons' / 'icon-192.png'
    return 'data:image/png;base64,' + base64.b64encode(png.read_bytes()).decode()

icon  = _icon_data_uri()

game = game.replace('src="ICON"', 'src="%s"' % icon)

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1">
<title>Bequest</title>
<meta name="theme-color" content="#0b1020">
<meta name="description" content="Bequest — a grounded life simulator. One year at a time.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="icon" href="{icon}">
<style>
{css}
</style>
</head>
<body>
<div id="app" data-screen="title" data-tab="life">
  <div id="screen-title"></div>
  <div id="screen-create"></div>
  <div id="game">
    <div id="hdr"></div>
    <div id="main" role="tabpanel" aria-labelledby="tab-life" tabindex="-1"></div>
    <div id="agewrap"><button id="ageBtn" aria-describedby="ageHint">AGE UP</button><span id="ageHint" class="sronly"></span></div>
    <nav class="nav" role="tablist" aria-label="Sections">
      <button data-t="life" role="tab" id="tab-life" aria-controls="main" aria-selected="true" tabindex="0" class="on" onclick="setTab('life')"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7-4.7-9.2-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.2 12C19 16.3 12 21 12 21z"/></svg>Life</button>
      <button data-t="act" role="tab" id="tab-act" aria-controls="main" aria-selected="false" tabindex="-1"  onclick="setTab('act')"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>Do</button>
      <button data-t="ppl" role="tab" id="tab-ppl" aria-controls="main" aria-selected="false" tabindex="-1"  onclick="setTab('ppl')"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0z"/><circle cx="17.5" cy="9.5" r="2.6"/></svg>People</button>
      <button data-t="money" role="tab" id="tab-money" aria-controls="main" aria-selected="false" tabindex="-1" onclick="setTab('money')"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><circle cx="12" cy="12" r="3"/></svg>Money</button>
      <button data-t="more" role="tab" id="tab-more" aria-controls="main" aria-selected="false" tabindex="-1" onclick="setTab('more')"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>More</button>
    </nav>
  </div>
  <div id="modal" class="modal" role="dialog" aria-modal="true" aria-label="Message"></div>
  <div id="live" class="sronly" role="status" aria-live="polite" aria-atomic="false"></div>
</div>
<script>
{data}
</script>
<script>
{events}
</script>
<script>
{diff}
</script>
<script>
{sysm}
</script>
<script>
{care}
</script>
<script>
{econ}
</script>
<script>
{asst}
</script>
<script>
{soc}
</script>
<script>
{shp}
</script>
<script>
{mkt}
</script>
<script>
{avat}
</script>
<script>
{egg}
</script>
<script>
{ach}
</script>
<script>
{sound}
</script>
<script>
{eulogy}
{will}
{school}
{court}
{invest}
{health}
{crash}
{adminl}
{a11y}
{i18n}
</script>
<script>
{coach}
</script>
<script>
{game}
</script>
</body>
</html>
"""
(d/'index.html').write_text(html)
print('built index.html  %.1f KB' % (len(html)/1024))

# ---------------------------------------------------------------------------
# dist/ is what actually ships.
#
# capacitor.config.json used to point webDir at pwa/, which copies the WHOLE
# folder into the APK: the admin console at /admin/, 788 KB of module source
# that is already inlined into index.html, and the build scripts themselves.
# A passphrase on a page that is sitting inside the app the attacker already
# unpacked is not a boundary.
#
# The app needs four things. This assembles exactly those and nothing else.
# ---------------------------------------------------------------------------
import shutil
root = d.parent
dist = root / 'dist'
if dist.exists():
    shutil.rmtree(dist)
dist.mkdir(parents=True)
(dist/'index.html').write_text(html)
for name in ('manifest.webmanifest', 'sw.js'):
    src = d / name
    if src.exists():
        shutil.copy2(src, dist / name)
if (d/'icons').is_dir():
    shutil.copytree(d/'icons', dist/'icons')

shipped = sorted(q.relative_to(dist).as_posix() for q in dist.rglob('*') if q.is_file())
total = sum(q.stat().st_size for q in dist.rglob('*') if q.is_file())
print('built dist/       %.1f KB across %d files' % (total/1024, len(shipped)))
for q in shipped:
    print('   ' + q)
