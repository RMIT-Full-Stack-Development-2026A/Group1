# TicTacToang Architecture (Current Implementation)

This document describes the architecture currently present in this repository and maps architectural patterns to actual folders and files.

Scope note: This is an implementation-based architecture snapshot, not a target-state design. Where files/folders exist but are still empty, they are labeled as scaffolded.

## 1) Backend Architecture (Node.js + Express + MongoDB)

### 1.1 N-Tier Architecture (Route -> Controller -> Service -> Repository -> Model)

Backend layer structure is organized under `server/src/modules/*` and repeated per feature module:

- Route layer: `server/src/modules/*/routes/*.routes.js`
- Controller layer: `server/src/modules/*/controllers/*.controller.js`
- Service layer (business logic): `server/src/modules/*/services/*.service.js`
- Repository layer (data access abstraction): `server/src/modules/*/repositories/*.repository.js`
- Model layer (Mongoose schemas): `server/src/modules/*/models/*.model.js`

Current status by layer:

- Implemented:
  - Service logic: `server/src/modules/auth/services/auth.service.js`
  - Models: 
    - `server/src/modules/auth/models/user.model.js`
    - `server/src/modules/game/models/gameSession.model.js`
    - `server/src/modules/room/models/gameRoom.model.js`
    - `server/src/modules/wallet/models/transaction.model.js`
  - Route definitions (partial): `server/src/modules/auth/routes/auth.routes.js`
- Scaffolded (present but empty):
  - Most controllers, repositories, DTOs, interfaces, and routes outside auth
  - `server/src/modules/auth/controllers/auth.controller.js`
  - `server/src/modules/auth/repositories/auth.repository.js`
  - All files in admin/profile/game/room/subscription/wallet layers except model files listed above

Observed dependency direction in code:

- `auth.routes.js` imports `AuthController` and middleware
- `auth.service.js` imports `AuthRepository` and JWT utility
- Model files are isolated in `models/`

Important runtime gap:

- `server/src/app.js` configures middleware only (CORS, JSON, cookies) and currently does not mount module routers with `app.use(...)`.
- `auth.routes.js` references `verifyToken`, but `server/src/middlewares/authMiddleware.js` is currently empty.

### 1.2 Modular Monolith (Bounded Context Modules)

The backend is organized as a modular monolith under `server/src/modules`, where each folder is a bounded context:

- `auth`
- `profile`
- `game`
- `room`
- `subscription`
- `wallet`
- `admin`

Why this is modular monolith in this codebase:

- Single deployable Node.js process (`server/src/server.js` starts one app)
- Modules are separated by feature folder boundaries, but run in the same runtime and repository
- Shared infrastructure is centralized in:
  - `server/src/app.js` (Express app and common middleware)
  - `server/src/config/db.config.js` (MongoDB connection)
  - `server/src/utils/token.util.js` (JWT cookie utility)

Internal communication pattern (current state):

- Intended: Route -> Controller -> Service -> Repository -> Model within each module.
- Present: Mostly scaffolded boundaries; concrete cross-layer flow is only partially implemented in auth service/model code.

### 1.3 Security and Middleware (JWT + Role-Based Access)

Implemented security elements:

- JWT generation and secure cookie delivery in `server/src/utils/token.util.js`:
  - `jsonwebtoken.sign(...)` with `JWT_SECRET`
  - HTTP-only cookie
  - `sameSite: "strict"`
  - `secure` enabled in production
- Auth route protection intent in `server/src/modules/auth/routes/auth.routes.js`:
  - `POST /logout` uses `verifyToken`
  - `GET /check-auth` uses `verifyToken`

Current gaps (important for privilege escalation prevention):

- `server/src/middlewares/authMiddleware.js` is empty, so token verification logic is not currently implemented.
- `server/src/middlewares/roleMiddelware.js` is empty, so backend role guard logic is not currently implemented.
- Result: backend RBAC and JWT verification are declared architecturally but not fully enforced yet in executable middleware.

