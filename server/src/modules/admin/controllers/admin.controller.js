import { AdminService } from '../services/admin.service.js';
import { AdminDTO } from '../dtos/admin.dto.js';

export const AdminController = {
    getPlayers: async (req, res, next) => {
        try {
            const result = await AdminService.getPlayers(req.query);
            
            return res.status(200).json({
                data: AdminDTO.toPlayerList(result.items, result.pagination),
                message: "Players fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    getPlayerDetail: async (req, res, next) => {
        try {
            const result = await AdminService.getPlayerDetail(req.params.id);
            
            return res.status(200).json({
                data: AdminDTO.toPlayerDetail(result.user, result.extra),
                message: "Player detail fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },
    
    deactivatePlayer: async (req, res, next) => {
        try {
            const updatedUser = await AdminService.changePlayerStatus(req.params.id, false);
            
            return res.status(200).json({
                data: AdminDTO.toPlayerDetail(updatedUser),
                message: "Player account deactivated successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    reactivatePlayer: async (req, res, next) => {
        try {
            const updatedUser = await AdminService.changePlayerStatus(req.params.id, true);
            
            return res.status(200).json({
                data: AdminDTO.toPlayerDetail(updatedUser),
                message: "Player account reactivated successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};