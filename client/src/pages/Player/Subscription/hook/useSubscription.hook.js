import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../service/subscription.service';
import { useAuthStore } from '@/stores/auth/AuthStore';
import http from '@/utils/httpHelper';
import { notifyError, notifyLoading, notifyUpdate } from '@/utils/toast.util';

const isPremiumActive = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() > Date.now();
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
    const isPremium = isPremiumActive(user?.premiumExpiresAt);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statusData, txData] = await Promise.all([
                subscriptionService.getStatus(),
                subscriptionService.getTransactions(),
            ]);
            // statusData still fetched for completeness but isPremium derived from AuthStore
            setTransactions(txData ?? []);
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