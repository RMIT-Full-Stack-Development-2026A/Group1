# Game Lobby Page Documentation

## Overview
Main hub for authenticated players. Displays available game rooms, player stats, and recent activity. Central point for joining/creating games with mock data transparency.

## Route & Access
- **Path**: `/lobby`
- **Access**: Protected (requires `isAuthenticated=true`)
- **Redirect**: Unauthenticated users → `/login`
- **Role**: Player (PLAYER, ADMIN roles allowed)

## Key Features
- ✅ Available rooms grid with real-time status
- ✅ Player stats sidebar (wins, losses, rating, etc.)
- ✅ Recent activity feed (last played games)
- ✅ Quick join button (auto-join random available room)
- ✅ Create room button (navigate to customize page)
- ✅ Online player count display
- ✅ Room filtering by status (WAITING, PLAYING, FINISHED)
- ✅ Error handling with retry option
- ✅ Loading states for room data
- ✅ **NEW**: Mock data transparency banner (shows when using demo data)

## Route & Protection
```jsx
Path: /lobby
Protected by: ProtectedRoute (checks isAuthenticated + user.role)
Redirect on fail: /login
```

## State Management
- **Store**: `useAuthStore` (access `isAuthenticated`, `user`, `logout()`, `isCheckingAuth`)
- **Hook**: `useLobby()` manages lobby data fetching + mock data detection
- **Exported State** from useLobby:
  - `rooms`: array of available rooms
  - `playerStats`: player statistics object
  - `recentActivity`: array of recent games
  - `onlineCount`: number of online players
  - `loading`: boolean (fetching data)
  - `error`: error message or null
  - `usingMockData`: **NEW** - boolean flag (true if fallback mock data is being used)
- **Page-Level State**:
  - `usingMockData`: Tracked from useLobby hook to show warning banner

## Key Components
```
GameLobby/
├── index.jsx (main page + error display + mock data banner)
├── hook/useLobby.hook.js (data fetching + mock data detection)
├── service/lobby.service.js (API integration)
└── sub-components/
    ├── LobbyHeader.jsx (online count + action buttons)
    ├── PlayerStats.jsx (player stats card)
    ├── RecentActivity.jsx (recent games list)
    ├── RoomGrid.jsx (room cards display)
    ├── RoomCard.jsx (individual room info)
    └── MockDataBanner.jsx (yellow warning when demo mode active)
```

## Mock Data Transparency
**NEW FEATURE**: Visual indication when mock data is being used

### When Mock Data Banner Appears:
- Backend API fails or times out
- `usingMockData` flag in hook returns `true`
- LobbyService detects all endpoints failed and returned mock data

### Banner Display:
```jsx
⚠️ DEMO MODE: Showing example data. Backend endpoints not yet implemented.
```
- **Color**: Yellow background / warning styling
- **Position**: Top of lobby, above room grid
- **Persistence**: Only shown while using mock data (disappears once real API works)

### Detection Flow:
1. useLobby calls LobbyService endpoints
2. If ALL endpoints fail → uses mock data
3. Sets `usingMockData = true`
4. Returns `usingMockData` in hook return object
5. Page component receives `usingMockData` flag
6. Renders banner if `usingMockData === true`

## API Endpoints
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/rooms?status=WAITING` | Fetch available rooms | ⏳ Pending (using mock if unavailable) |
| GET | `/rooms/:roomId` | Get room details | ⏳ Pending (using mock if unavailable) |
| POST | `/rooms/:roomId/join` | Join existing room | ⏳ Pending (using mock if unavailable) |
| GET | `/games` | Get game history | ⏳ Pending (using mock if unavailable) |
| GET | `/profile/overview` | Get player stats | ⏳ Pending (using mock if unavailable) |

## Data Flow
```
App Mount
  ↓
Layout component calls checkAuth() once on startup
  ↓
Auth state updated (isAuthenticated, user)
  ↓
AppRouter → ProtectedRoute checks auth status
  ↓
If authenticated: GameLobby mounts
  ↓
useLobby() useEffect → Promise.all([getRooms, getStats, getActivity])
  ↓
LobbyService delegates to gameService
  ↓
