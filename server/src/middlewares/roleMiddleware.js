/**
 * authorizeMiddleware - Authorization middleware for role-based access control
 * @param {string[]} allowedRoles - Array of roles that are permitted to access the route
 * @returns {Function} Middleware function
 */
export const authorizeMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            // Validate if user exists from previous verifyToken middleware
            if (!req.user || !req.user.role) { 
                return res.status(401).json({
                    error: "UNAUTHORIZED_ROLE",
                    message: "Authorization failed. Role not found.",
                    cause: "The user object or role property is missing from the request context.",
                    valid_example: "A user object containing a 'role' property (e.g., 'PLAYER' or 'ADMIN')."
                });
            }

            // Check if user's role is in the allowed roles array
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    error: "FORBIDDEN",
                    message: `Forbidden. Access requires one of these roles: ${allowedRoles.join(', ')}.`,
                    cause: `The current user has role '${req.user.role}', which lacks permission for this endpoint.`,
                    valid_example: `A user account with role: ${allowedRoles[0]}.`
                });
            }

            next();
        } catch (error) {
            console.log("Error in authorizeMiddleware", error);
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: "Internal server error during role validation.",
                cause: "An unexpected exception occurred while verifying user permissions.",
                valid_example: "Check server logs for internal execution failures."
            });
        }
    };
};