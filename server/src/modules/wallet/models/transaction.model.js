import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'SUBSCRIPTION'],
        required: true
    },
    amount: {
        type: Number,
        required: true // e.g., 10 for the $10 USD fee
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

export const Transaction = mongoose.model('Transaction', transactionSchema);