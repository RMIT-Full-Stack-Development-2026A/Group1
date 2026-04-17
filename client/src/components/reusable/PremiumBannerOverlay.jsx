import React from 'react';
import { Lock, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * PremiumRequiredModal - Use when a user tries to access a premium feature without the necessary subscription.
 * * Props:
 * @param {boolean} isOpen - Controls whether the modal is visible
 * @param {function} onClose - Callback function to close the modal
 * @param {string} featureName - The name of the feature that is locked (e.g., "MATCH REPLAYS")
 */
const PremiumRequiredModal = ({ isOpen, onClose, featureName = "THIS FEATURE" }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgradeClick = () => {
        onClose();
        navigate('/subscription');
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            {/* Hiệu ứng Scanline mờ ảo đè lên nền đen */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,18,31,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

            {/* Modal Box */}
            <div className="bg-[#12121f] border-2 border-[#fad100] p-8 w-[400px] max-w-[90%] flex flex-col items-center relative shadow-[0_0_40px_rgba(250,209,0,0.15)] z-10">
                
                {/* Nút X Đóng */}
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#879398] hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Decorative Corners (Chuẩn style Cyberpunk của bạn) */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fad100]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#fad100]"></div>

                {/* Icon Lock */}
                <div className="w-16 h-16 mb-4 bg-[#fad100]/10 flex items-center justify-center border border-[#fad100]/30 rounded-sm">
                    <Lock size={32} color="#fad100" />
                </div>

                {/* Title */}
                <h2 className="font-arcade text-lg text-[#fad100] mb-2 tracking-widest text-center">
                    ACCESS DENIED
                </h2>
                
                {/* Message */}
                <p className="font-mono text-[11px] text-[#879398] text-center mb-8 uppercase leading-relaxed">
                    <span className="text-white font-bold">{featureName}</span> REQUIRES <br/>
                    <span className="text-[#4cc9f0]">NEURO-ELITE</span> STATUS TO UNLOCK.
                </p>

                {/* Actions */}
                <div className="w-full flex flex-col gap-3">
                    <button 
                        onClick={handleUpgradeClick}
                        className="w-full bg-[#fad100] text-[#6d5a00] font-arcade text-[10px] py-4 uppercase flex items-center justify-center gap-2 hover:bg-[#ffe171] active:translate-x-[2px] active:translate-y-[2px] transition-all"
                        style={{ boxShadow: '2px 2px 0px #6d5a00' }}
                    >
                        <Zap size={14} /> UPGRADE NOW
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="w-full border border-outline-variant text-[#879398] font-mono text-xs py-3 uppercase hover:bg-[#1e1e2c] transition-colors"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumRequiredModal;