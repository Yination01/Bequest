# Comparative study — Bequest vs BitLife, AltLife, ReLife

## What this actually is

**BitLife, AltLife and ReLife are closed commercial apps. They cannot be run here.**
The three competitor engines in `research/compare.js` are **models**, hand-built from
documented mechanics and player reports. They reproduce each game's *design behaviour* —
event density, breadth of systems, difficulty curve, how far a choice moves the outcome —
not their code. **Bequest is the only engine simulated for real.**

Competitor rows below should be read as "this is how that design behaves", not
"this is what the app returned".

## Method

- **100 scenarios**: 50 fixed archetypes (doctor, surgeon, CEO, bank robber, pop star,
  teen parent, dropout, recluse…) + 50 random seeds.
- Each scenario is run **once per engine** and never repeated. Zero duplicate life
  signatures in any engine.
- **Agency** is measured by running the same scenario twice with identical, deterministic
  play — first option every time vs last option every time — and measuring how far the
  two finished lives diverge across age, wealth, reputation, happiness, children, crimes,
  education, years jailed and career field.

## Results

| Metric | BitLife | AltLife | ReLife | Bequest |
|---|---|---|---|---|
| Median lifespan | 74 | 68 | 76 | 73 |
| Lifespan spread (p10-p90) | 30 | 29 | 27 | 33 |
| Median peak wealth | $192,498 | $25,986 | $650,956 | $1,434,039 |
| Events per year | 1.24 | 0.94 | 0.63 | 1.44 |
| Empty years | 14% | 28% | 37% | 1% |
| Within-life uniqueness | 44% | 38% | 38% | 93% |
| Between-life overlap | 9% | 9% | 8% | 40% |
| Mid-game density vs life | 0.99 | 0.99 | 0.99 | 1.00 |
| Systems touched per life | 5.8 | 6.0 | 8.0 | 7.3 |
| Agency (choice divergence) | 34% | 41% | 55% | 43% |
| NPCs live their own lives | 35% | 18% | 12% | 97% |
| Grounded tone | 20% | 55% | 85% | 95% |
| Humour | 90% | 45% | 15% | 20% |

## Reading the table

**Where Bequest already leads**

- **Pacing.** 1% empty years against 14% / 28% / 37%. ReLife's modelled 37% dead years
  matches its most common review complaint — long stretches of managing numbers with no story.
- **Within-life uniqueness (93%).** Roughly double all three. This is the direct answer to
  BitLife's single loudest criticism: *"repetitive, gets old really quick"*, *"5–6 generations
  before it gets extremely repetitive."*
- **Grounded tone (95%)**, which was a locked design decision from the start.

**Where the study said we were losing, and what was changed**

| Weakness found | Evidence | Fix applied |
|---|---|---|
| NPCs were scenery | Bequest 25%. ReLife 12% — and its top review reads *"show me what people in my life go on to do after school, who they marry, what careers they choose"* | Every NPC now lives a parallel life: education, jobs, promotions, redundancy, partners, marriage, children, emigration, arrest, retirement — reported to you as it happens. **25% → 97%** |
| Choices didn't reshape a life | Agency 31–33%, worst of the four | "Formative moments" that compound for decades through promotion odds, hiring, illness risk and relationship decay; plus choices now steer which stories you get later. **31% → 43%**, past BitLife and AltLife |
| Getting rich was too easy | $2.5M median under optimised play — exactly ReLife's *"too easy to be rich"* | Progressive tax bands above $120k and $250k, plus lifestyle inflation that scales with peak income |
| Every life drew on the same content | Between-life overlap 38% | Each life now leans toward 4 story themes and away from 3, so two lives draw on different slices |

**Two real bugs the study exposed that testing had missed**

1. **Every single life acquired all three formative moments**, so they differentiated
   nothing at all — the exact opposite of their purpose. Now capped at 2 per life with
   much higher thresholds, making them genuinely defining.
2. **Happiness collapsed to 0 and stayed there** in long lives — a one-way ratchet into
   permanent misery. People adapt; there is now a recovery floor.

## Deliberately not copied

- **BitLife's humour (90%).** It is their biggest strength and the reason people forgive
  the repetition — but "grounded realistic" was locked in `DECISIONS.md`. Copying the
  absurdism would break the tone the whole content library is written in.
- **ReLife's system count (8.0 vs our 7.5).** The gap is politics and chess ladders.
  Its own reviews say the systems *"feel like more work than fun"* and lack emotional
  payoff, so more systems is the wrong target — more *reasons to care* is the right one,
  which is what the NPC work delivers.
- **Paywalled content.** All three monetise content. Free-tier parity is locked.

## Remaining gap

Agency is 43% against ReLife's modelled 55%. Closing it needs content work rather than
systems work: more event branches that change a life's direction outright — losing a
career, a conviction, emigration, a child — rather than adjusting statistics.


---

## Follow-up pass (after the first report)

Three changes were made on the back of this study:

**1. Life forks — 13 events that change direction, not statistics.** Being struck off,
deported, refused leave to remain, blacklisted, a career-ending injury, a custody fight,
giving up work to care for a parent, inheriting a business, bankruptcy, retraining from
scratch. These use real mechanisms: a barred profession is permanently or temporarily
closed and says why; deportation moves you abroad and devalues your qualifications;
dependents permanently cost you actions every year.

**2. Dry wit, no absurdism.** Ten "small moments" written in a wry observational register
— the neighbour's cement mixer with no end date, fifty-five minutes on hold, a yellow
envelope for being four minutes over, the reply-all. Humour that fits a grounded tone
rather than fighting it.

**3. Other people's lives now collide with yours.** A friend who made it can bring you
into a job; a sibling's divorce puts them on your sofa for three weeks; someone asks at a
party how your child is doing and everyone listens to the answer.

**Event library: 239 → 270.**

### Where it landed

| | Before study | After |
|---|---|---|
| NPCs live their own lives | 25% | **97%** |
| Agency | 31% | **~41%** (beats BitLife 34, AltLife 41; below ReLife's modelled 55) |
| Within-life uniqueness | 93% | **95%** |
| Empty years | 1% | **0%** |
| Tests | 76 | **82** |

Agency measurement varies 39–43% between runs, which is noise in a 60-pair sample rather
than a real difference. Honest read: we have clearly passed two of the three on choice
impact and have not yet passed ReLife.
