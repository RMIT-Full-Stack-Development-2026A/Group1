import React from 'react';
import { useNavigate } from 'react-router-dom';
import SoundButton from '@/components/reusable/sound/SoundButton';

export default function PaymentCancel() {
    const navigate = useNavigate();

    return (
        <main className="flex h-screen items-center justify-center bg-background px-6">
            <div className="bg-[#1a1a28] border border-[#3d484d] p-8 max-w-md w-full">
                <div className="h-1 bg-[#fad100] mb-6" />
                <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-[#fad100]">●</span>
                    <span className="font-headline text-sm text-[#fad100]">PAYMENT CANCELLED</span>
                </div>
                <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest mb-8 leading-relaxed">
                    You cancelled the payment process. No charge was made. You can subscribe again at any time.
                </p>
                <SoundButton
                    onClick={() => navigate('/subscription', { replace: true })}
                    className="w-full border border-[#4cc9f0] text-[#ffb4ab] font-headline text-xs py-4 hover:bg-[#292937] transition-colors"
                >
                    RETURN TO SUBSCRIPTION
                </SoundButton>
            </div>
        </main>
    );
}
