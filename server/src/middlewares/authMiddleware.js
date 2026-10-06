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
