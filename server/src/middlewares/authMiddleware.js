import jwt from "jsonwebtoken";

/**
 * Validates the JWT access token from cookies and attaches user data to the request.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object|void} JSON error response or calls next().
 */
export const verifyToken = (req, res, next) => {
    // Extract token from HTTP-only cookie
    const token = req.cookies.access_token;
    
    if (!token) {
        return res.status(401).json({ 
            error: "UNAUTHORIZED", 
            message: "Authentication failed. No token provided.",
            cause: "The request lacks an access token in the cookies.",
            valid_example: "A valid JWT token stored in the 'access_token' cookie."
        });
    }

    try {
        // Cryptographically verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) { 
            return res.status(401).json({ 
                error: "INVALID_TOKEN", 
                message: "Authentication failed. Invalid or expired token.",
                cause: "The provided token could not be cryptographically verified or has reached its expiration time.",
                valid_example: "A recently issued, unexpired JWT token."
            }); 
        }

        // Attach decoded payload to the request for downstream use
        req.user = { 
            id: decoded.userId, 
            role: decoded.role,
            isPremium: decoded.isPremium 
        };
        
        next();
    } catch (error) {
        console.error("Error in verifyToken", error);
        return res.status(401).json({ 
            error: "TOKEN_VERIFICATION_FAILED", 
            message: "Authentication failed during token verification.",
            cause: error.message,
            valid_example: "Ensure you have logged in recently to obtain a valid token."
        });
    }
};