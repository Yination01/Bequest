# Bequest — what I would do next, in priority order

Written after the final audit. Items marked **measured** come from test or audit
output, not impression. Items marked *opinion* are my judgement and you may
disagree — they are the ones worth arguing about.

Current state: 326 events, 225 tests, 17 modules, 547 KB, no known integrity
problems, a life simulates in 37 ms.

**P0 is clear**, and two P1 items with it. All are covered by tests.

---

## P0 — Before anyone else plays it ✅

Things that actively mislead or block a player.

| # | Item | Why | Effort |
|---|---|---|---|
| 1 | ~~**Onboarding beyond one card**~~ — **done** | A new player lands on six tabs, hubs, actions, bills and paths with a single how-to card at age 0. The systems are now deep enough that the first five minutes decide whether anyone continues. *opinion, but strongly held* | M |
| 2 | ~~**14 events never fire**~~ — **done** | Gated on owning a phone, car or crypto. Reachable in principle; invisible to most players. Either lower the gates or nudge players toward the items. | S |
| 3 | ~~**37 of 73 jobs rarely reached**~~ — **done** | The trades and hospitality ladders in particular. The experience ladder gates them too tightly, so two thirds of the career content is dead for most lives. | M |
| 4 | ~~**Life tab is crowded again**~~ — **done** | School card, path card, bills warning, move-out nudge, family strip, news, story. Exactly the clutter you flagged, creeping back. Needs a rule about how many cards may show at once. *opinion* | S |
| 5 | ~~**Hard and Brutal put 100% of lives into arrears**~~ — **done** | Correct in spirit, but when *every* run ends the same way it stops being a difficulty and becomes a scripted outcome. | M |

### What items 1 and 5 turned into

**Onboarding (1).** A three-pane opening that explains the loop before the
first year, then one tip at the moment each system first matters — actions at
5, stats at 9, school at 11, people at 13, work at 16, bills at 18, paths when
you join one. One tip on screen at a time, in its own slot so it does not
compete with the three optional cards. Tips are stored per install, not per
life, so a second life is not taught again, and a tip whose moment has passed
retires unread rather than surfacing late. The whole thing replays from
More › Stats › How to play.

**Arrears (5).** The measured claim was right but the diagnosis was
incomplete. A player who paid every bill they could afford *still* ended in
arrears 74% of the time on Hard, so this was never only about the robot not
clicking the button. Three things were wrong and all three are fixed:

- *No grace.* An unpaid bill became a debt at the next year-turn. It now
  becomes a **final notice** — a late fee, a small credit hit and a loud
  warning — and only becomes arrears if it is still unpaid a year later.
- *No way out.* Arrears compounded at 8% a year forever. Interest now runs
  only on a debt you paid **nothing** towards; you can agree a **repayment
  plan** that freezes it; and a debt nobody can collect is written off at
  enforcement — rock bottom and ruined credit, but not a life sentence.
- *No lever.* "You pay your own bills" was a difficulty setting that hid the
  only control. A **direct debit** can now be arranged on any difficulty. On
  Hard and Brutal it is off by default, must be set up deliberately, and
  *bounces* if the account is short on the day. The skill being tested is
  keeping a balance, not remembering to tap a button every year. It is
  offered once, in-game, the first time a bill falls due.

Measured over 200 lives per cell, before → after:

| Player | Difficulty | Ended in arrears | Average peak debt |
|---|---|---|---|
| Never opens the Money tab | Hard | 99% → **50%** | $777,710 → **$17,850** |
| Never opens the Money tab | Brutal | 96% → **59%** | $551,449 → **$16,550** |
| Pays what they can afford | Hard | 74% → **10%** | $129,457 → **$4,411** |
| Pays what they can afford | Brutal | 77% → **22%** | $130,436 → **$6,072** |

Recovery went from essentially impossible to ordinary: 45% of Hard lives that
fall into arrears now climb back out of them. Arrears on Hard still hurt, and
a player who ignores money entirely still usually drowns — which is the point
of the difficulty. It is no longer the *only* ending.

## P1 — The core experience

The things that would most improve a session.

