import { User, Bot } from 'lucide-react';
import { MarkerX, MarkerO } from '@/components/reusable/custom/CustomMarkers';

const difficultyConfig = {
    EASY: 'bg-green-400 text-green-950',
    MEDIUM: 'bg-[#fad100] text-[#6d5a00]', 
    HARD: 'bg-red-500 text-red-50'
};

/**
 * PlayerPanel — shared component for Player X and Player O.
 * Props:
 * role               'X' | 'O'
 * playerName         string
 * isBot              boolean
 * isActive           boolean  — true when it's this player's turn
 * difficulty         string | undefined  — shown as badge if isBot
 * avatarUrl          string | undefined  — player's avatar image URL
 * markerVariantData  object | undefined  — marker variant with colors and styles
 */
const PlayerPanel = ({ role, playerName, isBot, isActive, difficulty, avatarUrl, markerVariantData }) => {
    const isX = role === 'X';
    const markerColor = isX ? '#ffb4ab' : '#93e2ff';
    const markerGlow  = isX ? '0 0 10px #93000a' : '0 0 10px #4cc9f0';
    const Marker = isX ? MarkerX : MarkerO;
    const diffStyle = difficulty ? (difficultyConfig[difficulty.toUpperCase()] || 'bg-gray-400 text-gray-900') : '';

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
                <div className="w-28 h-28 border-2 border-outline-variant bg-[#1e1e2c] flex items-center justify-center relative overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={playerName} className="w-full h-full object-cover" />
                    ) : (
                        isBot ? <Bot size={52} color="#879398" /> : <User size={52} color="#879398" />
                    )}
                    
                    {difficulty && (
                        <div className={`absolute bottom-0 right-0 px-2 py-0.5 text-[8px] font-bold font-mono ${diffStyle}`}>
                            {difficulty}
                        </div>
                    )}
                </div>

                <p className="font-headline text-[10px] tracking-tighter uppercase"
                   style={{ color: isActive ? '#93e2ff' : '#879398' }}>
                    {playerName}
                </p>

                <div className="flex items-center justify-center">
                    {markerVariantData ? (
                        <Marker variantData={markerVariantData} className="w-24 h-24 text-6xl flex items-center justify-center" />
                    ) : (
                        <span className="font-headline text-8xl leading-none" style={{ color: markerColor, textShadow: markerGlow }}>
                            {role}
                        </span>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default PlayerPanel;