# TicTacToang MongoDB Data Models

This revision keeps the Modular Monolith ownership boundaries but improves the schema design so it better supports:

- SRS-required gameplay modes
- replay/history/search
- premium subscription lifecycle
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
    required: true, // User must provide it when registering
    unique: true, // No two users can share the same username
    trim: true, // Remove accidental spaces at the beginning/end
    match: /^[a-zA-Z0-9_-]+$/, // Only allow letters, numbers, underscore, hyphen
    minlength: 3, // Prevent very short usernames
    maxlength: 30, // Prevent overly long usernames
    index: true // Speeds up username lookup/search
  },

  email: {
    type: String, // Main email address of the account
    required: true, // Required for registration/login/contact
    unique: true, // Each email can belong to only one account
    lowercase: true, // Normalize email casing for consistent lookup
    trim: true, // Remove accidental spaces
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format validation
    maxlength: 254, // Safe standard max length for emails
    index: true // Speeds up login/search by email
  },

  passwordHash: {
    type: String, // Stores hashed password, never plain text password
    required: true, // Account cannot exist without a password hash
    select: false // Hide by default so it is not returned in normal queries
  },

  country: {
    type: String, // User-selected country from registration/profile
    required: true, // Required by the SRS
    trim: true // Remove accidental spaces
  },

  role: {
    type: String, // Defines whether user is PLAYER or ADMIN
    enum: ['PLAYER', 'ADMIN'], // Restrict allowed values
    default: 'PLAYER', // New accounts are players unless created as admin manually
    index: true // Helps role-based filtering in admin queries
  },

  avatar: {
    type: String, // URL/path to the user's uploaded avatar image
    default: null // Null means user has not uploaded one yet
  },

  isActive: {
    type: Boolean, // Whether the account is allowed to use the system
    default: true, // New accounts start as active
    index: true // Helps admin quickly filter active/inactive accounts
  },

  premiumExpiresAt: {
    type: Date, // Date-time when premium membership ends
    default: null, // Null means user has never subscribed or currently has no premium
    index: true // Useful for checking premium expiration efficiently
  },

  wallet: {
    balance: {
      type: Number, // Current wallet balance snapshot for fast reads
      default: 0, // New user starts with zero balance
      min: 0 // Prevent negative wallet values at schema level
    }
  },

  auth: {
    lastLoginAt: {
      type: Date, // Last successful login time
      default: null // Null before the first login
    },
    loginAttempts: {
      type: Number, // Number of recent failed login attempts
      default: 0 // Starts at zero
    },
    lockUntil: {
      type: Date, // If set in the future, the account is temporarily locked from login
      default: null // Null means not locked
    }
  }
}, baseSchemaOptions);

userSchema.virtual('isPremium').get(function () {
  return !!this.premiumExpiresAt && this.premiumExpiresAt > new Date();
  // True only when premium expiry exists and is still in the future
});

userSchema.index({ createdAt: -1 }); // Helps sort newest users first
userSchema.index({ username: 'text', email: 'text' }); // Helps text search in admin/player listings

