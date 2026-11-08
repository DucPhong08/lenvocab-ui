# Learning animations

`celebration-confetti.json` is an original vector animation authored for LenVocab: 1.4 seconds at 30 fps, 18 small paper pieces and a star. It contains no raster images, fonts, scripts, remote URLs or third-party artwork. Layers `Primary`, `Accent`, `Highlight`, `Badge`, `Star` map to theme colors in QuizScreen.

The shared LottieAnimation component plays once per mount, pauses in the background, and provides a static fallback for disabled effects, Reduce Motion, completion or render errors. Jest uses the manual native-view mock; lifecycle behavior is tested separately.
