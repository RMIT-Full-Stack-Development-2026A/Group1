# Registration Page Documentation

## Overview
Account creation page for new players. Collects user credentials and profile information with client-side validation and country selection.

## Route & Access
- **Path**: `/register`
- **Access**: Public (guests only)
- **Protection**: ProtectedRoute component enforces guest-only access (redirects authenticated users to `/lobby`)
- **No Component-Level Auth**: This component does NOT check auth state itself

## Key Features
- ✅ Username input with validation
- ✅ Email input with format validation
- ✅ Password input with real-time criteria display
- ✅ Confirm password verification
- ✅ Country dropdown selector
- ✅ Real-time password strength indicators:
  - ✓ Uppercase letter (A-Z)
  - ✓ Lowercase letter (a-z)
  - ✓ Number (0-9)
  - ✓ Special character (!@#$%^&*)
  - ✓ Minimum 8 characters
- ✅ Form validation (client & server-side)
- ✅ Link to login page
- ✅ Terms & conditions checkbox (future)

## State Management
- **Store**: NOT used (no auth checks on this page)
- **Hook**: `useFormValidation()` manages form state + validation
- **Local State**:
  - `formData`: { username, email, password, confirmPassword, country }
  - `errors`: { [field]: errorMessage }
  - `passwordCriteria`: { uppercase, lowercase, number, special, minLength }
  - `loading`: API call in progress
  - `message`: { type, text } (success/error)
  - `showPassword`: boolean
  - `showConfirmPassword`: boolean

## Key Components
```
Register/
├── index.jsx (form UI - no auth checks)
├── hook/useFormValidation.hook.js (form validation + state management)
├── hook/useRegister.hook.js (registration submission logic)
└── sub-components/
    ├── PasswordCriteria.jsx (displays strength indicators)
    └── CountryDropdown.jsx (country selection)
```

## Input Fields

| Field | Type | Validation | Min/Max |
|-------|------|-----------|---------|
| Username | text | Required, alphanumeric + underscore, unique on backend | 3-20 chars |
| Email | email | Required, valid format, unique on backend | - |
| Password | password | Required, meets criteria below | 8+ chars |
| Confirm Password | password | Required, matches password field | - |
| Country | dropdown | Required, valid country code | - |

## Password Strength Requirements
- ✓ At least 1 uppercase letter (A-Z)
- ✓ At least 1 lowercase letter (a-z)
- ✓ At least 1 number (0-9)
- ✓ At least 1 special character (!@#$%^&*)
- ✓ Minimum 8 characters total

## Real-Time Validation
- **Username**: Display "Username available" / "Username taken" (on blur)
- **Email**: Display "Email valid" / "Invalid format" / "Email already registered" (on blur)
- **Password**: Show criteria checklist (as user types)
- **Confirm Password**: Show "Passwords match" / "Passwords don't match" (on blur)
- **All Fields**: Highlight invalid fields in red

## API Endpoints
| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| POST | `/auth/register` | Submit registration data | { data: user, token: jwt, message } |
| GET | `/auth/check-username/:username` | Verify username availability | { available: boolean } |
| GET | `/auth/check-email/:email` | Verify email availability | { available: boolean } |

## Validation & Error Handling
| Field | Error Scenarios | Message |
|-------|-----------------|---------|
| Username | Empty, short (<3), long (>20), taken, invalid chars | "Username must be 3-20 chars, alphanumeric" or "Username taken" |
| Email | Empty, invalid format, taken | "Invalid email format" or "Email already registered" |
| Password | Empty, weak criteria, too short | Shows individual criteria failures |
| Confirm Password | Empty, mismatch | "Passwords don't match" |
| Country | Empty | "Please select a country" |
| Submission | Validation failed, network error, server error | Shows specific backend error message |

## Registration Flow
1. User fills form → validates in real-time
2. Click "Create Account"
3. Client-side validation (all fields required, criteria met)
4. Submit to `/auth/register` with `RegisterRequest` DTO
5. Backend validates again, creates user account
6. JWT token returned + auto-saved to localStorage
7. Success message shown
8. **Auth state updates** → `isAuthenticated=true`
9. **ProtectedRoute redirect**: Auto-redirects to `/lobby` (not done by Register component)

## User Flows
| Scenario | Flow |
|----------|------|
| Valid registration | Fill form → validate → submit → token saved → ProtectedRoute redirects to `/lobby` |
| Username taken | Show "Username already taken" on blur |
| Email taken | Show "Email already registered" on blur |
| Weak password | Show unchecked criteria items (lowercase, special char, etc.) |
| Password mismatch | Show "Passwords don't match" under confirm password field |
| Network error | Show error message + retry button |
| 4xx/5xx error | Show backend error message from server |
| Already authenticated user accesses page | ProtectedRoute redirects to `/lobby` immediately |

## Authentication Note
✅ **Auth Protection**: Handled by ProtectedRoute wrapper (not by this component)
✅ **No useAuthStore**: This page doesn't import or use auth store directly
✅ **Cleaner Design**: Registration focuses only on form logic
✅ **Centralized Auth**: All auth checks happen at routing level

## Current Status
- ✅ Fully implemented
- ✅ Real-time password criteria validation working
- ✅ Country dropdown functional
- ✅ Client-side form validation complete
- ✅ Backend DTO integration complete
- ✅ No component-level auth checks (uses ProtectedRoute)
- ✅ Error handling & messaging working
- ✅ JWT token integration complete
- ⏳ Email verification feature pending (future)
- ⏳ Terms & conditions checkbox pending (future)
| Click "Already have an account?" | Navigate to `/login` |
| Already logged in | Auto-redirect to `/lobby` |

## Current Status
- ✅ Fully implemented
- ✅ Form validation working
- ✅ Country dropdown functional
- ✅ Password criteria display real-time
- ✅ Auth redirect to lobby working
- ✅ JWT token integration complete
- ✅ Error messages displaying correctly
