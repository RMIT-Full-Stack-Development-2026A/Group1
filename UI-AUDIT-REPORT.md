# TicTacToang UI Audit Report

Date: 2026-10-06, updated 2026-10-07 after the second fix pass (console group, accessibility, guidelines, copy)
Scope: live responsive check with playwright-cli (desktop 1440x900, tablet 768x1024, mobile 390x844, plus 1024x768 for the game board) and a static review of `client/src/pages` and `client/src/components` against the Web Interface Guidelines.
Screenshots (not committed): `.playwright-shots/`. Originals are named `<page>-<size>.png`, post-fix shots `fix-*.png`.

Accounts used: a free player (`minz516`), a premium player (`minhdepzai516`), and the same premium account temporarily promoted to ADMIN.

How this report is organised: section 1 is a status summary, section 2 lists every finding with its status (Fixed, Open, Retracted), section 3 lists what was verified live versus only fixed in code, section 4 is the remaining work in a suggested order.

Status key: **Fixed** = changed and confirmed in the browser. **Fixed (code only)** = changed and builds, not seen working live. **Open** = not fixed. **Retracted** = the original finding was wrong.

---

## 1. Summary

| Area | Result |
|---|---|
| Shared navbar (clipped controls, cut-off hamburger, no mobile menu for guests) | Fixed |
| Landing, game board, match lobby, replay, profile, admin pages at tablet and mobile | Fixed |
| Console group: logged-out 401, double logout 401, force-logout redirect, `uppercase` attribute, Recharts, button-sound AbortError | Fixed (server cause found and tested) |
| Dialog behavior: roles, portal, focus trap, Escape, focus return | Fixed |
| Forms: labels, `autoComplete`, `spellCheck`, contrast, show/hide names | Fixed |
| Icon-only and decorative icons (names for assistive tech) | Fixed |
| Guideline sweep: transitions, outlines, ellipses, locale and number formatting, images, typography rules, `translate="no"`, skip link | Fixed |
| URL state for filters | Fixed (profile verified; admin players code only; room and session monitors not done) |
| Copy: abort label, duplicate heading, raw IDs, revenue footer, lobby empty state | Fixed |
| Layout leftovers: READY below the fold on stacked match lobby, chat panel covering the left card | Open (excluded on purpose) |
| Dead Tailwind classes (`tailwind.config.js` never loaded) | Open, deliberately not changed (see 4) |
| Remaining tiny text (10 px) and mixed icon libraries | Open |

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
| L26 | Offline board at tablet and mobile: CHAT button sat on cell A10 and partly blocked clicks | Fixed | Moved to the reserved top strip below `lg`. |
| L27 | Low-contrast text and placeholders (`opacity-30` placeholders, `#3d484d` text, `#6d706d` status text) | Fixed | Replaced with `#879398` (5.9 to 1 on the dark surfaces). |
| L25 | Pages 15px narrower than the viewport (`scrollWidth` 1425 vs 1440) | Retracted | This is the vertical scrollbar width, not an overflow. |

### 2.2 Console and network

| # | Finding | Status | Notes |
|---|---|---|---|
| C1 | `Received true for a non-boolean attribute uppercase` on the lobby, match lobby and game board | Fixed | Stray `uppercase` attribute on a `<span>` in `RoomCard.jsx`; now a class. Confirmed 0 errors with a room card on screen. |
| C2 | `/admin`: 6 Recharts warnings (`width(-1) and height(-1)`) | Fixed | `initialDimension` and `min-w-0` on the chart containers. |
| C3 | Logged-out `GET /auth/check-auth` returned 401, logged as a console error on every first visit | Fixed | Root cause was `verifyToken` on the route. `check-auth` now uses `optionalVerifyToken` and answers 200 with `user: null` for anonymous visitors (invalid or revoked cookies count as anonymous; a deactivated account is still reported). Logged-out landing now shows 0 console errors. |
| C4 | `POST /auth/logout` fired twice, second call returned 401 | Fixed | Real cause: logout publishes `SESSION_REVOKED`, the server force-disconnects the user's own sockets with `auth:force_logout`, and the client treated that as "logged in elsewhere" and called logout again. Server: logout is idempotent (always clears the cookie, 200 even when already logged out) and the event now carries a `code` (`LOGGED_OUT`, `PASSWORD_CHANGED`, `DUPLICATE_LOGIN`, `SESSION_EXPIRED`). Client: a `LOGGED_OUT` event just drops the socket. Verified live: one `POST /logout` returning 200. |
| C5 | After one LOGOUT click the session appeared to survive | Fixed (explained) | Same cause as C4: the force-logout handler did a hard redirect to `/login?reason=duplicate` that raced the logout. That redirect no longer happens for a voluntary logout (lands on `/`). |
| C6 | No 4xx or 5xx on any other page tested | Verified | Rooms, games, Socket.IO polling, audio all fine. |
| C7 | `Error playing button sound: AbortError` when a clicked button unmounts (found while testing logout) | Fixed | `useButtonSound` and `useAudio` ignore `AbortError` and `NotAllowedError`, which are expected. |

