import swaggerJsdoc from 'swagger-jsdoc';
import { sharedSchemas } from '../utils/swagger/sharedSchemas.utils.js';
import { domainSchemas } from '../utils/swagger/domainSchemas.utils.js';
import { parameters } from '../utils/swagger/parameters.utils.js';
import { requestBodies } from '../utils/swagger/requestBodies.utils.js';
import { responses } from '../utils/swagger/responses.utils.js';

//  SWAGGER-JSDOC OPTIONS
const options = {
    definition: {
        openapi: '3.0.0',

        info: {
            title:       'TicTacToang API',
            version:     '1.0.0',
            description: 
                'Modular Monolith backend for real-time TicTacToe.'
        },

        servers: [
            { url: 'http://localhost:5000', description: 'Local development' },
            { url: 'https://api.tictactoang.com', description: 'Production' },
        ],

        tags: [
            { name: 'Auth',         description: 'Registration, login, logout, and session bootstrap.' },
            { name: 'Profile',      description: 'User profile management.' },
            { name: 'Games',        description: 'Game history, replay, and local/AI session persistence.' },
            { name: 'Rooms',        description: 'HTTP room snapshots (mutations go through WebSocket).' },
            { name: 'Wallet',       description: 'Balance, deposits, and transaction history.' },
            { name: 'Subscription', description: 'Premium membership purchase and history.' },
            { name: 'Admin',        description: 'Admin-only dashboard, player management, and room monitoring.' },
        ],

        components: {
            // Merge all component categories
            schemas:      { ...sharedSchemas, ...domainSchemas },
            parameters,
            requestBodies,
            responses,

            // Cookie-based JWT — no Authorization header needed
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in:   'cookie',
                    name: 'access_token',
                    description: 'HttpOnly JWT cookie set by POST /auth/login. Send requests with `withCredentials: true`.',
                },
            },
        },

        // Apply cookieAuth globally
        security: [{ cookieAuth: [] }],
    },

    apis: ['./src/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);