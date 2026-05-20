import mongoose from "mongoose";
import { baseSchemaOptions } from "../../../utils/baseSchemaOptions.js";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, 
        unique: true, 
        trim: true, 
        match: /^[a-zA-Z0-9_-]{6,30}$/, 
        index: true 
    },
    email: {
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        maxlength: 254, 
        index: true 
    },
    passwordHash: {
        type: String, 
        required: true, 
        select: false
    },
    country: {
        type: String, 
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
        type: String, 
        default: null 
    },
    isActive: {
        type: Boolean, 
        default: true,
        index: true,
    },
    premiumExpiresAt: {
        type: Date, 
        default: null, 
        index: true
    },
    auth: {
        lastLoginAt: {
            type: Date, 
            default: null 
        },
        loginAttempts: {
            type: Number, 
            default: 0, 
            select: false 
        },
        lockUntil: {
            type: Date,
            default: null, 
            select: false 
        }
    }
}, baseSchemaOptions);

// Virtuals
userSchema.virtual('isPremium').get(function () {
  return !!this.premiumExpiresAt && this.premiumExpiresAt > new Date();
});

// Indexes
userSchema.index({ createdAt: -1 }); 
userSchema.index({ username: 'text', email: 'text' }); 

export const User = mongoose.model('User', userSchema);