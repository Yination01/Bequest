# Standing rules for AI agents working on Bequest

These are project rules, not suggestions. Read this before editing.
Also read `AGENTS.md`. Skills: `.agent/master-skills.json`.
Quality bar: `.agent/quality-bar.json` (v40.0, 181 items). Pack:
`.agent/agent-pack.json`. If a skill or checklist item fights this file,
**this file wins**.

**Where things are:** `SITEMAP.md`.
**Decisions:** `DECISIONS.md`. Write a decision the day it is made.
**What is next:** `ROADMAP.md`. It records what each item turned into.
**Design and mechanics:** `GDD.md`, `MECHANICS.md`, `CONTENT.md`.
**Competitor study:** `research/`. The competitor engines there are models,
not the real apps. Do not cite them as measurements of BitLife or ReLife.

This pack was installed on 2026-09-30, long after the game was built. Where
the repo does not yet comply, `agent-pack.json` records it under
`bequest_specific.known_divergence` rather than pretending otherwise.

## What Bequest is

An offline, single-player, text-based life simulator. A Capacitor WebView
over one inlined HTML bundle. `appId` is `app.bequest.game`.

**There is no backend.** No accounts, no analytics, no server. Cloud sync
posts to a URL the player types. Say so plainly rather than implying
infrastructure that does not exist.

## Hard rules

### 1. Never start a build the user did not name

A build must be named in the user's own message this turn. Not implied by
"fix it", not carried from a previous turn, not inferred from "and ship".

If work is ready and no build was named: say the work is on `main`, the
suite is green, name the build and it will be dispatched. Then wait.

### 2. Ask as a questionnaire, and recommend on every question

Discrete options, never an open essay. **Every question carries an explicit
RECOMMENDED option and the reasoning.** A questionnaire without a
recommendation on each question is incomplete.

**If you are unsure, ask.** Uncertainty is a trigger in its own right.

### 3. Test first, then fix

Write the failing check first, watch it fail by the right name, then write
the minimum that makes it pass.

### 4. Mutation-test every new check

A passing test proves nothing until a mutant kills it. Break the real code,
confirm the failure names the right thing, restore from a copied backup
(never `git checkout`), and `diff` to prove the restore was exact.

### 5. Assert the guarantee, never one spelling of it

Do not pin an exact user-facing string. The suite already does this well:
it asserts that no event opens on a bare pronoun, not that one event says
one sentence.

### 6. Never claim done without fresh verification

Run the suite and read the count in the same turn as the claim. State
plainly what was **not** verified. Anything needing a real device is not
verified here.

### 7. Copy, do not paraphrase, the fixed values

Commit identity, brand words and banned punctuation are copied exactly.

### 8. A rule that lives only in conversation is not enforced

If a decision is worth keeping it lands in a file in this repo.

## Bequest specifics that have already cost time

- **A new `pwa/*.js` must be registered in FIVE places:** `pwa/build.py`,
  the `FILES` list in `pwa/tests/suite.js`, and the hardcoded lists in
  `research/audit.js`, `research/compare.js` and `research/final-audit.js`.
  Missing one fails only in that tool, silently, later.
- **`confirmDo()` calls `drain()`**, so it must never be used from inside
  `ageUp()`. Push onto the queue directly. A source-reading test guards it.
- **`python3 pwa/build.py` writes `pwa/index.html` only.** `Bequest.html`
  and `pwa/Bequest.html` are the same file minus the manifest and
  apple-touch-icon lines, and must be regenerated in the same pass.
- **Content volume dilutes agency.** Every batch of events has lowered the
  share that contain a real fork. There is a ratchet test at 20 percent.
  Pay it back in the same turn, do not lower the bar.
- **Balance is measured, not asserted.** Median lifespan, fatal-condition
  rate and rare-event frequency all have tests. A content change that moves
  them is a content bug.
- **`META.premium` is never read from the network.** Plus is bought with
  money. `cloudMergeMeta()` has no branch for it and must not gain one.
- **A crash report may not contain a name.** Not the player's, not an
  NPC's, not an employer, school or manager, and never a log line or the
  save. A test plants a distinctive name and fails if it surfaces.

## Known divergence, recorded rather than hidden

- **The no-dash rule is not yet applied here.** The house rule forbids em
  and en dashes in code, copy, comments and docs. Bequest contains roughly
  791 of them and six were in its first commit. Cleaning them is a decision
  that has not been taken. Until it is, do not claim this repo complies.
- **Most tests here were written after the code they cover**, which is the
  opposite of hard rule 3. New work should not add to that.
