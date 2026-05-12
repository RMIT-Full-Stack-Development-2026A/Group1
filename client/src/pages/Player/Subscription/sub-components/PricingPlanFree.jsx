import React from 'react';
import SoundButton from '@/components/reusable/sound/SoundButton';

export default function PricingPlanFree({ isPremium }) {
    return (
        <div className="bg-[#1a1a28] border border-[#3d484d] p-8 flex flex-col chunky-shadow-surface relative overflow-hidden">
            <div className="h-1 bg-[#ffb4ab] absolute top-0 left-0 w-full" />
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="font-headline text-lg text-[#ffb4ab] mb-2">FREE TIER</h2>
                    <p className="text-xs text-[#879398] font-body">STANDARD HARDWARE ACCESS</p>
                </div>
                <span className="font-headline text-xl text-[#ffb4ab]">$0</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 font-body text-sm"><span className="material-symbols-outlined text-[#93e2ff] text-sm">check_small</span> BASIC 10x10 GRID</li>
                <li className="flex items-center gap-3 font-body text-sm"><span className="material-symbols-outlined text-[#93e2ff] text-sm">check_small</span> ONLINE PLAY</li>
                <li className="flex items-center gap-3 font-body text-sm"><span className="material-symbols-outlined text-[#93e2ff] text-sm">check_small</span> AI MATCHES</li>
                <li className="flex items-center gap-3 font-body text-sm text-[#879398]"><span className="material-symbols-outlined text-[#ffb4ab] text-sm">close</span> MATCH REPLAYS</li>
                <li className="flex items-center gap-3 font-body text-sm text-[#879398]"><span className="material-symbols-outlined text-[#ffb4ab] text-sm">close</span> CUSTOM MARKERS</li>
                <li className="flex items-center gap-3 font-body text-sm text-[#879398]"><span className="material-symbols-outlined text-[#ffb4ab] text-sm">close</span> PRIORITY MATCHMAKING</li>
            </ul>
            <SoundButton
                disabled
                className="w-full border border-[#3d484d] text-[#879398] font-headline text-xs py-4 opacity-40 cursor-not-allowed"
            >
                {isPremium ? 'ENJOY YOUR PREMIUM BENEFITS' : 'CURRENT PLAN'}
            </SoundButton>
        </div>
    );
}