export const User = mongoose.model('User', userSchema);
```

### Notes
- JWT payload can still include `{ userId, role, isPremium }`
- API DTO should expose the agreed user shape:
  `{ id, username, email, role, country, avatar, isPremium, isActive, createdAt }`
- `wallet.balance` is persisted for fast reads; `Transaction` remains the audit trail

## 4. Game Session Model (`gameSession.model.js`)
**Owned by**: game module

**Purpose**: Stores completed or aborted matches for history, replay, filtering, and analytics.

### Participant sub-schema
Used for each side in a saved match.
```js
const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to real user account if this side is a human user
    ref: 'User', // Links to User model
    default: null // Null is allowed for AI opponent
  },
  usernameSnapshot: {
    type: String, // Username stored at the time the match was played
    required: true, // Needed so old history remains readable even if username changes later
    trim: true // Clean formatting
  },
  role: {
    type: String, // Distinguishes human player from AI bot
    enum: ['HUMAN', 'AI'], // Only two roles allowed inside a match record
    required: true // Every participant must be clearly defined
  },
  mark: {
    type: String, // The mark this participant used on the board
    enum: ['X', 'O'], // Only X or O
    required: true // Required for replay and result reconstruction
  },
  aiDifficulty: {
    type: String, // Difficulty of AI opponent if this participant is an AI
    enum: ['EASY', 'MEDIUM', 'HARD'], // Supported bot levels
    default: null // Null for human players
  }
}, { _id: false });
```

### Move sub-schema
Stores every move needed for replay.

```js
const moveSchema = new mongoose.Schema({
  moveNumber: {
    type: Number, // Move order in the match: 1, 2, 3...
    required: true // Required to replay match in correct sequence
  },
  byParticipantIndex: {
    type: Number, // Which participant made the move: 0 or 1
    enum: [0, 1], // Only two participants in TicTacToe match
    required: true // Needed to know whose move it was
  },
  row: {
    type: Number, // Board row index of the move
    required: true, // Needed to reconstruct board state
    min: 0 // Row cannot be negative
  },
  col: {
    type: Number, // Board column index of the move
    required: true, // Needed to reconstruct board state
    min: 0 // Column cannot be negative
  },
  coordinate: {
    type: String, // Human-friendly algebraic notation
    required: true // Useful for replay UI and readable records
    match: /^[A-O](?:[1:9]|1[0-5])$/
  },
  placedAt: {
    type: Date, // When this move was made
    default: Date.now // Auto-fill move timestamp
  }
}, { _id: false });
```

### Main game session schema
```js
const gameSessionSchema = new mongoose.Schema({
  sessionNumber: {
    type: String, // Human-readable unique match code/number
    required: true, // Every match must have a unique reference
    unique: true, // Prevent duplicate session numbers
    index: true // Speeds up search by session number
  },

  sourceRoomId: {
    type: mongoose.Schema.Types.ObjectId, // Original live room id if this came from online multiplayer
    ref: 'GameRoom', // Links archived match back to its room origin
    default: null // Null for local or AI matches
  },

  gameType: {
    type: String, // High-level type of match
    enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'], // Supported match categories
    required: true, // Required for filtering/history display
    index: true // Speeds up filter by game type
  },

  boardSize: {
    type: Number, // Board size selected for the match
    enum: [10, 15], // Only supported board sizes
    required: true, // Required for replay and board rendering
    index: true // Helps filter by board size if needed
  },

  boardStyle: {
    type: String, // Visual board theme used when the match was played
    enum: ['CLASSIC', 'DARK', 'NEON'], // Supported board themes
    default: 'CLASSIC' // Fallback style
  },

  markerStyle: {
    type: String, // Visual marker theme used in the match
    enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], // Supported marker sets
    default: 'CLASSIC' // Fallback marker style
  },

  participants: {
    type: [participantSchema], // Stores exactly two participants of the match
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length === 2, // Enforce exactly 2 sides
      message: 'A game session must have exactly 2 participants.'
    }
  },

  firstTurnParticipantIndex: {
    type: Number, // Which participant moved first: 0 or 1
    enum: [0, 1], // Only valid participant positions
    required: true // Needed to reconstruct game flow accurately
  },

  winnerParticipantIndex: {
    type: Number, // Which participant won the game
    enum: [0, 1], // Only participant 0 or 1 can win
    default: null // Null for draw or aborted game
  },

  status: {
    type: String, // Final high-level outcome state of the match
    enum: ['FINISHED', 'DRAW', 'ABORTED'], // Supported end states
    required: true, // Every saved session must have a final status
    index: true // Speeds up filtering by result status
  },

  endedReason: {
    type: String, // More detailed reason why the match ended
    enum: ['WIN', 'DRAW', 'ABORT', 'ADMIN_FORCE_CLOSE'], // Useful for audit and admin cases
    required: true // Required so end state is explicit
  },

  abortedByUserId: {
    type: mongoose.Schema.Types.ObjectId, // Which user aborted the game
    ref: 'User', // Links to actual user if needed for audit
    default: null // Null unless the game was aborted by a player
  },

  winningLine: {
    type: [{ row: Number, col: Number, coordinate: String }], // Coordinates of the winning 5-cell line
    default: [] // Empty for draw or aborted game
  },

  moves: {
    type: [moveSchema], // Full move history for replay
    default: [] // Starts empty until moves are added
  },

  totalMoves: {
    type: Number, // Cached number of moves for quick display/filtering
    default: 0 // Starts at zero
  },

  startedAt: {
    type: Date, // Actual time when match began
    required: true, // Every session needs a start time
    default: Date.now // Auto-fill if not manually provided
  },

  endedAt: {
    type: Date, // Actual time when match ended
    default: null, // Null until the game finishes
    index: true // Helps sort/filter history by ending time
  },

  durationMs: {
    type: Number, // Total match duration in milliseconds
    default: 0 // Zero until calculated or set
  }
}, baseSchemaOptions);

