import { AdminService } from '../services/admin.service.js';

export const AdminController = {
    getPlayers: async (req, res, next) => {
        try {
            const safeData = await AdminService.getPlayers(req.query);
            
            return res.status(200).json({
                data: safeData,
                message: "Players fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    getPlayerDetail: async (req, res, next) => {
        try {
            const safeData = await AdminService.getPlayerDetail(req.params.id);
            
            return res.status(200).json({
                data: safeData,
                message: "Player detail fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },
    
    deactivatePlayer: async (req, res, next) => {
        try {
            const safeData = await AdminService.changePlayerStatus(req.params.id, false);
            
            return res.status(200).json({
                data: safeData,
                message: "Player account deactivated successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    reactivatePlayer: async (req, res, next) => {
        try {
            const safeData = await AdminService.changePlayerStatus(req.params.id, true);
            
            return res.status(200).json({
                data: safeData,
                message: "Player account reactivated successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};