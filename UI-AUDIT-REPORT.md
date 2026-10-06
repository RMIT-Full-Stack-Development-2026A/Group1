# TicTacToang UI Audit Report

Date: 2026-10-06 (updated after the fix pass)
Scope: live responsive check with playwright-cli (desktop 1440x900, tablet 768x1024, mobile 390x844, plus 1024x768 for the game board) and a static review of `client/src/pages` and `client/src/components` against the Web Interface Guidelines.
Screenshots (not committed): `.playwright-shots/`. Originals are named `<page>-<size>.png`, post-fix shots `fix-*.png`.

Accounts used: a free player (`minz516`), a premium player (`minhdepzai516`), and the same premium account temporarily promoted to ADMIN.

How this report is organised: section 1 is a status summary, section 2 lists every finding with its status (Fixed, Open, Retracted), section 3 lists what was verified live versus only fixed in code, section 4 is the remaining work in a suggested order.

Status key: **Fixed** = changed and confirmed in the browser. **Fixed (code only)** = changed and builds, not seen working live. **Open** = not fixed. **Retracted** = the original finding was wrong.

---

## 1. Summary

| Area | Result |
|---|---|
| Shared navbar (clipped MUSIC OFF / LOGOUT, cut-off hamburger, no mobile menu for guests) | Fixed |
| Landing hero and cards at tablet and mobile | Fixed |
| Game board at tablet (panels off-screen) and at 1024px (board overflow) | Fixed |
| Match lobby tablet center column | Fixed |
| Chat panel width, toggle position, accessibility | Fixed (still overlays the left player card) |
| Replay control bar covering the board, button names, winner in header | Fixed |
| Profile mobile and tablet layout | Fixed |
| Admin dashboard charts, players table and filters, rooms title | Fixed |
| Modal and overlay semantics, chat dimming under overlays | Fixed |
| `uppercase` console error, Recharts warnings | Fixed |
| Guideline sweep: `transition-all`, `outline-none`, `...`, locale, skip link, index.html | Fixed |
| Inert Tailwind config causing low-contrast text | Open |
| Dialog focus trap and Escape-to-close | Open |
| Forms outside login/register, URL state for filters, image dimensions elsewhere | Open |
| Logged-out 401 console line | Open (cannot be fixed from the frontend) |

Three earlier claims were wrong and are retracted in section 2.

---

## 2. Findings with status

### 2.1 Responsive layout