httpHelper (Bearer token auto-attached) + 5s timeout
  ↓
Backend responses (success) OR timeout (fallback to mock)
  ↓
State updated (rooms, stats, activity, usingMockData flag)
  ↓
Components re-render with data
  ↓
If usingMockData=true: Show yellow warning banner
```

## Mock Data Fallback
If backend not ready, LobbyService returns mock data:
- `_getMockRooms()`: 5-6 sample rooms with statuses (WAITING, PLAYING, FINISHED)
- `_getMockPlayerStats()`: Default player stats (wins, losses, rating)
- `_getMockRecentActivity()`: Sample recent games list
- **Flag**: `usingMockData=true` returned to component
- **UX**: Yellow warning banner displays to users

## User Flows
| Scenario | Flow |
|----------|------|
| Load lobby (real API) | Auth check → fetch data from backend → display rooms + stats |
| Load lobby (mock API) | Auth check → API fails → mock data → show banner + rooms |
| Quick join | Find first WAITING room → navigate to `/play/:roomId` |
| Create room | Navigate to `/game-customization` page |
| Join specific room | Click room card → navigate to `/play/:roomId` |
| Data load fails | Show error message with "Retry" button (tries real API again) |
| No rooms available | Show empty state: "No available rooms. Start your own" |
| Logout | Click logout in nav → redirect to landing page |
| Authenticated but checking auth | Show "Checking authentication..." overlay |

## Loading States
1. **Auth checking**: Full page shows "Checking authentication..." (first 5s max)
2. **Data loading**: Page shows "Loading Lobby..." spinner
3. **Error state**: Shows error message with retry button
4. **Mock data active**: Yellow warning banner + mock data displayed
5. **Success**: Rooms grid renders with real backend data

## Error Handling
| Scenario | Handling |
|----------|----------|
| API timeout (5s) | Falls back to mock data, shows warning banner |
| 401 Unauthorized | ProtectedRoute redirects to login |
| 404 No rooms | Show empty state, offer create room button |
| Network error | Show error + retry button (or mock data if available) |
| Backend down | Use mock data fallback + show warning banner |
| Auth timeout | Falls back to "authenticated anyway" + checkAuth won't hang |

## Component Responsibilities
| Component | Purpose |
|-----------|---------|
| **LobbyHeader** | Title + online count + action buttons |
| **PlayerStats** | Win/loss ratio, rating, level display |
| **RecentActivity** | List of recently played games |
| **RoomGrid** | Maps rooms array to RoomCard components |
| **RoomCard** | Individual room: name, status, players, join btn |
| **MockDataBanner** | Yellow warning when demo mode is active |

## Auth Integration
- **No manual auth check**: Uses `useAuthStore` directly (not custom hook)
- **isCheckingAuth property**: Consistent naming with Login/Register pages
- **Auto-redirect**: useEffect checks `isAuthenticated` + `isCheckingAuth`
- **If logout detected**: Auto-redirect to home page (ProtectedRoute catch)

## Current Status
- ✅ UI fully implemented
- ✅ Auth integration using useAuthStore (no custom hook)
- ✅ useLobby hook with error handling + mock data detection
- ✅ Mock data fallback implemented with transparency banner
- ✅ usingMockData state tracking working
- ✅ Yellow warning banner displays when in demo mode
- ✅ Auth redirect (logout detection) via useEffect
- ⏳ Backend API endpoints still pending (using mock until then)

## Recent Fixes
✅ **Changed from `useAuth()` hook to `useAuthStore` direct**: Consistent with other pages
✅ **Added `usingMockData` state tracking**: Users know when seeing demo data
✅ **Updated property names to `isCheckingAuth`**: Matches auth store API
✅ **Added yellow warning banner**: Shows "⚠️ DEMO MODE: Showing example data..."
✅ **Auth state re-sync**: Better logout detection and page refresh handling

## Next Steps
1. Backend implements `/rooms?status=WAITING` endpoint → mock banner disappears
2. Backend implements `/profile/overview` endpoint → real player stats appear
3. Backend implements `/games` endpoint → real activity feed appears
4. Test real data integration (banner should disappear)
5. Implement WebSocket for real-time room updates
6. Add pagination for room grid (if many rooms)

