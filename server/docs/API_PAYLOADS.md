# TicTacToang API Payload Specification

This document defines the **complete request and response payload schemas** for all TicTacToang API endpoints, including validation rules, field constraints, and concrete examples.

## Table of Contents
1. [Global Response Patterns](#1-global-response-patterns)
2. [Authentication APIs](#2-authentication-apis)
3. [Profile APIs](#3-profile-apis)
4. [Game History & Replay APIs](#4-game-history--replay-apis)
5. [Room Snapshot APIs](#5-room-snapshot-apis)
6. [Wallet APIs](#6-wallet-apis)
7. [Subscription APIs](#7-subscription-apis)
8. [Admin APIs](#8-admin-apis)
9. [WebSocket Event Payloads](#9-websocket-event-payloads)
10. [Common Data Types](#10-common-data-types)

## 1. Global Response Patterns

### Success Response
```json
{
  "data": {},
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "cause": "Detailed cause of the error",
  "valid_example": "Example of valid input"
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource does not exist
- `CONFLICT` - Resource already exists or state conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## 2. Authentication APIs

### 2.1 POST `/api/v1/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "country": "string"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `username` | string | Yes | 3-30 chars, alphanumeric + underscore + hyphen only, pattern: `/^[a-zA-Z0-9_-]+$/` |
| `email` | string | Yes | Valid email format, max 254 chars, pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `password` | string | Yes | Min 8 chars, must contain uppercase, lowercase, number |
| `country` | string | Yes | Non-empty string, trimmed |

**Success Response (201 Created):**
```json
{
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "role": "PLAYER",
      "country": "VN",
      "avatar": null,
      "isPremium": false,
      "isActive": true,
      "createdAt": "2026-03-21T14:30:00.000Z"
    },
    "activeRoom": null
  },
  "message": "Registration successful"
}
```

**Error Responses:**

*Username already taken (409 Conflict):*
```json
{
  "error": "CONFLICT",
  "message": "Username already exists",
  "cause": "Username 'player123' is already registered",
  "valid_example": "Try a different username like 'player123_alt'"
}
```

*Invalid password (400 Validation Error):*
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Password does not meet requirements",
  "cause": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  "valid_example": "Password123"
}
```

### 2.2 POST `/api/v1/auth/login`

**Request Body:**
```json
{
  "identifier": "string",
  "password": "string"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `identifier` | string | Yes | Username or email |
| `password` | string | Yes | Non-empty string |

**Success Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "role": "PLAYER",
      "country": "VN",
      "avatar": "https://cdn.example.com/avatars/player123.jpg",
      "isPremium": true,
      "isActive": true,
      "createdAt": "2026-03-21T14:30:00.000Z"
    },
    "activeRoom": null
  },
  "message": "Login successful"
}
```

**Notes:**
- Sets `access_token` httpOnly cookie
- Cookie expires in 7 days
- Returns `activeRoom` if user was in a live room

**Error Responses:**

*Invalid credentials (401 Unauthorized):*
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials",
  "cause": "Username or password is incorrect",
  "valid_example": "Check your username and password"
}
```

*Account locked (429 Rate Limit):*
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Account temporarily locked",
  "cause": "Too many failed login attempts",
  "valid_example": "Please try again after 60 seconds"
}
```

*Inactive account (403 Forbidden):*
```json
{
  "error": "FORBIDDEN",
  "message": "Account is deactivated",
  "cause": "This account has been deactivated by an administrator",
  "valid_example": "Contact support for assistance"
}
```

### 2.3 POST `/api/v1/auth/logout`

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "data": null,
  "message": "Logout successful"
}
```

**Notes:**
- Clears `access_token` cookie
- Always succeeds even if not authenticated

### 2.4 GET `/api/v1/auth/check-auth`

**Request:** No body

**Success Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "role": "PLAYER",
      "country": "VN",
      "avatar": "https://cdn.example.com/avatars/player123.jpg",
      "isPremium": true,
      "isActive": true,
      "createdAt": "2026-03-21T14:30:00.000Z"
    },
    "activeRoom": {
      "id": "507f1f77bcf86cd799439012",
      "roomNumber": "ROOM-2026-001234",
      "boardSize": 10,
      "status": "PLAYING",
      "moveCount": 5,
      "participants": [
        {
          "userId": "507f1f77bcf86cd799439011",
          "usernameSnapshot": "player123",
          "mark": "X",
          "isReady": false
        },
        {
          "userId": "507f1f77bcf86cd799439013",
          "usernameSnapshot": "opponent456",
          "mark": "O",
          "isReady": false
        }
      ]
    }
  },
  "message": "Authenticated"
}
```

**activeRoom Response (when user has no active room):**
```json
{
  "data": {
    "user": { ... },
    "activeRoom": null
  },
  "message": "Authenticated"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "cause": "No valid session found",
  "valid_example": "Please login to continue"
}
```

## 3. Profile APIs

### 3.1 GET `/api/v1/profile`

**Request:** No body

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player123",
    "email": "player@example.com",
    "role": "PLAYER",
    "country": "VN",
    "avatar": "https://cdn.example.com/avatars/player123.jpg",
    "isPremium": true,
    "isActive": true,
    "createdAt": "2026-03-21T14:30:00.000Z"
  },
  "message": "Profile fetched successfully"
}
```

### 3.2 GET `/api/v1/profile/overview`

**Request:** No body

**Success Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "role": "PLAYER",
      "country": "VN",
      "avatar": "https://cdn.example.com/avatars/player123.jpg",
      "isPremium": true,
      "isActive": true,
      "createdAt": "2026-03-21T14:30:00.000Z"
    },
    
    "subscription": {
      "isPremium": true,
      "premiumExpiresAt": "2026-06-01T00:00:00.000Z"
    },
    "stats": {
      "totalGames": 120,
      "wins": 55,
      "losses": 40,
      "draws": 15,
      "aborted": 10
    },
    "recentGames": [
      {
        "id": "507f1f77bcf86cd799439014",
        "sessionNumber": "GAME-2026-005678",
        "gameType": "ONLINE_MATCH",
        "boardSize": 10,
        "startedAt": "2026-04-12T10:30:00.000Z",
        "endedAt": "2026-04-12T10:45:00.000Z",
        "status": "COMPLETED",
        "opponentName": "opponent456",
        "viewerResult": "WIN"
      },
      {
        "id": "507f1f77bcf86cd799439015",
        "sessionNumber": "GAME-2026-005677",
        "gameType": "SINGLE_PLAYER",
        "boardSize": 10,
        "startedAt": "2026-04-11T15:20:00.000Z",
        "endedAt": "2026-04-11T15:35:00.000Z",
        "status": "COMPLETED",
        "opponentName": "AI (MEDIUM)",
        "viewerResult": "LOSE"
      }
    ]
  },
  "message": "Profile overview fetched successfully"
}
```

**Notes:**
- Aggregates data from user, wallet, subscription, and game modules
- `recentGames` limited to last 5 games
- Single optimized endpoint to avoid multiple API calls on Profile page load

### 3.3 PUT `/api/v1/profile/update`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "country": "string"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `username` | string | No | 3-30 chars, alphanumeric + underscore + hyphen, pattern: `/^[a-zA-Z0-9_-]+$/` |
| `email` | string | No | Valid email format, max 254 chars |
| `country` | string | No | Non-empty string, trimmed |

**Notes:**
- All fields are optional
- Only provided fields will be updated
- At least one field must be provided

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "newusername",
    "email": "newemail@example.com",
    "role": "PLAYER",
    "country": "US",
    "avatar": "https://cdn.example.com/avatars/player123.jpg",
    "isPremium": true,
    "isActive": true,
    "createdAt": "2026-03-21T14:30:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

**Error Responses:**

*Username already taken (409 Conflict):*
```json
{
  "error": "CONFLICT",
  "message": "Username already exists",
  "cause": "Username 'newusername' is already taken",
  "valid_example": "Try a different username"
}
```

*No fields provided (400 Validation Error):*
```json
{
  "error": "VALIDATION_ERROR",
  "message": "No fields to update",
  "cause": "Request body must contain at least one field to update",
  "valid_example": "{\"username\": \"newusername\"}"
}
```

### 3.4 PATCH `/api/v1/profile/password`

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `currentPassword` | string | Yes | Non-empty string |
| `newPassword` | string | Yes | Min 8 chars, must contain uppercase, lowercase, number |

**Success Response (200 OK):**
```json
{
  "data": null,
  "message": "Password changed successfully"
}
```

**Error Responses:**

*Incorrect current password (401 Unauthorized):*
```json
{
  "error": "UNAUTHORIZED",
  "message": "Current password is incorrect",
  "cause": "The provided current password does not match",
  "valid_example": "Check your current password"
}
```

### 3.5 POST `/api/v1/profile/avatar`

**Request Body:** `multipart/form-data`
```
avatar: <File>
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `avatar` | File | Yes | Image file (jpg, jpeg, png, webp), max 5MB |

