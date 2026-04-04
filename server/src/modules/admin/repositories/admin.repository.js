import { User } from '../../auth/models/user.model.js';
import { GameSession } from '../../game/models/gameSession.model.js';

// Orchestration Repository for Admin functions
export const AdminRepository = {
    findPlayers: async (filter, sort, skip, limit) => {
        const users = await User.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-passwordHash'); // Ensure passwordHash is never queried

        const total = await User.countDocuments(filter);

        return { users, total };
    },

    findPlayerById: async (id) => {
        return User.findById(id).select('-passwordHash');
    },

    updatePlayerStatus: async (id, isActive) => {
        return User.findByIdAndUpdate(
            id, 
            { $set: { isActive } }, 
            { new: true, runValidators: true }
        ).select('-passwordHash');
    },

    getPlayerStats: async (userId) => {
        const totalMatches = await GameSession.countDocuments({ 'participants.userId': userId });
        
        return { totalMatches };
    }
};