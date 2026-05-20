# CODEBASE Documentation - TicTacToang

## 1. Project Overview
TicTacToang is an online TicTacToe platform that supports local play, AI matches, game history/replay, profile management, and admin moderation features, with room/socket/wallet/subscription infrastructure prepared for real-time multiplayer and premium flows.

- Frontend: React 19 + Vite + React Router + Zustand + Axios + Tailwind CSS.
- Backend: Node.js + Express 5 + MongoDB + Mongoose + JWT (httpOnly cookie auth) + Swagger/OpenAPI.
- Architecture: N-Tier layered architecture and Modular Monolith domain boundaries.
- Deployment target: local dev by default, production-ready for Render-style split deployment (static client + web service API).

## 2. Repository Structure

```text
.
+---client/
|   +---docs/
|   |   +---Guest/
|   |   |   +---LANDING.md                                # Landing page behavior, UX and content notes
|   |   |   +---LOGIN.md                                  # Login page behavior and validation expectations
|   |   |   \---REGISTRATION.md                           # Registration page flow and acceptance details
|   |   +---Player/
|   |   |   +---GameCustomization/
|   |   |   |   +---BOARD_STYLE_IMPLEMENTATION_GUIDE.md   # Board style implementation guide for customization feature
|   |   |   |   \---GAME_CUSTOMIZATION.md                 # Game customization page requirements and interactions
|   |   |   +---GameLobby/
|   |   |   |   \---GAME_LOBBY.md                         # Game lobby UX states and user journeys
|   |   |   \---GameModeSelect/
|   |   |       \---GAME_MODE_SELECT.md                   # Game mode selection flows and copy
|   |   +---ARCHITECTURE.md                               # Frontend architecture notes and design rationale
|   |   \---PAGES.md                                      # Documentation index for implemented page modules
|   +---public/
|   |   \---vite.svg                                      # Default Vite static asset icon
|   +---src/
|   |   +---assets/
|   |   |   \---react.svg                                 # Default React logo asset
|   |   +---components/
|   |   |   \---reusable/
|   |   |       +---FormFields/
|   |   |       |   +---CountrySelect.jsx                # Reusable country select form field component
|   |   |       |   +---EmailField.jsx                   # Reusable email input with validation hints
|   |   |       |   +---index.js                         # Barrel exports for reusable form fields
|   |   |       |   +---PasswordField.jsx                # Reusable password field with visibility toggle
|   |   |       |   \---UsernameField.jsx                # Reusable username input and helper text
|   |   |       +---CustomMarkers.jsx                     # Reusable marker renderer preview component
|   |   |       +---Footer.jsx                            # Shared application footer with branding links
|   |   |       +---Navigation.jsx                        # Shared top navigation and route shortcuts
|   |   |       +---PremiumBannerOverlay.jsx              # Premium access promotion overlay component
|   |   |       \---ScanLines.jsx                         # Reusable CRT scanline visual overlay
|   |   +---config/
|   |   |   \---apiConfig.js                              # Centralized API endpoint constants by domain
|   |   +---hooks/
|   |   |   +---useAuth.js                                # Global auth bootstrap hook wrapper
|   |   |   +---useCountries.js                           # Country data loading and mapping hook
|   |   |   +---useFormValidation.js                      # Generic frontend form validation helper hook
|   |   |   \---useScrollToTop.js                         # Route scroll reset hook on navigation
|   |   +---pages/
|   |   |   +---Admin/
|   |   |   |   +---AdminDashboard/
|   |   |   |   |   \---index.jsx                         # Admin dashboard page entry component
|   |   |   |   +---GameRoomMonitor/
|   |   |   |   |   \---index.jsx                         # Admin room monitor page entry component
|   |   |   |   \---PlayerManagement/
|   |   |   |       \---index.jsx                         # Admin player management page entry component
|   |   |   +---Guest/
|   |   |   |   +---Landing/
|   |   |   |   |   +---hook/
|   |   |   |   |   |   \---useLanding.hook.js            # Landing interactions and navigation event handlers
|   |   |   |   |   +---sub-components/
|   |   |   |   |   |   +---BoardVisualizer.jsx           # Animated board preview visual for landing
|   |   |   |   |   |   \---index.js                      # Landing sub-component barrel exports
|   |   |   |   |   \---index.jsx                         # Landing page route-level component
|   |   |   |   +---Login/
|   |   |   |   |   +---hook/
|   |   |   |   |   |   \---useLogin.hook.js              # Login page state, validation and submit logic
|   |   |   |   |   +---model/
|   |   |   |   |   |   \---auth.js                       # Login model constants and form defaults
|   |   |   |   |   +---service/
|   |   |   |   |   |   \---login.service.js              # Login page service wrapper for auth API
|   |   |   |   |   +---sub-components/
|   |   |   |   |   |   +---AuthMessage.jsx               # Authentication message display component
|   |   |   |   |   |   +---index.js                      # Login sub-component barrel exports
|   |   |   |   |   |   \---LockoutWarning.jsx            # Login lockout warning display component
|   |   |   |   |   \---index.jsx                         # Login page route-level component
|   |   |   |   \---Register/
|   |   |   |       +---hook/
|   |   |   |       |   \---useRegister.hook.js           # Registration state and submission orchestration
|   |   |   |       +---service/
|   |   |   |       |   \---register.service.js           # Registration page API orchestration helper
|   |   |   |       \---index.jsx                         # Register page route-level component
|   |   |   \---Player/
|   |   |       +---GameBoard/
|   |   |       |   +---hook/
|   |   |       |   |   +---gameLogic.js                  # Board rules, win-check, move validation logic
|   |   |       |   |   \---useGame.hook.js               # Game board state and actions hook
|   |   |       |   +---service/
|   |   |       |   |   \---game.service.js               # Game board persistence API service wrapper
|   |   |       |   +---sub-components/
|   |   |       |   |   +---BoardArea.jsx                 # Board layout and cells composition component
|   |   |       |   |   +---ChatOverlay.jsx               # In-game chat overlay UI shell
|   |   |       |   |   +---GridCell.jsx                  # Single board cell interactive component
|   |   |       |   |   +---PlayerPanel.jsx               # Match participant info and status panel
|   |   |       |   |   \---WinOverlay.jsx                # Endgame winner overlay display component
|   |   |       |   \---index.jsx                         # Game board route-level component
|   |   |       +---GameCustomization/
|   |   |       |   +---hook/
|   |   |       |   |   \---useGameCustomization.hook.js  # Customization selections and persistence logic
|   |   |       |   +---service/
|   |   |       |   |   \---customization.service.js      # Customization feature service abstraction layer
|   |   |       |   +---sub-components/
|   |   |       |   |   +---ActionButtons.jsx             # Apply/reset navigation action controls
|   |   |       |   |   +---BoardSizeSelector.jsx         # Board size selection control block
|   |   |       |   |   +---DifficultySelector.jsx        # AI difficulty selector control group
|   |   |       |   |   +---GridStyleSelector.jsx         # Grid style option picker component
|   |   |       |   |   +---index.js                      # Customization sub-components barrel exports
|   |   |       |   |   \---MarkerVariantSelector.jsx     # Marker variant selector with previews
|   |   |       |   \---index.jsx                         # Game customization route-level component
|   |   |       +---GameLobby/
|   |   |       |   +---hook/
|   |   |       |   |   \---useLobby.hook.js              # Lobby filters, polling, and action handlers
|   |   |       |   +---service/
|   |   |       |   |   +---gameLobby.service.js          # Game lobby API orchestration service
|   |   |       |   |   \---lobby.service.js              # Secondary lobby service helper wrappers
|   |   |       |   +---sub-components/
|   |   |       |   |   +---index.js                      # Lobby sub-components barrel exports
|   |   |       |   |   +---LobbyHeader.jsx               # Lobby heading, actions, and status controls
|   |   |       |   |   +---PlayerStats.jsx               # Lobby player statistics summary panel
|   |   |       |   |   +---RecentActivity.jsx            # Recent activity feed UI block
|   |   |       |   |   +---RoomCard.jsx                  # Room summary card component
|   |   |       |   |   \---RoomGrid.jsx                  # Room card grid and layout container
|   |   |       |   \---index.jsx                         # Game lobby route-level component
|   |   |       +---GameModeSelect/
|   |   |       |   +---hook/
|   |   |       |   |   \---useGameModeSelect.hook.js     # Mode selection handlers and navigation logic
|   |   |       |   +---service/
|   |   |       |   |   \---gameModeSelect.service.js     # Mode selection feature service wrapper
|   |   |       |   +---sub-components/
|   |   |       |   |   \---GameModeCard.jsx              # Selectable game mode card component
|   |   |       |   +---index.jsx                         # Game mode select route-level component
|   |   |       |   \---styles.css                        # Local styles for game mode page
|   |   |       +---MatchReplay/
|   |   |       |   +---hook/                             # Placeholder folder for replay hooks
|   |   |       |   +---service/                          # Placeholder folder for replay services
|   |   |       |   +---sub-components/                   # Placeholder folder for replay UI blocks
|   |   |       |   \---index.jsx                         # Match replay page route-level component
|   |   |       +---Profile/
|   |   |       |   +---hooks/
|   |   |       |   |   \---useProfile.js                 # Profile data loading and mutation hook
|   |   |       |   +---services/
|   |   |       |   |   \---profile.service.js            # Profile API service abstraction layer
|   |   |       |   +---sub-components/
|   |   |       |   |   +---EditProfileModal.jsx          # Profile edit modal form component
|   |   |       |   |   +---MatchHistoryTable.jsx         # User match history table renderer
|   |   |       |   |   +---ProfileHeader.jsx             # Profile header and identity display component
|   |   |       |   |   \---StatsCard.jsx                 # Reusable stats card for profile metrics
|   |   |       |   \---index.jsx                         # Profile route-level component
|   |   |       \---Subscription/
|   |   |           +---hook/
|   |   |           |   \---useSubscription.hook.js       # Subscription wallet state and action handlers
|   |   |           +---service/
|   |   |           |   \---subscription.service.js       # Subscription and wallet API interaction service
|   |   |           +---sub-components/
|   |   |           |   +---HeroSection.jsx               # Subscription hero banner and heading block
|   |   |           |   +---PricingPlans.jsx              # Pricing cards and package selection component
|   |   |           |   +---TransactionHistory.jsx        # Subscription transaction history table component
|   |   |           |   \---WalletSection.jsx             # Wallet status and premium activation actions
|   |   |           \---index.jsx                         # Subscription route-level page component
|   |   +---routes/
|   |   |   +---AppRouter.jsx                             # Route map with lazy loading and guards
|   |   |   \---ProtectedRoute.jsx                        # Role-aware route guard for secure pages
|   |   +---services/
|   |   |   +---auth/
|   |   |   |   \---auth.service.js                       # Authentication API service contract wrapper
|   |   |   \---countryService.js                         # Country list fetch service helper
|   |   +---stores/
|   |   |   +---AuthStore.jsx                             # Zustand authentication global state store
|   |   |   +---CustomizationStore.jsx                    # Zustand store for game customization selections
|   |   |   +---ModeStore.jsx                             # Zustand store for selected game mode
|   |   |   \---ThemeStore.jsx                            # Zustand store for visual theme selection
|   |   +---utils/
|   |   |   +---ai/
|   |   |   |   +---ai.easy.js                            # Easy AI move strategy implementation logic
|   |   |   |   +---ai.hard.js                            # Hard AI move strategy implementation logic
|   |   |   |   +---ai.helpers.js                         # Shared helper utilities for AI modules
|   |   |   |   +---ai.medium.js                          # Medium AI move strategy implementation logic
|   |   |   |   \---index.js                              # Barrel exports for AI strategy modules
|   |   |   +---formValidation.js                         # Shared form validation utility functions
|   |   |   +---httpHelper.js                             # Axios-based REST helper with interceptors
|   |   |   +---jwtUtils.js                               # JWT parse/token helper utility functions
|   |   |   \---markerRenderer.jsx                        # Marker rendering utility and style mapper
|   |   +---App.jsx                                       # Root app shell composition component
|   |   +---index.css                                     # Global styles, theme tokens, custom utilities
|   |   +---Layout.jsx                                    # Shared page chrome layout wrapper
|   |   \---main.jsx                                      # React root entry and router bootstrap
|   +---.env                                              # Client local environment variables (ignored)
|   +---.gitignore                                        # Client-specific Git ignore rules
|   +---eslint.config.js                                  # ESLint configuration for frontend code quality
|   +---index.html                                        # Vite HTML template and mount point
|   +---package.json                                      # Frontend dependencies and npm scripts
|   +---package-lock.json                                 # Locked frontend dependency versions
|   +---README.md                                         # Frontend setup and usage notes
|   +---tailwind.config.js                                # Tailwind design token and content config
|   \---vite.config.js                                    # Vite build config and alias resolution
+---sample/
|   +---DesignContext.MD                                  # UI design context and visual direction brief
|   +---MainGamePage.MD                                   # Main game page sample content and notes
|   +---MatchReplayTerminal.MD                            # Match replay terminal UX mock specification
|   +---MidGameVsAI.MD                                    # Mid-game versus AI sample scenario notes
|   +---OnlineArena.MD                                    # Online arena mock notes and interactions
|   \---OnlineMultiplayerArena.MD                         # Multiplayer arena scenario and UI sample
+---server/
|   +---docs/
|   |   +---API_CONTRACT.md                               # Backend API contract and response standards
|   |   +---API_PAYLOADS.md                               # Request and response payload examples
|   |   +---ARCHITECTURE.md                               # Backend architecture design documentation
|   |   +---ENDPOINTS.md                                  # Endpoint inventory and method references
|   |   \---MODELS.md                                     # Data model definitions and field semantics
|   +---src/
|   |   +---config/
|   |   |   +---db.config.js                              # MongoDB connection bootstrap configuration
|   |   |   \---swagger.config.js                         # Swagger/OpenAPI spec generation configuration
|   |   +---middlewares/
|   |   |   +---authMiddleware.js                         # JWT cookie authentication verification middleware
|   |   |   +---errorMiddleware.js                        # Centralized error formatting and not found handler
|   |   |   +---rateLimitMiddleware.js                    # API-wide rate limiting policy middleware
|   |   |   \---roleMiddleware.js                         # Role-based authorization guard middleware
|   |   +---modules/
|   |   |   +---admin/
|   |   |   |   +---controllers/
|   |   |   |   |   \---admin.controller.js              # Admin HTTP handlers for player operations
|   |   |   |   +---dtos/
|   |   |   |   |   \---admin.dto.js                     # Admin-safe response shaping utilities
|   |   |   |   +---routes/
|   |   |   |   |   \---admin.routes.js                  # Admin router and role-protected endpoints
|   |   |   |   +---services/
|   |   |   |   |   \---admin.service.js                 # Admin business orchestration across modules
|   |   |   |   \---validators/
|   |   |   |       \---admin.validator.js               # Admin query and identifier validators
|   |   |   +---auth/
|   |   |   |   +---controllers/
|   |   |   |   |   \---auth.controller.js               # Auth HTTP handlers for login lifecycle
|   |   |   |   +---dtos/
|   |   |   |   |   \---auth.dto.js                      # Auth-safe payload shaping without secrets
|   |   |   |   +---interfaces/
|   |   |   |   |   \---auth.interface.js                # Public auth module contract for cross-calls
|   |   |   |   +---models/
|   |   |   |   |   \---user.model.js                    # User schema with auth and premium fields
|   |   |   |   +---repositories/
|   |   |   |   |   \---auth.repository.js               # User query methods and persistence operations
|   |   |   |   +---routes/
|   |   |   |   |   \---auth.routes.js                   # Public auth route registrations and docs
|   |   |   |   +---services/
|   |   |   |   |   \---auth.service.js                  # Authentication rules and account lock logic
|   |   |   |   \---validators/
|   |   |   |       \---auth.validator.js                # Register/login payload validation utilities
|   |   |   +---game/
|   |   |   |   +---controllers/
|   |   |   |   |   \---game.controller.js               # Game HTTP handlers for session endpoints
|   |   |   |   +---dtos/
|   |   |   |   |   \---game.dto.js                      # Game list/detail DTO mapping functions
|   |   |   |   +---interfaces/
|   |   |   |   |   \---game.interface.js                # Public game module contract for consumers
|   |   |   |   +---models/
|   |   |   |   |   +---gameSession.model.js             # Persisted game session aggregate schema
|   |   |   |   |   +---sessionMove.model.js             # Embedded move document schema definition
|   |   |   |   |   \---sessionParticipant.model.js      # Embedded participant schema for sessions
|   |   |   |   +---repositories/
|   |   |   |   |   \---game.repository.js               # Game session query and aggregate operations
|   |   |   |   +---routes/
|   |   |   |   |   \---game.routes.js                   # Game REST endpoints for save/history/replay
|   |   |   |   +---services/
|   |   |   |   |   \---game.service.js                  # Game business rules and persistence orchestration
|   |   |   |   \---validators/
|   |   |   |       \---game.validator.js                # Game payload/query validation helpers
|   |   |   +---profile/
|   |   |   |   +---controllers/
|   |   |   |   |   \---profile.controller.js            # Profile HTTP handlers for user profile endpoints
|   |   |   |   +---dtos/
|   |   |   |   |   \---profile.dto.js                   # Profile response DTO mappers and composition
|   |   |   |   +---routes/
|   |   |   |   |   \---profile.routes.js                # Profile route registrations and docs
|   |   |   |   +---services/
|   |   |   |   |   \---profile.service.js               # Profile orchestration with stats aggregation logic
|   |   |   |   \---validators/
|   |   |   |       \---profile.validator.js             # Profile update validation utilities
|   |   |   +---room/
|   |   |   |   +---controllers/
|   |   |   |   |   \---room.controller.js               # Room HTTP handlers placeholder implementation file
|   |   |   |   +---dtos/
|   |   |   |   |   \---room.dto.js                      # Room payload mappers and summary builders
|   |   |   |   +---interfaces/
|   |   |   |   |   \---room.interface.js                # Room module public interface for auth bootstrap
|   |   |   |   +---models/
|   |   |   |   |   +---gameRoom.model.js                # Active room aggregate schema definition
|   |   |   |   |   +---roomMove.model.js                # Embedded room move schema definition
|   |   |   |   |   \---roomParticipant.model.js         # Embedded room participant schema definition
|   |   |   |   +---repositories/
|   |   |   |   |   \---room.repository.js               # Room persistence operations placeholder file
|   |   |   |   +---routes/
|   |   |   |   |   \---room.routes.js                   # Room route declarations (currently commented)
|   |   |   |   +---services/
|   |   |   |   |   \---room.service.js                  # Room business logic placeholder file
|   |   |   |   \---validators/
|   |   |   |       \---room.validator.js                # Room payload validation placeholder file
|   |   |   +---subscription/
|   |   |   |   +---controllers/
|   |   |   |   |   \---subscription.controller.js       # Subscription controller placeholder for future endpoints
|   |   |   |   +---dtos/
|   |   |   |   |   \---subscription.dto.js              # Subscription DTO placeholder mapping utilities
|   |   |   |   +---routes/
|   |   |   |   |   \---subscription.routes.js           # Subscription route declarations (currently commented)
|   |   |   |   +---services/
|   |   |   |   |   \---subcription.service.js           # Subscription service placeholder (typo in filename)
|   |   |   |   \---validators/
|   |   |   |       \---subscription.validator.js        # Subscription validation placeholder utility file
|   |   |   \---wallet/
|   |   |       +---controllers/
|   |   |       |   \---wallet.controller.js             # Wallet controller placeholder for future operations
|   |   |       +---dtos/
|   |   |       |   \---wallet.dto.js                    # Wallet DTO placeholder mapping and shaping file
|   |   |       +---interfaces/
|   |   |       |   \---transaction.interface.js         # Wallet transaction interface placeholder contract
|   |   |       +---models/
|   |   |       |   \---transaction.model.js             # Wallet transaction model placeholder schema
|   |   |       +---repositories/
|   |   |       |   \---wallet.repository.js             # Wallet repository placeholder data access file
|   |   |       +---routes/
|   |   |       |   \---wallet.routes.js                 # Wallet route declarations (currently commented)
|   |   |       +---services/
|   |   |       |   \---wallet.service.js                # Wallet service placeholder business logic file
|   |   |       \---validators/
|   |   |           \---wallet.validator.js              # Wallet validator placeholder utility file
|   |   +---sockets/
|   |   |   +---middleware/
|   |   |   |   \---socketAuthMiddleware.js              # Socket auth middleware placeholder implementation file
|   |   |   +---namespaces/
|   |   |   |   \---game.namespace.js                    # Game socket namespace placeholder implementation file
|   |   |   \---index.js                                 # Socket server bootstrap placeholder entry file
|   |   +---utils/
|   |   |   +---swagger/
|   |   |   |   +---domainSchemas.utils.js               # Domain-specific OpenAPI schema definitions helper
|   |   |   |   +---parameters.utils.js                  # OpenAPI reusable parameter component definitions
|   |   |   |   +---requestBodies.utils.js               # OpenAPI request body component definitions
|   |   |   |   +---responses.utils.js                   # OpenAPI reusable response component definitions
|   |   |   |   \---sharedSchemas.utils.js               # OpenAPI shared primitive schema definitions helper
|   |   |   +---baseSchemaOptions.js                     # Shared mongoose schema options utility constants
|   |   |   \---token.util.js                            # JWT generation and cookie helper utilities
|   |   +---app.js                                       # Express app composition and middleware wiring
|   |   \---index.js                                     # Server bootstrap and database startup flow
|   +---.env                                             # Server local environment variables (ignored)
|   +---.gitignore                                       # Server-specific Git ignore rules
|   +---package.json                                     # Backend dependencies and npm scripts
|   \---package-lock.json                                # Locked backend dependency versions
+---.gitignore                                           # Root Git ignore rules for monorepo
+---package.json                                         # Root workspace dependency and tooling file
+---package-lock.json                                    # Root locked dependency versions
\---README.md                                            # Project overview and setup instructions
```

