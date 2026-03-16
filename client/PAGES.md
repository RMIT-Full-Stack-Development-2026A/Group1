# TicTacToang – Frontend Pages

This document lists all frontend pages and route paths for the TicTacToang platform.

---

## 1. Guest Pages (Not Logged In)

These pages are accessible without authentication.

| Page | Route | Description |
|-----|------|-------------|
| Landing Page | `/` | Introduction to the platform and entry point |
| Login | `/login` | User login page |
| Register | `/register` | New player registration form |


## 2. Player Pages (Authenticated Users)

Accessible only after login.

| Page | Route | Description                                                               | Access |
|-----|------|---------------------------------------------------------------------------|-------|
| Profile | `/profile` | Manage profile information, avatar, and view game history                 | Free & Premium |
| Game Mode Select | `/play` | Select game mode (Single Player, Local Multiplayer, Online Match)         | Free & Premium |
| Game Lobby | `/lobby` | View online game rooms and create/join rooms                              | Free & Premium |
| Game Customization | `/play/customize` | Customize board size, board style, and markers before starting a match    | Free & Premium |
| Game Board | `/game/:roomId` | Main TicTacToang gameplay interface, includes real-time chat              | Free & Premium |
| Match Replay | `/replay/:gameId` | Replay past matches with move controls (pause, forward, backward, resume) | **Premium Only** |
| Subscription | `/subscription` | Wallet management and premium subscription                                | Free (to upgrade) |

# 3. Admin Pages

Accessible only by users with the **ADMIN role**.

| Page | Route | Description |
|-----|------|-------------|
| Admin Dashboard | `/admin` | Overview of admin operations |
| Player Management | `/admin/players` | View and manage all player accounts |
| Game Room Monitor | `/admin/rooms` | Monitor and control online game rooms |

```text
│   ├── pages/                        # Page Layer Hierarchy (Assembles components based on PAGES.md)
│   │   │
│   │   ├── Guest/                    # Accessible without authentication
│   │   │   ├── Landing/              # Route: /
│   │   │   │   └── index.jsx
│   │   │   ├── Login/                # Route: /login
│   │   │   │   └── index.jsx
│   │   │   └── Register/             # Route: /register
│   │   │       └── index.jsx
│   │   │
│   │   ├── Player/                   # Accessible only to authenticated Players
│   │   │   ├── Profile/              # Route: /profile
│   │   │   │   └── index.jsx
│   │   │   ├── GameModeSelect/       # Route: /play
│   │   │   │   └── index.jsx
│   │   │   ├── GameLobby/            # Route: /lobby
│   │   │   │   └── index.jsx
│   │   │   ├── GameCustomization/    # Route: /play/customize
│   │   │   │   └── index.jsx
│   │   │   ├── GameBoard/            # Route: /game/:roomId
│   │   │   │   └── index.jsx
│   │   │   ├── MatchReplay/          # Route: /replay/:gameId (Premium Only)
│   │   │   │   └── index.jsx
│   │   │   └── Subscription/         # Route: /subscription
│   │   │       └── index.jsx
│   │   │
│   │   └── Admin/                    # Accessible only to ADMIN role
│   │       ├── AdminDashboard/       # Route: /admin
│   │       │   └── index.jsx
│   │       ├── PlayerManagement/     # Route: /admin/players
│   │       │   └── index.jsx
│   │       └── GameRoomMonitor/      # Route: /admin/rooms
│   │           └── index.jsx
```