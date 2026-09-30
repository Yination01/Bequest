# Localisation

The roadmap asked for this to be planned "before the library reaches 500
events". It reached 533 first, so the measurement matters more than the
plan did:

| | strings | words |
|---|---|---|
| event text | 775 | 10,467 |
| event choices | 1,298 | 5,295 |
| event titles | 528 | 2,008 |
| everything else | 596 | 1,673 |
| **total** | **3,197** | **19,443** |

**91% of the bill is the event library.** At trade rates of about $0.10 a
word that is roughly **$1,900 a language**, or **$9,700 for five**. Adding
events raises it; this figure is dated 2026-09-30 and should be re-run
before any translation is commissioned.

    node tools/extract-strings.js            re-measure
    node tools/extract-strings.js --write    regenerate locales/en.json

## How it works, and why there are no t('some.key') calls

The catalogue is keyed by a **hash of the English string**. The content
files are untouched: no ids invented for 3,197 strings, no calls threaded
through prose that was tuned line by line, and no possibility of an id
pointing at a translation of a sentence that no longer exists.

A translator receives `locales/en.json`, which is English to English, and
returns the same file with the right-hand side changed. That is the whole
handover.

Two chokepoints do all the work:

- **`tok()`** translates before it substitutes, so every event title, every
  phrasing and every choice label is covered by one line.
- **`localiseData()`** rewrites the data tables once when a locale is set:
  jobs, crimes, items, skills, conditions, degrees, subjects and the rest.

**The honest cost of this design:** editing an English string changes its
key, so its translation is orphaned and falls back to the new English until
somebody retranslates it. That is the correct failure. The alternative is a
stable id quietly serving a translation of something you no longer say.

## Adding a language

1. `node tools/extract-strings.js --write`
2. Send `locales/en.json` out. Tell the translator to leave `{child}`,
   `{partner}`, `{city}` and the rest exactly as they are, and that they
   may move them within a sentence.
3. Save the result as `locales/<code>.json`.
4. `setLocale('<code>', theJson)`.

Nothing else changes. A key with no entry falls back to English, so a
half-finished translation is a half-translated game rather than a broken
one. `trackMissing(true)` then `missingStrings()` lists what is still owed.

## Testing a language before you have one

`pseudoLocale(strings)` builds a fake locale that accents every letter and
pads every string, leaving `{tokens}` alone. It answers the two questions a
real translation would:

- **Did this string actually go through the catalogue?** An unaccented word
  on screen has bypassed it.
- **Does the layout survive a longer language?** The padding is the cheap
  way to find a button that only fits because English is short.

Seven tests cover the pipeline, including one that recomputes the hash from
`tools/extract-strings.js` and fails if the tool and the game ever disagree
about how a string is keyed. That drift would make every lookup miss and
leave the game silently English.

## Not covered yet

The UI chrome written directly into template literals in `game.js`, such as
button captions and card headings, is not in the catalogue. It is a few
hundred short strings. The event library, which is the expensive part and
the part a player actually reads, is done.