## 3. Architecture Overview

### ASCII System Diagram

```text
+-------------------- Browser / Client Device --------------------+
|                                                                  |
|  React SPA (Vite)                                                |
|  - Pages / Components / Hooks / Stores / Services                |
|  - Axios HTTP Helper + optional Socket client                    |
|                                                                  |
+-----------------------------+------------------------------------+
                              |
                HTTPS REST    |    WebSocket (planned namespace)
                              v
+-----------------------------+------------------------------------+
|                     Express Server (Node.js)                     |
|                                                                  |
|  Route -> Middleware -> Controller -> Service -> Repository      |
|                         -> Model (Mongoose)                      |
|                                                                  |
|  Modules: Auth, Profile, Game, Admin, Room, Wallet, Subscription |
+-----------------------------+------------------------------------+
                              |
                              v
                     MongoDB (Document Store)
                     - users
                     - game sessions
                     - game rooms
                     - transactions (planned)
```

### Why N-Tier (Layered) Architecture
N-Tier was selected because this project has clear, separable concerns: HTTP transport, policy enforcement, business rules, persistence, and response shaping. For a team project, this reduces merge conflicts and improves ownership because each contributor can safely work in one layer without breaking others.

- FE N-tier equivalent: Page -> Hook -> Service -> HTTP Helper -> API Config.
- BE N-tier: Route -> Middleware -> Controller -> Service -> Repository -> Model -> DTO.
- Benefits for this codebase:
  - Easier unit and integration testing per layer.
  - Predictable file placement and faster onboarding.
  - Safer refactors (e.g., replacing DB queries without touching controllers).

