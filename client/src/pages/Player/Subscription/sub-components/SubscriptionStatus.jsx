import React from 'react';
import PropTypes from 'prop-types';
import SoundButton from '@/components/reusable/sound/SoundButton';
import { useAuthStore } from '@/stores/auth/AuthStore';

export default function SubscriptionStatus({ isPremium, isRedirecting, onSubscribe, onCancel }) {
    const storeExpires = useAuthStore((s) => s.user?.premiumExpiresAt);
    const expires = storeExpires;
    const isStillActive = isPremium
        ? (expires ? new Date(expires).getTime() > Date.now() : true)
        : false;

    return (
        <div id="subscription-status" className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 bg-[#1e1e2c] border border-[#3d484d] p-6 relative">
                {isStillActive ? (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[#a8ff78]">●</span>
                            <span className="font-headline text-sm text-[#a8ff78]">NEURO-ELITE ACTIVE</span>
                        </div>
                        {expires && (
                            <p className="font-mono text-[11px] text-[#a8ff78] uppercase tracking-widest mb-2">
                                ACCESS VALID UNTIL: {new Date(expires).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        )}
                        <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest mb-8">
                            Your premium access is enabled. Manage your recurring subscription below.
                        </p>
                        <SoundButton
                            onClick={onCancel}
                            className="w-full border border-[#ffb4ab] text-[#ffb4ab] font-headline text-xs py-4 hover:bg-[#ffb4ab]/10 transition-colors"
                        >
                            CANCEL SUBSCRIPTION
                        </SoundButton>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[#fad100]">●</span>
                            <span className="font-headline text-sm text-[#fad100]">PREMIUM UPGRADE READY</span>
                        </div>
                        <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest mb-8 leading-relaxed">
                            You will be redirected to our secure payment gateway. Confirmation email sent on success.
                        </p>
                        <SoundButton
                            onClick={onSubscribe}
                            disabled={isRedirecting}
                            className="w-full bg-[#fad100] text-[#6d5a00] font-headline text-xs py-4 active:translate-x-[2px] active:translate-y-[2px] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isRedirecting ? 'REDIRECTING TO PAYMENT...' : 'SUBSCRIBE NOW — $10/MONTH'}
                        </SoundButton>
                    </>
                )}
            </div>

            <div className="bg-[#1a1a28] border border-[#3d484d] p-6">
                <h3 className="font-headline text-[10px] text-[#93e2ff] mb-4">SYSTEM NOTICES</h3>
                <div className="space-y-4 font-mono text-[11px] text-[#879398] uppercase tracking-wider">
                    <div className="flex gap-2"><span className="text-[#fad100]">[*]</span><p>Billing renews monthly.</p></div>
                    <div className="flex gap-2"><span className="text-[#93e2ff]">[i]</span><p>Email confirmation is sent after payment success.</p></div>
                    <div className="flex gap-2"><span className="text-[#ffb4ab]">[!]</span><p>Cancel anytime from your account settings.</p></div>
                    <div className="flex gap-2"><span className="text-[#a8ff78]">[+]</span><p>Secure payment processing via Stripe.</p></div>
                </div>
            </div>
        </div>  
    );
}

SubscriptionStatus.propTypes = {
    isPremium: PropTypes.bool.isRequired,
    isRedirecting: PropTypes.bool.isRequired,
    onSubscribe: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
