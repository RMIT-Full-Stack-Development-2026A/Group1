/**
 * Restricts route access based on an array of permitted user roles.
 * * @param {string[]} allowedRoles - Array of roles permitted to access the route.
 * @returns {Function} Express middleware function handling authorization validation.
 */
export const authorizeMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            // Ensure the user payload was attached by prior auth middleware
            if (!req.user || !req.user.role) { 
                return res.status(401).json({
                    error: "UNAUTHORIZED_ROLE",
                    message: "Authorization failed. Role not found.",
                    cause: "The user object or role property is missing from the request context.",
                    valid_example: "A user object containing a 'role' property (e.g., 'PLAYER' or 'ADMIN')."
                });
            }

            // Verify the user's role exists within the allowed scope
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
            
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: "Internal server error during role validation.",
                cause: "An unexpected exception occurred while verifying user permissions.",
                valid_example: "Check server logs for internal execution failures."
            });
        }
    };
};