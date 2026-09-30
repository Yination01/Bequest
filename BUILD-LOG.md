# Build log

## 1.0 debug, 2026-09-30

`app-debug.apk`, 4.0 MB, `app.bequest.game`, versionCode 1, versionName 1.0,
minSdk 22, targetSdk 34, label "Bequest".

Copied to `Bequest-1.0-debug.apk` in the repository root so it survives
outside `android/app/build/`.

### Signed with a throwaway key

    Owner: C=US, O=Android, CN=Android Debug

This is the debug keystore Gradle generates on the spot. **No future build
will be able to upgrade this one**, and it cannot upgrade anything. It is
fine for sideloading onto a phone to play, and useless for anything else.

`BUILD-APK.md` has the `keytool` command for a stable key. Until one exists
and is kept somewhere safe, every APK from this project is a one-off.

### What is inside it

Nine web assets and nothing else:

    index.html            784,493 bytes   the whole game, inlined
    manifest.webmanifest      634
    sw.js                   1,443
    icons/                  4 files
    cordova.js, cordova_plugins.js        0 bytes, Capacitor's own

No admin console, no module source, no build scripts. That is the `dist/`
change from earlier today doing its job: before it, `webDir` pointed at
`pwa/` and all three would have shipped.

### Toolchain used

Not present in the sandbox at the start, and it will not persist:

- Temurin JDK 17 (the repo had Java 11; Capacitor 6 needs 17)
- Android SDK command-line tools, platform-tools, platform 34,
  build-tools 34.0.0
- Gradle 8.2.1, fetched by the wrapper

Roughly 2 GB. Anyone repeating this needs the same, or a CI runner that
already has it.

### Not verified

Nothing here has been run on a physical device or an emulator. The APK is
well-formed, correctly signed for debug, and contains the right assets. That
it installs and plays is untested.
