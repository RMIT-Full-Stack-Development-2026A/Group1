// Route: /subscription
import React, { useState } from 'react';
import HeroSection from '@/pages/Player/Subscription/sub-components/HeroSection';
import PricingPlans from '@/pages/Player/Subscription/sub-components/PricingPlans';
import SubscriptionStatus from '@/pages/Player/Subscription/sub-components/SubscriptionStatus';
import TransactionHistory from '@/pages/Player/Subscription/sub-components/TransactionHistory';
import AlreadyPremiumModal from '@/pages/Player/Subscription/sub-components/AlreadyPremiumModal';
import { useSubscription } from './hook/useSubscription.hook';
import { useAuthStore } from '@/stores/AuthStore';

const Subscription = () => {
    const {
        isPremium,
        transactions,
        isRedirecting,
        isLoading,
        error,
        handleSubscribe,
    } = useSubscription();

    // premiumExpiresAt is used to display the expiry date inside AlreadyPremiumModal
    const premiumExpiresAt = useAuthStore((s) => s.user?.premiumExpiresAt ?? null);

    const [showAlreadyPremiumModal, setShowAlreadyPremiumModal] = useState(false);

    const handleCancelSubscription = () => {
        // TODO: Wire cancellation endpoint when backend flow is available.
    };

    // Gateway: intercept the subscribe action for premium users.
    // If already premium → show informational modal instead of triggering PayPal.
    const handleSubscribeGuarded = async () => {
        if (isPremium) {
            setShowAlreadyPremiumModal(true);
            return;
        }
        const signal = await handleSubscribe();
        if (signal === 'ALREADY_PREMIUM') {
            setShowAlreadyPremiumModal(true);
        }
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
                onSubscribe={handleSubscribeGuarded}
            />

            <SubscriptionStatus
                isPremium={isPremium}
                isRedirecting={isRedirecting}
                onSubscribe={handleSubscribeGuarded}
                onCancel={handleCancelSubscription}
            />

            <TransactionHistory transactions={transactions?.items || []} />

            <AlreadyPremiumModal
                isOpen={showAlreadyPremiumModal}
                onClose={() => setShowAlreadyPremiumModal(false)}
                premiumExpiresAt={premiumExpiresAt}
            />
        </main>
    );
};

export default Subscription;