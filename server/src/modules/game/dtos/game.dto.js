/**
 * Maps participant to DTO.
 * @param {Object} participant - Raw participant data.
 * @returns {Object} Participant payload.
 */
const toParticipant = (participant) => ({
    userId: participant.userId ?? null,
    usernameSnapshot: participant.usernameSnapshot,
    avatarSnapshot: participant.avatarSnapshot ?? null,
    isPremium: participant.isPremiumSnapshot ?? false,
    role: participant.role,
    mark: participant.mark,
    markerStyle: participant.markerStyle,
    aiDifficulty: participant.aiDifficulty ?? null
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

/**
 * Derives match result for the viewing user.
 * @param {Object} session - Game session data.
 * @param {string} viewerUserId - User ID.
 * @returns {string} Result status.
 */
const deriveViewerResult = (session, viewerUserId) => {
    const viewerId = String(viewerUserId || "");
    const participantIndex = Array.isArray(session.participants)
        ? session.participants.findIndex((participant) => String(participant.userId || "") === viewerId)
        : -1;

    if (session.status === "ABORTED") return "ABORTED";
    if (session.status === "DRAW") return "DRAW";
    if (participantIndex === -1) return session.status;

    return session.winnerParticipantIndex === participantIndex ? "WIN" : "LOSE";
};

/**
 * Extracts opponent name.
 * @param {Object} session - Game session data.
 * @param {string} viewerUserId - User ID.
 * @returns {string|null} Opponent username.
 */
const getOpponentName = (session, viewerUserId) => {
    const viewerId = String(viewerUserId || "");
    const opponent = Array.isArray(session.participants)
        ? session.participants.find((participant) => String(participant.userId || "") !== viewerId)
        : null;

    return opponent?.usernameSnapshot || null;
};

/**
 * Extracts opponent info.
 * @param {Object} session - Game session data.
 * @param {string} viewerUserId - User ID.
 * @returns {Object} Opponent details.
 */
const getOpponentInfo = (session, viewerUserId) => {
    const viewerId = String(viewerUserId || "");
    const opponent = Array.isArray(session.participants)
        ? session.participants.find((participant) => String(participant.userId || "") !== viewerId)
        : null;

    return {
        name: opponent?.usernameSnapshot || null,
        avatar: opponent?.avatarSnapshot || null
    };
};

export const GameDTO = {
    /** Maps session to list item DTO. */
    toGameListItem: (session, viewerUserId) => ({
        id: session.id || session._id,
        sessionNumber: session.sessionNumber,
        gameType: session.gameType,
        boardSize: session.boardSize,
        status: session.status,
        endedReason: session.endedReason,
        ...(() => {
            const opp = getOpponentInfo(session, viewerUserId);
            return { opponentName: opp.name, opponentAvatar: opp.avatar };
        })(),
        viewerResult: deriveViewerResult(session, viewerUserId),
        winnerParticipantIndex: session.winnerParticipantIndex ?? null,
        participants: Array.isArray(session.participants) ? session.participants.map(toParticipant) : [],
        startedAt: session.startedAt,
        endedAt: session.endedAt
    }),

    /** Maps sessions to paginated response DTO. */
    toGameListResponse: (sessions, pagination, viewerUserId) => ({
        items: Array.isArray(sessions)
            ? sessions.map((session) => GameDTO.toGameListItem(session, viewerUserId))
            : [],
        total: pagination?.total ?? 0,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 20
    }),

    /** Maps session to detailed DTO. */
    toGameDetail: (session, viewerUserId) => ({
        id: session.id || session._id,
        sessionNumber: session.sessionNumber,
        sourceRoomId: session.sourceRoomId || null,
        gameType: session.gameType,
        boardSize: session.boardSize,
        boardStyle: session.boardStyle,
        firstTurnParticipantIndex: session.firstTurnParticipantIndex,
        winnerParticipantIndex: session.winnerParticipantIndex,
        status: session.status,
        endedReason: session.endedReason,
        abortedByUserId: session.abortedByUserId ?? null,
        viewerResult: deriveViewerResult(session, viewerUserId),
        participants: Array.isArray(session.participants) ? session.participants.map(toParticipant) : [],
        winningLine: Array.isArray(session.winningLine) ? session.winningLine.map(toWinningCell) : [],
        moves: Array.isArray(session.moves) ? session.moves.map(toMove) : [],
        totalMoves: session.totalMoves ?? 0,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationMs: session.durationMs ?? 0,
        createdAt: session.createdAt
    }),

    /** Maps stats to summary DTO. */
    toStatsSummary: (stats = {}) => ({
        totalGames: stats.totalGames ?? 0,
        wins: stats.wins ?? 0,
        losses: stats.losses ?? 0,
        draws: stats.draws ?? 0,
        aborted: stats.aborted ?? 0
    })
};