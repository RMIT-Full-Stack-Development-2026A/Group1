import React from "react";

export default function PlayerStats({ stats }) {
    return (
        <section className="bg-[#1a1a2e] border-2 border-[#2a2a4e] overflow-hidden shadow-[4px_4px_0px_0px_#343342]">
            <div className="h-1 w-full bg-[#4cc9f0]"></div>
            <div className="p-6">
                <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[#879398] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">bar_chart</span>
                    MY STATS
                </h3>
                <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
                        <span className="text-xs text-[#879398] font-mono uppercase">WINS</span>
                        <span className="text-2xl font-bold text-[#4cc9f0] drop-shadow-[0_0_8px_#4cc9f0]">
                            {stats.wins}
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
                        <span className="text-xs text-[#879398] font-mono uppercase">LOSSES</span>
                        <span className="text-2xl font-bold text-[#ffb4ab]">{stats.losses}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
                        <span className="text-xs text-[#879398] font-mono uppercase">WIN RATE</span>
                        <span className="text-lg font-bold text-[#fad100]">{stats.winRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[#879398] font-mono uppercase">RANK</span>
                        <span className="text-lg font-bold text-[#4cc9f0]">{stats.rank}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
