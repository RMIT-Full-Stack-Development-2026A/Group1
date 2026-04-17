// Route: /subscription
// import React from 'react';
import HeroSection from '@/pages/Player/Subscription/sub-components/HeroSection';   
import PricingPlans from '@/pages/Player/Subscription/sub-components/PricingPlans';
import WalletSection from '@/pages/Player/Subscription/sub-components/WalletSection';
import TransactionHistory from '@/pages/Player/Subscription/sub-components/TransactionHistory';
import { useSubscription } from './hook/useSubscription.hook';

const Subscription = () => {
    const {
        walletBalance,
        isPremium,
        transactions,
        depositAmount,
        setDepositAmount,
        handleDeposit,
        handleSubscribe
    } = useSubscription();

    return (
        <main className="pt-8 pb-20 px-6 max-w-[1440px] mx-auto min-h-screen bg-background text-on-surface">
            <HeroSection />
            
            <PricingPlans 
                isPremium={isPremium} 
                onSubscribe={handleSubscribe} 
            />
            
            <WalletSection 
                walletBalance={walletBalance}
                depositAmount={depositAmount}
                setDepositAmount={setDepositAmount}
                onDeposit={handleDeposit}
                onSubscribe={handleSubscribe}
            />
            
            <TransactionHistory transactions={transactions} />
        </main>
    );
};

export default Subscription;