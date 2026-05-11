import React from 'react';
import PropTypes from 'prop-types';
import SoundButton from '@/components/reusable/sound/SoundButton';
import { useAuthStore } from '@/stores/auth/AuthStore';

export default function SubscriptionStatus({ isPremium, isRedirecting, onSubscribe }) {
    const storeExpires = useAuthStore((s) => s.user?.premiumExpiresAt);
    const expires = storeExpires;
    const isStillActive = isPremium
        ? (expires ? new Date(expires).getTime() > Date.now() : true)
        : false;

    return (
        <div id="subscription-status" className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 bg-[#1e1e2c] border border-[#3d484d] p-6 relative">
                {isStillActive ? (
                    <div className="flex flex-col w-full">
                        {/* Panel Trạng thái (Status Highlight Box) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-[#a8ff78]/30 bg-[#a8ff78]/[0.03] px-5 py-4 mb-6 shadow-[0_0_15px_rgba(168,255,120,0.05)]">
                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                <span className="font-mono text-[#a8ff78] animate-pulse">●</span>
                                <span className="font-headline text-sm text-[#a8ff78] tracking-widest">NEURO-ELITE ACTIVE</span>
                            </div>

                            {expires && (
                                <div className="sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-[#a8ff78]/50 pl-3 sm:pl-0 sm:pr-3">
                                    <p className="font-mono text-[9px] text-[#879398] uppercase tracking-widest mb-1">
                                        ACCESS VALID UNTIL
                                    </p>
                                    <p className="font-mono text-xs text-[#a8ff78] uppercase tracking-widest">
                                        {new Date(expires).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#11111a] border border-[#3d484d] p-5 space-y-4">
                            <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest leading-relaxed flex gap-3">
                                <span className="text-[#4cc9f0] shrink-0">SYS.LOG   {'>'}</span>
                                <span>Your premium access is enabled. Manage your recurring subscription below.</span>
                            </p>
                            <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest leading-relaxed flex gap-3">
                                <span className="text-[#fad100] shrink-0">SYS.WARN {'>'}</span>
                                <span>Your subscription will expire one month from now. Purchase again to prevent interruption.</span>
                            </p>
                        </div>
                    </div>
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
                    <div className="flex gap-2"><span className="text-[#fad100]">[*]</span><p>Require manual renewal.</p></div>
                    <div className="flex gap-2"><span className="text-[#93e2ff]">[i]</span><p>Email confirmation is sent after payment success.</p></div>
                    <div className="flex gap-2"><span className="text-[#ffb4ab]">[!]</span><p>Subscription will expire on the specified date.</p></div>
                    <div className="flex gap-2"><span className="text-[#a8ff78]">[+]</span><p>Secure payment processing via Paypal.</p></div>
                </div>
            </div>
        </div>
    );
}

SubscriptionStatus.propTypes = {
    isPremium: PropTypes.bool.isRequired,
    isRedirecting: PropTypes.bool.isRequired,
    onSubscribe: PropTypes.func.isRequired,
};
