# Bequest — what I would do next, in priority order

Written after the final audit. Items marked **measured** come from test or audit
output, not impression. Items marked *opinion* are my judgement and you may
disagree — they are the ones worth arguing about.

Current state: 533 events, 315 tests, 23 modules, 737 KB, no known integrity
problems, a life simulates in 37 ms.

**P0 is clear**, and three P1 items with it. All are covered by tests.

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
| 7 | ~~**Close the agency gap: 41% vs ReLife's 55%**~~ — **done, now 53-55%** | More branching forks that change a life's direction rather than its statistics. This is the one metric where we still lose. | L |
| 8 | ~~**A proper death and legacy screen**~~ — **done** | The current one is a stat dump. It should read like an obituary — the shape of the life, the people left behind, what was inherited. It is the emotional payoff of the whole game. *opinion* | M |
| 9 | **Year-summary pacing** | Popups still arrive in a queue: birthday, notices, two events, an achievement. Consider one scrollable "this year" sheet instead of four dismissals. *opinion* | M |
| 10 | **Notifications** | "Your character is waiting" brings people back. Needs the native layer, so it belongs after the APK. | S |

### What item 15 turned into

`health.js`. Treating something was one button: pay, it becomes managed,
done. The country you lived in changed the price and nothing else, which
made a strong public health service pure upside. That is not what living
under one is like, and the data already knew: `country().med` is 0.25 in the
United Kingdom and 1.6 in the United States.

The missing half of that number is time. A low multiplier means the state is
paying, which means you wait; a high one means you are paying, which means
you are seen on Thursday. So the 32 countries now sort into three systems —
25 public, 6 mixed, 1 private — and each one is a different bargain:

| | cost | wait |
|---|---|---|
| the health service | free | one to four years, less if it is serious |
| a mixed system | partly covered | up to two years |
| a private system | all of it | none |

With, on top: a **specialist**, who roughly doubles the chance of beating a
condition rather than managing it; **rehabilitation**, which is dull, takes
two years and is the difference between recovering and coping; and the
option to **pay your way off the waiting list**, which is the decision the
whole thing exists to offer.

Median lifespan comes out at 70 in a public country against 68 in the
private one — free care against fast care, and neither obviously better,
which is the right answer.

### What item 13 turned into

`invest.js`. There was one investment in the game: crypto, whose price moved
by up to forty per cent a year on a coin flip. Savings paid 2.5%. Investing
was a single lever and the only decision was how hard to pull it.

Six asset classes, and the reason for six is that they do not move together.
Each year the market has a mood; every asset responds to it by its own beta
and then adds noise of its own. Gold's beta is negative, so it is the only
thing that rises in a bad year, and bonds barely notice one.

Measured over 30 years and 2,000 runs, £60,000 invested:

| | median | bad case (10th) | ended down |
|---|---|---|---|
| all in shares | 6.0%/yr | 0.8%/yr | 7% |
| all in an index fund | 5.6%/yr | 2.0%/yr | 2% |
| **spread across all six** | **5.3%/yr** | **2.3%/yr** | **0%** |
| all in bonds | 3.0%/yr | 2.6%/yr | 0% |
| all in gold | 2.2%/yr | 0.7%/yr | 3% |

Nothing in the code says "diversification is good". It falls out of the betas,
which is the only way a lesson like that is worth having in a game. Gold on
its own is a poor investment and a good hedge, and the table shows both.

The portfolio screen reports how spread out the money is as a single number,
because that is the thing a player cannot work out at a glance and the thing
that decides how the bad years feel.

### What item 16 turned into

Twenty-eight events with a room in them: Christmas, a funeral, a wedding, the
will being read out, three siblings deciding what to do about a parent, two of
your children who have stopped speaking.

**They were impossible until a bug was fixed.** An event's title, its text, its
choice labels and its outcome are four separate `tok()` calls, and each one
re-rolled every token independently. With three children, the title and the
outcome named a **different child 62% of the time** — and nothing could ever
name two people at once, because `{child}` twice in one scene was a coin flip.

There is now a cast, resolved once when the event is drawn and carried on the
queued popup, so all four reads agree. That also made new tokens possible:
`{child2}`, `{sibling2}`, `{kids}`, `{family}`, `{origin}`. An event can say
"{child} and {child2} have not spoken since the summer" and mean it.

`gathering`, `children2` and `siblings2` requirements were added so an event
that needs three people in a room can ask for three people, and `g` joined the
theme list, so some lives are full of family occasions and others are not.

The suite caught seven problems in one run, which is the best argument for it
in this document: two hardcoded registries that had fallen behind the engine
(the token list and the requirement-key list), a gate-satisfier that could not
build a family, a requirement regex that could not see the digit in
`siblings2` and so reported it as never read, a stray `rel_all` typo, an
opening pronoun, and the fork ratchet catching 28 new events diluting agency
again.

