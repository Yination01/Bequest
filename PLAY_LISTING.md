# Play Console listing for Bequest

Every field ready to paste. Nothing here is invented: the content rating
answers were measured against the actual event library on 2026-09-30, and
the counts are reproducible.

Placeholders are marked **TODO** and must be replaced before submission.

---

## Store presence

**App name** (30 characters max)

    Bequest: Life Simulator

23 characters. **The genre has to be in the name.** Searching "Bequest" on
its own returns estate-planning articles, not games: the word is a common
legal term and the store will not surface a new title against that. No
competing app or game called Bequest was found in the simulation category,
so this is a discoverability problem rather than a legal one.

**Short description** (80 characters max)

    One year at a time. A quiet life simulator about what you leave behind.

70 characters.

**Full description** (4000 characters max)

    Bequest is a life simulator that takes itself seriously.

    You are born somewhere, to someone, with nothing decided. Then you live
    one year at a time: school, work, money, people, illness, luck. Every
    year you choose what to do with the time you have, and every choice
    narrows or opens what comes next.

    Then you die, and the game tells you who you were.

    THE SHAPE OF A LIFE
    Twelve school subjects with their own grades, chosen and dropped at
    fourteen, deciding which degrees will take you and which will not. Jobs
    with fields and ladders. Six ways to invest, none of which move
    together. A healthcare system that is free and slow, or fast and
    expensive, depending on where you were born.

    THE PEOPLE
    Everyone around you is living their own life in parallel, and you hear
    about it. Parents who age. Children who stop speaking to each other.
    Friends who move away. Family occasions with a room full of people in
    them, not one person at a time.

    WHAT YOU LEAVE
    Write a will. Decide who gets the house, who gets the business, who gets
    nothing. Cut someone out and they may find out while you are alive, and
    contest it once you are not. Leave a watch to one of your children and
    it will still be in the family four generations later, carrying the name
    of everyone who held it.

    Then carry on as whichever child you choose, with whatever you left
    them.

    AND WHEN IT ENDS
    The death screen is not a scoreboard. It is an obituary, written from
    what actually happened: where you were born, what you did with the years
    you worked, who is left, who went first, and what the estate came to.

    No energy timers. No adverts between years. No internet required.
    It runs entirely on your phone and asks you for nothing.

**Category:** Games, Simulation
**Tags:** Simulation, Life simulation, Text-based, Single player, Offline

**Contact email:** **TODO**, name a real inbox. The same address must
replace the placeholder in `PRIVACY.md` and `TERMS.md`.
**Website:** **TODO** or leave blank.
**Privacy policy URL:** **TODO**, `PRIVACY.md` must be hosted at a public
URL. Play will not accept a repository file.

---

## Graphics needed

| Asset | Spec | Status |
|---|---|---|
| App icon | 512 x 512 PNG, 32-bit | The amber dot exists; needs exporting at size |
| Feature graphic | 1024 x 500 PNG | **TODO** |
| Phone screenshots | 2 to 8, min 320px, 16:9 or 9:16 | Candidates exist in `shots/` |
| Tablet screenshots | optional | not planned |

Suggested screenshots, in order, from the ones already captured:

1. The obituary death screen, which is the thing that makes the game
   different from every other title in the category
2. The will screen, showing shares and specific bequests
3. School subjects, showing what a grade opens and closes
4. The court, at the plea
5. The investments screen with the spread meter

Per `LEGAL.md`: the layout must not imitate a competitor's screenshot
style, and no competitor may be named in the copy.

---

## Content rating questionnaire (IARC)

Measured against 533 events and 14 crime types on 2026-09-30. Answer
honestly; a wrong answer here is a policy violation, not a marketing
choice.

| Question | Answer | Why |
|---|---|---|
| Violence, realistic | **No** | Fights occur in text and resolve into stat changes. No depiction. |
| Violence, cartoon or fantasy | No | Not depicted at all. |
| Blood or gore | No | Never described. |
| Sexual content or nudity | **No** | Relationships are named, not described. One event references an affair being discovered. |
| Crude humour | No | The tone is deliberately plain. |
| Profanity | **No** | Zero occurrences across 533 events. Verified by scan. |
| References to illegal drugs | **Yes** | "Deal Drugs" is one of 14 committable crimes, and "Hard drugs" is an acquirable habit with a tracked level. |
| References to alcohol or tobacco | **Yes** | Both are acquirable habits with tracked levels and health consequences. |
| **Simulated gambling** | **Yes** | Gambling is an acquirable habit with a level, and appears in 21 events. **No real money is involved and nothing can be purchased with winnings.** |
| Real gambling | **No** | No wagering of real money or anything of value. |
| Ability to purchase items | **Not yet** | Purchase screens exist but are **simulated**; no billing is wired. Re-answer as Yes when billing ships. |
| User interaction or content sharing | **No** | No accounts, no chat, no user-generated content, no leaderboards. |
| Shares location | **No** | The in-game country is a setting, not the device location. |
| Digital purchases | **Not yet** | As above. |

**Expected outcome:** PEGI 16 / ESRB Teen or Mature / USK 16, driven mainly
by the drug references and the simulated gambling. Do not attempt to argue
it down. The roadmap already expects 16+.

**Target audience:** 16 and over. Do **not** opt into Play Families.

---

## Declarations

- **Ads:** No. There is no ad network in the build. The "watch an ad"
  Second Chance is a simulated placeholder that contacts nothing. If a real
  network is added, this answer and `PRIVACY.md` both change.
- **In-app purchases:** No, in this version. Simulated only.
- **Data safety:** see `PLAY_DATA_SAFETY.md`.
- **News app:** No. **Government app:** No. **COVID app:** No.
- **Financial features:** No. The investment system is fiction and
  `TERMS.md` section 2 says so explicitly.

---

## Before submitting

- [ ] Real contact inbox, in three files: here, `PRIVACY.md`, `TERMS.md`
- [ ] `PRIVACY.md` hosted at a public URL
- [ ] Feature graphic produced
- [ ] Screenshots exported at store resolution
- [ ] Signing key generated and stored, per `BUILD-APK.md`
- [ ] A build named by the owner, dispatched, and uploaded to internal
      testing before anything else
