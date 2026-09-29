# Bequest — what I would do next, in priority order

Written after the final audit. Items marked **measured** come from test or audit
output, not impression. Items marked *opinion* are my judgement and you may
disagree — they are the ones worth arguing about.

Current state: 324 events, 179 tests, 14 modules, 507 KB, no known integrity
problems, a life simulates in 37 ms.

---

## P0 — Before anyone else plays it

Things that actively mislead or block a player.

| # | Item | Why | Effort |
|---|---|---|---|
| 1 | **Onboarding beyond one card** | A new player lands on six tabs, hubs, actions, bills and paths with a single how-to card at age 0. The systems are now deep enough that the first five minutes decide whether anyone continues. *opinion, but strongly held* | M |
| 2 | **14 events never fire** — **measured** | Gated on owning a phone, car or crypto. Reachable in principle; invisible to most players. Either lower the gates or nudge players toward the items. | S |
| 3 | **37 of 73 jobs rarely reached** — **measured** | The trades and hospitality ladders in particular. The experience ladder gates them too tightly, so two thirds of the career content is dead for most lives. | M |
| 4 | **Life tab is crowded again** | School card, path card, bills warning, move-out nudge, family strip, news, story. Exactly the clutter you flagged, creeping back. Needs a rule about how many cards may show at once. *opinion* | S |
| 5 | **Hard and Brutal put 100% of lives into arrears** — **measured** | Correct in spirit, but when *every* run ends the same way it stops being a difficulty and becomes a scripted outcome. | M |

## P1 — The core experience

The things that would most improve a session.

| # | Item | Why | Effort |
|---|---|---|---|
| 6 | **Sound and haptics** | Every tap is silent. A year turning, a promotion, a death — none of them land. This is the single biggest "feels like a real app" gap. *opinion* | M |
| 7 | **Close the agency gap: 41% vs ReLife's 55%** — **measured** | More branching forks that change a life's direction rather than its statistics. This is the one metric where we still lose. | L |
| 8 | **A proper death and legacy screen** | The current one is a stat dump. It should read like an obituary — the shape of the life, the people left behind, what was inherited. It is the emotional payoff of the whole game. *opinion* | M |
| 9 | **Year-summary pacing** | Popups still arrive in a queue: birthday, notices, two events, an achievement. Consider one scrollable "this year" sheet instead of four dismissals. *opinion* | M |
| 10 | **Notifications** | "Your character is waiting" brings people back. Needs the native layer, so it belongs after the APK. | S |

## P2 — Depth and content

| # | Item | Why | Effort |
|---|---|---|---|
| 11 | **324 → 500 events** | At ~100 events a life, a committed player exhausts the library in five or six runs. Content is the genre's fuel. | L |
| 12 | **School subjects** | Education is one grade number. Subjects that feed degrees and careers would make ages 11–18 matter as much as adulthood. | M |
| 13 | **Investments beyond crypto** | Shares, funds, bonds, gold — a real portfolio with risk profiles. ReLife's players rate this highly. | M |
| 14 | **Court and legal process** | Arrests jump straight to a sentence. A plea, a lawyer, a trial and an appeal would make crime a system rather than a dice roll. | M |
| 15 | **Health depth** | Specialists, surgery, waiting lists, rehabilitation, and country-by-country healthcare differences that already exist in the data but barely surface. | M |
| 16 | **Group and family events** | Everything is one-to-one. Christmases, funerals, weddings, family arguments with three people in them. | M |

## P3 — Launch readiness

Required before it goes on a store, in rough order.

| # | Item | Why |
|---|---|---|
| 17 | **A stable signing key** | Without it no build can upgrade another. Five minutes of work, documented in `BUILD-APK.md`. |
| 18 | **Google Play Billing** | The purchase flow is simulated. The Plus gates already exist and are enforced by a test. |
| 19 | **Firebase cloud saves** | Decided, not built. The prototype syncs to a sandbox server that will not exist. |
| 20 | **Privacy policy and data declaration** | Play requires both. We collect nothing, which makes this easy and worth saying loudly. |
| 21 | **Content rating** | Crime, alcohol, drugs, gambling. Expect 16+. Declare honestly. |
| 22 | **Store listing** | Screenshots, description, and a name search against the registers one final time. |
| 23 | **Crash reporting** | Currently blind to anything that happens on a real device. |

## P4 — Later

| # | Item | Why |
|---|---|---|
| 24 | **Localisation** | Your market is global and the game is 100% English text. Also the single biggest translation bill in the project — worth planning before the library reaches 500 events. |
| 25 | **Leaderboards** | ReLife has them; they extend a game's life considerably. Needs accounts. |
| 26 | **An avatar that shows more** | Clothing by wealth, visible ageing beyond the face, conditions. The renderer supports it. |
| 27 | **Accessibility pass** | Screen-reader labels, contrast checks, larger tap targets. Text sizing is done. |
| 28 | **iOS** | The build is a WebView; the same bundle would run. Only worth it once Android is proven. |

---

## What I would actually do, given a free hand

**First:** P0 items 2, 3 and 4 in one pass — they are small, measured, and each
one unlocks content that already exists but nobody sees. Roughly a day.

**Then:** onboarding (1) and sound (6). These two do more for whether a stranger
keeps playing than anything else on this list, and neither is technically hard.

**Then:** the death screen (8), because it is the moment the game is *about* and
it currently reads like a spreadsheet.

**Only then** content volume (11) — it is the largest single job here and it is
wasted if the first five minutes lose people anyway.

I would hold the APK until items 2, 3 and 4 are done, because those are the
things you would notice within one life of playing the build.
