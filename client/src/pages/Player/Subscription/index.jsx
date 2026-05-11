// Route: /subscription
import React, { useState } from 'react';
import HeroSection from '@/pages/Player/Subscription/sub-components/HeroSection';
import PricingPlanFree from '@/pages/Player/Subscription/sub-components/PricingPlanFree';
import PricingPlanPremium from '@/pages/Player/Subscription/sub-components/PricingPlanPremium';
import SubscriptionStatus from '@/pages/Player/Subscription/sub-components/SubscriptionStatus';
import TransactionHistory from '@/pages/Player/Subscription/sub-components/TransactionHistory';
import AlreadyPremiumModal from '@/pages/Player/Subscription/sub-components/AlreadyPremiumModal';
import Footer from '@/components/reusable/Footer';
import { useSubscription } from './hook/useSubscription.hook';
import { useAuthStore } from '@/stores/auth/AuthStore';

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

    // Scroll to SubscriptionStatus section — used by both pricing cards.
    // This does NOT trigger payment. Payment is only triggered inside SubscriptionStatus.
    const scrollToStatus = () => {
        document.getElementById('subscription-status')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // The actual payment entry point. Only SubscriptionStatus calls this.
    // FE guard: if already premium, show informational modal and abort.
    // BE independently enforces this with 409 ALREADY_PREMIUM — FE guard is UX only.
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
        <div>
            <main className="pt-8 pb-20 px-6 max-w-[1440px] mx-auto min-h-screen bg-background text-on-surface">
                {error && (
                    <div className="mb-6 border border-[#ffb4ab] bg-[#2b1515] text-[#ffb4ab] font-mono text-xs px-4 py-3 uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <HeroSection />

                {/* Pricing cards — display only, scroll to buy section on click */}
                <div className="grid md:grid-cols-2 gap-8 mb-16 items-stretch">
                    <PricingPlanFree
                        isPremium={isPremium}
                        onScrollToStatus={scrollToStatus}
                    />
                    <PricingPlanPremium
                        isPremium={isPremium}
                        onScrollToStatus={scrollToStatus}
                    />
                </div>

                {/* Buy section — the ONE place that triggers payment */}
                <SubscriptionStatus
                    isPremium={isPremium}
                    isRedirecting={isRedirecting}
                    onSubscribe={handleSubscribeGuarded}
                    onCancel={() => {/* TODO: wire cancellation endpoint */}}
                />

                <TransactionHistory transactions={transactions?.items || []} />

                <AlreadyPremiumModal
                    isOpen={showAlreadyPremiumModal}
                    onClose={() => setShowAlreadyPremiumModal(false)}
                    premiumExpiresAt={premiumExpiresAt}
                />

            </main>
            <Footer />
        </div>
    );
};

export default Subscription;