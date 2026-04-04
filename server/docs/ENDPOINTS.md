# TicTacToang Backend API Endpoints

This document defines the **recommended server contract** for TicTacToang so that it matches the SRS, respects the team policy, and minimizes unnecessary API calls by:

- using **HTTP for authentication, profile, history, wallet, subscription, and admin actions**
- using **WebSocket for live room lifecycle, gameplay, and in-game chat**
- providing **aggregate/overview endpoints** for screens that would otherwise require multiple requests

Base API URL: `/api/v1`

---

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

---

## 1. Authentication APIs
Base Path: `/api/v1/auth`

These APIs handle account creation, login, logout, and session bootstrap.

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| POST | `/auth/register` | No | Register a new player |
| POST | `/auth/login` | No | Login with username/email and password |
| POST | `/auth/logout` | Yes | Clear auth cookie and logout current user |
| GET | `/auth/check-auth` | Yes | Validate session and return current session payload |

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

---

## 2. Profile APIs
Base Path: `/api/v1/profile`

These APIs manage user profile data and provide an optimized overview payload for the Profile page.

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/profile` | Yes | Get current user's base profile |
| GET | `/profile/overview` | Yes | Get profile + subscription + wallet summary + recent game stats in one call |
| PUT | `/profile/update` | Yes | Update username, email, or country |
| PATCH | `/profile/password` | Yes | Change current user's password |
| POST | `/profile/avatar` | Yes | Upload avatar image |

### Why `GET /profile/overview`
This endpoint is intentionally aggregated so the Profile screen does **not** need to call `/profile`, `/wallet`, `/subscription/status`, and `/games` separately.

Recommended `GET /profile/overview` payload:

```json
{
  "data": {
    "user": { "id": "...", "username": "...", "email": "...", "role": "PLAYER", "country": "VN", "avatar": "...", "isPremium": true, "isActive": true, "createdAt": "..." },
    "wallet": { "balance": 35 },
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

---

## 3. Game History & Replay APIs
Base Path: `/api/v1/games`

These APIs cover local play history, AI history, online match history, search/filter/sort, and replay data.

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| POST | `/games` | Yes | Save a completed local / local-vs-local / AI game session |
| GET | `/games` | Yes | List current user's game sessions with pagination, search, filter, and sort |
| GET | `/games/:id` | Yes | Get one game session detail including replay payload |

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
|

### Why there is no `/games/:id/moves`
Replay data should be returned by `GET /games/:id` so the replay page needs only **one request**.

---

## 4. Room Snapshot APIs
Base Path: `/api/v1/rooms`

Room creation/join/leave/gameplay happen through WebSocket. HTTP is used only for **initial snapshot** and **recovery/reconnect**.

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/rooms` | Yes | Get current arena snapshot (all joinable or active rooms) |
| GET | `/rooms/:id` | Yes | Get one room snapshot for reconnect/recovery |
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
To minimize API calls, the arena page should:
1. call `GET /rooms` once for initial render
2. subscribe to WebSocket room events for all updates thereafter

---

## 5. Wallet APIs
Base Path: `/api/v1/wallet`

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/wallet` | Yes | Get current wallet balance and latest transaction summary |
| POST | `/wallet/deposit` | Yes | Deposit funds into local wallet |
| GET | `/wallet/transactions` | Yes | Get paginated transaction history |

### `GET /wallet`
Recommended response:

```json
{
  "data": {
    "balance": 50,
    "recentTransactions": []
  },
  "message": "Wallet fetched successfully"
}
```

This prevents a separate automatic call to `/wallet/transactions` on initial wallet screen load.

---

## 6. Subscription APIs
Base Path: `/api/v1/subscription`

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/subscription/status` | Yes | Get premium status and expiry date |
| POST | `/subscription/subscribe` | Yes | Purchase monthly premium using wallet balance |
| GET | `/subscription/history` | Yes | Get subscription payment history |

### Notes
- A successful subscription purchase should update premium state and trigger confirmation email.
- Subscription history may be implemented by filtering `Transaction` records with type `SUBSCRIPTION`.

---

## 7. Admin APIs
Base Path: `/api/v1/admin`

All endpoints require `ADMIN` role.

### 7.1 Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/admin/dashboard` | Admin | Aggregated dashboard metrics for the admin home screen |

Recommended dashboard data:
- totalPlayers
- activePlayers
- premiumPlayers
- activeRooms
- totalMatches
- totalRevenue

This avoids multiple parallel admin summary calls.

### 7.2 Player Management
| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/admin/players` | Admin | List players with pagination and filters |
| GET | `/admin/player/:id` | Admin | Get one player's admin detail |
| PATCH | `/admin/player/:id/deactivate` | Admin | Deactivate account |
| PATCH | `/admin/player/:id/reactivate` | Admin | Reactivate account |

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

### 7.3 Room Monitoring
| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| GET | `/admin/rooms` | Admin | List active/waiting rooms |
| GET | `/admin/rooms/:id` | Admin | Get room detail and live snapshot |
| DELETE | `/admin/rooms/:id` | Admin | Force close a room |

---

## 8. WebSocket Contract
Namespace/Endpoint: `/ws/game`

The team policy already defines the event naming format as `namespace:action` and requires object payloads.

### 8.1 Client → Server
| Event | Payload | Description |
|---|---|---|
| `room:create` | `{ boardSize, marker }` | Create a room and choose host marker preference |
| `room:join` | `{ roomId }` | Join an existing room |
| `room:leave` | `{ roomId }` | Leave a room before or during match |
| `game:move` | `{ roomId, row, col }` | Submit one move |
| `chat:send` | `{ roomId, message }` | Send in-game chat message (premium only) |

### 8.2 Server → Client
| Event | Payload | Description |
|---|---|---|
| `room:created` | `{ room }` | Room successfully created |
| `room:updated` | `{ room }` | Room snapshot updated (join, leave, ready, play, close) |
| `room:removed` | `{ roomId }` | Room removed from arena |
| `game:state` | `{ roomId, board, currentTurn, lastMove, moveCount, status }` | Authoritative game state update |
| `game:ended` | `{ roomId, winner, winLine, result }` | Match ended |
| `chat:message` | `{ roomId, sender, message, timestamp }` | New chat message |
| `error` | `{ message }` | Generic socket error |

### Recommended server behavior
- When player 2 joins, broadcast `room:updated`
- When player 2 chooses their mark and the match becomes ready, broadcast `room:updated`
- When the first move is allowed, broadcast `game:state`
- When a player aborts, emit `game:ended` with `result: "ABORTED"` and remove/close the room

---

## 9. Suggested Screen-to-API Mapping (Optimized)

### App bootstrap
- `GET /auth/check-auth`
- open WebSocket only after auth is confirmed

### Profile page
- `GET /profile/overview`
- optional follow-up only when user opens full transaction/history screens

### Arena page
- `GET /rooms`
- then rely on WebSocket updates

### Replay page
- `GET /games/:id`
- no second call for moves

### Admin home
- `GET /admin/dashboard`
- then specific tables only when the admin opens each section

---

## 10. Summary of Changes vs Current Draft

1. Added missing `GET /profile`
2. Added `GET /profile/overview` to reduce multiple profile-related requests
3. Added `POST /games` for local and AI match persistence
4. Removed separate `/games/:id/moves` because replay data should come from `GET /games/:id`
5. Reframed `/rooms` as **snapshot-only HTTP** and moved create/join/leave/gameplay to WebSocket
6. Added `GET /admin/dashboard` to reduce multi-call admin loading
7. Standardized search/filter/sort query names
8. Explicitly aligned the contract with cookie auth, pagination, DTO, and WebSocket naming policy
