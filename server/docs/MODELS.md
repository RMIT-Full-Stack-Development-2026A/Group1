# TicTacToang MongoDB Data Models

This revision keeps the Modular Monolith ownership boundaries but improves the schema design so it better supports:

- SRS-required gameplay modes
- replay/history/search
- premium subscription lifecycle (via direct PayPal checkout)
- security and auditability
- fewer API calls through better aggregation-ready data

## 1. Design Principles

1. **Never expose Mongo internals directly**
   - Always transform `_id` to `id`
   - Always remove `__v`
   - Never return `passwordHash`

2. **Store snapshots for historical accuracy**
   - For finished matches, keep `usernameSnapshot` / `displayNameSnapshot`
   - This avoids history pages changing when users rename themselves later

3. **Persist enough data for replay in one fetch**
   - Store row/col and algebraic notation per move
   - Store winning line and match configuration in the session itself

4. **Keep aggregate-friendly fields**
   - status/result fields should be queryable without expensive reconstruction
   - add indexes for search and history filtering

## 2. Shared Helpers

```js
const baseSchemaOptions = {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    virtuals: true, // Include virtual fields like isPremium
    versionKey: false, // Remove __v from API responses
    transform: function (_doc, ret) {
      ret.id = ret._id; // Expose Mongo _id as id for frontend consistency
      delete ret._id; // Hide raw Mongo field
      return ret;
    }
  }
};
```
*Why this matters*
- FE always receives id, not _id
- API responses stay clean
- createdAt / updatedAt are added automatically

## 3. User Model (`user.model.js`)
**Owned by**: auth module

**Purpose**: Stores account identity, authentication state, premium state, and wallet balance snapshot.

```js
const userSchema = new mongoose.Schema({
    username: {
        type: String, // Account username used for login/display
        required: true, 
        unique: true, 
        trim: true, 
        match: /^[a-zA-Z0-9_-]{6,30}$/, // Only allow letters, numbers, underscore, hyphen, 6-30 characters 
        index: true 
    },
    email: {
        type: String, // Main email address of the account
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format validation
        maxlength: 254, 
        index: true 
    },
    passwordHash: {
        type: String, // Stores hashed password, never plain text password
        required: true,     
        select: false
    },
    country: {
        type: String, // User-selected country 
        required: true,
        trim: true 
    },
    role: {
        type: String, 
        enum: ['PLAYER', 'ADMIN'], 
        default: 'PLAYER',
        index: true 
    },
    avatar: {
        type: String, // URL/path to the user's uploaded avatar image
        default: null 
    },
    isActive: {
        type: Boolean, 
        default: true,
        index: true,
    },
    premiumExpiresAt: {
        type: Date, // Date-time when premium membership ends
        default: null, 
        index: true
    },
    auth: {
        lastLoginAt: {
            type: Date, 
            default: null 
        },
        loginAttempts: {
            type: Number, 
            default: 0, 
            select: false // Security metadata hidden from standard queries
        },
        lockUntil: {
            type: Date,
            default: null, 
            select: false // Security metadata hidden from standard queries
        }
    }
}, baseSchemaOptions);
```
### Notes
- JWT payload can still include `{ userId, role, isPremium }`
- API DTO should expose the agreed user shape:
  `{ id, username, email, role, country, avatar, isPremium, isActive, createdAt }`

## 4. Game Session Model (`gameSession.model.js`)
**Owned by**: game module

**Purpose**: Stores completed or aborted matches for history, replay, filtering, and analytics.

### Participant sub-schema
Used for each side in a saved match.
```js
export const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to real user account
        ref: 'User', 
        default: null // Null is allowed for AI opponent
    },
    usernameSnapshot: {
        type: String, // Username stored at the time the match was played
        required: true, 
        trim: true 
    },
    role: {
        type: String, // Distinguishes human player from AI bot
        enum: ['HUMAN', 'AI'], 
        required: true 
    },
    mark: {
        type: String, // The mark this participant used on the board
        enum: ['X', 'O'], 
        required: true 
    },
    aiDifficulty: {
        type: String, // Difficulty of AI opponent if this participant is an AI
        enum: ['EASY', 'MEDIUM', 'HARD'], 
        default: null // Null for human players
    }
}, { _id: false });
```

### Move sub-schema
Stores every move needed for replay.

