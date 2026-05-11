# TicTacToang Backend Architecture

This backend architecture follows a **Modular Monolith** structure with a strict **N-Tier** dependency flow and a **socket-first online game flow**.

It is aligned with the revised API contract, revised MongoDB models, the team policy, and the SRS requirements for authentication, profile management, game history/replay, premium subscription, admin monitoring, and real-time online TicTacToe gameplay.

(Note: The legacy Wallet system has been explicitly removed in favor of direct PayPal checkouts to reduce friction).

## 1. Architectural Principles

### 1.1 Modular Monolith
The backend is one deployable Node.js application, but internally split into bounded contexts. Each module owns its own business rules, DTOs, repositories, and model access.

### 1.2 N-Tier Flow
Inside each module, dependencies must flow in one direction only:

```text
Route / Socket Handler
        ↓
Controller / Gateway Handler
        ↓
Service
        ↓
Repository / Interface (module don't contain model)
        ↓
Model
```

Rules:
- Routes and socket handlers never talk directly to models.
- Services never bypass repositories.
- Cross-module access must go through **interfaces**, never by importing another module's service directly.
- DTOs are mandatory for shaping responses and hiding sensitive fields.
- Event-Driven Decoupling: For actions that cross execution domains (e.g., an Admin HTTP request needing to disconnect a WebSocket), an internal Event Bus (Pub/Sub) is used to maintain strict separation of concerns.

### 1.3 API Strategy: HTTP for snapshot/persistence, WebSocket for live state
To minimize API calls and match the SRS real-time requirements:

- **HTTP** is used for authentication, profile, history, subscription, admin operations, initial room snapshots, and reconnect recovery.
- **WebSocket** is used for room creation, room joining, room leaving, move submission, room updates, game state sync, and premium chat.

This means the backend is intentionally **socket-first** for online multiplayer.

## 2. High-Level Folder Structure

```text
backend/
├── src/
│   ├── config/                            # Database, env, CORS, cookie, socket, and app-level config
│   ├── middlewares/                       # Shared Express middlewares
│   │   ├── authMiddleware.js              # Validates access_token cookie and sets req.user
│   │   ├── roleMiddleware.js              # Enforces RBAC (PLAYER / ADMIN)
│   │   ├── errorMiddleware.js             # Centralized error response formatter
│   │   └── rateLimitMiddleware.js         # Shared request throttling where needed
│   ├── utils/                             # Helpers, constants, mappers, validators, logger
│   │   └── eventBus.util.js               # Internal Pub/Sub for cross-module
│   ├── sockets/                           # Socket.io bootstrap and namespace wiring
│   │   ├── index.js                       # Socket server initialization
│   │   ├── namespaces/
│   │   │   └── game.namespace.js          # Registers /ws/game events
│   │   ├── middleware/
│   │   │   └── socketAuthMiddleware.js    # Authenticates socket user from cookie/JWT
│   │   └── emitters/                      # Shared socket payload builders / broadcasters
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/                    # OWNS User model
│   │   │   ├── dtos/
│   │   │   ├── validators/
│   │   │   └── interfaces/                # Exposes user/session read operations to other modules
│   │   │
│   │   ├── profile/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── dtos/
│   │   │   └── validators/                # Optional if FE-facing aggregate queries are reused elsewhere
│   │   │
│   │   ├── game/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/                    # OWNS GameSession model
│   │   │   ├── dtos/
│   │   │   ├── validators/
│   │   │   └── interfaces/                # Exposes game persistence/statistics/history operations
│   │   │
│   │   ├── room/
│   │   │   ├── routes/                    # HTTP snapshot/recovery endpoints only
│   │   │   ├── controllers/
│   │   │   ├── socket-handlers/           # room:create, room:join, room:leave, game:move, chat:send
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/                    # OWNS GameRoom model
│   │   │   ├── dtos/
│   │   │   ├── validators/
│   │   │   └── interfaces/                # Exposes room snapshot/admin operations
│   │   │
│   │   ├── subscription/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/                    # OWNS Transaction model
│   │   │   ├── dtos/
│   │   │   ├── validators/
│   │   │   └── interfaces/                # Exposes subscription history and revenue metrics
│   │   │
│   │   └── admin/
│   │       ├── routes/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── dtos/
│   │       └── validators/                
│   │
│   ├── app.js                             # Express app bootstrap
│   └── index.js                           # HTTP + WebSocket server bootstrap
├── docs/
└── package.json
```

