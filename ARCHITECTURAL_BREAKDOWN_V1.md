# TicTacToang - Comprehensive Architectural Breakdown (V1)
**Generated:** April 2, 2026 | **Status:** Pre-Sprint Architectural Analysis | **For:** Principal Review & Sprint Implementation Planning

---

## TABLE OF CONTENTS
1. [System Architecture & High-Level Overview](#1-system-architecture--high-level-overview)
2. [Directory Structure & Module Responsibilities](#2-directory-structure--module-responsibilities)
3. [Design Patterns & Coding Standards](#3-design-patterns--coding-standards)
4. [Data Flow & State Management](#4-data-flow--state-management)
5. [API Contracts & Payloads](#5-api-contracts--payloads)
6. [Missing Pieces & Technical Debt](#6-missing-pieces--technical-debt)

---

## 1. SYSTEM ARCHITECTURE & HIGH-LEVEL OVERVIEW

### 1.1 Architecture Paradigm

**TicTacToang** follows a **Client-Server Architecture** with a strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND TIER (React/Vite)                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Browser: React 19 + React Router + Zustand State Management│ │
│  │ HTTP Client: Axios-based HttpHelper (withCredentials=true) │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
         ══════════════════ HTTP/REST API ══════════════════
                     (Port 5000 <-> Port 8000)
                           │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND TIER (Express/Node)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Express Server: Modular Monolith (N-Tier Layered)         │ │
│  │ API Gateway: /api/v1/* routes (Auth, Game, Profile, etc)  │ │
│  │ Middleware: CORS, Cookie Parser, JWT Verification         │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Business Logic Modules (7 Bounded Contexts):              │ │
│  │ • Auth (User Identity & Session Management)               │ │
│  │ • Profile (User Info & Avatar Management)                 │ │
│  │ • Game (Past Game Session History & Replay)               │ │
│  │ • Room (Active Online Game Sessions)                      │ │
│  │ • Wallet (Fund Deposits & Balance)                        │ │
│  │ • Subscription (Premium Status & Payments)                │ │
│  │ • Admin (User & Room Monitoring)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Data Layer: MongoDB via Mongoose ORM                       │ │
│  │ 4 Primary Collections: User, GameSession, GameRoom, Trans. │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend Stack (React/Vite - Port 8000)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 19.2.4 | UI Component Framework |
| **Build Tool** | Vite | 8.0.0-beta.13 | Lightning-fast bundler |
| **Router** | React Router DOM | 7.13.1 | Client-side routing & Protected Routes |
| **State Management** | Zustand | 5.0.11 | Global auth/theme state (minimal, lightweight) |
| **HTTP Client** | Axios | 1.13.6 | REST API communication with interceptors |
| **Styling** | Tailwind CSS v4 | 4.2.1 | Utility-first CSS framework |
| **Plugins** | @tailwindcss/vite | 4.2.1 | Vite integration for Tailwind |
| **Toast Notifications** | react-hot-toast | 2.6.0 | User feedback UI |
| **Motion Library** | framer-motion | 12.35.2 | Animations (installed but not yet integrated) |
| **Icons** | lucide-react | 0.577.0 | Icon set (installed but not yet integrated) |
| **Linter** | ESLint v9 | 9.39.1 | Code quality & React hooks rules |

#### Backend Stack (Express/Node - Port 5000)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | (v18+ recommended) | JavaScript runtime |
| **Framework** | Express | 5.2.1 | Web framework & REST API |
| **Database** | MongoDB | 7.1.1 | NoSQL document store |
| **ODM** | Mongoose | 9.3.0 | MongoDB schema & validation layer |
| **Authentication** | jsonwebtoken (JWT) | 9.0.3 | Token-based session management |
| **Hashing** | bcryptjs | 3.0.3 | Password hashing (scrypt-based) |
| **Middleware** | cors | 2.8.6 | Cross-Origin Resource Sharing |
| **Middleware** | cookie-parser | 1.4.7 | Parse HTTP cookies |
| **Dev Tool** | nodemon | 3.1.14 | Auto-restart on file change |
| **Utility** | dotenv | 17.3.1 | Environment variable management |
| **Email** | mailtrap | 4.4.0 | Email sending (installed, not yet integrated) |

### 1.3 Data Flow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER ACTION LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────────┘

User Interaction (Click, Form Submit)
    ↓
React Component Event Handler
    ↓
Zustand Store Action Dispatch (e.g., AuthStore.login)
    ↓
HttpHelper.post() → Axios Interceptor
    ↓
HTTP POST /api/v1/auth/login { email, password }
    ├─ Credentials sent with withCredentials: true (includes cookies)
    ├─ Response interceptor strips Axios wrapper (returns data only)
    └─ Error interceptor centralizes error handling
    ↓
[Backend Processing]
Express receives POST request → authRouter
    ↓
authMiddleware.verifyToken (skip for /register, /login)
    ↓
AuthController.login(req, res)
    ├─ Validates input (email, password format)
    ├─ Calls AuthService.loginUser()
    │   ├─ AuthRepository.findByEmailOrUsername(email)
    │   ├─ bcryptjs.compare(password, hashedPassword)
    │   ├─ AuthRepository.incrementLoginAttempts() [if failed]
    │   ├─ AuthRepository.resetLoginAttempts() [if success]
    │   └─ generateTokenAndSetCookie() [if success]
    │       └─ Creates JWT token + sets httpOnly cookie
    └─ Returns AuthDTO.toUserResponse() [no password field]
    ↓
HTTP 200 { data: { id, email, username, role }, message }
    ├─ Cookie: access_token=jwt...; httpOnly; secure; sameSite=strict
    └─ Automatically stored in browser cookie jar
    ↓
[Frontend Processing Continues]
Response interceptor extracts data
    ↓
AuthStore updates state:
    ├─ user = response.data
    ├─ isAuthenticated = true
    └─ isLoading = false
    ↓
React re-renders with updated state
    ↓
ProtectedRoute checks isAuthenticated & user.role
    ↓
Navigate to /profile or /play based on role
```

---

## 2. DIRECTORY STRUCTURE & MODULE RESPONSIBILITIES

### 2.1 Frontend Directory Structure

```
client/
├── docs/                              # Architecture & component documentation
│   ├── ARCHITECTURE.md                # FE layered architecture blueprint
│   └── PAGES.md                       # Route path mappings by user role
│
├── src/
│   ├── main.jsx                       # Entry point: React DOM mount + BrowserRouter wrapper
│   ├── App.jsx                        # Root layout: Toaster + Layout + AppRouter
│   ├── Layout.jsx                     # UI layout: conditionally hide nav + scroll reset
│   ├── index.css                      # Tailwind v4 directives
│   │
│   ├── config/
│   │   └── apiConfig.js               # ALL endpoint URLs organized by domain (AUTH, PROFILE, GAME, etc.)
│   │
│   ├── utils/
│   │   └── httpHelper.js              # Axios wrapper class with interceptors
│   │
│   ├── stores/                        # Zustand global state
│   │   ├── AuthStore.jsx              # Global auth state (user, isAuthenticated, login/logout)
│   │   └── ThemeStore.jsx             # Global theme state (light/dark, EMPTY)
│   │
│   ├── hooks/
│   │   └── useScrollToTop.js          # Custom hook for scroll-to-top button visibility
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx              # Main router with lazy-loaded pages + protected routes
│   │   └── ProtectedRoute.jsx         # HOC: guards routes by isAuthenticated + role
│   │
│   ├── services/
│   │   └── mockAuthService.js         # Mock auth service for LOCAL STORAGE testing (DEV ONLY)
│   │
│   ├── components/                    # Package-based componentization
│   │   ├── Navigation/                # Navbar component package
│   │   │   ├── index.jsx              # Main navbar JSX (currently empty)
│   │   │   ├── useNavigation.hook.js  # Nav event handlers & logic
│   │   │   └── sub-components/        # MobileMenu, NavLink, ProfileDropdown
│   │   └── GameBoard/                 # Game component package
│   │       ├── index.jsx              # Main GameBoard JSX (currently empty)
│   │       ├── useGame.hook.js        # Game logic & event handlers
│   │       ├── game.service.js        # Game API calls
│   │       └── sub-components/        # GridCell, ChatOverlay
│   │
│   └── pages/                         # Page layer (role-based hierarchies)
│       ├── Guest/                     # Publicly accessible pages
│       │   ├── Landing/               # Route: /
│       │   │   └── index.jsx          # Landing page (IMPLEMENTED, SEE DETAILS BELOW)
│       │   ├── Login/
│       │   │   └── index.jsx          # Route: /login (IMPLEMENTED with mockAuthService)
│       │   └── Register/
│       │       └── index.jsx          # Route: /register (IMPLEMENTED with mockAuthService)
│       ├── Player/                    # Routes for PLAYER & ADMIN roles
│       │   ├── Profile/
│       │   │   └── index.jsx          # Route: /profile (placeholder)
│       │   ├── GameModeSelect/        # Route: /play (placeholder)
│       │   ├── GameLobby/             # Route: /lobby (placeholder)
│       │   ├── GameCustomization/     # Route: /play/customize (placeholder)
│       │   ├── GameBoard/             # Route: /game/:roomId (placeholder)
│       │   ├── MatchReplay/           # Route: /replay/:gameId PREMIUM ONLY (placeholder)
│       │   └── Subscription/          # Route: /subscription (placeholder)
│       └── Admin/                     # Routes for ADMIN role only
│           ├── AdminDashboard/        # Route: /admin (placeholder)
│           ├── PlayerManagement/      # Route: /admin/players (placeholder)
│           └── GameRoomMonitor/       # Route: /admin/rooms (placeholder)
│
├── public/
│   └── vite.svg
├── index.html
├── vite.config.js                     # Build config + path aliases + Tailwind plugin
├── eslint.config.js
└── package.json
```

#### Key Frontend Module Responsibilities

| Module | Responsibility | Current State |
|--------|------------------|--------|
| **App.jsx** | Root wrapper, composes Layout + Router + Toast | ✅ Implemented |
| **Layout.jsx** | Conditional nav visibility, scroll-to-top button | ✅ Partial (commented hooks) |
| **apiConfig.js** | Centralized endpoint URL mapping | ✅ Complete (all 7 domains) |
| **httpHelper.js** | Axios instance + request/response interceptors | ✅ Implemented |
| **AuthStore.jsx** | Global auth state (login, logout, checkAuth) | ⚠️ Structure only (no API calls) |
| **AppRouter.jsx** | Route definitions + lazy loading | ⚠️ All routes commented out |
| **ProtectedRoute.jsx** | Route guard HOC | ⚠️ All logic commented out |
| **Navigation** component | Header/navbar UI | ❌ Empty (only stub index.jsx) |
| **GameBoard** component | Game board grid + chat | ❌ All empty |
| **Pages** (Player/Admin) | Page templates | ❌ All placeholders |

### 2.2 Backend Directory Structure

```
server/
├── docs/                              # Server architecture documentation
│   ├── ARCHITECTURE.md                # Modular Monolith + N-Tier design
│   ├── ENDPOINTS.md                   # Complete REST API + WebSocket events
│   └── MODELS.md                      # MongoDB schema documentation
│
├── src/
│   ├── index.js                       # Server bootstrap: load .env + connect DB + listen
│   ├── app.js                         # Express app setup: middlewares + route mounting
│   │
│   ├── config/
│   │   └── db.config.js               # MongoDB connection via Mongoose
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js          # JWT verification middleware (IMPLEMENTED)
│   │   └── roleMiddleware.js          # Role-based authorization middleware (IMPLEMENTED)
│   │
│   ├── utils/
│   │   ├── token.util.js              # JWT creation + cookie setting
│   │   └── validate.js                # Input validation for register/login
│   │
│   └── modules/                       # 7 Bounded Context Modules
│       ├── auth/                      # Identity & session management
│       │   ├── models/
│       │   │   └── user.model.js      # User schema (IMPLEMENTED)
│       │   ├── repositories/
│       │   │   └── auth.repository.js # Data access layer (IMPLEMENTED)
│       │   ├── services/
│       │   │   └── auth.service.js    # Business logic (IMPLEMENTED)
│       │   ├── controllers/
│       │   │   └── auth.controller.js # HTTP request handlers (IMPLEMENTED)
│       │   ├── routes/
│       │   │   └── auth.routes.js     # Endpoint definitions (PARTIAL)
│       │   ├── dtos/
│       │   │   └── auth.dto.js        # Response DTO (IMPLEMENTED)
│       │   └── interfaces/
│       │       └── auth.interface.js  # Exposes auth interfaces to other modules
│       │
│       ├── profile/                   # User profile management
│       │   ├── controllers/           # (EMPTY)
│       │   ├── services/              # (EMPTY)
│       │   ├── repositories/          # (EMPTY)
│       │   ├── routes/                # (EMPTY)
│       │   ├── dtos/                  # (EMPTY)
│       │   └── interfaces/            # (EMPTY)
│       │
│       ├── game/                      # Game session history
│       │   ├── models/
│       │   │   └── gameSession.model.js # GameSession schema (IMPLEMENTED)
│       │   └── (other layers: EMPTY)
│       │
│       ├── room/                      # Active online game rooms
│       │   ├── models/
│       │   │   └── gameRoom.model.js  # GameRoom schema (IMPLEMENTED)
│       │   └── (other layers: EMPTY)
│       │
│       ├── wallet/                    # Fund deposits & balance
│       │   ├── models/
│       │   │   └── transaction.model.js # Transaction schema (IMPLEMENTED)
│       │   └── (other layers: EMPTY)
│       │
│       ├── subscription/              # Premium subscriptions
│       │   └── (all layers: EMPTY)
│       │
│       └── admin/                     # Admin monitoring
│           └── (all layers: EMPTY)
│
├── .env                               # Environment variables (gitignored)
├── .gitignore
├── package.json
└── README.md
```

#### Key Backend Module Responsibilities

| Module | Responsibility | Current State |
|--------|---|---|
| **index.js** | Server bootstrap & DB connection | ✅ Implemented |
| **app.js** | Express setup + middleware mounting | ⚠️ Missing route mounting for most modules |
| **authMiddleware.js** | JWT verification | ✅ Implemented |
| **roleMiddleware.js** | Role authorization | ✅ Implemented |
| **Auth Module** | User registration, login, session | ⚠️ Service & repository done, routes partially mounted |
| **Profile Module** | Profile CRUD (fetch, update, avatar) | ❌ Skeleton only |
| **Game Module** | Game session history & moves retrieval | ❌ Model done, layers empty |
| **Room Module** | Active room management | ❌ Model done, layers empty |
| **Wallet Module** | Deposits & transactions | ❌ Model done, layers empty |
| **Subscription Module** | Premium status & payments | ❌ All empty |
| **Admin Module** | Player & room monitoring | ❌ All empty |

---

## 3. DESIGN PATTERNS & CODING STANDARDS

### 3.1 Frontend Design Patterns

#### 1. **N-Tier Layered Architecture (Frontend)**

```
Presentation Layer (JSX Components)
        ↓
State Management Layer (Zustand Stores)
        ↓
Service/Hook Layer (Custom Hooks + API Service)
        ↓
HTTP Layer (HttpHelper + Axios Interceptors)
        ↓
API Layer (REST endpoints via apiConfig.js)
```

**Implementation:**
- **Pages** (e.g., LoginPage): Pure presentational, consume hooks
- **Stores** (AuthStore, ThemeStore): Zustand-based global state
- **Hooks** (useGame, useNavigation): Business logic & event handlers
- **Services** (game.service.js): API call wrappers
- **Components**: Organized in packages with their own hooks/services

#### 2. **Package-Based Componentization**

Each component is a self-contained folder with related concerns:

```
GameBoard/
├── index.jsx              # Component JSX (presentation only)
├── useGame.hook.js        # Event handlers & game logic
├── game.service.js        # API calls specific to GameBoard
├── sub-components/
│   ├── GridCell.jsx       # Reusable grid cell component
│   └── ChatOverlay.jsx    # Chat feature sub-component
└── GameBoard.css          # Component styling (optional)
```

**Benefit**: Encapsulation, easy to locate related code, reusable sub-components.

#### 3. **Protected Route Pattern (HOC)**

```jsx
// ProtectedRoute.jsx guards routes by authentication + role
<Route path="/game/:roomId" element={
  <ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}>
    <GameBoard />
  </ProtectedRoute>
} />
```

**Current Status**: ✅ Skeleton in place, commented out pending AuthStore completion.

#### 4. **Centralized API Endpoint Configuration**

```javascript
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "/auth/register",
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        CHECK_AUTH: "/auth/check-auth",
    },
    GAME: {
        LIST: "/games",
        DETAILS: (id) => `/games/${id}`,
        MOVES: (id) => `/games/${id}/moves`,
        SEARCH: "/games/search",
    },
    // 7 domains total (AUTH, PROFILE, GAME, ROOM, SUBSCRIPTION, WALLET, ADMIN)
};
```

**Benefit**: Single source of truth for API routes, easy refactoring.

#### 5. **HTTP Interceptor Pattern**

```javascript
// HttpHelper: Axios wrapper with response/error interceptors
class HttpHelper {
    constructor() {
        this.api = axios.create({
            baseURL: "/api/v1",
            withCredentials: true  // Automatically include JWT cookie in requests
        });
        
        // Response interceptor: strip Axios wrapper
        this.api.interceptors.response.use(
            response => response.data,  // Return data only, not full response
            error => {
                if (error.response?.status === 401) {
                    window.dispatchEvent(new Event('auth:unauthorized'));
                }
                return Promise.reject(error.response?.data?.message);
            }
        );
    }
}
```

**Benefit**: Centralized error handling, automatic cookie inclusion, clean client code.

#### 6. **Lazy Loading Pattern (Code Splitting)**

```javascript
const LoginPage = lazy(() => import("@/pages/Guest/Login/index"));
const GameBoard = lazy(() => import("@/pages/Player/GameBoard/index"));

<Routes>
    <Route path="/login" element={
        <Suspense fallback={<LoadingSpinner />}>
            <LoginPage />
        </Suspense>
    } />
</Routes>
```

**Benefit**: Smaller initial bundle, faster page loads.

### 3.2 Backend Design Patterns

#### 1. **Modular Monolith + N-Tier Architecture**

```
Route Layer (Routes)
    ↓
Controller Layer (Request handlers)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Model Layer (Database schema)
```

**Each module example (Auth):**
- `auth.routes.js`: Defines endpoints
- `auth.controller.js`: Handles HTTP requests/responses
- `auth.service.js`: Business logic (validation, hashing, token generation)
- `auth.repository.js`: Database queries (find, create, update)
- `user.model.js`: Mongoose schema definition
- `auth.dto.js`: Response DTO (hides sensitive fields)
- `auth.interface.js`: Exposes services to other modules (prevents tight coupling)

**Benefit**: Clear separation of concerns, testable layers, reusable services.

#### 2. **Repository Pattern (Data Abstraction)**

```javascript
// auth.repository.js - All CRUD operations in one place
export const AuthRepository = {
    findByEmailOrUsername: async (identifier) => {
        return await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });
    },
    createUser: async (userData) => {
        const newUser = new User(userData);
        return await newUser.save();
    },
    findById: async (id) => User.findById(id),
    incrementLoginAttempts: async (user) => {
        // Brute-force protection: lock after 5 failed attempts
        const updates = { $inc: { loginAttempts: 1 } };
        if (user.loginAttempts + 1 >= 5) {
            updates.$set = { lockUntil: Date.now() + 60000 };
        }
        return User.findByIdAndUpdate(user._id, updates);
    },
    resetLoginAttempts: async (user) => {
        return User.findByIdAndUpdate(user._id, {
            $set: {loginAttempts: 0, lockUntil: 1}
        });
    }
};
```

**Benefit**: Decouples business logic from database specifics, easy to mock for testing.

#### 3. **DTO Pattern (Data Transfer Objects)**

```javascript
// auth.dto.js - Hides password and sensitive fields from responses
export const AuthDTO = {
    toUserResponse: (user) => {
        return {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            isPremium: user.isPremium,
            isActive: user.isActive,
            // Note: password is deliberately excluded
        };
    }
};
```

**Benefit**: Security (no password leaks), consistent API responses, decoupling.

#### 4. **Module Interface Pattern (Bounded Context Exposure)**

```javascript
// auth/interfaces/auth.interface.js
// Other modules call this, NOT the service directly
export const UserInterface = {
    getUserStatus: async (userId) => {
        const user = await AuthRepository.findById(userId);
        if (!user) return null;
        return AuthDTO.toUserResponse(user);
    }
};
```

**Benefit**: Prevents tight coupling between modules, enforces encapsulation.

#### 5. **Middleware Chain Pattern**

```javascript
app.use(cors());                    // CORS
app.use(express.json());            // JSON parser
app.use(cookieParser());            // Cookie parser
app.use('/api/v1/auth', authRoutes); // Mount routes

// In protected routes:
router.get("/check-auth", verifyToken, AuthController.checkAuth);
//                        └─ Middleware 1
//                                     └─ Route handler
```

**Benefit**: Composable middleware, separation of cross-cutting concerns.

#### 6. **Validation & Error Handling Pattern**

```javascript
// validate.js - Centralized input validation
export const validateRegisterInput = (data) => {
    const errors = [];
    if (!email || !password || !confirmPassword || !username || !country) {
        errors.push({ field: "all", error: "MISSING_FIELDS", ... });
    }
    if (password !== confirmPassword) {
        errors.push({ field: "confirmPassword", error: "PASSWORD_MISMATCH", ... });
    }
    return errors;
};

// In service: check validation before processing
export const AuthService = {
    registerUser: async (userData) => {
        const validationErrors = validateRegisterInput(userData);
        if (validationErrors.length > 0) {
            const error = new Error("Invalid input provided.");
            error.statusCode = 400;
            error.details = validationErrors;
            throw error;
        }
        // ... continue processing
    }
};

// In controller: catch and format error response
export const AuthController = {
    register: async (req, res) => {
        try {
            const result = await AuthService.registerUser(req.body, res);
            return res.status(201).json({ message: "...", data: result });
        } catch (error) {
            if (error.statusCode === 400 && error.details) {
                return res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Invalid input provided.",
                    details: error.details
                });
            }
            return res.status(500).json({ error: "SERVER_ERROR" });
        }
    }
};
```

**Benefit**: Consistent error handling, detailed validation feedback.

### 3.3 Coding Standards Observed

#### Frontend Standards
- ✅ **JSX**: Functional components with hooks (no class components)
- ✅ **Naming**: PascalCase for components, camelCase for functions/variables
- ✅ **Imports**: Vite path aliases (`@/components`, `@/stores`, etc.)
- ✅ **State Management**: Zustand stores for global state
- ✅ **Styling**: Tailwind CSS utility-first approach
- ✅ **API Calls**: Centralized in services/stores
- ⚠️ **Error Handling**: Uses react-hot-toast (not fully implemented yet)
- ❌ **Testing**: No test files visible

#### Backend Standards
- ✅ **Modules**: Organized by bounded context (auth, game, profile, etc.)
- ✅ **Naming**: snake_case for files/folders, camelCase for functions
- ✅ **Layers**: Route → Controller → Service → Repository → Model
- ✅ **Error Handling**: Status codes + structured error objects
- ✅ **Validation**: Centralized in utils/validate.js
- ✅ **Security**: bcryptjs password hashing, JWT signing, httpOnly cookies
- ⚠️ **Logging**: console.log used (no structured logger like Winston)
- ❌ **Testing**: No test files visible
- ❌ **API Documentation**: No OpenAPI/Swagger spec

---

## 4. DATA FLOW & STATE MANAGEMENT

### 4.1 Authentication Flow (Complete Lifecycle)

#### **Phase 1: User Registration**

```
User fills registration form
    ↓
RegisterPage form submission
    ↓
AuthStore.register(userData)
    ↓
httpHelper.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    ├─ Payload: { username, email, password, confirmPassword, country }
    └─ Headers: { 'Content-Type': 'application/json' }
    ↓
[Backend Processing]
POST /api/v1/auth/register
    ↓
authRouter → AuthController.register(req, res)
    ↓
AuthService.registerUser(userData)
    ├─ validateRegisterInput(data) → errors array
    ├─ Check email regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    ├─ Check username regex: /^[a-zA-Z0-9_-]{9,}$/
    ├─ Check password regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/
    ├─ bcryptjs.hash(password, 10) → hashedPassword
    ├─ AuthRepository.createUser({ email, username, hashedPassword, country })
    └─ Return { user: newUserObject }
    ↓
AuthDTO.toUserResponse(user) → { id, email, username, country, role: 'PLAYER', ... }
    ↓
HTTP 201 { message: "User registered successfully", data: { ...user } }
    ↓
[Frontend]
Response interceptor extracts data
    ↓
AuthStore state updates: user = data, isAuthenticated = true
    ↓
Navigate to /login or /profile
```

#### **Phase 2: User Login**

```
User fills login form (email + password)
    ↓
LoginPage form submission
    ↓
AuthStore.login(credentials)
    ↓
httpHelper.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    ├─ Payload: { identifier (email/username), password }
    └─ withCredentials: true (any existing JWT cookie auto-included)
    ↓
[Backend Processing]
POST /api/v1/auth/login
    ↓
authRouter → AuthController.login(req, res)
    ↓
AuthService.loginUser(userData, res)
    ├─ validateLoginInput(data) → errors
    ├─ AuthRepository.findByEmailOrUsername(identifier)
    ├─ Check if user account is locked:
    │   if (user.lockUntil && user.lockUntil > Date.now()) → throw 403 "ACCOUNT_LOCKED"
    ├─ bcryptjs.compare(inputPassword, user.password)
    ├─ If password mismatch:
    │   └─ AuthRepository.incrementLoginAttempts(user) [if >= 5, set lockUntil = now + 60s]
    ├─ If password match:
    │   ├─ AuthRepository.resetLoginAttempts(user)
    │   ├─ AuthRepository.updateLastLogin(user._id)
    │   └─ generateTokenAndSetCookie(res, user._id, user.role)
    │       └─ Creates JWT: jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" })
    │       └─ Sets cookie: httpOnly=true, secure=true (prod), sameSite=strict, maxAge=7days
    └─ Return { user: userObject }
    ↓
AuthDTO.toUserResponse(user) → JSON response
    ↓
HTTP 200 { message: "Login successful", data: { ...user } }
Response Headers: Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
    ↓
[Frontend]
Response interceptor extracts data
    ↓
AuthStore state updates: user = data, isAuthenticated = true
    ↓
ProtectedRoute now allows navigation to /profile
    ↓
Navigate to role-specific page (/profile for PLAYER, /admin for ADMIN)
```

#### **Phase 3: Session Persistence (Tab Refresh)**

```
User refreshes browser page
    ↓
React App mounts → App.jsx
    ↓
Layout.jsx mounts
    ↓
AppRouter.jsx mounts → checks isCheckingAuth
    ↓
Effect hook calls: AuthStore.checkAuth()
    ↓
httpHelper.get(API_ENDPOINTS.AUTH.CHECK_AUTH)
    ├─ No credentials in request body
    ├─ BUT withCredentials: true auto-includes JWT cookie from browser storage
    └─ Cookie header: Cookie: access_token=jwt...
    ↓
[Backend Processing]
GET /api/v1/auth/check-auth
    ↓
authMiddleware.verifyToken (required middleware)
    ├─ Extract token from req.cookies.access_token
    ├─ Verify JWT signature using JWT_SECRET
    ├─ If valid: req.user = { id: userId, role: userRole }
    ├─ If invalid/expired: return 401 "UNAUTHORIZED"
    └─ next() → proceed to controller
    ↓
AuthController.checkAuth(req, res)
    ├─ Check req.user exists (set by middleware)
    ├─ AuthService.checkAuthUser(req.user.id)
    │   ├─ AuthRepository.findById(userId)
    │   ├─ Check user.isActive === true (admins can deactivate accounts)
    │   └─ Return { user: userObject }
    └─ Return 200 { message: "User is authenticated", data: { ...user } }
    ↓
[Frontend]
Response interceptor extracts data
    ↓
AuthStore state updates: user = data, isAuthenticated = true, isCheckingAuth = false
    ↓
Render Layout with Navigation visible
    ↓
AppRouter renders pages based on current route + user role
```

#### **Phase 4: Logout**

```
User clicks Logout button
    ↓
AuthStore.logout()
    ↓
httpHelper.post(API_ENDPOINTS.AUTH.LOGOUT, {})
    ├─ Request includes JWT cookie (withCredentials: true)
    └─ No JSON body needed
    ↓
[Backend Processing]
POST /api/v1/auth/logout
    ↓
authMiddleware.verifyToken (still requires valid token even to logout)
    ↓
AuthController.logout(req, res)
    ├─ AuthService.logoutUser(res)
    │   └─ res.clearCookie("access_token") [instructs browser to delete cookie]
    └─ Return 200 { message: "Logged out successfully", data: null }
    ↓
[Frontend]
AuthStore clears state:
    ├─ user = null
    ├─ isAuthenticated = false
    └─ isCheckingAuth = false
    ↓
ProtectedRoute blocks access to protected pages
    ↓
Navigate to /login or /
```

#### **Phase 5: Token Expiration Handling**

```
JWT token expires naturally (after 7 days)
    ↓
User makes API call (e.g., GET /profile)
    ↓
httpHelper.post() includes expired JWT cookie
    ↓
[Backend]
authMiddleware.verifyToken receives request
    ↓
jwt.verify() throws "TokenExpiredError"
    ↓
Return 401 { error: "UNAUTHORIZED", message: "No token provided" }
    ↓
[Frontend]
httpHelper error interceptor catches 401
    ↓
Dispatch: window.dispatchEvent(new Event('auth:unauthorized'))
    ↓
Window event listener in AuthStore catches event
    ↓
AuthStore.logout() called automatically
    ↓
User state cleared
    ↓
Navigate to /login (force re-authentication)
```

### 4.2 Global State Management Architecture

#### **Zustand Store Structure (AuthStore.jsx)**

```javascript
export const useAuthStore = create((set) => ({
    // State
    user: null,                    // Current logged-in user object
    isAuthenticated: false,        // Boolean auth flag
    isCheckingAuth: true,          // Loading state during checkAuth
    isLoading: false,              // Loading state during login/register
    error: null,                   // Error message object/string

    // Actions
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
            set({ error: error, isLoading: false });
            throw error;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.post(API_ENDPOINTS.AUTH.REGISTER, userData);
            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
            set({ error: error, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await http.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error("Logout API failed:", error);
        } finally {
            // Clear state regardless of API success
            set({ isAuthenticated: false, user: null, isLoading: false });
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await http.get(API_ENDPOINTS.AUTH.CHECK_AUTH);
            set({ isAuthenticated: true, user: response.data, isCheckingAuth: false });
        } catch (error) {
            // 401 means no valid token
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
        }
    },

    clearError: () => set({ error: null })
}));

// Global unauthorized event listener
window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
    window.location.href = '/login';
});
```

#### **ThemeStore (Currently Empty)**

```javascript
export const useThemeStore = create((set) => ({
    // TODO: Implement theme state
    // theme: 'dark' | 'light'
    // toggleTheme: () => set(...) 
}));
```

**Integration in Components:**

```javascript
function LoginPage() {
    const { login, isLoading } = useAuthStore();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            // Store handles state update + side effects
        } catch (error) {
            // Error already in store
        }
    };
}
```

### 4.3 Data Access Patterns

#### **Frontend → Backend Data Flow Example (Get Game History)**

```
FE: useGame.hook.js
    ↓
    useEffect(() => {
        fetchGameHistory();
    }, [userId]);
    ↓
    function fetchGameHistory() {
        http.get(API_ENDPOINTS.GAME.LIST)
            .then(games => setGameList(games))
            .catch(err => console.error(err));
    }
    ↓
[Backend]
GET /api/v1/games
    ↓
authMiddleware.verifyToken (required)
    ↓
gameController.getGameList(req, res)
    ↓
gameService.getUserGameSessions(req.user.id)
    ├─ gameRepository.findByUserId(userId)
    │   └─ return GameSession.find({ 'player1.userId': userId })
    └─ return sessions (GameSession objects from DB)
    ↓
Format response using GameDTO (hide sensitive fields if needed)
    ↓
HTTP 200 { message: "...", data: [ { sessionNumber, gameType, result, ... }, ... ] }
    ↓
FE: Response interceptor extracts data array
    ↓
setGameList(data)
    ↓
Render list of games in UI
```

---

## 5. API CONTRACTS & PAYLOADS

### 5.1 Authentication Endpoints

#### **1. Register (POST /auth/register)**

**Request:**
```json
POST /api/v1/auth/register
Content-Type: application/json

{
    "username": "TicTacMaster_99",
    "email": "player@example.com",
    "password": "StrongP@ssw0rd!",
    "confirmPassword": "StrongP@ssw0rd!",
    "country": "Vietnam"
}
```

**Validation Rules (Enforced by `validateRegisterInput`):**
- `username`: Min 9 chars, only alphanumeric + `_` + `-`
- `email`: Valid format, must contain `@` and `.`, max 255 chars
- `password`: Min 9 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (`@$!%*?&`)
- `confirmPassword`: Must exactly match `password`
- `country`: Required (string)

**Success Response (201 Created):**
```json
{
    "message": "User registered successfully",
    "data": {
        "id": "507f1f77bcf86cd799439011",
        "email": "player@example.com",
        "username": "TicTacMaster_99",
        "country": "Vietnam",
        "avatar": null,
        "role": "PLAYER",
        "isActive": true,
        "isPremium": false
    }
}
```

**Error Response (400 Bad Request):**
```json
{
    "error": "VALIDATION_ERROR",
    "message": "Invalid input provided.",
    "details": [
        {
            "field": "password",
            "error": "WEAK_PASSWORD",
            "cause": "Must be > 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special char.",
            "example": "StrongP@ssw0rd!"
        }
    ]
}
```

---

#### **2. Login (POST /auth/login)**

**Request:**
```json
POST /api/v1/auth/login
Content-Type: application/json
Cookie: (if exists) access_token=...

{
    "identifier": "player@example.com",
    "password": "StrongP@ssw0rd!"
}
```

**Field Notes:**
- `identifier`: Can be email OR username
- `password`: Plain text password (hashed on backend)

**Success Response (200 OK):**
```json
{
    "message": "Login successful",
    "data": {
        "id": "507f1f77bcf86cd799439011",
        "email": "player@example.com",
        "username": "TicTacMaster_99",
        "country": "Vietnam",
        "role": "PLAYER",
        "isPremium": false,
        "isActive": true
    }
}
```

**Response Headers:**
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            HttpOnly; 
            Secure (HTTPS only in production); 
            SameSite=Strict; 
            Max-Age=604800 (7 days in seconds)
```

**Error Response (401 Unauthorized):**
```json
{
    "error": "UNAUTHORIZED",
    "message": "Invalid credentials"
}
```

**Error Response (403 Forbidden - Account Locked):**
```json
{
    "error": "ACCOUNT_LOCKED",
    "message": "Account locked due to 5 failed attempts. Try again later after 60 seconds."
}
```

**Brute-Force Protection Logic:**
- After 5 failed login attempts: `user.loginAttempts = 5`, `user.lockUntil = Date.now() + 60000`
- During lockout period: All login attempts return 403 immediately, no reset on failed attempt
- Lockout expires: 60 seconds later, `loginAttempts` resets to 0, `lockUntil` reset to 1
- Successful login: `loginAttempts` reset to 0 immediately

---

#### **3. Logout (POST /auth/logout)**

**Request:**
```json
POST /api/v1/auth/logout
Authorization: Bearer {JWT} (OR Cookie: access_token=...)
```

**Success Response (200 OK):**
```json
{
    "message": "Logged out successfully",
    "data": null
}
```

**Response Headers:**
```
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

#### **4. Check Auth (GET /auth/check-auth)**

**Request:**
```json
GET /api/v1/auth/check-auth
Cookie: access_token=... (auto-included by browser withCredentials=true)
```

**Success Response (200 OK):**
```json
{
    "message": "User is authenticated",
    "data": {
        "id": "507f1f77bcf86cd799439011",
        "email": "player@example.com",
        "username": "TicTacMaster_99",
        "role": "PLAYER",
        "isPremium": false,
        "isActive": true
    }
}
```

**Error Response (401 Unauthorized - No/Invalid Token):**
```json
{
    "error": "UNAUTHORIZED",
    "message": "No token provided"
}
```

---

### 5.2 Game Endpoints

#### **1. List All Games (GET /games)**

**Request:**
```json
GET /api/v1/games
Authorization: JWT (via cookie)
```

**Success Response (200 OK):**
```json
{
    "message": "Games retrieved",
    "data": [
        {
            "id": "507f1f77bcf86cd799439012",
            "sessionNumber": "SESS_20250402_001",
            "gameType": "ONLINE_MATCH",
            "boardSize": 10,
            "player1": {
                "name": "TicTacMaster_99",
                "mark": "X"
            },
            "player2": {
                "name": "ProPlayer_42",
                "mark": "O"
            },
            "result": "PLAYER1_WIN",
            "startTime": "2025-04-02T10:30:00Z",
            "endTime": "2025-04-02T10:45:30Z",
            "moves": [
                {
                    "playerName": "TicTacMaster_99",
                    "coordinate": "A1",
                    "timestamp": "2025-04-02T10:30:00Z"
                },
                {
                    "playerName": "ProPlayer_42",
                    "coordinate": "B2",
                    "timestamp": "2025-04-02T10:30:05Z"
                }
            ]
        }
    ]
}
```

---

#### **2. Get Game Moves (GET /games/:id/moves)**

**Request:**
```json
GET /api/v1/games/507f1f77bcf86cd799439012/moves
Authorization: JWT
```

**Success Response (200 OK):**
```json
{
    "message": "Game moves retrieved",
    "data": [
        { "playerName": "X", "coordinate": "A1", "timestamp": "..." },
        { "playerName": "O", "coordinate": "B2", "timestamp": "..." },
        { "playerName": "X", "coordinate": "C3", "timestamp": "..." }
    ]
}
```

---

### 5.3 Room Endpoints

#### **1. List All Rooms (GET /rooms)**

**Request:**
```json
GET /api/v1/rooms
Authorization: JWT
```

**Success Response (200 OK):**
```json
{
    "message": "Active rooms retrieved",
    "data": [
        {
            "id": "507f1f77bcf86cd799439013",
            "roomNumber": "ROOM_20250402_001",
            "player1": {
                "userId": "507f1f77bcf86cd799439011",
                "name": "TicTacMaster_99"
            },
            "player2": {
                "userId": null,
                "name": null
            },
            "status": "WAITING",
            "startTime": "2025-04-02T10:30:00Z",
            "createdAt": "2025-04-02T10:30:00Z"
        }
    ]
}
```

---

#### **2. Create Room (POST /rooms)**

**Request:**
```json
POST /api/v1/rooms
Authorization: JWT
Content-Type: application/json

{
    "boardSize": 10
}
```

**Success Response (201 Created):**
```json
{
    "message": "Room created successfully",
    "data": {
        "id": "507f1f77bcf86cd799439013",
        "roomNumber": "ROOM_20250402_001",
        "player1": {
            "userId": "507f1f77bcf86cd799439011",
            "name": "TicTacMaster_99"
        },
        "player2": {
            "userId": null,
            "name": null
        },
        "status": "WAITING",
        "startTime": "2025-04-02T10:30:00Z"
    }
}
```

---

#### **3. Join Room (POST /rooms/:roomId/join)**

**Request:**
```json
POST /api/v1/rooms/507f1f77bcf86cd799439013/join
Authorization: JWT
Content-Type: application/json

{}
```

**Success Response (200 OK):**
```json
{
    "message": "Joined room successfully",
    "data": {
        "id": "507f1f77bcf86cd799439013",
        "roomNumber": "ROOM_20250402_001",
        "player1": {
            "userId": "507f1f77bcf86cd799439011",
            "name": "TicTacMaster_99"
        },
        "player2": {
            "userId": "507f1f77bcf86cd799431111",
            "name": "ProPlayer_42"
        },
        "status": "PLAYING",
        "startTime": "2025-04-02T10:30:00Z"
    }
}
```

---

### 5.4 Subscription Endpoints

#### **1. Get Subscription Status (GET /subscription/status)**

**Request:**
```json
GET /api/v1/subscription/status
Authorization: JWT
```

**Success Response (200 OK):**
```json
{
    "message": "Subscription status retrieved",
    "data": {
        "isPremium": false,
        "subscriptionStartDate": null,
        "subscriptionEndDate": null,
        "walletBalance": 50.00
    }
}
```

---

#### **2. Purchase Subscription (POST /subscription/subscribe)**

**Request:**
```json
POST /api/v1/subscription/subscribe
Authorization: JWT
Content-Type: application/json

{
    "paymentMethod": "credit_card",
    "amount": 9.99
}
```

**Success Response (201 Created):**
```json
{
    "message": "Subscription activated",
    "data": {
        "transactionId": "TXN_20250402_001",
        "isPremium": true,
        "subscriptionStartDate": "2025-04-02T10:30:00Z",
        "subscriptionEndDate": "2025-05-02T10:30:00Z",
        "amount": 9.99,
        "status": "SUCCESS"
    }
}
```

---

### 5.5 Wallet Endpoints

#### **1. Get Wallet Balance (GET /wallet)**

**Request:**
```json
GET /api/v1/wallet
Authorization: JWT
```

**Success Response (200 OK):**
```json
{
    "message": "Wallet retrieved",
    "data": {
        "userId": "507f1f77bcf86cd799439011",
        "balance": 150.50,
        "currency": "USD"
    }
}
```

---

#### **2. Deposit Funds (POST /wallet/deposit)**

**Request:**
```json
POST /api/v1/wallet/deposit
Authorization: JWT
Content-Type: application/json

{
    "amount": 50.00,
    "paymentMethod": "credit_card"
}
```

**Success Response (200 OK):**
```json
{
    "message": "Deposit successful",
    "data": {
        "transactionId": "DEP_20250402_001",
        "amount": 50.00,
        "newBalance": 200.50,
        "status": "SUCCESS",
        "timestamp": "2025-04-02T10:30:00Z"
    }
}
```

---

### 5.6 Admin Endpoints

#### **1. List All Players (GET /admin/players)**

**Request:**
```json
GET /api/v1/admin/players
Authorization: JWT (ADMIN role required)
```

**Success Response (200 OK):**
```json
{
    "message": "Players retrieved",
    "data": [
        {
            "id": "507f1f77bcf86cd799439011",
            "username": "TicTacMaster_99",
            "email": "player@example.com",
            "role": "PLAYER",
            "isActive": true,
            "isPremium": false,
            "lastLogin": "2025-04-02T10:30:00Z",
            "createdAt": "2025-03-01T10:30:00Z"
        }
    ]
}
```

---

#### **2. Deactivate Player (PATCH /admin/players/:id/deactivate)**

**Request:**
```json
PATCH /api/v1/admin/players/507f1f77bcf86cd799439011/deactivate
Authorization: JWT (ADMIN)
```

**Success Response (200 OK):**
```json
{
    "message": "Player deactivated",
    "data": {
        "id": "507f1f77bcf86cd799439011",
        "username": "TicTacMaster_99",
        "isActive": false
    }
}
```

---

### 5.7 WebSocket Events (Real-Time Game Sync)

**Namespace:** `/ws/game`

#### **Join Room Event (Client → Server)**
```javascript
socket.emit('join_room', { roomId: 'ROOM_001' });
```

#### **Player Joined Event (Server → All Clients in Room)**
```javascript
socket.on('player_joined', {
    roomId: 'ROOM_001',
    player2Name: 'ProPlayer_42',
    status: 'PLAYING'
});
```

#### **Make Move Event (Client → Server)**
```javascript
socket.emit('make_move', {
    roomId: 'ROOM_001',
    coordinate: 'A1',
    mark: 'X'
});
```

#### **State Update Event (Server → All Clients)**
```javascript
socket.on('state_update', {
    roomId: 'ROOM_001',
    board: [['X', 'O', null, ...], ...],
    currentTurn: 'O',
    moves: [
        { player: 'X', coordinate: 'A1', timestamp: '...' }
    ]
});
```

#### **Game End Event (Server → All Clients)**
```javascript
socket.on('game_end', {
    roomId: 'ROOM_001',
    winner: 'X',
    result: 'PLAYER1_WIN',
    moves: [...]
});
```

#### **Chat Message Event (Client → Server)**
```javascript
socket.emit('send_chat', {
    roomId: 'ROOM_001',
    message: 'Good game!',
    sender: 'TicTacMaster_99'
});
```

---

## 6. MISSING PIECES & TECHNICAL DEBT

### 6.1 Critical Missing Implementations

#### **Frontend Critical Issues**

| Issue | Severity | Impact | Sprint |
|-------|----------|--------|--------|
| **AuthStore empty** | 🔴 CRITICAL | All protected routes blocked | Sprint 1 |
| **Navigation component empty** | 🔴 CRITICAL | No header/nav visible | Sprint 1 |
| **All Player pages placeholder** | 🔴 CRITICAL | No game functionality | Sprint 1 |
| **GameBoard component empty** | 🔴 CRITICAL | Core game feature missing | Sprint 1 |
| **Protected routes disabled** | 🔴 CRITICAL | No route protection working | Sprint 1 |
| **App.js route mounting incomplete** | 🔴 CRITICAL | Routes not loaded in app | Sprint 1 |
| **ThemeStore unused** | 🟡 MEDIUM | No dark/light mode toggle | Sprint 2 |
| **Error handling incomplete** | 🟡 MEDIUM | No global error boundaries | Sprint 1 |
| **No responsive mobile UI** | 🟡 MEDIUM | Mobile experience broken | Sprint 2 |
| **No form validation on FE** | 🟡 MEDIUM | User gets API errors instead | Sprint 1 |

#### **Backend Critical Issues**

| Issue | Severity | Impact | Sprint |
|-------|----------|--------|--------|
| **Auth routes not mounted in app.js** | 🔴 CRITICAL | /api/v1/auth/* endpoints 404 | Sprint 1 |
| **Profile module empty** | 🔴 CRITICAL | No profile CRUD | Sprint 1 |
| **Game module only has schema** | 🔴 CRITICAL | Game history retrieval broken | Sprint 1 |
| **Room module only has schema** | 🔴 CRITICAL | Multiplayer lobbies broken | Sprint 1 |
| **Wallet/Subscription modules empty** | 🔴 CRITICAL | Payment system incomplete | Sprint 2 |
| **Admin module empty** | 🔴 CRITICAL | No admin dashboard | Sprint 2 |
| **WebSocket not implemented** | 🔴 CRITICAL | Real-time sync missing | Sprint 2 |
| **No error handler middleware** | 🟡 MEDIUM | Errors not consistent | Sprint 1 |
| **No request logging** | 🟡 MEDIUM | Hard to debug in production | Sprint 2 |
| **No input sanitization** | 🟡 MEDIUM | SQL injection possible (MongoDB injection) | Sprint 1 |

---

### 6.2 Architectural Flaws & Tight Coupling

#### **Frontend Issues**

1. **Zustand + httpHelper tightly coupled to API**
   - Problem: Store directly calls API, no abstraction layer
   - Impact: Hard to test, hard to mock
   - Fix: Create service layer (already architecture in docs but not implemented)
   ```javascript
   // Instead of:
   const login = async (credentials) => {
       const response = await http.post('/auth/login', credentials);
   };
   // Do:
   const response = await authService.login(credentials);
   ```

2. **Layout.jsx commented-out auth checks**
   - Problem: Navigation won't hide on auth pages until AuthStore completes
   - Impact: UI shows navigation where it shouldn't
   - Fix: Uncomment NavigationInfrastructure, complete AuthStore

3. **No centralized error handling**
   - Problem: Each component catches errors independently
   - Impact: Inconsistent error UI/messages
   - Fix: Create global error boundary + error toast utility

4. **No form validation feedback**
   - Problem: Register/Login forms lack inline validation hints
   - Impact: Users see API errors instead of preventative validation
   - Fix: Add Zod/Yup schema validation on form input

5. **AppRouter routes all commented out**
   - Problem: Even after AuthStore is done, routes need uncommenting
   - Impact: Manual work required to enable each route
   - Fix: Should be enabled by default, just protected

---

#### **Backend Issues**

1. **No centralized error handling middleware**
   - Problem: Each controller has try-catch, different error formats
   - Impact: Inconsistent API responses
   - Fix: Add global error handler middleware
   ```javascript
   app.use((err, req, res, next) => {
       const status = err.statusCode || 500;
       const message = err.message || "Internal Server Error";
       res.status(status).json({ error: err.errorCode, message });
   });
   ```

2. **Routes not mounted in app.js**
   - Problem: Only authRouter is mounted, other modules' routes missing
   - Impact: GET /api/v1/profile returns 404 even if module is implemented
   - Fix: Mount all routers in app.js
   ```javascript
   app.use('/api/v1/auth', authRouter);
   app.use('/api/v1/profile', profileRouter);
   app.use('/api/v1/game', gameRouter);
   // ... etc
   ```

3. **No cross-module communication mechanism**
   - Problem: Modules can't call other modules' logic directly (breaks modularity)
   - Impact: Subscription module can't update user.isPremium without bypassing layer
   - Fix: Enforce module interfaces (already designed, not implemented)
   ```javascript
   // subscription.service.js calls auth interface, not auth service
   const result = await UserInterface.updatePremiumStatus(userId);
   ```

4. **No request validation middleware**
   - Problem: Middleware layer missing (Express app uses only CORS/JSON/cookies)
   - Impact: Invalid requests reach controllers
   - Fix: Add sanitization, rate limiting middleware
   ```javascript
   app.use(mongoSanitize());    // Prevent MongoDB injection
   app.use(rateLimit());         // Prevent brute force
   app.use(validateRequestBody); // Schema validation
   ```

5. **No structured logging**
   - Problem: Only console.log used, not production-ready
   - Impact: Hard to trace request flows in logs
   - Fix: Integrate Winston or Pino logger

---

### 6.3 Security Vulnerabilities

| Vulnerability | Severity | Context | Fix |
|---|---|---|---|
| **No CSRF protection** | 🟡 MEDIUM | Cookies set but no CSRF token check | Add csrf() middleware |
| **No rate limiting** | 🟡 MEDIUM | Brute-force attacks possible on /login | Add express-rate-limit |
| **No input sanitization** | 🟡 MEDIUM | MongoDB injection possible | Add mongo-sanitize |
| **No HTTPS in dev** | 🟠 LOW | Dev-only issue | Enable in production via secure cookie option |
| **JWT secret in .env** | 🟠 LOW | Could be leaked if .env exposed | Rotate secrets, use key vault in prod |
| **No request size limits** | 🟡 MEDIUM | File upload attacks possible | Set `app.use(express.json({ limit: '5mb' }))` |
| **Exposed error stack traces** | 🟠 LOW | Error details leak in 500 response | Hide stack in production |

---

### 6.4 Data Model Issues

| Issue | Impact | Fix |
|---|---|---|
| **User.password unchecked in queries** | Return password in some responses? | Always exclude in DTOs |
| **GameSession.moves not stored efficiently** | Large arrays slow for pagination | Paginate moves, use cursor |
| **No indexes on frequently-queried fields** | Slow queries for high volume | Add indexes: `user._id`, `gameSession.sessionNumber`, `gameRoom.status` |
| **No soft delete (isDeleted flag)** | Hard deletes lose audit trail | Add `deletedAt` timestamp field |
| **No pagination in list endpoints** | Returns all records | Add skip/limit pagination |

---

### 6.5 Missing Features by Module

#### **Auth Module**
- ✅ Register, Login, Logout, CheckAuth (implemented)
- ❌ Forgot password reset (to implement)
- ❌ Email verification (to implement)
- ❌ 2FA support (future)
- ❌ Social login (OAuth) (future)

#### **Profile Module**
- ❌ Get profile
- ❌ Update email/username/country
- ❌ Update password
- ❌ Upload avatar
- ❌ Delete account

#### **Game Module**
- ❌ Get game list
- ❌ Get game details
- ❌ Get move history
- ❌ Search games by player name
- ❌ Game replay playback

#### **Room Module**
- ❌ List active rooms
- ❌ Create room
- ❌ Join room
- ❌ Get room details
- ❌ Close room (admin only)

#### **Wallet Module**
- ❌ Get balance
- ❌ Deposit funds
- ❌ Get transaction history
- ❌ Payment gateway integration

#### **Subscription Module**
- ❌ Get subscription status
- ❌ Subscribe/upgrade
- ❌ Get payment history
- ❌ Auto-renewal management

#### **Admin Module**
- ❌ List all players
- ❌ Get player details
- ❌ Deactivate/reactivate player
- ❌ List game rooms
- ❌ Force close room
- ❌ Generate reports

#### **WebSocket (Real-Time)**
- ❌ Namespace `/ws/game` not configured
- ❌ Events: join_room, make_move, state_update, game_end, chat
- ❌ Game state synchronization

---

### 6.6 Testing & Deployment Gaps

| Category | Issue | Needed |
|---|---|---|
| **Unit Tests** | No test files | Jest (FE) + Vitest (BE) |
| **Integration Tests** | No API integration tests | Supertest (BE API tests) |
| **E2E Tests** | No end-to-end tests | Playwright/Cypress |
| **CI/CD Pipeline** | No GitHub Actions | Setup automated tests + build |
| **Docker** | No containerization | Dockerfile for BE + FE |
| **Environment Config** | .env required before run | Doc required for all vars |
| **Database Migrations** | No migration tool | Mongoose migrations or separate tool |
| **API Documentation** | No Swagger/OpenAPI | Generate from JSDoc comments |

---

### 6.7 Performance Issues

| Issue | Symptom | Fix |
|---|---|---|
| **No database indexes** | Slow queries at scale | Add indexes to frequently queried fields |
| **No response caching** | Repeated requests hit DB | Add Redis caching layer |
| **Vite build not optimized** | Large bundle size | Enable code splitting + lazy loading (done) |
| **No API pagination** | Fetching 10k games at once | Implement skip/limit pagination |
| **No image optimization** | Avatar uploads large | Compress images server-side |
| **Synchronous password hashing** | Blocks event loop | Already using bcryptjs (async) ✅ |

---

### 6.8 Inconsistencies & Typos

#### **Code Issues**
| File | Issue | Fix |
|---|---|---|
| `server/src/middlewares/roleMiddelware.js` | Typo in filename | Rename to `roleMiddleware.js` |
| `server/src/modules/subscription/interfaces/subsciption.interface.js` | Typo in file/export | Rename to `subscription.interface.js` |
| `server/src/modules/subscription/services/subcription.service.js` | Typo in filename | Rename to `subscription.service.js` |
| `client/src/routes/AppRouter.jsx` | Import says "PlayerManagament" but file is "PlayerManagement" | Fix import path |
| `client/src/hooks/useScrollToTop.js` | Uses `window.screenY` instead of `window.scrollY` | Change to `scrollY` |

#### **Route Mapping Issues**
| Route | Should Be | Currently | Issue |
|---|---|---|---|
| `/admin/players` | PlayerManagement | GameRoomMonitor | Wrong page assigned |
| `/admin/rooms` | GameRoomMonitor | PlayerManagement | Wrong page assigned |

---

### 6.9 Sprint 1 Action Items (Blocking for game development)

**PRIORITY 1 (Must Complete):**
1. ✅ Fix typos (roleMiddelware, subsciption)
2. ✅ Fix route mapping (/admin/players ↔ /admin/rooms)
3. Mount all routers in app.js (`profile`, `game`, `room`, `wallet`, `subscription`, `admin`)
4. Complete Profile module (controller, service, repository, routes)
5. Implement Game module (controller, service, repository, routes)
6. Implement Room module (controller, service, repository, routes)
7. Uncomment and test ProtectedRoute logic in FE
8. Implement Navigation component
9. Create global error boundary FE component
10. Add form validation (client-side) using Zod/Yup

**PRIORITY 2 (Should Complete):**
11. Add 404/error fallback page
12. Implement actual Profile page with CRUD UI
13. Implement GameLobby page (list rooms + create room)
14. Implement GameBoard component with grid
15. Add centralized error handler middleware (BE)
16. Fix useScrollToTop bug (window.scrollY)

**PRIORITY 3 (Nice to Have):**
17. Add request logging middleware
18. Add MongoDB indexes
19. Add API rate limiting
20. Add CSRF protection
21. Create Swagger documentation

---

## SUMMARY TABLE

### Architecture Maturity by Component

```
FRONTEND
┌────────────────────────────────────────────────────────────┐
│ Config Layer ........................... ✅ 100% COMPLETE     │
│ HTTP Layer ............................ ✅ 90% COMPLETE      │
│ State Management ...................... ⚠️ 30% COMPLETE      │
│ Routing & Protection .................. ⚠️ 40% COMPLETE      │
│ Components ............................ ❌ 5% COMPLETE       │
│ Pages ................................ ❌ 10% COMPLETE      │
└────────────────────────────────────────────────────────────┘

BACKEND
┌────────────────────────────────────────────────────────────┐
│ Server Setup .......................... ✅ 100% COMPLETE     │
│ Auth Module ........................... ⚠️ 70% COMPLETE      │
│ Database Models ....................... ✅ 80% COMPLETE      │
│ Profile Module ........................ ❌ 0% COMPLETE       │
│ Game Module ........................... ❌ 10% COMPLETE      │
│ Room Module ........................... ❌ 10% COMPLETE      │
│ Wallet Module ......................... ❌ 10% COMPLETE      │
│ Subscription Module ................... ❌ 0% COMPLETE       │
│ Admin Module .......................... ❌ 0% COMPLETE       │
│ WebSocket ............................. ❌ 0% COMPLETE       │
│ Error Handling ........................ ⚠️ 40% COMPLETE      │
└────────────────────────────────────────────────────────────┘
```

---

## CONCLUSION

**TicTacToang V1** demonstrates a solid **architectural vision** with clear separation of concerns (N-Tier backend, layered frontend). The **authentication system** is well-designed with JWT, brute-force protection, and secure cookies. However, **implementation is ~30-40% complete**, with most business modules remaining as empty skeletons.

**For Sprint 1**, focus on:
1. Completing **Auth → Profile → Game → Room** modules backend
2. Enabling **protected routes and navigation** on frontend
3. Fixing **critical typos and route mapping issues**
4. Implementing **core pages and components**

**For Sprint 2+**, add:
1. **Wallet & Subscription** payment flow
2. **Admin Dashboard** and monitoring
3. **WebSocket real-time sync** for multiplayer
4. **Error handling, logging, rate limiting**
5. **Testing coverage (unit, integration, E2E)**

The architecture is **scalable and maintainable** if the remaining modules are completed following the established patterns.

