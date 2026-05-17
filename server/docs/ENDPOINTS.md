# TicTacToang Backend API Endpoints

This document defines the **recommended server contract** for TicTacToang so that it matches the SRS, respects the team policy, and minimizes unnecessary API calls by:

- using **HTTP for authentication, profile, history, subscription, and admin actions**
- using **WebSocket for live room lifecycle, gameplay, and in-game chat**
- providing **aggregate/overview endpoints** for screens that would otherwise require multiple requests

Base API URL: `/api/v1`

## 0. Global API Conventions

### Response shape
All endpoints must return exactly one of the two allowed shapes:

Success:

```json
{
  "data": {},
  "message": "..."
}
```

Failure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "cause": "Cause of error",
  "valid_example": "Example of valid inputs"
}
```

### Authentication
- JWT/JWS is stored in **httpOnly cookie**: `access_token`
- Frontend sends requests with `withCredentials: true`
- `401` means FE must clear auth state and redirect to `/login`

### Pagination
List endpoints use:

- `page=1`
- `limit=20`

List response shape:

```json
{
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 20
  },
  "message": "..."
}
```

### Common query rules
- Search query: `q`
- Sort query: `sortBy`, `sortOrder`
- Date range: `from`, `to`
- `id` is always exposed as `id`, never `_id`
- Dates are ISO 8601 strings

## 1. Authentication APIs
Base Path: `/api/v1/auth`

These APIs handle account creation, login, logout, and session bootstrap.

| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| POST | `/auth/register` | No | Register a new player | Yes |
| POST | `/auth/login` | No | Login with username/email and password | Yes |
| POST | `/auth/logout` | Yes | Clear auth cookie and logout current user | Yes |
| GET | `/auth/check-auth` | Yes | Validate session and return current session payload | Yes |

### Notes
- `POST /auth/login` must enforce brute-force protection (lock after 5 failed attempts within 60 seconds).
- `GET /auth/check-auth` should return enough data for app bootstrap so FE does **not** need an immediate second API call after page refresh.

Recommended payload for `GET /auth/check-auth`:

```json
{
  "data": {
    "user": {
      "id": "...",
      "username": "...",
      "email": "...",
      "role": "PLAYER",
      "country": "VN",
      "avatar": "...",
      "isPremium": false,
      "isActive": true,
      "createdAt": "2026-03-21T14:30:00.000Z"
    },
    "activeRoom": null
  },
  "message": "Authenticated"
}
```

`activeRoom` helps FE restore an unfinished online match without extra round-trips.

## 2. Profile APIs
Base Path: `/api/v1/profile`

These APIs manage user profile data and provide an optimized overview payload for the Profile page.

| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| GET | `/profile` | Yes | Get current user's base profile | Yes |
| GET | `/profile/overview` | Yes | Get profile + subscription + recent game stats in one call | Yes |
| PUT | `/profile/update` | Yes | Update username, email, or country | Yes |
| PATCH | `/profile/password` | Yes | Change current user's password | Yes |
| POST | `/profile/avatar` | Yes | Upload avatar image | Yes |

```json
{
  "data": {
    "user": { "id": "...", "username": "...", "email": "...", "role": "PLAYER", "country": "VN", "avatar": "...", "isPremium": true, "isActive": true, "createdAt": "..." },
    "subscription": { "isPremium": true, "premiumExpiresAt": "2026-06-01T00:00:00.000Z" },
    "stats": {
      "totalGames": 120,
      "wins": 55,
      "losses": 40,
      "draws": 15,
      "aborted": 10
    },
    "recentGames": []
  },
  "message": "Profile overview fetched successfully"
}
```

## 3. Game History & Replay APIs
Base Path: `/api/v1/games`

These APIs cover local play history, AI history, online match history, search/filter/sort, and replay data.

| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| POST | `/games` | Yes | Save a completed local / local-vs-local / AI game session | Yes |
| GET | `/games` | Yes | List current user's game sessions with pagination, search, filter, and sort | Yes |
| GET | `/games/:id` | Yes | Get one game session detail including replay payload | Yes |

### `POST /games`
Use this endpoint for **non-online matches created on the frontend**:
- `SINGLE_PLAYER`
- `TWO_PLAYERS`

Online matches should be persisted automatically by the server when the room ends.

### `GET /games` query params
| Query | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Page size |
| `q` | string | Search by session number or opponent name |
| `gameType` | string | `SINGLE_PLAYER`, `TWO_PLAYERS`, `ONLINE_MATCH` |
| `result` | string | `WIN`, `LOSE`, `DRAW`, `ABORTED` (viewer perspective) |
| `from` | ISO date | Start date filter |
| `to` | ISO date | End date filter |
| `sortBy` | string | Usually `createdAt` or `startTime` |
| `sortOrder` | string | `asc` or `desc` |

## 4. Room Snapshot APIs
Base Path: `/api/v1/rooms`

Room creation/join/leave/gameplay happen through WebSocket. HTTP is used only for **initial snapshot** and **recovery/reconnect**.

| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| GET | `/rooms` | Yes | Get current arena snapshot (all joinable or active rooms) | Yes |
| GET | `/rooms/:id` | Yes | Get one room snapshot for reconnect/recovery | Yes |
|

### `GET /rooms` query params
| Query | Type | Description |
|---|---|---|
| `status` | string | `WAITING`, `READY`, `PLAYING` |
| `boardSize` | number | `10` or `15` |
| `page` | number | Optional pagination for large arenas |
| `limit` | number | Optional page size |
|

### Why only snapshot APIs are HTTP
To minimize API calls and avoid broadcast storms, the arena page should:
1. Call `GET /rooms?status=WAITING` once for initial render.
2. Use a manual **Refresh button** to call the API again when the user wants to update the list.

## 5. Subscription APIs
Base Path: `/api/v1/subscription`

| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| GET | `/subscription/status` | Yes | Get premium status and expiry date | Yes |
| POST | `/subscription/create-order` | Yes | Generate PayPal payment link/order ID | Yes |
| POST | `/subscription/capture-order` | Yes | Validate PayPal successful payment and activate premium | Yes |
| GET | `/subscription/history` | Yes | Current Subscription Details — returns an array with 1 item (the active transaction) or 0 items (if expired/none) | Yes |
| POST | `/subscription/paypal-events` | No | Listen for PayPal async events to revoke premium | Yes |

### Notes
- **Active Record Only:** The database enforces a 1-to-1 relationship between a user and their active subscription transaction. The `/history` endpoint reflects this by only returning the current active transaction. Expired transactions are automatically cleaned up via MongoDB TTL indexes.
- `POST /subscription/create-order` saves the pending PayPal order using an `upsert`, which can overwrite the user's current active `Transaction` record even if checkout is never completed. A successful `capture-order` then validates that pending order and activates premium.
- If a `REFUND` or `CHARGEBACK` webhook event is received from PayPal, the system must update the corresponding `Transaction` status to `REFUNDED` and reset the user's `premiumExpiresAt` to null/past.
## 6. Admin APIs
Base Path: `/api/v1/admin`

All endpoints require `ADMIN` role.

### 6.1 Dashboard
| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| GET | `/admin/dashboard` | Admin | Aggregated dashboard metrics for the admin home screen | Yes |

Admin dashboard data:
- totalPlayers
- activePlayers
- premiumPlayers
- registeredToday
- registeredThisWeek
- registeredThisMonth
- activeRooms
- totalMatches
- totalRevenue

This avoids multiple parallel admin summary calls.

### 6.2 Player Management
| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| GET | `/admin/players` | Admin | List players with pagination and filters | Yes |
| GET | `/admin/player/:id` | Admin | Get one player's admin detail | Yes |
| PATCH | `/admin/player/:id/deactivate` | Admin | Deactivate account | Yes |
| PATCH | `/admin/player/:id/reactivate` | Admin | Reactivate account | Yes |

#### `GET /admin/players` query params
| Query | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Page size |
| `q` | string | Search by username or email |
| `status` | string | `ACTIVE` or `INACTIVE` |
| `premium` | boolean | Filter by premium status |
| `sortBy` | string | `createdAt`, `username`, `lastLoginAt` |
| `sortOrder` | string | `asc` or `desc` |
|

### 6.3 Room Monitoring
| Method | Endpoint | Auth | Description | Implemented |
|---|---|---:|---|---|
| GET | `/admin/rooms` | Admin | List active/waiting rooms | Yes |
| GET | `/admin/rooms/:id` | Admin | Get room detail and live snapshot | Yes |
| DELETE | `/admin/rooms/:id` | Admin | Force close a room | Yes |

## 7. WebSocket Contract
Namespace/Endpoint: `/ws/game`

The team policy already defines the event naming format as `namespace:action` and requires object payloads.

### 7.1 Client → Server
| Event | Payload | Description |
|---|---|---|
| `room:create` | `{ boardSize, marker, boardStyle, markerStyle }` | Create a room. Room status becomes `WAITING`. |
| `room:join` | `{ roomId }` | Join an existing room. Room status becomes `READY`. |
| `room:set_first_turn` | `{ roomId, firstTurnParticipantIndex }` | Host selects who goes first. Resets `isReady` flag for both players. |
| `room:ready` | `{ roomId }` | Player confirms ready. Renders Checkmark on UI. |
| `room:leave` | `{ roomId }` | Leave a room before or during match. |
| `game:move` | `{ roomId, row, col }` | Submit one move. |
| `chat:send` | `{ roomId, message }` | Send in-game chat message. |
| `room:update_settings` | `{ roomId, boardStyle, markerStyle, marker }` | Host changes game settings in lobby. Resets `isReady` for both. |

### 7.2 Server → Client
| Event | Payload | Description |
|---|---|---|
| `room:updated` | `{ room }` | Room snapshot updated (Player joined, someone left, host changed settings, etc.) |
| `room:removed` | `{ roomId }` | Room destroyed (e.g., both players left or room timed out) |
| `game:start` | `{ roomId, startedAt }` | Both players are ready. Match begins. |
| `game:state` | `{ roomId, board, currentTurnParticipantIndex, lastMove, moveCount, status }` | Authoritative game state update |
| `player:disconnected` | `{ roomId, timeLeft }` | Opponent disconnected. Grace period (60s) countdown starts. |
| `player:reconnected` | `{ roomId }` | Opponent reconnected. Grace period cancelled. Game resumes. |
| `account:deactivated` | `{ message, reason }` | Sent specifically to a user when Admin deactivates their account. FE should display notification and call logout API. |
| `game:ended` | `{ roomId, winnerParticipantIndex, winningLine, result, endedAt }` | Match ended. Room resets back to `READY` status for rematch. |
| `chat:message` | `{ roomId, sender, message, timestamp }` | New chat message |
| `error` | `{ vent, error, message, cause, valid_example }` | Generic socket error |

### Recommended server behavior
- Rooms are **NOT** broadcasted on creation to prevent server overload. Clients use `GET /rooms` API with pagination.
- When player 2 joins, room becomes `READY`. Broadcast `room:updated`.
- When both players trigger `room:ready`, status becomes `PLAYING` and server emits `game:start`.
- **Grace Period**: If a player drops during `PLAYING`, emit `player:disconnected` and wait 60s before aborting the match.
- **Rehydration**: When a client establishes a socket connection, if the backend detects they are part of an ongoing `PLAYING` match, the server should automatically emit `game:state` so FE can redraw the board.