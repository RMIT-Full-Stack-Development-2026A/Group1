# TicTacToang Backend Architecture

Modular Monolith structure with strict N-Tier dependency flow and socket-first online game flow.

## 1. Architectural Principles

### 1.1 Modular Monolith
Single deployable Node.js application divided into bounded contexts. Each module **Owns** its business rules, DTOs, repositories, and models.

### 1.2 N-Tier Flow
Dependencies flow in one direction:
`Route/Socket` → `Controller` → `Service` → `Repository/Interface` → `Model`

**Rules:**
- Routes/sockets never access models directly.
- Services never bypass repositories.
- Cross-module access requires interfaces. No direct service imports.
- DTOs format responses and hide sensitive fields.
- EventBus (Pub/Sub) handles cross-domain execution decoupling.

### 1.3 API Strategy
- **HTTP:** Authentication, profiles, history, subscriptions, admin actions, room snapshots, rehydration.
- **WebSocket:** Room lifecycle, moves, game state sync, premium chat.

## 2. High-Level Folder Structure

```text
server/
├── src/
│   ├── config/                  # Global configuration (DB, Swagger, Multer, Cloudinary)
│   ├── middlewares/             # Shared Express middlewares (Auth, Roles, Errors, Rate Limit)
│   ├── modules/                 # Bounded contexts (Modular Monolith)
│   │   ├── auth/                   # Owns User model (Registration, Login, Sessions)
│   │   ├── profile/                # Orchestration layer (No model, aggregates user data)
│   │   ├── game/                   # Owns GameSession model (History, Replays, Stats)
│   │   ├── room/                   # Owns GameRoom model (Live WebSocket state)
│   │   ├── subscription/           # Owns Transaction model (PayPal orders, Webhooks)
│   │   └── countries/              # Support call REST Country API (externnal puplic API)
│   │   └── admin/                  # Orchestration layer (No model, dashboards & moderation)
│   ├── seed/                    # Database seeders for initial data and testing
│   ├── sockets/                 # Socket.io bootstrap, namespaces, and emitters
│   ├── tests/                   # Test suites and setup files
│   ├── utils/                   # Helpers, constants, and the internal EventBus
│   └── app.js                   # Express application setup
├── docs/                        # API documentation and markdown guides
├── .env                         # Environment variables (BE)
├── index.js                 # Entry point: HTTP + WebSocket server bootstrap
├── jest.config.js               # Jest testing framework configuration
├── package-lock.json            # Dependency lockfile
└── package.json                 # Project metadata and dependencies
```

## 3. Module **Responsibilities**
### 3.1 `auth` Module

****Owns****: User model.

**Responsibilities**: Registration, login, password hashing, brute-force protection, JWT cookie management, session payloads.

### 3.2 `profile` Module

**Owns**: No model.

**Responsibilities**: Orchestrates user updates, password changes, avatar uploads, and aggregates profile overview data via interfaces.

### 3.3 `game` Module

**Owns**: GameSession model.

**Responsibilities**: Persists finished matches, handles paginated history, provides replay payloads, calculates user and global statistics.

### 3.4 `room` Module

**Owns**: GameRoom model.

**Responsibilities**: Manages live WebSocket room state, enforces turn rules, broadcasts state updates, validates premium chat, persists completed rooms to GameSession.

### 3.5 `subscription` Module

**Owns**: Transaction model.

**Responsibilities**: Processes PayPal orders, handles webhooks, manages premiumExpiresAt state, tracks revenue metrics.

### 3.6 `admin` Module

**Owns**: No model.

**Responsibilities**: Aggregates dashboard metrics, manages player statuses, monitors live rooms, executes force-closures.

### 3.7 `countries` Module

**Owns**: No model.

**Responsibilities**: Acts as a backend proxy and caching layer for external country APIs. Solves frontend CORS issues, prevents external rate limiting, and returns formatted country lists and flag assets.