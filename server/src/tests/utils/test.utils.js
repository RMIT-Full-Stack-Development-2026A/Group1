import jwt from 'jsonwebtoken';
import { User } from '../../modules/auth/models/user.model.js';

export const generateTestUser = async (overrides = {}) => {
    const defaultUser = {
        username: `testuser_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: 'hashed_password', // Mocked, auth service handles raw
        country: 'VN',
        role: 'PLAYER',
        isActive: true,
        ...overrides
    };
    const user = await User.create(defaultUser);
    
    // Generate a valid JWT for the access_token cookie
    const token = jwt.sign(
        { userId: user._id, role: user.role, isPremium: false }, 
        process.env.JWT_SECRET || 'test_secret', 
        { expiresIn: '1h' }
    );

    return { user, token, cookie: `access_token=${token}` };
};