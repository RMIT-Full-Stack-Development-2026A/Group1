# Landing Page Documentation

## Overview
Public hero page introducing the Tic Tac Toe game. Serves as entry point for new and existing users.

## Route & Access
- **Path**: `/`
- **Access**: Public (guests & authenticated users)
- **Redirect**: Authenticated users → `/lobby` (via useEffect on this page)

## Key Features
- ✅ Hero section with game description
- ✅ CTA buttons: "Play Now" (→ register) & "Login" (→ login)
- ✅ Board visualizer animation
- ✅ Responsive design with retro aesthetic
- ✅ Navigation bar & footer

## State Management
- **Store**: `useAuthStore` (access `isAuthenticated`, `isCheckingAuth` for redirect check only)
- **Hook**: `useLanding()` handles navigation only
- **Local State**: None
- **Architecture**: Auth redirect handled at component level via useEffect (check on mount)

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
| Already logged in on load | → `/lobby` | Landing component useEffect |

## User Flows
1. **Fresh visitor**: Lands on `/` → sees hero → clicks "Play Now" → `/register`
2. **Returning user (unauthenticated)**: Lands on `/` → sees hero → clicks "Login" → `/login`
3. **Returning user (authenticated)**: Lands on `/` → useEffect detects auth on mount → auto-redirects to `/lobby`
4. **Still checking auth on load**: Users see landing page briefly while `isCheckingAuth=true`, then redirect once auth check completes

## API Calls
- None

## Error Handling
- None (static page)

## Implementation Notes
✅ **Updated**: Added auth redirect to `/lobby` for authenticated users (via page-level useEffect)
✅ **Simplified**: Pure navigation component, no duplicate redirects
✅ **Clean**: Uses useAuthStore for auth state check only (isAuthenticated, isCheckingAuth)

## Current Status
- ✅ Fully implemented
- ✅ Auth redirect to `/lobby` working for authenticated users
- ✅ Guest navigation (Play Now, Login) functional
- ✅ Responsive design & animations working
- ✅ Clean component architecture

