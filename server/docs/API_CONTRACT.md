# 📚 Backend API Contract (Detailed)

This document contains the detailed specifications (Payloads, Data Types, and Validation Rules) for the backend APIs. 

**Frontend Team:** Please review the required and optional fields carefully before integrating to avoid `400 Bad Request` errors.

---

## 🎮 1. Game Module

### 1.1. Save Game Result (Offline / AI)
**Endpoint:** `POST /api/v1/games`  
**Auth Required:** `Yes` (Requires a valid `access_token` cookie)

**Description:** Used to persist the results of Local matches (`TWO_PLAYERS`) or matches against the AI (`SINGLE_PLAYER`).
> ⚠️ **IMPORTANT:** Do NOT call this API to save an `ONLINE_MATCH`. The server automatically persists online matches when the socket room is closed.

#### 📥 Request Body (JSON)

**Strictly Required Fields:**
| Field | Type | Required | Description / Allowed Values |
| :--- | :--- | :---: | :--- |
| `gameType` | String | **Yes** | `"SINGLE_PLAYER"` or `"TWO_PLAYERS"` |
| `status` | String | **Yes** | `"FINISHED"`, `"DRAW"`, or `"ABORTED"` |
| `startedAt` | Date | **Yes** | Match start time (ISO 8601 String). e.g., `"2026-04-05T10:00:00.000Z"` |
| `endedAt` | Date | **Yes** | Match end or abort time (ISO 8601 String). |
| `firstTurnParticipantIndex`| Number | **Yes** | `0` or `1` (Indicates which participant index went first) |
| `participants` | Array | **Yes** | Must contain **exactly 2 objects**. (See [Participant Object] below) |

**Conditionally Required Fields:**
| Field | Type | Required Condition | Description |
| :--- | :--- | :--- | :--- |
| `winnerParticipantIndex` | Number | `status === "FINISHED"` | `0` or `1`. *(Do NOT send if match is DRAW or ABORTED).* |
| `winningLine` | Array | `status === "FINISHED"` | Array containing **exactly 5 winning coordinates**. *(Do NOT send if match is DRAW or ABORTED).* |

**Optional Fields (Backend will use defaults if omitted):**
| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `boardSize` | Number | `10` | Size of the board (`10` or `15`) |
| `boardStyle` | String | `"CLASSIC"` | `"CLASSIC"`, `"DARK"`, `"NEON"` |
| `markerStyle`| String | `"CLASSIC"` | `"CLASSIC"`, `"GLOW"`, `"SKETCH"` |
| `moves` | Array | `[]` | Array of move objects. Highly recommended to send for the Replay feature. |

---

#### 🧑‍🤝‍🧑 Participant Object (Inside `participants` array)
*Note: The `participants` array must always have exactly two elements (Index 0 and Index 1).*

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | String \| null | The user's `_id`. Send `null` for the AI or a Guest player. |
| `usernameSnapshot` | String | Display name used during the match (e.g., "PlayerOne", "Bot (Easy)"). |
| `avatarSnapshot` | String \| null | Avatar image URL copied for historical immutability (snapshot at game time). |
| `role` | String | `"HUMAN"` or `"AI"`. |
| `mark` | String | `"X"` or `"O"`. |
| `aiDifficulty` | String \| null | `"EASY"`, `"MEDIUM"`, `"HARD"`. Send `null` if the role is `"HUMAN"`. |

---

#### 💡 Example Payload (SINGLE_PLAYER - FINISHED)

```json
{
    "gameType": "SINGLE_PLAYER",
    "status": "FINISHED",
    "boardSize": 10,
    "firstTurnParticipantIndex": 0,
    "winnerParticipantIndex": 0,
    "startedAt": "2026-04-05T10:00:00.000Z",
    "endedAt": "2026-04-05T10:05:00.000Z",
    "participants": [
        { 
            "userId": "651a2b3c4d5e", 
            "usernameSnapshot": "PlayerOne", 
            "avatarSnapshot": "https://cdn.example.com/avatars/playerone.png",
            "role": "HUMAN", 
            "mark": "X" 
        },
        { 
            "userId": null, 
            "usernameSnapshot": "Bot (Easy)", 
            "avatarSnapshot": null,
            "role": "AI", 
            "mark": "O", 
            "aiDifficulty": "EASY" 
        }
    ],
    "winningLine": [
        { "row": 0, "col": 0, "coordinate": "A1" },
        { "row": 0, "col": 1, "coordinate": "B1" },
        { "row": 0, "col": 2, "coordinate": "C1" },
        { "row": 0, "col": 3, "coordinate": "D1" },
        { "row": 0, "col": 4, "coordinate": "E1" }
    ],
    "moves": [
        { "moveNumber": 1, "byParticipantIndex": 0, "row": 0, "col": 0, "coordinate": "A1" },
        { "moveNumber": 2, "byParticipantIndex": 1, "row": 1, "col": 0, "coordinate": "A2" }
    ]
}
