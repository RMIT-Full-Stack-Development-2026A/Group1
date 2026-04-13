//  REUSABLE REQUEST BODIES
export const requestBodies = {
    RegisterBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['username', 'email', 'password', 'country'],
                    properties: {
                        username: { type: 'string', example: "Myxlozz", pattern: '^[a-zA-Z0-9_-]{6,30}$' },
                        email:    { type: 'string', format: 'email', example: 'player@example.com' },
                        password: {
                            type: 'string', format: 'password', minLength: 8,
                            description: 'Min 8 chars, must include upper, lower, digit, and special character.', example: "player@@135A",
                        },
                        country:  { type: 'string' },
                    },
                },
            },
        },
    },

    LoginBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['identifier', 'password'],
                    properties: {
                        identifier: { type: 'string', example: 'john_doe', description: 'Username or email.' },
                        password:   { type: 'string', format: 'password', example: 'P@ssw0rd!' },
                    },
                },
            },
        },
    },

    UpdateProfileBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        username: { type: 'string', pattern: '^[a-zA-Z0-9_-]{6,30}$' },
                        email:    { type: 'string', format: 'email' },
                        country:  { type: 'string' },
                    },
                },
            },
        },
    },

    ChangePasswordBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: { type: 'string', format: 'password' },
                        newPassword:     { type: 'string', format: 'password', minLength: 8 },
                    },
                },
            },
        },
    },

    AvatarBody: {
        required: true,
        content: {
            'multipart/form-data': {
                schema: {
                    type: 'object',
                    required: ['avatar'],
                    properties: {
                        avatar: { type: 'string', format: 'binary', description: 'Image file (jpg/png/webp).' },
                    },
                },
            },
        },
    },

    SaveGameBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['gameType', 'boardSize', 'participants', 'firstTurnParticipantIndex', 'status', 'endedReason', 'moves', 'startedAt'],
                    properties: {
                        gameType:                  { type: 'string', enum: ['SINGLE_PLAYER', 'TWO_PLAYERS'] },
                        boardSize:                 { type: 'integer', enum: [10, 15] },
                        boardStyle:                { type: 'string', enum: ['CLASSIC', 'DARK', 'NEON'], default: 'CLASSIC' },
                        markerStyle:               { type: 'string', enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], default: 'CLASSIC' },
                        participants:              { type: 'array', items: { $ref: '#/components/schemas/GameParticipant' }, minItems: 2, maxItems: 2 },
                        firstTurnParticipantIndex: { type: 'integer', enum: [0, 1] },
                        winnerParticipantIndex:    { type: 'integer', enum: [0, 1], nullable: true },
                        status:                    { type: 'string', enum: ['FINISHED', 'DRAW', 'ABORTED'] },
                        endedReason:               { type: 'string', enum: ['WIN', 'DRAW', 'ABORT'] },
                        winningLine:               { type: 'array', items: { $ref: '#/components/schemas/WinningCell' } },
                        moves:                     { type: 'array', items: { $ref: '#/components/schemas/GameMove' } },
                        startedAt:                 { type: 'string', format: 'date-time' },
                        endedAt:                   { type: 'string', format: 'date-time', nullable: true },
                        durationMs:                { type: 'integer' },
                    },
                },
            },
        },
    },

    DepositBody: {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['amount'],
                    properties: {
                        amount:   { type: 'number', minimum: 1, example: 10 },
                        currency: { type: 'string', default: 'USD' },
                        provider: { type: 'string', enum: ['LOCAL_WALLET', 'STRIPE', 'PAYPAL'], default: 'LOCAL_WALLET' },
                    },
                },
            },
        },
    },
};