| # | Finding | Status | Notes |
|---|---|---|---|
| L1 | Navbar below 1024px: MUSIC OFF clipped, LOGOUT pushed out of view (tablet); hamburger cut off at the right edge (mobile) | Fixed | Desktop menu now starts at `lg`; hamburger moved out of the left group; logo scales down on small screens. Hamburger right edge now 744 (of 768) and 366 (of 390). |
| L2 | Logged-out visitors had no mobile menu at all (hamburger only rendered when authenticated), so no LOGIN or REGISTER on mobile | Fixed | Found during the fix pass. |
| L3 | Landing hero title clipped at tablet and mobile ("ICTACTOAN") | Fixed | Fluid scale `text-3xl` up to `xl:text-8xl`. Right edge now 698 (of 768) and 352 (of 390). |
| L4 | Landing third feature card heading cut off ("MULTIPLAYE") at tablet | Fixed | Cards stack until `lg`. |
| L5 | Landing "VISUALIZER_v4.2" label overlapped the board grid; board wider than its container on mobile | Fixed | Solid label background; board shrinks with its container. |
| L6 | Game board at tablet: both player panels squeezed off the screen edges | Fixed | Layout stacks below `lg`; board width capped by the space the panels leave. |
| L7 | Game board at 1024px: board overflowed (found during the fix pass) | Fixed | Now panels plus a 404px board fit. |
| L8 | ABORT button overlapped the ACTIVE TURN tag; on mobile it covered the host panel | Fixed | Top on stacked layouts, bottom-right on desktop. |
| L9 | Match lobby at tablet: center column too narrow ("CLASSI", legend clipped, wrapped labels) | Fixed | Stacks below `lg`. |
| L10 | Match lobby mobile: CHAT button overlapped the host card | Fixed | Top padding below `lg`. |
| L11 | Match lobby mobile: READY button below the fold | Open | Follows from the stacked layout; not reordered. |
| L12 | Chat panel wider than the viewport on mobile, close button cut off | Fixed | Width `min(380px, 100vw - 3rem)`. |
| L13 | Chat toggle button moved down when the panel opened | Fixed | Button now sits above the panel. |
| L14 | Chat panel covers the left player card (HOST badge, avatar) on desktop and tablet | Open | It is a floating panel; moving it is a design decision. |
| L15 | Replay: fixed control bar covered the lower board rows at every size | Fixed | Extra bottom padding; board ends above the bar (desktop 579 vs 759, tablet 123 vs 843, mobile -89 vs 663 when scrolled to the end). |
| L16 | Profile mobile: CHANGE PASSWORD clipped | Fixed | Action buttons wrap. |
| L17 | Profile mobile: long username pushed the avatar off-screen and clipped the name (found during the fix pass) | Fixed | `min-w-0` and `break-all` on the name. |
| L18 | Profile tablet: WIN RATE value clipped at 100% (found during the fix pass) | Fixed | Smaller size below `lg`. |
| L19 | Profile tablet: filter bar wrapped into uneven rows | Fixed | Header stacks until `xl`; labels linked and readable. |
| L20 | Profile: match history table scrolls sideways at tablet and mobile | Open (by design) | The table scrolls inside its own container; no overflow elsewhere. |
| L21 | Admin dashboard at tablet: chart axis labels collided ("0004081216 20") | Fixed | Charts stack below `lg`; labels read 00, 04, 08, ... 31. |
| L22 | Admin players at tablet: search input collapsed to an icon; table wider than the screen with ACTION off-screen | Fixed | Filters stack until `xl`; ID column hidden below `xl`; Action column pinned. |
| L23 | Admin rooms mobile: title "GAME ROOMS MANAGEMENT" overflowed | Fixed | Smaller size and `break-words` on mobile. |
| L24 | Replay desktop and tablet: no result shown; ambiguous date | Fixed | Header names the winner; date uses `Intl.DateTimeFormat`. |
| L25 | Pages 15px narrower than the viewport (`scrollWidth` 1425 vs 1440) | Retracted | This is the vertical scrollbar width, not an overflow. |

### 2.2 Console and network

| # | Finding | Status | Notes |
|---|---|---|---|
| C1 | `Received true for a non-boolean attribute uppercase` on the lobby, match lobby and game board | Fixed | Stray `uppercase` attribute on a `<span>` in `RoomCard.jsx`; now a class. Confirmed 0 errors with a room card on screen. |
| C2 | `/admin`: 6 Recharts warnings (`width(-1) and height(-1)`) | Fixed | `initialDimension` and `min-w-0` on the chart containers. |
| C3 | Logged-out `GET /auth/check-auth` returns 401, logged as a console error | Open | The browser logs failed network responses itself. |
| C4 | `POST /auth/logout` fires twice, second call returns 401 | Fixed (code only) | Re-entrancy guard in `AuthStore.logout`. Original double call was not reproduced, so this is untested. |
| C5 | After one LOGOUT click the session appeared to survive | Open (unreproduced) | Possible race between logout and the redirect. |
| C6 | No 4xx or 5xx on any other page tested | Verified | Rooms, games, Socket.IO polling, audio all fine. |

### 2.3 Accessibility

