# TicTacToang MongoDB Data Models

This document outlines the database schemas for the TicTacToang platform. The design adheres strictly to our **Modular Monolith** ownership boundaries and is optimized to support real-time gameplay, historical replay, premium subscription lifecycles, and efficient data aggregation.

## 1. Core Architecture & Principles

### Design Principles
1. **Never expose Mongo internals directly:** Always transform `_id` to `id`, strip `__v`, and completely omit sensitive fields like `passwordHash` in API responses.
2. **Store snapshots for historical accuracy:** For finished matches, keep `usernameSnapshot` and `avatarSnapshot`. This prevents history logs from altering retrospectively if a user later changes their profile.
3. **Persist enough data for replay in one fetch:** Store row/col and algebraic notation per move, alongside the winning line and match configuration inside the session document.
4. **Keep aggregate-friendly fields:** Status and result fields should be easily queryable without expensive array traversals. Add indexes for high-frequency search and history filtering.

### Shared Schema Helpers
Used across all models to ensure consistent JSON serialization.

```javascript
const baseSchemaOptions = {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
        virtuals: true,    // Include virtual fields
        versionKey: false, // Remove __v from API responses
        transform: function (_doc, ret) {
            ret.id = ret._id; // Expose Mongo _id as id
            delete ret._id;
        }
    }
};
```

## 2. Auth Module Models
### 2.1 User Model (`user.model.js`)

**Purpose**: Core identity, authentication credentials, and platform-wide state.

```js
const userSchema = new mongoose.Schema({
    username: { 
        type: String, required: true, unique: true, trim: true, 
        match: /^[a-zA-Z0-9_-]{6,30}$/, index: true 
    },
    email: { 
        type: String, required: true, unique: true, lowercase: true, trim: true, 
        match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, maxlength: 254, index: true 
    },
    passwordHash: { type: String, required: true, select: false },
    country:      { type: String, required: true, trim: true },
    role:         { type: String, enum: ['PLAYER', 'ADMIN'], default: 'PLAYER', index: true },
    avatar:       { type: String, default: null },
    isActive:     { type: Boolean, default: true, index: true },
    
    premiumExpiresAt: { type: Date, default: null, index: true },

    // Auth security & tracking
    auth: {
        lastLoginAt:   { type: Date, default: null },
        loginAttempts: { type: Number, default: 0, select: false },
        lockUntil:     { type: Date, default: null, select: false }
    }
}, baseSchemaOptions);

// Virtual for boolean premium checks
userSchema.virtual('isPremium').get(function () {
    return !!this.premiumExpiresAt && this.premiumExpiresAt > new Date();
});
```

### 2.2 Platform Metric Model (`platformMetric.model.js`)
**Purpose**: A singleton document to hold running platform tallies (like all-time revenue) without requiring expensive aggregation queries across historical data.

```js
const platformMetricSchema = new mongoose.Schema({
    singletonId: { 
        type: String, 
        default: 'GLOBAL_METRICS', 
        unique: true, 
        index: true 
    },
    totalRevenue: { 
        type: Number, 
        default: 0 
    }
}, baseSchemaOptions);
```

## 3. Game Session Model (`gameSession.model.js`)

**Purpose**: Immutable record of finished matches for history, stats aggregation, and replay generation.

```js
// Embedded Sub-Documents (_id: false)
const sessionParticipantSchema = {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null if AI
    usernameSnapshot: { type: String, required: true, trim: true },
    avatarSnapshot: { type: String, default: null },
    isPremiumSnapshot: { type: Boolean, default: false },
    role: { type: String, enum: ['HUMAN', 'AI'], required: true },
    mark: { type: String, enum: ['X', 'O'], required: true },
    markerStyle: { type: String, enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], default: 'CLASSIC' },
    aiDifficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: null }
};

const sessionMoveSchema = {
    moveNumber: { type: Number, required: true },
    byParticipantIndex: { type: Number, enum: [0, 1], required: true },
    row: { type: Number, required: true, min: 0 },
    col: { type: Number, required: true, min: 0 },
    coordinate: { type: String, required: true, match: /^[A-O](?:[1-9]|1[0-5])$/ },
    placedAt: { type: Date, default: Date.now }
};

// Main Session Schema
const gameSessionSchema = new mongoose.Schema({
    sessionNumber: { type: String, required: true, unique: true, index: true, default: () => `GS-${ulid()}` },
    sourceRoomId:  { type: mongoose.Schema.Types.ObjectId, ref: 'GameRoom', default: null }, 
    gameType: {
        type: String,
        enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'],
        required: true,
        index: true
    },
    boardSize:  { type: Number, required: true, enum: [10, 15], index: true },
    boardStyle: { type: String, enum: ['JUNGLE', 'DARK', 'LAVA'], default: 'JUNGLE' },
    markerStyle:{ type: String, enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], default: 'CLASSIC' },
    
    // Historical Snapshots
    participants: [sessionParticipantSchema],
    
    // Match Results
    status: {
        type: String,
        enum: ['FINISHED', 'DRAW', 'ABORTED'],
        required: true,
        index: true
    },
    endedReason: {
        type: String,
        enum: ['WIN', 'DRAW', 'ABORT', 'TIMEOUT', 'ADMIN_FORCE_CLOSE'],
        required: true
    },
    firstTurnParticipantIndex: { type: Number, required: true },
    winnerParticipantIndex:    { type: Number, default: null },
    abortedByUserId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    winningLine: [{ row: Number, col: Number, coordinate: String }],
    
    // Replay Data
    moves: [sessionMoveSchema],
    totalMoves: { type: Number, default: 0 },
    
    // Time Tracking
    startedAt:  { type: Date, required: true, default: Date.now },
    endedAt:    { type: Date, default: null, index: true },
    durationMs: { type: Number, default: 0 }
}, baseSchemaOptions);
```

