import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9_-]+$/, // Alphabets, numbers, underscore, hyphen
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
        maxLength: 254 // Less than 255 characters
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['PLAYER', 'ADMIN'],
        default: 'PLAYER'
    },
    imageAvatar: {
        type: String,
        default: null,
    },
    lastLogin: {
        type: String,
        default: Date.now(),
    },
    // Brute-force protection fields
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Number
    },
    // isVerify: {
    //     type: Boolean,
    //     default: false
    // },
    isPremium: {
        type: Boolean,
        default: false, // Updated upon successful subscription
    },
    isActive: {
        type: Boolean,
        default: true, // Admins can toggle this to deactivate accounts
    },
    walletBalance: {
        type: Number,
        default: 0, // For depositing funds
    },
    // verificationToken: String,
    // verificationTokenExpiresAt: Date,
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);