import { RoomService } from '../../modules/room/services/room.service.js';
import { GameRoom } from '../../modules/room/models/gameRoom.model.js';
import { generateTestUser } from '../utils/test.utils.js';

const startedGame = async () => {
    const host = await generateTestUser();
    const guest = await generateTestUser();
    const created = await RoomService.handleRoomCreate(host.user.id, {
        boardSize: 10, marker: 'X', boardStyle: 'DARK', markerStyle: 'PIXEL',
    });
    const roomId = created.room.id;
    await RoomService.handleRoomJoin(guest.user.id, { roomId, markerStyle: 'GLOW' });
    await RoomService.handleRoomReady(host.user.id, { roomId });
    const ready = await RoomService.handleRoomReady(guest.user.id, { roomId });
    expect(ready.gameStart).toBe(true);
    return { host: host.user.id, guest: guest.user.id, roomId };
};
const move = (userId, roomId, row, col) => RoomService.handleGameMove(userId, { roomId, row, col });
const stored = (roomId) => GameRoom.findById(roomId).lean();

describe('Applying a move (one atomic database operation)', () => {
    it('records the move, advances the count, flips the turn and sets the last move', async () => {
        const { host, roomId } = await startedGame();
        const result = await move(host, roomId, 4, 5);
        expect(result.gameEnded).toBeNull();

        const room = await stored(roomId);
        expect(room.moveCount).toBe(1);
        expect(room.currentTurnParticipantIndex).toBe(1);
        expect(room.lastMove).toMatchObject({ row: 4, col: 5, coordinate: 'F5' });
        expect(room.moves).toHaveLength(1);
        expect(room.moves[0]).toMatchObject({ moveNumber: 1, byParticipantIndex: 0, row: 4, col: 5, coordinate: 'F5' });
        expect(room.moves[0].placedAt).toBeInstanceOf(Date);
    });

    it('numbers moves in order and hands the turn back and forth', async () => {
        const { host, guest, roomId } = await startedGame();
        await move(host, roomId, 0, 0);
        await move(guest, roomId, 1, 1);
        await move(host, roomId, 0, 1);

        const room = await stored(roomId);
        expect(room.moves.map((m) => [m.moveNumber, m.byParticipantIndex])).toEqual([[1, 0], [2, 1], [3, 0]]);
        expect(room.currentTurnParticipantIndex).toBe(1);
    });

    it('rejects a move out of turn', async () => {
        const { guest, roomId } = await startedGame();
        await expect(move(guest, roomId, 0, 0)).rejects.toMatchObject({ statusCode: 403, error: 'NOT_YOUR_TURN' });
        expect((await stored(roomId)).moveCount).toBe(0);
    });

    it('rejects a move from someone who is not in the room', async () => {
        const { roomId } = await startedGame();
        const stranger = await generateTestUser();
        await expect(move(stranger.user.id, roomId, 0, 0)).rejects.toMatchObject({ statusCode: 403, error: 'NOT_YOUR_TURN' });
    });

    it('rejects an occupied cell', async () => {
        const { host, guest, roomId } = await startedGame();
        await move(host, roomId, 4, 4);
        await expect(move(guest, roomId, 4, 4)).rejects.toMatchObject({ statusCode: 400, error: 'INVALID_MOVE' });
        expect((await stored(roomId)).moveCount).toBe(1);
    });

    it('rejects a cell outside the board', async () => {
        const { host, roomId } = await startedGame();
        await expect(move(host, roomId, 10, 0)).rejects.toMatchObject({ statusCode: 400, error: 'INVALID_COORDINATES' });
        await expect(move(host, roomId, 0, 10)).rejects.toMatchObject({ statusCode: 400, error: 'INVALID_COORDINATES' });
        expect((await stored(roomId)).moveCount).toBe(0);
    });

    it('rejects a move before the match has started', async () => {
        const host = await generateTestUser();
        const created = await RoomService.handleRoomCreate(host.user.id, { boardSize: 10, marker: 'X', boardStyle: 'DARK' });
        await expect(move(host.user.id, created.room.id, 0, 0)).rejects.toMatchObject({ statusCode: 400, error: 'INVALID_ROOM_STATE' });
    });

    it('lets only one of two simultaneous moves from the same player through', async () => {
        const { host, roomId } = await startedGame();
        const results = await Promise.allSettled([move(host, roomId, 0, 0), move(host, roomId, 0, 1)]);

        expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
        const rejected = results.find((r) => r.status === 'rejected');
        expect(rejected.reason).toMatchObject({ statusCode: 403, error: 'NOT_YOUR_TURN' });
        const room = await stored(roomId);
        expect(room.moves).toHaveLength(1);
        expect(room.moveCount).toBe(1);
    });

    it('still detects a win, records the match and resets the room for a rematch', async () => {
        const { host, guest, roomId } = await startedGame();
        let last;
        for (let i = 0; i < 5; i++) {
            last = await move(host, roomId, 0, i);
            if (i < 4) await move(guest, roomId, 1, i);
        }
        expect(last.gameEnded).toMatchObject({ result: 'WIN', winnerParticipantIndex: 0, winnerUserId: String(host) });
        expect(last.gameEnded.winningLine).toHaveLength(5);

        const room = await stored(roomId);
        expect(room.status).toBe('READY');
        expect(room.moves).toHaveLength(0);
        expect(room.moveCount).toBe(0);
    });
});