## 3. Module Responsibilities

## 3.1 `auth` module
**Owns:** `User` model and all login/session logic.

### Responsibilities
- Register new player accounts
- Login using username/email + password
- Hash and verify passwords
- Enforce brute-force protection via `loginAttempts` and `lockUntil`
- Write and clear `access_token` httpOnly cookie
- Provide current authenticated session payload
- Provide shared user lookups to other modules through interfaces

### Public HTTP endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/check-auth`

### Important design note
`GET /auth/check-auth` should return:
- current DTO-safe user object
- `activeRoom` snapshot if the user is still attached to a live room

## 3.2 `profile` module
**Owns:** No standalone database model.

This module is an **application orchestration layer** around current-user operations.

### Responsibilities
- Read current user's profile from `auth` interfaces
- Update username, email, country, and password
- Handle avatar upload flow
- Build an aggregated profile overview response using:
  - `auth` interface for user data and premium-expiry info
  - `game` interface for recent games and stats

### Public HTTP endpoints
- `GET /api/v1/profile`
- `GET /api/v1/profile/overview`
- `PUT /api/v1/profile`
- `PATCH /api/v1/profile/password`
- `POST /api/v1/profile/avatar`

### Why this module has no own model
The team policy defines one consistent user shape, and the data already belongs primarily to `auth`, and `game`. Therefore `profile` should aggregate instead of duplicating persistence.

## 3.3 `game` module
**Owns:** `GameSession` model.

### Responsibilities
- Persist finished local matches, local two-player matches, and AI matches via HTTP
- Persist finished or aborted online matches when signaled by the `room` module
- Provide paginated history with search/filter/sort
- Return one-match replay payload in a single response
- Produce aggregate stats for profile and admin dashboards

### Public HTTP endpoints
- `POST /api/v1/games`
- `GET /api/v1/games`
- `GET /api/v1/games/:id`

### Architectural note
`GET /games/:id` returns the replay payload directly. There is intentionally no separate `/moves` endpoint because replay should be fetched in one request.

## 3.4 `room` module
**Owns:** `GameRoom` model and the authoritative online match state.

This is the most important change from the old design: **online room lifecycle is socket-first**.

### Responsibilities
- Maintain live room state for online multiplayer
- Expose HTTP room snapshots for initial arena load and reconnect recovery
- Handle socket events for room lifecycle and gameplay
- Enforce move validity and current-turn rules on the server
- Broadcast room and game state updates to connected clients
- Trigger chat permission checks for premium-only chat
- Persist online match result into `GameSession` when the room ends

### Public HTTP endpoints
- `GET /api/v1/rooms` (Used with manual refresh to prevent broadcast storms)
- `GET /api/v1/rooms/:id`

### Socket events handled here
**Client → Server**
- `room:create`
- `room:join`
- `room:leave`
- `game:move`
- `chat:send`
- `room:update_settings`
- `room:set_first_turn`
- `room:ready`

**Server → Client**
- `room:created`
- `room:updated`
- `room:removed`
- `game:state`
- `game:ended`
- `chat:message`
- `error`
- `game:start`
- `player:disconnected`
- `player:reconnected`

### Key room design rule
HTTP never becomes the primary online gameplay channel. The frontend should:
1. Call GET /rooms once to render the arena snapshot. Use manual refresh for updates.
2. subscribe to socket events for all subsequent updates
3. call `GET /rooms/:id` only for reconnect/recovery if needed

## 3.5 `subscription` module
**Owns:** `Transaction` model.

### Responsibilities
- Check current premium state from `User.premiumExpiresAt`
- Handle direct checkout flow via external payment providers (PayPal)
- Validate webhooks/capture orders from payment providers
- Handle async payment events (e.g., Refunds, Chargebacks) to revoke premium access
- Extend premium period upon successful payment
- Maintain immutable transaction (payment invoice) history
- Expose revenue metrics for the admin dashboard

### Public HTTP endpoints
- `GET /api/v1/subscription/status`
- `POST /api/v1/subscription/create-order`
- `POST /api/v1/subscription/capture-order`
- `POST /api/v1/subscription/paypal-events `
- `GET /api/v1/subscription/history`

### Architectural note
- The source of truth for premium state is `User.premiumExpiresAt`. The `Transaction` model acts strictly as a financial audit log for successful payments.

