# Mechanics Synthesis — BitLife × AltLife × ReLife
**Status: planning / recommendation. Nothing built yet.**

---

## 1. What each game actually brings

### BitLife — the *feel*
- Single button ("Age") drives everything. Minimal friction, pick-up-and-play.
- Comedic, absurd, sometimes dark tone. Events are the content.
- 4 core stats: Health, Happiness, Smarts, Looks. Easy to read at a glance.
- Activities menu (gym, doctor, library, crime, love) separate from the age-up.
- Ribbons/titles at death ("Rich", "Criminal", "Loyal") = run-scoring.
- Generational continuation as your heir.
- **Best-in-class at:** tone, event writing, UI simplicity, death summary payoff.

### AltLife — the *breadth*
- Deep career ladder: dishwasher → CEO, with defined rungs.
- Social-media fame career track (followers, going viral, sponsorships) — a genuinely distinct pillar.
- Skills as a separate axis from stats: Cooking, Writing, Gaming, Handiness.
- **Items with mechanical effect** — food, electronics, books, black-market goods. Inventory matters.
- Investments: crypto, real estate, buy/rent/flip, coffee shop → skyscraper. Passive income.
- Crime with minigames (pickpocket, GTA) — active skill moments, not pure dice rolls.
- Popularity gates options.
- Avatar customisation that visibly ages (wrinkles, acne, tattoos).
- **Best-in-class at:** systems breadth, items, investment depth, fame track.
- **Its known weaknesses to avoid:** unstable saves, unclear skill progression, shallow NPCs (no classmates/coworkers), state bugs (still "living with parents" after moving out).

### ReLife — the *consequence engineering*
- Explicit long-term-consequence design: choices in year 12 pay off at year 40.
- **Habits system** — smoking, caffeine, junk food, fitness. Not cosmetic; they compound into health and money over decades.
- Wider stat set incl. **Reputation** and Appearance.
- Business ownership with market competition and cash flow, not just passive assets.
- Niche career pillars: politics, art, chess/competitive, social media.
- **Dynamic world news** — global events and economic shifts affect your character's environment.
- Challenges + RePoints + leaderboards = meta-progression across runs.
- Legacy summary: net worth, peak income, defining moments; continue as heir *or sibling*.
- **Best-in-class at:** compounding consequences, habits, meta-progression, world simulation.

---

## 2. The one big conflict I need to flag

You earlier picked "BitLife-style + Sims-style real-time needs." But **all three of your reference games are pure year-by-year**. None of them has hunger/energy/hygiene bars ticking in real time.

Bolting Sims needs onto a year-per-turn game breaks logically — "you were hungry for a year" is nonsense, and it adds tapping chores to a genre whose whole appeal is low friction.

**My recommendation: replace real-time needs with ReLife's Habits + a Lifestyle layer.** You get the same "manage your body and wellbeing" fantasy, it compounds meaningfully over decades, and it fits the age-up loop perfectly.

> If you specifically want the moment-to-moment Sims feel, the alternative is a **two-scale clock**: play out 4 "seasons" per year with light needs, then resolve the year. It's a real design, but it roughly doubles build time and risks feeling like a chore. I'd advise against it for a prototype. **Your call.**

---

## 3. Recommended synthesis — "the best of all three"

### Core loop (BitLife skeleton)
`Read year summary → do Activities → tap AGE → events fire → consequences land → repeat`
One turn = one year. One giant AGE button. Never more than two taps from anything.

### Character model

**Stats (0–100)** — BitLife's readable four, plus ReLife's two:
| Stat | Source | Role |
|---|---|---|
| Health | BitLife | Death risk, illness, energy for activities |
| Happiness | BitLife | Gates choices, drives breakdowns/depression events |
| Smarts | BitLife | Education, job tiers, investment success |
| Looks | BitLife | Romance, fame, some job tracks |
| **Reputation** | ReLife | Politics, fame, crime record, social options |
| **Discipline** | new | Habit resistance, training, business consistency |

**Skills (0–100, separate axis)** — AltLife: Cooking, Writing, Gaming, Handiness, Fitness, Charisma, Business, Combat. Trained by activities, gate jobs and events. *Fix AltLife's flaw:* every skill screen shows exactly what it unlocks at 25/50/75/100.