**Success Response (200 OK):**
```json
{
  "data": {
    "avatar": "https://cdn.example.com/avatars/507f1f77bcf86cd799439011.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

**Error Responses:**

*Invalid file type (400 Validation Error):*
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid file type",
  "cause": "File must be an image (jpg, jpeg, png, webp)",
  "valid_example": "Upload a jpg, jpeg, png, or webp file"
}
```

*File too large (400 Validation Error):*
```json
{
  "error": "VALIDATION_ERROR",
  "message": "File size exceeds limit",
  "cause": "File size must be under 5MB",
  "valid_example": "Compress your image and try again"
}
```

## 4. Game History & Replay APIs

### 4.1 POST `/api/v1/games`

**Purpose:** Save a completed local/AI game session (non-online matches)

**Request Body:**
```json
{
  "gameType": "string",
  "boardSize": 10,
  "boardStyle": "string",
  "markerStyle": "string",
  "participants": [
    {
      "usernameSnapshot": "string",
      "role": "string",
      "mark": "string",
      "aiDifficulty": "string"
    }
  ],
  "firstTurnParticipantIndex": 0,
  "winnerParticipantIndex": 0,
  "status": "string",
  "endedReason": "string",
  "winningLine": [
    { "row": 0, "col": 0, "coordinate": "A1" }
  ],
  "moves": [
    {
      "moveNumber": 1,
      "byParticipantIndex": 0,
      "row": 0,
      "col": 0,
      "coordinate": "A1"
    }
  ],
  "startedAt": "2026-04-12T10:30:00.000Z",
  "endedAt": "2026-04-12T10:45:00.000Z"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `gameType` | string | Yes | Enum: `SINGLE_PLAYER`, `TWO_PLAYERS` |
| `boardSize` | number | Yes | Enum: `10`, `15` |
| `boardStyle` | string | No | Default: `"classic"` |
| `markerStyle` | string | No | Default: `"classic"` |
| `participants` | array | Yes | Array of 2 participant objects |
| `participants[].usernameSnapshot` | string | Yes | Display name for this participant |
| `participants[].role` | string | Yes | Enum: `HUMAN`, `AI` |
| `participants[].mark` | string | Yes | Enum: `X`, `O` |
| `participants[].aiDifficulty` | string | No | Enum: `EASY`, `MEDIUM`, `HARD` (required if role is `AI`) |
| `firstTurnParticipantIndex` | number | Yes | Enum: `0`, `1` |
| `winnerParticipantIndex` | number | No | Enum: `0`, `1`, `null` (null for draw) |
| `status` | string | Yes | Enum: `COMPLETED`, `ABORTED` |
| `endedReason` | string | No | Enum: `WINNER`, `DRAW`, `PLAYER_ABORT` |
| `winningLine` | array | No | Array of coordinate objects |
| `moves` | array | Yes | Array of move objects |
| `startedAt` | string | Yes | ISO 8601 date string |
| `endedAt` | string | Yes | ISO 8601 date string |

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "sessionNumber": "GAME-2026-005678"
  },
  "message": "Game session saved successfully"
}
```