gameSessionSchema.index({ createdAt: -1 }); // Useful for latest history queries
gameSessionSchema.index({ endedAt: -1 }); // Useful for sorting by end time
gameSessionSchema.index({ gameType: 1, endedAt: -1 }); // Useful for filtered history pages
gameSessionSchema.index({ 'participants.userId': 1, endedAt: -1 }); // Fast lookup of a user's matches
gameSessionSchema.index({ 'participants.usernameSnapshot': 'text', sessionNumber: 'text' }); // Search by opponent name or session number

export const GameSession = mongoose.model('GameSession', gameSessionSchema)
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
const roomParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Actual user currently in the live room
    ref: 'User', // Links to User model
    required: true // Every room participant must be a real signed-in user
  },
  usernameSnapshot: {
    type: String, // Username copied at the moment they joined the room
    required: true // Useful for stable room display even if user changes username later
  },
  mark: {
    type: String, // X or O assigned to the player in this room
    enum: ['X', 'O'], // Only two marks allowed
    default: null // Null while waiting for mark selection/resolution
  },
  joinedAt: {
    type: Date, // When the player entered the room
    default: Date.now // Auto-fill join time
  }
}, { _id: false });
```

### Room move sub-schema
```js
const roomMoveSchema = new mongoose.Schema({
  moveNumber: Number, // Sequential order of live moves
  byParticipantIndex: { type: Number, enum: [0, 1] }, // Which side made the move
  row: Number, // Row index of the move
  col: Number, // Column index of the move
  coordinate: { // Algebraic notation for readable room/replay mapping
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
    required: true, // Every room needs a unique identifier
    unique: true, // Prevent duplicate room numbers
    index: true // Speeds up room lookup
  },

  boardSize: {
    type: Number, // Board size selected for this online room
    enum: [10, 15], // Only supported sizes
    required: true, // Needed before game starts
    index: true // Helps filter room listings by board size
  },

  status: {
    type: String, // Current lifecycle state of the room
    enum: ['WAITING', 'READY', 'PLAYING', 'ABORTED', 'CLOSED'], // Supported live room states
    default: 'WAITING', // New room starts as waiting for another player
    index: true // Useful for arena filtering
  },

  participants: {
    type: [roomParticipantSchema], // Current players inside the room
    default: [] // Starts empty until creator joins / room is created
  },

  currentTurnParticipantIndex: {
    type: Number, // Which participant is allowed to move now
    enum: [0, 1], // Only two sides exist
    default: null // Null before game starts or after it ends
  },

  moves: {
    type: [roomMoveSchema], // Live move list used for socket sync and reconnect
    default: [] // No moves at room creation
  },

  moveCount: {
    type: Number, // Cached live move count for quick access
    default: 0 // Starts at zero
  },

  winningLine: {
    type: [{ row: Number, col: Number, coordinate: String }], // Live winning line when the game ends
    default: [] // Empty unless someone wins
  },

  lastMove: {
    row: { type: Number, default: null }, // Row of the most recent move
    col: { type: Number, default: null }, // Column of the most recent move
    coordinate: { type: String, default: null } // Human-readable coordinate of the most recent move
  },

  startedAt: {
    type: Date, // Time when actual gameplay started
    default: null // Null while room is only waiting/ready
  },

  endedAt: {
    type: Date, // Time when room ended or was closed
    default: null // Null while room is still active
  },

  closedBy: {
    type: String, // Who closed the room
    enum: ['PLAYER', 'ADMIN', 'SYSTEM'], // Useful for auditing why room disappeared
    default: null // Null until room is closed
  }
}, baseSchemaOptions);

