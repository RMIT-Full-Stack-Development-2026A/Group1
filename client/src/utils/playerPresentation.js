/**
 * Marker colours and difficulty badges shared by the full PlayerPanel and the
 * compact mobile PlayerAvatarBar, so the two never drift visually.
 */

export const MARKER_COLORS = {
    X: '#ffb4ab',
    O: '#93e2ff',
};

export const MARKER_GLOWS = {
    X: '0 0 10px #93000a',
    O: '0 0 10px #4cc9f0',
};

const DIFFICULTY_BADGE_STYLES = {
    EASY: 'bg-green-400 text-green-950',
    MEDIUM: 'bg-[#fad100] text-[#3b2f00]',
    HARD: 'bg-red-500 text-red-950',
};

/** @returns {string} Tailwind colour classes for a difficulty badge. */
export const getDifficultyBadgeClass = (difficulty) => {
    if (!difficulty) return '';
    return DIFFICULTY_BADGE_STYLES[difficulty.toUpperCase()] || 'bg-gray-400 text-gray-900';
};

/** Marker accent colour; unknown roles fall back to X so a value is always returned. */
export const getMarkerColor = (role) => MARKER_COLORS[role] ?? MARKER_COLORS.X;

/** CSS text-shadow for the large marker glyph. */
export const getMarkerGlow = (role) => MARKER_GLOWS[role] ?? MARKER_GLOWS.X;
