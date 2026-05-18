import { AdminService } from '../services/admin.service.js';

export const AdminController = {
    // [GET] /admin/dashboard endpoint
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
    
    // [GET] /admin/players endpoint
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

     // [GET] /admin/player/:id endpoint
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
    
     // [PATCH] /admin/player/:id/deactivate endpoint
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

     // [PATCH] /admin/player/:id/reactivate endpoint
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

     // [GET] /admin/rooms endpoint
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

     // [GET] /admin/rooms/:id endpoint
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

     // [DELETE] /admin/rooms/:id endpoint
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