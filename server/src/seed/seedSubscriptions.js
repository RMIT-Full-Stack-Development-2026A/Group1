import { Transaction } from '../modules/subscription/models/transaction.model.js';

export const seedSubscriptions = async (premiumUser) => {
    console.log('Seeding Subscriptions...');

    if (!premiumUser) {
        console.log('No premium user found to seed subscriptions.');
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

    console.log(`Subscription seeded for user: ${premiumUser.username}`);
};