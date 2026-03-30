/**
 * authorizeMiddleware - Authorization middleware for role-based access control
 * @param {string[]} allowedRoles - Array of roles that are permitted to access the route
 * @returns {Function} Middleware function
 */
export const authorizeMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            // Validate
            if (!req.user || !req.user.role) {
                return res.status(401).json({
                    error: "UNAUTHORIZED_ROLE",
                    message: "Unauthorized - Role not found"
                });
            }

            // Check if user's role is in the allowed roles array
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    error: "FORBIDDEN",
                    message: `Forbidden - Access requires one of these roles: ${allowedRoles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            console.log("Error in authorizeMiddleware", error);
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: "Internal server error during role validation"
            });
        }
    };
};