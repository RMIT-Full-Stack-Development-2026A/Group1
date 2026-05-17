import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { User } from '../../modules/auth/models/user.model.js';

export const generateTestUser = async (overrides = {}) => {
    // Generate a valid hash for integration
    const plainTextPassword = overrides.plainTextPassword || 'Password123!';
    const passwordHash = await bcryptjs.hash(plainTextPassword, 10);

    const defaultUser = {
        username: `testuser_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: passwordHash, 
        country: 'VN',
        role: 'PLAYER',
        isActive: true,
        ...overrides
    };
    delete defaultUser.plainTextPassword;

    const user = await User.create(defaultUser);
    
    // Generate a valid JWT for the access_token cookie
    const token = jwt.sign(
        { userId: user._id, role: user.role, isPremium: false }, 
        process.env.JWT_SECRET || 'test_secret', 
        { expiresIn: '1h' }
    );

    return { user, token, cookie: `access_token=${token}`, plainTextPassword };
};