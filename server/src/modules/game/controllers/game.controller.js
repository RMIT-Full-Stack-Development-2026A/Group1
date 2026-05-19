import { GameService } from "../services/game.service.js";

export const GameController = {
    // [POST] /games endpoint
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

    // [GET] /games endpoint
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

    // [GET] /games/:id endpoint
    getGameDetail: async (req, res, next) => {
        try {
            const safeData = await GameService.getGameSessionDetail(req.user.id, req.params.id, req.user);
            
            return res.status(200).json({
                data: safeData,
                message: "Game details fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};