## 4. Room Module Model (`gameRoom.model.js`)

**Purpose**: Extremely transient, highly mutated document acting as the persistence layer for live WebSocket games.
**Note**: These documents are automatically deleted or converted into `GameSession` documents once a match ends.

```js
// Embedded Sub-Documents (_id: false)
const roomParticipantSchema = {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    usernameSnapshot: { type: String, required: true },
    avatarSnapshot: { type: String, default: null },
    isPremiumSnapshot: { type: Boolean, default: false },
    mark: { type: String, enum: ['X', 'O'], default: null },
    markerStyle: { type: String, enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], default: 'CLASSIC' },
    joinedAt: { type: Date, default: Date.now },
    isHost: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false }
};

const roomMoveSchema = {
    moveNumber: Number,
    byParticipantIndex: { type: Number, enum: [0, 1] }, 
    row: Number, 
    col: Number, 
    coordinate: { type: String, match: /^[A-O](?:[1-9]|1[0-5])$/ },
    placedAt: { type: Date, default: Date.now }
};

// Main Room Schema
const gameRoomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true, index: true, default: () => `RM-${ulid()}` },
    boardSize:  { type: Number, required: true, enum: [10, 15], index: true },
    boardStyle: { type: String, enum: ['JUNGLE', 'DARK', 'LAVA'], default: 'JUNGLE' },
    markerStyle:{ type: String, enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], default: 'CLASSIC' },
    
    status: {
        type: String,
        enum: ['WAITING', 'READY', 'PLAYING', 'ABORTED', 'CLOSED'],
        default: 'WAITING',
        index: true
    },
    
    // Live State
    participants: [roomParticipantSchema], 
    firstTurnParticipantIndex:   { type: Number, enum: [0, 1], default: 0 },
    currentTurnParticipantIndex: { type: Number, enum: [0, 1], default: null },
    moveCount: { type: Number, default: 0 },
    moves: [roomMoveSchema], 
    
    lastMove: {
        row: { type: Number, default: null },
        col: { type: Number, default: null },
        coordinate: { type: String, default: null }
    },
    winningLine: [{ row: Number, col: Number, coordinate: String }],
    
    // Time tracking
    startedAt: { type: Date, default: null },
    endedAt:   { type: Date, default: null },
    closedBy:  { type: String, enum: ['PLAYER', 'ADMIN', 'SYSTEM'], default: null }
}, baseSchemaOptions);

// 10 min TTL cleanup on `endedAt` to prevent abandoned room bloat.
gameRoomSchema.index({ endedAt: 1 }, { expireAfterSeconds: 60*10 })
```
## 5. Transaction Module Model (`transaction.model.js`)

**Purpose**: Stores the current active financial invoice for subscription purchases. Acts as an audit log for PayPal Webhooks.

### Key Constraints:
- **1-to-1 Enforcement:** `userId` enforces `unique: true`. A new purchase completely overwrites the user's previous transaction record.
- **Auto-Cleanup (TTL):** A TTL (Time-To-Live) index automatically deletes the transaction document from the database when the `subscriptionPeriodEnd` date passes.

```js
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    type: { type: String, enum: ['SUBSCRIPTION'], required: true, index: true },
    provider: { type: String, enum: ['STRIPE', 'PAYPAL'], required: true, default: 'PAYPAL' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], required: true, default: 'PENDING', index: true },
    externalTransactionId: { type: String, default: null, index: true, sparse: true },
    subscriptionPeriodStart: { type: Date, default: null },
    subscriptionPeriodEnd: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, baseSchemaOptions);

// Auto-delete when subscriptionPeriodEnd passes
transactionSchema.index({ subscriptionPeriodEnd: 1 }, { expireAfterSeconds: 0 });
```