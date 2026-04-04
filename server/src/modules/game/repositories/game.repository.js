import { GameSession } from '../models/gameSession.model.js';

export const GameRepository = {
    createSession: async (sessionData) => {
        const session = new GameSession(sessionData);
        return session.save();
    },

    findPaginated: async (filter, sort, skip, limit) => {
        const items = await GameSession.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await GameSession.countDocuments(filter);
        return { items, total };
    },

    findById: async (id) => {
        return GameSession.findById(id);
    },

    // Data provided to Profile module
    calculateUserStats: async (userId) => {
        const sessions = await GameSession.find({ 'participants.userId': userId });
        
        let wins = 0, losses = 0, draws = 0, aborted = 0;

        sessions.forEach(session => {
            if (session.status === 'ABORTED') aborted++;
            else if (session.status === 'DRAW') draws++;
            else if (session.status === 'FINISHED') {
                const pIndex = session.participants.findIndex(p => String(p.userId) === String(userId));
                if (pIndex !== -1 && pIndex === session.winnerParticipantIndex) wins++;
                else losses++;
            }
        });

        return { totalGames: sessions.length, wins, losses, draws, aborted };
    },

    // Data provided to Profile module
    findRecentGamesByUser: async (userId, limit) => {
        return GameSession.find({ 'participants.userId': userId })
            .sort({ endedAt: -1, startedAt: -1 })
            .limit(limit)
            .select('sessionNumber gameType boardSize startedAt endedAt status winnerParticipantIndex participants');
    },

    // Data provided to Admin module
    countTotalMatches: async () => {
        return GameSession.countDocuments();
    }
};