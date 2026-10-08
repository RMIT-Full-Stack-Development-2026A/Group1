import { jest } from '@jest/globals';
import { createServer } from 'node:http';
import request from 'supertest';
import { io as connectClient } from 'socket.io-client';
import { initSocketServer } from '../../sockets/index.js';
import { disconnectTimers } from '../../modules/room/socket-handlers/room.socket_handlers.js';
import { RoomService } from '../../modules/room/services/room.service.js';
import { GameRoom } from '../../modules/room/models/gameRoom.model.js';
import { validateRoomUpdateSettings } from '../../modules/room/validators/room.validator.js';
import { generateTestUser } from '../utils/test.utils.js';

let app;
beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    ({ default: app } = await import('../../app.js'));
});

describe('Countries without external network access', () => {
    it('serves a sorted country list and Vietnam flag without fetching a provider', async () => {
        const fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Provider offline'));
        try {
            const response = await request(app).get('/api/v1/countries');
            expect(response.status).toBe(200);
            const names = response.body.data.map((country) => country.name.common);
            expect(names.length).toBeGreaterThan(200);
            expect(new Set(names).size).toBe(names.length);
            expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
            expect(names).toContain('Vietnam');

            const flag = await request(app).get('/api/v1/countries/%20vIeTnAm%20/flag');
            expect(flag.status).toBe(200);
            expect(flag.body.data).toMatchObject({ flagAlt: 'Vietnam', flag: expect.stringContaining('/vn.') });
            expect(fetchSpy).not.toHaveBeenCalled();
        } finally {
            fetchSpy.mockRestore();
        }
    });
});

describe('Independent player marker settings', () => {
    let host, guest, roomId;
    beforeEach(async () => {
        host = await generateTestUser({ username: 'host_player', email: 'host@example.com' });
        guest = await generateTestUser({ username: 'guest_player', email: 'guest@example.com' });
        const created = await RoomService.handleRoomCreate(host.user.id, {
            boardSize: 10, marker: 'X', boardStyle: 'DARK', markerStyle: 'PIXEL',
        });
        roomId = created.room.id;
        await RoomService.handleRoomJoin(guest.user.id, { roomId, markerStyle: 'GLOW' });
        await GameRoom.updateOne({ _id: roomId }, { $set: { 'participants.$[].isReady': true } });
    });

    it.each([0, 1])('lets player %i change only their own icon without unreadying the opponent', async (index) => {
        const player = index === 0 ? host : guest;
        const result = await RoomService.handleUpdateSettings(player.user.id, { roomId, markerStyle: 'STONE' });
        expect(result.room.boardStyle).toBe('DARK');
        expect(result.room.participants[index]).toMatchObject({ markerStyle: 'STONE', isReady: false });
        expect(result.room.participants[1 - index]).toMatchObject({
            markerStyle: index === 0 ? 'GLOW' : 'PIXEL', isReady: true,
        });
    });

    it('keeps marker choices when the host changes the board and resets both ready states', async () => {
        const result = await RoomService.handleUpdateSettings(host.user.id, { roomId, boardStyle: 'LAVA' });
        expect(result.room.boardStyle).toBe('LAVA');
        expect(result.room.participants.map((p) => p.markerStyle)).toEqual(['PIXEL', 'GLOW']);
        expect(result.room.participants.every((p) => !p.isReady)).toBe(true);
    });

    it('does not change settings or ready state for an empty update', async () => {
        const result = await RoomService.handleUpdateSettings(host.user.id, { roomId });
        expect(result.room.boardStyle).toBe('DARK');
        expect(result.room.participants.map((p) => p.markerStyle)).toEqual(['PIXEL', 'GLOW']);
        expect(result.room.participants.every((p) => p.isReady)).toBe(true);
    });

    it.each(['boardStyle', 'markerStyle', 'marker'])('rejects malformed %s values instead of silently defaulting', (field) => {
        for (const value of [null, 42, {}, 'invalid']) {
            expect(() => validateRoomUpdateSettings({ roomId, [field]: value })).toThrow();
        }
    });
});

// Attach listeners before emitting, and fail immediately on server errors.
const nextEvent = (socket, event) => new Promise((resolve, reject) => {
    const cleanup = () => {
        clearTimeout(timer);
        socket.off(event, success);
        socket.off('error', failure);
        socket.off('connect_error', failure);
    };
    const success = (payload) => { cleanup(); resolve(payload); };
    const failure = (error) => { cleanup(); reject(new Error(error.message || JSON.stringify(error))); };
    const timer = setTimeout(() => failure(new Error(`Timed out waiting for ${event}`)), 4000);
    socket.once(event, success);
    socket.once('error', failure);
    socket.once('connect_error', failure);
});

