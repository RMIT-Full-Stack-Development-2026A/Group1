import { Transaction } from '../models/transaction.model.js';

export const SubscriptionRepository = {
    // Save a new invoice (when the status is PENDING)
    createTransaction: async (transactionData) => {
        const newTransaction = new Transaction(transactionData);
        return await newTransaction.save();
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

    // Get a user's transaction history with pagination
    getHistoryByUserId: async (userId, page, limit) => {
        const skip = (page - 1) * limit;
        
        const [transactions, total] = await Promise.all([
            Transaction.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Transaction.countDocuments({ userId })
        ]);

        return { transactions, total };
    },

    // Calculate total revenue for the entire server (for the Admin Dashboard)
    getTotalRevenue: async () => {
        const result = await Transaction.aggregate([
            { $match: { status: 'SUCCESS' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        
        // Return 0 if there is no revenue
        return result.length > 0 ? result[0].totalRevenue : 0;
    }
};