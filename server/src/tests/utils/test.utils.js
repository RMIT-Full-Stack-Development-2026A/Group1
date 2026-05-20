import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { User } from '../../modules/auth/models/user.model.js';

/**
 * Generates a test user with a JWT token and access cookie.
 * @param {Object} overrides - Optional user field overrides.
 * @returns {Promise<Object>} The created user, token, cookie, and plain text password.
 */
export const generateTestUser = async (overrides = {}) => {
    const {
         username,
         email,
         country,
         role,
         isActive,
         passwordHash: overridePasswordHash,
         plainTextPassword: overridePlainTextPassword
     } = overrides;

    // Generate password hash
    const plainTextPassword = overridePlainTextPassword || 'Password123!';
    const generatedPasswordHash = await bcryptjs.hash(plainTextPassword, 10);
    const passwordHash = Object.prototype.hasOwnProperty.call(overrides, 'passwordHash')
         ? overridePasswordHash
         : generatedPasswordHash;

    // Construct user payload
    const defaultUser = {
        username: username || `testuser_${Date.now()}`,
        email: email || `test${Date.now()}@example.com`,
        passwordHash,
        country: country || 'VN',
        role: role || 'PLAYER',
        isActive: typeof isActive === 'boolean' ? isActive : true,
        ...overrides
    };

    const user = await User.create(defaultUser);
    
    // Generate JWT
    const token = jwt.sign(
        { userId: user._id, role: user.role, isPremium: false }, 
        process.env.JWT_SECRET || 'test_secret', 
        { expiresIn: '1h' }
    );

    return { user, token, cookie: `access_token=${token}`, plainTextPassword };
};