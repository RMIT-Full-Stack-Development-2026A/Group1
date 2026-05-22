import bcrypt from 'bcrypt';
import { User } from '../modules/auth/models/user.model.js';

/**
 * Seeds standard, premium, and banned player accounts.
 * @returns {Promise<Array<Object>>} Array of seeded user documents.
 */
export const seedPlayers = async () => {
    
    const passwordHash = await bcrypt.hash('Player@123!', 10);

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const players = [
        {
            username: 'normal_player',
            email: 'player@tictactoang.com',
            passwordHash,
            country: 'VN',
            role: 'PLAYER',
            isActive: true,
            premiumExpiresAt: null,
        },
        {
            username: 'premium_player',
            email: 'premium@tictactoang.com',
            passwordHash,
            country: 'US',
            role: 'PLAYER',
            isActive: true,
            premiumExpiresAt: nextYear,
        },
        {
            username: 'banned_player',
            email: 'banned@tictactoang.com',
            passwordHash,
            country: 'UK',
            role: 'PLAYER',
            isActive: false, 
        }
    ];

    const seededPlayers = [];
    for (const p of players) {
        const user = await User.findOneAndUpdate(
            { email: p.email },
            { $set: p },
            { upsert: true, returnDocument: 'after' }
        );
        seededPlayers.push(user);
    }

    
    return seededPlayers;
};