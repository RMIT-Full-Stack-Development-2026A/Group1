import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../service/subscription.service';
import { useAuthStore } from '@/stores/auth/AuthStore';
import http from '@/utils/httpHelper';
import { notifyError, notifyLoading, notifyUpdate } from '@/utils/toast.util';

// A user is considered premium if:
// 1. premiumExpiresAt exists and is in the future, OR
// 2. user.isPremium is explicitly true (in case expiresAt is missing from store)
const isPremiumActive = (user) => {
    if (!user) return false;
    if (user.premiumExpiresAt) {
        return new Date(user.premiumExpiresAt).getTime() > Date.now();
    }
    // Fallback: trust the isPremium flag from the backend
    return user.isPremium === true;
};

/**
 * hook for managing subscription state and actions
 * consumed by: pages/Player/Subscription/index.jsx
 */
export const useSubscription = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState(null);
    const user = useAuthStore((state) => state.user);
    const isPremium = isPremiumActive(user);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statusRes, txData] = await Promise.all([
                subscriptionService.getStatus(),
                subscriptionService.getTransactions(),
            ]);

            // If AuthStore is missing premiumExpiresAt but backend confirms premium,
            // force a user refresh so the store is in sync before rendering.
            const backendPremiumExpiresAt = statusRes?.data?.premiumExpiresAt ?? statusRes?.premiumExpiresAt;
            const currentUser = useAuthStore.getState().user;
            if (backendPremiumExpiresAt && !currentUser?.premiumExpiresAt) {
                await useAuthStore.getState().refreshUser();
            }

            const items = txData?.data?.items ?? txData?.items ?? [];

            // Normalize transactions for UI fields expected by TransactionHistory
            const normalize = (tx) => {
                const orderId = tx.orderId || tx.externalTransactionId || tx.id || tx._id || null;
                const createdAt = tx.createdAt || tx.createdAtUtc || tx.created || null;
                const amount = tx.amount ?? tx.total ?? null;
                const currency = tx.currency || 'USD';
                const planName = tx.planName || tx.plan || tx.description || null;
                const subscriptionPeriodEnd = tx.subscriptionPeriodEnd || tx.expiresAt || null;
                // fallback: use premiumExpiresAt from statusRes if available
                const backendPremiumExpiresAt = statusRes?.data?.premiumExpiresAt ?? statusRes?.premiumExpiresAt ?? null;

                let expiresAt = subscriptionPeriodEnd || backendPremiumExpiresAt || null;
                // If still missing, compute expiresAt = createdAt + 30 days
                if (!expiresAt && createdAt) {
                    try {
                        const createdMs = new Date(createdAt).getTime();
                        if (!Number.isNaN(createdMs)) {
                            const expiresMs = createdMs + 30 * 24 * 60 * 60 * 1000;
                            expiresAt = new Date(expiresMs).toISOString();
                        }
                    } catch (e) {
                        expiresAt = null;
                    }
                }

                return {
                    ...tx,
                    orderId,
                    createdAt,
                    amount,
                    currency,
                    planName,
                    expiresAt,
                    status: tx.status || tx.state || null,
                };
            };

            setTransactions(items.map(normalize));
        } catch (err) {
            console.error('[useSubscription] loadData error:', err);
            setError(err?.data?.message ?? 'Failed to load subscription data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubscribe = useCallback(async () => {
        setIsRedirecting(true);
        setError(null);
        let loadingToastId;
        try {
            loadingToastId = notifyLoading('Connecting to PayPal...');
            const createOrderResponse = await http.post('/subscription/create-order', {}, { silent: true });
            const createOrderData = createOrderResponse?.data ?? createOrderResponse;
            const approveLink = createOrderData?.approveLink;

            if (!approveLink) {
                throw new Error('Missing approval link from subscription response.');
            }

            notifyUpdate(loadingToastId, 'success', 'Redirecting to PayPal...');
            // Redirect current tab — PayPal will return to /success
            window.location.href = approveLink;
            // Do NOT set isRedirecting = false here; the page is leaving
        } catch (err) {
            setIsRedirecting(false);
            if (loadingToastId) {
                notifyUpdate(loadingToastId, 'error', err?.message ?? 'Subscription redirect failed.');
            }
            if (err?.data?.error === 'ALREADY_PREMIUM' || err?.status === 409) {
                return 'ALREADY_PREMIUM';
            }
            setError(err?.data?.message ?? err?.message ?? 'Subscription redirect failed.');
        }
    }, []);

    return {
        isPremium,
        transactions,
        isLoading,
        isRedirecting,
        error,
        handleSubscribe,
    };
};