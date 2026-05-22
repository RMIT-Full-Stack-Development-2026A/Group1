import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.config.js';

import { seedAdmin } from './seedAdmin.js';
import { seedPlayers } from './seedPlayers.js';
import { seedSubscriptions } from './seedSubscriptions.js';
import { seedMatches } from './seedMatches.js';
import { seedRevenue } from './seedRevenue.js';

dotenv.config();

/**
 * Orchestrates the database seeding process.
 * @returns {Promise<void>}
 */
const runSeeder = async () => {
    try {
        
        
        // Connect database
        await connectDB();

        // Run standalone seeders
        await seedAdmin();
        const players = await seedPlayers();
        
        // Extract specific users
        const premiumPlayer = players.find(p => p.username === 'premium_player');
        const normalPlayer = players.find(p => p.username === 'normal_player');

        // Run dependent seeders
        await seedSubscriptions(premiumPlayer);
        await seedRevenue(); // Run revenue seeder
        await seedMatches(normalPlayer, premiumPlayer);

        
        
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        // Disconnect database
        await mongoose.connection.close();
        
    }
};

runSeeder();