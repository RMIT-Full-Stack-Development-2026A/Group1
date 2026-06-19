import mongoose from 'mongoose';
import { baseSchemaOptions } from '../../../utils/baseSchemaOptions.js';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    type: {
        type: String,
        enum: ['SUBSCRIPTION'], 
        required: true, 
        index: true 
    },
    provider: {
        type: String,
        enum: ['STRIPE', 'PAYPAL'], 
        required: true, 
        default: 'PAYPAL' 
    },
    amount: {
        type: Number,
        required: true, 
        min: 0 
    },
    currency: {
        type: String,
        default: 'USD' 
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], 
        required: true, 
        default: 'PENDING', 
        index: true 
    },
    orderId: {
        type: String,
        default: null,
        unique: true, // 'unique' automatically creates an index
        index: true,
        sparse: true
    },
    externalTransactionId: {
        type: String,
        default: null, 
        index: true,
        sparse: true 
    },
    subscriptionPeriodStart: {
        type: Date,
        default: null 
    },
    subscriptionPeriodEnd: {
        type: Date,
        default: null, 
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, baseSchemaOptions);

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 }); 
transactionSchema.index({ userId: 1, type: 1, createdAt: -1 }); 

// TTL index for expiration
transactionSchema.index({ subscriptionPeriodEnd: 1 }, { expireAfterSeconds: 0 });

export const Transaction = mongoose.model('Transaction', transactionSchema);