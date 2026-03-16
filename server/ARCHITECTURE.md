# TicTacToang Backend Architecture

This backend architecture strictly adheres to a Modular Monolith approach and an N-Tier layer hierarchy. Each module is strictly separated by bounded contexts, and internal layers enforce a strict directional dependency flow. 

```text
backend/
├── src/
│   ├── config/                       # Global configuration files (e.g., Database, Environment). Organized separately as it does not follow the Tier structure.
│   ├── middlewares/                  # Dedicated middleware layer to authorize users and prevent privilege escalation.
│   │   ├── authMiddleware.js         # Validates JWS tokens.
│   │   └── roleMiddleware.js         # Ensures Players cannot access Admin APIs.
│   ├── utils/                        # Global utilities (e.g., error formatters, loggers) organized separately.
│   ├── modules/                      # Applies Modular Monolith Architecture. Each module handles a specific business feature.
│   │   │
│   │   ├── auth/                     # Bounded context for identity and authentication (/api/v1/auth).
│   │   │   ├── routes/               # Route Layer: Defines API endpoints.
│   │   │   ├── controllers/          # Controller Layer: Handles incoming HTTP requests.
│   │   │   ├── services/             # Service Layer: Contains business logic.
│   │   │   ├── repositories/         # Repository Layer: Defines database query statements.
│   │   │   ├── models/               # Model Layer: *OWNS* the `User.js` schema.
│   │   │   ├── dtos/                 # DTO Layer: Filters sensitive data in responses.
│   │   │   └── interfaces/           # Exposes external services (e.g., `userInterface.js`) so other modules do NOT call the Service Layer directly.
│   │   │
│   │   ├── profile/                  # Bounded context for user profiles (/api/v1/profile). 
│   │   │   └── (No Model Layer)      # Retrieves and updates user data by calling `auth/interfaces/user.interface.js`.
│   │   │
│   │   ├── game/                     # Bounded context for past game history (/api/v1/game). 
│   │   │   └── models/               # *OWNS* the `GameSession.js` schema.
│   │   │
│   │   ├── room/                     # Bounded context for active multiplayer sessions (/api/v1/rooms). 
│   │   │   └── models/               # *OWNS* the `GameRoom.js` schema.
│   │   │
│   │   ├── wallet/                   # Bounded context for fund deposits (/api/v1/wallet). 
│   │   │   ├── models/               # *OWNS* the `Transaction.js` schema.
│   │   │   └── interfaces/           # Exposes payment processing capabilities.
│   │   │
│   │   ├── subscription/             # Bounded context for premium status (/api/v1/subscription). 
│   │   │   └── (No Model Layer)      # Processes subscriptions by calling `wallet/interfaces/transaction.interface.js` and `auth/interfaces/user.interface.js`.
│   │   │
│   │   └── admin/                    # Bounded context for monitoring and management (/api/v1/admin). 
│   │       └── (No Model Layer)      # Interacts with users and rooms by calling the interfaces of the `auth` and `room` modules.
│   │
│   ├── sockets/                      # WebSocket configurations for real-time game synchronization (/ws/game namespace).
│   ├── app.js                        # Main Express application entry point.
│   └── server.js                     # HTTP and WebSocket server initialization.
└── package.json                      # Node.js dependencies[cite: 78].