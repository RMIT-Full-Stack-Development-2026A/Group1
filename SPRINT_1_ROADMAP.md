# TicTacToang Sprint 1 - Implementation Roadmap
**Target:** Get core auth + 3 profile modules working (Game playable by end of sprint)  
**Duration:** 2 weeks  
**Team:** Full-stack developers

---

## 🚀 QUICK START CHECKLIST

### Phase 1: Cleanup & Fixes (Day 1) ⚡
- [ ] Fix typos: `roleMiddelware.js` → `roleMiddleware.js`
- [ ] Fix typos: `subsciption.*` → `subscription.*`
- [ ] Fix routes: `/admin/players` should point to PlayerManagement page
- [ ] Fix routes: `/admin/rooms` should point to GameRoomMonitor page
- [ ] Test frontend build: `npm run build` (no errors)
- [ ] Test backend start: `npm run dev` (listens on port 5000)
- [ ] Mount auth router in `server/src/app.js` → `app.use('/api/v1/auth', authRouter)`

**Estimated Time:** 2-3 hours

---

### Phase 2: Backend Core Modules (Days 2-5) 🔧

#### 2.1 Profile Module (Day 2)
**Goal:** Create complete CRUD for user profiles

**Files to implement:**
```
server/src/modules/profile/
├── routes/profile.routes.js
├── controllers/profile.controller.js
├── services/profile.service.js
├── repositories/profile.repository.js
├── dtos/profile.dto.js
└── interfaces/profile.interface.js
```

**Endpoints to implement:**
- `GET /api/v1/profile` - Get current user profile
- `PUT /api/v1/profile` - Update email/username/country
- `PATCH /api/v1/profile/password` - Change password
- `POST /api/v1/profile/avatar` - Upload avatar (multer + file system)

**Testing:**
```bash
# After implementation
npm test profile.routes.test.js
# Manual test with Postman/cURL
curl -H "Cookie: access_token=..." \
     http://localhost:5000/api/v1/profile
```

**Estimated Time:** 6-8 hours

---

#### 2.2 Game Module (Days 3-4)
**Goal:** Get game history retrieval working

**Files to implement:**
```
server/src/modules/game/
├── routes/game.routes.js
├── controllers/game.controller.js
├── services/game.service.js
└── repositories/game.repository.js
```

**Endpoints to implement:**
- `GET /api/v1/games` - List user's games
- `GET /api/v1/games/:id` - Get game details (with moves)
- `GET /api/v1/games/:id/moves` - Get just the moves
- `GET /api/v1/games/search?playerName=X` - Search games

**Database seeding (for testing):**
```javascript
// scripts/seedGames.js - Create 5 test games
const testGames = [
    { sessionNumber: "SESS_001", gameType: "SINGLE_PLAYER", result: "PLAYER1_WIN", ... },
    // ... add 4 more
];
await GameSession.insertMany(testGames);
```

**Estimated Time:** 8-10 hours

---

#### 2.3 Room Module (Days 4-5)
**Goal:** Active game room management (no WebSocket yet)

**Files to implement:**
```
server/src/modules/room/
├── routes/room.routes.js
├── controllers/room.controller.js
├── services/room.service.js
└── repositories/room.repository.js
```

**Endpoints to implement:**
- `GET /api/v1/rooms` - List active rooms (WAITING status only)
- `POST /api/v1/rooms` - Create new room
- `GET /api/v1/rooms/:id` - Get room details
- `POST /api/v1/rooms/:id/join` - Join existing room (toggle status WAITING → PLAYING)
- `DELETE /api/v1/rooms/:id` - Close room

**Important logic:**
```javascript
// Room creation
1. User clicks "Create Room"
2. POST /rooms → Create GameRoom { player1: currentUser, player2: null, status: WAITING }
3. Return roomId to FE

// Room joining
1. User clicks "Join" on a room
2. POST /rooms/:id/join → Check room.player2 is null
3. Set room.player2 = currentUser, status = PLAYING
4. WebSocket: emit 'player_joined' event to room (for Sprint 2)
5. Return updated room

// Room listing
1. GET /rooms → GameRoom.find({ status: 'WAITING' })
2. Only show rooms waiting for a second player
```

**Estimated Time:** 8-10 hours

---

