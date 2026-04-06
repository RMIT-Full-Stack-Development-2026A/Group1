/**
 * Customization Service
 * Handles API calls and business logic for room customization
 */

const BOARD_SIZES = [
    { id: "10x10", label: "10x10", subtitle: "STANDARD TERMINAL", size: 10 },
    { id: "15x15", label: "15x15", subtitle: "EXTENDED MATRIX", size: 15 },
];

const GRID_STYLES = [
    { id: "classic", name: "RETRO-VEC 1.0", label: "CLASSIC GRID" },
    { id: "neon", name: "CYBER-LITE HI-FI", label: "NEON WIRE" },
    { id: "block", name: "SOLID-STATE 40", label: "BLOCK MESH" },
];

const MARKER_VARIANTS = [
    { id: 1, xColor: "text-red-500", oColor: "text-cyan-400", xGlow: "drop-shadow-[0_0_4px_red]", oGlow: "drop-shadow-[0_0_4px_cyan]" },
    { id: 2, xColor: "text-amber-400", oColor: "text-purple-500", xGlow: "", oGlow: "" },
    { id: 3, xColor: "text-white", oColor: "text-white", xGlow: "", oGlow: "", isActive: true },
    { id: 4, xColor: "text-lime-400", oColor: "text-pink-500", xGlow: "", oGlow: "" },
    { id: 5, xColor: "text-slate-200", oColor: "text-slate-200", xGlow: "", oGlow: "", bordered: true },
    { id: 6, xColor: "", oColor: "", xGlow: "", oGlow: "", isSymbol: true },
];

/**
 * Get all available board sizes
 */
export const getBoardSizes = () => [...BOARD_SIZES];

/**
 * Get all available grid styles
 */
export const getGridStyles = () => [...GRID_STYLES];

/**
 * Get all available marker variants
 */
export const getMarkerVariants = () => [...MARKER_VARIANTS];

/**
 * Create a game room with customization options
 * @param {Object} options - Customization options
 * @param {string} options.boardSize - Board size (e.g., "10x10")
 * @param {string} options.gridStyle - Grid style (e.g., "neon")
 * @param {number} options.markerVariant - Marker variant ID (1-6)
 * @returns {Promise<Object>} Room creation response with roomId
 */
export const createGameRoom = async (options) => {
    try {
        // TODO: Replace with actual API endpoint once backend is ready
        console.log("Creating room with options:", options);

        // Simulated API call
        // const response = await fetch('/rooms', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${getToken()}`
        //     },
        //     body: JSON.stringify({
        //         boardSize: options.boardSize,
        //         gridStyle: options.gridStyle,
        //         markerVariant: options.markerVariant
        //     })
        // });

        // if (!response.ok) throw new Error('Failed to create room');
        // return await response.json();

        // Return mock data for now
        return {
            roomId: `room_${Date.now()}`,
            boardSize: options.boardSize,
            gridStyle: options.gridStyle,
            markerVariant: options.markerVariant,
            createdAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Room creation error:", error);
        throw error;
    }
};
