# Bequest Admin Console

`pwa/admin/`. A separate page, never shipped inside the app.

Built to the shape of Football-Legend's console: a passphrase gate, a
sidebar, a `PAGES` object, cards and tables. What sits behind it is
different, because Bequest has no Supabase and no accounts.
Football-Legend administers a player base; this administers a device.

## Opening it

Serve `pwa/` and visit `/admin/`:

    npm run serve          # then http://localhost:8080/admin/

It must be the **same origin as the game**, because it reads and writes the
same `localStorage`. Opening the file directly from disk shows an empty
console: that is a different origin and a different storage jar, not a bug.

First open sets the passphrase. It is stored as a hash on that device.

## What it does

| Page | What it administers |
|---|---|
| Overview | Lives, Legacy Points, saves in use, achievements, eggs, reports. Warns if the developer build flag is on |
| Saves | Inspect any slot, edit any field by path (`money`, `stats.health`), dump the raw JSON, flag, delete |
| Grants | Add or set Legacy Points, switch Plus on or off for paywall testing, unlock an achievement, egg or perk by id |
| Codes | Mint and verify redeem codes the game can check with no server |
| Events | Force any event to fire on the next AGE UP, bypassing its requirements |
| Broadcast | Publish a note that appears at the top of the Life tab until dismissed |
| Problems | Read and delete the crash reports held on the device |
| Tools | Export everything as one file, import it back, connect remote mode, erase the device |

## Codes

`TYPE-VALUE-CHECK`, for example `LP-DW-OYQI`. Legacy Point amounts are
written in base 36, so 500 is `DW`. The game verifies the check digits
offline and records every redemption so a code pays out once.

**A code can never grant Bequest Plus.** Plus is bought with money, so it is
not a grant type, and a test asserts it never becomes one.

**The secret lives in the app bundle.** Anyone who unpacks the APK can read
it and mint their own codes. That is unavoidable for an offline game, and it
is exactly why codes grant points, perks and eggs and nothing that costs
money to produce.

## Remote mode

Every page is written against a small adapter. `DeviceStore` talks to
localStorage. `CloudStore` talks to the same `/cloud/:code` endpoint the
game's sync already uses. The moment a real server exists the console
administers it with no page changes. Until then remote mode is inert and
says so when you try it.

If it is ever pointed at a real server, **that server does its own
authorisation and trusts nothing this page sends**. The passphrase here is a
speed bump on hardware the owner already holds, not an authorisation
boundary.

## Guarded by tests

- a code minted by the console is one the game accepts, checked across six
  shapes, because the algorithm exists in two files that can drift
- a tampered or invented code is refused
- no code grants Plus
- a code pays out once
- the console and the game agree on the storage key names
- the passphrase is hashed, never stored as itself
- the console never appears in the built game bundle, paired with a positive
  check that the in-game half does
