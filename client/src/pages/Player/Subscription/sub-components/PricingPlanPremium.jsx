import React from 'react';
import PropTypes from 'prop-types';
import SoundButton from '@/components/reusable/sound/SoundButton';

export default function PricingPlanPremium({ isPremium, onScrollToStatus }) {
    return (
        <div className="bg-[#12121f] border-2 border-[#fad100] p-8 flex flex-col chunky-shadow-secondary scale-105 z-10 relative overflow-hidden">
            <div className="h-2 bg-[#fad100] absolute top-0 left-0 w-full" />
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
            {isPremium ? (
                <SoundButton
                    disabled
                    className="w-full bg-[#fad100] text-[#6d5a00] font-headline text-xs py-4 opacity-60 cursor-not-allowed"
                >
                    CURRENT STATUS
                </SoundButton>
            ) : (
                <SoundButton
                    onClick={onScrollToStatus}
                    className="w-full bg-[#fad100] text-[#6d5a00] font-headline text-xs py-4 active:translate-x-[2px] active:translate-y-[2px] transition-transform"
                >
                    CHOOSE THIS PACKAGE
                </SoundButton>
            )}
        </div>
    );
}

PricingPlanPremium.propTypes = {
    isPremium: PropTypes.bool.isRequired,
    onScrollToStatus: PropTypes.func.isRequired,
};
