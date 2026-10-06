import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { User } from '../../modules/auth/models/user.model.js';
import { AuthRepository } from '../../modules/auth/repositories/auth.repository.js';
import { AuthService } from '../../modules/auth/services/auth.service.js';
import { GameSession } from '../../modules/game/models/gameSession.model.js';
import { Transaction } from '../../modules/subscription/models/transaction.model.js';
import { SubscriptionService } from '../../modules/subscription/services/subscription.service.js';
import { generateTestUser } from '../utils/test.utils.js';

let app;
beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    ({ default: app } = await import('../../app.js'));
});

const login = (auth, password = auth.plainTextPassword) => request(app).post('/api/v1/auth/login')
    .send({ identifier: auth.user.email, password });
const sessionCookie = (response) => response.headers['set-cookie'][0].split(';')[0];
const profile = (cookie) => request(app).get('/api/v1/profile').set('Cookie', cookie);

describe('Revocable sessions and login lockout', () => {
    let auth;
    beforeEach(async () => { auth = await generateTestUser(); });

    it('rejects a copied token after logout, including tokens issued before session versioning', async () => {
        expect((await profile(auth.cookie)).status).toBe(200);
        expect((await request(app).post('/api/v1/auth/logout').set('Cookie', auth.cookie)).status).toBe(200);
        expect((await profile(auth.cookie)).status).toBe(401);
    });

    it('invalidates earlier logins and does not let a delayed logout revoke the newer one', async () => {
        const first = await login(auth);
        const second = await login(auth);
        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        const firstCookie = sessionCookie(first), secondCookie = sessionCookie(second);
        expect(firstCookie).not.toBe(secondCookie);
        expect((await profile(firstCookie)).status).toBe(401);
        const clearCookie = jest.fn();
        await AuthService.logoutUser({ clearCookie }, { id: auth.user.id, tokenVersion: 1 });
        expect((await profile(secondCookie)).status).toBe(200);
    });

    it('revokes existing tokens after changing the password', async () => {
        const changed = await request(app).patch('/api/v1/profile/password').set('Cookie', auth.cookie)
            .send({ oldPassword: auth.plainTextPassword, newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });
        expect(changed.status).toBe(200);
        expect((await profile(auth.cookie)).status).toBe(401);
        expect((await login(auth, 'NewPassword123!')).status).toBe(200);
    });

    it('keeps old sessions revoked after an account is reactivated', async () => {
        await AuthService.setAccountStatus(auth.user.id, false);
        expect((await profile(auth.cookie)).status).toBe(401);
        await AuthService.setAccountStatus(auth.user.id, true);
        expect((await profile(auth.cookie)).status).toBe(401);
        expect((await login(auth)).status).toBe(200);
    });

    it('uses the current database role, not stale admin claims in a signed JWT', async () => {
        const token = jwt.sign({ userId: auth.user.id, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const response = await request(app).get('/api/v1/admin/dashboard').set('Cookie', `access_token=${token}`);
        expect(response.status).toBe(403);
    });

    it.each(['expired', 'deleted', 'inactive'])('rejects an %s session', async (state) => {
        let cookie = auth.cookie;
        if (state === 'expired') cookie = `access_token=${jwt.sign({ userId: auth.user.id }, process.env.JWT_SECRET, { expiresIn: -1 })}`;
        if (state === 'deleted') await User.deleteOne({ _id: auth.user.id });
        if (state === 'inactive') await User.updateOne({ _id: auth.user.id }, { $set: { isActive: false } });
        expect((await profile(cookie)).status).toBe(state === 'inactive' ? 403 : 401);
    });

    it('locks on the fifth failed login, rejects the correct password while locked, then recovers', async () => {
        for (let attempt = 1; attempt <= 5; attempt++) {
            const response = await login(auth, 'WrongPassword123!');
            expect(response.status).toBe(attempt < 5 ? 401 : 403);
            if (attempt === 5) expect(response.body.error).toBe('ACCOUNT_LOCKED');
        }
        expect((await login(auth)).body.error).toBe('ACCOUNT_LOCKED');
        await User.updateOne({ _id: auth.user.id }, { $set: {
            'auth.lockUntil': new Date(Date.now() - 1), 'auth.loginWindowStartedAt': new Date(Date.now() - 120_000)
        } });
        expect((await login(auth, 'WrongPassword123!')).status).toBe(401);
        expect((await login(auth)).status).toBe(200);
    });

    it('counts concurrent failures atomically instead of using stale loaded counters', async () => {
        await Promise.all(Array.from({ length: 5 }, () => AuthRepository.incrementLoginAttempts(auth.user)));
        const user = await User.findById(auth.user.id).select('+auth.loginAttempts +auth.lockUntil');
        expect(user.auth.loginAttempts).toBe(5);
        expect(user.auth.lockUntil.getTime()).toBeGreaterThan(Date.now());
    });
});

describe('History search, dates, results, and replay permissions', () => {
    let auth, sessions;
    beforeEach(async () => {
        auth = await generateTestUser({ username: 'history_player' });
        const participants = [
            { userId: auth.user.id, usernameSnapshot: 'history_player', role: 'HUMAN', mark: 'X', markerStyle: 'CLASSIC' },
            { userId: new mongoose.Types.ObjectId(), usernameSnapshot: 'Rival[1]', role: 'HUMAN', mark: 'O', markerStyle: 'PIXEL' }
        ];
        const fixtures = [
            ['before', '2026-05-21T23:59:59.999Z', 'FINISHED', 0],
            ['start', '2026-05-22T00:00:00.000Z', 'FINISHED', 0],
            ['late', '2026-05-22T23:59:59.999Z', 'FINISHED', 1],
            ['after', '2026-05-23T00:00:00.000Z', 'DRAW', null],
            ['abort', '2026-05-22T12:00:00.000Z', 'ABORTED', null],
            ['second', '2026-05-22T10:00:00.000Z', 'FINISHED', 1]
        ];
        sessions = await GameSession.create(fixtures.map(([name, endedAt, status, winner]) => ({
            sessionNumber: `GS-${name}`, gameType: 'ONLINE_MATCH', boardSize: 10,
            participants: name === 'second' ? [...participants].reverse() : participants,
            firstTurnParticipantIndex: 0, winnerParticipantIndex: winner, status,
            endedReason: status === 'FINISHED' ? 'WIN' : status === 'ABORTED' ? 'ABORT' : 'DRAW',
            startedAt: new Date(new Date(endedAt).getTime() - 60_000), endedAt,
            moves: [{ moveNumber: 1, byParticipantIndex: 0, row: 0, col: 0, coordinate: 'A1', placedAt: new Date(endedAt) }]
        })));
    });

    const history = (cookie, query = {}) => request(app).get('/api/v1/games').set('Cookie', cookie).query(query);
    const names = (response) => response.body.data.items.map(s => s.sessionNumber);

    it('includes both boundaries and the entire final date, then honors ascending sort', async () => {
        const response = await history(auth.cookie, { from: '2026-05-22', to: '2026-05-22', sortBy: 'endedAt', sortOrder: 'asc' });
        expect(response.status).toBe(200);
        expect(names(response)).toEqual(['GS-start', 'GS-second', 'GS-abort', 'GS-late']);
        expect(response.body.data.items[0]).not.toHaveProperty('moves');
    });

    it('preserves explicit timezone offsets from the client', async () => {
        const response = await history(auth.cookie, { from: '2026-05-22T00:00:00+07:00', to: '2026-05-22T23:59:59.999+07:00', sortOrder: 'asc' });
        expect(names(response)).toEqual(['GS-before', 'GS-start', 'GS-second', 'GS-abort']);
    });

    it.each([
        { from: 'nonsense' }, { to: '2026-02-30' }, { from: '2026-05-23', to: '2026-05-22' }
    ])('rejects invalid date range %j with 400', async (query) => {
        const response = await history(auth.cookie, query);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('INVALID_DATE_RANGE');
    });

    it.each([
        ['WIN', ['GS-second', 'GS-start', 'GS-before']],
        ['LOSE', ['GS-late']], ['LOSS', ['GS-late']],
        ['ABORTED', ['GS-abort']], ['ABORT', ['GS-abort']], ['DRAW', ['GS-after']]
    ])('filters %s relative to the requesting player, including participant index 1', async (result, expected) => {
        const response = await history(auth.cookie, { result });
        expect(response.status).toBe(200);
        expect(names(response)).toEqual(expected);
    });

    it('searches literal case-insensitive opponent and session substrings without regex injection', async () => {
        expect((await history(auth.cookie, { q: 'vAl[1]' })).body.data.total).toBe(6);
        expect(names(await history(auth.cookie, { q: 'GS-LAT' }))).toEqual(['GS-late']);
        expect((await history(auth.cookie, { q: 'history_player' })).body.data.total).toBe(0);
        const regex = await history(auth.cookie, { q: '.*[' });
        expect(regex.status).toBe(200);
        expect(regex.body.data.total).toBe(0);
    });

    it('keeps history free but requires current premium for replaying your own games', async () => {
        const replay = () => request(app).get(`/api/v1/games/${sessions[0].id}`).set('Cookie', auth.cookie);
        expect((await replay()).body.error).toBe('PREMIUM_REQUIRED');
        await User.updateOne({ _id: auth.user.id }, { $set: { premiumExpiresAt: new Date(Date.now() + 60_000) } });
        const response = await replay();
        expect(response.status).toBe(200);
        expect(response.body.data.moves).toHaveLength(1);
        await User.updateOne({ _id: auth.user.id }, { $set: { premiumExpiresAt: new Date(Date.now() - 1) } });
        expect((await replay()).status).toBe(403);
        expect((await history(auth.cookie)).status).toBe(200);
    });

    it('does not allow a premium stranger to read another player’s replay', async () => {
        const stranger = await generateTestUser({ premiumExpiresAt: new Date(Date.now() + 60_000) });
        const response = await request(app).get(`/api/v1/games/${sessions[0].id}`).set('Cookie', stranger.cookie);
        expect(response.status).toBe(403);
        expect(response.body.error).toBe('FORBIDDEN');
    });

    it('passes admin date/search/sort filters through to history', async () => {
        const admin = await generateTestUser({ role: 'ADMIN' });
        const response = await request(app).get('/api/v1/admin/players/games').set('Cookie', admin.cookie)
            .query({ from: '2026-05-22', to: '2026-05-22', q: 'GS-', sortOrder: 'asc' });
        expect(response.status).toBe(200);
        expect(names(response)).toEqual(['GS-start', 'GS-second', 'GS-abort', 'GS-late']);
    });
});

describe('Admin player filters and preserved subscription history', () => {
    it('includes never-premium and expired players in the non-premium filter', async () => {
        const admin = await generateTestUser({ role: 'ADMIN' });
        const regular = await generateTestUser({ username: 'regular_player', 'auth': { lastLoginAt: new Date('2026-05-20') } });
        const expired = await generateTestUser({ username: 'expired_player', premiumExpiresAt: new Date(Date.now() - 1), 'auth': { lastLoginAt: new Date('2026-05-22') } });
        await generateTestUser({ premiumExpiresAt: new Date(Date.now() + 60_000) });
        const response = await request(app).get('/api/v1/admin/players').set('Cookie', admin.cookie)
            .query({ premium: 'false', q: '_player', sortBy: 'lastLoginAt', sortOrder: 'desc' });
        expect(response.status).toBe(200);
        expect(response.body.data.items.map(u => u.id)).toEqual([expired.user.id, regular.user.id]);
    });

    it('retains separate records for multiple purchases by the same user', async () => {
        const auth = await generateTestUser();
        await Transaction.create(['ORDER-1', 'ORDER-2'].map(orderId => ({
            userId: auth.user.id, type: 'SUBSCRIPTION', provider: 'PAYPAL', amount: 5, currency: 'USD', status: 'SUCCESS', orderId
        })));
        const history = await SubscriptionService.getHistory(auth.user.id, 1, 20);
        expect(history.total).toBe(2);
        expect(await Transaction.countDocuments({ userId: auth.user.id })).toBe(2);
    });
});
