import { Transaction } from '../models/transaction.model.js';

export const SubscriptionRepository = {
    /**
     * Creates a new transaction record.
     * @param {Object} transactionData - Transaction payload.
     * @returns {Promise<Object>} Saved transaction.
     */
    createTransaction: async (transactionData) => {
        return await Transaction.create(transactionData);
    },

    /**
     * Finds transaction by external ID.
     * @param {string} orderId - External transaction ID.
     * @returns {Promise<Object>} Found transaction.
     */
    findByExternalId: async (orderId) => {
        return await Transaction.findOne({ orderId });
    },

    /**
     * Updates transaction status.
     * @param {string} orderId - External transaction ID.
     * @param {Object} updateData - Update payload.
     * @returns {Promise<Object>} Updated transaction.
     */
    updateTransactionStatus: async (orderId, updateData) => {
        return await Transaction.findOneAndUpdate(
            { orderId },
            { $set: updateData },
            { returnDocument: 'after' }
        );
    },

    /**
     * Atomically updates a transaction from PENDING to SUCCESS.
     * @param {string} orderId - External transaction ID.
     * @param {Object} updateData - Update payload.
     * @returns {Promise<Object|null>} Updated transaction or null if already processed.
     */
    markSuccessIfPending: async (orderId, updateData) => {
        return await Transaction.findOneAndUpdate(
            { orderId, status: 'PENDING' },
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

    /**
     * Retrieves successful transactions for a user.
     * @param {string} userId - User ID.
     * @param {number} skip - Number of records to skip.
     * @param {number} limit - Maximum number of records to return.
     * @returns {Promise<Object>} Paginated successful transactions.
     */
    getSuccessfulTransactionsByUserId: async (userId, skip = 0, limit = 20) => {
        const filter = {
            userId,
            status: 'SUCCESS'
        };

        const [items, total] = await Promise.all([
            Transaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Transaction.countDocuments(filter)
        ]);

        return { items, total };
    },

    /**
     * Retrieves total successful revenue across all subscriptions.
     * @returns {Promise<number>} Total revenue rounded to 2 decimals.
     */
    getTotalRevenue: async () => {
        const revenueAgg = await Transaction.aggregate([
            { $match: { status: 'SUCCESS' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
            { $project: { _id: 0, totalRevenue: { $round: ['$totalRevenue', 2] } } }
        ]);

        return revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    },
};