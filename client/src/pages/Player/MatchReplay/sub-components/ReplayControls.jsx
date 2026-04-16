import React from 'react';

function IconBtn({ icon, onClick, size = 'sm', disabled = false }) {
    const dimensionClass = size === 'md' ? 'w-12 h-12' : 'w-10 h-10';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${dimensionClass} cursor-pointer bg-surface-container bg-[#006780] border border-outline text-on-surface flex items-center justify-center chunky-shadow hover:bg-surface-container-high active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
        >
            <span className="material-symbols-outlined">{icon}</span>
        </button>
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
    const moveCounterLabel = currentStep === 0 ? `-- / ${totalMoves}` : `${currentStep} / ${totalMoves}`;
    const disablePlay = !isPlaying && currentStep >= totalMoves;

    const handleScrubBarClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        const step = Math.round(clampedRatio * totalMoves);
        onJumpToStep(step);
    };

    return (
        <div className="mt-6 w-full bg-surface border border-outline-variant chunky-shadow p-6">
            <div className="mb-6 flex items-center gap-4">
                <span className="font-body uppercase tracking-widest text-[10px] text-outline">{moveCounterLabel}</span>

                <button
                    type="button"
                    onClick={handleScrubBarClick}
                    className="relative h-3 flex-1 bg-surface-container-highest border border-outline-variant overflow-hidden"
                    aria-label="Jump to replay step"
                >
                    <span
                        className="absolute left-0 top-0 h-full bg-primary-container"
                        style={{ width: `${progressPercent}%` }}
                    />
                </button>

                <span className="font-body uppercase tracking-widest text-[10px] text-outline">{totalMoves}</span>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <IconBtn icon="first_page" onClick={onGoToStart} disabled={currentStep === 0} />
                    <IconBtn icon="chevron_left" onClick={onStepBack} disabled={currentStep === 0} />
                    <IconBtn icon={isPlaying ? 'pause' : 'play_arrow'} size="md" onClick={onTogglePlay} disabled={disablePlay} />
                    <IconBtn icon="chevron_right" onClick={onStepForward} disabled={currentStep >= totalMoves} />
                    <IconBtn icon="last_page" onClick={onGoToEnd} disabled={currentStep >= totalMoves} />
                </div>

                <div className="flex items-center gap-2">
                    {[1, 2, 4].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onSetSpeed(value)}
                            className={`px-3 py-1 cursor-pointer bg-[#006780] font-body uppercase tracking-widest text-[10px] transition-colors ${
                                speed === value
                                    ? 'cursor-pointer bg-secondary-container border border-secondary-container text-on-secondary chunky-shadow'
                                    : 'cursor-pointer bg-surface-container-highest border border-outline text-outline hover:text-on-surface'
                            }`}
                        >
                            {value}X
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
