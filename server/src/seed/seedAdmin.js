import bcrypt from 'bcrypt';
import { User } from '../modules/auth/models/user.model.js';

export const seedAdmin = async () => {
    const passwordHash = await bcrypt.hash('Admin@123!', 10);

    const adminData = {
        username: 'admin_tictactoang',
        email: 'admin@tictactoang.com',
        passwordHash,
        country: 'VN',
        role: 'ADMIN',
        isActive: true,
    };

    const admin = await User.findOneAndUpdate(
        { email: adminData.email },
        { $set: adminData },
        { upsert: true, returnDocument: 'after' }
    );

    console.log(`Admin seeded: ${admin.username} (ID: ${admin._id})`);
    return admin;
};