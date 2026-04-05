# Login Page Documentation

## Overview
Authentication page for existing users. Handles email/username & password login with security features and password recovery option.

## Route & Access
- **Path**: `/login`
- **Access**: Public (guests & authenticated users)
- **Redirect**: If already authenticated → `/lobby` (via useEffect on this page)

## Key Features
- ✅ Email/username input field (name: "identifier")
- ✅ Password input with visibility toggle
- ✅ **NEW**: "Forgot Password?" link (placeholder for future feature)
- ✅ Account lockout (5 failed attempts → 60s cooldown)
- ✅ Error/success messages
- ✅ Guest login option (redirects to `/play`)
- ✅ Link to registration page
- ✅ Form validation (email/password required)

## State Management
- **Store**: `useAuthStore` (access `login()` + check auth state)
- **Page Level**: `useEffect` redirects authenticated users to `/lobby`
- **Hook**: `useLogin()` manages form state, lockout logic, submission
- **Local State**:
  - `formData`: { email, password }
  - `showPassword`: boolean
  - `loading`: API call in progress
  - `message`: { type, text } (error/success)
  - `failedAttempts`: number (0-5)
  - `isLocked`: boolean
  - `lockoutCountdown`: number (0-60s)

## Key Components
```
Login/
├── index.jsx (form UI + auth redirect)
├── hook/useLogin.hook.js (form logic, lockout, submission - no redirect)
├── service/login.service.js (validation logic)
└── sub-components/
    ├── LockoutWarning.jsx (shows warning at 3+ attempts)
    └── AuthMessage.jsx (error/success display)
```

## Input Fields

| Field | Type | Validation |
|-------|------|-----------|
| Username/Email | text | Required, non-empty (called "identifier" internally) |
| Password | password | Required, non-empty |

## API Endpoints
| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| POST | `/auth/login` | Submit login credentials | { data: user, token: jwt, message } |

## Form Validation
- **Email/Username**: Required, non-empty string
- **Password**: Required, non-empty string
- **DTO**: `LoginRequest` model validates input
- **Backend**: Returns 401 for invalid credentials, 403 for locked account

## Error Handling
| Status | Action |
|--------|--------|
| 401 Unauthorized | Increment failed attempts, show error + attempt count (e.g., "3/5") |
| 403 Forbidden | Lock account for 60s, show "Account locked" message |
| 4xx/5xx Other | Show error message from server |
| Timeout | Show generic error message |

## Authentication Flow
1. User enters credentials → click "START GAME"
2. Form validation (client-side DTOs)
3. `useAuthStore.login()` called via hook
4. Backend verifies credentials + returns JWT token
5. Token saved to localStorage (by authService)
6. Auth state updated: `isAuthenticated=true`, `user=identity`
7. Success message shown
8. **useEffect triggers** → auto-redirect to `/lobby` (NO setTimeout)

## User Flows
| Scenario | Flow |
|----------|------|
| Valid credentials | Submit → Auth state updates → useEffect redirects to `/lobby` |
| Invalid credentials (1st) | Show "❌ Invalid credentials. Attempts: 1/5" |
| 5 failed attempts | Auto-lock, show "Account locked for 60s" |
| Locked account tries again | Lock countdown persists, form disabled |
| Guest login | Redirect to `/play` (no auth required) |
| Already logged in on load | useEffect → redirect to `/lobby` |

## NEW: Password Recovery
- **Status**: Placeholder (coming soon)
- **Trigger**: Click "Forgot?" link next to password label
- **Current Behavior**: Shows alert "Password reset feature coming soon"
- **Future**: Should link to `/forgot-password` page

## Note on Navigation Fix
✅ **FIXED**: Removed `setTimeout` redirect - was causing race condition
✅ **NOW**: Single redirect via `useEffect` when auth state updates
✅ **BENEFIT**: Cleaner, more reliable, follows React patterns

## Current Status
- ✅ Fully implemented
- ✅ Account lockout working (5 attempts)
- ✅ Password visibility toggle functional
- ✅ Auth redirect to lobby working (fixed race condition)
- ✅ Error messages displaying correctly
- ✅ JWT token integration complete
