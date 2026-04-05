# Landing Page Documentation

## Overview
Public hero page introducing the Tic Tac Toe game. Serves as entry point for new and existing users.

## Route & Access
- **Path**: `/`
- **Access**: Public (guests & authenticated users)
- **Redirect Handling**: Centralized in `Layout` component

## Key Features
- ✅ Hero section with game description
- ✅ CTA buttons: "Play Now" (→ register) & "Login" (→ login)
- ✅ Board visualizer animation
- ✅ Responsive design with retro aesthetic
- ✅ Navigation bar & footer

## State Management
- **Store**: NOT used (no auth checks on this page)
- **Hook**: `useLanding()` handles navigation only
- **Local State**: None
- **Architecture**: Auth redirects handled at Layout level, not component level

## Key Components
```
Landing/
├── index.jsx (main page - pure UI)
├── hook/useLanding.hook.js (navigation only)
├── service/landing.service.js (placeholder)
└── sub-components/
    └── BoardVisualizer.jsx (animation)
```

## Navigation Flows
| Action | Destination | Handler |
|--------|------------|---------|
| Click "Play Now" | → `/register` | `handlePlayNow()` |
| Click "Login" (nav) | → `/login` | `handleLogin()` |
| Already logged in | → `/lobby` | Layout.checkAuth() |

## User Flows
1. **Fresh visitor**: Lands on `/` → sees hero → clicks "Play Now" → `/register`
2. **Returning user (unauthenticated)**: Lands on `/` → sees hero → clicks "Login" → `/login`
3. **Returning user (authenticated)**: Lands on `/` → Layout detects auth → redirects to `/lobby`

## API Calls
- None

## Error Handling
- None (static page)

## Implementation Notes
✅ **Fixed**: Removed duplicate auth redirect (now handled by Layout.jsx)
✅ **Simplified**: Pure navigation component, no state management
✅ **Clean**: No unnecessary imports (removed useAuthStore)

## Current Status
- ✅ Fully implemented
- ✅ Auth redirect working (via Layout)
- ✅ Clean separation of concerns
- ✅ No duplicate auth checks