#### 2.4 Mount Routes in app.js (Day 5)
Once modules are done, add to `server/src/app.js`:
```javascript
import profileRouter from './modules/profile/routes/profile.routes.js';
import gameRouter from './modules/game/routes/game.routes.js';
import roomRouter from './modules/room/routes/room.routes.js';

app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/game', gameRouter);
app.use('/api/v1/rooms', roomRouter);
// ... add wallet, subscription, admin when ready
```

**Estimated Time:** 1 hour

---

#### 2.5 Error Handler Middleware (Day 5)
Add global error handler at end of `server/src/app.js`:
```javascript
// Error handling middleware (MUST be last)
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const errorCode = err.errorCode || "SERVER_ERROR";
    const message = err.message || "Internal Server Error";
    
    console.error(`[${status}] ${errorCode}: ${message}`);
    
    res.status(status).json({
        error: errorCode,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
```

**Estimated Time:** 1 hour

---

### Phase 3: Frontend State & Routing (Days 4-7) 🖥️

#### 3.1 Complete AuthStore (Day 4)
**File:** `client/src/stores/AuthStore.jsx`

**Current Status:** ⚠️ Structure done, just needs API integration

**Checklist:**
- [x] State fields defined (user, isAuthenticated, isCheckingAuth, isLoading, error)
- [x] Action functions defined (login, register, logout, checkAuth, clearError)
- [ ] Test each action with live backend
- [ ] Handle all error codes (401, 400, 403, 500)
- [ ] Global event listener for unauthorized (401) → redirect to /login

**Testing:**
```javascript
// In Frontend Console:
const { login, register } = useAuthStore.getState();

// Test register
await register({ 
    username: 'TestUser_123', 
    email: 'test@example.com', 
    password: 'TestP@ssw0rd1', 
    confirmPassword: 'TestP@ssw0rd1', 
    country: 'Vietnam' 
});

// Test login
await login({ identifier: 'test@example.com', password: 'TestP@ssw0rd1' });

// Test checkAuth (after refresh)
await checkAuth();
```

**Estimated Time:** 3-4 hours

---

#### 3.2 Enable Protected Routes (Day 5)
**Files to edit:**
- `client/src/routes/ProtectedRoute.jsx` - Uncomment all logic
- `client/src/routes/AppRouter.jsx` - Uncomment all route definitions
- `client/src/Layout.jsx` - Uncomment Navigation conditional render

**Checklist:**
- [ ] Uncomment ProtectedRoute logic (check isAuthenticated + allowedRoles)
- [ ] Uncomment all route definitions in AppRouter
- [ ] Add useEffect in AppRouter to call checkAuth on mount
- [ ] Test: Can't access /profile without login (redirects to /login) ✅
- [ ] Test: After login, can access /profile ✅
- [ ] Test: ADMIN user can access /admin pages ✅
- [ ] Test: PLAYER user cannot access /admin (redirects) ✅

**Estimated Time:** 2-3 hours

---

#### 3.3 Implement Navigation Component (Days 5-6)
**File:** `client/src/components/Navigation/index.jsx`

**Current Status:** ❌ Empty (but stub already created)

**Requirements:**
```jsx
// Navigation should show:
// - TicTacToang logo (already in Landing page)
// - Menu items based on auth state:
//   - Not logged in: "Login", "Register" buttons
//   - Logged in: "Play", "Profile", "Leaderboard", "Logout" buttons
//   - Admin: "Admin Dashboard" + regular menu

// Mobile: Hamburger menu (use MobileMenu.jsx)
// Desktop: Horizontal menu

// Use Tailwind CSS (already in index.css)
// Check useNavigation.hook.js for state management
```

**Key functions needed:**
```javascript
// useNavigation.hook.js
const useNavigation = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    return { user, isAuthenticated, navigate, handleLogout };
};

// Navigation/index.jsx
export default function Navigation() {
    const { user, isAuthenticated, navigate, handleLogout } = useNavigation();
    
    return (
        <nav className="navbar">
            <logo />
            {!isAuthenticated && (
                <>
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/register')}>Register</button>
                </>
            )}
            {isAuthenticated && (
                <>
                    <button onClick={() => navigate('/play')}>Play</button>
                    <button onClick={() => navigate('/profile')}>Profile</button>
                    {user.role === 'ADMIN' && (
                        <button onClick={() => navigate('/admin')}>Admin</button>
                    )}
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    );
}
```

