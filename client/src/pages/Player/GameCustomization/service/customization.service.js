/**
 * Customization Service
 * Handles API calls and business logic for room customization
 * Aligns with backend API expectations
 */

// Frontend display options
const BOARD_SIZES = [
    { id: 10, label: "10x10", subtitle: "STANDARD TERMINAL", displayId: "10x10" },
    { id: 15, label: "15x15", subtitle: "EXTENDED MATRIX", displayId: "15x15" },
];

// Maps frontend lowercase to backend UPPERCASE
const GRID_STYLES = [
    { id: "CLASSIC", displayId: "classic", name: "RETRO-VEC 1.0", label: "CLASSIC GRID" },
    { id: "NEON", displayId: "neon", name: "CYBER-LITE HI-FI", label: "NEON WIRE" },
    { id: "DARK", displayId: "block", name: "SOLID-STATE 40", label: "BLOCK MESH" },
];

// Maps frontend numeric IDs to backend enum names
const MARKER_VARIANTS = [
    { 
        id: "CLASSIC", 
        displayId: 1, 
        xColor: "text-red-500", 
        oColor: "text-cyan-400", 
        xGlow: "drop-shadow-[0_0_6px_red] drop-shadow-[0_0_14px_red] drop-shadow-[0_0_24px_red]", 
        oGlow: "drop-shadow-[0_0_6px_cyan] drop-shadow-[0_0_14px_cyan] drop-shadow-[0_0_24px_cyan]" 
    },
    { 
        id: "GLOW", 
        displayId: 2, 
        xColor: "text-amber-400", 
        oColor: "text-purple-500", 
        xGlow: "drop-shadow-[0_0_8px_#fbbf24] drop-shadow-[0_0_18px_#fbbf24] drop-shadow-[0_0_30px_#fbbf24]", 
        oGlow: "drop-shadow-[0_0_8px_#a855f7] drop-shadow-[0_0_18px_#a855f7] drop-shadow-[0_0_30px_#a855f7]" 
    },
    { 
    id: "ELEMENTAL", 
    displayId: 8, 
    xColor: "text-orange-500", 
    oColor: "text-blue-400", 
    // X tỏa nhiệt (Lửa đỏ cam)
    xGlow: "drop-shadow-[0_0_10px_#f97316] drop-shadow-[0_0_20px_#ef4444]", 
    // O tỏa hơi lạnh (Băng xanh dương)
    oGlow: "drop-shadow-[0_0_10px_#60a5fa] drop-shadow-[0_0_20px_#3b82f6]" 
    },
    { 
        id: "PIXEL", 
        displayId: 4, 
        xColor: "text-lime-400", 
        oColor: "text-pink-500", 
        xGlow: "drop-shadow-[0_0_6px_#84cc16] drop-shadow-[0_0_12px_#84cc16] drop-shadow-[0_0_20px_#84cc16]", 
        oGlow: "drop-shadow-[0_0_6px_#ec4899] drop-shadow-[0_0_12px_#ec4899] drop-shadow-[0_0_20px_#ec4899]" 
    },
    { 
        id: "STONE", 
        displayId: 6, 
        xColor: "text-slate-200", 
        oColor: "text-slate-200", 
        xGlow: "drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]", 
        oGlow: "drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]", 
        bordered: true 
    },
    { 
    id: "MATRIX", 
    displayId: 7, 
    xColor: "text-emerald-400", 
    oColor: "text-emerald-400", 
    xGlow: "drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]", 
    oGlow: "drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]",
    animation: "animate-pulse" // Tailwind class cho nhấp nháy
    },
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
 * Transform frontend values to backend API format
 * Converts display IDs to backend enum names and numeric values
 * @param {Object} selection - Frontend selection { boardSize, gridStyle, markerVariant }
 * @returns {Object} Backend format { boardSize: number, boardStyle: string, markerStyle: string }
 */
export const transformToBackendFormat = (selection) => {
    // Find the backend enum names from display selections
    let boardSize = selection.boardSize;
    if (typeof boardSize === 'string') {
        // If it's "10x10" or "15x15" format, parse to number
        boardSize = parseInt(boardSize.split('x')[0]);
    }

    // Find grid style enum name - match by displayId
    const gridStyleObj = GRID_STYLES.find(s => s.displayId === selection.gridStyle);
    const boardStyle = gridStyleObj?.id || 'NEON';

    // Find marker style enum name - match by displayId
    const markerVariantObj = MARKER_VARIANTS.find(m => m.displayId === selection.markerVariant);
    const markerStyle = markerVariantObj?.id || 'CLASSIC';

    return {
        boardSize,
        boardStyle,
        markerStyle
    };
};

/**
 * Create a game room with customization options
 * Transforms frontend values to backend API format
 * @param {Object} options - Frontend customization { boardSize, gridStyle, markerVariant }
 * @returns {Promise<Object>} Room creation response with roomId
 */
export const createGameRoom = async (options) => {
    try {
        // Transform to backend format
        const backendPayload = transformToBackendFormat(options);
        console.log("Creating room with backend format:", backendPayload);

        // TODO: Replace with actual API endpoint once backend is ready
        // const response = await fetch('/api/v1/rooms', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${getToken()}`
        //     },
        //     body: JSON.stringify(backendPayload)
        // });

        // if (!response.ok) throw new Error('Failed to create room');
        // return await response.json();

        // Return mock data for now
        return {
            roomId: `room_${Date.now()}`,
            ...backendPayload,
            createdAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Room creation error:", error);
        throw error;
    }
};
