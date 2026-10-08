import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Attributes of the session cookie. The frontend and the API are on different sites in production,
 * so the cookie is cross-site: SameSite=None + Secure, and Partitioned (CHIPS) so browsers that block
 * third-party cookies still accept it, keyed to the site that embeds the API calls. Partitioned requires
 * Secure, so it is only used in production. Clearing a cookie needs the same attributes it was set with.
 * @param {{ partitioned?: boolean }} [options] - set partitioned to false to address the older, unpartitioned cookie.
 */
const accessTokenCookieOptions = ({ partitioned = true } = {}) => {
    const production = isProduction();
    return {
        httpOnly: true,
        secure: production,
        sameSite: production ? 'none' : 'lax',
        path: '/',
        ...(production && partitioned && { partitioned: true }),
    };
};

/** Expires the session cookie, including the older unpartitioned variant. */
export const clearAccessTokenCookies = (res) => {
    res.clearCookie('access_token', accessTokenCookieOptions());
    if (isProduction()) res.clearCookie('access_token', accessTokenCookieOptions({ partitioned: false }));
};

/**
 * Generates a JWT and sets it as an HttpOnly cookie on the response.
 * @param {Object} res - Express response object.
 * @param {string} userId - User identifier.
 * @param {string} role - User role.
 * @param {boolean} isPremium - Subscription status.
 * @returns {string} The generated JWT token.
 */
export const generateTokenAndSetCookie = (res, userId, role, isPremium, tokenVersion) => {
    const token = jwt.sign({ userId, role, isPremium, tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: "7d",
        jwtid: randomUUID(),
    });

    // A cookie from before it was partitioned would be sent alongside the new one and could be read
    // first, so expire it. It is a separate cookie to the browser, so setting the new one does not do it.
    if (isProduction()) res.clearCookie('access_token', accessTokenCookieOptions({ partitioned: false }));
    res.cookie('access_token', token, { ...accessTokenCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

    return token;
};
