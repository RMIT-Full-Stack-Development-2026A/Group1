# TicTacToang UI Audit Report

Date: 2026-10-06, updated 2026-10-08 after the third fix pass (dead Tailwind classes, text size, icon library, URL state, disabled contrast)
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
| Layout: READY below the fold on the stacked match lobby, chat panel covering other content | Fixed (pinned action bar; floating chat placed per screen) |
| Dead Tailwind classes (`tailwind.config.js` never loaded) | Fixed (tokens defined, conflicts resolved, contrast scan clean) |
| Small text and mixed icon libraries | Fixed (12 px minimum; one icon family) |

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
| L11 | Match lobby, stacked layout: READY and LEAVE ROOM were 1,100 to 1,200 px down the page, below the fold on phones and tablets | Fixed | Below 1024 px the ready status and both buttons are a bar pinned to the bottom of the screen; from 1024 px up every pinned-bar property is reset. Desktop verified identical: all 167 elements have the same position, size and stacking at 1440, 1280 and 1024 px. Both buttons are inside the first screen at 768x1024, 390x844 and 360x640. |
| L12 | Chat panel wider than the viewport on mobile, close button cut off | Fixed | Width `min(380px, 100vw - 3rem)`. |
| L13 | Chat toggle button moved down when the panel opened | Fixed | Button now sits above the panel. |
| L14 | Chat panel covers the left player card (HOST badge, avatar) and marker pickers | Fixed (as a floating window) | The chat stays a floating window that takes no layout space. Match lobby: top-left, opening downward, covering only the top of the host card (never a control); verified no control is covered at 1440, 1024, 768 and 390 px. Online board: bottom-left from 1024 px up, opening upward, the same spot as the offline chat; top-left below 1024 px. It follows the screen change when a match starts. Known trade-off: on the desktop board the open 380 px window reaches about 89 px over the board's left edge (the row labels and column A cells in the lower rows), the same as the offline game. |
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
| D1 | Dead Tailwind classes: `tailwind.config.js` never loaded, so 23 color tokens used in 45 files (about 370 uses) did nothing | Fixed | All 54 config colors are now defined in `@theme`, so classes render as authored. Combinations that conflicted were fixed: PREMIUM badges (yellow on yellow), replay MOVE_LOG header (cyan on cyan), dark-red error text, the LOSSES value and bar, grey-on-grey buttons, the grid-style labels, difficulty chips. An automated contrast scan over every text element on all guest and player pages and both profile modals, the offline board and the abort modal reports 0 failures. |
| T6 | Disabled-looking status buttons were hard to read (CURRENT PLAN, ENJOY YOUR PREMIUM BENEFITS, CURRENT STATUS, WAITING FOR OPPONENT) | Fixed | Opacity dimming removed; readable colors. |
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
| G12 | Small text (about 169 uses of 10 px, plus 11 px) | Fixed | Every `text-[10px]` and `text-[11px]` is now `text-xs` (12 px). A scan of every guest and player page at desktop, tablet and mobile finds no page overflow and no clipped text. |
| G13 | Match history and admin filters, sorting and pagination held in `useState`, not the URL | Fixed (profile verified; admin code only) | Profile and admin players sync to the query string. The admin room and session monitors now do too (`?view=sessions&rq=&rpage=&sn=&sq=&from=&to=&status=&spage=`); a page restored from the URL is no longer wiped by the first load. The admin pages need the admin role to verify. |
| G14 | No `translate="no"` on the brand name | Fixed | Navbar logo, landing title and footer line. |
| G15 | Material Symbols and `lucide-react` both in use | Fixed | All 8 files moved to a shared `components/common/Icon.jsx` (Material Symbols); `lucide-react` is removed from the code and from `package.json`. |
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

Also verified live with the admin role (2026-10-08): `/admin`, `/admin/players` and `/admin/rooms` at desktop, tablet and mobile show 0 contrast failures, 0 unnamed controls, no page overflow or clipped text, a clean console and no failed requests. URL state works in both directions on the players list (`?q=&status=&page=`; RESET clears the URL; reload restores) and on the room and session monitors (`?view=sessions&sq=&status=&spage=` and `?rq=`; a restored page such as `spage=3` is kept). The pinned Action column on the players list now matches the row color.

Disconnect countdown, verified live with a real disconnect (2026-10-09): the banner "CONNECTION LOST. Opponent disconnected. Waiting for them to return..." appeared with `role="status"` and `aria-live="polite"`, the countdown ran 59, 57, 55 ... 34 SEC (the number is `aria-hidden`, the unit "SEC" is visible), and when the opponent returned with 34 s left the banner cleared and an "OPPONENT RECONNECTED" flash showed for under 5 s.

Latency, measured live against the remote MongoDB Atlas database: a chat message took 162 to 176 ms from click to appearing (two sequential database reads in `handleChatSend`); running them in parallel brought it to about 116 ms. A move took 263 ms from click to marker (one read plus one atomic conditional write on the server, which is already minimal); an optimistic marker on the client now shows it in about 48 ms and rolls back if the server rejects the move (verified: clicking an occupied cell draws nothing and the next click still lands in 48 ms). The user lookup in `handleChatSend` is kept because it is also the active-account guard.

Local-arena board, verified live (2026-10-10): clean at 1440, 1024, 768 and 390 px (no overflow, no clipped text, 0 contrast failures, 0 console errors); a full game was played, turns alternated between the two players, X's five in a row was detected and highlighted, and the VICTORY overlay appeared.

Pressed-READY lobby, verified live: the button turns into a green, disabled, pulsing READY, the counter reads READY 1/2, the card tags and status dots reflect each player, and the pinned bar shows the same state on phones; no overflow or contrast failures.

Client lint: `npm run lint` went from 74 problems (68 errors, 6 warnings) to 0. The duplicate `playerTwoName` key was removed (the second copy was the one that always took effect). Unused variables were removed, JSX-only component props are recognized by the lint config, form resets and the abort countdown now adjust state while rendering, render-time `Math.random` and `Date.now` calls moved to mount time, the login lockout helpers were hoisted, and `vite.config.js` defines its own `__dirname`. Two targeted suppressions carry written reasons (the board's hydration flag and the once-on-mount PayPal capture). One refactor (applying the lobby's room data during render) broke room creation under StrictMode, was caught, and was reverted to an effect with an explanatory comment before anything was pushed; creating a room, leaving it, and creating again were then verified live.

Not tested: the PayPal checkout flow.

`vite build` passes and `npm run lint` is at 0 problems. The client has no test suite; the server has 92 integration tests, all passing.

---

## 4. What is still open

1. **PayPal checkout:** not tested yet (left for last on purpose). `PaymentSuccess` captures the payment once on mount, guarded by a ref so a payment is never captured twice; that effect was deliberately left untouched during the lint cleanup.
2. **Online board, chat overlap (optional):** the open 380 px chat window covers about 89 px of the board's left edge on desktop (row labels and the lower column A cells). Making the window 280 px wide on desktop would remove the overlap; held because the placement was approved as is.
3. **Possible hardening:** the online page's cleanup sends `room:leave` for any active room on unmount, which cannot tell a real navigation from React StrictMode's simulated unmount in development. It is fine today (room data from the lobby is applied in an effect, with a comment explaining why), but making the leave deferred and cancellable on remount would remove the fragility.
4. **Optional product choices:** list "Match chat" among the Neuro-Elite benefits on the subscription page (chat is now premium-only on the server too), and an "unready" option (READY cannot be cancelled once pressed).
5. **Existing weakness outside the UI:** none open. `npm run lint` in the client passes with 0 problems.