| # | Finding | Status | Notes |
|---|---|---|---|
| A1 | Modals and overlays had no `role="dialog"` or `aria-modal` | Fixed | Abort, win, edit profile and change password. Abort and win are `dialog "Abort match"` and `dialog "Game over"` in the accessibility tree. |
| A2 | Chat button stayed undimmed and clickable above the abort modal and win overlay | Fixed | Both overlays render into `<body>` via a portal; confirmed the point under the CHAT button now belongs to the overlay. |
| A3 | No `aria-live` anywhere (chat notice, login messages, disconnect banner) | Fixed (code only) for the banner and reconnect flash; login messages and chat log fixed | Chat list is `role="log"`; login messages are `status` or `alert`. |
| A4 | Disconnect countdown was a bare number with no unit | Fixed (code only) | Shows "SEC"; the number is `aria-hidden` so it does not spam announcements. |
| A5 | Replay controls' accessible names were icon ligature words ("first_page", "play_arrow") | Fixed | Named: Go to first move, Previous move, Play/Pause replay, Next move, Go to last move. |
| A6 | Replay position bar was not keyboard accessible | Fixed | `role="slider"`, arrow keys, Home and End. |
| A7 | Profile replay trigger was a clickable `<span>` with text "play_arrow" | Fixed | Now a button with an `aria-label`. |
| A8 | Visible labels not tied to inputs (login, email, username, password) | Fixed | `htmlFor` and `id`, `name` attributes unchanged. |
| A9 | Labels missing on admin and profile filters | Fixed (partly) | Player filters, profile filters and the rooms view-mode select. The admin session filters were not changed. |
| A10 | Icon-only buttons without names (navbar hamburger, show/hide password, chat close) | Fixed | `aria-label`s added. |
| A11 | No skip-to-content link | Fixed | Added in `Layout.jsx`. |
| A12 | Logo was a clickable `<span>` | Fixed | Now a `<button>` with a focus ring. |
| A13 | Dialogs have no focus trap and no Escape-to-close | Open | |
| A14 | Edit Profile and Change Password modals, chat inputs, lobby jump-to-page input, Player 2 name field, admin session filters: labels, `autoComplete`, `spellCheck` | Open | |
| A15 | Toast notifications: unknown whether `react-hot-toast` announces itself | Open (unchecked) | |

### 2.4 Web Interface Guidelines sweep

| # | Finding | Status | Notes |
|---|---|---|---|
| G1 | `transition-all` (about 50 places) | Fixed | Replaced with an explicit property list across 52 files. |
| G2 | `outline-none` without a focus replacement (6 places) | Fixed | `focus-visible` outline. |
| G3 | Three dots instead of `…` in loading and placeholder text | Fixed | Across pages and components. |
| G4 | Hardcoded `vi-VN` / `en-US` / `en-GB` locales | Fixed | Now the visitor's locale. Mixed `toFixed` and `toLocaleString` number formatting remains (open). |
| G5 | Missing `autoComplete`, `spellCheck`, weak placeholder contrast on login and register fields | Fixed | Email, username, password fields and the login form. |
| G6 | No `prefers-reduced-motion` handling | Fixed | Global rule in `index.css`. |
| G7 | `index.html`: broken `@/index.css` link, duplicate Press Start 2P load, invalid favicon `type`, no preconnect, no `color-scheme` or `theme-color` | Fixed | |
| G8 | `<img>` without `width` and `height` | Fixed (avatars only) | Admin and in-game avatars. Country flags, grid-style previews and replay board images still lack them. |
| G9 | `loading="lazy"` only on admin avatars | Open | |
| G10 | `autoFocus` (2 places) | Left as is | Both are user-triggered. |
| G11 | No `tabular-nums` on number columns; no `text-balance` on headings | Open | |
| G12 | About 169 uses of 8 to 10 px text | Open | |
| G13 | Match history and admin filters, sorting and pagination held in `useState`, not the URL | Open | |
| G14 | No `translate="no"` on the brand name | Open | |
| G15 | Material Symbols and `lucide-react` both in use | Open | |
| G16 | Straight quotes in the landing copy | Fixed | Curly quotes. |

### 2.5 Retracted findings

