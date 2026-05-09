import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../service/subscription.service';
import { useAuthStore } from '@/stores/AuthStore';
import http from '@/utils/httpHelper';
import { notifyDismiss, notifyError, notifyLoading, notifyUpdate } from '@/utils/toast.util';

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
        let verifyingToastId;
        let pollIntervalId;
        try {
            loadingToastId = notifyLoading('Connecting to PayPal...');
            const createOrderResponse = await http.post('/subscription/create-order', {}, { silent: true });
            const createOrderData = createOrderResponse?.data ?? createOrderResponse;
            const approveLink = createOrderData?.approveLink;
            const orderId = createOrderData?.orderId;

            if (!approveLink || !orderId) {
                throw new Error('Missing approval link from subscription response.');
            }

            notifyUpdate(loadingToastId, 'success', 'Redirecting to PayPal. Complete payment in the popup.');

            const left = (window.screen.width / 2) - 300;
            const top = (window.screen.height / 2) - 350;
            const popup = window.open(
                approveLink,
                'paypal-subscription',
                `width=600,height=700,left=${left},top=${top},resizable=yes,scrollbars=yes`
            );

            if (!popup || popup.closed) {
                notifyDismiss(loadingToastId);
                notifyError('Popup was blocked. Please allow popups.');
                setError('Popup was blocked. Please allow popups.');
                setIsRedirecting(false);
                return;
            }

            popup.focus();

            pollIntervalId = window.setInterval(async () => {
                if (!popup || popup.closed) {
                    window.clearInterval(pollIntervalId);
                    notifyDismiss(loadingToastId);
                    verifyingToastId = notifyLoading('Verifying your payment...');

                    try {
                        await http.post('/subscription/capture-order', { orderId }, { silent: true });
                        notifyUpdate(verifyingToastId, 'success', '🎉 Congratulations! Your NEURO-ELITE subscription is now active.');
                        await loadData();
                    } catch (captureError) {
                        console.error('[useSubscription] capture-order error:', captureError);
                        notifyUpdate(verifyingToastId, 'error', '⚠️ Payment was canceled or declined. No charges were made.');
                        setError(captureError?.data?.message ?? captureError?.message ?? 'Subscription verification failed.');
                    } finally {
                        setIsRedirecting(false);
                    }
                }
            }, 1000);
        } catch (err) {
            if (pollIntervalId) {
                window.clearInterval(pollIntervalId);
            }
            setIsRedirecting(false);
            if (loadingToastId) {
                notifyUpdate(loadingToastId, 'error', err?.message ?? 'Subscription redirect failed.');
            }
            if (verifyingToastId) {
                notifyDismiss(verifyingToastId);
            }
            // Detect the ALREADY_PREMIUM rejection from the backend
            if (err?.data?.error === 'ALREADY_PREMIUM' || err?.status === 409) {
                return 'ALREADY_PREMIUM'; // signal to the caller to show the modal
            }
            setError(err?.data?.message ?? err?.message ?? 'Subscription redirect failed.');
        }
    }, [loadData]);

    return {
        isPremium,
        transactions,
        isLoading,
        isRedirecting,
        error,
        handleSubscribe,
    };
};