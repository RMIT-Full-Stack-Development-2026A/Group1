import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { GameInterface } from '../../game/interfaces/game.interface.js';
import { AdminDTO } from '../dtos/admin.dto.js';
import { validatePlayerQuery, validateObjectId } from '../validators/admin.validator.js';

export const AdminService = {
    getPlayers: async (query) => {
        const { filter, sort, pagination } = validatePlayerQuery(query);
        
        const { users, total } = await AuthInterface.getPaginatedUsers(filter, sort, pagination.skip, pagination.limit);
        
        return AdminDTO.toPlayerList(users, { 
            total, 
            page: pagination.page, 
            limit: pagination.limit 
        });
    },

    getPlayerDetail: async (playerId) => {
        if (!validateObjectId(playerId)) {
            throw {
                statusCode: 400,
                error: "INVALID_IDENTIFIER",
                message: "Failed to fetch player. Invalid user ID format.",
                cause: "The provided ID string is not a valid MongoDB ObjectId.",
                valid_example: "Use a valid 24-character hex string."
            };
        }

        const user = await AuthInterface.getUserById(playerId);
        if (!user) {
            throw {
                statusCode: 404,
                error: "PLAYER_NOT_FOUND",
                message: "Player not found.",
                cause: `No user record exists in the database matching ID: ${playerId}.`,
                valid_example: "Ensure the user ID exists before requesting details."
            };
        }

        // Orchestrate extra stats gathering
        const extraStats = await GameInterface.getUserGameStats(playerId);

        return AdminDTO.toPlayerDetail(user, extraStats);
    },

    changePlayerStatus: async (playerId, isActive) => {
        if (!validateObjectId(playerId)) {
            throw {
                statusCode: 400,
                error: "INVALID_IDENTIFIER",
                message: "Status update failed. Invalid user ID format.",
                cause: "The provided ID string is not a valid MongoDB ObjectId.",
                valid_example: "Use a valid 24-character hex string."
            };
        }

        // Check existence before applying update
        const existingUser = await AuthInterface.getUserById(playerId);
        if (!existingUser) {
            throw { 
                statusCode: 404, 
                error: "PLAYER_NOT_FOUND",
                message: "Status update failed. Player not found.",
                cause: `No user record exists in the database matching ID: ${playerId}.`,
                valid_example: "A valid User ID currently existing in the database."
            }; 
        }

        if (existingUser.isActive === isActive) {
            throw {
                statusCode: 409,
                error: "CONFLICT",
                message: `Status update failed. Player is already ${isActive ? 'active' : 'deactivated'}.`,
                cause: "The requested status matches the user's current status.",
                valid_example: `Request to deactivate an currently active player.`
            };
        }

        const updatedUser = await AuthInterface.setAccountStatus(playerId, isActive);
        return AdminDTO.toPlayerDetail(updatedUser);
    }
};