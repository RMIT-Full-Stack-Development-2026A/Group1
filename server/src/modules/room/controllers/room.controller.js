import { RoomService } from '../services/room.service.js';

export const RoomController = {
    getRooms: async (req, res, next) => {
        try {
            const safeData = await RoomService.getArenaRooms(req.query);
            
            return res.status(200).json({
                data: safeData,
                message: "Arena rooms fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },
};