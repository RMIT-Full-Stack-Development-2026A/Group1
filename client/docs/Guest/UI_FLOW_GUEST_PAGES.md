# UI Flow Documentation: Guest Pages (Landing, Login, Registration)

## Overview

This document describes the user interface flow for the guest-facing pages of TicTacToang, including routes, API calls, event handlers, and component interactions. This flow serves as a contract between the frontend and backend teams for API implementation.

---

## 1. Page Structure & Routing

### Route Configuration

```
Frontend Routes (Client-Side):
├── / (Landing Page)
├── /login (Login Page)
└── /register (Registration Page)

API Base: http://localhost:5000/api/v1
```

**Routing File:** [`src/routes/AppRouter.jsx`](src/routes/AppRouter.jsx)

```jsx
<Route path="/" element={<LandingPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
```

---

## 2. Landing Page Flow

### 2.1 Page Overview

**File:** `src/pages/Guest/Landing/index.jsx`

The landing page serves as the entry point to the application. It displays:
- Hero section with app branding (TicTacToang)
- System status indicators
- Feature cards
- Call-to-action buttons (PLAY NOW, LOGIN)

### 2.2 Navigation Trigger

```
User Clicks Button
    ↓
navigate("/register")  OR  navigate("/login")
    ↓
React Router updates URL
    ↓
Navigates to corresponding page
```

### 2.3 Component Hierarchy

```
Landing Page (index.jsx)
├── Navigation Component (Header)
│   └── useNavigation Hook
├── Hero Section
│   ├── System Status Display
│   ├── App Title & Logo
│   └── Feature Cards
└── Action Buttons
    ├── "PLAY NOW" → navigate("/register")
    └── "LOGIN" → navigate("/login")
```

### 2.4 Event Handlers

| Event | Handler | Action |
|-------|---------|--------|
| Click "PLAY NOW" | `onClick={() => navigate("/register")}` | Navigate to registration page |
| Click "LOGIN" | `onClick={() => navigate("/login")}` | Navigate to login page |

---

## 3. Login Page Flow

### 3.1 Page Overview

**File:** `src/pages/Guest/Login/index.jsx`

The login page allows existing users to authenticate. Features include:
- Email/Password input fields
- Show/hide password toggle
- Success/Error message display
- Account lockout mechanism (5 failed attempts)
- Auto-redirect to profile on success

### 3.2 State Management

**Local State Components:**

```jsx
const [formData, setFormData] = useState({
  email: "",
  password: "",
});

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState({ type: "", text: "" });
const [failedAttempts, setFailedAttempts] = useState(0);
const [isLocked, setIsLocked] = useState(false);
const [lockoutCountdown, setLockoutCountdown] = useState(0);
const [showPassword, setShowPassword] = useState(false);
```

### 3.3 Event Flow Diagram

```
User Input (Email & Password)
    ↓
User Clicks "Sign In" Button
    ↓
handleSubmit(e)
    ↓
Form Validation
├── Email empty? → Show error
├── Password empty? → Show error
└── Both filled? → Continue
    ↓
Check if account is locked
├── Yes → Display lockout countdown
└── No → Continue
    ↓
Set loading = true
    ↓
[API CALL] POST /auth/login
    │
    ├─→ Success (200 OK)
    │   ├── Clear failedAttempts
    │   ├── Show success message
    │   ├── setMessage({ type: "success", text: "Login successful! Redirecting..." })
    │   ├── Wait 2 seconds
    │   └── navigate("/profile")
    │
    └─→ Failure (4xx/5xx)
        ├── Increment failedAttempts++
        ├── Check if failedAttempts === 5
        │   ├── Yes → Set isLocked = true, lockoutCountdown = 60
        │   └── No → Show generic error
        ├── setMessage({ type: "error", text: error.message })
        └── Keep user on login page
```

### 3.4 Account Lockout Flow

