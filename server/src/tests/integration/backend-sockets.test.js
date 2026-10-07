import { jest } from '@jest/globals';
import { createServer } from 'node:http';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { io as connectClient } from 'socket.io-client';
import { initSocketServer } from '../../sockets/index.js';
import { User } from '../../modules/auth/models/user.model.js';
import { AuthService } from '../../modules/auth/services/auth.service.js';
import { RoomService } from '../../modules/room/services/room.service.js';
import { GameRoom } from '../../modules/room/models/gameRoom.model.js';
import { disconnectTimers } from '../../modules/room/socket-handlers/room.socket_handlers.js';
import { generateTestUser } from '../utils/test.utils.js';

let app;
beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    ({ default: app } = await import('../../app.js'));
});

const event = (socket, name) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.off(name, done); reject(new Error(`Timed out waiting for ${name}`)); }, 4000);
    const done = (data) => { clearTimeout(timer); resolve(data); };
    socket.once(name, done);
});

describe('Backend room rules and concurrent commands', () => {
    let host, guest, roomId;
    beforeEach(async () => {
        host = await generateTestUser();
        guest = await generateTestUser();
        const created = await RoomService.handleRoomCreate(host.user.id, { boardSize: 10, marker: 'X' });
        roomId = created.room.id;
        await RoomService.handleRoomJoin(guest.user.id, { roomId });
    });
    const start = async () => {
        await RoomService.handleRoomReady(host.user.id, { roomId });
        await RoomService.handleRoomReady(guest.user.id, { roomId });
    };

    it('allows non-premium participants to chat but blocks outsiders even if premium', async () => {
        const message = await RoomService.handleChatSend(host.user.id, { roomId, message: ' hello ' });
        expect(message.message).toBe('hello');
        const outsider = await generateTestUser({ premiumExpiresAt: new Date(Date.now() + 60_000) });
        await expect(RoomService.handleChatSend(outsider.user.id, { roomId, message: 'intrusion' }))
            .rejects.toMatchObject({ statusCode: 403, error: 'FORBIDDEN' });
        await GameRoom.updateOne({ _id: roomId }, { $set: { status: 'CLOSED' } });
        await expect(RoomService.handleChatSend(host.user.id, { roomId, message: 'hello' }))
            .rejects.toMatchObject({ error: 'INVALID_STATE' });
    });

    it('does not let outsiders ready another player’s room', async () => {
        const outsider = await generateTestUser();
        await expect(RoomService.handleRoomReady(outsider.user.id, { roomId })).rejects.toMatchObject({ statusCode: 403 });
        expect((await GameRoom.findById(roomId)).participants.every(p => !p.isReady)).toBe(true);
    });

    it('starts exactly once when both players ready simultaneously', async () => {
        const results = await Promise.all([
            RoomService.handleRoomReady(host.user.id, { roomId }),
            RoomService.handleRoomReady(guest.user.id, { roomId })
        ]);
        expect(results.filter(r => r.gameStart)).toHaveLength(1);
        const room = await GameRoom.findById(roomId);
        expect(room.status).toBe('PLAYING');
        expect(room.participants.every(p => p.isReady)).toBe(true);
    });

    it('resets both ready flags when the host changes first turn, then rejects changes during play', async () => {
        await GameRoom.updateOne({ _id: roomId }, { $set: { 'participants.$[].isReady': true } });
        const result = await RoomService.handleSetFirstTurn(host.user.id, { roomId, firstTurnParticipantIndex: 1 });
        expect(result.room.participants.every(p => !p.isReady)).toBe(true);
        await start();
        expect((await GameRoom.findById(roomId)).currentTurnParticipantIndex).toBe(1);
        await expect(RoomService.handleSetFirstTurn(host.user.id, { roomId, firstTurnParticipantIndex: 0 }))
            .rejects.toMatchObject({ error: 'INVALID_STATE' });
    });

    it.each([10, 15, -1, 0.5, '1junk', null, true])('rejects out-of-board or malformed row %j without changing the game', async row => {
        await start();
        await expect(RoomService.handleGameMove(host.user.id, { roomId, row, col: 0 }))
            .rejects.toMatchObject({ statusCode: 400, error: 'INVALID_COORDINATES' });
        expect((await GameRoom.findById(roomId)).moveCount).toBe(0);
    });

    it('accepts only one move when the same player submits two concurrently', async () => {
        await start();
        const results = await Promise.allSettled([0, 1].map(col => RoomService.handleGameMove(host.user.id, { roomId, row: 0, col })));
        expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
        const room = await GameRoom.findById(roomId);
        expect(room.moveCount).toBe(1);
        expect(room.moves).toHaveLength(1);
        expect(room.currentTurnParticipantIndex).toBe(1);
    });

    it('requires leaving the current room before joining another', async () => {
        const outsider = await generateTestUser();
        const otherRoom = await RoomService.handleRoomCreate(outsider.user.id, { boardSize: 10, marker: 'O' });
        await expect(RoomService.handleRoomJoin(host.user.id, { roomId: otherRoom.room.id }))
            .rejects.toMatchObject({ error: 'ALREADY_IN_ROOM' });
    });
});

