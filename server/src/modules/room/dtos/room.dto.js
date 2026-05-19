// DTO helpers for room snapshots, auth bootstrap summaries, and socket payloads.
const toParticipant = (participant) => ({
    userId: participant.userId,
    usernameSnapshot: participant.usernameSnapshot,
    avatar: participant.avatarSnapshot ?? null,
    isPremium: participant.isPremiumSnapshot ?? false,
    mark: participant.mark ?? null,
    markerStyle: participant.markerStyle ?? 'CLASSIC',
    joinedAt: participant.joinedAt ?? null,
    isHost: participant.isHost ?? false,
    isReady: participant.isReady ?? false
});

const toMove = (move) => ({
    moveNumber: move.moveNumber,
    byParticipantIndex: move.byParticipantIndex,
    row: move.row,
    col: move.col,
    coordinate: move.coordinate,
    placedAt: move.placedAt
});

const toWinningCell = (cell) => ({
    row: cell.row,
    col: cell.col,
    coordinate: cell.coordinate
});

export const RoomDTO = {
    // Minimal shape used by auth check-auth bootstrap.
    toActiveRoomSummary: (room) => ({
        id: String(room.id || room._id),
        roomNumber: room.roomNumber,
        boardSize: room.boardSize,
        boardStyle: room.boardStyle ?? 'CLASSIC',
        status: room.status,
        participants: Array.isArray(room.participants) ? room.participants.map(toParticipant) : [],
        moveCount: room.moveCount ?? 0,
        startedAt: room.startedAt ?? null,
        endedAt: room.endedAt ?? null,
        lastMove: room.lastMove ?? null,
        createdAt: room.createdAt ?? null
    }),

    // Summary shape used by arena/listing pages.
    toRoomSummary: (room) => ({
        id: String(room.id || room._id),
        roomNumber: room.roomNumber,
        boardSize: room.boardSize,
        boardStyle: room.boardStyle ?? 'CLASSIC',
        status: room.status,
        participants: Array.isArray(room.participants) ? room.participants.map(toParticipant) : [],
        moveCount: room.moveCount ?? 0,
        startedAt: room.startedAt ?? null,
        endedAt: room.endedAt ?? null,
        lastMove: room.lastMove ?? null,
        createdAt: room.createdAt ?? null
    }),

    toRoomListResponse: (rooms, pagination) => ({
        items: Array.isArray(rooms) ? rooms.map((room) => RoomDTO.toRoomSummary(room)) : [],
        total: pagination?.total ?? 0,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 20
    }),

    // Detail shape used by GET /rooms/:id recovery endpoints or admin room details.
    toRoomDetail: (room) => ({
        id: String(room.id || room._id),
        roomNumber: room.roomNumber,
        boardSize: room.boardSize,
        boardStyle: room.boardStyle ?? 'CLASSIC',
        status: room.status,
        participants: Array.isArray(room.participants) ? room.participants.map(toParticipant) : [],
        currentTurnParticipantIndex: room.currentTurnParticipantIndex ?? null,
        moveCount: room.moveCount ?? 0,
        moves: Array.isArray(room.moves) ? room.moves.map(toMove) : [],
        winningLine: Array.isArray(room.winningLine) ? room.winningLine.map(toWinningCell) : [],
        lastMove: room.lastMove ?? null,
        startedAt: room.startedAt ?? null,
        endedAt: room.endedAt ?? null,
        closedBy: room.closedBy ?? null,
        createdAt: room.createdAt
    }),

    toSocketRoomCreated: (room) => ({ room: RoomDTO.toRoomSummary(room) }),
    toSocketRoomUpdated: (room) => ({ room: RoomDTO.toRoomSummary(room) }),
    toSocketRoomRemoved: (roomId) => ({ roomId: String(roomId) }),

    toGameStatePayload: ({ room, board }) => ({
        roomId: String(room.id || room._id),
        board,
        currentTurnParticipantIndex: room.currentTurnParticipantIndex ?? null,
        lastMove: room.lastMove ?? null,
        moveCount: room.moveCount ?? 0,
        status: room.status,
        participants: Array.isArray(room.participants) ? room.participants.map(toParticipant) : [],
        winningLine: Array.isArray(room.winningLine) ? room.winningLine.map(toWinningCell) : []
    }),

    toGameEndedPayload: ({ roomId, winnerParticipantIndex, winningLine, result, endedAt }) => ({
        roomId: String(roomId),
        winnerParticipantIndex: winnerParticipantIndex ?? null,
        winningLine: Array.isArray(winningLine) ? winningLine.map(toWinningCell) : [],
        result,
        endedAt: endedAt ?? null
    }),

    toChatMessagePayload: ({ roomId, sender, message, timestamp }) => ({
        roomId: String(roomId),
        sender,
        message,
        timestamp
    })
};