# Welcome page hero video

`welcome-placeholder.mp4` is the autoplay background video for the `/welcome`
page's Hero section (full-bleed, 1920x1080, muted, looping).

To swap in real gameplay footage later: replace this file (keep the filename
`welcome-placeholder.mp4`), or change the `src` in
`client/src/pages/Player/Welcome/sub-components/HeroSection.jsx` if you want a
different filename.

> Current file is ~64MB — consider compressing (H.264, target <10MB) before
> shipping to production. A 1920x1080 autoplay video this large will hurt
> load time, especially on mobile data.
