import { Transaction } from '../models/transaction.model.js';

export const SubscriptionRepository = {
    /**
     * Upserts a new transaction.
     * @param {Object} transactionData - Transaction payload.
     * @returns {Promise<Object>} Saved transaction.
     */
    createTransaction: async (transactionData) => {
        return await Transaction.findOneAndUpdate(
            { userId: transactionData.userId },
            { $set: transactionData },
            { upsert: true, returnDocument: 'after' }
        );
    },

    /**
     * Finds transaction by external ID.
     * @param {string} orderId - External transaction ID.
     * @returns {Promise<Object>} Found transaction.
     */
    findByExternalId: async (orderId) => {
        return await Transaction.findOne({ externalTransactionId: orderId });
    },

    /**
     * Updates transaction status.
     * @param {string} orderId - External transaction ID.
     * @param {Object} updateData - Update payload.
     * @returns {Promise<Object>} Updated transaction.
     */
    updateTransactionStatus: async (orderId, updateData) => {
        return await Transaction.findOneAndUpdate(
            { externalTransactionId: orderId },
            { $set: updateData },
            { returnDocument: 'after' }
        );
    },

    /**
     * Retrieves active transaction for a user.
     * @param {string} userId - User ID.
     * @returns {Promise<Object>} Active transaction.
     */
    getActiveTransactionByUserId: async (userId) => {
        return await Transaction.findOne({ 
            userId,
            status: 'SUCCESS',
            subscriptionPeriodEnd: { $exists: true, $gt: new Date() },
        });
    },
};