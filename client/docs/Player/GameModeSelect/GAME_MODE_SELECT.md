# Game Mode Select Page
**Route:** `/play`  
**Access:** Authenticated Players (Free & Premium)

---

## Overview

The Game Mode Select page serves as the primary navigation hub for players to choose between different game modes:
- **Single Player** - Play against AI
- **Local Arena** - Multiplayer on the same device
- **Online Lobby** - Online multiplayer matches

This page is the first step after authentication and allows users to pick their desired game experience.

---

## Architecture

```
GameModeSelect/
├── index.jsx                          # Main page component
├── hook/
│   └── useGameModeSelect.hook.js      # State management and logic
├── service/
│   └── gameModeSelect.service.js      # Game modes config + utilities
└── sub-components/
    └── GameModeCard.jsx               # Reusable card component
```

### Component Hierarchy
```
GameModeSelect (Main Page)
├── Navigation (Header)
├── Main Content
│   ├── Page Title
│   └── GameModeCard (x3)
│       ├── Top Bar (Color indicator)
│       ├── Icon
│       ├── Title
│       ├── Description
│       └── Button
└── Footer
```

---

## Components

### 1. GameModeSelect (index.jsx)
**Purpose:** Main page orchestrator

**Responsibilities:**
- Render Navigation and Footer
- Display page title
- Map game modes to cards
- Handle visual texture layers (scanlines, pixel grid)

**Key Props:** None (uses hooks internally)

**Dependencies:**
- `useGameModeSelect()` hook
- `Navigation` component
- `Footer` component
- `GameModeCard` component

---

### 2. GameModeCard (sub-components/GameModeCard.jsx)
**Purpose:** Individual game mode card display

**Props:**
```javascript
{
  mode: {
    id: string,
    title: string,
    description: string,
    icon: string (Material Symbol),
    accentColor: string (hex color),
    buttonText: string,
    buttonIcon: string (Material Symbol),
    buttonStyle: 'filled' | 'outlined',
    topBarColor: string (Tailwind class),
    badge: string | null,
    glowEffect: boolean,
  },
  onSelect: (id: string) => void
}
```

**Features:**
- Colored top bar indicator
- Material Design icons
- Responsive hover effects
- Consistent button styling (outlined)
- Optional badge display
- PropTypes validation

---

## Game Modes Configuration

**File:** `service/gameModeSelect.service.js`

### Single Player
```javascript
{
  id: 'single-player',
  title: 'SINGLE PLAYER',
  description: 'Battle the AI across 3 difficulty levels.',
  icon: 'smart_toy',
  accentColor: '#4cc9f0',          // Cyan
  buttonText: 'INITIATE',
  buttonIcon: 'play_arrow',
  buttonStyle: 'outlined',
  topBarColor: 'bg-[#4cc9f0]',
  route: '/play/single-player',
  badge: null,
  glowEffect: false,
}
```

### Local Arena
```javascript
{
  id: 'local-arena',
  title: 'LOCAL ARENA',
  description: 'Challenge a friend on the same machine.',
  icon: 'videogame_asset',
  accentColor: '#fad100',           // Yellow
  buttonText: 'CHALLENGE',
  buttonIcon: 'swords',
  buttonStyle: 'outlined',
  topBarColor: 'bg-[#fad100]',
  route: '/play/local-arena',
  badge: null,
  glowEffect: false,
}
```

### Online Lobby
```javascript
{
  id: 'online-lobby',
  title: 'ONLINE LOBBY',
  description: 'Enter the global network and climb the rankings.',
  icon: 'public',
  accentColor: '#4cc9f0',           // Cyan
  buttonText: 'CONNECT',
  buttonIcon: 'wifi',
  buttonStyle: 'outlined',
  topBarColor: 'bg-[#4cc9f0]',
  route: '/lobby',
  badge: null,
  glowEffect: false,
}
```

---

## Hook: useGameModeSelect

**File:** `hook/useGameModeSelect.hook.js`

### Functionality
- **Auth Protection:** Redirects to `/login` if user not authenticated
- **Mode Selection:** Handles game mode selection and navigation

### Return Value
```javascript
{
  gameModes: Array,           // All available game modes
  handleSelectMode: Function, // (id: string) => void
  user: Object,               // Current authenticated user
}
```