## 3.6 `admin` module
**Owns:** No standalone model. It orchestrates other modules.

### Responsibilities
- Provide aggregated dashboard metrics
- Manage player account status
- Monitor active rooms
- Force close rooms
- Read platform-wide metrics across users, games, transactions, and active rooms

### Public HTTP endpoints
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/players`
- `GET /api/v1/admin/players/:id`
- `PATCH /api/v1/admin/players/:id/deactivate`
- `PATCH /api/v1/admin/players/:id/reactivate`
- `GET /api/v1/admin/rooms`
- `GET /api/v1/admin/rooms/:id`
- `DELETE /api/v1/admin/rooms/:id`

### Architectural note
`admin` must use interfaces from:
- `auth` for player listing and account state
- `room` for live room monitoring and force close
- `game` for match metrics
- `subscription` for revenue summaries if included in dashboard

## 4. Data Ownership and Model Boundaries

## 4.1 `User` model ownership
Owned only by `auth`.

### Main fields
- identity: `username`, `email`, `country`, `role`
- security: `passwordHash`, `auth.lastLoginAt`, `auth.loginAttempts`, `auth.lockUntil`
- account state: `isActive`
- premium state: `premiumExpiresAt` and derived `isPremium`
- media: `avatar`

### Why this shape is better
- avoids exposing plain `password`
- keeps premium as a date-driven state instead of a stale boolean


## 4.2 `GameSession` model ownership
Owned only by `game`.

### Main fields
- `sessionNumber`
- `sourceRoomId` for online-match provenance
- `gameType`
- `boardSize`, `boardStyle`, `markerStyle`
- `participants[2]`
- `firstTurnParticipantIndex`
- `winnerParticipantIndex`
- `status`, `endedReason`, `abortedByUserId`
- `winningLine`
- `moves[]`
- `totalMoves`
- `startedAt`, `endedAt`, `durationMs`

### Why this shape is better
- one schema supports local, AI, and online matches consistently
- one document contains replay-ready data
- participant snapshots keep old history stable even after username changes
- admin force-close and player abort remain auditable

## 4.3 `GameRoom` model ownership
Owned only by `room`.

### Main fields
- `roomNumber`
- `boardSize`, `boardStyle`, `markerStyle`
- `status` = `WAITING | READY | PLAYING | ABORTED | CLOSED`
- `participants[]` (includes `isHost` and `isReady`)
- `firstTurnParticipantIndex`
- `currentTurnParticipantIndex`
- `moves[]`
- `moveCount`
- `winningLine`
- `lastMove`
- `startedAt`, `endedAt`
- `closedBy`

### Why this shape is better
- enough state for reconnect and live synchronization
- server can broadcast authoritative state without reconstructing from scratch every time
- avoids storing a full board matrix in MongoDB
- online room can be converted into `GameSession` cleanly when completed

## 4.4 `Transaction` model ownership
Owned only by `subscription`.

### Main fields
- `userId`
- `type` = `SUBSCRIPTION`
- `provider` = `PAYPAL` | `STRIPE`
- `amount`, `currency`
- `status`
- `externalTransactionId`
- `subscriptionPeriodStart`, `subscriptionPeriodEnd`
- `metadata`

### Why this shape is better
- supports subscription audit with one model
- enables payment-provider traceability
- keeps premium history queryable without separate subscription table

## 5. Socket-First Online Match Flow

The online game flow is centered in the `room` module and delivered through `/ws/game`.

## 5.1 Initial arena load & Broadcast Strategy
1. FE calls GET /api/v1/rooms?status=WAITING with pagination.
2. Backend returns the current room snapshot list.
3. Anti-Broadcast Storm: To protect server RAM, new rooms are NOT broadcasted globally. Users must manually refresh the arena list to fetch new rooms.

## 5.2 Room creation & Lobby customization
1. Authenticated player emits room:create with { boardSize, marker }.
2. Room service creates a GameRoom in WAITING.
3. Server emits room:created strictly to the creator.
4. Host can emit room:update_settings or room:set_first_turn. Server resets isReady flags to prevent cheating and emits room:updated.

## 5.3 Ready Phase & Game Start
1. Second player emits room:join -> Room becomes READY.
2. Both players emit room:ready.
3. Once both are ready, Server auto-transitions room to PLAYING and emits game:start.

## 5.4 Gameplay
1. Current player emits game:move with { roomId, row, col }.
2. Server validates turn, coordinate, and room status.
3. Server appends move, updates lastMove, runs Gomoku algorithm.
4. Server emits game:state.
5. If match ends (Win/Draw), server emits game:ended and resets room to READY for a potential rematch.

## 5.5 Connection Resilience (Grace Period & Rehydration)
- Grace Period: If a player disconnects during PLAYING, the server does NOT instantly abort. It emits player:disconnected and begins a 60-second countdown in memory. If the timer expires, the match is aborted.
- Rehydration: If a user reconnects (e.g., after an F5 refresh), the gameNamespace detects their activeRoom. It cancels the 60s timer, auto-joins them to the room, emits player:reconnected to the opponent, and pushes the latest game:state to redraw the board.

## 5.6 Premium chat
1. Player emits `chat:send`
2. Room service checks premium state through auth/session data
3. If allowed, server broadcasts `chat:message`
4. If not allowed, server emits socket `error`

## 5.7 Abort / leave / force close / ban
- If a player leaves normally or aborts, room state is closed consistently and online session is persisted.
- Event-Driven Kick: If an Admin deactivates a user, the admin service emits an internal admin:user_deactivated event. The Socket layer listens to this, tears down the user's active room (resulting in ADMIN_FORCE_CLOSE), emits a death notification, and severs the socket connection.

## 6. Cross-Module Interface Rules

To keep module boundaries clean:

- `profile` uses `auth`, `game`, and possibly `subscription` interfaces
- `room` uses `auth` interface for user/session validation and `game` interface to persist finished online matches
- `subscription` uses `auth`  interfaces
- `admin` uses `auth`, `room`, and `game` interfaces
- `Strict Decoupling`: No module directly imports another module's service. HTTP services must never directly import WebSocket instances (io). Instead, use the EventBus utility to broadcast internal signals.

No module should directly import another module's service or model.


## 7. DTO and Response Strategy

The backend must obey the policy response contract everywhere.

### Success
```json
{
  "data": {},
  "message": "..."
}
```

### Failure
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "cause": "Cause of error",
  "valid_example": "Example of valid inputs"
}
```

