# TicTacToang Frontend Architecture

The frontend architecture strictly adheres to an **N-Tier (Layer-based) Architecture** and advanced **Package-Based Componentization** as defined in the project's Software Requirements Specification (SRS). It completely separates concerns by extracting hooks, services, sub-components, and styling into distinct files within unified component packages.

## Directory Structure

```text
frontend/
├── src/
│   ├── config/                       # Global Configurations (Does not follow Tier structure).
│   │   └── apiConfig.js              # Global configurations of Backend API routes grouped by domains (auth, game, profile).
│   │ 
│   ├── assets/                       # Store image, logo
│   │ 
│   ├── utils/                        # Global utilities.
│   │   └── httpHelper.js             # REST HTTP Helper Class defining utility functions for GET, POST, PUT, PATCH, and DELETE.
│   │
│   ├── stores/                       # Global State Management (Zustand).
│   │   ├── AuthStore.jsx             # Manages global authentication session state.
│   │   └── ThemeStore.jsx            # Manages global UI theme states.
│   │
│   ├── hooks/                        # Global Custom Hooks.
│   │   └── useScrollToTop.js         # Hooks shared across multiple pages or components.
│   │
│   ├── routes/                       # Application routing and role authorization.
│   │   ├── AppRouter.jsx             # Main application routing map.
│   │   └── ProtectedRoute.jsx        # Authorizes user by roles (e.g., Players cannot access Admin APIs).
│   │
│   ├── common/                       # Reusable Components Layer.
│   │   ├── Button/                   # Common display elements configured in separate folders.
│   │   │   └── index.jsx             # JSX structure for the reusable button.
│   │   └── Input/                    # Reusable input field component.
│   │
│   ├── pages/                        # Page Layer Hierarchy.
│   │   ├── Guest/                    # Landing, Login, and Register pages.
│   │   ├── Player/                   # Profile, GameLobby, GameBoard, MatchReplay, Subscription pages.
│   │   └── Admin/                    # AdminDashboard, PlayerManagement, GameRoomMonitor pages.
│   │
│   ├── components/                   # Component Layer demonstrating package-based componentization.
│   │   │
│   │   ├── ProfileEditor/            # A specific component package.
│   │   │   ├── index.jsx             # Component's presentation in JSX.
│   │   │   ├── sub-components/       # Sub-components (e.g., AvatarUploader).
│   │   │   ├── useProfile.hook.js    # Hooks containing event handlers decoupled from the Component.
│   │   │   ├── profile.service.js    # Back-end service calls specific to this component.
│   │   │   └── ProfileEditor.css     # CSS styling (Option).
│   │   │
│   │   ├── GameBoard/                # TicTacToe board component package.
│   │   │   ├── index.jsx             
│   │   │   ├── sub-components/       # GridCell, ChatOverlay
│   │   │   ├── useGame.hook.js       
│   │   │   ├── game.service.js       
│   │   │   └── GameBoard.css         
│   │   │
│   │   ├── Navigation/               # Navbar component package.
│   │   │   ├── index.jsx
│   │   │   └── useNavigation.hook.js
│   │   │
│   │   └── AdminUserList/            # Component package for Admin user management.
│   │       ├── index.jsx
│   │       ├── useAdminUsers.hook.js
│   │       └── admin.service.js
│   │
│   ├── App.jsx                       # Root providers wrapper (SidebarProvider, etc).
│   ├── Layout.jsx                    # Main application layout and conditional Navigation.
│   ├── index.css                     # Global CSS and Tailwind directives.
│   └── main.jsx                      # React DOM entry point.
│
└── package.json                      # Frontend dependencies and scripts.