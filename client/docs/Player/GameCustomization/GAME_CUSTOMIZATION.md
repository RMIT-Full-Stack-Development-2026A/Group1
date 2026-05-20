# Game Customization Page Documentation

## Overview
Game room customization page where players configure board settings before creating or joining a game. Allows selection of board size, grid renderer style, and marker variant aesthetics.

## Route & Access
- **Path**: `/customize`
- **Access**: Protected (requires `isAuthenticated=true`)
- **Redirect**: Unauthenticated users → `/` (landing page)
- **Role**: Player (PLAYER, ADMIN roles allowed)

## Key Features
- ✅ Board size selection (10x10, 15x15)
- ✅ Grid renderer style selection (3 options: Classic Grid, Neon Wire, Block Mesh)
- ✅ Marker variant selection (6 different X/O color combinations)
- ✅ Real-time visual preview of selected options
- ✅ Create room button with loading state
- ✅ Cancel button to return to lobby
- ✅ Auth protection with redirect on logout

## State Management
- **Global Store**: `useCustomizationStore` (persists customization across pages)
  - `boardSize`: "10x10" | "15x15"
  - `gridStyle`: "classic" | "neon" | "block"
  - `markerVariant`: 1-6 (variant ID)
  - Actions: `setCustomization()`, `resetCustomization()`
  
- **Auth Store**: `useAuthStore` (access `isAuthenticated`, `isCheckingAuth`)

- **Local State** (component-level):
  - `selectedBoardSize`: "10x10" | "15x15"
  - `selectedStyle`: "classic" | "neon" | "block"
  - `selectedMarker`: 1-6 (variant ID)
  - `loading`: boolean (creating room)

## Key Components
```
GameCustomization/
├── index.jsx (main page container)
├── hook/
│   └── useGameCustomization.hook.js (state management)
├── service/
│   └── customization.service.js (API calls & constants)
└── sub-components/
    ├── index.js (barrel export)
    ├── BoardSizeSelector.jsx
    ├── GridStyleSelector.jsx
    ├── MarkerVariantSelector.jsx
    └── ActionButtons.jsx
```

## Architecture & Separation of Concerns

### `index.jsx` (Container/Page Component)
- Handles auth checks and redirects
- Manages integration between hook and components
- **Saves customization to global store on room creation** (`setCustomization()`)
- Handles room creation flow with async/await
- Uses hook for local state management
- Renders sub-components and layout

### `hook/useGameCustomization.hook.js` (State Management)
- Manages customization state (selectedBoardSize, selectedStyle, selectedMarker, loading)
- Provides state setters and reset functionality
- Encapsulates complex state logic
- Reusable across different contexts

### `service/customization.service.js` (Business Logic)
- Exports constants: BOARD_SIZES, GRID_STYLES, MARKER_VARIANTS
- Provides getter functions for options (getBoardSizes, getGridStyles, getMarkerVariants)
- Contains `createGameRoom()` API call
- MARKER_VARIANTS used by `utils/markerRenderer.js` for rendering X/O in GameBoard
- TODO: Replace mock implementation with actual backend endpoint
- Centralized configuration management

### Sub-Components (UI Components)
- **BoardSizeSelector**: Manages board size selection UI
- **GridStyleSelector**: Manages grid style selection with preview
- **MarkerVariantSelector**: Manages marker variant selection
- **ActionButtons**: CREATE ROOM and CANCEL buttons
- Each component receives props and callbacks from parent
- Reusable and independently testable

## Import Patterns

For simplicity, all sub-components are exported via a barrel export (`sub-components/index.js`):

```javascript
// In index.jsx
import {
    BoardSizeSelector,
    GridStyleSelector,
    MarkerVariantSelector,
    ActionButtons,
} from "./sub-components";

// Or import individually
import BoardSizeSelector from "./sub-components/BoardSizeSelector";
```

Service exports are used directly:
```javascript
import { createGameRoom, getBoardSizes, getGridStyles, getMarkerVariants } from "./service/customization.service";
```

