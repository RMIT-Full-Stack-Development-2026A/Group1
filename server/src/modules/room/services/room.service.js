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

    getActiveRoomSummaryByUserId: async (userId) => {
        const room = await RoomRepository.findActiveRoomByUserId(userId);
        if (!room) return null;
        return RoomDTO.toActiveRoomSummary(room);
    },

    getActiveRoomsCount: async () => {
        return RoomRepository.countActiveRooms();
    }
};