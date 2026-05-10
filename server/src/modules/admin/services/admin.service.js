import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { GameInterface } from '../../game/interfaces/game.interface.js';
import { RoomInterface } from '../../room/interfaces/room.interface.js';
import { SubscriptionInterface } from '../../subscription/interfaces/subscription.interface.js';
import { AdminDTO } from '../dtos/admin.dto.js';
import { validatePlayerQuery, validateObjectId, validateAdminRoomQuery } from '../validators/admin.validator.js';

import { io } from '../../../sockets/index.js'; // Import Socket.IO server instance for emitting events from service layer if needed
export const AdminService = {

    getDashboard: async () => {
        // Fetch all metrics concurrently for performance
        const [authMetrics, totalMatches, activeRooms, totalRevenue] = await Promise.all([
            AuthInterface.getPlatformMetrics(),
            GameInterface.getTotalPlatformMatches(),
            RoomInterface.getActiveRoomsCount(),
            SubscriptionInterface.getTotalRevenue(),
        ]);

        return AdminDTO.toDashboard({
            ...authMetrics,
            totalMatches,
            activeRooms,
            totalRevenue
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

        // 1. Update user account status in the database
        const updatedUser = await AuthInterface.setAccountStatus(playerId, isActive);

        // 2. SOCKET LOGIC: Only run when the account is being banned (isActive === false)
        if (!isActive) {
            const gameNamespace = io.of('/ws/game');
            const stringPlayerId = playerId.toString();

            try {
                // Check if the user currently has an active room or is in a game
                const activeRoom = await RoomInterface.getActiveRoomSummaryByUserId(playerId);
                
                if (activeRoom) {
                    // Use RoomInterface.forceCloseRoomByAdmin to cleanly close the room if they're present
                    // (Avoid calling RoomService directly to prevent circular module dependencies)
                    await RoomInterface.forceCloseRoomByAdmin(activeRoom.id);
                    
                    // Emit a socket event to notify the room that it was closed by an ADMIN
                    gameNamespace.emit('room:removed', { roomId: activeRoom.id });
                    gameNamespace.in(activeRoom.id.toString()).socketsLeave(activeRoom.id.toString());
                }

                // Send a private deactivation event to the banned user
                gameNamespace.to(stringPlayerId).emit('account:deactivated', {
                    message: "Tài khoản của bạn đã bị vô hiệu hóa bởi Admin.",
                    reason: "Vi phạm chính sách hệ thống."
                });

                // Wait ~100ms to ensure the above message is delivered, then disconnect their sockets
                setTimeout(() => {
                    gameNamespace.in(stringPlayerId).disconnectSockets(true);
                }, 100);

            } catch (err) {
                console.error(`[Admin Deactivate] Error tearing down socket for user ${stringPlayerId}:`, err);
            }
        }

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
        await RoomInterface.forceCloseRoomByAdmin(roomId);
        
        return null; // Return empty data for 200 OK
    }
};