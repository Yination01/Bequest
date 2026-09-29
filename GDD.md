# Game Design Document — Untitled Life Sim
**v1.0 · Planning only · Android (APK) · Text + stat bars · Flutter**

The combined best of BitLife, AltLife and ReLife — with their known mistakes deliberately avoided.

---

## 1. Pillar summary — what we take, what we reject

| Mechanic | BitLife | AltLife | ReLife | **Our call** |
|---|---|---|---|---|
| Core loop | One AGE button | Age button | Age button | ✅ **One AGE button.** 1 turn = 1 year |
| Stats | 4 (Health/Happy/Smarts/Looks) | +popularity | +reputation/appearance | ✅ **6 stats** (see §3) |
| Skills | ❌ | ✅ Cooking/Writing/Gaming/Handiness | ✅ | ✅ **8 skills**, separate axis, with visible unlock tiers |
| Habits | ❌ | light | ✅ smoking/caffeine/fitness | ✅ **7 habits with addiction levels** — replaces Sims needs |
| Career ladder | ✅ | ✅✅ dishwasher→CEO | ✅ | ✅ **AltLife's depth**, education-gated |
| Fame/social media | Superstar (paid) | ✅✅ Utoob/Instafame | ✅ | ✅ **Full fame pillar, free** |
| Businesses | ❌ | passive assets | ✅✅ active w/ competitors | ✅ **ReLife's active businesses** (M2) |
| Investments | light | ✅✅ crypto/property/flip | ✅ | ✅ **AltLife's breadth** |
| Items/inventory | light | ✅✅ real mechanical effects | items | ✅ **AltLife's items** |
| Crime | ✅ | ✅ + minigames | ✅ | ✅ **Dice-roll w/ visible risk %.** Minigames = M3 |
| Politics/art/chess | light | ❌ | ✅ | ✅ **Niche career pillars** (M2) |
| World news/economy | ❌ | ❌ | ✅✅ | ✅ **News feed w/ real modifiers** — big differentiator |
| Relationships | ✅ | ✅ but shallow NPCs | ✅ | ✅ **Persistent NPCs with memory** (fixes AltLife) |
| Death summary | ✅✅ epitaphs | ✅ | ✅ net worth/peak income | ✅ **Both: epitaphs + full stat recap** |
| Generations | ✅ heir | ✅ | ✅ heir **or sibling** | ✅ **Heir or sibling, free** |
| Challenges/meta | ✅ weekly (some paid) | ❌ | ✅ RePoints + leaderboard | ✅ **Challenges + Legacy Points, free** |
| Real-time needs | ❌ | ❌ | ❌ | ❌ **Rejected** — see §2 |
| Avatar art | ✅ | ✅ | ✅ | ❌ **Deferred to M3** (text-first) |

---

## 2. The rejected mechanic (decision needed)
Sims-style real-time needs (hunger/energy/hygiene) conflict with a year-per-turn loop and add chores to a low-friction genre. **None of your three references use them.** Replaced by the Habits system, which delivers the same body-management fantasy and compounds across 60+ turns.
→ *Confirm or override in §11 Q1.*

---

## 3. Character model

### Stats (0–100, shown as bars)
`Health` `Happiness` `Smarts` `Looks` `Reputation` `Discipline`

### Skills (0–100, separate screen, each shows unlocks at 25/50/75/100)
`Cooking` `Writing` `Gaming` `Handiness` `Fitness` `Charisma` `Business` `Combat`
*Fixes AltLife's #1 complaint: unclear skill progression. Every skill states exactly what it unlocks.*

### Habits (addiction 0–100)
`Smoking` `Drinking` `Junk food` `Caffeine` `Gym` `Sleep` `Gambling`
- Rise with use, decay slowly with abstinence.
- Each ticks stats/money every year. Small numbers × 60 years = large outcomes.
- Quitting = multi-year struggle with relapse rolls. This *is* the needs-management layer.

### Birth roll
Country · family wealth tier · genetics (stat ceilings) · 2 random traits · parents as full NPCs.

---

