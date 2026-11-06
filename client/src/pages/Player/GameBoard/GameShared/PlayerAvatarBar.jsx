import Icon from '@/components/common/Icon';
import { getDifficultyBadgeClass, getMarkerColor } from '@/utils/playerPresentation';

/**
 * One compact player slot: avatar + short name, with the X/O marker colour as
 * an underline. The active slot lights up exactly like PlayerPanel does on
 * desktop (cyan border + glow), but at 44 px instead of 80 px.
 */
const AvatarSlot = ({ role, playerName, isActive, isBot, difficulty, avatarUrl, align }) => {
    const markerColor = getMarkerColor(role);
    const isRight = align === 'right';
    const difficultyLabel = isBot && difficulty ? String(difficulty).toLowerCase() : null;
    const badgeLetter = isBot && difficulty ? String(difficulty).charAt(0).toUpperCase() : null;

    return (
        <div
            aria-current={isActive ? 'true' : undefined}
            className={`flex min-w-0 flex-1 items-center gap-2 transition-opacity duration-300 ${
                isRight ? 'flex-row-reverse' : ''
            } ${isActive ? 'opacity-100' : 'opacity-60'}`}
        >
            <div className="relative shrink-0">
                <div
                    className={`flex h-11 w-11 items-center justify-center overflow-hidden border-2 bg-[#1e1e2c] transition-[border-color,box-shadow] duration-300 ${
                        isActive ? 'border-primary-cyan glow-cyan avatar-pulse' : 'border-outline-variant'
                    }`}
                >
                    {avatarUrl ? (
                        <img width="44" height="44" src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <Icon name={isBot ? 'smart_toy' : 'person'} size={22} color="#879398" />
                    )}
                </div>

                {badgeLetter && (
                    <span
                        aria-hidden="true"
                        className={`absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center px-0.5 text-[9px] font-bold font-mono leading-none ${getDifficultyBadgeClass(difficulty)}`}
                    >
                        {badgeLetter}
                    </span>
                )}
            </div>

            <div className={`flex min-w-0 flex-1 flex-col gap-1 ${isRight ? 'items-end' : 'items-start'}`}>
                <p className={`flex min-w-0 max-w-full items-center gap-1 ${isRight ? 'justify-end' : ''}`}>
                    <span aria-hidden="true" className="shrink-0 font-headline text-[10px] leading-none" style={{ color: markerColor }}>
                        {role}
                    </span>
                    <span
                        className="min-w-0 truncate font-headline text-[10px] uppercase leading-none tracking-tighter"
                        style={{ color: isActive ? '#93e2ff' : '#bcc8ce' }}
                        title={playerName}
                    >
                        <span className="sr-only">
                            {role}{isBot ? `, bot${difficultyLabel ? `, ${difficultyLabel} difficulty` : ''}` : ''}:{' '}
                        </span>
                        {playerName}
                    </span>
                </p>

                <span
                    aria-hidden="true"
                    className="block h-0.5 w-6 shrink-0"
                    style={{ backgroundColor: markerColor }}
                />
            </div>

            {isActive && <span className="sr-only">{role}&apos;s turn</span>}
        </div>
    );
};

/**
 * PlayerAvatarBar — the phone replacement for the two PlayerPanels.
 * Rendered below lg only; the desktop panels stay exactly as they were.
 *
 * @param {{ players: Array<{
 *   role: 'X' | 'O',
 *   playerName: string,
 *   isActive: boolean,
 *   isBot?: boolean,
 *   difficulty?: string,
 *   avatarUrl?: string,
 * }>}} props two players, rendered left to right
 */
const PlayerAvatarBar = ({ players }) => (
    <div
        role="group"
        aria-label="Players"
        className="flex h-14 w-full shrink-0 items-center justify-between gap-2 bg-[#12121f]/90 lg:hidden"
    >
        {players[0] && <AvatarSlot {...players[0]} />}

        <span aria-hidden="true" className="shrink-0 font-headline text-[10px] uppercase tracking-widest text-outline">
            vs
        </span>

        {players[1] && <AvatarSlot {...players[1]} align="right" />}
    </div>
);

export default PlayerAvatarBar;