### Why Modular Monolith over Microservices
This project is medium scope with one deployable API, shared Mongo data, and strongly related domains (auth/profile/game/admin). Modular Monolith keeps domain boundaries explicit while avoiding microservice operational overhead (service discovery, network fault handling, distributed tracing, separate deployments).

- Lower operational complexity for student-team scale.
- Better local development speed (single process, single debugger).
- Still supports future extraction because interfaces already define contracts.

### How Layered + Modular Monolith Complement Each Other
Layered architecture controls technical dependencies inside each module, while modular monolith controls business-domain boundaries between modules.

- Layered answers: "How does one request execute safely?"
- Modular answers: "Who owns this business logic and data?"

Together, they enforce both vertical correctness (request pipeline) and horizontal ownership (domain isolation).

## 4. Backend Architecture - Deep Dive

### 4.1 Route Layer
- Responsibility: Register endpoints, attach middleware chains, bind controllers.
- Files: `server/src/modules/*/routes/*.routes.js`, `server/src/app.js`.
- Allowed to call: middleware and controllers only.
- Forbidden to call: repositories/models directly.

```js
// server/src/modules/game/routes/game.routes.js
import express from 'express';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { GameController } from '../controllers/game.controller.js';

const gameRoutes = express.Router();
gameRoutes.use(verifyToken);
gameRoutes.post('/', GameController.createLocalSession);
gameRoutes.get('/', GameController.getGames);
gameRoutes.get('/:id', GameController.getGameDetail);
```

