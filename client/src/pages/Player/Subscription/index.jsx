// Route: /subscription
// import React from 'react';
import HeroSection from '@/pages/Player/Subscription/sub-components/HeroSection';   
import PricingPlans from '@/pages/Player/Subscription/sub-components/PricingPlans';
import SubscriptionStatus from '@/pages/Player/Subscription/sub-components/SubscriptionStatus';
import TransactionHistory from '@/pages/Player/Subscription/sub-components/TransactionHistory';
import { useSubscription } from './hook/useSubscription.hook';

const Subscription = () => {
    const {
        isPremium,
        transactions,
        isRedirecting,
        isLoading,
        error,
        handleSubscribe,
    } = useSubscription();

    const handleCancelSubscription = () => {
        // TODO: Wire cancellation endpoint when backend flow is available.
    };

    return (
        <main className="pt-8 pb-20 px-6 max-w-[1440px] mx-auto min-h-screen bg-background text-on-surface">
            {error && (
                <div className="mb-6 border border-[#ffb4ab] bg-[#2b1515] text-[#ffb4ab] font-mono text-xs px-4 py-3 uppercase tracking-wider">
                    {error}
                </div>
            )}

            <HeroSection />
            
            <PricingPlans 
                isPremium={isPremium} 
                onSubscribe={handleSubscribe} 
            />
            
            <SubscriptionStatus
                isPremium={isPremium}
                isRedirecting={isRedirecting}
                onSubscribe={handleSubscribe}
                onCancel={handleCancelSubscription}
            />
            
            <TransactionHistory transactions={transactions} />
        </main>
    );
};

export default Subscription;