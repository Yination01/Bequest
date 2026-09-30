# Launch checklist, things only you can do

Everything in the code is done or explicitly deferred. The items below need
a console, a key, a decision, or money, so they cannot be automated.
Ordered by what blocks what.

Two dedicated documents sit under this one: `PLAY_LISTING.md` is every
Console field ready to paste, including the measured content-rating
answers. `PLAY_DATA_SAFETY.md` is the data declaration.

---

## 1. Name a legal contact inbox

Three files carry `legal-contact-placeholder@example.com` and will fail
review with it in place:

- `PRIVACY.md` sections 1 and 11
- `TERMS.md` header and section 10
- `PLAY_LISTING.md` contact email

Play requires a working address. It does not need to be personal; a
forwarding alias is fine.

## 2. Host the privacy policy at a public URL

Play will not accept a file in a repository. GitHub Pages on this repo is
enough and costs nothing. The URL then goes in the Console and in
`PLAY_LISTING.md`.

## 3. Decide the name, finally

`LEGAL.md` recorded a confirmed conflict and recommended a rename. **That
rename already happened**: the game was Lifespan and is now Bequest. The
document was never updated and still reads as though the conflict is live.

Re-checked on 2026-09-30: no app or game called Bequest was found in the
simulation category on either store. The remaining problem is **not legal,
it is discoverability**. "Bequest" is a common legal term and a search for
it returns estate-planning articles.

**Recommendation:** keep Bequest, and always ship it as
`Bequest: Life Simulator` so the genre is in the indexed name.
`PLAY_LISTING.md` assumes this.

## 4. Generate and store the signing key

`BUILD-APK.md` has the `keytool` command. `.gitignore` already blocks
`*.keystore`, `*.jks`, `keystore.properties`, `local.properties` and
`*.env`, so the repo cannot swallow it by accident.

Without a stable key, no build can ever upgrade another. Do this before the
first upload, not after.

Keep it somewhere that survives losing the laptop.

## 5. Decide what happens to cloud saves

Roadmap item 19 says Firebase. **Football-Legend already has a working,
validated sync** at `game/supabase/functions/sync-save/` with an anti-cheat
gate in `_shared/validate.ts`. Two vendors for one job is worse than one.

**Recommendation:** reuse the Supabase pattern rather than standing up
Firebase, unless Firebase is wanted for something else as well.

Until a host exists, the shipped sync posts to an address the player types.
That is now honestly described in the app, in `PRIVACY.md` section 3 and in
`TERMS.md` section 4, and the client refuses malformed replies and will
never restore Bequest Plus from one.

## 6. Decide whether v1 sells anything

The Plus screens and the Second Chance advert are **simulated**. Nothing is
charged and no ad network is contacted.

Shipping as-is is coherent and keeps the data declaration trivial. Shipping
with billing means Play Billing, a real ads answer, and a rewrite of
`PRIVACY.md` section 6, `TERMS.md` section 5 and two rows of
`PLAY_LISTING.md`.

**Recommendation:** ship v1 free with no billing and no ads. Add billing
once there are installs worth converting.

## 7. Choose a crash destination, or keep it local

Capture is built. Reports sit in a twelve-deep ring buffer on the device
and go nowhere; the opt-in that would allow sending defaults to off and
currently says there is nowhere to send them.

`crashSink()` is the single function a destination plugs into. If Sentry is
chosen, source maps matter: the bundle is one inlined file, so a stack
trace currently points at `index.html:4211` rather than at a module.

## 8. Produce the store graphics

Feature graphic 1024 x 500 does not exist. Screenshots exist as development
captures in `shots/` and need exporting at store resolution.
`PLAY_LISTING.md` names the five to use and the order.

## 9. There is no admin panel, and there should not be one

Football-Legend and Poise both have one. Football-Legend's signs in against
Supabase and can search players, inspect a uid, gift, ban, create events,
generate redeem codes, broadcast, and close a season.

**None of that has a subject in Bequest.** No server, no accounts, no uids,
no seasons, no live ops. An admin panel here would mean inventing the
backend the product deliberately does not have, which `.agent/agent-pack.json`
explicitly warns against.

What Bequest needed instead was the opposite: the developer surface it
already had was **shipping to players**. `META.premium.protoUnlocked` was
written at load and read nowhere, so a card headed "Prototype controls",
containing a button labelled **Switch Plus on**, rendered for everybody. It
is now off by default, only enabled by setting `bequest.dev` to `1` in
localStorage, and `togglePlus()` refuses to fire outside a developer build
rather than merely being hidden.

If a QA build ever needs more than that, the honest form is a local debug
panel behind the same flag: jump to an age, force an event, set a stat.
That is a developer tool, not an admin panel, and it never leaves the phone.

## 10. Then, and only then, name a build

Per `CLAUDE.md` hard rule 1, no build is ever started that you have not
named in your own message. When items 1, 2 and 4 are done, say the build
and it will be dispatched, uploaded to internal testing first.

---

## Not blocking, but worth deciding

- ~~**Accessibility.**~~ Done. The bundle now carries a real tablist with
  arrow-key navigation, `role="switch"` on every toggle, a proper dialog
  with focus return and Escape, a polite live region, a focus ring distinct
  from the selected state, and 44px minimum tap targets. Five tests hold it.
- **The no-dash rule.** The house pack forbids em and en dashes. This repo
  has roughly 791 and six were in its first commit, so it predates the
  rule. Recorded as a known divergence in `.agent/agent-pack.json`.