### 4.2 Controller Layer
- Responsibility: Convert HTTP request/response to service calls; no core business rules.
- Files: `server/src/modules/*/controllers/*.controller.js`.
- Allowed to call: service layer only.
- Forbidden to call: model/repository directly.

```js
// server/src/modules/admin/controllers/admin.controller.js
export const AdminController = {
  getPlayers: async (req, res, next) => {
    try {
      const data = await AdminService.getPlayers(req.query);
      return res.status(200).json({ data, message: 'Players fetched successfully.' });
    } catch (err) {
      return next(err);
    }
  }
};
```

### 4.3 Service Layer
- Responsibility: Business logic, validations, orchestration across repositories/interfaces.
- Files: `server/src/modules/*/services/*.service.js`.
- Allowed to call: repository of same module, validators, DTO, other-module interfaces.
- Forbidden to call: other modules' services directly.

```js
// server/src/modules/auth/services/auth.service.js (excerpt)
const user = await AuthRepository.findByEmailOrUsername(identifier);
if (!user || !(await bcryptjs.compare(password, user.passwordHash))) {
  throw { statusCode: 401, error: 'INVALID_CREDENTIALS' };
}
generateTokenAndSetCookie(res, user._id, user.role, user.isPremium);
return AuthDTO.toUserResponse(await AuthRepository.findById(user._id));
```

