# AGENTS.md

Project law is `CLAUDE.md`. Read it first. This file is the map and the
commands.

## Commands

    cd pwa && node tests/suite.js     the whole suite, one command
    python3 pwa/build.py              writes pwa/index.html AND assembles dist/
    npm run serve                     static server on 8080
    node research/compare.js          the competitor table and the agency score

After `build.py`, regenerate the two mirrors in the same pass:

    python3 - <<'PY'
    import pathlib
    src = pathlib.Path('pwa/index.html').read_text()
    s = src.replace('<link rel="manifest" href="manifest.webmanifest">\n','') \
           .replace('<link rel="apple-touch-icon" href="icons/icon-180.png">\n','')
    pathlib.Path('Bequest.html').write_text(s)
    pathlib.Path('pwa/Bequest.html').write_text(s)
    PY

## What ships

`capacitor.config.json` copies `webDir` wholesale into the APK, and `webDir`
is **`dist/`**, assembled by `build.py`: `index.html`, `manifest.webmanifest`,
`sw.js` and `icons/`. Seven files, about 810 KB.

It used to be `pwa/`, which shipped the admin console at `/admin/`, 788 KB of
module source already inlined into `index.html`, and the build scripts. Never
point `webDir` back at a source folder. A test enforces it.

## Where things live

| path | what |
|---|---|
| `pwa/game.js` | the engine: state, year tick, popups, tabs, actions |
| `pwa/data.js` | countries, jobs, crimes, items, names, news |
| `pwa/events.js` | every life event |
| `pwa/systems.js` | conditions, traits, personalities |
| `pwa/school.js` | subjects, options at 14, degrees they open |
| `pwa/court.js` | arrest, plea, counsel, verdict, appeal |
| `pwa/invest.js` | six asset classes and the market cycle |
| `pwa/health.js` | public, mixed and private healthcare |
| `pwa/will.js` | wills, heirs, probate, heirlooms |
| `pwa/eulogy.js` | the obituary generated at death |
| `pwa/crash.js` | error capture, on device, no transport |
| `pwa/coach.js` | first-life tips |
| `pwa/sound.js` | synthesised cues and haptics |
| `pwa/tests/suite.js` | all tests, and the module FILES list |
| `research/` | competitor models, audits, SIBLING-AUDIT.md |

## Registering a new module

Five places, or it fails silently in one tool:

1. `pwa/build.py` (read it, and add it to the template)
2. `pwa/tests/suite.js` `FILES`
3. `research/audit.js`
4. `research/compare.js`
5. `research/final-audit.js`

## Before claiming anything is done

Three consecutive clean suite runs. Rebuild all three HTML artifacts.
Say what was not verified.
