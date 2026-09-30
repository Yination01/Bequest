# What Bequest is missing that its sibling repositories already have

A pass over the other twelve repositories on the account, looking for things
Bequest lacks. Three of them — **Zero-Lag**, **Poise** and **Study-Hub** —
share a convention set that Bequest never received, and two of them have
already solved problems still sitting open on Bequest's own roadmap.

Ranked by what it would cost to be wrong about each.

---

## 1. The cloud sync can hand out the paid tier. *(serious)*

`pwa/game.js`, `cloudPull()`:

```js
fetch((CLOUD.url||'') + '/cloud/' + encodeURIComponent(CLOUD.code))
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(d => { if(!d.slots) throw 0;
    Object.keys(d.slots).forEach(k => localStorage.setItem(slotKey(k), JSON.stringify(d.slots[k])));
    if(d.meta){ META = d.meta; saveMeta(); }
```

Three problems stacked on each other:

- **`CLOUD.url` is typed by the player.** The save — a whole life — is `PUT`
  to any host they name.
- **The response is not validated at all.** Whatever JSON comes back is
  written straight into save slots.
- **`META = d.meta` replaces the entire metadata object**, and `META.premium`
  is where the Plus entitlement lives (`isPlus()` reads
  `META.premium.plus || META.premium.lifetime`). Point the sync URL at a
  server you control, return `{slots:{},meta:{premium:{lifetime:true}}}`,
  and you have the paid tier for nothing. It also erases every achievement,
  Legacy Point and record in one line if the response is merely malformed.

The sync code is the only identifier, so it is also a textbook IDOR: guess
somebody's code and you have their saves.

**Football-Legend has already solved this.** It has real Supabase edge
functions — `game/supabase/functions/sync-save/index.ts`,
`redeem-code/index.ts`, and `_shared/validate.ts`, whose first line reads:

> `// Server-side save validation — the anti-cheat gate.`
> `// A save that fails hard checks is REJECTED (not stored) and the player is flagged.`

It range-checks every stat, caps currency against seasons played, and refuses
impossible states. Bequest's roadmap item 19 says Firebase cloud saves are
"decided, not built" and the prototype "syncs to a sandbox server that will
not exist" — but the sandbox client is shipping *now*, wired to `save()`, and
item 18 (Play Billing) is going to sit directly on top of the entitlement
this can overwrite.

**Recommendation:** before Play Billing, either port Football-Legend's
validate-then-store pattern, or disable `cloudPull`'s `META` overwrite and
merge only `slots` after a shape check. The second is ten minutes.

---

## 2. There is no privacy policy, no terms, and no data-safety draft.

`LEGAL.md` exists but is about something else entirely — originality, trade
dress, and a confirmed name conflict. It is not a privacy policy.

**Zero-Lag has all three**, and they are good:

| File | What it is |
|---|---|
| `PRIVACY.md` | Written against **Nigeria's NDPR**, names the controller, uses an explicit placeholder for the unnamed legal inbox rather than inventing one |
| `TERMS.md` | — |
| `PLAY_DATA_SAFETY.md` | A filled-in table of exactly what Play Console asks for, with the honest note: *"There is no live host… If a host is named, rewrite this file before the store listing goes live."* |

That covers roadmap items **20** and most of **21**, in the right voice, for
the right jurisdiction. Bequest's answers are simpler than Zero-Lag's (no
permissions, no location, no accounts), so adapting them is mostly deletion.

One thing to carry across carefully: Bequest now has a crash log, so the
honest answer to "diagnostics" is *collected, on device only, never sent*.

---

## 3. The house quality bar is not in this repository.

`.agent/quality-bar.json` — **181 items across seven categories** — is in
Zero-Lag, Poise and Study-Hub. It is not in Bequest.

| category | items |
|---|---|
| ui_ux_and_branding | 93 |
| security_and_trust | 43 |
| performance_and_build | 14 |
| technical_seo_and_metadata | 13 |
| pre_build_documentation_and_planning | 9 |
| accessibility_and_semantics | 7 |
| ai_discoverability | 2 |

