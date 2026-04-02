# TicTacToang MongoDB Data Models

This document outlines the Mongoose schemas used for the backend database (MongoDB).

## 1. User Model (`user.model.js`)

Stores both `PLAYER` and `ADMIN` accounts, managing authentication, profile data, and wallet balances.

```js
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9_-]+$/, // Alphabets, numbers, underscore, hyphen
        unique: true,
        trim: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true, 
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
        maxLength: 254 // Less than 255 characters
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true, 
    },
    role: {
        type: String,
        enum: ['PLAYER', 'ADMIN'],
        default: 'PLAYER'
    },
    avatar: {
        type: String,
        default: null, 
    },
    lastLogin: {
        type: Date,
        default: Date.now(),
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Number
    },
    isPremium: {
        type: Boolean,
        default: false, 
    },
    isActive: {
        type: Boolean,
        default: true, 
    },
    walletBalance: {
        type: Number,
        default: 0, 
    },
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);
```

## 2. Game Session Model (`gameSession.model.js`)

Stores completed or aborted matches. Used to generate user history and facilitate the Match Replay feature.

```js
// Move Schema
const moveSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for AI moves
    },
    playerType: {
        type: String,
        enum: ['HUMAN', 'AI'],
        required: true
    },
    coordinate: {
        type: String,
        required: true,
        match: /^[A-O][1-9]$|^[A-O]1[0-5]$/ // Algebraic notation for 15x15 max (Uppercase)
    },
    moveNumber: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
}, {_id: false});

// Game Session Schema
const gameSessionSchema = new mongoose.Schema({
    sessionNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    gameType: {
        type: String,
        enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'],
        required: true
    },
    boardSize: {
        type: Number,
        enum: [10, 15],
        default: 10 // 10x10 or 15x15 board sizes
    },
    player1: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        mark: {
            type: String,
            enum: ['X', 'O'],
            required: true
        },
    },
    player2: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null // null for AI opponent
        },
        name: {
            type: String,
            required: true
        },
        mark: {
            type: String,
            enum: ['X', 'O'],
            required: true
        },
        isAI: {
            type: Boolean,
            required: true // Must be true if userId is null
        },
        aiDifficulty: {
            type: String,
            enum: ['EASY', 'MEDIUM', 'HARD'],
            default: null // null if human player
        }
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number,
        default: null
    },
    result: {
        type: String,
        enum: ['PLAYER1_WIN', 'PLAYER2_WIN', 'DRAW', 'ABORTED', 'ONGOING'],
        required: true,
        default: 'ONGOING'
    },
    winningLine: {
        type: [String], // Array of condinate for winning line
        default: null
    },
    moves: [moveSchema], // Array of moves to reconstruct the game
    totalMoves: {
        type: Number,
        default: 0
    },
}, {timestamps: true});

// change _id to id 
gameSessionSchema.set('toJSON', {
    virtuals: true, // include virtuals
    versionKey: false, // remove __v
    transform: function (doc, ret) {
        ret.id = ret._id; // copy _id to id 
        delete ret._id; // remove _id
    }
});

export const GameSession = mongoose.model('GameSession', gameSessionSchema);
```

## 3. Game Room Model (`gameRoom.model.js`)

Handles active online game sessions. Displayed in the Game Lobby and the Admin Monitoring portal.

```js
const gameRoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    player1: {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        name: {type: String, required: true}
    },
    player2: {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
        name: {type: String, default: null} // Populated when second player joins 
    },
    startTime: {type: Date, default: Date.now()},
    status: {
        type: String,
        enum: ['WAITING', 'PLAYING', 'CLOSED'],
        default: 'WAITING'
    }
}, {timestamps: true});

export const GameRoom = mongoose.model('GameRoom', gameRoomSchema);
```

## 4. Transaction Model (`transaction.model.js`)

Records all wallet deposits and premium subscription payments.

```js
const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'SUBSCRIPTION'],
        required: true
    },
    amount: {
        type: Number,
        required: true // 10 for the $10 USD fee 
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    },
    transactionDate: {
        type: Date,
        default: Date.now()
    }
}, {timestamps: true});

export const Transaction = mongoose.model('Transaction', transactionSchema);
```