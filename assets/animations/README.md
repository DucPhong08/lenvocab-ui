# Learning animations

`celebration-confetti.json` is an original vector animation authored for LenVocab: 1.4 seconds at 30 fps, 18 small paper pieces and a star. It contains no raster images, fonts, scripts, remote URLs or third-party artwork. Layers `Primary`, `Accent`, `Highlight`, `Badge`, `Star` map to theme colors in QuizScreen.

`scan-radar.json` is a lightweight (3.8 KB) vector radar animation designed for the camera scanning viewfinder (CameraScreen and OfflineScanScreen). It features expanding sonar pulse rings, a 360-degree rotating sweep line, and a pulsing center target reticle styled with LenVocab's brand colors (#5A35C5 and #EDE7FF).

The shared LottieAnimation component plays once per mount (or loops when configured), pauses in the background, and provides a static fallback for disabled effects, Reduce Motion, completion or render errors. Jest uses the manual native-view mock; lifecycle behavior is tested separately.
