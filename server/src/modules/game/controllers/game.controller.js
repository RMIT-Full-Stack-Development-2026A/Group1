import { GameService } from "../services/game.service.js";

export const GameController = {
    
    // create local game session API
    createLocalSession: async (req, res, next) => {
        try {
            const viewerUserId = req.user.id; 
            const safeData = await GameService.createLocalGameSession(viewerUserId, req.body);

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
            const safeData = await GameService.listUserGameSessions(req.user.id, req.query);
            
            return res.status(200).json({
                data: safeData,
                message: "Game history fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    // get game detail API
    getGameDetail: async (req, res, next) => {
        try {
            const safeData = await GameService.getGameSessionDetail(req.user.id, req.params.id);
            
            return res.status(200).json({
                data: safeData,
                message: "Game details fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};