import mongoose from "mongoose";
import { baseSchemaOptions } from "../../../utils/baseSchemaOptions";

const userSchema = new mongoose.Schema({
  username: {
    type: String, // Account username used for login/display
    required: true, // User must provide it when registering
    unique: true, // No two users can share the same username
    trim: true, // Remove accidental spaces at the beginning/end
    match: /^[a-zA-Z0-9_-]+$/, // Only allow letters, numbers, underscore, hyphen
    minlength: 3, // Prevent very short usernames
    maxlength: 30, // Prevent overly long usernames
    index: true // Speeds up username lookup/search
  },

  email: {
    type: String, // Main email address of the account
    required: true, // Required for registration/login/contact
    unique: true, // Each email can belong to only one account
    lowercase: true, // Normalize email casing for consistent lookup
    trim: true, // Remove accidental spaces
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format validation
    maxlength: 254, // Safe standard max length for emails
    index: true // Speeds up login/search by email
  },

  passwordHash: {
    type: String, // Stores hashed password, never plain text password
    required: true, // Account cannot exist without a password hash
    select: false // Hide by default so it is not returned in normal queries
  },

  country: {
    type: String, // User-selected country from registration/profile
    required: true, // Required by the SRS
    trim: true // Remove accidental spaces
  },

  role: {
    type: String, // Defines whether user is PLAYER or ADMIN
    enum: ['PLAYER', 'ADMIN'], // Restrict allowed values
    default: 'PLAYER', // New accounts are players unless created as admin manually
    index: true // Helps role-based filtering in admin queries
  },

  avatar: {
    type: String, // URL/path to the user's uploaded avatar image
    default: null // Null means user has not uploaded one yet
  },

  isActive: {
    type: Boolean, // Whether the account is allowed to use the system
    default: true, // New accounts start as active
    index: true // Helps admin quickly filter active/inactive accounts
  },

  premiumExpiresAt: {
    type: Date, // Date-time when premium membership ends
    default: null, // Null means user has never subscribed or currently has no premium
    index: true // Useful for checking premium expiration efficiently
  },

  wallet: {
    balance: {
      type: Number, // Current wallet balance snapshot for fast reads
      default: 0, // New user starts with zero balance
      min: 0 // Prevent negative wallet values at schema level
    }
  },

  auth: {
    lastLoginAt: {
      type: Date, // Last successful login time
      default: null // Null before the first login
    },
    loginAttempts: {
      type: Number, // Number of recent failed login attempts
      default: 0 // Starts at zero
    },
    lockUntil: {
      type: Date, // If set in the future, the account is temporarily locked from login
      default: null // Null means not locked
    }
  }
}, baseSchemaOptions);

userSchema.virtual('isPremium').get(function () {
  return !!this.premiumExpiresAt && this.premiumExpiresAt > new Date();
  // True only when premium expiry exists and is still in the future
});

userSchema.index({ createdAt: -1 }); // Helps sort newest users first
userSchema.index({ username: 'text', email: 'text' }); // Helps text search in admin/player listings

export const User = mongoose.model('User', userSchema);