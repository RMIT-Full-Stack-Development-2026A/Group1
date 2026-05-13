import bcrypt from 'bcrypt';
import User from '../src/modules/auth/models/user.model.js';

export const seedPlayers = async () => {
    console.log('Seeding Player accounts...');
    const passwordHash = await bcrypt.hash('Player@123!', 10);

    // Premium expires in 1 year
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
            isPremium: false,
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
            { upsert: true, new: true }
        );
        seededPlayers.push(user);
    }

    console.log(`${seededPlayers.length} Players seeded.`);
    return seededPlayers;
};