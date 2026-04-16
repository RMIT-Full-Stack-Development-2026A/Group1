// HeroSection.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function HeroSection() {
    return (
        <section className="text-center mb-16 font-headline text-sm tracking-widest text-[#fad100]">
            <div className="flex justify-center items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-[#fad100] text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <h1 className="font-headline text-4xl md:text-5xl text-[#fad100] tracking-tighter uppercase">GO PREMIUM</h1>
                <span className="material-symbols-outlined text-[#fad100] text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <p className="font-body text-[#4cc9f0] text-lg tracking-[0.1em]">UNLOCK THE FULL TICTACTOANG EXPERIENCE</p>
        </section>
    );
}

HeroSection.propTypes = {};