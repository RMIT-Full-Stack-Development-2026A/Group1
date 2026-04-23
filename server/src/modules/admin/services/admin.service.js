import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { GameInterface } from '../../game/interfaces/game.interface.js';
import { RoomInterface } from '../../room/interfaces/room.interface.js';
import { AdminDTO } from '../dtos/admin.dto.js';
import { validatePlayerQuery, validateObjectId, validateAdminRoomQuery } from '../validators/admin.validator.js';

export const AdminService = {

    getDashboard: async () => {
        // Fetch all metrics concurrently for performance
        const [authMetrics, totalMatches, activeRooms] = await Promise.all([
            AuthInterface.getPlatformMetrics(),
            GameInterface.getTotalPlatformMatches(),
            RoomInterface.getActiveRoomsCount()
        ]);

        //const totalRevenue = 0; // e.g., await Subscription.getTotalRevenue();

        return AdminDTO.toDashboard({
            ...authMetrics,
            totalMatches,
            activeRooms,
            //totalRevenue
        });
    },
    
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
    },

    getRooms: async (query) => {
        const { filter, sort, pagination } = validateAdminRoomQuery(query);
        
        // Delegate to Room module
        const result = await RoomInterface.getPaginatedRooms(filter, sort, pagination.skip, pagination.limit);
        
        return {
            items: result.items,
            total: result.total,
            page: pagination.page,
            limit: pagination.limit
        };
    },

    getRoomDetail: async (roomId, requestingUser) => {
        // Delegate to Room module
        return await RoomInterface.getRoomDetail(roomId, requestingUser);
    },

    forceCloseRoom: async (roomId) => {
        if (!validateObjectId(roomId)) {
            throw {
                statusCode: 400,
                error: "INVALID_IDENTIFIER",
                message: "Failed to close room. Invalid room ID format.",
                cause: "The provided ID string is not a valid MongoDB ObjectId.",
                valid_example: "Use a valid 24-character hex string."
            };
        }

        // Delegate to Room module
        const closed = await RoomInterface.forceCloseRoomByAdmin(roomId);
        
        // (Not Found / Already Closed)
        if (closed === null) {
            throw {
                statusCode: 404,
                error: "ROOM_NOT_FOUND",
                message: "Room not found or already closed.",
                cause: `The room ID ${roomId} does not exist or is already in a CLOSED/ABORTED state.`
            };
        }

        // (Update Failed / Concurrency Issue)
        if (closed === false) {
            throw {
                statusCode: 500,
                error: "UPDATE_FAILED",
                message: "Failed to force close the room.",
                cause: "The room status update failed unexpectedly due to a concurrent modification or database error.",
                valid_example: "Try the request again."
            };
        }
        return closed;
    }
};