import jwt from 'jsonwebtoken';

/**
 * Generates a JWT and sets it as an HttpOnly cookie on the response.
 * @param {Object} res - Express response object.
 * @param {string} userId - User identifier.
 * @param {string} role - User role.
 * @param {boolean} isPremium - Subscription status.
 * @returns {string} The generated JWT token.
 */
export const generateTokenAndSetCookie = (res, userId, role, isPremium) => {
    const token = jwt.sign({ userId, role, isPremium }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};