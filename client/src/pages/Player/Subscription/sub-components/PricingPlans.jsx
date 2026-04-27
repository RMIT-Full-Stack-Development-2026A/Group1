// PricingPlans.jsx
import React from 'react';
import PropTypes from 'prop-types';
import SoundButton from '@/components/reusable/SoundButton';

export default function PricingPlans({ isPremium, onSubscribe }) {
    return (
        <div className="grid md:grid-cols-2 gap-8 mb-16 items-stretch">
            {/* FREE CARD */}
            <div className="bg-[#1a1a28] border border-[#3d484d] p-8 flex flex-col chunky-shadow-surface relative overflow-hidden">
                <div className="h-1 bg-[#ffb4ab] absolute top-0 left-0 w-full"></div>
                <div className="flex justify-between items-start mb-8 ">
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
                <SoundButton className="w-full border border-[#4cc9f0] text-[#ffb4ab] font-headline text-xs py-4 hover:bg-[#292937] transition-colors">
                    {isPremium ? 'DOWNGRADE' : 'CURRENT STATUS'}
                </SoundButton>
            </div>

            {/* PREMIUM CARD */}
            <div className="bg-[#12121f] border-2 border-[#fad100] p-8 flex flex-col chunky-shadow-secondary scale-105 z-10 relative overflow-hidden">
                <div className="h-2 bg-[#fad100] absolute top-0 left-0 w-full"></div>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="font-headline text-lg text-[#fad100] mb-2">NEURO-ELITE</h2>
                        <p className="text-xs text-[#93e2ff] font-body tracking-widest">PREMIUM ENHANCEMENTS ENABLED</p>
                    </div>
                    <div className="text-right">
                        <span className="font-headline text-2xl text-[#fad100]">$10</span>
                        <p className="text-[8px] font-mono text-[#fff0c4]">PER CYCLE (MONTH)</p>
                    </div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                    <li className="flex items-center gap-3 font-body text-sm text-[#e3e0f4]"><span className="material-symbols-outlined text-[#fad100] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> ONLINE PLAY (RANKED)</li>
                    <li className="flex items-center gap-3 font-body text-sm text-[#fad100] font-bold"><span className="material-symbols-outlined text-[#fad100] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> MATCH REPLAYS</li>
                    <li className="flex items-center gap-3 font-body text-sm text-[#fad100] font-bold"><span className="material-symbols-outlined text-[#fad100] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> CUSTOM MARKERS</li>
                    <li className="flex items-center gap-3 font-body text-sm text-[#fad100] font-bold"><span className="material-symbols-outlined text-[#fad100] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> PRIORITY MATCHMAKING</li>
                </ul>
                <SoundButton 
                    onClick={onSubscribe}
                    className="w-full bg-[#fad100] text-[#6d5a00] font-headline text-xs py-4 active:translate-x-[2px] active:translate-y-[2px] transition-transform"
                >
                    {isPremium ? 'ACTIVE SUBSCRIBER' : 'SELECT PACKAGE'}
                </SoundButton>
            </div>
        </div>
    );
}

PricingPlans.propTypes = {
    isPremium: PropTypes.bool.isRequired,
    onSubscribe: PropTypes.func.isRequired
};