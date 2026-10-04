# Locked Decisions — v1.0
**Still planning. No code until you say go.**

---

## 1. Confirmed

| # | Decision | Locked |
|---|---|---|
| 1 | Platform | Android APK |
| 2 | Stack | **Flutter (Dart)** |
| 3 | Visuals | Text + stat bars, no sprites |
| 4 | Time model | **1 turn = 1 year. One AGE button.** |
| 5 | Needs | **Habits system** (addiction levels). No real-time Sims needs. |
| 6 | Tone | **Grounded realistic** (ReLife-leaning, not comedic) |
| 7 | Setting | **Global / generic Western**, multiple countries |
| 8 | Start age | **Birth (age 0)** — full childhood simulated |
| 9 | Currency | **$ (USD)** |
| 10 | Monetisation | **Subscription-based** — see §2 |
| 11 | Build plan | **One build: M0 + M1 together** → playable prototype + debug APK |
| 12 | Title | Shortlist below, pending your pick |

**Design consequences of "grounded + global + birth + $":**
- Event text is written straight, not jokey. Consequences are realistic; no absurdist deaths.
- Ages 0–17 need real content: parents, siblings, school years, grades, bullying, friendships, puberty, part-time jobs, college applications. Roughly **30 of the ~80 launch events** will be childhood/teen.
- Countries are mechanical: starting wealth distribution, salary scale, cost of living, healthcare cost, crime risk, education cost. ~8 countries at launch.
- Money is realistic-scaled USD (salaries $20k–$400k, not BitLife's inflated numbers).

---

## 2. Monetisation — revised for subscription

You chose a subscription. The design task is getting sub revenue **without** ReLife's top complaint ("the sub doesn't unlock everything, and there are one-off purchases on top") or BitLife's ("all the best features are paywalled").

### The rule: ONE subscription. It unlocks literally everything. Nothing else is ever sold.

**Free tier — a complete, unembarrassing game:**
- All five pillars: career, wealth, relationships, fame, crime
- All countries, all jobs, all events, all content updates
- Full generational play (heir + sibling)
- Challenges, Legacy Points, leaderboard
- Autosave + 1 save slot, fully offline
- No ads for the first 3 lives
- Then: one interstitial on the **death screen only** — never between turns
- Optional rewarded ad for a "Second Chance" rewind (1 per life)

**"Bequest Plus" subscription — $2.99/mo or $14.99/yr (yearly heavily pushed):**
- No ads, ever
- **Fate Control** — edit your own and NPC names/stats/appearance
- **Custom start** — pick country, family wealth tier, birth year, starting stats
- **Rewind** — restart a life from any age
- Unlimited save slots + cloud backup
- Cosmetic themes
- Early access to new event packs (they hit free tier one update later)
- Extra LifePoint earn rate

**Iron rules — written into the design so they can't drift:**
1. **No one-off purchases coexist with the sub.** No job packs, no country packs, no currency. This is the single thing ReLife is most criticised for.
2. **No content is ever subscriber-only.** Everything in the sub list is convenience, cosmetic, or a cheat — not gameplay another player can't reach.
3. **No energy timers, no loot boxes, no pay-to-win.**
4. **Lapsed subscribers keep their saves** and never lose a character. They just lose the conveniences.
5. **7-day free trial** on the yearly plan.

**Optional (say the word):** a **one-time "Lifetime" unlock at ~$29.99** alongside the sub. Captures the large segment that refuses subscriptions on principle — and that segment is exactly who drives the mod-APK traffic. I'd recommend adding it.

**Prototype:** subscription flag hardcoded ON so everything is testable. Store/billing plumbing lands at M3.

---

## 3. Title shortlist

Grounded, global, realistic — so: no puns, no "-Life" clones, short, app-store searchable.

**Top 3 recommendations**
1. **Bequest** — clean, literal, one word, fits a birth-to-death sim exactly.
2. **Mortal** — grounded, a little weighty, memorable, strong icon potential.
3. **Threescore** — from "threescore and ten," the biblical bequest of 70. Distinctive and searchable; slightly literary.

**Also strong**
4. **The Long Run** — captures the compounding-consequences thesis.
5. **Decades**
6. **One Life**
7. **Span**
8. **Inheritance** — leans into the generational hook.
9. **Consequence**
10. **Ninety Years**

*Note: "Bequest," "One Life" and "Decades" may have app-store name collisions — I'd check availability before we commit.*

---

## 4. What happens when you say go

Single build, M0 + M1 together:
1. Flutter scaffold, theme, navigation
2. Atomic versioned save system + seeded RNG (built first, not retrofitted)
3. Data models: 6 stats, 8 skills, 7 habits, NPCs, jobs, items
4. Engines: aging, events, economy, relationships, habits, crime, news
5. Content: ~80 events (≈30 childhood/teen), ~25 items, ~8 countries, job ladder, 10 challenges
6. UI: character creation → main HUD → activities → relationships → assets → event dialogs → death summary + epitaphs
7. Web build for instant playtesting in the workspace
8. Android toolchain install → **debug APK** you can sideload
9. GitHub Actions workflow for repeatable release builds

**Expect this to be a long build.** I'll do it in stages within the run and keep the web preview live so you can click through as it comes together.

---

## 5. Last two things I need

1. **Pick a title** (or say "placeholder" and I'll use *Bequest* for now).
2. **Lifetime unlock alongside the subscription — yes or no?**

Then say go and I'll start building.
# Interface navigation decision — 2026-10-01

The primary navigation is four bottom tabs: Life, Activities, People and Money.
Secondary and account surfaces live behind a persistent hamburger menu: Profile,
Awards, Goals, Records, Shop, Saves, Settings and Help.

Settings is a dedicated page grouped into preferences, save and transfer,
problem reports, and game controls. Profile begins with identity and summary,
then uses collapsible groups for life/career, health/habits, traits/history and
skills. The same rule applies elsewhere: primary pages show their core task
first and move secondary detail into groups or menu pages.

The opening tutorial is optional. It highlights the actual Age Up, tab and menu
controls, then contextual tips teach systems when they become relevant. If a
player skips the opening, the game explicitly asks whether later tips should
remain enabled.

Android Back closes the current in-game layer or returns toward Life before the
app may minimize. Re-rendering a page preserves its scroll position. Interface
tap sound and haptics fire only after a completed tap, never from a scrolling
gesture.

# Profile accordion resilience, restricted places display, event pacing, and minor orientation — 2026-10-02

1. **Profile Accordion Layout**: Collapsible cards (`details.card` and `.card`) enforce `flex-shrink: 0` inside `#main`'s flex column to prevent vertical collapsing or squishing text when cards are closed. Summaries use flex layouts with rotating caret indicators, ample padding, and a minimum 48px touch target.
2. **Infant & Child Orientation**: Characters under age 12 display orientation as 'Undiscovered' in Profile rather than assigning romantic preferences during early childhood.
3. **Restricted Places Display**: Housing options beyond current income and age-gated money hub tiles/shop categories are visually dimmed with `.locked` and `.out-of-reach` (`opacity: .45; filter: grayscale(.4)`). Tapping restricted items triggers an informative modal explaining the exact age or income requirements.
4. **Age Up Pacing**: Event outcomes are unshifted to the front of `QUEUE` upon choice resolution (`resolveChoice`), ensuring the immediate consequence of each decision is seen before any subsequent year event is presented (`Event -> Outcome -> Next Event`).

# Play-test rulings and what they changed — 2026-10-04

Fourteen issues were reported against the preview-16 build (v1.0.64). Everything
that could be reproduced was fixed, and every fix carries a check that was proven
to fail when the fix is reverted (fifteen checks, fifteen mutations caught).

1. **Event pacing. This replaces item 4 of 2026-10-02.** An outcome sheet takes
   its turn behind sheets that are already waiting; it is no longer unshifted to
   the front of the queue. The player reversed the 2026-10-02 reading after a
   play test: Event, next event, outcome, in the order the queue was filled.
2. **Money is held in pots.** Cash, savings and, under 18, the household pot.
   Affordability counts all of them, and payment is drawn in the order cash, then
   savings, then the household pot (the household pot first for minors, as it
   always was). A deliberate purchase that two pots could each cover asks which
   should pay, with the usual order offered first. One tap yearly actions draw in
   the order without asking, so they never strand money in a pot that cannot be
   reached. This is why a teenager with 90,000 of their own was refused a 5,000
   present, and why a confirmed business never opened.
3. **Banking takes any amount**, with All and Half beside it, and keeps a
   statement of every save, withdrawal and repayment with the age it happened.
   The old three buttons were welded to 5,000.
4. **The investment mood and the marketplaces are separate state.** The mood
   lived on `S.market`, the property/vehicle/item marketplace's own object, and
   stamped its year every year, so `marketRefresh()` believed the year was done
   and both markets were empty in every life. The mood lives on `S.stockMarket`
   now and old saves are migrated.
5. **Navigation.** One hamburger, the shell button. Menu page headers carry a back
   control instead of a second menu button. The page header Refresh buttons are
   removed; Reload app stays in Settings. Back unwinds one layer at a time: a
   listing, then its market, then Money.
6. **Repeated actions recover faster.** The percentage beside an action is what it
   currently gives, explained where it is shown, and the window that reduces it is
   three years rather than eight.
7. **School and People.** The school club and the sport remember what you joined.
   People gains Spend time with everyone: a year of catching up with everyone not
   yet seen this year, at the same once-a-year limit as visiting one by one.
8. **Work is visible.** A Career screen (from Menu, or Job and field on the home
   card) shows occupation, job title, field, employer, manager, pay, take-home,
   years in the job, performance, promotion chance, the next step up and the
   track. The home card names the job and the field, and the home stat tiles
   carry their names.

One report could not be reproduced: the profile page breaking. It is left open
pending the exact symptom.
