# Welcome Page — Implementation Plan

Issue: #201 (RMIT-Full-Stack-Development-2026A/Group1)
Branch: `feature/201-welcoming-page`

## Standing rule (added 07/10, Khanh): Content language = English only

All user-facing copy on this page (headings, body text, button labels, service
data strings) must be in English. No Vietnamese in the shipped UI. This
applies retroactively — the first pass had Vietnamese copy and was converted
after the fact (see `welcomeContent.service.js`).

## 0. Codebase facts this plan relies on (verified before writing this)

- Pages live at `src/pages/<Role>/<PageName>/` with `index.jsx`, `sub-components/`, `hook/`, `service/`. Mirror that for `src/pages/Player/Welcome/`.
- Routing: `src/routes/AppRouter.jsx` lazy-imports pages and wraps authenticated ones in `<ProtectedRoute>`. New route goes right after Guest pages, before `/profile`.
- `src/Layout.jsx` has `CONSTRAINED_ROUTES` (h-screen, no footer) and `IMMERSIVE_ROUTES` (no navbar). `/welcome` must **not** be added to either — it needs the default shell (`Navigation` + scrollable `<main className="flex-1 pt-16">` + `Footer`) so the 8-section scroll works.
- Two visual systems coexist in this codebase:
  - **Working system** (Landing page, actually renders): literal hex colors (`#0d0d1a` bg, `#4cc9f0` cyan, `#fad100` yellow, `#ffb780` orange, `#93e2ff` light blue, `#e3e0f4` text, `#3d484d` outline, `#1e1e2c`/`#1a1a28` card bg), `font-headline` (Press Start 2P) for headings, `font-body`/`font-mono` for body text, `.scanlines`, `.chunky-offset`, `.chunky-offset-active`, `.glow-cyan`, `.button-glow` from `index.css`/`styles.css`.
  - **Broken/unresolved system** (used in `GameModeCard.jsx` only): classes like `bg-surface`, `text-on-surface`, `primary-container` are **not defined anywhere** in `@theme` (index.css) or any stylesheet. They silently no-op.
  - **Decision: use the working hex + defined-token system everywhere in the new page.** Do not copy `bg-surface`/`primary-container`/etc.
- Theme card assets already exist at `client/src/assets/themes/{classic,block,neon}/` — use real files for the theme-preview cards in Section 5, not placeholders.
- `/play` (`GameModeSelect`) already has its own 3 cards for real mode selection, and Khanh explicitly does not want it touched or duplicated.
  - **Decision (confirmed with Khanh 06/10):** Section 3's mode cards on `/welcome` are a **pure visual preview**, not a functional shortcut. Clicking any of the 3 cards (or the section's own CTA) just does `navigate('/play')` — identical to the Hero's "PLAY NOW" button. No `useModeStore` writes, no `getGameModeRoute` lookups, zero changes to `GameModeSelect`/its hook/its service. The actual mode choice still happens on `/play`, same as today's flow (`/register` → `/login` → `/play`).
- No `videos/` folder exists yet anywhere in `client/`. Will create `client/public/videos/` (served as static, unprocessed by Vite — correct for a large placeholder file) and reference it as `/videos/welcome-placeholder.mp4` (absolute path from site root, works regardless of route).
- `framer-motion` (`^12.35.2`) is already a dependency — use it for staggered card entrance, matches issue requirement.
- No existing component does a count-up number animation, FAQ accordion, or marquee — all three are new, written from scratch with plain React state + CSS `transform`/`opacity` (per issue: animations must be CSS `transform`-based, not layout-shifting).

## 1. Folder structure to create

```
client/src/pages/Player/Welcome/
  index.jsx                          — page shell, composes all 8 sections, scroll-reveal wiring
  hook/
    useWelcome.hook.js                — mode-card click handler, reduced-motion flag, scroll-reveal observer hook
  service/
    welcomeContent.service.js         — static content data: marquee items, mode card copy, how-to-play steps, feature cards, team placeholder, history placeholder, FAQ items
  sub-components/
    HeroSection.jsx                    — video bg + title + tagline + 2 CTAs + mini playable board
    MiniBoardDemo.jsx                  — the small interactive 3x3 demo board (self-contained, no socket/AI service dependency)
    MarqueeBand.jsx                    — Section 2
    ModeSelectPreview.jsx              — Section 3, renders 3 ModePreviewCard
    ModePreviewCard.jsx                — single mode card (hover → mini sample match loop)
    HowToPlaySection.jsx               — Section 4, 3 steps with scroll-reveal
    FeatureGrid.jsx                    — Section 5, feature cards + team card + history card
    ChallengeCounter.jsx              — Section 6, count-up stat
    FaqAccordion.jsx                   — Section 7
    FinalCta.jsx                       — Section 8
    MagneticDock.jsx                   — fixed bottom-center section-jump dock with magnify-on-hover (mandatory, see §4.10)
    index.js                          — barrel export, matches existing convention (see Landing/sub-components/index.js)
  styles.css                          — scoped keyframes (marquee scroll, float, pulse-glow, diagonal-drift, glitch) + reduced-motion overrides

client/public/videos/
  welcome-placeholder.mp4             — empty/placeholder file (see step 3) — real footage swapped in later by Khanh
```

