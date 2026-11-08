# Quiz animation and account effects

## Behavior

- Quiz completion plays an original 1.4-second vector celebration once. It does not delay results, block buttons, change scores, or change the 10-word session and existing context question.
- A shared `LottieAnimation` component pauses while the app is inactive/backgrounded, resumes an unfinished animation, and never replays a finished one on foregrounding. Disabled effects, OS Reduce Motion, render failure, and completion use a static fallback.
- `useReduceMotion` reacts to setting changes immediately and guards against a late initial read overwriting a newer event. Unknown/unavailable accessibility state defaults to reduced motion.
- Quiz correct/wrong/completion sounds and flashcard flips use `useSoundEffects`. It stops the current sound on unmount, backgrounding, or muting. Vocabulary speech remains separate and retains its own speed preference.
- Screen transition and programmatic scroll animations also honor the animation preference and OS Reduce Motion. No new live-camera animation, streak, or empty-state animation is added.

## Account settings

Backend `UserPreferences` adds `animations_enabled` and `sound_effects_enabled`, both defaulting to `true` for existing accounts. `PATCH /users/me/preferences` accepts JSON booleans only and continues applying existing tier validation. `/auth/me` and preferences responses include both values. Existing documents receive model defaults on read; no destructive migration is needed.

Profile has two switches using the existing preference update flow. Switching requires a connection; the last synced values remain in the per-session offline snapshot. Old servers without these fields show a disabled control and an update message instead of pretending to save an unsupported preference. Guest sessions keep the default behavior.

System Reduce Motion overrides an enabled animation preference. Battery-saver detection is not implemented; no extra battery/native dependency was added.

## Dependencies and assets

- Exact npm version: `lottie-react-native@7.5.0` (Apache-2.0). Its declared peers are React >=19.2 and React Native >=0.84; the project uses 19.2.3 / 0.87.1. Installation added one npm package and did not upgrade other packages.
- Native dependencies declared by that package: Android `com.airbnb.android:lottie:6.7.1`, iOS `lottie-ios:4.6.0` (iOS deployment target >=15.1).
- `assets/animations/celebration-confetti.json`: original LenVocab vector artwork, 17,413 bytes. No downloaded artwork, raster image, remote URL, embedded script, font, Skia, Reanimated, or navigation package.
- Android bundle inputs now include JSON and assets. The RN Gradle task otherwise tracks JS/TS only and can reuse a stale bundle after an asset-only edit.
- Named layers map to current theme colors. Lottie paints earlier root layers above later ones; the star must appear before the opaque badge in the layer array.
- OSV queries for the exact npm and Android Lottie packages returned no advisory IDs on 2026-11-08. This is not a guarantee that all transitive dependencies are vulnerability-free.
- Jest maps Lottie explicitly to a native-view mock. Separate tests exercise commands, lifecycle, setting changes and render failures; this does not substitute for native rendering checks.

## Build and checks

```sh
npm ci
cd android
ANDROID_HOME=/path/to/Android/Sdk ./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64 --no-daemon
```

The standard build retains the existing default of `offlineScan=false`; the optional TFLite experiment still uses `-PofflineScan=true` as documented separately.

On macOS, install/update CocoaPods using the project's existing iOS setup, then build the native app. iOS Pods/build and physical Android testing were not run in this Linux environment. A JavaScript-only refresh cannot add the native Lottie dependency to an old binary.

Verified: 204 UI tests across 32 suites (including authentication regressions), TypeScript and full-project ESLint; 44 backend tests covering preferences, tier rules, auth and compatibility; release build for ARM64/x86_64. Native UI verification uses a standalone release APK on an offline Android API 34 emulator, with no Metro or API fixture server.

Native check on 2026-11-08: the final APK bundled exactly the current animation JSON. On an offline API 34 emulator, a full guest round (10 words plus the existing context question) reached 11/11; the star and confetti rendered above the badge, then returned to the static fallback. Background/foreground preserved the completed score; lifecycle tests verify that a finished effect is not replayed. Screenshots and a recording were captured from this APK. The emulator used no audio, so audible playback was not verified. Account preference controls were verified by component/API tests, not a live signed-in device session. The original emulator animation settings were restored and the owned emulator stopped after checking.
