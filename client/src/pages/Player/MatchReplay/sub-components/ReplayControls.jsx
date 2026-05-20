import React from 'react';
import SoundButton from '@/components/reusable/sound/SoundButton';

function IconBtn({ icon, onClick, size = 'sm', disabled = false }) {
    const dimensionClass = size === 'md' ? 'w-12 h-12' : 'w-10 h-10';

    return (
        <SoundButton
            onClick={onClick}
            disabled={disabled}
            className={`${dimensionClass} cursor-pointer bg-surface-container bg-[#006780] border border-outline text-on-surface flex items-center justify-center chunky-shadow hover:bg-surface-container-high active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
        >
            <span className="material-symbols-outlined">{icon}</span>
        </SoundButton>
    );
}

export default function ReplayControls({
    currentStep,
    totalMoves,
    isPlaying,
    speed,
    onGoToStart,
    onStepBack,
    onTogglePlay,
    onStepForward,
    onGoToEnd,
    onJumpToStep,
    onSetSpeed
}) {
    const progressPercent = totalMoves > 0 ? (currentStep / totalMoves) * 100 : 0;
    const disablePlay = !isPlaying && currentStep >= totalMoves;

    const handleScrubBarClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        const step = Math.round(clampedRatio * totalMoves);
        onJumpToStep(step);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#0d0d1a] border-4 border-[#3d484d] border-b-2 shadow-[0_-4px_24px_rgba(0,0,0,0.7)] px-3 sm:px-6 lg:px-8 py-4 border-surface-container">
            <div className="mx-auto w-full max-w-[1200px] mb-5">
                <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#4cc9f0]">STEP {currentStep || '--'}</span>
                    <span className="font-mono text-[10px] text-[#879398]">{totalMoves} MOVES</span>
                </div>
                <div
                    onClick={handleScrubBarClick}
                    className="relative h-4 w-full bg-[#1e1e2c] border border-[#3d484d] cursor-pointer overflow-visible"
                >
                    <div className="absolute left-0 top-0 h-full bg-[#4cc9f0] transition-all duration-100 overflow-hidden" style={{ width: `${progressPercent}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#4cc9f0] rounded-full transition-all duration-100" style={{ left: `calc(${progressPercent}% - 6px)` }} />
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
                    <IconBtn icon="first_page" onClick={onGoToStart} disabled={currentStep === 0} />
                    <IconBtn icon="chevron_left" onClick={onStepBack} disabled={currentStep === 0} />
                    <IconBtn icon={isPlaying ? 'pause' : 'play_arrow'} size="md" onClick={onTogglePlay} disabled={disablePlay} />
                    <IconBtn icon="chevron_right" onClick={onStepForward} disabled={currentStep >= totalMoves} />
                    <IconBtn icon="last_page" onClick={onGoToEnd} disabled={currentStep >= totalMoves} />
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {[1, 2, 4].map((value) => (
                        <SoundButton
                            key={value}
                            type="button"
                            onClick={() => onSetSpeed(value)}
                            className={`px-3 py-1 cursor-pointer border font-body uppercase tracking-widest text-[10px] transition-colors ${
                                speed === value
                                    ? 'bg-[#4cc9f0] text-[#003543] border-[#4cc9f0] shadow-[2px_2px_0px_#005266] font-bold'
                                    : 'bg-[#1e1e2c] text-[#879398] border-[#3d484d] hover:border-[#4cc9f0] hover:text-[#4cc9f0]'
                            }`}
                        >
                            {value}X
                        </SoundButton>
                    ))}
                </div>
            </div>
        </div>
    );
}
