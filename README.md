<div align="center">

# TicTacToang

### Online Tic-Tac-Toe Gaming Platform

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-FF6B35?style=for-the-badge&logo=react&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

---

**COSC2769/COSC2808 Full Stack Development — Group 1 — Semester 1, 2026**  
Lecturer: Dr. Tri Huynh | Royal Melbourne Institute of Technology Vietnam

[Play Now](https://tictactoang.vercel.app) · [API Docs](https://tictactoang-backend-dt4u.onrender.com/api-docs) · [Repository](https://github.com/RMIT-Full-Stack-Development-2026A/Group1)

</div>

## Overview

TicTacToang is a high-performance, modern web platform designed to bring the classic game of Tic-Tac-Toe into the digital era. Built with a strict **Modular Monolith** architecture, it supports:

- **Single Player** — Play against a Minimax AI engine
- **Local Multiplayer** — Two players on the same device
- **Online Multiplayer** — Real-time matches via Socket.IO

## Repository & Links

| Item | Link |
|------|------|
| GitHub Repository | [RMIT-Full-Stack-Development-2026A/Group1](https://github.com/RMIT-Full-Stack-Development-2026A/Group1) |
| Frontend (Live) | [tictactoang.vercel.app](https://tictactoang.vercel.app) |
| Backend (Live) | [tictactoang-backend-dt4u.onrender.com](https://tictactoang-backend-dt4u.onrender.com) |
| API Documentation | [/api-docs](https://tictactoang-backend-dt4u.onrender.com/api-docs) |


## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Zustand, Tailwind CSS 4, Socket.IO Client |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Socket.IO |
| **Architecture** | Modular Monolith, N-Tier (Route -> Controller -> Service -> Repository -> Model) |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas |

## Test Accounts

> These accounts are pre-seeded into the database via `node ./src/seed/index.js`.

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | `admin_tictactoang` | admin@tictactoang.com | `Admin@123!` |
| Player (Premium) | `premium_player` | premium@tictactoang.com | `Player@123!` |
| Player (Standard) | `normal_player` | player@tictactoang.com | `Player@123!` |
| Player (Banned) | `banned_player` | banned@tictactoang.com | `Player@123!` |

## Prerequisites

Before you begin, ensure the following are installed:

- Node.js v18 or higher
- MongoDB (local instance or MongoDB Atlas URI)
- Git

## Setup and Installation

The project is separated into two directories: `client` (frontend) and `server` (backend). Both must run concurrently.

### 1. Clone the Repository

```bash
git clone https://github.com/RMIT-Full-Stack-Development-2026A/Group1
cd Group1
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file inside `server/` and populate it with the following:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:8000

# Database
MONGO_URI=mongodb://....

# Security and Authentication
JWT_SECRET=your_super_secret_jwt_key

# Avatar Storage (Cloudinary)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# PayPal Integration
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
ALLOW_UNVERIFIED_PAYPAL_WEBHOOKS=true

# SMTP (Email)
SMTP_EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_password
```

Seed the database with initial accounts and sample match data if your db is empty:

```bash
node ./src/seed/index.js
```

Start the backend development server:

```bash
npm run dev # node ./index.js
```

> The server runs on `http://localhost:5000` by default.  
> API documentation is available at `http://localhost:5000/api-docs` once the server is running.

### 3. Frontend Setup

Open a new terminal and navigate to the client directory:

```bash
cd client
npm install
npm run dev
```

> The frontend runs on `http://localhost:8000`.  
> Ensure this matches the `CLIENT_URL` value in the backend `.env` file to prevent CORS issues.


## Integration Test Execution

This project uses **Jest** and **Supertest** for integration testing across all API modules (Auth, Profile, Game, Room, Subscription, and Admin).

```bash
cd server
npm run test
```

> The test script sets `NODE_ENV=test` and runs tests sequentially via `--runInBand` to prevent data conflicts. Ensure `.env` is configured before running. Critical third-party services such as PayPal are automatically mocked during test execution.

## Contribution Table

> Contribution scores were agreed upon unanimously by all team members.

| Full Name | Student ID | GitHub Username | Key Responsibilities | Score |
|-----------|------------|-----------------|----------------------|:-----:|
| Nguyen Q. Khanh | [s4147730] | [KhanhQNguyn] | Sheet for report tracking, report writing and refinement, UI/UX design configuration (sound, notification toast, theme, music, font, color), game board implementation, marker renderer, online room connection, disconnect grace period, match replay, premium subscription, component replenish | 5 |
| Tran H. Minh | [S4104179] | [Minz516] | Sprint planning and task management, GitHub project board maintenance, system-wide quality assurance, performance improvement, test case design and execution, meeting facilitation and retrospectives, medium and hard AI, upload avatar in server using multer, sharp and cloudinary | 5 |
| Hoang M. Thang | [s3999925] | [ThangHoang54] | Led the backend architecture design and implemented the N-Tier module structure. Developed the Authentication module with JWT middleware, Profile module, Admin module and managed the Room and WebSocket (Socket.IO) lifecycle. Designed the database schema and MongoDB modeling, implemented integration testing, created seed data scripts, reformat code and co-developed  22 RESTful API endpoints.  | 5 |
| Nguyen D. G. Phat | [s4106116] | [giaphat060206] | Frontend UI Implementation for the following pages: Guest & Admin’s Pages; Player’s Select Game Mode, Lobby, Customize, Profile. Easy AI Logic for Singleplayer. Dynamic Mobile UI implementation | 5 |
| Truong K. Minh | [s4067934] | [kiemminh000/Minh-bot73] | Co-designed the backend architecture and engineered technical documentation, including backend component diagrams and database schema optimization. Spearheaded the Subscription module (featuring PayPal payment gateway and automated email API integration) and the core Game module logic. Co-developed the Authentication, Room management systems, real-time WebSocket (Socket.IO) event handling, and co-developed others 22 RESTful API endpoints. | 5 |

## GitHub Contribution Proof

The repository commit history and contribution graph serve as evidence of active, iterative development across all **seven sprints** (Week 5 to Week 12). All commits were made under each member's registered GitHub account.

To verify contributions, navigate to:  
[github.com/RMIT-Full-Stack-Development-2026A/Group1/graphs/contributors](https://github.com/RMIT-Full-Stack-Development-2026A/Group1/graphs/contributors)

> **Note:** If GitHub usernames do not contain a member's first and last name, refer to the Contribution Table above for the mapping between full name and GitHub username.

---

<div align="center">

Made with love by **Group 1** — RMIT Vietnam, Semester 1, 2026

</div>
