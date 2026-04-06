import { GameService } from "../services/game.service.js";
import { GameDTO } from "../dtos/game.dto.js";

export const GameController = {
    
    // create local game session API
    createLocalSession: async (req, res, next) => {
        try {
            const viewerUserId = req.user.id; 
            const savedSession = await GameService.createLocalGameSession(viewerUserId, req.body);
            const safeData = GameDTO.toGameDetail(savedSession, viewerUserId);

            return res.status(201).json({
                data: safeData,
                message: "Game session saved successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    // get game list API
    getGames: async (req, res, next) => {
        try {
            const result = await GameService.listUserGameSessions(req.user.id, req.query);
            
            return res.status(200).json({
                data: GameDTO.toGameListResponse(result.items, result.pagination, req.user.id),
                message: "Game history fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    // get game detail API
    getGameDetail: async (req, res, next) => {
        try {
            const session = await GameService.getGameSessionDetail(req.user.id, req.params.id);
            
            return res.status(200).json({
                data: GameDTO.toGameDetail(session, req.user.id),
                message: "Game details fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};