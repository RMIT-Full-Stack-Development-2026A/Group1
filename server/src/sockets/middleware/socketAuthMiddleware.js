import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const socketAuthMiddleware = (socket, next) => {
    try {
        // Parse cookies from the initial handshake request
        const cookies = cookie.parse(socket.request.headers.cookie || '');
        const token = cookies.access_token;

        if (!token) {
            const err = new Error('AUTHENTICATION_FAILED');
            err.data = { message: "No access token provided.", code: 401 };
            return next(err);
        }

        // Verify token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user payload (id, role, isPremium, etc.) to the socket context
        socket.user = {
            id: decoded.userId || decoded.id, 
            role: decoded.role,
            isPremium: decoded.isPremium
        };

        next();
    } catch (error) {
        const err = new Error('AUTHENTICATION_FAILED');
        err.data = { message: "Invalid or expired token.", code: 401 };
        return next(err);
    }
};