### 4.4 Repository Layer
- Responsibility: Encapsulate query definitions and persistence operations.
- Files: `server/src/modules/*/repositories/*.repository.js`.
- Allowed to call: Mongoose models only.
- Forbidden to call: controllers, routes, cross-module logic.

Why separate repository from model:
- Model defines schema/indexes and document behavior.
- Repository defines business query patterns (pagination, aggregate stats, filters).
- This keeps query reuse high and service methods concise.

```js
// server/src/modules/game/repositories/game.repository.js
findPaginated: async (filter, sort, skip, limit) => {
  const items = await GameSession.find(filter).sort(sort).skip(skip).limit(limit);
  const total = await GameSession.countDocuments(filter);
  return { items, total };
}
```

### 4.5 Model Layer
- Responsibility: Schema, field constraints, indexes, defaults, and DB mapping.
- Files: `server/src/modules/*/models/*.model.js`.
- Allowed to call: Mongoose APIs and local schema helpers.
- Forbidden to call: service/controller logic.

```js
// representative model style in codebase
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['PLAYER', 'ADMIN'], default: 'PLAYER' },
  auth: { loginAttempts: { type: Number, default: 0 } }
});
```

### 4.6 Middleware Layer
- Responsibility: Cross-cutting concerns (authN, authZ, rate limit, error normalization).
- Files: `server/src/middlewares/*.js`.
- Allowed to call: utility functions and framework primitives.
- Forbidden to call: feature services for business logic.

