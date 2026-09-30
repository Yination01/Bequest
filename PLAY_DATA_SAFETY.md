# Play Data safety draft for Bequest

Fill this into Play Console when a Play account exists. Keep it honest.
Last updated: 2026-09-30.

**There is no Bequest server.** Answers below assume local-only processing.
The optional cloud sync sends to an address the player types, which is a
third party we neither run nor can see. If a first-party host is ever
named, rewrite this file before the store listing goes live.

## Data collected

| Type | Collected | Shared with others | On device only | Why |
|---|---|---|---|---|
| Personal info (name, email, address) | No | No | n/a | No accounts. The game never asks. |
| Financial info | No | No | n/a | Purchases are simulated in this version. |
| Location | No | No | n/a | The in-game country is a setting, not your location. |
| Contacts, photos, messages, audio, files | No | No | n/a | Not requested. |
| App activity (in-game progress) | Yes | No | Yes | Saves, achievements, records. Needed to play. |
| Diagnostics (error reports) | Yes | No | Yes | Up to twelve on-device reports. Never transmitted in this version. |
| Device or other IDs | No | No | n/a | No advertising ID, no device fingerprint. |

## Cloud sync, declared honestly

The optional sync feature transmits the player's saves to **a server
address the player enters themselves**. Declare this as user-initiated
transfer to a third party chosen by the user, not as collection by us.
It is off unless the player turns it on and types an address.

## Security

- Data in transit: not applicable to Bequest servers, because there are
  none. Cloud sync uses whatever transport the player's chosen server
  offers.
- Users can delete save slots in game, delete all problem reports in game,
  and erase everything by clearing app storage or uninstalling.
- Independent security review: no.

## Declarations to tick

- Data is not sold.
- Data is not used for advertising. There is no ad network in the build.
- Data is not used for fraud prevention on a server, because there is no
  server.
- Committed to Play Families Policy: **no**. Crime, alcohol, drugs and
  gambling appear as life events. Not a kids app.

## Permissions

- `VIBRATE`, for haptic feedback. Toggleable in game under Sound and feel.
- Nothing else. No location, no storage, no network permission is needed
  for normal play; the network is only touched if the player turns cloud
  sync on.

## Before this goes live

- [ ] Name a real legal contact inbox and replace the placeholder in
      `PRIVACY.md` and `TERMS.md`.
- [ ] Re-check this file if real billing or real ads are added; both are
      simulated today and both change these answers.
- [ ] Re-check if a crash destination is chosen; diagnostics would then
      become transmitted data.
