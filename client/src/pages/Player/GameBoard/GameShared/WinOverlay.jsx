import { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { AUDIO_FILES } from '@/config/audioConfig';

let lastPlayedResultSignature = null;

const RESULT_UI_CONFIG = {
    winner: {
        title: (winnerData) => `PLAYER ${winnerData?.player ?? 'X'} WINS!`,
        badge: 'CONGRATULATIONS',
        subtitle: (winnerData) => `${winnerData?.cells?.length ?? 5} MARKS IN A ROW`,
        color: '#fad100',
        glow: '#fad100',
        badgeTextColor: '#3b2f00',
    },
    loser: {
        title: (winnerData) => `PLAYER ${winnerData?.player ?? 'O'} WINS!`,
        badge: 'GAME OVER',
        subtitle: 'BETTER LUCK NEXT TIME',
        color: '#ef6353',
        glow: 'rgba(255,180,171,0.6)',
        badgeTextColor: '#3b2f00',
    },
    local_result: {
        title: (winnerData) => `PLAYER ${winnerData?.player ?? 'X'} WINS!`,
        badge: 'VICTORY',
        subtitle: (winnerData) => `${winnerData?.cells?.length ?? 5} MARKS IN A ROW`,
        color: '#fad100',
        glow: '#fad100',
        badgeTextColor: '#3b2f00',
    },
    draw: {
        title: 'DRAW',
        badge: 'DRAW MATCH',
        subtitle: 'YOU AND YOUR OPPONENT ARE EQUAL',
        color: '#fad100',
        glow: '#fad100',
        badgeTextColor: '#3b2f00',
    },
};

const WinOverlay = ({ winnerData, isDraw, perspective, onRestart, onBackToLobby }) => {

    const { play: playVictorySound } = useAudio(AUDIO_FILES.GAME_WIN);
    const { play: playLoseSound } = useAudio(AUDIO_FILES.GAME_LOSE);
    const [isMinimized, setIsMinimized] = useState(false);
    

    // Reset minimize state when new result comes
    useEffect(() => {
        if (winnerData || isDraw) {
            setIsMinimized(false);
        }
    }, [winnerData, isDraw]);

    useEffect(() => {
        const resultSignature = winnerData
            ? `winner:${winnerData.player}:${winnerData.cells?.join('-') ?? ''}`
            : isDraw
                ? 'draw'
                : null;

        if (resultSignature && resultSignature !== lastPlayedResultSignature) {
            if (perspective === 'loser') {
                playLoseSound();
            } else if (perspective === 'winner' || perspective === 'local_result') {
                playVictorySound();
            }
            lastPlayedResultSignature = resultSignature;
        }

        if (!winnerData && !isDraw) {
            lastPlayedResultSignature = null;
        }
    }, [winnerData, isDraw, perspective, playVictorySound, playLoseSound]);

    // Lock scroll when overlay is active
    useEffect(() => {
        if (winnerData || isDraw) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'auto';
            };
        }
    }, [winnerData, isDraw]);

    if (!winnerData && !isDraw) return null;

    // Minimized state (bottom-right button)
    if (isMinimized) {
        return (
            <div className="fixed bottom-8 right-8 z-120 animate-fade-in">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="bg-[#12121f] border-2 border-primary-cyan text-primary-cyan px-4 py-3 font-headline text-[12px] uppercase flex items-center gap-2 shadow-[2px_2px_0px_#005266] hover:bg-primary-cyan hover:text-[#003543] transition-colors"
                >
                    <Eye size={16} /> VIEW RESULT
                </button>
            </div>
        );
    }

    const resultKey = perspective ?? (isDraw ? 'draw' : 'winner');
    const resultConfig = RESULT_UI_CONFIG[resultKey] ?? RESULT_UI_CONFIG.winner;
    const title = typeof resultConfig.title === 'function' ? resultConfig.title(winnerData) : resultConfig.title;
    const subtitle = typeof resultConfig.subtitle === 'function' ? resultConfig.subtitle(winnerData) : resultConfig.subtitle;
    const badgeText = resultConfig.badge;

    return (
        <div className="fixed inset-0 z-110 bg-deep-bg/85 flex items-center justify-center animate-fade-in">

            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none animated-particles">
                <div className="absolute top-12 left-1/4  w-3 h-3 bg-primary-cyan animate-ping" />
                <div className="absolute top-36 right-1/4 w-4 h-4 bg-[#fad100] animate-ping" />
                <div className="absolute bottom-24 left-1/3  w-2 h-2 bg-[#ffb4ab] animate-ping" />
                <div className="absolute top-1/2 right-12 w-3 h-3 bg-[#ffcca9] animate-ping" />
                <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-primary-cyan animate-ping" />
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-cyan animate-ping" />
                <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-[#fad100] animate-ping" />
                <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-[#ffb4ab] animate-ping" />
            </div>
            {/* Modal */}
            <div
                className="relative z-10 bg-[#12121f] border-4 p-10 max-w-125 w-[90%] text-center shadow-2xl"
                style={{
                    borderColor: resultConfig.color,
                    boxShadow: `0 0 30px ${resultConfig.glow}`,
                }}
            >
                {/* Close (minimize) button */}
                <button
                    onClick={() => setIsMinimized(true)}
                    className="absolute top-4 right-4 text-[#879398] hover:text-[#ffb4ab] transition-colors"
                    title="Hide overlay"
                >
                    <X size={24} />
                </button>

                {/* Badge */}
                <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 font-headline text-[10px] uppercase whitespace-nowrap"
                    style={{
                        backgroundColor: resultConfig.color,
                        color: resultConfig.badgeTextColor,
                    }}
                >
                    {badgeText}
                </div>

                {/* Title */}
                <h1
                    className="font-headline text-3xl mb-3 leading-relaxed"
                    style={{
                        color: resultConfig.color,
                        textShadow: `0 0 12px ${resultConfig.glow}`,
                    }}
                >
                    {title}
                </h1>

                {/* Subtitle */}
                <p className="font-mono text-[11px] text-[#879398] uppercase tracking-widest mb-10">
                    {subtitle}
                </p>
                

                {/* Actions */}
                <div className="flex flex-col gap-3 items-center">
                    <button
                        onClick={onRestart}
                        className="w-60 bg-primary-cyan text-[#003543] font-headline text-[9px] py-4 uppercase hover:translate-y-0.5 transition-transform"
                        style={{ boxShadow: '2px 2px 0px #005266' }}
                    >
                        PLAY AGAIN
                    </button>
                    <button
                        onClick={onBackToLobby}
                        className="w-60 border-2 border-outline-variant text-[#879398] font-headline text-[9px] py-3 uppercase hover:border-primary-cyan hover:text-primary-cyan transition-all"
                    >
                        BACK TO LOBBY
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WinOverlay;