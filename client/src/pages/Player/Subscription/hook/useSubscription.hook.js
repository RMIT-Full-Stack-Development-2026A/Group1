import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../service/subscription.service';

/**
 * hook for managing subscription state and actions
 * consumed by: pages/Player/Subscription/index.jsx
 */
export const useSubscription = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statusData, txData] = await Promise.all([
                subscriptionService.getStatus(),
                subscriptionService.getTransactions(),
            ]);
            setIsPremium(statusData?.isPremium ?? false);
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
        try {
            const result = await subscriptionService.createOrder();
            const approveLink = result?.data?.approveLink;
            if (approveLink) {
                window.location.href = approveLink;
                return;
            }

            throw new Error('Missing approval link from subscription response.');
        } catch (err) {
            console.error('[useSubscription] handleSubscribe error:', err);
            setError(err?.data?.message ?? err?.message ?? 'Subscription redirect failed.');
            setIsRedirecting(false);
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