**Error Responses:**

*Invalid game type (400 Validation Error):*
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid game type",
  "cause": "gameType must be SINGLE_PLAYER or TWO_PLAYERS for manual saves",
  "valid_example": "{\"gameType\": \"SINGLE_PLAYER\"}"
}
```

### 4.2 GET `/api/v1/games`

**Query Parameters:**
| Parameter | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `page` | number | No | 1 | Min: 1 |
| `limit` | number | No | 20 | Min: 1, Max: 100 |
| `q` | string | No | - | Search by session number or opponent name |
| `gameType` | string | No | - | Enum: `SINGLE_PLAYER`, `TWO_PLAYERS`, `ONLINE_MATCH` |
| `result` | string | No | - | Enum: `WIN`, `LOSE`, `DRAW`, `ABORTED` (from viewer perspective) |
| `from` | string | No | - | ISO 8601 date string |
| `to` | string | No | - | ISO 8601 date string |
| `sortBy` | string | No | `createdAt` | Enum: `createdAt`, `startedAt` |
| `sortOrder` | string | No | `desc` | Enum: `asc`, `desc` |

**Example Request:**
```
GET /api/v1/games?page=1&limit=20&gameType=ONLINE_MATCH&result=WIN&sortBy=startedAt&sortOrder=desc
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439014",
        "sessionNumber": "GAME-2026-005678",
        "gameType": "ONLINE_MATCH",
        "boardSize": 10,
        "startedAt": "2026-04-12T10:30:00.000Z",
        "endedAt": "2026-04-12T10:45:00.000Z",
        "status": "COMPLETED",
        "opponentName": "opponent456",
        "viewerResult": "WIN"
      },
      {
        "id": "507f1f77bcf86cd799439015",
        "sessionNumber": "GAME-2026-005677",
        "gameType": "SINGLE_PLAYER",
        "boardSize": 10,
        "startedAt": "2026-04-11T15:20:00.000Z",
        "endedAt": "2026-04-11T15:35:00.000Z",
        "status": "COMPLETED",
        "opponentName": "AI (MEDIUM)",
        "viewerResult": "LOSE"
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 20
  },
  "message": "Game sessions fetched successfully"
}
```

### 4.3 GET `/api/v1/games/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Game session ID |

**Example Request:**
```
GET /api/v1/games/507f1f77bcf86cd799439014
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "sessionNumber": "GAME-2026-005678",
    "sourceRoomId": "507f1f77bcf86cd799439012",
    "gameType": "ONLINE_MATCH",
    "boardSize": 10,
    "boardStyle": "classic",
    "markerStyle": "classic",
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "usernameSnapshot": "player123",
        "role": "HUMAN",
        "mark": "X",
        "aiDifficulty": null
      },
      {
        "userId": "507f1f77bcf86cd799439013",
        "usernameSnapshot": "opponent456",
        "role": "HUMAN",
        "mark": "O",
        "aiDifficulty": null
      }
    ],
    "firstTurnParticipantIndex": 0,
    "winnerParticipantIndex": 0,
    "status": "COMPLETED",
    "endedReason": "WINNER",
    "abortedByUserId": null,
    "winningLine": [
      { "row": 0, "col": 0, "coordinate": "A1" },
      { "row": 0, "col": 1, "coordinate": "B1" },
      { "row": 0, "col": 2, "coordinate": "C1" },
      { "row": 0, "col": 3, "coordinate": "D1" },
      { "row": 0, "col": 4, "coordinate": "E1" }
    ],
    "moves": [
      {
        "moveNumber": 1,
        "byParticipantIndex": 0,
        "row": 0,
        "col": 0,
        "coordinate": "A1",
        "placedAt": "2026-04-12T10:30:05.000Z"
      },
      {
        "moveNumber": 2,
        "byParticipantIndex": 1,
        "row": 1,
        "col": 0,
        "coordinate": "A2",
        "placedAt": "2026-04-12T10:30:12.000Z"
      }
    ],
    "totalMoves": 9,
    "startedAt": "2026-04-12T10:30:00.000Z",
    "endedAt": "2026-04-12T10:45:00.000Z",
    "durationMs": 900000,
    "createdAt": "2026-04-12T10:45:00.000Z"
  },
  "message": "Game session fetched successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Game session not found",
  "cause": "No game session exists with ID: 507f1f77bcf86cd799439014",
  "valid_example": "Check the session ID"
}
```