### What item 14 turned into

`court.js`. Being caught was one line of arithmetic: a roll decided whether
you were caught and a second decided how many years. Now it is

    charged -> how do you plead -> who represents you -> verdict -> appeal

and the decisions trade against each other. Pleading guilty takes 45% off and
gives up any chance of walking. Fighting costs money and, if you lose, costs
you the discount too. Counsel runs from the duty solicitor (free) to a silk
(£26,000), and it is expensive exactly when you can least afford it.

Measured over 400 cases at a six-year starting point:

| | strong evidence | thin evidence |
|---|---|---|
| plead guilty, duty solicitor | **3.0 years** | 3.0 years |
| fight it, duty solicitor | 5.0 years, 17% walk | **2.8 years, 54% walk** |
| fight it, a silk | 2.6 years, 48% walk | 1.0 years, 80% walk |

So the plea is a real decision that flips on the evidence and on what you can
pay, which is the point.

Three things worth recording:

- **The whole flow is queued, never `confirmDo()`.** A case can open from
  inside `ageUp()`, and draining the queue from in there re-enters the year.
- **A case interrupted by closing the game is re-queued on load**, and dying
  discontinues it. An unresolved `S.legalCase` would otherwise block the next
  charge forever.
- **The headless harness plays cases out** rather than dropping them. Without
  that, nobody in a simulated life would ever go to prison, and every balance
  and agency measurement in the repo would have quietly drifted.

Four bugs found on the way, three of them in tests that had never really been
exercised: the plea screen kept its own copy of the sentencing discount and
advertised four years where the court gave three; a negative balance would
have *paid* you to hire a solicitor; `a relevant degree helps you get hired`
compared two independently drawn sets of random lives and so measured mostly
noise (held steady, it is 94% against 75%); and `rare events are rare` sampled
25 lives against a ceiling it crossed one run in nineteen by chance.

### What item 12 turned into

`school.js`. Ages eleven to eighteen resolved to one number, `S.gpa`, which
drifted up from smarts and discipline and decided exactly one thing: whether a
university would take you.

Twelve subjects now have their own grades, driven by an aptitude rolled at
birth, by discipline, and by whether you kept the subject at fourteen. `S.gpa`
survives — the rest of the game reads it — but it is now the average of what
you are actually studying rather than a number of its own.

**The find: every degree in the game was unreachable.** `S.degree` was read in
six places and assigned in none. Enrolling at university bought you three
smarts a year and an education level; the twelve degrees in `social.js`, their
skill packages, and the 12% pay premium for working in your degree's field
were all dead code. You now choose what to read when you enrol, and your
subjects decide what is on the list. There is a test whose only job is to stop
that regressing.

What makes eleven to eighteen matter now:

- **A degree needs a subject you carried past fourteen**, at 60 or better.
  Drop science and medicine, psychology and sports science close behind you,
  however clever you turn out to be later.
- **Leaving school converts grades into skills** — a 90 in Design and
  Technology is worth real handiness — so the subjects feed careers directly
  even if you never go to university.
- **Studying is aimed at a subject** rather than at a general grade.

One thing that needed rethinking. The first model added a little to each
subject every year; over seven years everybody became a straight-A student in
everything and no degree was ever closed to anyone. Grades now converge on a
ceiling set by ability and effort, so time stops being the deciding factor.
Measured over 300 lives with no deliberate study: core grades run 53 at the
tenth percentile to 82 at the ninetieth, and a quarter of them fall below the
bar.

### What item 11 turned into

**324 → 506 events.** The target was 500 and the distribution mattered more
than the number.

The theme system picks four themes a life leans towards and three it leans
away from, weighting events by the prefix of their id. Fourteen themes were
leanable and half of them were empty:

| theme | before | after |
|---|---|---|
| business | **2** | 24 |
| fame | **4** | 21 |
| school | 7 | 22 |
| money | 7 | 24 |
| work | 12 | 29 |
| people / the ordinary week | 8 / 12 | 20 / 24 |

A life that leaned towards business got a doubled weight on two events. That
is not a theme, it is a promise the engine could not keep. Filling those was
both the volume target and the fix.

**Volume cost agency, and that had to be paid back.** 182 mostly-ordinary
events pushed the share of events containing a real fork from 21.9% to 19.0%,
and measured agency fell from 53% to 49.5%. The ratchet test caught the first;
the second only showed up because it was measured. The answer was not to
hand-tune a hundred weights but to state the rule: **a year should more often
hand you a decision than a nudge.** Events are tagged at load and weighted up.

