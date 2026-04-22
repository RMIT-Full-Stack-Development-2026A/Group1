// DTO helpers for wallet and transaction responses.
const toTransactionItem = (transaction) => ({
    id: transaction.id || transaction._id,
    type: transaction.type,
    provider: transaction.provider ?? null,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    externalTransactionId: transaction.externalTransactionId ?? null,
    balanceBefore: transaction.balanceBefore ?? 0,
    balanceAfter: transaction.balanceAfter ?? 0,
    subscriptionPeriodStart: transaction.subscriptionPeriodStart ?? null,
    subscriptionPeriodEnd: transaction.subscriptionPeriodEnd ?? null,
    createdAt: transaction.createdAt
});

export const WalletDTO = {
    toTransactionItem,

    toWalletSummary: ({ balance, recentTransactions }) => ({
        balance: balance ?? 0,
        recentTransactions: Array.isArray(recentTransactions)
            ? recentTransactions.map(toTransactionItem)
            : []
    }),

    toTransactionHistory: (transactions, pagination) => ({
        items: Array.isArray(transactions) ? transactions.map(toTransactionItem) : [],
        total: pagination?.total ?? 0,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 20
    })
};