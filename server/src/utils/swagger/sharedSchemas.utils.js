//  PRIMITIVE / SHARED SCHEMAS
export const sharedSchemas = {
    // Policy envelopes
    SuccessResponse: {
        type: 'object',
        properties: {
            data:    { type: 'object' },
            message: { type: 'string', example: 'OK' },
        },
    },
    ErrorResponse: {
        type: 'object',
        properties: {
            error:         { type: 'string',  example: 'VALIDATION_ERROR' },
            message:       { type: 'string',  example: 'Human readable message' },
            cause:         { type: 'string',  example: 'Field username is required' },
            valid_example: { type: 'string',  example: '{ "username": "tictacasmin99" }' },
        },
    },

    // Pagination wrapper 
    PaginatedResponse: {
        type: 'object',
        properties: {
            data: {
                type: 'object',
                properties: {
                    items: { type: 'array', items: {} },
                    total: { type: 'integer', example: 120 },
                    page:  { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                },
            },
            message: { type: 'string' },
        },
    },
};