## 5. Room Snapshot APIs

### 5.1 GET `/api/v1/rooms`

**Query Parameters:**
| Parameter | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `status` | string | No | - | Enum: `WAITING`, `READY`, `PLAYING` |
| `boardSize` | number | No | - | Enum: `10`, `15` |
| `page` | number | No | 1 | Min: 1 |
| `limit` | number | No | 50 | Min: 1, Max: 100 |

**Example Request:**
```
GET /api/v1/rooms?status=WAITING&boardSize=10
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439016",
        "roomNumber": "ROOM-2026-001235",
        "boardSize": 10,
        "boardStyle": "CLASSIC",
        "markerStyle": "CLASSIC",
        "status": "WAITING",
        "participants": [
          {
            "userId": "507f1f77bcf86cd799439017",
            "usernameSnapshot": "waitingplayer",
            "mark": "X",
            "isReady": false,
            "isHost": true
          }
        ],
        "moveCount": 0,
        "startedAt": null,
        "endedAt": null,
        "lastMove": null,
        "createdAt": "2026-04-12T11:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 50
  },
  "message": "Rooms fetched successfully"
}
```

### 5.2 GET `/api/v1/rooms/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Room ID |

**Example Request:**
```
GET /api/v1/rooms/507f1f77bcf86cd799439016
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "roomNumber": "ROOM-2026-001235",
    "boardSize": 10,
    "boardStyle": "CLASSIC",
    "markerStyle": "CLASSIC",
    "status": "PLAYING",
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "usernameSnapshot": "player123",
        "mark": "X",
        "isReady": false,
        "isHost": true
      },
      {
        "userId": "507f1f77bcf86cd799439013",
        "usernameSnapshot": "opponent456",
        "mark": "O",
        "isReady": false,
        "isHost": false
      }
    ],
    "currentTurnParticipantIndex": 1,
    "moves": [
      {
        "moveNumber": 1,
        "byParticipantIndex": 0,
        "row": 0,
        "col": 0,
        "coordinate": "A1",
        "placedAt": "2026-04-12T11:05:00.000Z"
      },
      {
        "moveNumber": 2,
        "byParticipantIndex": 1,
        "row": 1,
        "col": 0,
        "coordinate": "A2",
        "placedAt": "2026-04-12T11:05:15.000Z"
      }
    ],
    "moveCount": 2,
    "winningLine": [],
    "lastMove": {
      "row": 1,
      "col": 0,
      "coordinate": "A2"
    },
    "startedAt": "2026-04-12T11:04:30.000Z",
    "endedAt": null,
    "closedBy": null,
    "createdAt": "2026-04-12T11:00:00.000Z"
  },
  "message": "Room fetched successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Room not found",
  "cause": "No room exists with ID: 507f1f77bcf86cd799439016",
  "valid_example": "Check the room ID"
}
```

## 6. Wallet APIs

### 6.1 GET `/api/v1/wallet`

**Request:** No body

**Success Response (200 OK):**
```json
{
  "data": {
    "balance": 50,
    "recentTransactions": [
      {
        "id": "507f1f77bcf86cd799439018",
        "type": "DEPOSIT",
        "amount": 20,
        "currency": "USD",
        "status": "SUCCESS",
        "provider": "STRIPE",
        "createdAt": "2026-04-10T14:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439019",
        "type": "SUBSCRIPTION",
        "amount": -15,
        "currency": "USD",
        "status": "SUCCESS",
        "provider": "LOCAL_WALLET",
        "createdAt": "2026-04-01T10:00:00.000Z"
      }
    ]
  },
  "message": "Wallet fetched successfully"
}
```

**Notes:**
- `recentTransactions` limited to last 5 transactions
- Negative amounts represent deductions (subscriptions)

### 6.2 POST `/api/v1/wallet/deposit`

**Request Body:**
```json
{
  "amount": 20,
  "provider": "STRIPE",
  "externalTransactionId": "pi_1234567890"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `amount` | number | Yes | Min: 1, Max: 1000 |
| `provider` | string | Yes | Enum: `STRIPE`, `PAYPAL`, `LOCAL_WALLET` |
| `externalTransactionId` | string | No | String, required if provider is external (STRIPE, PAYPAL) |

**Success Response (201 Created):**
```json
{
  "data": {
    "transaction": {
      "id": "507f1f77bcf86cd799439018",
      "type": "DEPOSIT",
      "amount": 20,
      "currency": "USD",
      "status": "SUCCESS",
      "provider": "STRIPE",
      "balanceBefore": 30,
      "balanceAfter": 50,
      "createdAt": "2026-04-12T11:30:00.000Z"
    },
    "newBalance": 50
  },
  "message": "Deposit successful"
}
```

**Error Responses:**

*Invalid amount (400 Validation Error):*
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid deposit amount",
  "cause": "Amount must be between 1 and 1000",
  "valid_example": "{\"amount\": 20}"
}
```

