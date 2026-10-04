# BEQUEST

A grounded, text-based life simulator. One year at a time.

Built as a playable prototype. The reference points were BitLife, AltLife and
ReLife; the design deliberately diverges from all three (see `research/COMPARISON.md`).

## Play it

- **`Bequest.html`** — the whole game in one self-contained file. No server,
  no network, no dependencies. Open it on any device.
- **Local server** — `cd pwa && python3 serve.py 8080`, then open
  `http://localhost:8080`. On Android Chrome, "Add to Home screen" installs it
  as a standalone offline app.

## What is in it

| | |
|---|---|
| Life events | **533**, age-gated 0–115, with text variants and dynamic names |
| Direction-changing forks | **133** (struck off, deported, bankrupt, custody, retraining) |
| Countries | **32**, each with its own wages, costs, healthcare, crime and life expectancy |
| Careers | **73** across 13 fields, with an experience ladder and record checks |
| Skills / habits / traits | 12 / 10 / 22 |
| Shop items | 59, including a black market and investable assets |
| Achievements | 79 across 12 categories, plus 15 challenges and 10 lifetime records |
| Epitaphs | 30 |
| Easter eggs | **15** across three rarity tiers |
| Difficulties | 5 (Easy → Brutal, plus a 12-slider Custom) |
| Pets | 9 species that age, bond, sicken and die |
| Orientations | 5, set at birth, discoverable and changeable |
| Automated tests | **376** |

**Twelve systems that interlock:** health with 15 real conditions, education with
grades and university tiers, careers with performance reviews, money with a credit
score and lending bands, relationships where every NPC lives their own parallel
life, crime with convictions that bar professions, plus business, property,
investments, fame, world news and generational legacy.

## Repository

    Bequest.html        the standalone build — this is the game
    pwa/                    source
      data.js               countries, jobs, items, crimes, news, traits, epitaphs
      events.js             all 533 life events
      systems.js            health, money, career, relationships, legal, education
      difficulty.js         the five presets and twelve knobs
      easter.js             the egg registry
      avatar.js             procedural SVG portraits that age
      achievements.js       achievements, challenges, records
      game.js               engine and interface
      build.py              inlines everything into index.html
      serve.py              threaded dev server with a cloud-sync endpoint
      tests/suite.js        the regression suite
    BUILD-APK.md            how to produce the Android build
    capacitor.config.json   native wrapper configuration
    .github/workflows/      CI that tests, audits, then builds the APK
    research/
      compare.js            the four-engine comparative study
      COMPARISON.md         its findings
      audit.js              impossible-state hunter
      steer.js              the scripted player the tools and one test share
      pacing.js             sheets per year, measured
      obituary.js           the death screen's variety, measured
    PLAN.md GDD.md MECHANICS.md DECISIONS.md CONTENT.md LEGAL.md

## Working on it

    cd pwa
    node tests/suite.js          # 376 tests, exits non-zero on failure
    node tests/suite.js --life   # prints an annotated sample life
    python3 build.py             # rebuild index.html after editing any source
    node ../research/audit.js    # hunt for impossible game states
    node ../research/pacing.js   # sheets per year, measured (~35s)
    node ../research/obituary.js # death screen variety, measured (~2.5 min)

`data.js`, `events.js` and `easter.js` are pure data. Adding content needs no
engine changes.

## Decisions already locked

- Grounded realistic tone, global setting, USD, birth-to-death, one year per turn
- **No content is ever paywalled.** Bequest Plus ($2.99/mo, $14.99/yr,
  $29.99 lifetime) sells convenience only, and a test enforces this
- Cloud saves via Firebase, anonymous by default, free for everyone
- Renamed from "Lifespan" — that name is taken by an active competitor (`LEGAL.md`)

## Not done yet

- **The APK itself.** Everything needed to build it is now in place — see `BUILD-APK.md`,
  `capacitor.config.json`, `package.json` and `.github/workflows/android.yml`.
  Run `npm install && npx cap add android && npm run apk:debug`, or push and let CI do it.
- Firebase integration (the prototype syncs to a local endpoint)
- Store billing plumbing (the purchase flow is simulated)
- Agency scores 53% against ReLife's modelled 55%, the one measurable deficit and
  far closer than the 41% once quoted here
