# TicTacToang Backend API Endpoints

This document describes the REST API endpoints and WebSocket events used by the TicTacToang platform.

Base API URL: `/api/v1`

## 1. Authentication APIs
Base Path: `/api/v1/auth`

| Method | Endpoint           | Description                            |
|--------|--------------------|----------------------------------------|
| POST   | `/auth/register`   | Register a new player                  |
| POST   | `/auth/login`      | Login with username/email and password |
| POST   | `/auth/logout`     | Logout current user                    |
| GET    | `/auth/check-auth` | Verify the user's current JWT token    |

## 2. Profile APIs
Base Path: `/api/v1/profile`

| Method | Endpoint            | Description                                |
|--------|---------------------|--------------------------------------------|
| PUT    | `/profile`          | Update email, username, or country         |
| PATCH  | `/profile/password` | Change user password                       |
| POST   | `/profile/avatar`   | Upload profile avatar                      |

## 3. Game Session APIs
Base Path: `/api/v1/game`

| Method | Endpoint           | Description                                      |
|--------|--------------------|--------------------------------------------------|
| GET    | `/games`           | List user game sessions                          |
| GET    | `/games/:id`       | Get game session details                         |
| GET    | `/games/:id/moves` | Get move history                                 |
| GET    | `/games/search`    | Search sessions by player name or session number |

## 4. Game Room APIs (Online Multiplayer)
Base Path: `/api/v1/rooms`

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | `/rooms`              | List all active game rooms |
| POST   | `/rooms`              | Create new room            |
| POST   | `/rooms/:roomId/join` | Join room                  |
| GET    | `/rooms/:roomId`      | Get room information       |
| DELETE | `/rooms/:roomId`      | Close game room            |

## 5. WebSocket Events (Real-Time Gameplay & Chat)
Namespace/Endpoint: `/ws/game`
[cite_start]Description: Real-time network play must synchronize game states over the network via web socket.

| Event Name      | Direction      | Description                                                    |
|-----------------|----------------|----------------------------------------------------------------|
| `join_room`     | Client -> Server | Player connects to the assigned game room                      |
| `player_joined` | Server -> Client | Notifies the room creator that the second player has joined    |
| `game_start`    | Server -> Client | Triggered when the second player chooses their mark            |
| `make_move`     | Client -> Server | Player submits a board coordinate                  |
| `state_update`  | Server -> Client | Broadcasts the updated board state and turn status             |
| `game_abort`    | Client -> Server | Player aborts the game before completion                       |
| `game_end`      | Server -> Client | Broadcasts the winner and triggers the end-game animation      |
| `send_chat`     | Client -> Server | Premium user sends a chat message                              |
| `receive_chat`  | Server -> Client | Broadcasts the chat message to players in the room             |

## 6. Premium Subscription APIs
Base Path: `/api/v1/subscription`
[cite_start]*Note: Successful subscription payments must trigger an automated email notification to the user[cite: 134].*

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/subscription/status`    | Get premium status    |
| POST   | `/subscription/subscribe` | Purchase subscription |
| GET    | `/subscription/history`   | Get payment history   |

## 7. Wallet APIs
Base Path: `/api/v1/wallet`

| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/wallet`              | Get wallet balance             |
| POST   | `/wallet/deposit`      | Deposit funds                  |
| GET    | `/wallet/transactions` | Get wallet transaction history |

## 8. Admin APIs
Base Path: `/api/v1/admin`

### Player Management
| Method | Endpoint                        | Description                                 |
|--------|---------------------------------|---------------------------------------------|
| GET    | `/admin/players`                | List all players                            |
| GET    | `/admin/players/:id`            | Get player details                          |
| PATCH  | `/admin/players/:id/deactivate` | Deactivate account (prevents future logins) |
| PATCH  | `/admin/players/:id/reactivate` | Reactivate account                          |

### Game Room Monitoring
| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| GET    | `/admin/rooms`         | List active game rooms |
| GET    | `/admin/rooms/:roomId` | Get room details       |
| DELETE | `/admin/rooms/:roomId` | Force close room       |