import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * AlreadyPremiumModal
 * Shown when a user who already has an active NEURO-ELITE subscription
 * clicks the subscribe button. Prevents accidental double-payment.
 *
 * Props:
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Callback to close the modal
 * @param {string | null} premiumExpiresAt - ISO date string from user.premiumExpiresAt
 */
const AlreadyPremiumModal = ({ isOpen, onClose, premiumExpiresAt }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const formattedExpiry = premiumExpiresAt
        ? new Date(premiumExpiresAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : null;

    const handleViewSubscription = () => {
        onClose();
        navigate('/subscription');
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,18,31,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

            {/* Modal Box */}
            <div className="bg-[#12121f] border-2 border-[#fad100] p-8 w-[420px] max-w-[90%] flex flex-col items-center relative shadow-[0_0_40px_rgba(250,209,0,0.15)] z-10">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#879398] hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fad100]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#fad100]"></div>

                {/* Icon */}
                <div className="w-16 h-16 mb-4 bg-[#fad100]/10 flex items-center justify-center border border-[#fad100]/30 rounded-sm">
                    <ShieldCheck size={32} color="#fad100" />
                </div>

                {/* Title */}
                <h2 className="font-headline text-sm text-[#fad100] mb-3 tracking-widest text-center leading-relaxed">
                    ALREADY ELITE
                </h2>

                {/* Message */}
                <p className="font-mono text-[11px] text-[#879398] text-center mb-2 uppercase leading-relaxed">
                    Your <span className="text-[#4cc9f0] font-bold">NEURO-ELITE</span> subscription
                    is already active.
                </p>

                {formattedExpiry && (
                    <p className="font-mono text-[11px] text-[#a8ff78] text-center mb-8 uppercase tracking-widest">
                        Access valid until: {formattedExpiry}
                    </p>
                )}

                {!formattedExpiry && <div className="mb-8" />}

                {/* Actions */}
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={handleViewSubscription}
                        className="w-full bg-[#fad100] text-[#6d5a00] font-headline text-[10px] py-4 uppercase flex items-center justify-center gap-2 hover:bg-[#ffe171] active:translate-x-[2px] active:translate-y-[2px] transition-all"
                        style={{ boxShadow: '2px 2px 0px #6d5a00' }}
                    >
                        <ShieldCheck size={14} /> VIEW SUBSCRIPTION
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full border border-[#3d484d] text-[#879398] font-mono text-xs py-3 uppercase hover:bg-[#1e1e2c] transition-colors"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlreadyPremiumModal;
