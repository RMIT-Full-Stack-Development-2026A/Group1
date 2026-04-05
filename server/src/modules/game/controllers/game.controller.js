import { GameService } from '../services/game.service.js';
import { GameDTO } from '../dtos/game.dto.js';

export const GameController = {


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