### 1.4 DTO Pattern (Data Transfer Objects)

DTO folder pattern exists in every backend module:

- `server/src/modules/*/dtos/*.dto.js`

Current status:

- DTO files are scaffolded and currently empty (for example `server/src/modules/auth/dtos/auth.dto.js`).
- No active DTO mapping/filtering functions are currently implemented in backend responses.
- Sensitive-field filtering is therefore not yet explicitly implemented via DTOs in current code.

## 2) Frontend Architecture (React + Vite)

### 2.1 Layer Hierarchy (Page, Component, Hook, Service, Reusable Utilities)

Frontend structure under `client/src` separates concerns into layers:

- Pages: `client/src/pages/*`
- Feature components: `client/src/components/*`
- Custom hooks: `client/src/hooks/*` and component-local hooks such as `useGame.hook.js`
- API config and service helpers:
  - `client/src/config/apiConfig.js`
  - `client/src/utils/httpHelper.js`
- Routing/authorization: `client/src/routes/*`
- Stores (global state): `client/src/stores/*`

Current implementation status:

- Implemented:
  - App composition and shell: `client/src/main.jsx`, `client/src/App.jsx`, `client/src/Layout.jsx`
  - Routing and guard shell: `client/src/routes/AppRouter.jsx`, `client/src/routes/ProtectedRoute.jsx`
  - Global API endpoint map: `client/src/config/apiConfig.js`
  - REST helper: `client/src/utils/httpHelper.js`
  - Global hook: `client/src/hooks/useScrollToTop.js`
- Scaffolded (present but empty):
  - Most page components under `client/src/pages/*/index.jsx`
  - Feature component packages under `client/src/components/GameBoard` and `client/src/components/Navigation`
  - Zustand stores in `client/src/stores/AuthStore.jsx` and `client/src/stores/ThemeStore.jsx`

### 2.2 Componentization (Package-Based Decoupling)

The codebase uses package-style component folders for feature UI units:

- `client/src/components/GameBoard/`
  - `index.jsx`
  - `useGame.hook.js`
  - `game.service.js`
  - `sub-components/`
- `client/src/components/Navigation/`
  - `index.jsx`
  - `useNavigation.hook.js`
  - `sub-components/`

This structure supports decoupling of:

- View composition (JSX)
- Interaction/state logic (hooks)
- Data access (service files)
- Fine-grained UI blocks (sub-components)

Current status:

- Folder architecture strongly reflects the componentization pattern.
- Most files in these packages are currently scaffolded and awaiting implementation.

### 2.3 API and Networking

Networking is centralized through two key layers:

- Domain endpoint registry in `client/src/config/apiConfig.js`
  - Groups routes by domain: `AUTH`, `PROFILE`, `GAME`, `ROOM`, `SUBSCRIPTION`, `WALLET`, `ADMIN`
- Reusable HTTP client class in `client/src/utils/httpHelper.js`
  - Axios instance with base URL strategy by environment
  - `withCredentials: true` to support cookie-based auth
  - Shared timeout and JSON headers
  - Response interceptor to return `response.data`
  - Error interceptor to normalize server error messages

This is a clean API abstraction point for future feature services.

### 2.4 Frontend Route Protection (Role-Based Authorization)

Role-based route protection is implemented in routing layer:

- `client/src/routes/ProtectedRoute.jsx`
  - Redirects unauthenticated users to `/login`
  - Enforces `allowedRoles` against `user.role`
  - Redirects unauthorized users to `/profile`
- `client/src/routes/AppRouter.jsx`
  - Applies `ProtectedRoute` to player and admin pages
  - Restricts admin routes with `allowedRoles={["ADMIN"]}`
  - Redirects authenticated users away from guest auth pages

Implementation caveat:

- Route guard depends on `useAuthStore()` but `client/src/stores/AuthStore.jsx` is currently empty, so runtime auth state management is scaffolded rather than complete.

## 3) Workspace Tree (ASCII)

The tree below reflects the current repository layout (core folders and representative files):