**Estimated Time:** 4-6 hours

---

#### 3.4 Implement Profile Page (Day 6)
**File:** `client/src/pages/Player/Profile/index.jsx`

**Features:**
- Display user info (username, email, country, premium status)
- Edit buttons for each field
- Update password form
- Avatar upload
- Stats (games played, wins, losses)
- "Logout" button

**Structure:**
```jsx
export default function ProfilePage() {
    const { user } = useAuthStore();
    
    return (
        <div className="profile-container">
            <h1>Profile</h1>
            <UserInfoSection user={user} />
            <EditPasswordSection user={user} />
            <AvatarUploadSection user={user} />
            <GameStatsSection user={user} />
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

**API Calls:**
```javascript
// GET /api/v1/profile - already fetched in AuthStore
// PUT /api/v1/profile - update profile
// PATCH /api/v1/profile/password - change password
// POST /api/v1/profile/avatar - upload avatar
```

**Estimated Time:** 6-8 hours

---

#### 3.5 Implement Game Lobby Page (Day 7)
**File:** `client/src/pages/Player/GameLobby/index.jsx`

**Features:**
- List of available rooms (status: WAITING)
- "Create Room" button
- "Join Room" button for each room
- Room details: player1 name, created time

**Structure:**
```jsx
export default function GameLobby() {
    const [rooms, setRooms] = useState([]);
    
    useEffect(() => {
        fetchRooms();
    }, []);
    
    const fetchRooms = async () => {
        const data = await httpHelper.get(API_ENDPOINTS.ROOM.LIST);
        setRooms(data);
    };
    
    const handleCreateRoom = async () => {
        const newRoom = await httpHelper.post(API_ENDPOINTS.ROOM.CREATE, 
            { boardSize: 10 });
        navigate(`/game/${newRoom.id}`);
    };
    
    const handleJoinRoom = async (roomId) => {
        await httpHelper.post(API_ENDPOINTS.ROOM.JOIN(roomId));
        navigate(`/game/${roomId}`);
    };
    
    return (
        <div>
            <h1>Game Lobby</h1>
            <button onClick={handleCreateRoom}>Create Room</button>
            <div className="rooms-list">
                {rooms.map(room => (
                    <RoomCard room={room} onJoin={handleJoinRoom} />
                ))}
            </div>
        </div>
    );
}
```

**API Endpoints Used:**
- `GET /api/v1/rooms`
- `POST /api/v1/rooms` (create)
- `POST /api/v1/rooms/:id/join`

**Estimated Time:** 4-6 hours

---

### Phase 4: Frontend GameBoard (Days 7-10) 🎮

#### 4.1 Implement GameBoard Component (Days 7-10)
**File:** `client/src/components/GameBoard/index.jsx`

**Features:**
- 10x10 grid displayed
- Click cell to place mark (X or O)
- Show current turn
- Validate moves (not on occupied cell, not before your turn)
- Display winner when game ends
- Chat overlay (basic for now)

**Component Structure:**
```jsx
// GameBoard/index.jsx
export default function GameBoard({ roomId }) {
    const [board, setBoard] = useState(/* 10x10 grid */);
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [winner, setWinner] = useState(null);
    
    useEffect(() => {
        fetchRoomState(); // GET /api/v1/rooms/:id
    }, [roomId]);
    
    const handleCellClick = async (row, col) => {
        if (board[row][col] !== null) return; // Already filled
        
        await httpHelper.post(API_ENDPOINTS.GAME.MAKE_MOVE, {
            roomId, coordinate: `${row}${col}`, mark: currentPlayer
        });
        
        // For Sprint 1: Just refresh board
        // For Sprint 2: Use WebSocket for real-time
        fetchRoomState();
    };
    
    return (
        <div className="game-board-container">
            <Grid board={board} onCellClick={handleCellClick} />
            <Chat roomId={roomId} />
            {winner && <WinnerBanner winner={winner} />}
        </div>
    );
}

