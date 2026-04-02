# Frontend-Backend Integration Setup

## Files Created/Updated

✅ **Created:**
- `src/services/authService.js` - Real API service with axios & interceptors

✅ **Updated:**
- `src/models/auth.js` - LoginRequest now uses `identifier` field
- `src/pages/Guest/Login/index.jsx` - Uses real authService
- `src/pages/Guest/Register/index.jsx` - Uses real authService

---

## Setup Instructions

### 1. Create `.env.local` file in `/client` folder

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 2. Start Backend Server

```bash
cd server
npm run dev
# Should start on http://localhost:5000
```

### 3. Start Frontend (new terminal)

```bash
cd client
npm run dev
# Should start on http://localhost:8000
```

---

## What Changed

### authService.js Features

✅ **axios Interceptors:**
- Auto-attach token from localStorage if available
- Auto-redirect to /login if 401 (Unauthorized)
- Auto-logout if token expired

✅ **4 API Methods:**
1. `register(registerData)` - POST /auth/register
2. `login(loginData)` - POST /auth/login  
3. `checkAuth()` - GET /auth/check-auth
4. `getStoredUser()` - Read user from localStorage
5. `clearUser()` - Clear user from localStorage

✅ **Token Management:**
- Token stored in HttpOnly cookie (automatic, secure)
- User data stored in localStorage
- Auto-cleared on 401 error

### DTOs Updated

**LoginRequest** now accepts:
```javascript
{
  identifier: "email@gmail.com",  // or username
  password: "password123"
}
```

---

## Testing Workflow

### Test 1: Register New User
1. Go to http://localhost:8000/register
2. Fill form with valid data
3. Click "CREATE ACCOUNT"
4. Should redirect to login after 2 seconds

### Test 2: Login with Registered User
1. Go to http://localhost:8000/login
2. Enter email (or username) and password
3. Click "START GAME"
4. Should redirect to /profile after 2 seconds

### Test 3: Check Token Storage
1. After login, open DevTools (F12)
2. Go to Application → Cookies
3. Should see `access_token` (HttpOnly cookie)
4. Refresh page - should stay logged in (until token expires)

---

## Error Handling

**Frontend automatically handles:**
- Validation errors (400)
- Invalid credentials (401) - shows error message
- Account locked (403) - shows "Account locked" message
- Network errors - shows generic error message

**Backend validation is trusted:**
- Email must be valid format
- Username 9+ chars, only letters/numbers/-/_
- Password 9+ chars with uppercase, lowercase, number, special char

---

## Common Issues

### CORS Error?
✅ Backend already configured with CORS for localhost:8000

### Token not persisting?
✅ Token is HttpOnly cookie (won't show in localStorage)
- Check F12 → Application → Cookies → `access_token`

### 404 on /auth/login?
❌ Make sure you uncommented the login route in `server/src/modules/auth/routes/auth.routes.js`

### Backend not responding?
✅ Check:
- Backend running on port 5000
- `.env` has correct MONGO_URI
- MongoDB is running

---

## Next Steps (For Later)

After this integration is working, you can add:
- [ ] Protected routes (CheckAuth on app startup)
- [ ] Auth context provider
- [ ] Logout functionality
- [ ] Refresh token logic
- [ ] Remember me checkbox
- [ ] Password reset flow
