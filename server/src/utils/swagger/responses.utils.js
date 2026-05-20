//  REUSABLE RESPONSES
export const responses = {
    // Success responses 
    CheckAuthResponse: {
        description: 'Session is valid. Returns the bootstrapped auth payload.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        user:       { $ref: '#/components/schemas/UserDTO' },
                                        activeRoom: { $ref: '#/components/schemas/ActiveRoom' },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    },

    ProfileOverviewResponse: {
        description: 'Aggregated profile page payload.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        { type: 'object', properties: { data: { $ref: '#/components/schemas/ProfileOverview' } } },
                    ],
                },
            },
        },
    },

    UserResponse: {
        description: 'Single user resource.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        { type: 'object', properties: { data: { $ref: '#/components/schemas/UserDTO' } } },
                    ],
                },
            },
        },
    },

    GameSessionDetailResponse: {
        description: 'Full game session including replay moves.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        { type: 'object', properties: { data: { $ref: '#/components/schemas/GameSessionDetail' } } },
                    ],
                },
            },
        },
    },

    GameSessionListResponse: {
        description: 'Paginated list of game history items.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/PaginatedResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        items: { type: 'array', items: { $ref: '#/components/schemas/GameSessionListItem' } },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    },

    RoomResponse: {
        description: 'Single room snapshot.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        { type: 'object', properties: { data: { $ref: '#/components/schemas/RoomDTO' } } },
                    ],
                },
            },
        },
    },

    RoomListResponse: {
        description: 'Paginated list of room snapshots.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/PaginatedResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        items: { type: 'array', items: { $ref: '#/components/schemas/RoomDTO' } },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    },

    TransactionListResponse: {
        description: 'Current Subscription Details. Returns a paginated wrapper containing max 1 active transaction.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/PaginatedResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        items: { 
                                            type: 'array', 
                                            description: 'Array containing max 1 active transaction.',
                                            maxItems: 1,
                                            items: { $ref: '#/components/schemas/Transaction' } 
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    },

    SubscriptionStatusResponse: {
        description: 'Premium subscription status.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        { type: 'object', properties: { data: { $ref: '#/components/schemas/SubscriptionStatus' } } },
                    ],
                },
            },
        },
    },

    DashboardResponse: {
        description: 'Admin dashboard aggregate metrics.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        { type: 'object', properties: { data: { $ref: '#/components/schemas/DashboardMetrics' } } },
                    ],
                },
            },
        },
    },

    AdminPlayerListResponse: {
        description: 'Paginated player list for admin panel.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/PaginatedResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        items: { type: 'array', items: { $ref: '#/components/schemas/AdminPlayerDetail' } },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    },

    AdminPlayerDetailResponse: {
        description: 'Full admin view of one player.',
        content: {
            'application/json': {
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/SuccessResponse' },
                        { type: 'object', properties: { data: { $ref: '#/components/schemas/AdminPlayerDetail' } } },
                    ],
                },
            },
        },
    },

    // Generic status-only success
    NoDataResponse: {
        description: 'Operation succeeded. No data payload.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: { data: {}, message: 'OK' },
            },
        },
    },

    // Error responses 
    BadRequestResponse: {
        description: 'Validation error or malformed request.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                    error: 'VALIDATION_ERROR',
                    message: 'Request body is invalid.',
                    cause: 'Field "email" must be a valid email address.',
                    valid_example: '{ "email": "user@example.com" }',
                },
            },
        },
    },
    UnauthorizedResponse: {
        description: 'Missing or invalid session. FE must redirect to /login.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'UNAUTHORIZED', message: 'No active session found.' },
            },
        },
    },
    ForbiddenResponse: {
        description: 'Authenticated but insufficient role (e.g. ADMIN required).',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'FORBIDDEN', message: 'ADMIN role required.' },
            },
        },
    },
    NotFoundResponse: {
        description: 'Resource does not exist.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'NOT_FOUND', message: 'Resource not found.' },
            },
        },
    },
    TooManyRequestsResponse: {
        description: 'Brute-force lock active. Retry after the indicated window.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'TOO_MANY_REQUESTS', message: 'Account locked for 60 seconds after 5 failed attempts.' },
            },
        },
    },
    ConflictResponse: {
        description: 'Resource already exists (e.g. duplicate username/email) or state mismatch.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'CONFLICT', message: 'Username is already taken.' },
            },
        },
    },
    InternalServerErrorResponse: {
        description: 'Unexpected server error.',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' },
            },
        },
    },
};