## 4. Five progression pillars
1. **Education & Career** — school → certs/uni → job ladder (dishwasher → CEO). Gated by education + smarts + skills.
2. **Wealth** — salary, bills, savings, crypto, property (buy/rent/flip), then active businesses with market competitors.
3. **Relationships** — persistent NPCs with age, job, stats and *memory of what you did*. Classmates and coworkers exist and are datable (AltLife's biggest gap). Family, friends, dating, marriage, kids, divorce, rivals, exes.
4. **Fame** — followers, viral rolls, sponsorships, brand deals; plus art, politics, competitive play.
5. **Crime** — pickpocket → fraud → GTA → heist. Visible risk %, arrest, trial, jail years, criminal record affecting Reputation and jobs.

Plus: **Items** (~25 at launch, every one with a stated mechanical effect) and **World News** (recessions, booms, tech trends modifying returns, job availability and event weights).

---

## 5. Endgame
**Death → Life Summary:** years lived, peak net worth, peak income, career high, family tree, defining moments, and earned **Epitaphs** (Rich, Criminal, Loyal, Famous, Healthy, Deadbeat…).
Then: **continue as heir**, **continue as sibling** (if childless — ReLife's smart touch), or start fresh.

## 6. Meta-progression
**Challenges + Legacy Points** persist across runs ("die a billionaire", "quit smoking after 10 years", "marry at 19"). Spend Legacy Points on custom-start options. Offline leaderboard at first.

---

## 7. Monetisation — free vs paid

### What the three do

| | BitLife | AltLife | ReLife |
|---|---|---|---|
| Model | Free + ads; **Bitizenship** sub; **Fate Control** one-off (~$3–9); Boss Mode, Rewind, Challenge Vault, Superstar, job packs all separately paid | Free + ads; premium removes ads | Free + ads; ~$4/mo sub (god mode, no ads, custom start, cloud saves) **plus** one-off job-type purchases |
| Player reaction | "Best features locked behind a paywall" → huge mod-APK ecosystem | Purchase-restore failures | Top review complaint: sub doesn't unlock everything, extra one-offs on top |

**Lesson:** all three are criticised for the *same* thing — stacking a subscription on top of one-off unlocks and paywalling *content*. BitLife's model is so disliked it spawned an entire mod-APK industry.

### Recommended model — "pay for convenience, never for content"

**Always free, forever:**
- All five pillars, all careers, all crimes, all businesses, all countries
- All events and content updates
- Full generational play (heir + sibling)
- Challenges, Legacy Points, leaderboard
- Save/load, offline play
- **No ads for the first 3 in-game lives** (clean onboarding)

**Free with ads:**
- Optional rewarded ad: one "Second Chance" rewind per life, or a small LifePoint top-up. Never required, never blocking.
- Light interstitial on death screen only (not between turns — the #1 way to ruin this genre).

**Premium — ONE single purchase. No subscription. No packs. No tiers.**
`~$4.99 one-off · "Architect Mode"`
- Remove all ads permanently
- **Fate Control**: edit your own and NPC names/stats/appearance
- **Custom start**: choose country, family wealth, birth year, starting stats
- **Rewind / rewind**: restart a life from any age
- Extra manual save slots + cloud backup
- Cosmetic themes

**Explicitly ruled out:** subscriptions · loot boxes · energy timers · paid job/career packs · paid countries · pay-to-win currency · forced ads between turns.

**Why:** the single-purchase, no-content-paywall stance is a genuine marketing position against all three incumbents, and it removes the entire reason players seek mod APKs. Prototype ships with the premium flag hardcoded ON so we can test everything; store plumbing lands at M3.

---

## 8. Anti-patterns we explicitly fix
| Their bug | Our fix |
|---|---|
| AltLife: saves randomly reset years | Versioned, atomic, checksummed saves + rolling backup slot. Built at M0, not retrofitted |
| AltLife: unclear skill progression | Every skill lists its unlocks at each tier |
| AltLife: can't date classmates; no coworkers | NPCs are persistent objects generated per school/workplace |
| AltLife: still "living with parents" after moving out | Single source of truth for housing state; state flags validated each turn |
| BitLife: best features paywalled | One purchase, no content locked |
| ReLife: sub + extra one-off purchases | No subscription at all |
| ReLife: pacing feels slow | Event density tuned high; no empty years |

---

## 9. Technical plan (unchanged from PLAN.md)
Flutter · data-driven JSON content · seeded RNG · atomic versioned saves · web build for fast playtesting · APK built in-workspace **and** via GitHub Actions.

## 10. Milestones
- **M0** Scaffold, save system, RNG, theme, navigable shell.
- **M1 Prototype** All 5 pillar spines + 6 stats/8 skills/7 habits + items + news + ~80 events + death summary/epitaphs + 10 challenges + save/load. → debug APK.
- **M2 Depth** Businesses w/ competitors, politics/art/competitive careers, 200+ events, education tiers, balance pass.
- **M3 Polish & ship** Store plumbing, ads SDK, minigames, optional avatar layer, signed release APK, icon/splash.

---

## 11. Final questions before build

1. **Habits instead of real-time needs — confirmed?** (Or do you want the 4-seasons-per-year hybrid, at roughly 2× build time?)
2. **Tone:** comedic-absurd (BitLife), grounded-realistic (ReLife), or dark/dramatic?
3. **Setting:** generic Western, global with many countries, or **Nigeria/West-Africa-flavoured**? (My strong recommendation — no competitor does it, and fuel queues, NEPA, japa, black tax, side hustles are real mechanical material, not just flavour.)
4. **Start age:** 0 (full childhood) or 18?
5. **Currency:** ₦ or $?
6. **Monetisation §7 — agreed?** Especially: single one-off purchase, no subscription?
7. **Game title?**
8. **Flutter confirmed, and should M0 + M1 be one build or two?**
