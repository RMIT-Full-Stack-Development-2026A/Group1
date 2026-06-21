/**
 * Maps transaction to history item DTO.
 * @param {Object} transaction - Raw transaction data.
 * @returns {Object} History item payload.
 */
const toHistoryItem = (transaction) => ({
    id: transaction.id || transaction._id,
    type: transaction.type,
    provider: transaction.provider ?? null,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    orderId: transaction.orderId ?? transaction.externalTransactionId ?? null,
    externalTransactionId: transaction.externalTransactionId ?? null,
    subscriptionPeriodStart: transaction.subscriptionPeriodStart ?? null,
    subscriptionPeriodEnd: transaction.subscriptionPeriodEnd ?? null,
    createdAt: transaction.createdAt
});

export const SubscriptionDTO = {
    /**
     * Maps user to status DTO.
     * @param {Object} user - User object.
     * @returns {Object} Status payload.
     */
    toStatus: ({ isPremium, premiumExpiresAt }) => ({
        isPremium: !!isPremium,
        premiumExpiresAt: premiumExpiresAt ?? null
    }),

    /**
     * Maps data to purchase response DTO.
     * @param {Object} data - User and transaction data.
     * @returns {Object} Purchase response payload.
     */
    toPurchaseResponse: ({ isPremium, premiumExpiresAt, transaction }) => ({
        status: {
            isPremium: !!isPremium,
            premiumExpiresAt: premiumExpiresAt ?? null
        },
        transaction: transaction ? toHistoryItem(transaction) : null
    }),

    toHistoryItem,

    /**
     * Maps transaction to history list DTO.
     * @param {Object} transaction - Raw transaction data.
     * @returns {Object} History list payload.
     */
    toHistory: (transaction) => ({
        items: transaction ? [toHistoryItem(transaction)] : [],
        total: transaction ? 1 : 0,
        page: 1,  
        limit: 1 
    }),

    /**
     * Maps successful transaction list to history list DTO.
     * @param {Array<Object>} items - Transaction list.
     * @param {Object} meta - Pagination metadata.
     * @returns {Object} History list payload.
     */
    toHistoryList: (items, meta = {}) => ({
        items: Array.isArray(items) ? items.map(toHistoryItem) : [],
        total: meta.total ?? 0,
        page: meta.page ?? 1,
        limit: meta.limit ?? 20
    })
};