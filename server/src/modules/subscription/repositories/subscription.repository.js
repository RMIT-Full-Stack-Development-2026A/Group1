import { Transaction } from '../models/transaction.model.js';

export const SubscriptionRepository = {
    // Save a new invoice (when the status is PENDING)
    createTransaction: async (transactionData) => {
        // Upsert to ensure a single active Transaction per user
        return await Transaction.findOneAndUpdate(
            { userId: transactionData.userId },
            { $set: transactionData },
            { upsert: true, returnDocument: 'after' }
        );
    },

    // Find an invoice by the PayPal order ID
    findByExternalId: async (orderId) => {
        return await Transaction.findOne({ externalTransactionId: orderId });
    },

    // Update the invoice status
    updateTransactionStatus: async (orderId, updateData) => {
        return await Transaction.findOneAndUpdate(
            { externalTransactionId: orderId },
            { $set: updateData },
            { returnDocument: 'after' }
        );
    },

    // Get the user's current active subscription details
    getActiveTransactionByUserId: async (userId) => {
        return await Transaction.findOne({ 
            userId,
            status: 'SUCCESS',
            subscriptionPeriodEnd: { $exists: true, $gt: new Date() },
        });
    },
};