### DTO requirements
- expose `id`, never `_id`
- hide `passwordHash`
- keep JSON keys camelCase
- return ISO 8601 dates
- never expose internal-only financial or security fields unless the endpoint explicitly requires them

### Aggregated DTOs encouraged
To reduce calls, the architecture explicitly supports:
- `GET /auth/check-auth` returning `user + activeRoom`
- `GET /profile/overview` returning profile + subscription + stats + recent games
- `GET /games/:id` returning full replay payload
- `GET /admin/dashboard` returning admin summary metrics

## 8. Security and Middleware Placement

### HTTP middleware
- cookie parsing before auth middleware
- `authMiddleware` reads `access_token`
- `roleMiddleware` protects admin endpoints
- centralized error middleware formats all failures to policy shape

### Socket middleware
- socket auth middleware validates the same auth session before joining `/ws/game`
- socket handlers must reject inactive accounts
- premium chat permission must be rechecked server-side, never trusted from FE

### Additional security concerns
- brute-force login protection using `auth.loginAttempts` and `auth.lockUntil`
- avatar upload validation for file type and size
- no stack trace leakage in production errors

## 9. Performance and API Minimization Strategy

This architecture is intentionally optimized to minimize frontend-server chatter.

### Patterns used
- aggregate endpoints for overview pages
- socket push instead of room polling
- replay payload returned in one query
- balance snapshot on user record plus transaction audit log
- indexed search fields for history and admin listing
- room recovery via `activeRoom` in auth bootstrap and `/rooms/:id` when needed

### Key outcome
The frontend should not need to spam the server for:
- room list refreshes
- replay move lists
- multiple profile widgets
- multiple admin summary cards

## 10. Recommended Implementation Notes

- Keep WebSocket event names exactly as defined in policy: `namespace:action`
- Keep HTTP route naming plural and consistent: `/games`, `/rooms`, `/players`
- Keep `room` as the authoritative engine for online state, and `game` as the authoritative archive for completed sessions
- Keep `profile`, `subscription`, and `admin` as orchestration-heavy modules rather than unnecessary model-owning modules

## 11. Summary

The backend architecture is built around three core ideas:

1. **Strict module ownership** for models and business rules
2. **Socket-first online multiplayer** with HTTP used only for snapshots and persistence
3. **Aggregate response design** to reduce API calls and keep the frontend simple