// GridCell.jsx - Individual cell
function GridCell({ value, rowIndex, colIndex, onClick }) {
    return (
        <button 
            className="grid-cell"
            onClick={() => onClick(rowIndex, colIndex)}
        >
            {value === 'X' && <span className="mark-x">X</span>}
            {value === 'O' && <span className="mark-o">O</span>}
        </button>
    );
}
```

**Styling (Tailwind):**
```css
.grid-cell {
    width: 50px;
    height: 50px;
    border: 2px solid #ccc;
    font-size: 24px;
    font-weight: bold;
}

.grid-cell:hover {
    background-color: #f0f0f0;
}

.grid-cell.X {
    color: red;
}

.grid-cell.O {
    color: blue;
}
```

**API Endpoints:**
- `GET /api/v1/rooms/:id` - Get room + current game state
- `POST /api/v1/games` - Save game session after end (Sprint 2)

**Note:** WebSocket real-time sync comes in Sprint 2. For Sprint 1, refresh every time a move is made.

**Estimated Time:** 10-12 hours

---

## 📊 SPRINT 1 TIMELINE

```
Week 1:
M: Phase 1 (Cleanup) ✅
T: Backend Phase 2.1-2.2 (Profile + Game modules)
W: Backend Phase 2.2-2.3 (Game + Room modules)
Th: Backend Phase 2.4-2.5 (Mount routes + error handler)
F: Frontend Phase 3.1-3.2 (AuthStore + Protected Routes)

Week 2:
M: Frontend Phase 3.3-3.4 (Navigation + Profile page)
T: Frontend Phase 3.5 (GameLobby page)
W: Frontend Phase 4 (GameBoard component) START
Th: Frontend Phase 4 (GameBoard component) CONTINUE
F: Integration testing + bug fixes, Demo preparation
```

---

## 🎯 Definition of Done (Sprint 1)

**MVP Features:**
- ✅ User can register with validation
- ✅ User can login with brute-force protection
- ✅ User stays logged in after page refresh (JWT in cookie)
- ✅ Protected routes block unauthorized access
- ✅ Navigation shows different menu based on auth state
- ✅ User can view/edit their profile
- ✅ User can see game history list
- ✅ User can create a game room
- ✅ User can join a waiting game room
- ✅ User can play 10x10 TicTacToe game (basic turn-taking)
- ✅ Game result is saved to database

**Testing Checklist:**
- [ ] Backend: All 5 modules have API tests passing
- [ ] Frontend: User flow end-to-end (Register → Login → Profile → Create Room → Play)
- [ ] Error handling: 404, 401, 400, 500 responses handled gracefully
- [ ] No console errors during gameplay
- [ ] Mobile responsive (at least 80% complete)

---

## 📚 Reference Commands

```bash
# Backend testing
cd server
npm run dev          # Start backend
npm test             # Run tests (when added)

# Frontend development
cd client
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint

# Database seeding (create test data)
mongosh             # Connect to MongoDB
use tictactoang_db
db.users.insertOne({ username: "TestUser", email: "test@example.com", ... })

# API Testing with cURL
curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"test@example.com","password":"TestP@ss1"}'

# Docker (when added)
docker-compose up    # Start server + MongoDB
```

---

## ❓ FAQ for Sprint 1

**Q: What if a module isn't ready by deadline?**  
A: Prioritize Auth, Profile, Game, Room in that order. If short on time, stub rest with 404 errors.

**Q: Should I implement WebSocket in Sprint 1?**  
A: No. Use HTTP refresh polls. Real-time sync is Sprint 2 work.

**Q: What about AI opponent for single-player mode?**  
A: Not in Sprint 1. Focus on multiplayer lobby first.

**Q: Do I need to implement avatar upload for Sprint 1?**  
A: No. Just add the form field, skip file handling. Do it Sprint 2.

**Q: How do I test the backend API without frontend?**  
A: Use Postman/Insomnia collections or cURL commands. See Reference Commands above.

---

## 📞 Support & Escalation

**For Blockers:**
1. Check error logs: `server.log` (if logging added) / console output
2. Check MongoDB connection: `mongosh` → `show collections`
3. Verify .env file exists with all required variables
4. Run linter: `npm run lint` (check for syntax errors)
5. Ping the team in Slack/Discord

---

**Generated:** April 2, 2026  
**Status:** Ready for Sprint 1 Kickoff  
**Review By:** Principal Software Engineer

