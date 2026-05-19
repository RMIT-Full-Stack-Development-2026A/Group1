/**
 * Maps participant to DTO.
 * @param {Object} participant - Raw participant data.
 * @returns {Object} Participant payload.
 */
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

/**
 * Maps move to DTO.
 * @param {Object} move - Raw move data.
 * @returns {Object} Move payload.
 */
const toMove = (move) => ({
    moveNumber: move.moveNumber,
    byParticipantIndex: move.byParticipantIndex,
    row: move.row,
    col: move.col,
    coordinate: move.coordinate,
    placedAt: move.placedAt
});

/**
 * Maps cell to DTO.
 * @param {Object} cell - Raw cell data.
 * @returns {Object} Cell payload.
 */
const toWinningCell = (cell) => ({
    row: cell.row,
    col: cell.col,
    coordinate: cell.coordinate
});

export const RoomDTO = {
    /** Maps room to active summary DTO. */
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

    /** Maps room to summary DTO. */
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

    /** Maps rooms to paginated response DTO. */
    toRoomListResponse: (rooms, pagination) => ({
        items: Array.isArray(rooms) ? rooms.map((room) => RoomDTO.toRoomSummary(room)) : [],
        total: pagination?.total ?? 0,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 20
    }),

    /** Maps room to detail DTO. */
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

    /** Maps room to socket created DTO. */
    toSocketRoomCreated: (room) => ({ room: RoomDTO.toRoomSummary(room) }),
    
    /** Maps room to socket updated DTO. */
    toSocketRoomUpdated: (room) => ({ room: RoomDTO.toRoomSummary(room) }),
    
    /** Maps room ID to socket removed DTO. */
    toSocketRoomRemoved: (roomId) => ({ roomId: String(roomId) }),

    /** Maps game state to payload DTO. */
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

    /** Maps ended game to payload DTO. */
    toGameEndedPayload: ({ roomId, winnerParticipantIndex, winningLine, result, endedAt }) => ({
        roomId: String(roomId),
        winnerParticipantIndex: winnerParticipantIndex ?? null,
        winningLine: Array.isArray(winningLine) ? winningLine.map(toWinningCell) : [],
        result,
        endedAt: endedAt ?? null
    }),

    /** Maps room state to update payload DTO. */
    toChatMessagePayload: ({ roomId, sender, message, timestamp }) => ({
        roomId: String(roomId),
        sender,
        message,
        timestamp
    })
};