gameRoomSchema.index({ status: 1, createdAt: -1 }); // Fast arena queries by room status
gameRoomSchema.index({ 'participants.userId': 1, status: 1 }); // Fast reconnect lookup for a user's active room

export const GameRoom = mongoose.model('GameRoom', gameRoomSchema);
```

### Notes
- You do **not** need to persist a full 10x10 or 15x15 matrix in MongoDB
- `moves + currentTurn + winningLine + lastMove` are enough for authoritative state and reconnect snapshots
- When room ends, create `GameSession` and close/remove the room

## 6. Transaction Model (`transaction.model.js`)
**Owned by**: wallet module

**Purpose**: Stores immutable financial history for deposits and subscriptions.

```js
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // User who owns this transaction
    ref: 'User', // Links transaction to account
    required: true, // Every transaction must belong to a user
    index: true // Speeds up user transaction history queries
  },

  type: {
    type: String, // Business category of transaction
    enum: ['DEPOSIT', 'SUBSCRIPTION'], // Supported transaction types
    required: true, // Required for history and logic branching
    index: true // Useful for filtering deposits vs subscriptions
  },

  provider: {
    type: String, // Payment source/provider used for this transaction
    enum: ['LOCAL_WALLET', 'STRIPE', 'PAYPAL'], // Supported providers in current design
    required: true, // Each transaction must say where it came from
    default: 'LOCAL_WALLET' // Default if handled internally
  },

  amount: {
    type: Number, // Money amount for this transaction
    required: true, // Transaction must have value
    min: 0 // Prevent negative stored amount
  },

  currency: {
    type: String, // Currency code for financial clarity
    default: 'USD' // Default currency in this project
  },

  status: {
    type: String, // Processing outcome of the transaction
    enum: ['PENDING', 'SUCCESS', 'FAILED'], // Supported payment statuses
    required: true, // Every transaction must have a final/working state
    default: 'SUCCESS', // Internal/local actions may succeed immediately
    index: true // Useful for filtering failed/pending transactions
  },

  externalTransactionId: {
    type: String, // ID from Stripe/PayPal/other provider if one exists
    default: null, // Null if not applicable
    index: true, // Useful for reconciliation and payment tracing
    sparse: true // Only index documents that actually have this field
  },

  balanceBefore: {
    type: Number, // Wallet balance before applying this transaction
    default: 0 // Useful for audit trail
  },

  balanceAfter: {
    type: Number, // Wallet balance after applying this transaction
    default: 0 // Useful for audit trail and debugging
  },

  subscriptionPeriodStart: {
    type: Date, // Start date of premium period for subscription transactions
    default: null // Null for deposit transactions
  },

  subscriptionPeriodEnd: {
    type: Date, // End date of premium period for subscription transactions
    default: null, // Null for deposit transactions
    index: true // Useful for subscription history and expiry analysis
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed, // Extra provider-specific details if needed
    default: {} // Empty object when no extra data is needed
  }
}, baseSchemaOptions);

transactionSchema.index({ userId: 1, createdAt: -1 }); // Fast latest-transactions lookup per user
transactionSchema.index({ userId: 1, type: 1, createdAt: -1 }); // Fast filtered history by user and transaction type

export const Transaction = mongoose.model('Transaction', transactionSchema);
```

### Notes
- `Transaction` is the immutable audit log
- `User.wallet.balance` is the fast-read balance snapshot
- subscription history can be served from `type: 'SUBSCRIPTION'`

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
  status,
  participants,
  moveCount,
  startedAt,
  endedAt,
  lastMove
}
```

## 8. Final Recommendations

1. Replace `password` with `passwordHash`
2. Replace top-level `walletBalance` with `wallet.balance`
3. Replace top-level `isPremium` storage with `premiumExpiresAt` + virtual `isPremium`
4. Replace `player1/player2` duplication in finished sessions with `participants[2]`
5. Persist replay-ready move data with `row`, `col`, and `coordinate`
6. Expand `GameRoom` so it can support reconnect and authoritative socket state
7. Add indexes for session history, player lookups, and admin search