```js
// server/src/middlewares/authMiddleware.js
const token = req.cookies.access_token;
if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
req.user = jwt.verify(token, process.env.JWT_SECRET);
next();
```

### 4.7 Module Boundaries (Modular Monolith)
- Responsibility: Prevent tight coupling between domains.
- Mechanism: each module exposes an interface file, consumed externally.
- Rule (A.3.1): other modules must not call a module's service directly.

Allowed:
- `AdminService -> AuthInterface`, `AdminService -> GameInterface`
- `ProfileService -> AuthInterface`, `ProfileService -> GameInterface`

Forbidden:
- `AdminService -> AuthService` direct import.

```js
// server/src/modules/auth/interfaces/auth.interface.js
import { AuthService } from '../services/auth.service.js';
export const AuthInterface = {
  getUserById: async (userId) => AuthService.getUserById(userId)
};
```

### 4.8 DTO Layer
- Responsibility: Shape outbound payloads, hide sensitive fields.
- Files: `server/src/modules/*/dtos/*.dto.js`.
- Allowed to call: pure data transformations only.
- Forbidden to call: DB queries or business logic.

Sensitive data hidden by DTO:
- password hash, internal auth attempt metadata, internal DB-only fields.

```js
// server/src/modules/auth/dtos/auth.dto.js
toUserResponse: (user) => ({
  id: user.id || user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  isPremium: user.isPremium
})
```

### Complete Request Lifecycle (ASCII)

```text
HTTP Request
   |
   v
Route Registration (module.routes.js)
   |
   v
Middleware Chain (verifyToken, authorizeMiddleware, rateLimit)
   |
   v
Controller (req/res translation)
   |
   v
Service (business rules + orchestration)
   |
   v
Repository (query strategy)
   |
   v
MongoDB via Mongoose Model
   |
   v
Repository result -> Service -> DTO mapping
   |
   v
HTTP JSON Response
```

## 5. Frontend Architecture - Deep Dive

### 5.1 Pages (Route-level components)
- Responsibility: compose screen sections and pass hook state to UI blocks.
- Location: `client/src/pages/**/index.jsx`.
- Naming: folder-per-page, entry file named `index.jsx`.
- Example: `client/src/pages/Player/Subscription/index.jsx`.

### 5.2 Components (Feature-specific UI blocks)
- Responsibility: presentational blocks tied to one page domain.
- Location: `client/src/pages/**/sub-components/*.jsx`.
- Naming: PascalCase component files.
- Example: `PricingPlans.jsx`, `WalletSection.jsx`.

### 5.3 Reusable Components (Design-system-ish shared blocks)
- Responsibility: cross-page reusable UI building blocks.
- Location: `client/src/components/reusable/**`.
- Example: `Navigation.jsx`, `Footer.jsx`, `FormFields/*.jsx`.

### 5.4 Hooks (A.3.b: behavior separated from rendering)
- Responsibility: state, event handlers, async workflow orchestration.
- Location: `hook/`, `hooks/`, and global `client/src/hooks/`.
- Why separated: components remain declarative and testable; hook logic can be reused.

```js
// useLogin.hook.js style
const onSubmit = async () => {
  const result = await loginService.login(payload);
  navigate('/profile');
};
```

### 5.5 Services (A.2.b REST HTTP Helper usage)
- Responsibility: isolate HTTP requests from UI/hook logic.
- Location: `client/src/pages/**/service/*.js` and `client/src/services/**`.
- Core helper: `client/src/utils/httpHelper.js`.

