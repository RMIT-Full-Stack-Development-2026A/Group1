/**
 * DTO Quick Reference Guide
 * 
 * This file demonstrates how to use the DTOs in your frontend code.
 * Copy these patterns into your components.
 * 
 * @file src/models/README.md
 */

# DTOs (Data Transfer Objects) - Quick Reference Guide

## What are DTOs?

DTOs are JavaScript classes that ensure **consistency**, **validation**, and **type safety** when sending/receiving data from the backend API.

---

## ✅ Using DTOs in Your Code

### Example 1: Login Form

```javascript
import { LoginRequest, LoginResponse } from "@/models/auth";

export function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1️⃣ CREATE DTO from form data
    const loginRequest = new LoginRequest(formData);

    // 2️⃣ VALIDATE using DTO
    const validation = loginRequest.validate();
    if (!validation.valid) {
      setError(validation.errors[0]); // Show first error
      return;
    }

    // 3️⃣ SUBMIT using DTO
    const result = await api.post('/auth/login', loginRequest.toJSON());

    // 4️⃣ PARSE response using DTO
    const response = new LoginResponse(result);
    
    if (response.isSuccess()) {
      // ✅ Login successful
      localStorage.setItem('token', response.getToken());
      navigate('/profile');
    } else if (response.getIsLocked()) {
      // 🔒 Account locked
      setLockout(true);
    } else {
      // ❌ Login failed
      setError(response.getErrorMessage());
    }
  };
}
```

---

### Example 2: Registration Form

```javascript
import { RegisterRequest, RegisterResponse } from "@/models/auth";

export function RegisterPage() {
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1️⃣ CREATE DTO
    const registerRequest = new RegisterRequest({
      username: "player123",
      email: "player@example.com",
      password: "SecurePass123!",
      country: "Vietnam"
    });

    // 2️⃣ VALIDATE
    const { valid, errors } = registerRequest.validate();
    if (!valid) {
      setErrors(errors);
      return;
    }

    // 3️⃣ SUBMIT
    const result = await api.post('/auth/register', registerRequest.toJSON());

    // 4️⃣ PARSE
    const response = new RegisterResponse(result);
    
    if (response.isSuccess()) {
      setMessage("Account created! Redirecting...");
      navigate('/login');
    } else {
      setError(response.getErrorMessage());
    }
  };
}
```

---

## 🎯 DTO Methods Reference

### LoginRequest

```javascript
const login = new LoginRequest({ email: "user@example.com", password: "pass123" });

login.validate();     // → { valid: boolean, errors: string[] }
login.email;          // → "user@example.com" (normalized)
login.password;       // → "pass123"
login.toJSON();       // → { email: "...", password: "..." }
```

### RegisterRequest

```javascript
const register = new RegisterRequest({
  username: "player",
  email: "player@example.com",
  password: "SecurePass123!",
  country: "Vietnam"
});

register.validate();     // → { valid: boolean, errors: string[] }
register.username;       // → "player" (trimmed)
register.email;          // → "player@example.com" (normalized)
register.password;       // → "SecurePass123!"
register.country;        // → "Vietnam"
register.toJSON();       // → { username, email, password, country }
```

### AuthResponse

```javascript
const response = new AuthResponse(apiResult);

response.isSuccess();       // → true if success
response.hasError();        // → true if error
response.getErrorMessage(); // → "Error message"
response.getUser();         // → { id, username, email, ... } or null
response.getToken();        // → "jwt-token" or null
```

### LoginResponse

```javascript
const response = new LoginResponse(apiResult);

// All AuthResponse methods plus:
response.getIsLocked();       // → true if account locked
response.getAttemptsRemaining(); // → number of attempts left
```

### RegisterResponse

```javascript
const response = new RegisterResponse(apiResult);

// All AuthResponse methods plus:
response.getVerificationCodeSent(); // → true if verification email sent
```

---

## 🔄 Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Form Input                                               │
│    User types: email, password                              │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Create DTO                                               │
│    const req = new LoginRequest({ email, password })        │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Validate                                                 │
│    req.validate() → { valid, errors }                       │
│    If invalid, show errors and return                       │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Submit to API                                            │
│    api.post('/auth/login', req.toJSON())                    │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Parse Response (DTO)                                     │
│    const resp = new LoginResponse(apiResult)                │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Type-Safe Access                                         │
│    if (resp.isSuccess()) { ... }                            │
│    if (resp.getIsLocked()) { ... }                          │
│    resp.getUser(), resp.getToken(), etc.                    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Advantages

| Feature | Without DTOs | With DTOs |
|---------|-------------|-----------|
| Type Safety | Manual type checking | Automatic validation |
| Error Messages | Scattered across code | Centralized in DTOs |
| Maintainability | Duplicate logic | Single source of truth |
| Documentation | Not obvious | Self-documenting |
| Refactoring | Error-prone | Safe with DTO updates |
| Testing | Hard to mock | Easy to create test DTOs |

---

## 📁 File Locations

- **DTO Classes:** `src/models/auth.js`
- **Usage Example (Login):** `src/pages/Guest/Login/index.jsx`
- **Usage Example (Register):** `src/pages/Guest/Register/index.jsx`
- **Documentation:** `docs/guest/UI_FLOW_GUEST_PAGES.md` (Section 2)

---

## 🚀 Best Practices

### ✅ DO

```javascript
// 1. Always create DTO first
const request = new LoginRequest(formData);

// 2. Always validate before submitting
if (!request.validate().valid) return;

// 3. Use typed getters on response
const user = response.getUser();
const token = response.getToken();

// 4. Submit DTO.toJSON()
api.post(url, request.toJSON());
```

### ❌ DON'T

```javascript
// 1. Don't submit raw form data
❌ api.post(url, formData); // Raw object

// 2. Don't access fields directly on response
❌ const token = response.token; // Direct access

// 3. Don't duplicate validation logic
❌ if (email.includes('@')) { ... } // Scattered validation

// 4. Don't skip validation
❌ api.post(url, request.toJSON()); // No validation
```

---

## 🔗 Related Documentation

- **Backend DTOs:** See `server/docs/MODELS.md`
- **API Endpoints:** See `server/docs/ENDPOINTS.md`
- **UI Flow:** See `client/docs/guest/UI_FLOW_GUEST_PAGES.md`

---

## 💡 Summary

1. **Create** a DTO from form data
2. **Validate** using DTO's validate method
3. **Submit** using DTO's toJSON method
4. **Parse** response with response DTO
5. **Access** data safely using typed getters

That's it! Use this pattern for all API calls.

---

**Last Updated:** April 2, 2026  
**Version:** 1.0
