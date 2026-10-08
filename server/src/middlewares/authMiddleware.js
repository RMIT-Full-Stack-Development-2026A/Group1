import { AuthInterface } from '../modules/auth/interfaces/auth.interface.js';

/** Authenticate the session and load current permissions for every request. */
export const verifyToken = async (req, res, next) => {
    const token = req.cookies?.access_token;
    if (!token) {
        return next({ statusCode: 401, error: 'UNAUTHORIZED', message: 'No access token provided.' });
    }
    try {
        req.user = await AuthInterface.authenticateAccessToken(token);
        return next();
    } catch (error) {
        return next(error);
    }
};

/**
 * Like verifyToken, but a missing, invalid, expired or revoked token means "anonymous", not an error.
 * Used by endpoints that must answer "who am I?" without failing for logged-out visitors.
 * A deactivated account is still reported, because that is information the client needs.
 */
export const optionalVerifyToken = async (req, res, next) => {
    const token = req.cookies?.access_token;
    if (!token) return next();
    try {
        req.user = await AuthInterface.authenticateAccessToken(token);
        return next();
    } catch (error) {
        if (error?.statusCode === 401) return next();
        return next(error);
    }
};
