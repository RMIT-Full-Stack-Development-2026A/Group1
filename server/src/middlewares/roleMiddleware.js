export const requireAdmin = (req, res, next) => {
    try {
        if (!req.role) {
            return res.status(401).json({ success: false, message: "Unauthorized - Role not found" });
        }

        // Check register user role 'PLAYER' and 'ADMIN'
        if (req.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You do not have administrator privileges."
            });
        }

        next();
    } catch (error) {
        console.log("Error in roleMiddleware", error);
        return res.status(500).json({ success: false, message: "Internal server error during role validation" });
    }
};