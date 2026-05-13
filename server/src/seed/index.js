import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.config.js';

// Import Domain Seeders
import { seedAdmin } from './seedAdmin.js';
import { seedPlayers } from './seedPlayers.js';
import { seedSubscriptions } from './seedSubscriptions.js';
import { seedMatches } from './seedMatches.js';

dotenv.config();

const runSeeder = async () => {
    try {
        console.log('Starting TicTacToang Database Seeder...');
        
        // Connect to MongoDB
        await connectDB();

        // Run Seeders
        await seedAdmin();
        const players = await seedPlayers();
        
        const premiumPlayer = players.find(p => p.username === 'premium_player');
        const normalPlayer = players.find(p => p.username === 'normal_player');

        // Dependent Seeders (Require User IDs)
        await seedSubscriptions(premiumPlayer);
        await seedMatches(normalPlayer, premiumPlayer);

        console.log('Seeding completed successfully. Go for Demo');
        
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        // Disconnect to exit the process
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
};

runSeeder();