import mongoose from 'mongoose';
import { baseSchemaOptions } from '../../../utils/baseSchemaOptions.js';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // User who owns this transaction
        ref: 'User', 
        required: true,
        unique: true
    },

    type: {
        type: String, // Business category of transaction
        enum: ['SUBSCRIPTION'], 
        required: true, 
        index: true 
    },

    provider: {
        type: String, // Payment source/provider used for this transaction
        enum: ['STRIPE', 'PAYPAL'], 
        required: true, 
        default: 'PAYPAL' 
    },

    amount: {
        type: Number, // Money amount for this transaction
        required: true, 
        min: 0 // Prevent negative stored amount
    },

    currency: {
        type: String, // Currency code for financial clarity
        default: 'USD' 
    },

    status: {
        type: String, // Processing outcome of the transaction
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], 
        required: true, 
        default: 'PENDING', 
        index: true 
    },

    externalTransactionId: {
        type: String, // ID from Stripe/PayPal/other provider if one exists
        default: null, 
        index: true,
        sparse: true 
    },

    subscriptionPeriodStart: {
        type: Date, // Start date of premium period for subscription transactions
        default: null 
    },

    subscriptionPeriodEnd: {
        type: Date, // End date of premium period for subscription transactions
        default: null, 
        index: true
    },

    metadata: {
        type: mongoose.Schema.Types.Mixed, // Extra provider-specific details if needed
        default: {}
    }
}, baseSchemaOptions);

transactionSchema.index({ userId: 1, createdAt: -1 }); // Fast latest-transactions lookup per user
transactionSchema.index({ userId: 1, type: 1, createdAt: -1 }); // Fast filtered history by user and transaction type
// Auto-delete expired subscription transactions when subscriptionPeriodEnd passes
transactionSchema.index({ subscriptionPeriodEnd: 1 }, { expireAfterSeconds: 0 });

export const Transaction = mongoose.model('Transaction', transactionSchema);