The subtlety that took three attempts: boosting *all* forks shortened every
life in the game, because illness is a fork. Weighting illness up put median
lifespan at 58 and the suite refused it. Splitting the tag in two — `fork` for
the content ratchet, `pathFork` for the frequency bonus, with illness in the
first and not the second — was better on both axes at once: **agency 54%,
median lifespan 66.**

Where it leaves the original complaint:

- a life now draws on **~100 events**, from a library it takes **eight lives**
  to see two thirds of, against six before
- events available at any given age rose across the board, and the empty
  stretch after seventy is no longer empty
- median lifespan now matches ReLife's 76 exactly

### What item 7 turned into

The gap was diagnosed before anything was written. `measureAgency` scores nine
dimensions; broken down per dimension, the answer was obvious:

| dimension | diverged before | after |
|---|---|---|
| net worth / career field | 86% / 85% | 85% / 84% |
| reputation | 72% | 47% |
| years jailed | 44% | 66% |
| crimes | 21% | **62%** |
| education | 29% | **46%** |
| children | 9% | **38%** |
| age at death | 26% | 29% |
| happiness | 16% | 18% |

**80% of the 326 events were pure statistic adjustments.** Only three events in
the entire game ever forked on whether you had a child, and nothing forked at
all after seventy. So: 53 new events that change a life's direction — whether
there are children, whether there is any more education, whether crime catches
up with you, what the body does, and the last third of a life, where there had
been nothing.

**Agency: 43% → 53%** measured over 200 lives; `research/compare.js`, which
samples 60, reports **55%**. Take the conservative figure. Events with a real
fork went from 13.5% to 21.9% of the content.

Four things this turned up that were not the job:

- **`research/compare.js` did not run.** The tool that produced the 41% in this
  document crashed on `EGG_UNLOCKS is not defined` — its module list was
  missing seven files. Fixed.
- **Two events had `promoPenalty` nested inside `e:{}`** instead of beside it,
  so the choice that was supposed to cost you a promotion silently did nothing.
- **The theme system is the id prefix.** Putting all the new events under one
  prefix would have made every fork rise and fall together, and would have
  quietly hijacked the `f_` (fame) theme. They are spread by subject, which
  also fills themes that were nearly empty: crime had 5 events, health 6.
- **A near-miss on balance.** The first draft granted fatal illnesses outright
  and pushed median lifespan from 67 down to 53 — the suite caught it. Ignoring
  a lump should *risk* cancer, not guarantee it, so there is now a
  `conditionRisk` hook. That is better design and better prose: most of the
  time, nothing comes of it, which is exactly why people ignore lumps.

Five new tests guard the content itself: every hook an event uses must be one
the engine implements, every id it names must exist, no two events may share an
id, every stated requirement must be satisfiable, and a fifth is a ratchet on
the share of events that fork. Between them they caught four dead hooks, three
duplicate ids and two crashes waiting to happen.

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

### The will (asked for separately, not from this list)

`will.js`. Dying used to take the first living child out of the array and hand
them 70% of net worth as cash. The house, the business and the car were
deleted. For a game called Bequest that was the wrong ending.

Now you can write one, from the Money tab, and three rules make it matter:

- **Without a will the estate is liquidated.** Everything is sold by strangers,
  **12% goes to probate**, and a formula splits the cash. With a will probate
  takes **4%** and things pass *in kind* — the heir wakes up owning the actual
  house, let out until they are old enough to live in it.
- **Leaving someone out is not free.** They may hear about it while you are
  alive, and they can contest it once you are not. A resentful child cut out of
  a large estate goes to court often enough to be frightening; the lawyers take
  up to 18% off the top and the court hands the claimant a forced share out of
  everyone else's. Telling the family while you are alive costs you the
  relationship but roughly halves the chance of a fight. Nobody sues over a
  small estate.
- **One object can outlive all of it.** An heirloom — a watch, a violin, a
  service medal — carries the name of every generation that held it. It can be
  commissioned, or a wealthy family may already have one. Leave it to nobody
  and it is sold with the furniture.

The death screen now offers every child as a separate card showing exactly what
they inherit, so "carry on as" is a real decision rather than an array index.
An heir left nothing says so, in one word.

Two things worth knowing:

- **Bequests lapse rather than fail loudly.** Assets are matched by uid, so if
  you leave Margot the house and then sell the house, the gift quietly
  disappears. That is the real doctrine and it is also the safe behaviour.
- **The settlement is computed once, at death, and cached.** Like the obituary
  it must not re-roll while it is being read. It is also cleared in `newGame`,
  because a stale estate leaking into the next life was a real bug the tests
  caught.

