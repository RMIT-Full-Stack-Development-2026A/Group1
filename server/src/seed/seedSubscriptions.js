import { Transaction } from '../modules/subscription/models/transaction.model.js';

/**
 * Seeds a successful subscription transaction for a premium user.
 * @param {Object} premiumUser - Premium user document.
 * @returns {Promise<void>}
 */
export const seedSubscriptions = async (premiumUser) => {
    

    if (!premiumUser) {
        
        return;
    }

    const start = new Date();
    const end = new Date(premiumUser.premiumExpiresAt);

    const transactionData = {
        userId: premiumUser._id,
        type: 'SUBSCRIPTION',
        provider: 'PAYPAL',
        amount: 10.00,
        currency: 'USD',
        status: 'SUCCESS',
        externalTransactionId: `PAYID-DEMO-${Date.now()}`,
        subscriptionPeriodStart: start,
        subscriptionPeriodEnd: end,
    };

    await Transaction.findOneAndUpdate(
        { userId: premiumUser._id },
        { $set: transactionData },
        { upsert: true, new: true }
    );

    
};