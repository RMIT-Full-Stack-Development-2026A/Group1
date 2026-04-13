//  REUSABLE PARAMETERS
export const parameters = {
    // Path params 
    PathId: {
        in: 'path', name: 'id', required: true,
        schema: { type: 'string' },
        description: 'MongoDB ObjectId of the resource.',
    },

    // Pagination 
    PageParam: {
        in: 'query', name: 'page', required: false,
        schema: { type: 'integer', default: 1, minimum: 1 },
    },
    LimitParam: {
        in: 'query', name: 'limit', required: false,
        schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
    },

    // Common sort/search 
    SearchParam: {
        in: 'query', name: 'q', required: false,
        schema: { type: 'string' },
        description: 'Full-text search query.',
    },
    SortByParam: {
        in: 'query', name: 'sortBy', required: false,
        schema: { type: 'string', example: 'createdAt' },
    },
    SortOrderParam: {
        in: 'query', name: 'sortOrder', required: false,
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    },
    DateFromParam: {
        in: 'query', name: 'from', required: false,
        schema: { type: 'string', format: 'date-time' },
        description: 'ISO 8601 start date for range filter.',
    },
    DateToParam: {
        in: 'query', name: 'to', required: false,
        schema: { type: 'string', format: 'date-time' },
        description: 'ISO 8601 end date for range filter.',
    },

    //  Game session filters
    GameTypeParam: {
        in: 'query', name: 'gameType', required: false,
        schema: { type: 'string', enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'] },
    },
    GameResultParam: {
        in: 'query', name: 'result', required: false,
        schema: { type: 'string', enum: ['WIN', 'LOSE', 'DRAW', 'ABORTED'] },
        description: 'Filter by viewer-perspective result.',
    },

    // Room filters
    RoomStatusParam: {
        in: 'query', name: 'status', required: false,
        schema: { type: 'string', enum: ['WAITING', 'READY', 'PLAYING'] },
    },
    BoardSizeParam: {
        in: 'query', name: 'boardSize', required: false,
        schema: { type: 'integer', enum: [10, 15] },
    },

    // Admin player filters
    PlayerStatusParam: {
        in: 'query', name: 'status', required: false,
        schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
    PremiumFilterParam: {
        in: 'query', name: 'premium', required: false,
        schema: { type: 'boolean' },
        description: 'Filter by premium membership status.',
    },
};