import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { AuthRepository } from '../repositories/auth.repository.js';

export const SessionService = {
    authenticateAccessToken: async (token) => {
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
            if (!mongoose.isObjectIdOrHexString(decoded.userId) || !Number.isFinite(decoded.exp)) {
                throw new Error('Invalid token claims');
            }
        } catch {
            throw { statusCode: 401, error: 'INVALID_TOKEN', message: 'Your session is invalid or expired. Please log in again.' };
        }

        const user = await AuthRepository.findSessionUser(decoded.userId);
        // Existing users and tokens predate tokenVersion; both default to zero.
        const tokenVersion = decoded.tokenVersion ?? 0;
        if (!user || !Number.isSafeInteger(tokenVersion) || tokenVersion < 0 || tokenVersion !== (user.auth?.tokenVersion ?? 0)) {
            throw { statusCode: 401, error: 'SESSION_REVOKED', message: 'Your session has ended. Please log in again.' };
        }
        if (!user.isActive) {
            throw { statusCode: 403, error: 'ACCOUNT_DEACTIVATED', message: 'Your account has been deactivated.' };
        }

        // Role and subscription can change before a JWT expires.
        return { id: user.id, role: user.role, isPremium: user.isPremium, tokenVersion, expiresAt: decoded.exp * 1000 };
    }
};
