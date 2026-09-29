# Building the Android APK

The game is a **single self-contained HTML file** with no network calls, so it wraps
into a native app cleanly. Nothing in `pwa/` needs rewriting.

## Route A — Capacitor (recommended)

Produces a real installable APK/AAB you can put on Google Play. It ships a WebView
that loads the bundle from local assets, so the app works entirely offline.

### One-off setup

    npm install
    npm run build          # inlines everything into pwa/index.html
    npx cap add android    # creates the android/ project

### Every build

    npm run apk:debug      # android/app/build/outputs/apk/debug/app-debug.apk
    npm run apk:release    # an .aab for the Play Store

### Requirements
- **JDK 17** — Android Gradle Plugin 8 rejects JDK 11
- Android SDK, platform 34, build-tools 34
- ~4 GB RAM for Gradle. On a constrained machine add to `android/gradle.properties`:

      org.gradle.jvmargs=-Xmx1536m
      org.gradle.daemon=false
      org.gradle.parallel=false

## Route B — GitHub Actions (no local toolchain)

`.github/workflows/android.yml` is ready. Push to `main`, or run it manually, and
download the `bequest-debug-apk` artifact. The workflow **runs the full test
suite and the state audit first and refuses to build if either fails.**

This is the reliable path if your machine cannot host the Android toolchain.

## Route C — Trusted Web Activity

Thinnest possible wrapper, but requires the game to be hosted on HTTPS and a
`.well-known/assetlinks.json` on that domain. Use `bubblewrap init`. Chosen only
if you want the app to auto-update without store releases.

## Before you publish

1. **Signing.** Generate an upload keystore and add it to `android/app/build.gradle`.
   Never commit the keystore or its passwords; use GitHub Secrets in CI.
2. **Application ID** is `app.bequest.game`. It cannot be changed after release.
3. **Icons and splash.** Source art is in `assets/`. Generate the density buckets with
   `npx @capacitor/assets generate --android`.
4. **Billing.** The purchase flow in `viewPlus()` is simulated. Wire it to Google Play
   Billing and keep the Plus feature gates exactly as they are — the test
   *"no content is ever locked behind payment"* must continue to pass.
5. **Cloud saves.** The prototype syncs to the local endpoint in `serve.py`. Swap in
   Firebase (anonymous auth, optional Google linking) per `DECISIONS.md`.
6. **Content rating.** The game includes crime, alcohol, drug references and gambling.
   Expect a 16+ rating; declare these honestly in the Play console questionnaire.
7. **Name.** `LEGAL.md` records why this is called Bequest and not Lifespan. Search
   the registers once more immediately before submission.

## What a release must satisfy

    node pwa/tests/suite.js     # 108 tests, must be green
    node research/audit.js      # must report no impossible states
