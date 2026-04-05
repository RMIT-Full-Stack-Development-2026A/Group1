import { GameService } from "../services/game.service.js";
import { GameDTO } from "../dtos/game.dto.js";

export const GameController = {
    createLocalSession: async (req, res, next) => {
        try {
            // Get user id from token (already passed through authMiddleware)
            const viewerUserId = req.user.id; 
            
            // Pass to Service to handle business logic
            const savedSession = await GameService.createLocalGameSession(viewerUserId, req.body);
            
            // Use GameDTO prepared by Thắng PM to map output data
            const safeData = GameDTO.toGameDetail(savedSession, viewerUserId);

            return res.status(201).json({
                data: safeData,
                message: "Game session saved successfully."
            });
        } catch (error) {
            return next(error);
        }
    },
    
    // TODO: Other GET functions will be added by Thắng later
};