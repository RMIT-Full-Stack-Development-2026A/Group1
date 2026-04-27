import { AdminService } from '../services/admin.service.js';

export const AdminController = {

    getDashboard: async (req, res, next) => {
        try {
            const safeData = await AdminService.getDashboard();
            
            return res.status(200).json({
                data: safeData,
                message: "Admin dashboard metrics fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },
    
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
    },

    getRooms: async (req, res, next) => {
        try {
            const safeData = await AdminService.getRooms(req.query);
            
            return res.status(200).json({
                data: safeData,
                message: "Rooms fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    getRoomDetail: async (req, res, next) => {
        try {
            const safeData = await AdminService.getRoomDetail(req.params.id, req.user);
            
            return res.status(200).json({
                data: safeData,
                message: "Room detail fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    forceCloseRoom: async (req, res, next) => {
        try {
            await AdminService.forceCloseRoom(req.params.id);
            
            return res.status(200).json({
                data: null,
                message: "Room force closed successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};