### 2.3 Accessibility

| # | Finding | Status | Notes |
|---|---|---|---|
| A1 | Modals and overlays had no `role="dialog"` or `aria-modal` | Fixed | Abort, win, edit profile and change password. Abort and win are `dialog "Abort match"` and `dialog "Game over"` in the accessibility tree. |
| A2 | Chat button stayed undimmed and clickable above the abort modal and win overlay | Fixed | Both overlays render into `<body>` via a portal; confirmed the point under the CHAT button now belongs to the overlay. |
| A3 | No `aria-live` anywhere (chat notice, login messages, disconnect banner) | Fixed | Chat list `role="log"`, login messages `status`/`alert`, disconnect banner and reconnect flash `aria-live`. `react-hot-toast` toasts carry `role="status"` by default. |
| A4 | Disconnect countdown was a bare number with no unit | Fixed (code only) | Shows "SEC"; the number is `aria-hidden` so it does not spam announcements. |
| A5 | Replay controls' accessible names were icon ligature words ("first_page", "play_arrow") | Fixed | Named: Go to first move, Previous move, Play/Pause replay, Next move, Go to last move. |
| A6 | Replay position bar was not keyboard accessible | Fixed | `role="slider"`, arrow keys, Home and End. |
| A7 | Profile replay trigger was a clickable `<span>` with text "play_arrow" | Fixed | Now a button with an `aria-label`. |
| A8 | Visible labels not tied to inputs (login, email, username, password) | Fixed | `htmlFor` and `id`, `name` attributes unchanged. |
| A9 | Labels missing on admin and profile filters | Fixed | Player filters, profile filters, rooms view-mode select, Player 2 name, lobby jump input and chat inputs. The admin session filters already wrap their inputs in labels. |
| A10 | Icon-only buttons without names (navbar hamburger, show/hide password, chat close) | Fixed | `aria-label`s added. |
| A11 | No skip-to-content link | Fixed | Added in `Layout.jsx`. |
| A12 | Logo was a clickable `<span>` | Fixed | Now a `<button>` with a focus ring. |
| A16 | Buttons' accessible names included icon ligature text ("edit EDIT PROFILE", "lock CHANGE PASSWORD") | Fixed | 56 decorative Material icons across 26 files are now `aria-hidden`. A DOM scan of every player and guest page found 0 unnamed controls. |
| A13 | Dialogs had no focus trap and no Escape-to-close | Fixed | New `useDialogA11y` hook on abort, win, edit profile and change password. Verified live on Edit Profile: focus moves in, 30 Tab presses stay inside, Escape closes, focus returns to the opener. |
| A14 | Edit Profile and Change Password modals, chat inputs, lobby jump input, Player 2 name: labels, `autoComplete`, `spellCheck` | Fixed | Current password gets a linked label and `current-password`; new password fields use `new-password`; inputs are labelled. |
| A15 | Toast notifications: unknown whether `react-hot-toast` announces itself | Fixed (by default behavior) | The library sets `role="status"` and `aria-live="polite"` on every toast; no change needed. |

### 2.4 Web Interface Guidelines sweep