| # | Item | Why | Effort |
|---|---|---|---|
| 6 | ~~**Sound and haptics**~~ — **done** | Every tap is silent. A year turning, a promotion, a death — none of them land. This is the single biggest "feels like a real app" gap. *opinion* | M |
| 7 | **Close the agency gap: 41% vs ReLife's 55%** — **measured** | More branching forks that change a life's direction rather than its statistics. This is the one metric where we still lose. | L |
| 8 | ~~**A proper death and legacy screen**~~ — **done** | The current one is a stat dump. It should read like an obituary — the shape of the life, the people left behind, what was inherited. It is the emotional payoff of the whole game. *opinion* | M |
| 9 | **Year-summary pacing** | Popups still arrive in a queue: birthday, notices, two events, an achievement. Consider one scrollable "this year" sheet instead of four dismissals. *opinion* | M |
| 10 | **Notifications** | "Your character is waiting" brings people back. Needs the native layer, so it belongs after the APK. | S |

### What item 8 turned into

`eulogy.js`, a generator that writes the dead person's obituary from the save,
and a rebuilt death screen that leads with it.

Four or five paragraphs, assembled from what actually happened: where they were
born and what that was worth, what they did for the years they worked, who is
left and who went first, what the estate came to and who gets it, and a closing
line. Then "the years that turned it" — the six log entries that mattered — the
ribbons, and the eggs. **The thirteen stat cells are still there, behind a "The
numbers" toggle.** Nothing was deleted; it was demoted.

Three things this needed that were not obvious:

- **The obituary has to be deterministic per save.** The screen re-renders every
  time the stats toggle is pressed, so anything random would rewrite the dead
  person's life mid-read. All variation is keyed off `s.seed`.
- **Final happiness is a near-useless signal at death**, because it decays for
  everyone. A bleak closing line drawn from it fired on three lives in four. It
  now needs corroborating evidence: no one left, and a poor reputation.
- **It needed a job history, which the save did not keep.** `S.career` was added
  so the obituary can say "spent 34 years as a structural engineer" rather than
  reporting the last job title held.

Measured over 250 simulated lives: 8.6 sentences per obituary, 250 distinct
opening lines, 61 distinct closing lines with the commonest at 16%. Eleven tests
cover it, including one that renders the same life three times and requires the
three obituaries to be identical.

### What item 6 turned into

Fifteen cues, **synthesised at play time** rather than shipped as audio files.
The game is one self-contained offline document, and a sample library would
have cost more bytes than the entire rest of the game; a cue is instead a
short list of notes over a shaped envelope, which also means any of them can
be retuned by editing two numbers rather than opening an audio editor. The
whole feature adds 9 KB to the bundle.

They share a key — A minor pentatonic — so a promotion, an achievement and a
year turning sound like the same game rather than three asset packs. The year
is a low three-note swell, the heartbeat everything else is measured against.
Death is the same root note held for one and a half seconds.

Sound is attached at seven places, not sprinkled: the year turn, every popup
(by what the popup *is* — a result reads its own effect chips, so a costly
year does not sound like a profitable one), death, promotion, refusals, being
born, and one quiet tick bound once at the document level for any button that
does not already make a noise of its own.

Haptics go through Capacitor's plugin on a real device, `navigator.vibrate`
in a browser, and nothing anywhere else. `@capacitor/haptics` is now a
dependency; no native code needed.

Sound, vibration and volume are all switchable from More › Stats, on by
default. Nothing throws when there is no audio device, no Web Audio or no
window at all, which is the environment the test suite runs in — a test
proves every cue named anywhere in the code actually exists, since a typo in
a cue name is otherwise silent in the most literal way.

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

~~**First:** P0 items 2, 3 and 4 in one pass~~ — done.

~~**Then:** onboarding (1)~~ — done, along with item 5, which turned out to be
the larger of the two once the arrears numbers were properly measured.

~~**Next:** sound and haptics (6)~~ — done.

~~**Next:** the death screen (8)~~ — done.

**Next: the agency gap (7).** It is the one metric where we still lose to
ReLife, and it is a long job, so it wants a clear run.

**Only then** content volume (11) — it is the largest single job here and it is
wasted if the first five minutes lose people anyway.

The APK is no longer blocked, and it is now worth putting in front of someone:
the first five minutes teach you the game, the difficulty is a difficulty
rather than a script, and it makes a noise when something happens. What is
left on P1 is the ending and the branching, both of which are about how a life
*reads* rather than whether it works.
