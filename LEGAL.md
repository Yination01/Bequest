# Bequest — originality and IP notes

## What is original
- **All code** is written for this project. No engine, framework, library or
  snippet is copied from another game.
- **All text** — 168 events, every activity, achievement, epitaph and item
  description — is written for this project.
- **The logo** is generated programmatically (a circle on a rounded square) and
  the wordmark is set in DejaVu Sans (free, permissively licensed).
- **The avatars** are procedural SVG drawn by our own code. No sprite sheets,
  no purchased art, no AI-generated imagery ships in the build.
- **Fonts**: the app uses the device's own system font stack. Nothing is
  downloaded or embedded, so no font licence applies.
- **No external requests.** The build is fully self-contained, so no third-party
  asset is ever fetched at runtime.

## Deliberately renamed to avoid competitor trade dress
Game *mechanics* are not protectable, but product names and distinctive terms
are. These were changed:

| Was | Now | Why |
|---|---|---|
| Ribbons | **Epitaphs** | "Ribbons" is BitLife's established term for its end-of-life awards |
| LifePoints | **Legacy Points** | Too close to ReLife's "RePoints" |
| Life+ | **Bequest Plus** | Generic plus-suffix, but made distinct |
| God Mode | **Fate Control** | "God Mode" is a named BitLife purchase |
| Time Machine | **Rewind** | "Time Machine" is a named BitLife purchase, and an Apple product |
| Superstar (job) | **Sporting Icon** | BitLife sells "Superstar Mode" |
| Ten Comma Club | **Eight Figures** | Phrase popularised by the TV series *Silicon Valley* |

Competitor names have also been stripped from all shipping source comments.
They remain only in the internal design documents, where they are used
descriptively for research — which is normal comparative reference, not use
as a mark.

## Fine as-is
- **Real country names** are facts and are not protectable.
- **Generic job titles** (Nurse, Electrician, CEO) are descriptive terms.
- **Generic mechanics** — ageing one year per tap, stat bars, life events,
  career ladders — are ideas and systems, which copyright does not cover.
  Independent expression of a familiar genre is permitted.
- **Invented company, school and newspaper names** are generated from our own
  word lists and are not real businesses.

## ⚠ NAME CONFLICT CONFIRMED — action required

**There is already a game called "Lifespan - Life Simulator".**

| | |
|---|---|
| Name | **Lifespan - Life Simulator** |
| Developer | Stephen Robertson (solo developer) |
| Store | Apple App Store, Simulation category |
| Rating | **4.7 from 199 ratings**, actively updated, © 2026 |
| Tagline | *"One life. Endless choices."* |
| Positioning | Careers, businesses, stocks and crypto, marriage, children, legacy/wills — and reviewers compare it directly to BitLife |

This is not a distant trademark worry. It is an **active, well-reviewed competitor
with our exact name, in our exact genre, chasing our exact comparison point.**
Our own tagline — "One year at a time" — sits beside theirs almost interchangeably.

Two further collisions:

- **BEQUESTS** (bequests.app) — a browser-based AI life simulator.
- **LifeSpan Fitness** — an established fitness-equipment brand with apps on both
  stores, which will hold registered marks in at least some classes.

### Why this matters beyond law
1. **Discoverability.** Searching "Bequest life simulator" finds *them*. We would
   spend our marketing budget sending players to a competitor.
2. **Reviews and ratings get confused** between the two apps.
3. **"Bequest" is a common dictionary word**, so it is weak as a mark — we could not
   stop them, and with 199 ratings and prior use they have the stronger position.
4. **Store rejection risk** for a confusingly similar name in the same category.

### Recommendation
**Rename before any store submission.** The cost today is a find-and-replace across
the codebase and a new logo wordmark — roughly an hour. The cost after launch is
losing accumulated ratings, installs and any brand equity built.

The logo itself is unaffected: a single amber dot carries any name.

## Other outstanding risks
2. **Store listing copy and screenshots** must not reference competitors by
   name, and must not imitate their icon or screenshot layout.
3. If any real brand is ever added (a car marque, a social platform), replace it
   with an invented equivalent.