| Claim | Why it was wrong |
|---|---|
| Lobby button reads "WAITTING ONLY" (typo) | The source says "WAITING ONLY"; the pixel font draws it that way. |
| Replay shows "5 ROUNDS" but "9 MOVES" (inconsistent) | A round is an X and O pair, so 9 moves is 5 rounds. |
| "BACK TO LOBBY" on the win overlay went to `/profile` | Mis-click on my side. Tested: it goes to `/lobby`, 0 console errors. |

### 2.6 Content and copy

| # | Finding | Status |
|---|---|---|
| T1 | Lobby empty state: "LOOKS LIKE ALL ROOM ARE FULL" (ungrammatical, wrong when there are 0 rooms) | Fixed: "NO OPEN ROOMS RIGHT NOW. CREATE ONE TO START." |
| T2 | Abort modal's primary button "SAVE & QUIT" is a confusing label for ending the match | Open |
| T3 | "03. MARKER VARIANTS" heading appears twice on `/customize` | Open |
| T4 | Raw database IDs shown in the profile history and (above `xl`) admin player table | Open |
| T5 | Admin dashboard: "TOTAL REVENUE $10" next to "MONTHLY: $0" reads oddly | Open |

---

## 3. What was verified live

Verified in the browser at desktop, tablet and mobile (and 1024px for the board): the logged-out landing and login, the navbar for guest, player and admin, `/admin`, `/admin/players`, `/admin/rooms`, `/profile`, `/replay/:id`, `/lobby`, the match lobby, chat (sent a message, confirmed the panel stays inside the viewport), the game board, the abort modal (opened, KEEP PLAYING returns to the game) and the win overlay ("YOU WIN!", dialog role, dimmed chat). Console and network were clean throughout except the logged-out 401.

Fixed in code but not seen working live: the disconnect countdown (`aria-live` and the "SEC" unit), the logout re-entrancy guard, chat delivery to the other player's screen and any delay between the two screens (the second screen was not visible to the test).

Not tested at all: `/login` and `/register` at tablet and mobile, `/subscription` and `/customize` after the navbar change, the single-player and local-arena boards (they share the layout code that changed), and the 15 to 30 second host move time seen in the abort test was the other player's thinking time, not lag.

No automated tests were run. The client has no test suite and nothing changed on the server. `vite build` passes. The files changed in this pass are lint-clean except for pre-existing errors.

---

## 4. Remaining work, suggested order

1. **Inert Tailwind config.** `tailwind.config.js` is not loaded under Tailwind v4 (`index.css` has no `@config` line), so classes such as `text-outline`, `text-on-surface`, `text-primary`, `text-secondary-container` and `bg-surface-container-high` do nothing. This is the root cause of several low-contrast texts (admin room and session filter placeholders, table headers). Loading the config fixes them all but restyles pages, so every page needs a visual check afterward.
2. **Dialog behavior:** focus trap and Escape-to-close for the four modals.
3. **Forms outside login and register** (profile modals, chat inputs, lobby jump input, Player 2 name, admin session filters): labels, `autoComplete`, `spellCheck`.
4. **Chat panel placement** so it no longer covers the left player card; move READY above the fold in the stacked match lobby.
5. **URL state** for match-history and admin filters, sorting and pagination.
6. **Image work:** dimensions and lazy loading for flags, grid previews and replay board images.
7. **Typography:** `tabular-nums`, `text-balance`, raise the 8 to 10 px text, unify number formatting.
8. **Copy:** the "SAVE & QUIT" label, the duplicated "MARKER VARIANTS" heading, raw IDs, the revenue labels.
9. **Verify the unverified:** the disconnect banner, the logout guard, `/login` and `/register` at tablet and mobile, `/subscription`, `/customize`, the offline boards, and chat latency with two screens.
10. **Cleanup:** the pre-existing lint errors (unused variables, `no-dupe-keys`, React compiler warnings) and the mixed icon libraries.
