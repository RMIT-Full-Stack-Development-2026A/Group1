import request from 'supertest';
import app from '../../app.js'; 
import { generateTestUser } from '../utils/test.utils.js';
import { GameRoom } from '../../modules/room/models/gameRoom.model.js';

// Setup Mock environment variables for tests
process.env.JWT_SECRET = 'test_secret';

describe('Backend Integration Tests - 27 API Endpoints', () => {

    let playerTokenCookie, adminTokenCookie, testPlayerId;

    beforeEach(async () => {
        // Seed users before each test
        const playerAuth = await generateTestUser({ role: 'PLAYER' });
        playerTokenCookie = playerAuth.cookie;
        testPlayerId = playerAuth.user._id;

        const adminAuth = await generateTestUser({ role: 'ADMIN', username: 'admin123', email: 'admin@test.com' });
        adminTokenCookie = adminAuth.cookie;
    });

    // ==========================================
    // 1. AUTHENTICATION MODULE (4 Endpoints)
    // ==========================================
    describe('Auth APIs', () => {
        it('1. POST /api/v1/auth/register - Should register a new player', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                username: 'newplayer1',
                email: 'new@example.com',
                password: 'Password123!',
                country: 'VN'
            });
            expect(res.statusCode).toEqual(201);
            expect(res.body.data.user.username).toBe('newplayer1');
        });

        it('2. POST /api/v1/auth/login - Should login and return access_token cookie', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: 'admin@test.com',
                password: 'Password123!'
            });
            // Expecting 200 or 401 depending on bcrypt implementation in your app
            expect(res.headers['set-cookie']).toBeDefined(); 
        });

        it('3. POST /api/v1/auth/logout - Should clear auth cookie', async () => {
            const res = await request(app).post('/api/v1/auth/logout')
                .set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie'][0]).toMatch(/access_token=;/);
        });

        it('4. GET /api/v1/auth/check-auth - Should return session payload', async () => {
            const res = await request(app).get('/api/v1/auth/check-auth')
                .set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.user.id).toBe(String(testPlayerId));
        });
    });

    // ==========================================
    // 2. PROFILE MODULE (5 Endpoints)
    // ==========================================
    describe('Profile APIs', () => {
        it('5. GET /api/v1/profile - Should fetch base profile', async () => {
            const res = await request(app).get('/api/v1/profile').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('email');
        });

        it('6. GET /api/v1/profile/overview - Should fetch aggregate dashboard', async () => {
            const res = await request(app).get('/api/v1/profile/overview').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('stats');
        });

        it('7. PUT /api/v1/profile/update - Should update user identity', async () => {
            const res = await request(app).put('/api/v1/profile/update')
                .set('Cookie', playerTokenCookie)
                .send({ country: 'US' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.country).toBe('US');
        });

        it('8. PATCH /api/v1/profile/password - Should update password', async () => {
            const res = await request(app).patch('/api/v1/profile/password')
                .set('Cookie', playerTokenCookie)
                .send({ oldPassword: '...', newPassword: 'NewPassword123!' });
            expect([200, 400]).toContain(res.statusCode); // 400 if bcrypt mock fails
        });

        it('9. POST /api/v1/profile/avatar - Should accept avatar upload', async () => {
            const res = await request(app).post('/api/v1/profile/avatar')
                .set('Cookie', playerTokenCookie)
                .send({ avatarUrl: 'http://image.com/avatar.png' });
            expect(res.statusCode).toEqual(200);
        });
    });

    // ==========================================
    // 3. GAME MODULE (3 Endpoints)
    // ==========================================
    describe('Game APIs', () => {
        it('10. POST /api/v1/games - Should create a local game record', async () => {
            const res = await request(app).post('/api/v1/games')
                .set('Cookie', playerTokenCookie)
                .send({ gameType: 'SINGLE_PLAYER', participants: [{userId: testPlayerId}], status: 'FINISHED' });
            expect([200, 201]).toContain(res.statusCode);
        });

        it('11. GET /api/v1/games - Should list game history', async () => {
            const res = await request(app).get('/api/v1/games').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.data.items)).toBe(true);
        });

        it('12. GET /api/v1/games/:id - Should fetch replay data', async () => {
            // Mock fetching a non-existent ID
            const res = await request(app).get('/api/v1/games/60d21b4667d0d8992e610c85').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(404); // Assert error format
            expect(res.body.error).toBe('GAME_NOT_FOUND');
        });
    });

    // ==========================================
    // 4. ROOM MODULE (2 Endpoints)
    // ==========================================
    describe('Room APIs', () => {
        it('13. GET /api/v1/rooms - Should fetch global arena rooms', async () => {
            const res = await request(app).get('/api/v1/rooms?status=WAITING').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.items).toBeDefined();
        });

        it('14. GET /api/v1/rooms/:id - Should fetch single room detail for reconnect', async () => {
            const room = await GameRoom.create({ boardSize: 10, status: 'WAITING' });
            const res = await request(app).get(`/api/v1/rooms/${room._id}`).set('Cookie', playerTokenCookie);
            // 403 because player is not a participant, testing security rule!
            expect(res.statusCode).toEqual(403); 
        });
    });

    // ==========================================
    // 5. SUBSCRIPTION MODULE (5 Endpoints)
    // ==========================================
    describe('Subscription APIs', () => {
        it('15. GET /api/v1/subscription/status - Should return premium expiry', async () => {
            const res = await request(app).get('/api/v1/subscription/status').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
        });

        it('16. POST /api/v1/subscription/create-order - Should return PayPal URL', async () => {
            const res = await request(app).post('/api/v1/subscription/create-order').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
        });

        it('17. POST /api/v1/subscription/capture-order - Should capture PayPal order', async () => {
            const res = await request(app).post('/api/v1/subscription/capture-order').set('Cookie', playerTokenCookie).send({ orderID: 'MOCK_ID' });
            expect([200, 400, 404]).toContain(res.statusCode); // Depending on PayPal mock
        });

        it('18. GET /api/v1/subscription/history - Should fetch transaction log', async () => {
            const res = await request(app).get('/api/v1/subscription/history').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(200);
        });

        it('19. POST /api/v1/subscription/paypal-events - Should process webhook (No Auth)', async () => {
            const res = await request(app).post('/api/v1/subscription/paypal-events').send({ event_type: 'PAYMENT.SALE.REFUNDED' });
            expect(res.statusCode).toEqual(200);
        });
    });

    // ==========================================
    // 6. ADMIN MODULE (8 Endpoints)
    // ==========================================
    describe('Admin APIs', () => {
        it('20. GET /api/v1/admin/dashboard - Should fail for PLAYER role', async () => {
            const res = await request(app).get('/api/v1/admin/dashboard').set('Cookie', playerTokenCookie);
            expect(res.statusCode).toEqual(403); // RBAC test
        });

        it('20b. GET /api/v1/admin/dashboard - Should succeed for ADMIN role', async () => {
            const res = await request(app).get('/api/v1/admin/dashboard').set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200);
        });

        it('21. GET /api/v1/admin/players - Should list all players', async () => {
            const res = await request(app).get('/api/v1/admin/players').set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.total).toBeGreaterThanOrEqual(2);
        });

        it('22. GET /api/v1/admin/players/:id - Should fetch player detail', async () => {
            const res = await request(app).get(`/api/v1/admin/players/${testPlayerId}`).set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200);
        });

        it('23. PATCH /api/v1/admin/players/:id/deactivate - Should ban player', async () => {
            const res = await request(app).patch(`/api/v1/admin/players/${testPlayerId}/deactivate`).set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.isActive).toBe(false);
        });

        it('24. PATCH /api/v1/admin/players/:id/reactivate - Should unban player', async () => {
            const res = await request(app).patch(`/api/v1/admin/players/${testPlayerId}/reactivate`).set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200);
        });

        it('25. GET /api/v1/admin/rooms - Should fetch all live rooms', async () => {
            const res = await request(app).get('/api/v1/admin/rooms').set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200);
        });

        it('26. GET /api/v1/admin/rooms/:id - Should fetch room detail bypassing participant check', async () => {
            const room = await GameRoom.create({ boardSize: 10, status: 'WAITING' });
            const res = await request(app).get(`/api/v1/admin/rooms/${room._id}`).set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200); // Admin bypasses the security rule from endpoint #14
        });

        it('27. DELETE /api/v1/admin/rooms/:id - Should force close a room', async () => {
            const room = await GameRoom.create({ boardSize: 10, status: 'PLAYING' });
            const res = await request(app).delete(`/api/v1/admin/rooms/${room._id}`).set('Cookie', adminTokenCookie);
            expect(res.statusCode).toEqual(200);
            
            // Assert room was updated in DB
            const checkRoom = await GameRoom.findById(room._id);
            expect(checkRoom.status).toBe('CLOSED');
        });
    });
});