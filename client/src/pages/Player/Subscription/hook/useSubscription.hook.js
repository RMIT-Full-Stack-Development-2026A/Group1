import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../service/subscription.service';

/**
 * hook for managing subscription state and actions
 * consumed by: pages/Player/Subscription/index.jsx
 */
export const useSubscription = () => {
    const [walletBalance, setWalletBalance] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [depositAmount, setDepositAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [walletData, txData] = await Promise.all([
                subscriptionService.getWalletStatus(),
                subscriptionService.getTransactions(),
            ]);
            setWalletBalance(walletData.walletBalance ?? 0);
            setIsPremium(walletData.isPremium ?? false);
            setTransactions(txData ?? []);
        } catch (err) {
            console.error('[useSubscription] loadInitialData error:', err);
            setError(err?.data?.message ?? 'Failed to load subscription data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleDeposit = useCallback(async () => {
        const amount = parseFloat(depositAmount);
        if (!amount || amount <= 0) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await subscriptionService.deposit(amount);
            setWalletBalance(result.walletBalance);
            setDepositAmount('');
            // Refresh transaction log sau khi nạp
            const txData = await subscriptionService.getTransactions();
            setTransactions(txData ?? []);
        } catch (err) {
            console.error('[useSubscription] handleDeposit error:', err);
            setError(err?.data?.message ?? 'Deposit failed.');
        } finally {
            setIsLoading(false);
        }
    }, [depositAmount]);

    const handleSubscribe = useCallback(async () => {
        if (walletBalance < 10) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await subscriptionService.subscribe();
            setIsPremium(result.isPremium);
            // Wallet bị trừ $10 — reload lại để sync balance chính xác
            const walletData = await subscriptionService.getWalletStatus();
            setWalletBalance(walletData.walletBalance ?? 0);
            const txData = await subscriptionService.getTransactions();
            setTransactions(txData ?? []);
        } catch (err) {
            console.error('[useSubscription] handleSubscribe error:', err);
            setError(err?.data?.message ?? 'Subscription failed.');
        } finally {
            setIsLoading(false);
        }
    }, [walletBalance]);

    return {
        // State
        walletBalance,
        isPremium,
        transactions,
        depositAmount,
        isLoading,
        error,
        // Setters
        setDepositAmount,
        // Handlers
        handleDeposit,
        handleSubscribe,
    };
};