```text
Group1/
|-- README.md
|-- ARCHITECTURE.md
|-- client/
|   |-- package.json
|   |-- vite.config.js
|   |-- docs/
|   |   |-- ARCHITECTURE.md
|   |   `-- PAGES.md
|   `-- src/
|       |-- App.jsx
|       |-- Layout.jsx
|       |-- main.jsx
|       |-- index.css
|       |-- assets/
|       |-- config/
|       |   `-- apiConfig.js
|       |-- utils/
|       |   `-- httpHelper.js
|       |-- hooks/
|       |   `-- useScrollToTop.js
|       |-- stores/
|       |   |-- AuthStore.jsx
|       |   `-- ThemeStore.jsx
|       |-- routes/
|       |   |-- AppRouter.jsx
|       |   `-- ProtectedRoute.jsx
|       |-- components/
|       |   |-- GameBoard/
|       |   |   |-- index.jsx
|       |   |   |-- game.service.js
|       |   |   |-- useGame.hook.js
|       |   |   `-- sub-components/
|       |   `-- Navigation/
|       |       |-- index.jsx
|       |       |-- useNavigation.hook.js
|       |       `-- sub-components/
|       `-- pages/
|           |-- Guest/
|           |-- Player/
|           `-- Admin/
`-- server/
    |-- package.json
    |-- docs/
    |   |-- ARCHITECTURE.md
    |   |-- ENDPOINTS.md
    |   `-- MODELS.md
    `-- src/
        |-- app.js
        |-- server.js
        |-- config/
        |   `-- db.config.js
        |-- utils/
        |   `-- token.util.js
        |-- middlewares/
        |   |-- authMiddleware.js
        |   `-- roleMiddelware.js
        `-- modules/
            |-- auth/
            |-- profile/
            |-- game/
            |-- room/
            |-- subscription/
            |-- wallet/
            `-- admin/
```

Core folder responsibilities:

- `client/src/pages`: Route-level screens (Guest, Player, Admin areas)
- `client/src/components`: Reusable feature components with sub-components/hooks/services
- `client/src/routes`: Routing graph and frontend authorization gates
- `client/src/config` and `client/src/utils`: API endpoint registry and HTTP abstraction
- `server/src/modules`: Backend bounded contexts with layered N-tier folders
- `server/src/middlewares`: Cross-cutting auth/role enforcement points
- `server/src/config` and `server/src/utils`: DB/bootstrap and shared utility logic

## 4) Tech Stack and Deployment Notes

### 4.1 Core Technologies in This Repository

Frontend (`client/package.json`):

- React 19
- React Router DOM 7
- Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite` + `@import "tailwindcss"`)
- Axios
- Zustand (dependency present; store files scaffolded)
- Framer Motion
- Lucide React
- React Hot Toast

Backend (`server/package.json`):

- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JSON Web Token (`jsonwebtoken`)
- bcryptjs
- cookie-parser
- cors
- dotenv
- nodemon (dev)

### 4.2 Deployment/Runtime Shape

- Backend starts from `server/src/server.js` and listens on `PORT` (default 5000).
- Database connection is initialized via `server/src/config/db.config.js` using `MONGO_URI`.
- Frontend Vite dev server is configured on port 8000 in `client/vite.config.js`.
- CORS in backend allows `http://localhost:8000` and `process.env.CLIENT_URL`.

## 5) Architecture Maturity Snapshot

Pattern coverage in current codebase:

- N-tier backend folder architecture: present
- Modular monolith bounded contexts: present
- Backend middleware enforcement (JWT/RBAC): partially wired, not implemented in middleware files yet
- DTO-based response filtering: scaffolded, not implemented yet
- Frontend layer hierarchy: present
- Frontend component package decoupling: folder pattern present, mostly scaffolded
- API helper + domain endpoint config: implemented
- Frontend role-based route protection: implemented at router/guard level, depends on scaffolded auth store

This architecture foundation is strong structurally, with most remaining work concentrated in completing scaffolded files and wiring routes/middleware end-to-end.