# Testimonial avatars

Drop real player photos here, named exactly:

```
reviewer-1.jpg
reviewer-2.jpg
reviewer-3.jpg
reviewer-4.jpg
reviewer-5.jpg
reviewer-6.jpg
```

(The order matches `TESTIMONIALS` in `src/pages/Player/Welcome/service/welcomeContent.service.js`.)

Served as static files from `/avatars/reviewer-N.jpg` — no code change needed, no rebuild
required beyond adding the files. Until a file is added, `TestimonialsMarquee.jsx` falls
back to a placeholder person icon (the `<img>`'s `onError` handler), so a missing photo
never shows a broken-image icon.
