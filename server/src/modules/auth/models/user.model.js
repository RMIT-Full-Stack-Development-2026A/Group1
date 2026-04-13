import mongoose from "mongoose";
import { baseSchemaOptions } from "../../../utils/baseSchemaOptions.js";

const userSchema = new mongoose.Schema({
    username: {
        type: String, // Account username used for login/display
        required: true, 
        unique: true, 
        trim: true, 
        match: /^[a-zA-Z0-9_-]{6,30}$/, // Only allow letters, numbers, underscore, hyphen, 6-30 characters 
        index: true 
    },

    email: {
        type: String, // Main email address of the account
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format validation
        maxlength: 254, 
        index: true 
    },

    passwordHash: {
        type: String, // Stores hashed password, never plain text password
        required: true, 
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        select: false
    },

    country: {
        type: String, // User-selected country 
        required: true,
        trim: true 
    },

    role: {
        type: String, 
        enum: ['PLAYER', 'ADMIN'], 
        default: 'PLAYER',
        index: true 
    },

    avatar: {
        type: String, // URL/path to the user's uploaded avatar image
        default: null 
    },

    isActive: {
        type: Boolean, 
        default: true,
        index: true,
    },

    premiumExpiresAt: {
        type: Date, // Date-time when premium membership ends
        default: null, 
        index: true
    },

    wallet: {
        balance: {
            type: Number, // Current wallet balance snapshot for fast reads
            default: 0,
            min: 0 
        }
    },

    auth: {
        lastLoginAt: {
            type: Date, 
            default: null 
        },
        loginAttempts: {
            type: Number, 
            default: 0, 
            select: false // Security metadata hidden from standard queries
        },
        lockUntil: {
            type: Date,
            default: null, 
            select: false // Security metadata hidden from standard queries
        }
    }
}, baseSchemaOptions);

// Does not take up database storage
userSchema.virtual('isPremium').get(function () {
  return !!this.premiumExpiresAt && this.premiumExpiresAt > new Date();
});

userSchema.index({ createdAt: -1 }); // Helps sort newest users first
userSchema.index({ username: 'text', email: 'text' }); // Helps text search in admin/player listings

export const User = mongoose.model('User', userSchema);