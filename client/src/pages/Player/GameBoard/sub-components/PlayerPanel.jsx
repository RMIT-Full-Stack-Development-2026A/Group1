import { User, Bot } from 'lucide-react';

/**
 * PlayerPanel — shared component for Player X and Player O.
 * Props:
 *   role        'X' | 'O'
 *   playerName  string
 *   isBot       boolean
 *   isActive    boolean  — true when it's this player's turn
 *   difficulty  string | undefined  — shown as badge if isBot
 */
const PlayerPanel = ({ role, playerName, isBot, isActive, difficulty }) => {
    const isX = role === 'X';
    const markerColor = isX ? '#ffb4ab' : '#93e2ff';
    const markerGlow  = isX ? '0 0 10px #93000a' : '0 0 10px #4cc9f0';

    return (
        <aside
            className={`w-55 flex flex-col gap-4 self-start mt-8 transition-opacity duration-300 ${
                isActive ? 'opacity-100' : 'opacity-50'
            }`}
        >
            <div
                className={`bg-[#12121f] border-2 p-6 flex flex-col items-center gap-5 relative transition-all duration-300 ${
                    isActive ? 'border-primary-cyan glow-cyan' : 'border-outline-variant'
                }`}
            >
                {isActive && (
                    <div className={`absolute -top-3 ${isX ? 'left-4' : 'right-4'} bg-primary-cyan text-[#003543] px-2 py-0.5 text-[10px] font-bold uppercase font-headline`}>
                        ACTIVE TURN
                    </div>
                )}

                {/* Design team: replace this icon with pixel avatar image if needed */}
                <div className="w-28 h-28 border-2 border-outline-variant bg-[#1e1e2c] flex items-center justify-center relative">
                    {isBot ? <Bot size={52} color="#879398" /> : <User size={52} color="#879398" />}
                    
                    {difficulty && (
                        <div className="absolute bottom-0 right-0 bg-[#fad100] text-[#6d5a00] px-2 py-0.5 text-[8px] font-bold font-mono">
                            {difficulty}
                        </div>
                    )}
                </div>

                {}
                <p className="font-headline text-[10px] tracking-tighter uppercase"
                   style={{ color: isActive ? '#93e2ff' : '#879398' }}>
                    {playerName}
                </p>

                {}
                <div
                    className="font-headline text-5xl"
                    style={{ color: markerColor, textShadow: markerGlow }}
                >
                    {role}
                </div>
            </div>
        </aside>
    );
};

export default PlayerPanel;