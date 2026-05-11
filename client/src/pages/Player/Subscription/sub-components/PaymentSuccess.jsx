import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import subscriptionService from '../service/subscription.service';
import { useAuthStore } from '@/stores/auth/AuthStore';
import SoundButton from '@/components/reusable/sound/SoundButton';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasCaptured = useRef(false);
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'already_captured'
    const [error, setError] = useState(null);
    const [premiumExpiresAt, setPremiumExpiresAt] = useState(null);
    const [navigated, setNavigated] = useState(false);

    const token = searchParams.get('token');

    const runCapture = async () => {
        setStatus('loading');
        setError(null);
        try {
            const result = await subscriptionService.captureOrder(token);
            const expiresAt = result?.data?.status?.premiumExpiresAt;
            setPremiumExpiresAt(expiresAt ? new Date(expiresAt).toLocaleDateString() : null);
            // After confirming capture is successful, refresh user from backend
            await useAuthStore.getState().refreshUser();
            setStatus('success');
        } catch (err) {
            const errorCode = err?.data?.error ?? err?.data?.code ?? null;
            if (errorCode === 'ALREADY_CAPTURED') {
                setStatus('already_captured');
                await useAuthStore.getState().refreshUser();
            } 
            // set appear time for around 2.5s
            else {
                setTimeout(() => {
                    setError(err?.data?.message ?? err?.message ?? 'Payment capture failed. Please contact support.');
                    setStatus('error');
                }, 2500);
            }
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/subscription', { replace: true });
            return;
        }
        if (hasCaptured.current) return;
        hasCaptured.current = true;
        runCapture();
    }, []); // run only once on mount

    if (status === 'loading') {
        return (
            <main className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="flex items-center gap-3 mb-4 justify-center">
                        <span className="font-mono text-[#fad100] animate-pulse">●</span>
                        <span className="font-headline text-sm text-[#fad100]">PROCESSING PAYMENT</span>
                    </div>
                    <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest">
                        Please wait. Do not close this tab.
                    </p>
                </div>
            </main>
        );
    }

    if (status === 'success' || status === 'already_captured') {
        return (
            <main className="flex h-screen items-center justify-center bg-background px-6">
                <div className="bg-[#1a1a28] border border-[#3d484d] p-8 max-w-md w-full">
                    <div className="h-1 bg-[#a8ff78] mb-6" />
                    <div className="flex items-center gap-3 mb-6">
                        <span className="font-mono text-[#a8ff78]">●</span>
                        <span className="font-headline text-sm text-[#a8ff78]">
                            {status === 'already_captured' ? 'ALREADY ACTIVATED' : 'PAYMENT CONFIRMED'}
                        </span>
                    </div>
                    <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest mb-4 leading-relaxed">
                        {status === 'already_captured'
                            ? 'This payment has already been processed. Your premium access is active.'
                            : 'Your NEURO-ELITE subscription is now active. A confirmation email has been sent to your registered address.'}
                    </p>
                    {premiumExpiresAt && (
                        <p className="font-mono text-[11px] text-[#93e2ff] uppercase tracking-widest mb-8">
                            Access valid until: {premiumExpiresAt}
                        </p>
                    )}
                    <SoundButton
                        onClick={() => navigate('/subscription', { replace: true })}
                        className="w-full bg-[#fad100] text-[#6d5a00] font-headline text-xs py-4 active:translate-x-[2px] active:translate-y-[2px] transition-transform"
                    >
                        GO TO SUBSCRIPTION
                    </SoundButton>
                </div>
            </main>
        );
    }

    // status === 'error'
    return (
        <main className="flex h-screen items-center justify-center bg-background px-6">
            <div className="bg-[#1a1a28] border border-[#ffb4ab] p-8 max-w-md w-full">
                <div className="h-1 bg-[#ffb4ab] mb-6" />
                <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-[#ffb4ab]">●</span>
                    <span className="font-headline text-sm text-[#ffb4ab]">PAYMENT ERROR</span>
                </div>
                <div className="border border-[#ffb4ab] bg-[#2b1515] text-[#ffb4ab] font-mono text-xs px-4 py-3 uppercase tracking-wider mb-8">
                    {error}
                </div>
                <div className="flex gap-4">
                    <SoundButton
                        onClick={() => {
                            hasCaptured.current = false;
                            hasCaptured.current = true;
                            runCapture();
                        }}
                        className="flex-1 bg-[#fad100] text-[#6d5a00] font-headline text-xs py-4 active:translate-x-[2px] active:translate-y-[2px] transition-transform"
                    >
                        RETRY
                    </SoundButton>
                    <SoundButton
                        onClick={() => navigate('/subscription', { replace: true })}
                        className="flex-1 border border-[#3d484d] text-[#879398] font-headline text-xs py-4 hover:bg-[#292937] transition-colors"
                    >
                        GO BACK
                    </SoundButton>
                </div>
            </div>
        </main>
    );
}
