import { GameSession } from '../models/gameSession.model.js';
import mongoose from 'mongoose';

export const GameRepository = {
    /** Creates a new game session. */
    createSession: async (sessionData) => {
        const session = new GameSession(sessionData);
        return await session.save();
    },

    /** Retrieves a paginated list of sessions. */
    findPaginated: async (filter, sort, skip, limit) => {
        const items = await GameSession.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await GameSession.countDocuments(filter);
        return { items, total };
    },

    /** Finds a game session by ID. */
    findById: async (id) => {
        return await GameSession.findById(id);
    },

    /** Calculates aggregated game statistics for a user. */
    calculateUserStats: async (userId) => {
        // Convert userId string to MongoDB ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        const stats = await GameSession.aggregate([
            { $match: { 'participants.userId': userObjectId } },
            {
                // Find out if the user was participant 0 or 1
                $addFields: {
                    userIndex: { $indexOfArray: ["$participants.userId", userObjectId] }
                }
            },
            {
                // Tally up the results
                $group: {
                    _id: null,
                    totalGames: { $sum: 1 },
                    aborted: { $sum: { $cond: [{ $eq: ["$status", "ABORTED"] }, 1, 0] } },
                    draws: { $sum: { $cond: [{ $eq: ["$status", "DRAW"] }, 1, 0] } },
                    wins: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "FINISHED"] },
                                        { $eq: ["$userIndex", "$winnerParticipantIndex"] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    losses: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "FINISHED"] },
                                        { $ne: ["$userIndex", "$winnerParticipantIndex"] },
                                        { $ne: ["$winnerParticipantIndex", null] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        // Aggregate returns an array
        return stats[0] || { totalGames: 0, wins: 0, losses: 0, draws: 0, aborted: 0 };
    },

    /** Finds a limited list of recent games for a user. */
    findRecentGamesByUser: async (userId, limit) => {
        return await GameSession.find({ 'participants.userId': userId })
            .select('-moves')
            .sort({ endedAt: -1, startedAt: -1 })
            .limit(limit)
            .select('sessionNumber gameType boardSize startedAt endedAt status winnerParticipantIndex participants');
    },

    /** Counts the total matches on the platform. */
    countTotalMatches: async () => {
        return await GameSession.countDocuments();
    }
};