# Welcome page hero video

`welcome-placeholder.mp4` is the autoplay background video for the `/welcome`
page's Hero section (full-bleed, muted, looping, shown blurred behind the title).

The current file is a compressed copy of the original 1920x1080 / 64 MB recording:
854x480, 24 fps, H.264, no audio, ~0.35 MB. It sits behind a blur and a gradient,
so the lower resolution is not visible. `welcome-poster.webp` (~16 KB) is shown
before the video plays, and is all that visitors with reduced-motion or data-saver
settings download.

To swap in real footage later: keep the filename `welcome-placeholder.mp4` (or change
the `src` in `client/src/pages/Player/Welcome/sub-components/HeroSection.jsx`) and keep it
small. Re-encode with, for example:

    ffmpeg -i source.mp4 -an -vf "scale=854:-2,fps=24" -c:v libx264 -preset slow -crf 34 \
      -pix_fmt yuv420p -movflags +faststart welcome-placeholder.mp4

Anything over ~5 MB will slow the welcome page on mobile data.