### Implementation Details
```javascript
const useGameModeSelect = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Auto-redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Navigate to selected mode's route
  const handleSelectMode = (modeId) => {
    const route = getGameModeRoute(modeId);
    if (route) {
      navigate(route);
    }
  };

  return {
    gameModes: getGameModes(),
    handleSelectMode,
    user,
  };
};
```

---

## Service: gameModeSelect.service.js

### Exports

#### `GAME_MODES`
Array of all available game mode configurations

#### `getGameModes()`
Returns all available game modes
```javascript
const modes = getGameModes();
// Returns: [single-player mode, local-arena mode, online-lobby mode]
```

#### `getGameModeById(id)`
Get a specific mode by ID
```javascript
const mode = getGameModeById('online-lobby');
// Returns: { id, title, description, ... }
```

#### `getGameModeRoute(id)`
Get the navigation route for a mode
```javascript
const route = getGameModeRoute('online-lobby');
// Returns: '/lobby'
```

---

## Routing Flow

```
User (Authenticated)
    ↓
Navigate to /play
    ↓
GameModeSelect Page
    ├─ Select "SINGLE PLAYER" → /play/single-player (🟡 TODO - Not yet implemented)
    ├─ Select "LOCAL ARENA" → /play/local-arena (🟡 TODO - Not yet implemented)
    └─ Select "ONLINE LOBBY" → /lobby (✅ Implemented)

Logo Click (Authenticated) → /play (GameModeSelect)
```

---

## Visual Design

### Layout
- **3-Column Grid** (responsive: 1 column mobile, 3 columns desktop)
- **Fixed Header** with Navigation
- **Fixed Footer** with copyright/links
- **Gap:** 8 units between cards
- **Max Width:** 6xl container

### Styling Features
- **Retro Aesthetics:**
  - Scanlines effect overlay
  - Pixel grid background
  - Chunky offset shadows
  - Neon glow text on header

- **Card Styling:**
  - 2px border with outline-variant color
  - Colored top bar (1px height)
  - Material Design icons
  - Outlined button styling (no background)
  - Hover effects (border color changes)

- **Colors:**
  - Single Player: Cyan (#4cc9f0)
  - Local Arena: Yellow (#fad100)
  - Online Lobby: Cyan (#4cc9f0)

---

## Current Status

| Feature | Status |
|---------|--------|
| Page Layout | ✅ Complete |
| Navigation | ✅ Complete |
| Footer | ✅ Complete |
| Game Mode Cards | ✅ Complete |
| Routing Logic | ✅ Complete |
| Auth Protection | ✅ Complete |
| Styling | ✅ Complete |
| Responsive Design | ✅ Complete |
| **Single Player Route** | 🟡 TODO - Page not yet implemented |
| **Local Arena Route** | 🟡 TODO - Page not yet implemented |
| **Online Lobby Route** | ✅ Implemented (→ `/lobby`) |

**Implementation Note**: The GameModeSelect component is fully functional for all three modes. However, `/play/single-player` and `/play/local-arena` routes are not yet implemented in AppRouter.jsx. Currently, clicking these buttons will not navigate correctly.

---

## Next Steps

1. **Implement Single Player Page** (`/play/single-player`)
   - AI difficulty selection
   - Game initialization

2. **Implement Local Arena Page** (`/play/local-arena`)
   - Player 1/2 setup
   - Board initialization

3. **Implement Online Lobby** (`/lobby`)
   - List available rooms
   - Create/Join room flow
   - Integration with GameCustomization

4. **Integration Testing**
   - Test all navigation paths
   - Verify auth redirect
   - Test responsive layout

---

## File Structure Summary

```
src/pages/Player/GameModeSelect/
├── index.jsx
├── hook/
│   └── useGameModeSelect.hook.js
├── service/
│   └── gameModeSelect.service.js
└── sub-components/
    └── GameModeCard.jsx

docs/Player/GameModeSelect/
└── GAME_MODE_SELECT.md (this file)
```

---

## Dependencies

- `react`: UI framework
- `react-router-dom`: Navigation
- `zustand` (AuthStore): Authentication state
- Material Symbols Outlined: Icons
- Tailwind CSS: Styling

---

## Notes

- All game mode routes are configurable via `GAME_MODES` constant
- Add new modes by extending the `GAME_MODES` array
- Icon names reference Material Design Symbols
- Colors use hex format with Tailwind arbitrary values `bg-[#hex]`
