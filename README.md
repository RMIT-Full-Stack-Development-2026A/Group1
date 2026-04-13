# TicTacToang - Online TicTacToe Gaming Platform

TicTacToang is a high-performance, modern web platform designed to bring the classic game of Tic-Tac-Toe into the digital era. Built with a strict Modular Monolith architecture, it supports Single Player (AI), Local Multiplayer, and real-time Online Multiplayer game modes.

## Tech Stack
* **Frontend:** React-based framework (Vite), Zustand, Tailwind CSS.
* **Backend:** MEN Stack (MongoDB, ExpressJS, NodeJS).
* **Architecture:** N-Tier Layer-based Hierarchy (Route, Controller, Service, Repository, Model).

## 🚀 Setup & Installation

This project is separated into two main directories: `client` (frontend) and `server` (backend). You will need to run both concurrently.

## 🛠 Prerequisites
Before you begin, ensure you have the following installed and set up:
* **Node.js** (v18 or higher recommended)
* **MongoDB** (Local instance or MongoDB Atlas URI)

### Installation 
1. Clone the repository
    ```bash
    git clone https://github.com/RMIT-Full-Stack-Development-2026A/Group1
    cd Group1
    ```
### Backend Setup (Server)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2.  Install backend dependencies:
    ```bash
    npm install
    ``` 
3. Create a .env file in the root of the server folder.

4. Start the backend development server:
    ```bash
    npm run dev # or node ./src/index.js
    ``` 
`Note`: The server will run on `http://localhost:5000` by default and uses `nodemon` to automatically restart on file changes.

**Swagger/OpenAPI**: Typically hosted at `/api-docs` (e.g., `http://localhost:5000/api-docs`) using the swagger-ui-express package.

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
`Note`: The React frontend typically runs on `http://localhost:5173`. Make sure this matches the `CLIENT_URL` in your backend `.env` file to prevent CORS issues.