Hook is used in main component:
```javascript
import { useGameCustomization } from "./hook/useGameCustomization.hook";
```

Global store is used to persist customization across pages:
```javascript
import { useCustomizationStore } from "@/stores/CustomizationStore";
```

## Marker Rendering in GameBoard

When the user navigates to GameBoard after creating a room, the customization options are available via the global store.

**Utility**: `utils/markerRenderer.js` handles rendering X and O with the selected marker styling:
```javascript
import { renderXMarker, renderOMarker } from "@/utils/markerRenderer";
import { useCustomizationStore } from "@/stores/CustomizationStore";

const { markerVariant } = useCustomizationStore();
<div>
  {renderXMarker(markerVariant)}
  {renderOMarker(markerVariant)}
</div>
```

**See**: [GameBoard Implementation Guide](../GameBoard/IMPLEMENTATION_GUIDE.md) for complete usage examples.

## Customization Options

### Data Format Transformation
The frontend uses **display format** (user-friendly) while the backend expects **enum format** (standardized).

When CREATE ROOM is clicked, `transformToBackendFormat()` converts all values automatically:

```javascript
// Frontend (display format) → Backend (enum format)
"10x10" → 10
"15x15" → 15
"classic" → "CLASSIC"
"neon" → "NEON"
"block" → "DARK"
1 → "CLASSIC"
2 → "GLOW"
3 → "CLASSIC"
4 → "PIXEL"
5 → "STONE"
6 → "MINIMAL"
```

### Board Sizes
| Frontend Display | Backend Value | Subtitle |
|------------------|---------------|----------|
| 10x10 | 10 | STANDARD TERMINAL |
| 15x15 | 15 | EXTENDED MATRIX |

### Grid Renderer Styles
| Display | Frontend | Backend | Description |
|---------|----------|---------|-----|
| RETRO-VEC 1.0 | classic | CLASSIC | Classic grid with thin lines, subtle styling |
| CYBER-LITE HI-FI | neon | NEON | Bright neon blue grid with glowing effect |
| SOLID-STATE 40 | block | DARK | Block/pixelated grid with discrete cells |

### Marker Variants
| ID | Frontend | Backend | X Color | O Color | Note |
|----|----------|---------|---------|---------|------|
| 1 | 1 | CLASSIC | Red | Cyan | Glowing effect |
| 2 | 2 | GLOW | Amber | Purple | Standard colors |
| 3 | 3 | CLASSIC | White | White | Skewed/italic (DEFAULT) |
| 4 | 4 | PIXEL | Lime | Pink | Vibrant neon |
| 5 | 5 | STONE | Slate | Slate | Bordered style |
| 6 | 6 | MINIMAL | Symbol | Symbol | Cyan shapes |

## User Flows
| Action | Flow |
|--------|------|
| Load page | Auth check → display customization options with defaults |
| Select board size | Toggle 10x10 ↔ 15x15, visual feedback on selection |
| Select grid style | Choose from 3 styles, preview updates |
| Select marker variant | Choose from 6 colors, preview shows selection |
| Click CREATE ROOM | Send options to backend → create room → navigate to `/play/:roomId` |
| Click CANCEL | Navigate back to `/lobby` |
| Not logged in | Redirect to `/` (landing page) |

## API Integration

### Service Layer (`customization.service.js`)
The service layer handles all API communication with **automatic data transformation**:

**Key Functions:**
- `getBoardSizes()` - Returns sizes with both display and backend formats
- `getGridStyles()` - Returns styles with both `displayId` and backend `id`
- `getMarkerVariants()` - Returns variants with both `displayId` and backend `id`
- `transformToBackendFormat(selection)` - **NEW** - Converts frontend display format to backend enums
- `createGameRoom(options)` - Creates room and transforms data automatically

**Automatic Transformation:**
```javascript
// Frontend selection (what user selects)
{ boardSize: "10x10", gridStyle: "neon", markerVariant: 3 }

// Transforms to backend format (sent to API)
{ boardSize: 10, boardStyle: "NEON", markerStyle: "CLASSIC" }
```