**Habits (ReLife)** — Smoking, Drinking, Junk food, Caffeine, Gym, Sleep, Gambling.
- Each has an **addiction level 0–100** that rises with use and decays slowly with abstinence.
- Each applies a small per-year tick to stats and money. Small numbers, 60 turns — that's the whole point.
- Quitting is an active multi-year struggle with relapse rolls. This is the "needs management" replacement.

**Traits (rolled at birth)** — genetics, birth wealth tier, birth country, innate stat ceilings.

### The five progression pillars
1. **Education & Career** — AltLife's ladder (dishwasher → CEO), gated by education tier + smarts + skills.
2. **Wealth** — AltLife's investments (crypto, property, buy/rent/flip) + ReLife's **active businesses** with competitors and cash flow.
3. **Relationships** — BitLife/AltLife family, friends, dating, marriage, kids, divorce, rivals. *Fix AltLife's flaw:* NPCs are persistent objects with their own age, job, stats and memory — classmates and coworkers exist and are datable.
4. **Fame** — AltLife's social-media track (followers, viral rolls, sponsorships) + ReLife's art/politics/competitive pillars.
5. **Crime** — AltLife's pickpocket/theft, but **resolved as a stat-weighted dice roll with a visible risk %**, not an arcade minigame (minigames are an M3 stretch, not prototype work).

### Items & inventory (AltLife)
Consumables (food, drugs, medicine), durables (phone, PC, car, house), black market. Every item has a stated mechanical effect. Shop screen from age ~10.

### World simulation (ReLife)
A **News feed** each year: recessions, booms, tech trends, crime waves. Modifiers that touch investment returns, job availability and event weights. Cheap to implement, massively increases the feeling of a living world.

### Endgame (BitLife + ReLife)
Death → **Life Summary**: years lived, peak net worth, peak income, career high, family tree, defining moments, and earned **Ribbons/titles**. Then **continue as heir, or sibling if childless** (ReLife's smart touch), or start fresh.

### Meta-progression (ReLife)
**Challenges + LifePoints** persisting across runs ("die a billionaire", "marry at 19", "quit smoking after 10 years"). Unlocks custom-start options. This is what makes people replay. Offline leaderboard only for the prototype.

---

## 4. Deliberate cuts

| Cut | Why |
|---|---|
| Real-time Sims needs | Conflicts with the year-turn loop; adds chores (see §2) |
| Avatar customisation / visual aging | You chose text + stat bars. Revisit at M3 |
| Crime arcade minigames | Fun but disproportionate build cost. Dice-roll first |
| Online leaderboards / accounts | Needs a backend. M3+ at the earliest |
| Ads / IAP / subscriptions | Not a prototype concern |

---

## 5. Revised prototype (M1) scope

Ship the **spine of all five pillars**, not one pillar in depth:

- Character creation: random birth (country, family wealth, genetics) or custom.
- 6 stats + 8 skills + 7 habits, all on stat bars.
- Year turn: AGE button, needs-free, habit ticks, aging, death check.
- Activities menu scaled by life stage (child / teen / adult / elder).
- Education tiers → job ladder → salary → bills → net worth.
- Persistent NPCs with memory; family, friends, dating, marriage, kids.
- Items: ~25 shop items with real effects.
- Investments: savings, one crypto, simple property. Businesses deferred to M2.
- Crime: 4 dice-roll crimes with visible risk, arrest, jail years.
- News feed: ~15 world events with economic modifiers.
- Event engine + **~80 events** spread across life stages.
- Death → Life Summary + ribbons.
- Challenges: 10 of them, persisting across runs.
- Autosave + manual save/load.

Everything data-driven in JSON so content scales without code changes.

---

## 6. Decisions I still need from you

1. **§2 — habits instead of real-time needs?** (my strong recommendation) Or the two-scale clock?
2. **Tone:** BitLife-comedic, ReLife-grounded, or dark? This drives every line of event text.
3. **Setting:** generic Western, or Nigeria/West-Africa-flavoured? (Genuinely the strongest differentiator available to you — none of the three do it, and the economics of fuel, NEPA, japa, side hustles, family obligation are rich mechanical material.)
4. **Start age:** birth (age 0, full childhood) or 18?
5. **Currency:** ₦ or $?
6. **Flutter — confirmed?**
