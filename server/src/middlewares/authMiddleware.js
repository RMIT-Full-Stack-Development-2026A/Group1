import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // JWT stored in httpOnly cookie named 'access_token'
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) { 
            return res.status(401).json({ 
                error: "INVALID_TOKEN", 
                message: "Authentication failed. Invalid or expired token.",
                cause: "The provided token could not be cryptographically verified or has reached its expiration time.",
                valid_example: "A recently issued, unexpired JWT token."
            }); 
        }

        // JWT payload contains { userId, role, isPremium }
        // Attach ALL these to req.user so downstream controllers can use them
        req.user = { 
            id: decoded.userId, 
            role: decoded.role,
            isPremium: decoded.isPremium 
        };
        
        next();
    } catch (error) {
        //  500 errors do not expose stack trace, but token verification is a 401
        console.error("Error in verifyToken", error);
        return res.status(401).json({ 
            error: "TOKEN_VERIFICATION_FAILED", 
            message: "Authentication failed during token verification.",
            cause: error.message,
            valid_example: "Ensure you have logged in recently to obtain a valid token."
        });
    }
};