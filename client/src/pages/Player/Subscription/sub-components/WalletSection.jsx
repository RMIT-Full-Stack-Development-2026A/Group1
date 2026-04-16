// WalletSection.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function WalletSection({ walletBalance, depositAmount, setDepositAmount, onDeposit, onSubscribe }) {
    const hasEnoughFunds = walletBalance >= 10;

    return (
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 bg-[#1e1e2c] border border-[#3d484d] p-6 relative">
                <div className="flex items-center gap-4 mb-6">
                    <span className="font-headline text-sm text-[#fba866]">WALLET STATUS:</span>
                    <span className="font-mono text-2xl text-[#fba866] font-bold">${walletBalance.toFixed(2)}</span>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-grow">
                        <label className="block font-mono text-[10px] text-[#879398] mb-1 uppercase tracking-widest">Deposit Amount (USD)</label>
                        <input 
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full bg-[#343342] border-b-2 border-[#3d484d] text-[#93e2ff] p-3 focus:outline-none focus:border-[#93e2ff] font-mono" 
                            placeholder="0.00" 
                            type="number"
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button className="h-[50px] px-6 border border-[#4cc9f0] text-[#4cc9f0] font-mono text-xs cyan-glow transition-all active:translate-x-[1px] active:translate-y-[1px]">ADD FUNDS</button>
                        <button onClick={onDeposit} className="h-[50px] px-6 bg-[#4cc9f0] text-[#005266] font-mono text-xs chunky-shadow-primary active:translate-x-[2px] active:translate-y-[2px] transition-transform">CONFIRM</button>
                    </div>
                </div>
                
                <div className="pt-6 border-t border-[#3d484d]">
                    {hasEnoughFunds ? (
                        <button onClick={onSubscribe} className="w-full bg-[#fad100] text-[#6d5a00] font-headline text-sm py-6 active:translate-x-[2px] active:translate-y-[2px] transition-transform">
                            ACTIVATE NEURO-ELITE NOW
                        </button>
                    ) : (
                        <>
                            <button disabled className="w-full bg-[#343342] text-[#3d484d] font-headline text-sm py-6 cursor-not-allowed opacity-50 border-2 border-dashed border-[#3d484d]">
                                INSUFFICIENT FUNDS
                            </button>
                            <p className="text-[10px] text-center mt-3 text-[#ffb4ab] font-mono tracking-tighter">DEPOSIT ${(10 - walletBalance).toFixed(2)} MORE TO ACTIVATE</p>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-[#1a1a28] border border-[#3d484d] p-6">
                <h3 className="font-headline text-[10px] text-[#93e2ff] mb-4">SYSTEM NOTICES</h3>
                <div className="space-y-4 font-mono text-[11px] text-[#879398]">
                    <div className="flex gap-2"><span className="text-[#fba866]">[!]</span><p>PREMIUM STATUS IS RECURRING EVERY 30 CYCLES.</p></div>
                    <div className="flex gap-2"><span className="text-[#93e2ff]">[i]</span><p>CUSTOM MARKERS REQUIRE ASSET APPROVAL.</p></div>
                    <div className="flex gap-2"><span className="text-[#fad100]">[*]</span><p>NEURO-ELITE BADGE ON LEADERBOARD.</p></div>
                </div>
            </div>
        </div>
    );
}

WalletSection.propTypes = {
    walletBalance: PropTypes.number.isRequired,
    depositAmount: PropTypes.string.isRequired,
    setDepositAmount: PropTypes.func.isRequired,
    onDeposit: PropTypes.func.isRequired,
    onSubscribe: PropTypes.func.isRequired
};