```
Failed Login Attempt
    ↓
failedAttempts++
    ↓
useEffect monitors failedAttempts
    ↓
failedAttempts === 5?
    ├── Yes: setIsLocked(true), setLockoutCountdown(60)
    └── No: Continue
    ↓
If isLocked = true → Start countdown timer
    ↓
Every 1000ms: lockoutCountdown--
    ↓
lockoutCountdown reaches 0?
    ├── Yes: Reset (isLocked = false, failedAttempts = 0)
    └── No: Continue countdown
    ↓
If isLocked: User cannot submit form
    ↓
Display: "Account locked due to too many failed attempts. Try again in {X}s."
```

### 3.5 API Call Details

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "UserPassword123!"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "role": "PLAYER"
  }
}
```

**Response (Failure - 401/400):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 3.6 Component Hierarchy

```
Login Page (index.jsx)
├── Navigation Component
├── Form Container
│   ├── Email Input Field
│   ├── Password Input Field
│   │   └── Show/Hide Toggle
│   ├── "Sign In" Submit Button
│   └── "Back to Landing" Link
├── Message Display (AuthMessage)
│   ├── Success Messages
│   └── Error Messages
└── Lockout Warning (LockoutWarning)
    └── Countdown Timer Display
```

### 3.7 Event Handlers

| Event | Handler | State Update | Effect |
|-------|---------|--------------|--------|
| Type in Email | `handleInputChange` | `formData.email` | Updates email state |
| Type in Password | `handleInputChange` | `formData.password` | Updates password state |
| Toggle Password | `setShowPassword(!showPassword)` | `showPassword` | Shows/hides password chars |
| Click "Sign In" | `handleSubmit(e)` | `loading = true` | Submits login request |
| Failed Login | Auto callback | `failedAttempts++` | Increments attempt counter |
| 5 Failed Attempts | useEffect monitor | `isLocked = true` | Activates lockout |
| Countdown Finish | useEffect interval | `isLocked = false` | Resets lockout |

### 3.8 Validation Rules

**Email:**
- Cannot be empty
- Must be a valid email format

**Password:**
- Cannot be empty
- Minimum validation (backend confirms exact rules)

---

## 4. Registration Page Flow

### 4.1 Page Overview

**File:** `src/pages/Guest/Register/index.jsx`

The registration page allows new users to create accounts. Features include:
- Username input with validation
- Email input with validation
- Password with strength indicator
- Password confirmation
- Country selector
- Real-time validation feedback with criteria checkboxes
- Success redirect to login page

### 4.2 State Management

**Local State Components:**

```jsx
// useFormValidation Hook
const form = useFormValidation();

// Form Data
form.formData = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  country: "Vietnam"
};

// Validation States
form.emailValidation = {
  hasAt: boolean,
  hasDot: boolean,
  validLength: boolean,
  noProhibited: boolean
};

form.usernameValidation = {
  validChars: boolean
};

form.passwordValidation = {
  hasLength: boolean,    // >= 8 characters
  hasNumber: boolean,    // Contains 0-9
  hasSpecial: boolean,   // Contains special chars
  hasCapital: boolean    // Contains A-Z
};

// UI States
form.loading = false;
form.message = { type: "", text: "" };
form.passwordStrength = 0; // 0-4 scale
```

**Validation Hook File:** `src/hooks/useFormValidation.js`

### 4.3 Event Flow Diagram

```
user inputs form data
    ↓
handleInputChange(e)
    ↓
[Three parallel validators run]
├─ Email: validateEmail() → emailValidation
├─ Username: validateUsername() → usernameValidation
└─ Password: validatePassword() → passwordValidation
    ↓
Real-time criteria checkboxes update
    ↓
User Clicks "CREATE ACCOUNT"
    ↓
handleSubmit(e)
    ↓
Validate all fields before API call
└─ Email valid? Check emailValidation object
├─ Username valid? Check usernameValidation object
├─ Password valid? Check passwordValidation object
└─ Passwords match? Compare password === confirmPassword
    ↓
If validation fails → Show all errors, return
    ↓
If validation passes → Continue
    ↓
Set loading = true
    ↓