### 6.3 GET `/api/v1/wallet/transactions`

**Query Parameters:**
| Parameter | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `page` | number | No | 1 | Min: 1 |
| `limit` | number | No | 20 | Min: 1, Max: 100 |
| `type` | string | No | - | Enum: `DEPOSIT`, `SUBSCRIPTION` |
| `status` | string | No | - | Enum: `PENDING`, `SUCCESS`, `FAILED` |
| `from` | string | No | - | ISO 8601 date string |
| `to` | string | No | - | ISO 8601 date string |
| `sortBy` | string | No | `createdAt` | Enum: `createdAt`, `amount` |
| `sortOrder` | string | No | `desc` | Enum: `asc`, `desc` |

**Example Request:**
```
GET /api/v1/wallet/transactions?page=1&limit=20&type=DEPOSIT&status=SUCCESS
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439018",
        "type": "DEPOSIT",
        "amount": 20,
        "currency": "USD",
        "status": "SUCCESS",
        "provider": "STRIPE",
        "externalTransactionId": "pi_1234567890",
        "balanceBefore": 30,
        "balanceAfter": 50,
        "createdAt": "2026-04-10T14:30:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  },
  "message": "Transactions fetched successfully"
}
```

## 7. Subscription APIs

### 7.1 GET `/api/v1/subscription/status`

**Request:** No body

**Success Response (200 OK):**
```json
{
  "data": {
    "isPremium": true,
    "premiumExpiresAt": "2026-06-01T00:00:00.000Z"
  },
  "message": "Subscription status fetched successfully"
}
```

**Notes:**
- `isPremium` is true if `premiumExpiresAt` is in the future
- Both fields are null if user has never subscribed

### 7.2 POST `/api/v1/subscription/subscribe`

**Request Body:**
```json
{
  "provider": "LOCAL_WALLET"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `provider` | string | No | Enum: `LOCAL_WALLET`, `STRIPE`, `PAYPAL`, default: `LOCAL_WALLET` |

**Notes:**
- Monthly subscription costs 15 USD
- Deducted from wallet balance if provider is `LOCAL_WALLET`

**Success Response (201 Created):**
```json
{
  "data": {
    "subscription": {
      "isPremium": true,
      "premiumExpiresAt": "2026-05-12T00:00:00.000Z"
    },
    "transaction": {
      "id": "507f1f77bcf86cd799439019",
      "type": "SUBSCRIPTION",
      "amount": 15,
      "currency": "USD",
      "status": "SUCCESS",
      "provider": "LOCAL_WALLET",
      "subscriptionPeriodStart": "2026-04-12T00:00:00.000Z",
      "subscriptionPeriodEnd": "2026-05-12T00:00:00.000Z",
      "balanceBefore": 50,
      "balanceAfter": 35,
      "createdAt": "2026-04-12T11:45:00.000Z"
    },
    "newBalance": 35
  },
  "message": "Subscription successful"
}
```

**Error Responses:**

*Insufficient balance (400 Validation Error):*
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Insufficient wallet balance",
  "cause": "Current balance: 10 USD, required: 15 USD",
  "valid_example": "Add funds to your wallet first"
}
```

*Already premium (409 Conflict):*
```json
{
  "error": "CONFLICT",
  "message": "Already have active premium subscription",
  "cause": "Your premium membership expires on 2026-05-12",
  "valid_example": "Wait until current subscription expires"
}
```

### 7.3 GET `/api/v1/subscription/history`

**Query Parameters:**
| Parameter | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `page` | number | No | 1 | Min: 1 |
| `limit` | number | No | 20 | Min: 1, Max: 100 |
| `sortBy` | string | No | `createdAt` | Enum: `createdAt` |
| `sortOrder` | string | No | `desc` | Enum: `asc`, `desc` |

**Example Request:**
```
GET /api/v1/subscription/history?page=1&limit=20
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439019",
        "type": "SUBSCRIPTION",
        "amount": 15,
        "currency": "USD",
        "status": "SUCCESS",
        "provider": "LOCAL_WALLET",
        "subscriptionPeriodStart": "2026-04-12T00:00:00.000Z",
        "subscriptionPeriodEnd": "2026-05-12T00:00:00.000Z",
        "createdAt": "2026-04-12T11:45:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  },
  "message": "Subscription history fetched successfully"
}
```

## 8. Admin APIs

### 8.1 GET `/api/v1/admin/dashboard`

**Request:** No body

**Success Response (200 OK):**
```json
{
  "data": {
    "totalPlayers": 1250,
    "activePlayers": 1100,
    "premiumPlayers": 350,
    "activeRooms": 25,
    "totalMatches": 15678,
    "totalRevenue": 5250.00,
    "revenueThisMonth": 875.00,
    "newPlayersToday": 12,
    "newPlayersThisWeek": 85,
    "newPlayersThisMonth": 320
  },
  "message": "Admin dashboard fetched successfully"
}
```

