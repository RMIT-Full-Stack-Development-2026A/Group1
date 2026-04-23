import { RoomRepository } from '../repositories/room.repository.js';
import { validateRoomQuery, validateObjectId } from '../validators/room.validator.js';
import { RoomDTO } from '../dtos/room.dto.js';

export const RoomService = {
    getArenaRooms: async (query) => {
        const { filter, sort, pagination } = validateRoomQuery(query);
        
        const { rooms, total } = await RoomRepository.findPaginated(filter, sort, pagination.skip, pagination.limit);
        
        return RoomDTO.toRoomListResponse(rooms, { 
            total, 
            page: pagination.page, 
            limit: pagination.limit 
        });
    },

    getRoomDetail: async (roomId) => {
        if (!validateObjectId(roomId)) {
            throw {
                statusCode: 400,
                error: "INVALID_IDENTIFIER",
                message: "Invalid room ID.",
                cause: "The requested ID is not a valid MongoDB ObjectId.",
                valid_example: "Use a valid 24-character hex string."
            };
        }

        const room = await RoomRepository.findById(roomId);
        
        if (!room) {
            throw {
                statusCode: 404,
                error: "ROOM_NOT_FOUND",
                message: "Room not found.",
                cause: `No room record exists matching the ID: ${roomId}.`,
                valid_example: "Ensure the room ID is correct and the room hasn't been closed/removed."
            };
        }

        // Authorization check
        const isParticipant = room.participants && room.participants.some(
            (pId) => pId.toString() === requestingUser.id.toString()
        );
        const isAdmin = requestingUser.role === 'ADMIN';

        if (!isParticipant && !isAdmin) {
            throw {
                statusCode: 403,
                error: "FORBIDDEN_ACCESS",
                message: "Access denied to room state.",
                cause: "The requester is neither a participant in the room nor an administrator.",
                valid_example: "Ensure you are logged into an account that is actively part of this room."
            };
        }

        return RoomDTO.toRoomDetail(room);
    },

    getActiveRoomSummaryByUserId: async (userId) => {
        const room = await RoomRepository.findActiveRoomByUserId(userId);
        if (!room) return null;
        return RoomDTO.toActiveRoomSummary(room);
    },

    getActiveRoomsCount: async () => {
        return RoomRepository.countActiveRooms();
    }
};