describe('Socket session lifecycle and chat delivery', () => {
    let io, address, clients;
    beforeAll(async () => {
        const server = createServer(app);
        io = initSocketServer(server);
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        address = `http://127.0.0.1:${server.address().port}/ws/game`;
    });
    beforeEach(() => { clients = []; });
    afterEach(() => {
        for (const socket of io.of('/ws/game').sockets.values()) socket.removeAllListeners('disconnect');
        for (const client of clients) client.disconnect();
        for (const timer of disconnectTimers.values()) clearTimeout(timer);
        disconnectTimers.clear();
    });
    afterAll(async () => { await new Promise(resolve => io.close(resolve)); });

    const connect = async (cookie, expectFailure = false) => {
        const client = connectClient(address, {
            extraHeaders: { Cookie: cookie }, transports: ['websocket'],
            forceNew: true, reconnection: false, autoConnect: false
        });
        clients.push(client);
        const connected = event(client, expectFailure ? 'connect_error' : 'connect');
        client.connect();
        const result = await connected;
        return expectFailure ? result : client;
    };

    it('rejects revoked and expired tokens at the socket handshake', async () => {
        const auth = await generateTestUser();
        await request(app).post('/api/v1/auth/logout').set('Cookie', auth.cookie);
        expect((await connect(auth.cookie, true)).data.code).toBe(401);
        const expired = jwt.sign({ userId: auth.user.id }, process.env.JWT_SECRET, { expiresIn: -1 });
        expect((await connect(`access_token=${expired}`, true)).data.code).toBe(401);
    });

    it('disconnects an already connected socket when its HTTP session logs out', async () => {
        const auth = await generateTestUser();
        const client = await connect(auth.cookie);
        const loggedOut = event(client, 'auth:force_logout');
        const disconnected = event(client, 'disconnect');
        expect((await request(app).post('/api/v1/auth/logout').set('Cookie', auth.cookie)).status).toBe(200);
        const forced = await loggedOut;
        expect(forced.reason).toContain('logged out');
        expect(forced.code).toBe('LOGGED_OUT');
        await disconnected;
        expect(client.connected).toBe(false);
    });

    it('replaces an old socket session on login while allowing the new token to connect', async () => {
        const auth = await generateTestUser();
        const client = await connect(auth.cookie);
        const disconnected = event(client, 'disconnect');
        const response = await request(app).post('/api/v1/auth/login').send({ identifier: auth.user.email, password: auth.plainTextPassword });
        expect(response.status).toBe(200);
        const newer = await connect(response.headers['set-cookie'][0].split(';')[0]);
        await disconnected;
        expect(newer.connected).toBe(true);
    });

    it('revokes socket sessions on password change', async () => {
        const auth = await generateTestUser();
        const client = await connect(auth.cookie);
        const disconnected = event(client, 'disconnect');
        await AuthService.changePassword(auth.user.id, auth.plainTextPassword, 'NewPassword123!');
        await disconnected;
        expect(client.connected).toBe(false);
    });

    it('checks session validity again before accepting socket events', async () => {
        const auth = await generateTestUser();
        const client = await connect(auth.cookie);
        // Simulate revocation by another server instance: no local event-bus notification.
        await User.updateOne({ _id: auth.user.id }, { $inc: { 'auth.tokenVersion': 1 } });
        const disconnected = event(client, 'disconnect');
        client.emit('room:create', { boardSize: 10, marker: 'X' });
        await disconnected;
        expect(await GameRoom.countDocuments()).toBe(0);
    });

    it('disconnects an idle socket when its token expires', async () => {
        const auth = await generateTestUser();
        const token = jwt.sign({ userId: auth.user.id }, process.env.JWT_SECRET, { expiresIn: 2 });
        const client = await connect(`access_token=${token}`);
        const loggedOut = event(client, 'auth:force_logout');
        const disconnected = event(client, 'disconnect');
        expect((await loggedOut).reason).toContain('expired');
        await disconnected;
    });

    it('delivers ordinary-player chat to the opponent and rejects an outsider', async () => {
        const host = await generateTestUser(), guest = await generateTestUser(), outsider = await generateTestUser();
        const roomId = (await RoomService.handleRoomCreate(host.user.id, { boardSize: 10, marker: 'X' })).room.id;
        await RoomService.handleRoomJoin(guest.user.id, { roomId });
        const hostClient = await connect(host.cookie), guestClient = await connect(guest.cookie), outsiderClient = await connect(outsider.cookie);
        for (const client of [hostClient, guestClient]) {
            const joined = event(client, 'room:updated');
            client.emit('room:join', { roomId });
            await joined;
        }
        const received = event(guestClient, 'chat:message');
        hostClient.emit('chat:send', { roomId, message: 'hello from a regular player' });
        expect((await received).message).toBe('hello from a regular player');
        const denied = event(outsiderClient, 'error');
        const leakedMessage = jest.fn();
        guestClient.on('chat:message', leakedMessage);
        outsiderClient.emit('chat:send', { roomId, message: 'intrusion' });
        expect((await denied).error).toBe('FORBIDDEN');
        expect(leakedMessage).not.toHaveBeenCalled();
    });
});