**Notes:**
- Single aggregated endpoint to avoid multiple API calls
- All counts are real-time snapshots

### 8.2 GET `/api/v1/admin/players`

**Query Parameters:**
| Parameter | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `page` | number | No | 1 | Min: 1 |
| `limit` | number | No | 20 | Min: 1, Max: 100 |
| `q` | string | No | - | Search by username or email |
| `status` | string | No | - | Enum: `ACTIVE`, `INACTIVE` |
| `premium` | boolean | No | - | Filter by premium status |
| `sortBy` | string | No | `createdAt` | Enum: `createdAt`, `username`, `lastLoginAt` |
| `sortOrder` | string | No | `desc` | Enum: `asc`, `desc` |

**Example Request:**
```
GET /api/v1/admin/players?page=1&limit=20&status=ACTIVE&premium=true&sortBy=lastLoginAt&sortOrder=desc
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "username": "player123",
        "email": "player@example.com",
        "role": "PLAYER",
        "country": "VN",
        "isPremium": true,
        "isActive": true,
        "lastLoginAt": "2026-04-12T11:00:00.000Z",
        "createdAt": "2026-03-21T14:30:00.000Z"
      }
    ],
    "total": 350,
    "page": 1,
    "limit": 20
  },
  "message": "Players fetched successfully"
}
```

### 8.3 GET `/api/v1/admin/players/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | User ID |

**Example Request:**
```
GET /api/v1/admin/players/507f1f77bcf86cd799439011
```