```js
export const moveSchema = new mongoose.Schema({
    moveNumber: {
        type: Number, // Move order in the match
        required: true 
    },
    byParticipantIndex: {
        type: Number, // Which participant made the move: 0 or 1
        enum: [0, 1], 
        required: true 
    },
    row: {
        type: Number, // Board row index of the move
        required: true, 
        min: 0 
    },
    col: {
        type: Number, // Board column index of the move
        required: true, 
        min: 0
    },
    coordinate: {
        type: String, // Algebraic notation
        required: true, // For replay UI and readable records
        match: /^[A-O](?:[1-9]|1[0-5])$/
    },
    placedAt: {
        type: Date, // When this move was made
        default: Date.now 
    }
}, { _id: false });
```

### Main game session schema
```js
const gameSessionSchema = new mongoose.Schema({
    sessionNumber: {
        type: String, // Human-readable unique match code/number
        required: true,
        unique: true, 
        index: true, 
        default: () => `GS-${ulid()}` // ULID prevents B-Tree index fragmentation
    },
    sourceRoomId: {
        type: mongoose.Schema.Types.ObjectId, // Original live room id 
        ref: 'GameRoom', 
        default: null // Null for local or AI matches
    },
    gameType: {
        type: String, // High-level type of match
        enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'], 
        required: true, 
        index: true 
    },
    boardSize: {
        type: Number, // Board size selected for the match
        enum: [10, 15], 
        required: true, 
        index: true 
    },
    boardStyle: {
        type: String, // Visual board theme used when the match was played
        enum: ['CLASSIC', 'DARK', 'NEON'], 
        default: 'CLASSIC'
    },
    markerStyle: {
        type: String, // Visual marker theme used in the match
        enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], 
        default: 'CLASSIC' 
    },
    participants: {
        type: [sessionParticipantSchema], // Stores exactly two participants of the match
        validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 2,
        message: 'A game session must have exactly 2 participants.'
        }
    },
    firstTurnParticipantIndex: {
        type: Number, // Participant moved first: 0 or 1
        enum: [0, 1], 
        required: true 
    },
    winnerParticipantIndex: {
        type: Number, // Which participant won the game
        enum: [0, 1], 
        default: null // Null for draw or aborted game
    },
    status: {
        type: String, // Final high-level outcome state of the match
        enum: ['FINISHED', 'DRAW', 'ABORTED'], 
        required: true, 
        index: true 
    },
    endedReason: {
        type: String, //  Detailed reason why the match ended
        enum: ['WIN', 'DRAW', 'ABORT', 'ADMIN_FORCE_CLOSE'],
        required: true 
    },
    abortedByUserId: {
        type: mongoose.Schema.Types.ObjectId, // Which user aborted the game
        ref: 'User',
        default: null 
    },
    winningLine: {
        type: [{ row: Number, col: Number, coordinate: String }], // Coordinates of the winning 5-cell line
        default: [] // Empty for draw or aborted game
    },
    moves: {
        type: [sessionMoveSchema], // Full move history for replay
        default: [] 
    },
    totalMoves: {
        type: Number, // Cached number of moves for quick display/filtering
        default: 0 
    },
    startedAt: {
        type: Date,
        required: true, 
        default: Date.now 
    },
    endedAt: {
        type: Date, 
        default: null, 
        index: true 
    },
    durationMs: {
        type: Number, // Total match duration in milliseconds
        default: 0 
    }
}, baseSchemaOptions);
```

### Note
- one schema works for local, AI, and online
- replay page can load everything from one document
- search by session number or opponent name is easier
- user rename later will not break old history labels
- admin force-close and abort cases are auditable

## 5. Game Room Model (`gameRoom.model.js`)
**Owned by**: room module

**Purpose**: Stores live online room state for socket-first multiplayer.

This model is for active online matches / waiting rooms, not long-term history.

### Room participant sub-schema
```js
export const roomParticipantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Actual user currently in the live room
        ref: 'User', 
        required: true 
    },
    usernameSnapshot: {
        type: String, // Username copied at the moment they joined the room
        required: true 
    },
    mark: {
        type: String, // X or O assigned to the player in this room
        enum: ['X', 'O'], 
        default: null 
    },
    joinedAt: {
        type: Date, // When the player entered the room
        default: Date.now
    },
    isHost: {
        type: Boolean, 
        default: false 
    },
    isReady: {
        type: Boolean, 
        default: false
    }
}, { _id: false });
```

### Room move sub-schema
```js
export const roomMoveSchema = new mongoose.Schema({
    moveNumber: Number,
    byParticipantIndex: { type: Number, enum: [0, 1] }, 
    row: Number, // Row index of the move
    col: Number, // Column index of the move
    coordinate: { // Algebraic notation (e.g., 'C4')
        type: String,
        match: /^[A-O](?:[1-9]|1[0-5])$/
    },
    placedAt: { type: Date, default: Date.now } // When the move happened
}, { _id: false });
```

