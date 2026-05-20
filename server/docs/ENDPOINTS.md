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

| Method | Endpoint | Access | Description | Implemented |
|---|---|---:|---|---|
| POST | `/auth/register` | PULIC | Register a new player | Yes |
| POST | `/auth/login` | PUBLIC | Login with username/email and password | Yes |
| POST | `/auth/logout` | AUTHENTICATED | Clear auth cookie and logout current user | Yes |
| GET | `/auth/check-auth` | AUTHENTICATED | Validate session and return current session payload | Yes |

### Notes
`activeRoom` helps FE restore an unfinished online match without extra round-trips in [GET] `check-auth` endpoint.

## 2. Profile APIs
Base Path: `/api/v1/profile`

These APIs manage user profile data and provide an optimized overview payload for the Profile page.

| Method | Endpoint | Access | Description | Implemented |
|---|---|---:|---|---|
| GET | `/profile` | AUTHENTICATED | Get current user's base profile | Yes |
| GET | `/profile/overview` | AUTHENTICATED | Get profile + subscription + recent game stats in one call | Yes |
| PUT | `/profile/update` | AUTHENTICATED | Update username, email, or country | Yes |
| PATCH | `/profile/password` | AUTHENTICATED | Change current user's password | Yes |
| POST | `/profile/avatar` | AUTHENTICATED | Upload avatar image | Yes |

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

| Method | Endpoint | Access | Description | Implemented |
|---|---|---:|---|---|
| POST | `/games` | PLAYER | Save a completed local / local-vs-local / AI game session | Yes |
| GET | `/games` | PLAYER | List current user's game sessions with pagination, search, filter, and sort | Yes |
| GET | `/games/:id` | PLAYER | Get one game session detail including replay payload | Yes |

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

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/rooms` | PLAYER | Arena snapshot of joinable/active rooms |
| GET | `/rooms/:id` | PLAYER | Single room snapshot for rehydration |

### `GET /rooms` query params
| Query | Type | Description |
|---|---|---|
| `status` | string | `WAITING`, `READY`, `PLAYING` |
| `boardSize` | number | `10` or `15` |
| `page` | number | Optional pagination for large arenas |
| `limit` | number | Optional page size |

## 5. Subscription APIs
Base Path: `/api/v1/subscription`

| Method | Endpoint | Access | Description | Implemented |
|---|---|---:|---|---|
| GET | `/subscription/status` | PLAYER | Get premium status and expiry date | Yes |
| POST | `/subscription/create-order` | PLAYER | Generate PayPal payment link/order ID | Yes |
| POST | `/subscription/capture-order` | PLAYER | Validate PayPal successful payment and activate premium | Yes |
| GET | `/subscription/history` | PLAYER | Returns current active transaction | Yes |
| POST | `/subscription/paypal-events` | PUBLIC | Listen for PayPal async events to revoke premium | Yes |

## 6. Admin APIs
Base Path: `/api/v1/admin`

*All endpoints require `ADMIN` role.*

### 6.1 Dashboard
| Method | Endpoint | Access | Description | Implemented |
|---|---|---:|---|---|
| GET | `/admin/dashboard` | ADMIN | Aggregated dashboard metrics for the admin home screen | Yes |

### 6.2 Player Management
| Method | Endpoint | Access | Description | Implemented |
|---|---|---:|---|---|
| GET | `/admin/players` | ADMIN | List players with pagination and filters | Yes |
| GET | `/admin/player/:id` | ADMIN | Get one player's admin detail | Yes |
| PATCH | `/admin/player/:id/deactivate` | ADMIN | Deactivate account | Yes |
| PATCH | `/admin/player/:id/reactivate` | ADMIN | Reactivate account | Yes |

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
| Method | Endpoint | Access | Description | Implemented |
|---|---|---:|---|---|
| GET | `/admin/rooms` | ADMIN | List active/waiting rooms | Yes |
| GET | `/admin/rooms/:id` | ADMIN | Get room detail and live snapshot | Yes |
| DELETE | `/admin/rooms/:id` | ADMIN | Force close a room | Yes |
| `GET` | `/api/v1/admin/players/game` | ADMIN | Fetch completed online match history across all players | Yes

## 7. WebSocket Contract
Namespace/Endpoint: `/ws/game`

The team policy already defines the event naming format as `namespace:action` and requires object payloads.

### 7.1 Client → Server
| Event | Payload | Description |
|---|---|---|
| `room:create` | `{ boardSize, marker, boardStyle, markerStyle }` | Create a room. `markerStyle` applies to the Host participant. Room status becomes `WAITING`. |
| `room:join` | `{ roomId, markerStyle }` | Join an existing room. |
| `room:set_first_turn` | `{ roomId, firstTurnParticipantIndex }` | Host selects who goes first. Resets `isReady` flag for both players. |
| `room:ready` | `{ roomId }` | Player confirms ready. Renders Checkmark on UI. |
| `room:leave` | `{ roomId }` | Leave a room before or during match. |
| `game:move` | `{ roomId, row, col }` | Submit one move. |
| `chat:send` | `{ roomId, message }` | Send in-game chat message. |
| `room:update_settings` | `{ roomId, boardStyle, markerStyle, marker }` | Host configures lobby settings. |

### 7.2 Server → Client
| Event | Payload | Description |
|---|---|---|
| `room:updated` | `{ room: { ..., participants: [{ ..., markerStyle, ... }, { ..., markerStyle, ... }], ... } }` | Room parameters or participant list changed |
| `room:removed` | `{ roomId }` | Room destroyed |
| `game:start` | `{ roomId, startedAt }` | Both players are ready. Match begins. |
| `game:state` | `{ roomId, board, currentTurnParticipantIndex, lastMove, moveCount, status, participants: [{ ..., markerStyle, ... }, ...] }` | Complete board state for rehydration |
| `player:disconnected` | `{ roomId, timeLeft }` | Opponent disconnected. Grace period (60s) countdown starts. |
| `player:reconnected` | `{ roomId }` | Opponent reconnected. Grace period cancelled. Game resumes. |
| `account:deactivated` | `{ message, reason }` | Admin termination signal. |
| `game:ended` | `{ roomId, winnerParticipantIndex, winningLine, result, endedAt }` | Match ended. Room resets back to `READY` status for rematch. |
| `chat:message` | `{ roomId, sender, message, timestamp }` | New chat message |
| `error` | `{ vent, error, message, cause, valid_example }` | Standardized failure format |