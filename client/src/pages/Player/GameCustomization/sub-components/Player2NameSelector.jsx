import React from 'react';
import PropTypes from 'prop-types';
import { User } from 'lucide-react';

const MAX_NAME_LENGTH = 16;

export default function Player2NameInput({ value, onChange }) {
    const characterCount = (value || '').length;

    const handleChange = (event) => {
        const normalizedValue = event.target.value.toUpperCase().slice(0, MAX_NAME_LENGTH);
        onChange?.(normalizedValue);
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#fad100]"></div>
                <h2 className="font-headline text-sm tracking-widest text-[#fad100]">
                    05. PLAYER NAME
                </h2>
            </div>

            <div className="bg-[#1e1e2c] border border-[#3d484d] p-6 space-y-3">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder="PLAYER_02"
                    maxLength={MAX_NAME_LENGTH}
                    className="w-full bg-[#12121f] border border-[#3d484d] text-[#e3e0f4] font-mono text-sm px-4 py-3 uppercase tracking-wide outline-none transition-all focus:border-[#4cc9f0] focus:shadow-[0_0_0_1px_#4cc9f0]"
                />

                <div className="flex justify-between items-center text-[11px] font-mono text-[#879398]">
                    <span className="opacity-60">MAX {MAX_NAME_LENGTH} CHARS</span>
                    <span>{characterCount}/{MAX_NAME_LENGTH}</span>
                </div>
            </div>
        </section>
    );
}

Player2NameInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
};
