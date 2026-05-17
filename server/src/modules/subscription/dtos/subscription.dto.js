// DTO helpers for premium subscription responses.
const toHistoryItem = (transaction) => ({
    id: transaction.id || transaction._id,
    type: transaction.type,
    provider: transaction.provider ?? null,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    externalTransactionId: transaction.externalTransactionId ?? null,
    subscriptionPeriodStart: transaction.subscriptionPeriodStart ?? null,
    subscriptionPeriodEnd: transaction.subscriptionPeriodEnd ?? null,
    createdAt: transaction.createdAt
});

export const SubscriptionDTO = {
    toStatus: ({ isPremium, premiumExpiresAt }) => ({
        isPremium: !!isPremium,
        premiumExpiresAt: premiumExpiresAt ?? null
    }),

    toPurchaseResponse: ({ isPremium, premiumExpiresAt, transaction }) => ({
        status: {
            isPremium: !!isPremium,
            premiumExpiresAt: premiumExpiresAt ?? null
        },
        transaction: transaction ? toHistoryItem(transaction) : null
    }),

    toHistoryItem,

    toHistory: (transaction) => ({
        items: transaction ? [toHistoryItem(transaction)] : [],
        total: transaction ? 1 : 0,
        page: 1,  
        limit: 1 
    })
};