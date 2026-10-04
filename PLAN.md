> **Superseded.** This document plans a Flutter app that was never built. The
> game that exists is the single inlined HTML bundle in `pwa/`, and `ROADMAP.md`
> is the live plan. Kept for history; nothing here should be followed.

# Life Simulation Game — Project Plan (v0.1, planning only)

**Status:** planning agent. No code will be written until you confirm.

---

## 1. Decisions locked so far

| Area | Decision |
|---|---|
| Target | Android, distributed as `.apk` |
| Stack | **Flutter (Dart)** — recommended, pending your OK |
| Visuals | Text + stat bars. No sprites. Clean typographic UI, icons only |
| First deliverable | One playable prototype ("Milestone 1"), not a full game |
| Genre | Hybrid: BitLife-style age-up life sim + Sims-style needs management |
| Time model | **Open — to be decided in the design discussion** |
| Prototype scope | Core loop + jobs/money + relationships + save/load + activities menu |
| Build path | Both: (a) APK built here in the workspace, (b) GitHub Actions CI for repeatable builds |

### Why Flutter
- Widget system is ideal for stat bars, cards, scrollable event logs, menus.
- Same code runs as a web build → you can playtest in the workspace preview in seconds instead of waiting on APK installs.
- `flutter build apk --release` = one command; also a well-trodden GitHub Actions path.
- Dart classes + `json_serializable` make the save system straightforward.
- Trade-off accepted: ~7–15 MB base APK size vs ~2 MB for native Kotlin. Irrelevant for this game.

---

## 2. Open design questions (the "last discussion" you mentioned)

To resolve before Milestone 1 code:

**A. Time & loop**
1. Does a "turn" equal a week, a month, or a year?
2. Do needs (hunger/energy/mood) decay in real time, per turn, or only during activities?
3. Is there an action-point budget per turn, or unlimited actions with time costs?

**B. Fail states**
4. Can the player die early (health 0)? Go bankrupt? Be institutionalised/jailed?
5. Is death the only ending, or are there "win" endings (retire rich, legacy, etc.)?

**C. Identity & scope of a life**
6. Start at birth (age 0) or at 18?
7. Randomised birth country/family wealth/genetics, or player-chosen?
8. Generational play (continue as your child) — in scope later, or never?

**D. Tone**
9. Realistic-grounded, comedic-absurd (BitLife), or dark/dramatic?
10. Setting: modern real-world-ish, fictional country, or Nigeria/local-flavoured?

**E. Content volume**
11. How many random events do you want at launch? (~60 is the minimum for it not to feel repetitive; ~250 feels rich.)
12. Do you want to author event text yourself, or should I generate it?

---

## 3. Proposed architecture

```
lib/
  main.dart
  app.dart                  // theme, routing
  core/
    rng.dart                // seeded RNG so runs are reproducible for testing
    clock.dart              // turn/time advancement
  models/
    character.dart          // age, stats, traits, money, flags
    stats.dart              // health, happiness, smarts, looks, discipline
    needs.dart              // hunger, energy, hygiene, social, fun
    relationship.dart       // NPC + affection/trust/type
    job.dart, asset.dart
    game_state.dart         // root save object
  content/
    events.json             // data-driven life events
    jobs.json, names.json
  engine/
    event_engine.dart       // filters eligible events by conditions, weights, fires them
    needs_engine.dart       // decay + effects of neglect
    economy_engine.dart     // income, bills, expenses
    relationship_engine.dart
    aging_engine.dart       // stage transitions, death check
  save/
    save_service.dart       // JSON -> shared_preferences / file, autosave each turn
  ui/
    screens/ new_game, main_hud, activities, relationships, job, event_dialog, summary
    widgets/ stat_bar, event_card, log_feed, action_button
```

**Key principle: content is data, not code.** Every event lives in `events.json`:

```json
{
  "id": "school_bully",
  "minAge": 8, "maxAge": 17,
  "weight": 10,
  "requires": { "flags": ["in_school"] },
  "text": "A bigger kid shoves you in the hallway and demands your lunch money.",
  "choices": [
    { "label": "Hand it over",  "effects": { "happiness": -10, "money": -500 } },
    { "label": "Fight back",    "effects": { "health": -15, "happiness": +8, "discipline": +3 } },
    { "label": "Tell a teacher","effects": { "happiness": -3, "flags+": ["snitch"] } }
  ]
}
```
This means new content needs zero recompiles of game logic and you can write events yourself later.

---

## 4. Milestones

### M0 — Foundations (no gameplay)
- Flutter project scaffold, theme, navigation.
- `GameState` model + JSON save/load + autosave.
- Seeded RNG.
- Web build running in the workspace preview so you can click through it immediately.
- **Deliverable:** empty shell you can open and navigate.

### M1 — Playable prototype (the thing you asked for)
- Character creation (name, gender, random birth circumstances).
- Five core stats + five needs with stat bars.
- Turn advance ("Age Up" / "Next turn") with needs decay and consequences.
- Activities menu (eat, sleep, study, exercise, socialise, work, leisure).
- Jobs + money: apply, work, get paid, pay bills, get fired.
- Relationships: family + friends/partner, interact actions, affection drift.
- Event engine + ~60 seed events across life stages.
- Death / end-of-life summary screen with a life recap.
- Save/load + continue.
- **Deliverable:** installable debug APK + web playtest link.

### M2 — Depth pass (after you play M1)
Balance tuning, more events (→200+), traits & genetics, education tiers, assets (house/car), health system, crime/legal, achievements.

### M3 — Polish
Sound-free polish: animations, haptics, dark/light themes, onboarding, release-signed APK, icon & splash.

---

## 5. Build pipeline plan

1. **In-workspace:** install Flutter SDK + Android SDK command-line tools, `flutter build apk --debug`, hand you the file to download and sideload. First build is slow (large toolchain download); later builds are fast.
2. **GitHub Actions:** workflow on push → `subosito/flutter-action` → `flutter build apk --release` → upload APK as a build artifact / GitHub Release. You get a fresh APK on every change without me rebuilding.
3. Web build kept alive throughout as the fast playtest loop.

**Risk to flag:** the sandbox toolchain download is heavy and occasionally flaky. If it fails, the GitHub Actions path is the guaranteed fallback for getting a real APK.

---

## 6. What I need from you to start

1. ✅/❌ on Flutter.
2. Answers to the Section 2 design questions (at minimum A, B, C6, D).
3. Whether M0 and M1 should be one build or two.
