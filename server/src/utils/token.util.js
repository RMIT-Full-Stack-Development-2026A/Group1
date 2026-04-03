import jwt from 'jsonwebtoken';

// Generate JWT and store it in the httpOnly cookie
export const generateTokenAndSetCookie = (res, userId, role, isPremium) => {
    const token = jwt.sign({ userId, role, isPremium }, process.env.JWT_SECRET, {
        expiresIn: "7d", // 7 days
    });

    res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};