[API CALL] POST /auth/register
    │
    ├─→ Success (201 Created)
    │   ├── setMessage({ type: "success", text: "Account created! Redirecting to login..." })
    │   ├── Wait 2 seconds
    │   └── navigate("/login")
    │
    └─→ Failure (400/409 Conflict)
        ├── setMessage({ type: "error", text: result.message })
        ├── Show error (email exists, username taken, etc.)
        └── Keep user on registration page
```

### 4.4 Real-Time Validation Display

**Email Validation Criteria:**
- ✓ Has '@' symbol
- ✓ Has '.' (dot) in domain
- ✓ Valid length (longer than minimum)
- ✓ No prohibited characters

**Username Validation Criteria:**
- ✓ Contains only: letters, numbers, underscore (_), hyphen (-)

**Password Validation Criteria:**
- ✓ Minimum 8 characters
- ✓ Contains at least one number (0-9)
- ✓ Contains at least one special character (!@#$%^&*)
- ✓ Contains at least one capital letter (A-Z)

**Password Strength Indicator:**
```
0 criteria met = 0/4 (Red)
1 criteria met = 1/4 (Weak)
2 criteria met = 2/4 (Fair)
3 criteria met = 3/4 (Good)
4 criteria met = 4/4 (Strong)
```

### 4.5 API Call Details

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "newplayer",
  "email": "newplayer@example.com",
  "password": "SecurePass123!",
  "country": "Vietnam"
}
```

**Response (Success - 201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "new-user-id",
    "username": "newplayer",
    "email": "newplayer@example.com",
    "country": "Vietnam",
    "role": "PLAYER"
  }
}
```

**Response (Conflict - 409):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

OR

```json
{
  "success": false,
  "message": "Username already taken"
}
```

### 4.6 Component Hierarchy

```
Registration Page (index.jsx)
├── Navigation Component
├── Form Container
│   ├── UsernameField Component
│   │   ├── Input Element
│   │   └── CriteriaCheckbox (validChars)
│   ├── EmailField Component
│   │   ├── Input Element
│   │   ├── CriteriaCheckbox (hasAt)
│   │   ├── CriteriaCheckbox (hasDot)
│   │   ├── CriteriaCheckbox (validLength)
│   │   └── CriteriaCheckbox (noProhibited)
│   ├── PasswordField Component
│   │   ├── Input Element
│   │   ├── CriteriaCheckbox (hasLength)
│   │   ├── CriteriaCheckbox (hasNumber)
│   │   ├── CriteriaCheckbox (hasSpecial)
│   │   ├── CriteriaCheckbox (hasCapital)
│   │   └── Strength Indicator Bar
│   ├── Confirm Password Field
│   │   └── Input Element
│   ├── Country Selector
│   │   └── Dropdown
│   ├── "CREATE ACCOUNT" Submit Button
│   └── "Back to Landing" Link
└── Message Display (AuthMessage)
    ├── Success Messages
    └── Error Messages
```

### 4.7 Event Handlers

| Event | Handler | Function | State Update |
|-------|---------|----------|--------------|
| Type in Username | `handleInputChange` | Updates username state | `formData.username` |
| Username Blur/Change | `handleUsernameChange` | Validates username | `usernameValidation` |
| Type in Email | `handleInputChange` | Updates email state | `formData.email` |
| Email Blur/Change | `handleEmailChange` | Validates email | `emailValidation` |
| Type in Password | `handlePasswordChange` | Validates & calc strength | `passwordValidation`, `passwordStrength` |
| Type in Confirm Password | `handleInputChange` | Updates confirm state | `formData.confirmPassword` |
| Change Country | `handleInputChange` | Updates country | `formData.country` |
| Click "CREATE ACCOUNT" | `handleSubmit(e)` | Validates & submits | `loading = true` |

### 4.8 Validation Rules Summary

| Field | Required | Min Length | Max Length | Pattern | Rules |
|-------|----------|-----------|-----------|---------|-------|
| Username | Yes | 1 | 50 | `[a-zA-Z0-9_-]+` | Letters, numbers, underscore, hyphen only |
| Email | Yes | 8 | 254 | RFC 5322 | Must have @, dot, valid length |
| Password | Yes | 8 | 128 | Complex | Uppercase, number, special char required |
| Confirm Password | Yes | 8 | 128 | Must match password | Must exactly match password field |
| Country | Yes | - | - | Dropdown | Pre-defined country list |

---

## 5. HTTP Helper & API Configuration

### 5.1 HTTP Helper Class

**File:** `src/utils/httpHelper.js`

```javascript
class HttpHelper {
  constructor() {
    this.api = axios.create({
      baseURL: "http://localhost:5000/api/v1", // Development
      timeout: 10000,
      withCredentials: true, // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor strips Axios wrapper
    this.api.interceptors.response.use(
      (response) => {
        return response.data; // Extract data directly
      },
      (error) => {
        if (error.response?.status === 401) {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        const message = error.response?.data?.message || 
                        "An unexpected error occurred. Please try again.";
        return Promise.reject(message);
      }
    );
  }

  post(url, data) {
    return this.api.post(url, data);
  }

  // Other methods: get(), put(), patch(), delete()
}
```

### 5.2 API Configuration

**File:** `src/config/apiConfig.js`

```javascript
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    CHECK_AUTH: "/auth/check-auth",
  },
  PROFILE: {
    UPDATE: "/profile",
    PASSWORD: "/profile/password",
    AVATAR: "/profile/avatar",
  },
  // ... other endpoints
};
```

### 5.3 Error Handling Flow

```
API Call Fails (4xx/5xx response)
    ↓
axios interceptor catches error
    ↓
401 Unauthorized?
├── Yes: Dispatch 'auth:unauthorized' event
└── No: Continue
    ↓
Extract error message from response.data.message
    ↓
If no message: Use default "An unexpected error occurred..."
    ↓
Promise.reject(message)
    ↓
Catch in component
    ↓
setMessage({ type: "error", text: error })
    ↓
Display error to user
```

---

## 6. Form Validation Utilities

### 6.1 Validation Functions

**File:** `src/utils/validationUtils.js`

#### Email Validation

```javascript
validateEmail(email) {
  return {
    hasAt: email.includes('@'),
    hasDot: email.includes('.'),
    validLength: email.length >= 8 && email.length <= 254,
    noProhibited: !email.match(/[<>()[\]\\,;:\s@"]/),
  };
}

isEmailValid(validation) {
  return Object.values(validation).every(v => v === true);
}
```

#### Username Validation

```javascript
validateUsername(username) {
  return {
    validChars: /^[a-zA-Z0-9_-]*$/.test(username),
  };
}

isUsernameValid(validation) {
  return validation.validChars && username.length > 0;
}
```

#### Password Validation

```javascript
validatePassword(password) {
  return {
    hasLength: password.length >= 8,
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    hasCapital: /[A-Z]/.test(password),
  };
}

isPasswordValid(validation) {
  return Object.values(validation).every(v => v === true);
}

passwordsMatch(password, confirmPassword) {
  return password === confirmPassword && password.length > 0;
}
```

---

## 7. Authentication Message Components

### 7.1 AuthMessage Component

**File:** `src/components/Login/AuthMessage.jsx`

Displays success or error messages with styling based on type.

```jsx
<AuthMessage 
  type="success" 
  text="Login successful! Redirecting..." 
/>

<AuthMessage 
  type="error" 
  text="Invalid email or password" 
/>
```

### 7.2 LockoutWarning Component

**File:** `src/components/Login/LockoutWarning.jsx`

Displays account lockout warning with countdown timer.

```jsx
<LockoutWarning 
  isLocked={true} 
  countdown={60} 
/>
```

---

## 8. Form Fields Components

### 8.1 Components Overview

**Directory:** `src/components/FormFields/`

Each field component handles:
- Label display
- Input validation
- Real-time validation feedback
- Criteria checkboxes (for email, password, username)

### 8.2 EmailField Component

**File:** `src/components/FormFields/EmailField.jsx`

```jsx
<EmailField
  value={formData.email}
  onChange={handleInputChange}
  emailValidation={emailValidation}
  CriteriaCheckbox={CriteriaCheckbox}
  disabled={loading}
/>
```

**Displays:**
- Email input field
- 4 criteria checkboxes (hasAt, hasDot, validLength, noProhibited)

### 8.3 PasswordField Component

**File:** `src/components/FormFields/PasswordField.jsx`

```jsx
<PasswordField
  value={formData.password}
  onChange={handleInputChange}
  passwordValidation={passwordValidation}
  passwordStrength={passwordStrength}
  CriteriaCheckbox={CriteriaCheckbox}
  disabled={loading}
/>
```

**Displays:**
- Password input field (toggleable show/hide)
- 4 criteria checkboxes (hasLength, hasNumber, hasSpecial, hasCapital)
- Strength indicator bar (0-4 scale)

### 8.4 UsernameField Component

**File:** `src/components/FormFields/UsernameField.jsx`

```jsx
<UsernameField
  value={formData.username}
  onChange={handleInputChange}
  usernameValidation={usernameValidation}
  CriteriaCheckbox={CriteriaCheckbox}
  disabled={loading}
/>
```

**Displays:**
- Username input field
- 1 criteria checkbox (validChars)

---

## 9. Complete API Call Sequence Diagrams

### 9.1 Login Sequence Diagram

```
┌─────────────┐                    ┌──────────────┐
│   Client    │                    │   Backend    │
│   (UI)      │                    │   API        │
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ 1. POST /auth/login              │
       │ {email, password}                │
       ├─────────────────────────────────>│
       │                                  │
       │ 2. Validate credentials          │
       │                                  │ (Check database)
       │                                  │
       │ 3. 200 OK                        │
       │ {token, user}                    │
       │<─────────────────────────────────┤
       │                                  │
       │ 4. Store token in localStorage   │
       │ 5. Navigate to /profile          │
       │                                  │
```

### 9.2 Registration Sequence Diagram

```
┌─────────────┐                    ┌──────────────┐
│   Client    │                    │   Backend    │
│   (UI)      │                    │   API        │
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ 1. Client-side validation       │
       │    (email, username, password)  │
       │                                  │
       │ 2. POST /auth/register           │
       │ {username, email, password,     │
       │  country}                        │
       ├─────────────────────────────────>│
       │                                  │
       │ 3. Server-side validation        │
       │    Check email uniqueness        │
       │    Check username uniqueness     │
       │                                  │
       │ 4. Hash password                 │
       │ 5. Store user in database        │
       │                                  │
       │ 6. 201 Created                   │
       │ {user object}                    │
       │<─────────────────────────────────┤
       │                                  │
       │ 7. Show success message          │
       │ 8. Navigate to /login            │
       │                                  │
```

---

## 10. Backend Implementation Checklist

This section provides a checklist for backend developers to implement the required endpoints based on this UI flow.

### Authentication Endpoints

#### POST /auth/register

**Requirements:**
- [ ] Accept username, email, password, country
- [ ] Validate email format (RFC 5322)
- [ ] Check email uniqueness in database
- [ ] Check username uniqueness in database
- [ ] Validate password minimum requirements
- [ ] Hash password (bcrypt recommended)
- [ ] Store user in database with role "PLAYER"
- [ ] Return 201 with user object or 409 if email/username exists
- [ ] Implement error messages for:
  - [ ] "Email already exists"
  - [ ] "Username already taken"
  - [ ] "Invalid email format"
  - [ ] "Password does not meet requirements"

#### POST /auth/login

**Requirements:**
- [ ] Accept email and password
- [ ] Query user by email
- [ ] Verify password using bcrypt
- [ ] Generate JWT token (store in HTTP-only cookie or return)
- [ ] Return 200 with user object and token
- [ ] Return 401 with message "Invalid email or password"
- [ ] Track failed login attempts (optional: backend-side tracking)
- [ ] Implement rate limiting (optional: 5 attempts per 60 seconds)

#### POST /auth/logout

**Requirements:**
- [ ] Invalidate current JWT token
- [ ] Clear authentication cookies
- [ ] Return 200 OK

#### GET /auth/check-auth

**Requirements:**
- [ ] Verify JWT token validity
- [ ] Return 200 with current user data if valid
- [ ] Return 401 if token invalid/expired
- [ ] Used for page refresh authentication checks

### Response Format Requirements

**All endpoints should return responses in this format:**

Success Response:
```json
{
  "success": true,
  "data": {
    // Response payload
  }
}
```

Error Response:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

---

## 11. Security Considerations

### Frontend Security Measures
- ✓ Password inputs use type="password" (hidden)
- ✓ Form validation before API submission (reduces unnecessary requests)
- ✓ HTTP-only cookies for session storage (if used)
- ✓ CSRF protection via axios withCredentials

### Backend Security Requirements
- [ ] HTTPS only (enforce in production)
- [ ] Password hashing with bcrypt (minimum 10 rounds)
- [ ] JWT expiration (recommended 1-2 hours)
- [ ] Refresh token rotation (optional but recommended)
- [ ] Rate limiting on login endpoint (prevent brute force)
- [ ] Input sanitization and validation
- [ ] CORS configuration
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention via proper response headers

---

## 12. Testing Scenarios

### Login Page Test Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty email/password | Show validation error |
| Invalid email format | API returns error |
| Correct credentials | Show success, redirect to profile |
| Wrong password 5 times | Account locked for 60 seconds |
| Click lockout warning | Show countdown timer |
| After lockout expires | Reset, allow login attempt |
| API timeout | Show timeout error message |

### Registration Page Test Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid email | Criteria checkbox fails |
| Email already exists | Show error "Email already exists" |
| Invalid username | Criteria checkbox fails |
| Weak password | Show password strength, criteria fail |
| Passwords don't match | Show error "Passwords must match" |
| All fields valid | API call succeeds, redirect to login |
| Network error | Show error message |

---

## 13. Future Enhancements

- **Social Login:** Add Google/GitHub OAuth integration
- **Email Verification:** Send verification email on registration
- **Password Reset:** Implement forgot password flow
- **Two-Factor Authentication:** Add 2FA on login
- **Remember Me:** Extended session with refresh tokens
- **Phone Number:** Optional phone number registration

---

## 14. References

- **Frontend Config:** [`src/config/apiConfig.js`](src/config/apiConfig.js)
- **HTTP Helper:** [`src/utils/httpHelper.js`](src/utils/httpHelper.js)
- **Validation Utils:** [`src/utils/validationUtils.js`](src/utils/validationUtils.js)
- **Form Validation Hook:** [`src/hooks/useFormValidation.js`](src/hooks/useFormValidation.js)
- **Backend Endpoints:** [`server/docs/ENDPOINTS.md`](server/docs/ENDPOINTS.md)
- **Frontend Architecture:** [`client/docs/ARCHITECTURE.md`](client/docs/ARCHITECTURE.md)

---

## 15. API Response Examples

### Successful Login Response

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "username": "johnsmith",
      "email": "john@example.com",
      "country": "United States",
      "role": "PLAYER",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Successful Registration Response

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "newplayer",
  "email": "new@example.com",
  "password": "SecurePass123!",
  "country": "Vietnam"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_456",
      "username": "newplayer",
      "email": "new@example.com",
      "country": "Vietnam",
      "role": "PLAYER",
      "createdAt": "2024-01-20T14:45:00Z"
    }
  }
}
```

### Error Response Examples

**Email Already Exists (409 Conflict):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Username Already Taken (409 Conflict):**
```json
{
  "success": false,
  "message": "Username already taken"
}
```

**Invalid Credentials (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

---

**Document Version:** 1.0  
**Last Updated:** April 2, 2026  
**Author:** GitHub Copilot  
**Status:** Complete