`HttpHelper` structure:
- Constructor params/config: `baseURL`, `timeout`, `withCredentials`, default headers.
- Methods: `get(url, params)`, `post(url, data)`, `put(url, data)`, `patch(url, data)`, `delete(url, data)`.
- Returns: response payload (`response.data`) from Axios interceptor.
- Error object preserves `status`, `response`, and `data` for caller logic.

### 5.6 Config (A.2.a grouped route constants)
- Responsibility: one place for endpoint strings grouped by business domain.
- Location: `client/src/config/apiConfig.js`.
- Groups present: AUTH, PROFILE, GAME, ROOM, SUBSCRIPTION, WALLET, ADMIN.

### 5.7 Package-based Componentization (A.3.a)
Pattern used across pages:

```text
FeatureFolder/
  index.jsx
  hook/*.hook.js
  service/*.service.js
  sub-components/*.jsx
  styles.css (optional)
```

Benefits:
- Keeps feature internals co-located.
- Reduces coupling between component view and hook/service behavior.
- Enables incremental scaling by page package.

### Frontend Role-based Authorization (A.2.c)
- Guard implemented in `client/src/routes/ProtectedRoute.jsx`.
- Reads `isAuthenticated`, `user`, `isCheckingAuth` from `AuthStore`.
- Redirect rules:
  - Unauthenticated -> `/login`.
  - Authenticated but role not allowed -> `/profile`.
- Admin routes in `AppRouter.jsx` use `allowedRoles={["ADMIN"]}`.

## 6. Module Breakdown (Backend)

### 6.1 Auth Module
- Bounded context: registration, login, logout, check-auth, account lockout.
- Key files:
  - Route: `auth.routes.js`
  - Controller: `auth.controller.js`
  - Service: `auth.service.js`
  - Repository: `auth.repository.js`
  - Model: `user.model.js`
  - DTO: `auth.dto.js`
  - Interface: `auth.interface.js`
- External interface: `AuthInterface` (user status/context/profile/admin access helpers).

### 6.2 User/Profile Module
- Bounded context: profile retrieval/update, overview composition.
- Key files:
  - Route: `profile.routes.js`
  - Controller: `profile.controller.js`
  - Service: `profile.service.js`
  - DTO: `profile.dto.js`
  - Validator: `profile.validator.js`
- External interface: none dedicated; consumes `AuthInterface` and `GameInterface`.

### 6.3 Game Module
- Bounded context: saved sessions, replay data, user game stats.
- Key files:
  - Route: `game.routes.js`
  - Controller: `game.controller.js`
  - Service: `game.service.js`
  - Repository: `game.repository.js`
  - Model: `gameSession.model.js` (+ embedded move/participant models)
  - DTO: `game.dto.js`
  - Interface: `game.interface.js`
- External interface: `GameInterface` (stats/recent/online-session bridge methods).

### 6.4 Room Module
- Bounded context: online room lifecycle and active room snapshots.
- Key files:
  - Route: `room.routes.js` (currently commented)
  - Controller: `room.controller.js` (placeholder)
  - Service: `room.service.js` (placeholder)
  - Repository: `room.repository.js` (placeholder)
  - Model: `gameRoom.model.js` (+ embedded room move/participant)
  - DTO: `room.dto.js`
  - Interface: `room.interface.js`
- External interface: `RoomInterface.getActiveRoomSummaryByUserId`.

### 6.5 Subscription Module (with Wallet dependencies)
- Bounded context: premium status, subscribe action, subscription history.
- Key files:
  - Route: `subscription.routes.js` (currently commented)
  - Controller: `subscription.controller.js` (placeholder)
  - Service: `subcription.service.js` (placeholder; filename typo)
  - DTO: `subscription.dto.js` (placeholder)
  - Validator: `subscription.validator.js` (placeholder)
- External interface: none yet (scaffold stage).

Wallet side scaffold:
- Route: `wallet.routes.js` (commented)
- Service/Repository/Model/DTO/Controller: all present as placeholders.

### 6.6 Admin Module
- Bounded context: player listing/detail and account status moderation.
- Key files:
  - Route: `admin.routes.js`
  - Controller: `admin.controller.js`
  - Service: `admin.service.js`
  - DTO: `admin.dto.js`
  - Validator: `admin.validator.js`
- External interface: none exported; consumes `AuthInterface` and `GameInterface`.

## 7. Key Design Decisions & Rationale

| Decision | What | Why for TicTacToang |
|---|---|---|
| JWT (JWS) over session store | Signed token in httpOnly cookie containing `userId`, `role`, `isPremium` | Simpler stateless auth for split FE/BE deployment and fast route guards without server session storage. |
| Repository Pattern | Query logic isolated in repositories from services | Keeps services focused on business rules; supports query reuse (pagination, aggregate stats). |
| Modular Monolith over microservices | Single deployable backend with strict module boundaries | Team/project size does not justify distributed system overhead; still preserves separation and future extractability. |
| WebSocket for real-time play | Bidirectional low-latency channel for room/game events | REST polling cannot deliver responsive turn-by-turn synchronization and broadcast semantics. |
| DTO pattern | Controlled output object mapping from entities | Prevents leaking internal/sensitive fields such as `passwordHash`, lock metadata, and internal IDs. |
| FE package-based componentization (A.3.a) | Feature folder with `index + hook + service + sub-components` | Reduces cross-feature coupling and keeps behavior near UI ownership boundaries. |
| MongoDB over SQL | Document model with embedded move/participant structures | Game sessions naturally fit nested documents and flexible event metadata with fewer joins. |