**Success Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "role": "PLAYER",
      "country": "VN",
      "avatar": "https://cdn.example.com/avatars/player123.jpg",
      "isPremium": true,
      "isActive": true,
      "premiumExpiresAt": "2026-06-01T00:00:00.000Z",
      "lastLoginAt": "2026-04-12T11:00:00.000Z",
      "createdAt": "2026-03-21T14:30:00.000Z"
    },
    "stats": {
      "totalGames": 120,
      "wins": 55,
      "losses": 40,
      "draws": 15,
      "aborted": 10
    },
    "wallet": {
      "balance": 35
    },
    "recentGames": [
      {
        "id": "507f1f77bcf86cd799439014",
        "sessionNumber": "GAME-2026-005678",
        "gameType": "ONLINE_MATCH",
        "startedAt": "2026-04-12T10:30:00.000Z",
        "endedAt": "2026-04-12T10:45:00.000Z",
        "status": "COMPLETED",
        "opponentName": "opponent456"
      }
    ]
  },
  "message": "Player details fetched successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Player not found",
  "cause": "No player exists with ID: 507f1f77bcf86cd799439011",
  "valid_example": "Check the player ID"
}
```

### 8.4 PATCH `/api/v1/admin/players/:id/deactivate`

**Path Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | User ID |

**Request Body:**
```json
{
  "reason": "string"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `reason` | string | No | Optional deactivation reason for audit trail |

**Example Request:**
```
PATCH /api/v1/admin/players/507f1f77bcf86cd799439011/deactivate
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player123",
    "isActive": false
  },
  "message": "Player deactivated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Player not found",
  "cause": "No player exists with ID: 507f1f77bcf86cd799439011",
  "valid_example": "Check the player ID"
}
```

### 8.5 PATCH `/api/v1/admin/players/:id/reactivate`

**Path Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | User ID |

**Request Body:** None

**Example Request:**
```
PATCH /api/v1/admin/players/507f1f77bcf86cd799439011/reactivate
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player123",
    "isActive": true
  },
  "message": "Player reactivated successfully"
}
```

### 8.6 GET `/api/v1/admin/rooms`

**Query Parameters:**
| Parameter | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `page` | number | No | 1 | Min: 1 |
| `limit` | number | No | 20 | Min: 1, Max: 100 |
| `status` | string | No | - | Enum: `WAITING`, `READY`, `PLAYING`, `ABORTED` |
| `boardSize` | number | No | - | Enum: `10`, `15` |
| `sortBy` | string | No | `createdAt` | Enum: `createdAt`, `startedAt` |
| `sortOrder` | string | No | `desc` | Enum: `asc`, `desc` |

**Example Request:**
```
GET /api/v1/admin/rooms?status=PLAYING&page=1&limit=20
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439016",
        "roomNumber": "ROOM-2026-001235",
        "boardSize": 10,
        "status": "PLAYING",
        "participants": [
          {
            "userId": "507f1f77bcf86cd799439011",
            "usernameSnapshot": "player123",
            "mark": "X"
          },
          {
            "userId": "507f1f77bcf86cd799439013",
            "usernameSnapshot": "opponent456",
            "mark": "O"
          }
        ],
        "moveCount": 8,
        "startedAt": "2026-04-12T11:04:30.000Z",
        "createdAt": "2026-04-12T11:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20
  },
  "message": "Rooms fetched successfully"
}
```

### 8.7 GET `/api/v1/admin/rooms/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Room ID |

**Example Request:**
```
GET /api/v1/admin/rooms/507f1f77bcf86cd799439016
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "roomNumber": "ROOM-2026-001235",
    "boardSize": 10,
    "status": "PLAYING",
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "usernameSnapshot": "player123",
        "mark": "X",
        "isReady": false
      },
      {
        "userId": "507f1f77bcf86cd799439013",
        "usernameSnapshot": "opponent456",
        "mark": "O",
        "isReady": false
      }
    ],
    "currentTurnParticipantIndex": 1,
    "moves": [
      {
        "moveNumber": 1,
        "byParticipantIndex": 0,
        "row": 0,
        "col": 0,
        "coordinate": "A1",
        "placedAt": "2026-04-12T11:05:00.000Z"
      }
    ],
    "moveCount": 8,
    "winningLine": [],
    "lastMove": {
      "row": 1,
      "col": 7,
      "coordinate": "H2"
    },
    "startedAt": "2026-04-12T11:04:30.000Z",
    "endedAt": null,
    "closedBy": null,
    "createdAt": "2026-04-12T11:00:00.000Z"
  },
  "message": "Room details fetched successfully"
}
```

### 8.8 DELETE `/api/v1/admin/rooms/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Room ID |

**Request Body:**
```json
{
  "reason": "string"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `reason` | string | No | Optional closure reason for audit trail |

**Example Request:**
```
DELETE /api/v1/admin/rooms/507f1f77bcf86cd799439016
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "roomNumber": "ROOM-2026-001235",
    "status": "CLOSED",
    "closedBy": "ADMIN"
  },
  "message": "Room force closed successfully"
}
```

**Notes:**
- Creates a `GameSession` with `endedReason: "ADMIN_FORCE_CLOSE"`
- Removes room from active listings
- Notifies connected players via WebSocket

## 9. WebSocket Event Payloads

**Namespace:** `/ws/game`

All WebSocket events use `namespace:action` format and accept/return object payloads.

### 9.1 Client → Server Events

#### `room:create`
**Payload:**
```json
{
  "boardSize": 10,
  "marker": "X",
  "boardStyle": "CLASSIC",
  "markerStyle": "CLASSIC"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `boardSize` | number | Yes | Enum: `10`, `15` |
| `marker` | string | Yes | Enum: `X`, `O` (host's preferred marker) |
| `boardStyle` | string | No | Enum: `CLASSIC`, `DARK`, `NEON`. Default: CLASSIC |
| `markerStyle` | string | No | Enum: `CLASSIC`, `GLOW`, `SKETCH`, `STONE`, `PIXEL`, `MINIMAL`. Default: CLASSIC |

**Notes:**
- Creates a new room with status `WAITING`
- Host automatically joins as participant 0
- Opponent will receive opposite marker

#### `room:join`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `roomId` | string | Yes | Valid room ID in `WAITING` status |

**Notes:**
- Joins as participant 1
- Room transitions to `READY` or `PLAYING` depending on marker selection

#### `room:leave`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `roomId` | string | Yes | Valid room ID |

**Notes:**
- If room is `WAITING`, simply removes participant
- If room is `PLAYING`, ends match with `ABORTED` status
- Creates `GameSession` with `abortedByUserId`

#### `game:move`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016",
  "row": 0,
  "col": 0
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `roomId` | string | Yes | Valid room ID in `PLAYING` status |
| `row` | number | Yes | 0 to (boardSize - 1) |
| `col` | number | Yes | 0 to (boardSize - 1) |

**Notes:**
- Server validates it's the player's turn
- Server validates cell is empty
- Server checks for win/draw conditions
- Server broadcasts `game:state` to both players

#### `chat:send`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016",
  "message": "Good game!"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|---|---|---|---|
| `roomId` | string | Yes | Valid room ID |
| `message` | string | Yes | Max 500 chars, trimmed |

**Notes:**
- **Premium feature only**
- Server validates sender has active premium subscription
- If not premium, emits `error` event

### 9.2 Server → Client Events

#### `room:created`
**Payload:**
```json
{
  "room": {
    "id": "507f1f77bcf86cd799439016",
    "roomNumber": "ROOM-2026-001235",
    "boardSize": 10,
    "boardStyle": "CLASSIC",
    "markerStyle": "CLASSIC",
    "status": "WAITING",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "usernameSnapshot": "player123",
        "mark": "X",
        "isHost": true,
        "isReady": false
      }
    ],
    "moveCount": 0
  }
}
```

**Notes:**
- Sent to room creator immediately after creation
- Also broadcast to arena listeners

#### `room:updated`
**Payload:**
```json
{
  "room": {
    "id": "507f1f77bcf86cd799439016",
    "roomNumber": "ROOM-2026-001235",
    "boardSize": 10,
    "boardStyle": "CLASSIC",
    "markerStyle": "CLASSIC",
    "status": "PLAYING",
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "usernameSnapshot": "player123",
        "mark": "X",
        "isReady": false,
        "isHost": true
      },
      {
        "userId": "507f1f77bcf86cd799439013",
        "usernameSnapshot": "opponent456",
        "mark": "O",
        "isReady": false,
        "isHost": false
      }
    ],
    "moveCount": 0,
    "createdAt": "2026-04-12T11:00:00.000Z"
  }
}

**Notes:**
- Broadcast when:
  - Player joins room
  - Room transitions to `READY` or `PLAYING`
  - Player leaves room
- Sent to both room participants and arena listeners

#### `room:removed`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016"
}
```

**Notes:**
- Broadcast when room is closed/completed
- Arena page should remove this room from listing

#### `game:state`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016",
  "board": [
    {
      "moveNumber": 1,
      "byParticipantIndex": 0,
      "row": 1,
      "col": 0,
      "coordinate": "A2",
      "placedAt": "2026-04-12T11:04:30.000Z"
    }
  ],
  "currentTurnParticipantIndex": 0,
  "lastMove": {
    "row": 1,
    "col": 0,
    "coordinate": "A2"
  },
  "moveCount": 1,
  "status": "PLAYING"
}
```

**Notes:**
- Authoritative game state update
- Broadcast after every valid move
- `board` is reconstructed from `moves` array
- `currentTurn` is participant index (0 or 1)

#### `game:ended`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016",
  "winner": 0,
  "winLine": [
    { "row": 0, "col": 0, "coordinate": "A1" },
    { "row": 0, "col": 1, "coordinate": "B1" },
    { "row": 0, "col": 2, "coordinate": "C1" },
    { "row": 0, "col": 3, "coordinate": "D1" },
    { "row": 0, "col": 4, "coordinate": "E1" }
  ],
  "result": "WIN"
}
```

**Field Values:**
| Field | Type | Description |
|---|---|---|
| `winner` | number or null | Participant index (0 or 1), null for draw |
| `winLine` | array | Array of winning coordinates, empty for draw |
| `result` | string | Enum: `WIN`, `DRAW`, `ABORTED` |

**Notes:**
- Broadcast when game ends
- Server automatically creates `GameSession`
- Room transitions to `CLOSED` and is removed

#### `chat:message`
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439016",
  "sender": {
    "userId": "507f1f77bcf86cd799439011",
    "usernameSnapshot": "player123"
  },
  "message": "Good game!",
  "timestamp": "2026-04-12T11:10:00.000Z"
}
```

**Notes:**
- Only broadcast if sender has active premium subscription
- Sent to both room participants

#### `error`
**Payload:**
```json
{
  "message": "You do not have permission to send chat messages. Premium subscription required."
}
```

**Common Error Messages:**
- `"Invalid move. It's not your turn."`
- `"Invalid move. Cell is already occupied."`
- `"Room is full."`
- `"Room not found."`
- `"You do not have permission to send chat messages. Premium subscription required."`
- `"Invalid room status for this action."`

## 10. Common Data Types

### User DTO
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "PLAYER | ADMIN",
  "country": "string",
  "avatar": "string | null",
  "isPremium": "boolean",
  "isActive": "boolean",
  "createdAt": "ISO 8601 date string"
}
```