### Main room schema
```js
const gameRoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String, // Human-readable unique room code/number
        required: true, 
        unique: true, 
        index: true,
        default: () => `RM-${ulid()}` // ULID prevents B-Tree index fragmentation
    },

    boardSize: {
        type: Number, // Board size selected for this online room
        enum: [10, 15],
        required: true,
        index: true 
    },

    boardStyle: {
        type: String, 
        enum: ['CLASSIC', 'DARK', 'NEON'], 
        default: 'CLASSIC'
    },
    markerStyle: {
        type: String, 
        enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], 
        default: 'CLASSIC' 
    },
    firstTurnParticipantIndex: {
        type: Number, 
        enum: [0, 1],
        default: 0 
    },

    status: {
        type: String, // Current lifecycle state of the room
        enum: ['WAITING', 'READY', 'PLAYING', 'ABORTED', 'CLOSED'],
        default: 'WAITING', 
        index: true 
    },

    participants: {
        type: [roomParticipantSchema], // Current players inside the room
        default: [] 
    },

    currentTurnParticipantIndex: {
        type: Number, // Which participant is allowed to move now
        enum: [0, 1], 
        default: null 
    },

    moves: {
        type: [roomMoveSchema], // Live move list used for socket sync and reconnect
        default: [] 
    },

    moveCount: {
        type: Number, 
        default: 0 
    },

    winningLine: {
        type: [{ row: Number, col: Number, coordinate: String }], // Live winning line when the game ends
        default: [] 
    },

    lastMove: {
        row: { type: Number, default: null }, // Row of the most recent move
        col: { type: Number, default: null }, // Column of the most recent move
        coordinate: { type: String, default: null } // Human-readable coordinate of the most recent move
    },

    startedAt: {
        type: Date, 
        default: null // Null while room is only waiting/ready
    },

    endedAt: {
        type: Date, 
        default: null 
    },

    closedBy: {
        type: String, // Who closed the room
        enum: ['PLAYER', 'ADMIN', 'SYSTEM'], 
        default: null // Null until room is closed
    }
}, baseSchemaOptions);
```

### Notes
- You do **not** need to persist a full 10x10 or 15x15 matrix in MongoDB
- When room ends, create `GameSession` and close/remove the room

## 6. Transaction Model (`transaction.model.js`)
**Owned by**: subscription module

**Purpose**: Stores immutable financial history for subscription purchases.

```js
const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // User who owns this transaction
        ref: 'User', 
        required: true, 
        index: true 
    },
    type: {
        type: String, // Business category of transaction
        enum: ['SUBSCRIPTION'], 
        required: true, 
        index: true 
    },
   provider: {
        type: String, // Payment source/provider used for this transaction
        enum: ['STRIPE', 'PAYPAL'], 
        required: true, 
        default: 'PAYPAL' 
    },

    amount: {
        type: Number, // Money amount for this transaction
        required: true, 
        min: 0 // Prevent negative stored amount
    },
    currency: {
        type: String, // Currency code for financial clarity
        default: 'USD' 
    },
    status: {
        type: String, // Processing outcome of the transaction
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], 
        required: true, 
        default: 'PENDING', 
        index: true 
    },
    externalTransactionId: {
        type: String, // ID from Stripe/PayPal/other provider if one exists
        default: null, 
        index: true,
        sparse: true 
    },
    subscriptionPeriodStart: {
        type: Date, // Start date of premium period for subscription transactions
        default: null 
    },
    subscriptionPeriodEnd: {
        type: Date, // End date of premium period for subscription transactions
        default: null, 
        index: true 
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Extra provider-specific details if needed
        default: {}
    }
}, baseSchemaOptions);
```

### Notes
- `Transaction` acts as the immutable invoice/audit log for PayPal purchases.
- Current premium status is derived strictly from `User.premiumExpiresAt`.

## 7. DTO 

### Public user DTO
```js
{
  id,
  username,
  email,
  role,
  country,
  avatar,
  isPremium,
  isActive,
  createdAt
}
```

### Game list item DTO
```js
{
  id,
  sessionNumber,
  gameType,
  boardSize,
  startedAt,
  endedAt,
  status,
  opponentName,
  viewerResult
}
```

### Room DTO
```js
{
  id,
  roomNumber,
  boardSize,
  boardStyle,
  markerStyle,
  status,
  participants,
  moveCount,
  startedAt,
  endedAt,
  lastMove
}
```