**Backend Endpoint:**
- **Method**: POST `/api/v1/rooms/`
- **Payload (automatically transformed)**: 
  ```json
  {
    "boardSize": 10 | 15,
    "boardStyle": "CLASSIC" | "NEON" | "DARK",
    "markerStyle": "CLASSIC" | "GLOW" | "SKETCH" | "STONE" | "PIXEL" | "MINIMAL"
  }
  ```
- **Response**: `{ roomId, boardSize, boardStyle, markerStyle, ... }`
- **Current Status**: Mock implementation with automatic transformation

**Implementation Note:**
- Transformation happens automatically in `createGameRoom()`
- No manual mapping needed in components
- Frontend stays clean and readable
- Backend receives standard enum values

## Loading States
1. **Auth checking**: Shows "Checking authentication..." overlay
2. **Creating room**: Button shows "CREATING..." text, disabled state
3. **Success**: Navigate to game board (route: `/play/:roomId`)

## Error Handling
| Scenario | Handling |
|----------|----------|
| Not authenticated on load | Redirect to landing page immediately |
| Creation fails | Show error message (pending) |
| Network timeout | Show error message (pending) |

## Navigation Flow
```
Landing → Register → GameLobby → GameCustomization → GameBoard
               ↓                                          ↑
               └──────────────────────────────────────────┘
              (Login direct to GameLobby from Landing)
```

## Current Status
- ✅ UI fully implemented with all customization sections
- ✅ State management separated into custom hook (useGameCustomization)
- ✅ Business logic centralized in service (customization.service.js)
- ✅ Sub-components extracted and modular (BoardSizeSelector, GridStyleSelector, etc.)
- ✅ Auth redirect working
- ✅ Navigation buttons functional (CREATE ROOM, CANCEL)
- ✅ Visual feedback on selections (highlights, borders, glows)
- ✅ Responsive grid layout (mobile & desktop)
- ✅ Clean architecture with separation of concerns
- ✅ Global CustomizationStore for persisting customization across pages
- ✅ markerRenderer utility for rendering markers in GameBoard
- ✅ **Backend alignment implemented** - Dual-layer mapping system
- ✅ **Automatic data transformation** - Frontend → Backend format conversion
- ✅ Constants structured with both display and backend enum values
- ⏳ Backend room creation endpoint pending (`POST /api/v1/rooms/`)
- ⏳ GameLobby room grid integration (currently shows mock data)
- ⏳ Error handling UI pending (toasts/alerts)
- ⏳ Test coverage pending

## Default Selections
- **Board Size**: 10x10 (STANDARD TERMINAL)
- **Grid Style**: neon (CYBER-LITE HI-FI) - highlighted on load
- **Marker Variant**: 3 (White skewed X/O) - highlighted on load

## Architecture: Frontend ↔ Backend Alignment

**How Data Transformation Works:**

```
User selects on UI (display format)
  ↓
Example: "10x10", "neon", 3
  ↓
CustomizationStore saves (display format)
  ↓
CREATE ROOM clicked
  ↓
transformToBackendFormat() converts
  ↓
Example: 10, "NEON", "CLASSIC"
  ↓
API call sends to backend (enum format)
  ↓
Backend receives and stores
```

**Why This Design:**
- Frontend stays readable (user-friendly format)
- Backend stays standardized (enum names)
- Transformation is automatic (no manual mapping needed)
- Easy to test (transformation logic isolated in service)

## Next Steps
1. **Backend** - Implement `POST /api/v1/rooms/` endpoint to accept transformed data
2. **GameLobby Integration** - Connect room creation → room listing
3. **Implement GameBoard component** — Use `useCustomizationStore()` + `markerRenderer` utility
   - See [GameBoard Implementation Guide](../GameBoard/IMPLEMENTATION_GUIDE.md)
4. Error handling - Add toasts/alerts for API failures
5. Testing - Full flow: Customize → Create → Appear in Lobby → Join → Play
6. Unit tests for service functions, transformations, and hooks
7. Add PropTypes validation to all components (if not already present)
