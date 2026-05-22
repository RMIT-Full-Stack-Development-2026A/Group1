# TicTacToang - Online TicTacToe Gaming Platform

TicTacToang is a high-performance, modern web platform designed to bring the classic game of Tic-Tac-Toe into the digital era. Built with a strict Modular Monolith architecture, it supports Single Player (AI), Local Multiplayer, and real-time Online Multiplayer game modes.

## Tech Stack
* **Frontend:** React-based framework (Vite), Zustand, Tailwind CSS.
* **Backend:** MEN Stack (MongoDB, ExpressJS, NodeJS).
* **Architecture:** N-Tier Layer-based Hierarchy (Route, Controller, Service, Repository, Model).

## Setup & Installation

This project is separated into two main directories: `client` (frontend) and `server` (backend). You will need to run both concurrently.

## 🛠 Prerequisites
Before you begin, ensure you have the following installed and set up:
* **Node.js** (v18 or higher recommended)
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **Git**

### Installation 
Clone the repository:

    ```bash
    git clone https://github.com/RMIT-Full-Stack-Development-2026A/Group1
    cd Group1
    ```
### Backend Setup (Server)
1. Navigate to the backend directory and install the necessary dependencies:
    ```bash
    cd server
    npm install
    ``` 
2. Create a `.env` file in the root of the `server/` folder and populate it with the required keys. Here is a template to get you started:

    ```bash
    # Server Configuration
    PORT=5000
    NODE_ENV=development
    CLIENT_URL=http://localhost:8000

    # Database
    MONGO_URI=mongodb://....

    # Security, Authentication
    JWT_SECRET=your_super_secret_jwt_key

    # Avatar
    CLOUDINARY_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret

    # PayPal Integration
    PAYPAL_MODE=sandbox
    PAYPAL_CLIENT_ID=your_paypal_client_id
    PAYPAL_CLIENT_SECRET=your_paypal_client_secret

    # Webhook refunds locally
    PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
    ALLOW_UNVERIFIED_PAYPAL_WEBHOOKS=true

    # SMTP
    SMTP_EMAIL=your_smtp_email
    SMTP_PASSWORD=your_smtp_password
    ```

3. Database Seeding

- Before starting the server for the first time, populate your local database with initial admin accounts, players, and sample match data:

    ```bash
    node ./src/seed/index.js
    ```

    > Sample Admin / User account

    | Username | Email | Password | Note |
    |----------|------|----------|-------|
    | admin_tictactoang | admin@tictactoang.com | Admin@123! | Admin |
    | normal_player | player@tictactoang.com | Player@123! | Normal user |
    | premium_player | premium@tictactoang.com | Player@123! | Premium user |
    | banned_player | banned@tictactoang.com | Player@123! | Banned user |    

4. Start the backend development server:

    ```bash
    npm run dev # or node ./index.js
    ``` 

`Note`: The server will run on `http://localhost:5000` by default and uses `nodemon` to automatically restart on file changes.

**`📚 API Documentation`**: Once the server is running, you can view the Swagger/OpenAPI docs at http://localhost:5000/api-docs.

### Integration Test Execution (Server)
This project uses **Jest** and **Supertest** for comprehensive integration testing across all API modules (Auth, Profile, Game, Room, Subscription, and Admin). The test suite interacts with an in-memory or test database and runs sequentially to prevent data conflicts.

To execute the test suite:

1. Ensure you are in the `server` directory.
2. Run the test script:
    ```bash
    npm run test
    ```

**Under the hood:**
The test script automatically sets `NODE_ENV=test` and uses `--runInBand` to execute tests one by one. It also enables Node's experimental VM modules to support ES6 imports during testing. 

*Note: Ensure your `.env` file is properly configured before running tests, though the test suite will automatically mock critical third-party services like PayPal.*

### Frontend Setup (Client)
1. Open a new terminal window and navigate to the client directory:
    ```Bash
    cd client
    ```
2. Install frontend dependencies:
    ```Bash
    npm install
    ```
3. Start the frontend development server:
    ```Bash
    npm run dev
    ```
`Note`: The React frontend typically runs on `http://localhost:8000`. Make sure this matches the `CLIENT_URL` in your backend `.env` file to prevent CORS issues.