import classicBg from '@/assets/themes/classic/bg.png';
import neonBg from '@/assets/themes/neon/bg.png';
import blockBg from '@/assets/themes/block/bg.png';

export const GAME_THEMES = {
    jungle: {
        boardWrapper: 'bg-[#0a0a1a] border-8 border-[#276112]',
        boardBorder: 'border-4 border-[#276112]',
        cellBorder: 'border-r border-b border-[#276112]/40',
        boardGlow: '0 0 20px rgba(16, 184, 55, 0.57), inset 0 0 14px rgba(16, 184, 55, 0.57)',
        bgImage: classicBg,
        bgSize: 'cover',
        bgRepeat: 'no-repeat',
        bgOpacity: 0.8,
        particleType: 'drift',
        particleColor: 'rgba(180,160,255,',
        particleShape: '●',
        particleSizeMin: 4,
        particleSizeMax: 10,
        particleDurMin: 8,
        particleDurMax: 20,
    },
    dark: {
        boardWrapper: 'bg-[#0a0a1a] border-8 border-[#4cc9f0]',
        boardBorder: 'border-4 border-[#4cc9f0]',
        cellBorder: 'border-r border-b border-[#4cc9f0]/40',
        boardGlow: '0 0 24px rgba(76, 201, 240, 0.18), inset 0 0 18px rgba(76, 201, 240, 0.08)',
        bgImage: neonBg,
        bgSize: 'cover',
        bgRepeat: 'no-repeat',
        bgOpacity: 0.8,
        particleType: 'fall',
        particleColor: 'rgba(76,201,240,',
        particleShape: '◆',
        particleSizeMin: 3,
        particleSizeMax: 7,
        particleDurMin: 5,
        particleDurMax: 13,
    },
    lava: {
        boardWrapper: 'bg-[#0a0a0a] border-8 border-[#ff3d00]',
        boardBorder: 'border-4 border-[#ff3d00]',
        cellBorder: 'border-r border-b border-[#ff3d00]/40',
        boardGlow: '0 0 18px rgba(255, 61, 0, 0.2), inset 0 0 10px rgba(255, 61, 0, 0.06)',
        bgImage: blockBg,
        bgSize: 'cover',
        bgRepeat: 'repeat',
        bgOpacity: 0.8,
        particleType: 'swing',
        particleColor: 'rgba(120,200,80,0.6)',
        particleShape: '🍃',
        particleSizeMin: 6,
        particleSizeMax: 14,
        particleDurMin: 7,
        particleDurMax: 17,
    },
};

export const getTheme = (gridStyle) => GAME_THEMES[gridStyle] ?? GAME_THEMES.jungle;