| # | Finding | Status | Notes |
|---|---|---|---|
| G1 | `transition-all` (about 50 places) | Fixed | Replaced with an explicit property list across 52 files. |
| G2 | `outline-none` without a focus replacement (6 places) | Fixed | `focus-visible` outline. |
| G3 | Three dots instead of `…` in loading and placeholder text | Fixed | Across pages and components. |
| G4 | Hardcoded `vi-VN` / `en-US` / `en-GB` locales; mixed `toFixed` and `toLocaleString` | Fixed | Visitor's locale for dates and times; shared `utils/formatNumber.js` for counts, integers and one-decimal values (dashboard, pagination, profile win rate). |
| G5 | Missing `autoComplete`, `spellCheck`, weak placeholder contrast on login and register fields | Fixed | Email, username, password fields and the login form. |
| G6 | No `prefers-reduced-motion` handling | Fixed | Global rule in `index.css`. |
| G7 | `index.html`: broken `@/index.css` link, duplicate Press Start 2P load, invalid favicon `type`, no preconnect, no `color-scheme` or `theme-color` | Fixed | |
| G8 | `<img>` without `width` and `height` | Fixed | Avatars, country flags, profile avatar and history avatars. The two full-bleed background images are decorative (`alt=""`, lazy). |
| G9 | `loading="lazy"` only on admin avatars | Fixed | Added to history avatars, country list flags and grid-style previews. |
| G10 | `autoFocus` (2 places) | Left as is | Both are user-triggered. |
| G11 | No `tabular-nums` on number columns; no `text-balance` on headings | Fixed | Global rules: `table { font-variant-numeric: tabular-nums }` and `h1, h2, h3 { text-wrap: balance }`. |
| G12 | About 169 uses of 8 to 10 px text | Partly fixed | All 38 uses of 8 px and 9 px raised to 10 px. The 10 px text (about 170 uses) remains. |
| G13 | Match history and admin filters, sorting and pagination held in `useState`, not the URL | Fixed (profile verified, admin code only) | Applied filters, sort and page sync to the query string (`?result=WIN&type=ONLINE_MATCH`, `?q=&status=&page=`). Verified live on the profile (filtered URL pre-applies the filter, RESET and FILTER clears it). The admin players hook uses the same helper but needs the admin role to test. The admin room and session monitors are not synced yet. |
| G14 | No `translate="no"` on the brand name | Fixed | Navbar logo, landing title and footer line. |
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
| T2 | Abort modal's primary button "SAVE & QUIT" is a confusing label for ending an online match | Fixed | Online matches now read "ABORT MATCH"; offline modes keep "SAVE & QUIT". |
| T3 | "03. MARKER VARIANTS" heading appears twice on `/customize` | Fixed | One heading, with "PLAYER 1 MARKER" and "AI MARKER" under it. |
| T4 | Raw 24-character database IDs in the profile history | Fixed | Shows `#` plus the last six characters, full ID in the tooltip. The admin player table keeps the full ID above `xl`, which is useful for support. |
| T5 | Admin dashboard: "TOTAL REVENUE $10" next to "MONTHLY: $0" reads oddly | Fixed | Footer reads "This month: $0". |

---

## 3. What was verified live

Verified in the browser at desktop, tablet and mobile (and 1024px for the boards): logged-out landing, `/login` and `/register`, the navbar for guest, player and admin, `/admin`, `/admin/players`, `/admin/rooms`, `/profile`, `/replay/:id`, `/play`, `/customize`, `/subscription`, `/lobby`, the match lobby, chat, the online game board, the offline single-player board, the abort modal, the win overlay, and `BACK TO LOBBY`.

Also verified live this round:
- Logout: exactly one `POST /auth/logout` returning 200, no 401, lands on `/`.
- Logged-out landing: 0 console errors and `check-auth` returns 200.
- Edit Profile dialog: focus moves in, Tab stays inside, Escape closes, focus returns to the button.
- Profile URL state: `/profile?result=WIN&type=ONLINE_MATCH` pre-applies the filters (2 WIN rows), RESET and FILTER clears the URL.
- DOM scan for controls without an accessible name: 0 on login, register, play, lobby, customize, subscription, profile and replay.
- Server: all 91 integration tests pass, including three new tests (anonymous `check-auth` returns 200 with no user, an invalid cookie counts as anonymous, `logout` succeeds when already logged out) and a check that the logout socket event carries `code: "LOGGED_OUT"`.

Fixed in code but not seen working live:
- The disconnect banner and countdown (`aria-live`, "SEC" unit); it needs a second player who disconnects.
- URL state on the admin players page, and anything else behind the admin role (the test account is currently PLAYER).
- Chat delivery to the other player's screen and any delay between the two screens.

Not tested: the local-arena board (it shares the offline board code), and the PayPal checkout flow.

`vite build` passes. The client has no test suite. This round added no lint errors (33 before and 33 after across the changed files; the three new files are clean). The pre-existing lint errors (unused variables, `no-dupe-keys`, React compiler warnings) are untouched.

---

## 4. What is still open

1. **Layout (excluded from this round on request):** the READY button is below the fold in the stacked match lobby on mobile and tablet, and the chat panel covers the left player card.
2. **Dead Tailwind classes.** `tailwind.config.js` is not loaded under Tailwind v4 (no `@config` line in `index.css`), so classes such as `text-outline`, `text-on-surface`, `text-primary`, `bg-primary-container` and `text-secondary-container` do nothing. Defining them all was tried and backed out: it turns the PREMIUM badge into yellow text on a solid yellow block and the replay MOVE_LOG header into an unreadable cyan bar, because the components also hard-code their own colors. These classes were not the cause of the low-contrast text (undefined text classes inherit a bright color); the real low-contrast spots were fixed directly. Cleaning this up means deciding, component by component, which look is intended.
3. **URL state for the admin room and session monitors,** and verifying the admin players URL state with the admin role.
4. **Text size:** about 170 uses of 10 px text remain.
5. **Icon libraries:** Material Symbols and `lucide-react` are both still used.
6. **Remaining unverified items** in section 3 (disconnect countdown, chat latency between two screens).
7. **Cleanup:** the pre-existing lint errors, and the `autoFocus` on the lobby jump input and profile page input (both user-triggered, left on purpose).