### Participant Object
```json
{
  "userId": "string | null",
  "usernameSnapshot": "string",
  "role": "HUMAN | AI",
  "mark": "X | O",
  "aiDifficulty": "EASY | MEDIUM | HARD | null"
}
```

### Room Participant Object
```json
{
  "userId": "string",
  "usernameSnapshot": "string",
  "mark": "X | O",
  "isReady": "boolean",
  "isHost": "boolean"
}
```

### Move Object
```json
{
  "moveNumber": "number",
  "byParticipantIndex": 0 | 1,
  "row": "number",
  "col": "number",
  "coordinate": "string",
  "placedAt": "ISO 8601 date string"
}
```

### Coordinate Object
```json
{
  "row": "number",
  "col": "number",
  "coordinate": "string"
}
```

**Examples:**
- `{ "row": 0, "col": 0, "coordinate": "A1" }`
- `{ "row": 2, "col": 5, "coordinate": "F3" }`
- `{ "row": 9, "col": 14, "coordinate": "O10" }` (for 15x15 board)

### Transaction Object
```json
{
  "id": "string",
  "type": "DEPOSIT | SUBSCRIPTION",
  "amount": "number",
  "currency": "string",
  "status": "PENDING | SUCCESS | FAILED",
  "provider": "LOCAL_WALLET | STRIPE | PAYPAL",
  "externalTransactionId": "string | null",
  "balanceBefore": "number",
  "balanceAfter": "number",
  "subscriptionPeriodStart": "ISO 8601 date string | null",
  "subscriptionPeriodEnd": "ISO 8601 date string | null",
  "createdAt": "ISO 8601 date string"
}
```

### Game List Item DTO
```json
{
  "id": "string",
  "sessionNumber": "string",
  "gameType": "SINGLE_PLAYER | TWO_PLAYERS | ONLINE_MATCH",
  "boardSize": 10 | 15,
  "boardStyle": "CLASSIC | DARK | NEON",
  "markerStyle": "CLASSIC | GLOW | SKETCH | STONE | PIXEL | MINIMAL",
  "startedAt": "ISO 8601 date string",
  "startedAt": "ISO 8601 date string",
  "endedAt": "ISO 8601 date string",
  "status": "COMPLETED | ABORTED",
  "opponentName": "string",
  "viewerResult": "WIN | LOSE | DRAW | ABORTED"
}
```

**Notes:**
- `opponentName` is the opponent's username or "AI (difficulty)"
- `viewerResult` is from the perspective of the current authenticated user


### Pagination Metadata
```json
{
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

## Summary

This document provides complete payload specifications for all TicTacToang API endpoints including:

- **Request schemas** with field constraints and validation rules
- **Response schemas** for success and error cases
- **Query parameter** specifications for list/filter/search endpoints
- **WebSocket event payloads** for real-time gameplay
- **Common data types** used across the API