23 tests, including one that settles 120 estates and requires every pound to be
accounted for, and one that asserts a family never gives two siblings the same
first name — which it did, until this went in.

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
| 11 | ~~**324 → 500 events**~~ — **done, 506** | At ~100 events a life, a committed player exhausts the library in five or six runs. Content is the genre's fuel. | L |
| 12 | ~~**School subjects**~~ — **done** | Education is one grade number. Subjects that feed degrees and careers would make ages 11–18 matter as much as adulthood. | M |
| 13 | ~~**Investments beyond crypto**~~ — **done** | Shares, funds, bonds, gold — a real portfolio with risk profiles. ReLife's players rate this highly. | M |
| 14 | ~~**Court and legal process**~~ — **done** | Arrests jump straight to a sentence. A plea, a lawyer, a trial and an appeal would make crime a system rather than a dice roll. | M |
| 15 | ~~**Health depth**~~ — **done** | Specialists, surgery, waiting lists, rehabilitation, and country-by-country healthcare differences that already exist in the data but barely surface. | M |
| 16 | ~~**Group and family events**~~ — **done** | Everything is one-to-one. Christmases, funerals, weddings, family arguments with three people in them. | M |

## P3 — Launch readiness

Required before it goes on a store, in rough order.

| # | Item | Why |
|---|---|---|
| 17 | **A stable signing key** | Without it no build can upgrade another. Five minutes of work, documented in `BUILD-APK.md`. |
| 18 | **Google Play Billing** | The purchase flow is simulated. The Plus gates already exist and are enforced by a test. |
| 19 | **Firebase cloud saves** | Decided, not built. The prototype syncs to a sandbox server that will not exist. |
| 20 | ~~**Privacy policy and data declaration**~~ — **drafted** | Play requires both. We collect nothing, which makes this easy and worth saying loudly. |
| 21 | **Content rating** | Crime, alcohol, drugs, gambling. Expect 16+. Declare honestly. |
| 22 | **Store listing** | Screenshots, description, and a name search against the registers one final time. |
| 23 | **Crash reporting** — *capture built, destination deliberately open* | Currently blind to anything that happens on a real device. |

### Where crash reporting got to

The capture half is built and the transport half is deliberately not.

There was no global error handler at all: a thrown error outside the
fourteen local `try/catch` blocks left the screen frozen with no message and
no way for the player to tell anyone. The `try/catch` blocks were worse in
their way — a save that failed to write, a corrupt load, an achievement
predicate that threw, all swallowed in silence, possibly for years, because
nothing ever looked.

Both are now recorded, on the device, in a twelve-report ring buffer. Ten of
the silent catches report what they swallowed.

**Nothing is sent anywhere.** `crashSink()` is the single seam a destination
plugs into — an endpoint, Crashlytics, Sentry — and until one exists the only
way a report leaves the phone is the player pressing Copy. Sending is gated
on an opt-in that defaults to off, so item 20's claim that the game collects
nothing is true as written.

**What a report may not contain:** the player's name, any NPC's name, their
employer, school or manager, any log line, or the save. A life is described
by its shape instead — age, generation, country, difficulty, what was on
screen, what they had just done, conditions, and money as a band rather than
a figure. A test puts `Zzyzx Qwertyson` in the save and fails if it appears
anywhere in a report.

A real report reads:

    Bequest 1.0.0  error
    where: game.js:1200
    Cannot read properties of null (reading 'boom')
    age 34  gen 1  us  normal
    screen money/invest  popup C
    did: gym
    money 10k-100k  worth 10k-100k  npcs 8  conds anxiety

which is enough to reproduce most things and is not about anybody.

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

~~**Next:** the agency gap (7)~~ — done.

~~**Next:** content volume (11)~~ — done.

~~**Next:** school subjects (12)~~ — done.

~~**Next:** court and legal process (14)~~ — done.

~~**Next:** group and family events (16)~~ — done.

~~**Next:** investments beyond crypto (13)~~ — done.

~~**Then:** health depth (15)~~ — done.

**P0, P1 and P2 are now clear.** What is left is P3, which is launch
plumbing rather than design — a signing key, Play Billing, Firebase, a
privacy policy, a content rating, a store listing and crash reporting —
and P4, which is deliberately later. Of P3, **item 17 (a stable signing
key)** is five minutes and blocks every other build, and **item 23 (crash
reporting)** is the one that stops the first week being guesswork.

~~**Only then** content volume (11)~~ — done, and it was right to do it last:
it would have been wasted before the first five minutes worked.

The APK is no longer blocked, and it is now worth putting in front of someone:
the first five minutes teach you the game, the difficulty is a difficulty
rather than a script, and it makes a noise when something happens. What is
left on P1 is the ending and the branching, both of which are about how a life
*reads* rather than whether it works.
