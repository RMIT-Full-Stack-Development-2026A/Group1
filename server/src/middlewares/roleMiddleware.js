export const requireAdmin = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ 
                error: "UNAUTHORIZED_ROLE", 
                message: "Unauthorized - Role not found" 
            });
        }
        
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                error: "FORBIDDEN",
                message: "Forbidden - You do not have administrator privileges."
            });
        }

        next();
    } catch (error) {
        console.log("Error in roleMiddleware", error);
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: "Internal server error during role validation" 
        });
    }
};