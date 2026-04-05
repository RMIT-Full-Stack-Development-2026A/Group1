/**
 * WinOverlay — modal shown when game ends.
 * Props:
 *   winnerData  { player: 'X'|'O', cells: [[r,c],...] } | null
 *   isDraw      boolean
 *   onRestart   () => void
 */
const WinOverlay = ({ winnerData, isDraw, onRestart }) => {
    const title     = isDraw ? 'NO WINNER'              : `PLAYER ${winnerData?.player} WINS!`;
    const badgeText = isDraw ? 'DRAW MATCH'             : 'CONGRATULATIONS';
    const subtitle  = isDraw ? 'THE BOARD IS FULL'      : `${winnerData?.cells?.length ?? 5} MARKS IN A ROW`;

    return (
        <div className="fixed inset-0 z-[110] bg-[#0d0d1a]/85 flex items-center justify-center">

            {/* Pixel confetti — design team can animate these */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-12 left-1/4  w-3 h-3 bg-[#4cc9f0]" />
                <div className="absolute top-36 right-1/4 w-4 h-4 bg-[#fad100]" />
                <div className="absolute bottom-24 left-1/3  w-2 h-2 bg-[#ffb4ab]" />
                <div className="absolute top-1/2 right-12 w-3 h-3 bg-[#ffcca9]" />
                <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-[#4cc9f0]" />
            </div>

            <div
                className="bg-[#12121f] border-4 border-[#fad100] p-12 max-w-2xl w-full mx-4 text-center relative"
                style={{ boxShadow: '0 0 30px #fad100' }}
            >
                {/* Badge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#fad100] text-[#3b2f00] px-6 py-2 font-headline text-[10px] uppercase whitespace-nowrap">
                    {badgeText}
                </div>

                {/* Main title */}
                <h1
                    className="font-headline text-3xl mb-3 leading-relaxed"
                    style={{ color: '#fad100', textShadow: '0 0 12px #fad100' }}
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
                        className="w-60 bg-[#4cc9f0] text-[#003543] font-headline text-[9px] py-4 uppercase hover:translate-y-[2px] transition-transform"
                        style={{ boxShadow: '2px 2px 0px #005266' }}
                    >
                        PLAY AGAIN
                    </button>
                    <button
                        className="w-60 border-2 border-[#3d484d] text-[#879398] font-headline text-[9px] py-3 uppercase hover:border-[#4cc9f0] hover:text-[#4cc9f0] transition-all"
                    >
                        BACK TO LOBBY
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WinOverlay;