## 8. Data Flow Examples

### Scenario A - Player Registration

```text
Client Register Form
  -> client/src/pages/Guest/Register/index.jsx
  -> client/src/pages/Guest/Register/hook/useRegister.hook.js
  -> client/src/pages/Guest/Register/service/register.service.js
  -> client/src/services/auth/auth.service.js
  -> client/src/utils/httpHelper.js (POST /api/v1/auth/register)
  -> server/src/modules/auth/routes/auth.routes.js
  -> server/src/modules/auth/controllers/auth.controller.js
  -> server/src/modules/auth/services/auth.service.js
  -> server/src/modules/auth/repositories/auth.repository.js
  -> server/src/modules/auth/models/user.model.js (DB write)
  -> (email notification step currently not implemented in code)
  -> server/src/utils/token.util.js (set access_token cookie)
  -> server/src/modules/auth/dtos/auth.dto.js
  -> client/src/stores/AuthStore.jsx updates authenticated state
```

### Scenario B - Online Game Move (WebSocket path target architecture)

```text
Player click cell
  -> client/src/pages/Player/GameBoard/hook/useGame.hook.js
  -> socket.emit('move', payload) (planned realtime flow)
  -> server/src/sockets/index.js (socket bootstrap placeholder)
  -> server/src/sockets/namespaces/game.namespace.js (move handler placeholder)
  -> server/src/modules/room/services/room.service.js (planned room state logic)
  -> server/src/modules/game/services/game.service.js (persist finalized session)
  -> server/src/modules/game/repositories/game.repository.js
  -> MongoDB write/read
  -> socket.broadcast to opponent room channel
  -> opponent GameBoard updates UI state
  -> win/draw detection and final session result record
```

Note: socket namespace and room service files currently exist as scaffolds/empty placeholders.

### Scenario C - Admin Deactivates Player

```text
Admin UI action
  -> client/src/pages/Admin/PlayerManagement/index.jsx
  -> (admin service call path from page layer)
  -> client/src/utils/httpHelper.js (PATCH /api/v1/admin/player/:id/deactivate)
  -> server/src/modules/admin/routes/admin.routes.js
  -> server/src/middlewares/authMiddleware.js
  -> server/src/middlewares/roleMiddleware.js (requires ADMIN)
  -> server/src/modules/admin/controllers/admin.controller.js
  -> server/src/modules/admin/services/admin.service.js
  -> server/src/modules/auth/interfaces/auth.interface.js
  -> server/src/modules/auth/services/auth.service.js
  -> server/src/modules/auth/repositories/auth.repository.js
  -> server/src/modules/auth/models/user.model.js (isActive update)
  -> server/src/modules/admin/dtos/admin.dto.js
  -> Admin page receives updated player state
```

## 9. Environment Variables

Detected from source code usage:

| Variable | Used By | Purpose | Example |
|---|---|---|---|
| `PORT` | server | HTTP server listening port | `5000` |
| `NODE_ENV` | server | Runtime mode toggles cookie security and logs | `development` |
| `MONGO_URI` | server | MongoDB connection URI | `mongodb://127.0.0.1:27017/tictactoang` |
| `JWT_SECRET` | server | JWT signing and verification key | `super_secret_jwt_key_here` |
| `CLIENT_URL` | server | CORS allow-list origin for frontend app | `http://localhost:5173` |
| `MODE` (`import.meta.env.MODE`) | client | Frontend runtime mode for API base selection | `development` |

Suggested `.env` templates:

```env
# server/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/tictactoang
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```

```env
# client/.env (optional for future VITE_* vars)
# VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 10. Setup & Run Guide

### 10.1 Prerequisites
- Node.js 18+ (Node 20 recommended).
- npm 9+.
- MongoDB local instance or MongoDB Atlas connection.

### 10.2 Install Dependencies

```bash
# root (optional utility dependency)
npm install

# frontend
cd client
npm install

# backend
cd ../server
npm install
```

### 10.3 Configure Environment
1. Create `server/.env` with values listed in Section 9.
2. Ensure `CLIENT_URL` matches the Vite dev URL.

### 10.4 Seed Database (Gold Data Set)
Current repository has no dedicated seeder script, so seed manually using Mongo shell/Compass.

Create three users in `users` collection:
1. Admin account: role `ADMIN`, `isPremium=false`, `isActive=true`.
2. Player A Premium: role `PLAYER`, `isPremium=true`, premium expiry in future.
3. Player B Standard: role `PLAYER`, `isPremium=false`.

Important: password must be bcrypt-hashed to pass login checks in `auth.service.js`.

### 10.5 Run in Development

Terminal 1 (backend):
```bash
cd server
npm run dev
```

Terminal 2 (frontend):
```bash
cd client
npm run dev
```

Access:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Swagger docs: `http://localhost:5000/api-docs`

### 10.6 Run in Production

Backend:
```bash
cd server
npm install --omit=dev
npm start
```

Frontend:
```bash
cd client
npm run build
npm run preview
```

Render deployment model:
1. Deploy `server` as Web Service (set env vars from Section 9).
2. Deploy `client` as Static Site.
3. Configure frontend API base/proxy to backend URL.
4. Ensure cookies/CORS are configured for HTTPS + correct domain pair.

---

This file is intentionally self-contained and reflects the current repository state, including implemented layers and scaffolded modules.