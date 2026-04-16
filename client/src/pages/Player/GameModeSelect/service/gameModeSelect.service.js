/**
 * GameModeSelect Service
 * Handles game mode data configuration and navigation logic
 */

export const GAME_MODES = [
  {
    id: 'SINGLE_PLAYER',
    title: 'SINGLE PLAYER',
    description: 'Battle the AI across 3 difficulty levels.',
    icon: 'smart_toy',
    accentColor: '#4cc9f0',
    buttonText: 'INITIATE',
    buttonIcon: 'play_arrow',
    buttonStyle: 'outlined',
    topBarColor: 'bg-[#4cc9f0]',
    route: '/play/customize',
    badge: null,
    glowEffect: false,
    status: 'TODO',
  },
  {
    id: 'TWO_PLAYERS',
    title: 'LOCAL ARENA',
    description: 'Challenge a friend on the same machine.',
    icon: 'videogame_asset',
    accentColor: '#fad100',
    buttonText: 'CHALLENGE',
    buttonIcon: 'swords',
    buttonStyle: 'outlined',
    topBarColor: 'bg-[#fad100]',
    route: '/play/customize',
    badge: null,
    glowEffect: false,
    status: 'TODO', // ← Not yet implemented
  },
  {
    id: 'ONLINE_MATCH',
    title: 'ONLINE LOBBY',
    description: 'Enter the global network and climb the rankings.',
    icon: 'public',
    accentColor: '#4cc9f0',
    buttonText: 'CONNECT',
    buttonIcon: 'wifi',
    buttonStyle: 'outlined',
    topBarColor: 'bg-[#4cc9f0]',
    route: '/lobby',
    badge: null,
    glowEffect: false,
  },
];

/**
 * Get all available game modes
 * @returns {Array} Array of game mode objects
 */
export const getGameModes = () => {
  return GAME_MODES;
};

/**
 * Get a specific game mode by ID
 * @param {string} id - Game mode ID
 * @returns {Object} Game mode object or null
 */
export const getGameModeById = (id) => {
  return GAME_MODES.find((mode) => mode.id === id) || null;
};

/**
 * Get the route for a specific game mode
 * @param {string} id - Game mode ID
 * @returns {string} Route path
 */
export const getGameModeRoute = (id) => {
  const mode = getGameModeById(id);
  return mode ? mode.route : null;
};
