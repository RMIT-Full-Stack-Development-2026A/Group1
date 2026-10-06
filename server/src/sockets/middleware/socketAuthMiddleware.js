import cookie from 'cookie';
import { AuthInterface } from '../../modules/auth/interfaces/auth.interface.js';

/** Validate both the handshake and subsequent events, including revoked sessions. */
export const socketAuthMiddleware = async (socket, next) => {
    const token = cookie.parse(socket.request.headers.cookie || '').access_token;
    try {
        socket.user = await AuthInterface.authenticateAccessToken(token);
        socket.data.tokenVersion = socket.user.tokenVersion;
        socket.use(async (_packet, proceed) => {
            try {
                socket.user = await AuthInterface.authenticateAccessToken(token);
                if (socket.connected) proceed();
            } catch {
                socket.emit('auth:force_logout', { reason: 'Your session has ended. Please log in again.' });
                socket.disconnect(true);
            }
        });
        return next();
    } catch (error) {
        const err = new Error('AUTHENTICATION_FAILED');
        err.data = { message: error.message || 'Unable to authenticate.', code: error.statusCode || 500 };
        return next(err);
    }
};