## 2. Routing & layout wiring (do this first, smallest diff, unblocks everything else)

1. `src/routes/AppRouter.jsx`:
   - Add `const WelcomePage = lazy(() => import("@/pages/Player/Welcome/index"));`
   - Add route: `<Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />` — place it right before the `/profile` route, under a `{/* Welcome / onboarding */}` comment, since it's the first authenticated stop.
2. `src/Layout.jsx`: **no change** — confirmed `/welcome` must stay out of `CONSTRAINED_ROUTES`/`IMMERSIVE_ROUTES` to get the default scrollable shell with navbar + footer.
3. Decide where `/welcome` is actually entered from: check `Login`'s post-login redirect and `RedirectAuthenticatedUser` in `AppRouter.jsx` (currently sends authenticated users to `/lobby` or `/admin`). **Out of scope for this issue** per the "Done When" wording ("Login → /welcome → /play flow works") — but flag to Khanh: nothing today actually redirects a fresh login to `/welcome` yet. This plan only builds the page and makes it reachable at the URL; wiring the post-login redirect to go through `/welcome` first is a one-line follow-up in `useAuthStore`/`Login` once this page exists (call it out in the PR description, don't silently expand scope).

## 3. Assets

1. Create `client/public/videos/` and drop in a placeholder `welcome-placeholder.mp4`. Since no real footage exists yet, use a tiny valid MP4 (e.g. 1–2s black frame or solid-color clip, <200KB) so the `<video>` tag has something real to load without a 404 — not a zero-byte file. Note the exact swap instructions in a `client/public/videos/README.md`: *"Replace welcome-placeholder.mp4 with real 1920x1080 gameplay footage. Keep the filename or update HeroSection.jsx's src."*
2. Section 5 theme-preview mini-cards reuse the existing files under `src/assets/themes/{classic,block,neon}/` — import them directly, confirm exact filenames with a quick `ls` before writing `HeroSection`/`FeatureGrid` import statements (did not enumerate files inside those subfolders yet — do this at implementation time, first step of Section 5 work).

## 4. Section-by-section build order (each is independently testable in isolation before wiring into `index.jsx`)

Build and visually check in this order — each depends only on what's before it:

1. **Routing shell** (section 2 above) — confirm `/welcome` renders an empty page with navbar+footer, no console errors.
2. **Section 1 — Hero**
   - `HeroSection.jsx`: full-bleed `<video autoPlay muted loop playsInline>` background (`/videos/welcome-placeholder.mp4`), dark overlay gradient for text legibility, `font-headline` title "TICTACTOANG", one-line tagline, two buttons: "PLAY NOW" (primary, filled, `#4cc9f0`) → `navigate('/play')`, "HOW TO PLAY" (outlined) → smooth-scrolls to `#how-to-play` (`document.getElementById('how-to-play').scrollIntoView({behavior: reduced-motion ? 'auto' : 'smooth'})`).
   - `MiniBoardDemo.jsx`: fixed 3x3 grid (not the real 10x10/15x15 board — issue explicitly says 3×3 for this demo). Local component state only: `board` (9 cells), `isPlayerTurn`. On cell click (only when player's turn and cell empty): place X, then after a short `setTimeout` place an O at a scripted/simple position (not real minimax — this is a decorative demo, not a real AI call), check 3-in-a-row, draw a line through the winning cells via an absolutely-positioned div rotated with `transform`, then after ~2s auto-reset the whole board. No socket, no backend call — fully self-contained so it can't break or depend on auth/session state.
   - Reduced motion: hero background video `autoPlay` stays (muted video loop is exempt from WCAG motion concerns per common practice, but still gate the *decorative* CSS animations on the overlay/text), and skip the win-line sweep transition (snap it in instead) when `prefers-reduced-motion: reduce`.
3. **Section 2 — Marquee**
   - `MarqueeBand.jsx`: single row, content duplicated twice back-to-back inside a flex container with `transform: translateX()` animated via CSS keyframe (`styles.css`: `@keyframes marquee-scroll`), `animation-play-state: paused` on `:hover`. Items: "3 CHẾ ĐỘ", "KHÔNG CẦN ĐĂNG KÝ", "CHƠI TRÊN ĐIỆN THOẠI", "MIỄN PHÍ" (pull from `welcomeContent.service.js`, not hardcoded in the component — matches the service/data separation convention elsewhere in the codebase, e.g. `GAME_MODES` in `gameModeSelect.service.js`).
   - `@media (prefers-reduced-motion: reduce)`: set `animation: none`, fall back to a static centered row (wrap instead of scroll).
4. **Section 3 — Mode selection preview (pure visual, confirmed with Khanh — see §0)**
   - `welcomeContent.service.js` exports `MODE_PREVIEWS`: 3 display-only entries (title + 1-line description) for AI / Local / Online. Independent of `gameModeSelect.service.js` — this is copy for a teaser card, not a functional mode table, so no import from/coupling to `GameModeSelect` at all.
   - `ModePreviewCard.jsx`: card with title + 1-line description; `onClick` is just `navigate('/play')` for all 3 cards (same destination regardless of which card — it's a teaser, not a shortcut). No `useModeStore`, no `gameModeSelect.service.js` import, no `GameModeSelect` changes.
   - Hover preview ("mini board diễn ván mẫu"): reuse `MiniBoardDemo` in a smaller, non-interactive "replay" mode — add a `interactive={false}` + `autoPlayScript` prop to `MiniBoardDemo` so Section 1 and Section 3 share one component instead of writing two board renderers. On hover (`onMouseEnter`), mount the demo with a fixed short scripted sequence; on `onMouseLeave`, unmount/reset.
5. **Section 4 — How to play**
   - `HowToPlaySection.jsx`, `id="how-to-play"` (Hero's secondary button target). 3 steps from `welcomeContent.service.js`. Each step wrapped in a small custom `useInView`-style hook (see step 6 below) that adds an `opacity-0 translate-y-4` → `opacity-100 translate-y-0` transition class when it scrolls into view. No new dependency — implement with `IntersectionObserver` directly (framer-motion's `whileInView` is an equally valid alternative already available via the existing dependency; **pick `framer-motion`'s `whileInView`** since it's already installed and gives reduced-motion-safe spring transitions for free, avoiding a hand-rolled `IntersectionObserver` hook entirely — simpler, less code).
6. **Section 5 — Feature grid (+ team + history, folded in per the updated issue)**
   - First sub-step: `ls client/src/assets/themes/classic client/src/assets/themes/block client/src/assets/themes/neon` to get real filenames before importing.
   - `FeatureGrid.jsx`: 3–4 feature cards (bigger board sizes, 3 themes with real preview thumbnails from the assets folder, AI difficulty levels) + 2 additional cards: **Team** (names/roles — placeholder text, clearly marked `TODO: replace with real roster` in a code comment) and **History** (3–4 milestone placeholders, same `TODO` convention). All cards `framer-motion` `whileInView` with staggered `transition={{ delay: index * 0.1 }}`.
7. **Section 6 — Challenge counter**
   - `ChallengeCounter.jsx`: count-up number via `framer-motion`'s `useMotionValue` + `animate()` from 0 to a target (placeholder number, e.g. `games_played` — **not** a real API call for this issue; mark clearly as placeholder data, same as the issue's own "placeholder if no data yet" note), triggered on `whileInView`. Respect reduced motion: if `prefers-reduced-motion`, render the final number immediately with no count animation.
8. **Section 7 — FAQ**
   - `FaqAccordion.jsx`: 4 Q&A pairs from `welcomeContent.service.js` (free? sign-up needed? rules? mobile-friendly?). Plain `useState<number|null>` for "which panel is open," `max-height` transition driven by measuring `scrollHeight` (standard pure-CSS accordion technique, no library) — consistent with "CSS transform/no new UI library" constraint in the issue (height isn't a `transform`, but there's no transform-only way to do an accordion; use `grid-template-rows: 0fr → 1fr` transition instead, which **is** GPU-friendly and avoids the `scrollHeight` JS measurement entirely — cleaner, pick this).
9. **Section 8 — Final CTA**
   - `FinalCta.jsx`: large blurred board graphic behind (reuse `MiniBoardDemo`'s static non-interactive render, scaled up, `filter: blur(...)`, `opacity-20`), "SẴN SÀNG CHƯA?" headline, final "PLAY NOW" button → `/play`. A handful of small marker shapes (reuse existing marker assets if present under `assets/`, else simple CSS squares) given a `translateY` falling animation via `framer-motion`, staggered, triggered once on `whileInView`.
10. **Magnetic Dock — MANDATORY (corrected 06/10, was marked optional in the original issue, Khanh confirmed it must ship)**
    - **`@componentry/magnetic-dock` does not exist** — verified against the npm registry (`npm view`/`npm search`, both 404/no match). Not installing it, and not substituting an unvetted random package found by a generic search (supply-chain risk for an unknown-author package). `npx shadcn@latest init` is skipped too since there is no real component to add through it.
    - **Decision:** build the magnetic hover effect from scratch with `framer-motion` (already a dependency) — this is a well-known, small pattern (Apple-dock-style magnification: each icon's scale driven by its distance from the cursor via `useMotionValue` + `onMouseMove`), roughly 40-60 lines, zero new dependencies, zero supply-chain exposure.
    - **Placement:** `MagneticDock.jsx` (new sub-component), fixed at the bottom-center of the viewport, visible on `/welcome` only. Icons = quick-jump links to each section (Hero `#top`, Modes `#modes`, How to Play `#how-to-play`, FAQ `#faq`, Final CTA `#cta`). Clicking an icon smooth-scrolls to that section's `id` (reuse the same scroll helper as Hero's "How to play" button).
    - **Magnify behavior:** on `onMouseMove` over the dock's container, compute each icon's horizontal distance from the cursor and map it to a `scale` (`1` at rest → up to `~1.6` directly under the cursor, falling off smoothly for neighbors) via `framer-motion`'s `useSpring`/`useTransform`. On `onMouseLeave`, spring every icon back to `scale: 1`.
    - **Touch devices:** detect via `window.matchMedia('(hover: none) and (pointer: coarse)')` (more reliable than UA-sniffing). When true, render the same icons at a fixed `scale: 1`, no mousemove listener attached at all — tap still navigates, just no magnification. Re-check on resize in case of a hybrid device (rare, but cheap to handle).
    - **Reduced motion:** the spring-back and magnify transitions both respect `useReducedMotion()` from `framer-motion` — when true, swap the spring for an instant snap (no animated scale at all, dock icons stay at `scale: 1` always, still clickable).

## 5. Wiring it together — `index.jsx`

- Compose all 9 pieces (Hero, Marquee, ModeSelectPreview, HowToPlay, FeatureGrid, ChallengeCounter, FaqAccordion, FinalCta) top to bottom, plain JSX, no internal routing.
- `useWelcome.hook.js` owns: `prefersReducedMotion` (via `window.matchMedia('(prefers-reduced-motion: reduce)')` + change listener), `handleModeSelect(id)` (the mode-card click logic described in step 4.4), and nothing else — keep it thin, most section logic stays local to each sub-component per the codebase's existing convention (e.g. `GameModeCard` has no shared hook, `GameModeSelect`'s hook only does page-level concerns).
- Pass `prefersReducedMotion` down only to the pieces that need a manual branch (Hero win-line, Marquee, ChallengeCounter); `framer-motion`'s own `useReducedMotion()` hook already handles its own animations automatically — use framer-motion's hook directly inside each framer-powered component instead of threading a prop through everywhv possible, simpler.

## 6. Manual test pass before opening the PR

1. `npm run dev` inside `client/`, log in, navigate to `/welcome` directly by URL.
2. Confirm: navbar + footer present (default shell, not constrained/immersive).
3. Hero video autoplays immediately, muted, loops — open devtools Network tab, confirm it's not deferred behind any click.
4. Play one move on the mini board, confirm AI-ish reply + win-line + auto-reset.
5. Hover each of the 3 mode cards — mini replay plays; click any card — lands on `/play` (same as the Hero "PLAY NOW" button).
6. Scroll through all 8 sections once at normal speed, once with OS-level "reduce motion" turned on (Windows: Settings → Accessibility → Visual effects → Animation effects, off) — confirm marquee stops scrolling, counter snaps to final value, no looping CSS animation still running (`devtools → Rendering → prefers-reduced-motion` emulation is faster than toggling OS settings).
7. Resize to a narrow mobile width — confirm feature grid / FAQ / cards reflow (single column), nothing overflows horizontally.
8. Open browser console — zero errors/warnings across the whole flow.
9. `npm run lint` inside `client/` — zero new errors.

## 7. Out of scope / explicitly not doing

- Not wiring post-login redirect through `/welcome` (flagged in step 2.3 as a separate follow-up).
- Not building a real backend-backed "games played" counter for Section 6 — placeholder number only.
- Not touching `GameModeSelect`, its hook, or its service beyond *importing* `getGameModeRoute`/`GAME_MODES` read-only.
