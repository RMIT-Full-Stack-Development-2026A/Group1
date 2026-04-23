//  DOMAIN SCHEMAS 
export const domainSchemas = {

    // User / Auth
    UserDTO: {
        type: 'object',
        description: 'Public user shape returned by all endpoints (no passwordHash).',
        properties: {
            id:        { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            username:  { type: 'string', example: 'Myxlozz',  pattern: '^[a-zA-Z0-9_-]{6,30}$' },
            email:     { type: 'string', format: 'email', example: 'player@example.com' },
            role:      { type: 'string', enum: ['PLAYER', 'ADMIN'], example: 'PLAYER' },
            country:   { type: 'string', example: 'VN' },
            avatar:    { type: 'string', nullable: true, example: 'https://cdn.example.com/avatars/myxlozz.png' },
            isPremium: { type: 'boolean', example: false },
            isActive:  { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
        },
    },

    ActiveRoom: {
        type: 'object',
        nullable: true,
        description: 'Returned by check-auth when the user has an unfinished online match.',
        properties: {
            id:         { type: 'string' },
            roomNumber: { type: 'string', example: 'RM-01HXXXX' },
            boardSize:  { type: 'integer', enum: [10, 15] },
            status:     { type: 'string', enum: ['WAITING', 'READY', 'PLAYING'] },
        },
    },

    // Wallet / Subscription
    WalletSummary: {
        type: 'object',
        properties: {
            balance: { type: 'number', example: 35 },
        },
    },

    SubscriptionStatus: {
        type: 'object',
        properties: {
            isPremium:         { type: 'boolean', example: true },
            premiumExpiresAt:  { type: 'string', format: 'date-time', nullable: true },
        },
    },

    Transaction: {
        type: 'object',
        properties: {
            id:                      { type: 'string' },
            type:                    { type: 'string', enum: ['DEPOSIT', 'SUBSCRIPTION'] },
            provider:                { type: 'string', enum: ['LOCAL_WALLET', 'STRIPE', 'PAYPAL'] },
            amount:                  { type: 'number', example: 9.99 },
            currency:                { type: 'string', example: 'USD' },
            status:                  { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED'] },
            balanceBefore:           { type: 'number' },
            balanceAfter:            { type: 'number' },
            externalTransactionId:   { type: 'string', nullable: true },
            subscriptionPeriodStart: { type: 'string', format: 'date-time', nullable: true },
            subscriptionPeriodEnd:   { type: 'string', format: 'date-time', nullable: true },
            createdAt:               { type: 'string', format: 'date-time' },
        },
    },

    // Game Session
    GameParticipant: {
        type: 'object',
        description: 'Participant sub-document stored with the session (snapshot).',
        properties: {
            userId:           { type: 'string', nullable: true },
            usernameSnapshot: { type: 'string', example: 'john_doe' },
            role:             { type: 'string', enum: ['HUMAN', 'AI'] },
            mark:             { type: 'string', enum: ['X', 'O'] },
            aiDifficulty:     { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'], nullable: true },
        },
    },

    GameMove: {
        type: 'object',
        properties: {
            moveNumber:          { type: 'integer', example: 1 },
            byParticipantIndex:  { type: 'integer', enum: [0, 1] },
            row:                 { type: 'integer', minimum: 0 },
            col:                 { type: 'integer', minimum: 0 },
            coordinate:          { type: 'string', example: 'C4', pattern: '^[A-O]([1-9]|1[0-5])$' },
            placedAt:            { type: 'string', format: 'date-time' },
        },
    },

    WinningCell: {
        type: 'object',
        properties: {
            row:        { type: 'integer' },
            col:        { type: 'integer' },
            coordinate: { type: 'string' },
        },
    },

    GameSessionListItem: {
        type: 'object',
        description: 'Compact session shape used in paginated history lists.',
        properties: {
            id:            { type: 'string' },
            sessionNumber: { type: 'string', example: 'GS-01HXXXX' },
            gameType:      { type: 'string', enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'] },
            boardSize:     { type: 'integer', enum: [10, 15] },
            startedAt:     { type: 'string', format: 'date-time' },
            endedAt:       { type: 'string', format: 'date-time', nullable: true },
            status:        { type: 'string', enum: ['FINISHED', 'DRAW', 'ABORTED'] },
            opponentName:  { type: 'string', example: 'jane_doe' },
            viewerResult:  { type: 'string', enum: ['WIN', 'LOSE', 'DRAW', 'ABORTED'] },
        },
    },

    GameSessionDetail: {
        type: 'object',
        description: 'Full session shape including moves for the replay page.',
        allOf: [
            { $ref: '#/components/schemas/GameSessionListItem' },
            {
                type: 'object',
                properties: {
                    boardStyle:                { type: 'string', enum: ['CLASSIC', 'DARK', 'NEON'] },
                    markerStyle:               { type: 'string', enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'] },
                    participants:              { type: 'array', items: { $ref: '#/components/schemas/GameParticipant' } },
                    firstTurnParticipantIndex: { type: 'integer', enum: [0, 1] },
                    winnerParticipantIndex:    { type: 'integer', enum: [0, 1], nullable: true },
                    endedReason:               { type: 'string', enum: ['WIN', 'DRAW', 'ABORT', 'ADMIN_FORCE_CLOSE'] },
                    winningLine:               { type: 'array', items: { $ref: '#/components/schemas/WinningCell' } },
                    moves:                     { type: 'array', items: { $ref: '#/components/schemas/GameMove' } },
                    totalMoves:                { type: 'integer' },
                    durationMs:                { type: 'integer', example: 180000 },
                },
            },
        ],
    },

    // Game Room
    RoomParticipant: {
        type: 'object',
        properties: {
            userId:           { type: 'string' },
            usernameSnapshot: { type: 'string' },
            mark:             { type: 'string', enum: ['X', 'O'], nullable: true },
            joinedAt:         { type: 'string', format: 'date-time' },
        },
    },

    LastMove: {
        type: 'object',
        nullable: true,
        properties: {
            row:        { type: 'integer', nullable: true },
            col:        { type: 'integer', nullable: true },
            coordinate: { type: 'string',  nullable: true },
        },
    },

    RoomDTO: {
        type: 'object',
        description: 'HTTP snapshot of an online room (read-only; mutations go via WebSocket).',
        properties: {
            id:           { type: 'string' },
            roomNumber:   { type: 'string', example: 'RM-01HXXXX' },
            boardSize:    { type: 'integer', enum: [10, 15] },
            status:       { type: 'string', enum: ['WAITING', 'READY', 'PLAYING', 'ABORTED', 'CLOSED'] },
            participants: { type: 'array', items: { $ref: '#/components/schemas/RoomParticipant' }, maxItems: 2 },
            moveCount:    { type: 'integer', example: 7 },
            lastMove:     { $ref: '#/components/schemas/LastMove' },
            startedAt:    { type: 'string', format: 'date-time', nullable: true },
            endedAt:      { type: 'string', format: 'date-time', nullable: true },
        },
    },

    // Admin
    AdminPlayerDetail: {
        type: 'object',
        allOf: [
            { $ref: '#/components/schemas/UserDTO' },
            {
                type: 'object',
                properties: {
                    wallet:           { $ref: '#/components/schemas/WalletSummary' },
                    subscription:     { $ref: '#/components/schemas/SubscriptionStatus' },
                    auth: {
                        type: 'object',
                        properties: {
                            lastLoginAt:   { type: 'string', format: 'date-time', nullable: true },
                        },
                    },
                },
            },
        ],
    },

    DashboardMetrics: {
        type: 'object',
        properties: {
            totalPlayers:   { type: 'integer', example: 4200 },
            activePlayers:  { type: 'integer', example: 312 },
            premiumPlayers: { type: 'integer', example: 89 },
            activeRooms:    { type: 'integer', example: 14 },
            totalMatches:   { type: 'integer', example: 18500 },
            // totalRevenue:   { type: 'number',  example: 4321.50 },
        },
    },

    // Profile Overview
    GameStats: {
        type: 'object',
        properties: {
            totalGames: { type: 'integer' },
            wins:       { type: 'integer' },
            losses:     { type: 'integer' },
            draws:      { type: 'integer' },
            aborted:    { type: 'integer' },
        },
    },

    ProfileOverview: {
        type: 'object',
        properties: {
            user:         { $ref: '#/components/schemas/UserDTO' },
            wallet:       { $ref: '#/components/schemas/WalletSummary' },
            subscription: { $ref: '#/components/schemas/SubscriptionStatus' },
            stats:        { $ref: '#/components/schemas/GameStats' },
            recentGames:  { type: 'array', items: { $ref: '#/components/schemas/GameSessionListItem' } },
        },
    },
};