It describes itself as *"Quality bar, not a backlog. Apply the item that fits
the current task."* Work has been going into Bequest against an inferred
standard while an explicit one sat next door.

**Bequest already violates at least one of its own rules, and I added it last
turn.** The bar says:

> *No backend details in user-facing errors: Friendly message client-side;
> full details (stack traces, connection strings, internal hosts) logged
> server-side only; exposure is a UX fail and a security vulnerability.*

The "Something went wrong" screen prints the raw stack trace into the sheet.
**Fixed in this pass** — the screen now shows a plain-English summary and the
technical detail only travels via the Copy button.

Two more the bar asks for that are worth a real pass (roadmap item 27 already
anticipates this):

- *"Accessible switches: Space toggles, visible focus ring, aria-checked
  state announced to screen readers."*
- *"Full keyboard support for tabs: Arrows navigate, Home/End jump first and
  last, Tab exits the tablist."*

Measured on the built bundle: `lang="en"` ✓, exactly one `<h1>` ✓, every
`<img>` has alt text ✓, `meta description` and `theme-color` ✓ — but the
whole 733 KB bundle contains **one `aria-` attribute and three `role=`
attributes**, for an app with a five-item tab bar, three toggle switches and
a modal sheet system. Nothing is labelled for a screen reader.

---

## 4. Bequest has none of the AI-collaboration files the others use.

Every other active repository carries some or all of `AGENTS.md`,
`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, and the
`.agent/` pack (`agent-pack.json`, `master-skills.json`, `quality-bar.json`).

| repo | AGENTS | CLAUDE | GEMINI | copilot | .agent/ |
|---|---|---|---|---|---|
| Zero-Lag | ✓ | ✓ | ✓ | ✓ | ✓ |
| Poise | ✓ | ✓ | ✓ | ✓ | ✓ |
| Study-Hub | ✓ | ✓ | ✓ | ✓ | ✓ |
| Football-Legend | ✓ | ✓ | — | — | — |
| **Bequest** | — | — | — | — | — |

The quality bar notes that `CLAUDE.md` is the tie-breaker: *"CLAUDE.md wins on
secrets, a11y, budget zero, and never starting an APK unless the user names
the build."* That last clause is a standing instruction this repository has no
copy of.

---

## 5. Missing release scaffolding that P3 is going to need anyway.

| Bequest needs (P3) | Already written elsewhere |
|---|---|
| 17–23, the whole launch list | `Poise/LAUNCH_CHECKLIST.md`, `Football-Legend/docs/V14-RELEASE-CHECKLIST.md` |
| device verification | `Zero-Lag/docs/DEVICE_TEST_PLAN.md` |
| 20, privacy | `Zero-Lag/PRIVACY.md`, `PLAY_DATA_SAFETY.md`, `COMPLIANCE.md` |
| build documentation | `Football-Legend/BUILD_TIME.md`, `Zero-Lag/BUILD.md` |
| repo hygiene | `CONTRIBUTING.md`, `COPYRIGHT.md`, `DEPENDABOT.md`, `SITEMAP.md` |

Bequest has `BUILD-APK.md` and that is all of it.

---

## What I would actually do, in order

1. **Close the entitlement hole** — ten minutes, and it blocks Play Billing.
2. **Copy the `.agent/` pack in** so the standard is in the repo rather than
   in my head.
3. **Adapt Zero-Lag's three legal documents.** Bequest's answers are simpler;
   this is mostly deletion, and it clears two roadmap items.
4. **Then P3 proper**, against Poise's launch checklist rather than a new one.

The accessibility pass (item 27) is the largest remaining piece of real work
that the bar demands and the roadmap currently has parked in P4. Given the
bar calls accessibility *"a compliance requirement… a legal liability"*, P4
may be the wrong place for it.