describe('Real Socket.IO room lifecycle', () => {
    let io, address, clients;
    beforeAll(async () => {
        const server = createServer(app);
        io = initSocketServer(server);
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
        address = `http://127.0.0.1:${server.address().port}/ws/game`;
    });
    beforeEach(() => { clients = []; });
    afterEach(() => {
        // Tear down without creating disconnect timers against the next fixture.
        for (const socket of io.of('/ws/game').sockets.values()) socket.removeAllListeners('disconnect');
        for (const client of clients) client.disconnect();
        for (const timer of disconnectTimers.values()) clearTimeout(timer);
        disconnectTimers.clear();
    });
    afterAll(async () => { await new Promise((resolve) => io.close(resolve)); });

    const connect = async (auth) => {
        const client = connectClient(address, {
            extraHeaders: { Cookie: auth.cookie },
            transports: ['websocket'], forceNew: true, reconnection: false, autoConnect: false,
        });
        clients.push(client);
        const connected = nextEvent(client, 'connect');
        client.connect();
        await connected;
        return client;
    };
    const createRoom = async (host) => {
        const created = nextEvent(host, 'room:created');
        host.emit('room:create', { boardSize: 10, marker: 'X', boardStyle: 'DARK', markerStyle: 'PIXEL' });
        return (await created).room;
    };

    it('notifies a lobby observer when the final player leaves and removes the room from the API', async () => {
        const hostAuth = await generateTestUser();
        const observerAuth = await generateTestUser();
        const host = await connect(hostAuth);
        const observer = await connect(observerAuth);
        const privateUpdate = jest.fn();
        observer.on('room:updated', privateUpdate);
        const createdNotice = nextEvent(observer, 'lobby:rooms_changed');
        const room = await createRoom(host);
        await createdNotice;
        let listing = await request(app).get('/api/v1/rooms').set('Cookie', observerAuth.cookie);
        expect(listing.body.data.items.map((r) => r.id)).toContain(room.id);

        const removedNotice = nextEvent(observer, 'lobby:rooms_changed');
        host.emit('room:leave', { roomId: room.id });
        await removedNotice;
        listing = await request(app).get('/api/v1/rooms').set('Cookie', observerAuth.cookie);
        expect(listing.body.data.items).toHaveLength(0);
        expect(privateUpdate).not.toHaveBeenCalled();
    });

    it('returns current WAITING and READY states when an existing player joins again', async () => {
        const hostAuth = await generateTestUser();
        const guestAuth = await generateTestUser();
        const host = await connect(hostAuth);
        const guest = await connect(guestAuth);
        const room = await createRoom(host);
        let updated = nextEvent(host, 'room:updated');
        host.emit('room:join', { roomId: room.id });
        expect((await updated).room.status).toBe('WAITING');

        updated = nextEvent(guest, 'room:updated');
        guest.emit('room:join', { roomId: room.id });
        expect((await updated).room.participants).toHaveLength(2);
        updated = nextEvent(guest, 'room:updated');
        guest.emit('room:join', { roomId: room.id });
        const rejoined = (await updated).room;
        expect(rejoined.status).toBe('READY');
        expect(rejoined.participants).toHaveLength(2);
    });

    it('keeps the opponent ready and connected when a player changes marker or profile', async () => {
        const hostAuth = await generateTestUser();
        const guestAuth = await generateTestUser();
        const host = await connect(hostAuth);
        const guest = await connect(guestAuth);
        const room = await createRoom(host);
        let updated = nextEvent(guest, 'room:updated');
        guest.emit('room:join', { roomId: room.id });
        await updated;
        updated = nextEvent(guest, 'room:updated');
        host.emit('room:ready', { roomId: room.id });
        expect((await updated).room.participants[0].isReady).toBe(true);

        const hostEvents = [];
        const disconnects = jest.fn();
        host.on('room:updated', (p) => hostEvents.push(p.room));
        host.on('disconnect', disconnects);
        guest.on('disconnect', disconnects);

        // The guest changes marker: only the guest's own state may change.
        updated = nextEvent(host, 'room:updated');
        guest.emit('room:update_settings', { roomId: room.id, markerStyle: 'STONE' });
        let after = (await updated).room;
        expect(after.participants[0]).toMatchObject({ isReady: true, markerStyle: 'PIXEL' });
        expect(after.participants[1]).toMatchObject({ isReady: false, markerStyle: 'STONE' });

        // The guest changes profile data over REST while in the room: no socket event, nothing unreadied.
        const profile = await request(app).put('/api/v1/profile/update').set('Cookie', guestAuth.cookie).send({ country: 'US' });
        expect(profile.status).toBe(200);
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(hostEvents).toHaveLength(1);
        expect(disconnects).not.toHaveBeenCalled();
        const stored = await GameRoom.findById(room.id);
        expect(stored.participants[0].isReady).toBe(true);

        // The host's ready survived all of that: the guest readying again is enough to start the match.
        const started = nextEvent(host, 'game:start');
        guest.emit('room:ready', { roomId: room.id });
        await started;
        expect((await GameRoom.findById(room.id)).status).toBe('PLAYING');
    });

    it('restores the board and cancels the grace timer after an in-game reconnect', async () => {
        const hostAuth = await generateTestUser();
        const guestAuth = await generateTestUser();
        const host = await connect(hostAuth);
        const guest = await connect(guestAuth);
        const room = await createRoom(host);
        let updated = nextEvent(guest, 'room:updated');
        guest.emit('room:join', { roomId: room.id });
        await updated;
        updated = nextEvent(host, 'room:updated');
        host.emit('room:ready', { roomId: room.id });
        await updated;
        const started = nextEvent(host, 'game:start');
        guest.emit('room:ready', { roomId: room.id });
        await started;
        const moved = nextEvent(guest, 'game:state');
        host.emit('game:move', { roomId: room.id, row: 0, col: 0 });
        expect((await moved).moveCount).toBe(1);

        const disconnected = nextEvent(guest, 'player:disconnected');
        host.disconnect();
        await disconnected;
        expect(disconnectTimers.has(hostAuth.user.id)).toBe(true);
        const reconnectedHost = await connect(hostAuth);
        const restored = nextEvent(reconnectedHost, 'game:state');
        const opponentNotified = nextEvent(guest, 'player:reconnected');
        reconnectedHost.emit('room:join', { roomId: room.id });
        const state = await restored;
        await opponentNotified;
        expect(state).toMatchObject({ status: 'PLAYING', moveCount: 1 });
        expect(state.board[0]).toMatchObject({ row: 0, col: 0 });
        expect(disconnectTimers.has(hostAuth.user.id)).toBe(false);
    });
});
