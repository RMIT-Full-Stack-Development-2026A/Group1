import cookie from 'cookie';
import { AuthInterface } from '../../modules/auth/interfaces/auth.interface.js';

// Every incoming event re-checks the session with the database, so a session revoked anywhere (including by another
// server instance, which the in-process event bus cannot reach) is rejected on the very next event. The cost is one
// extra database round trip per event, which adds up for latency-sensitive events such as moves.
//
// SOCKET_SESSION_RECHECK_MS is an opt-in trade-off: a positive value trusts a successful check for that many
// milliseconds. Logging in elsewhere, logging out, changing the password and deactivating the account still
// disconnect live sockets immediately through the event bus; only a revocation made by ANOTHER server instance would
// wait for the window to pass. Unset (or 0) keeps the strict per-event check.
const sessionRecheckMs = () => Number(process.env.SOCKET_SESSION_RECHECK_MS) || 0;

/** Validate both the handshake and subsequent events, including revoked sessions. */
export const socketAuthMiddleware = async (socket, next) => {
    const token = cookie.parse(socket.request.headers.cookie || '').access_token;
    try {
        socket.user = await AuthInterface.authenticateAccessToken(token);
        socket.data.tokenVersion = socket.user.tokenVersion;
        let verifiedAt = Date.now();
        socket.use(async (_packet, proceed) => {
            if (Date.now() - verifiedAt < sessionRecheckMs()) {
                if (socket.connected) proceed();
                return;
            }
            try {
                socket.user = await AuthInterface.authenticateAccessToken(token);
                verifiedAt = Date.now();
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
