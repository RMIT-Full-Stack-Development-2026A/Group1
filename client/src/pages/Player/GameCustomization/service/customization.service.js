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
// 'CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'
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
        id: "SKETCH", 
        displayId: 3, 
        xColor: "text-orange-500", 
        oColor: "text-blue-400", 
        xGlow: "drop-shadow-[0_0_10px_#f97316] drop-shadow-[0_0_20px_#ef4444]", 
        oGlow: "drop-shadow-[0_0_10px_#60a5fa] drop-shadow-[0_0_20px_#3b82f6]" 
    },
    { 
        id: "STONE", 
        displayId: 4, 
        xColor: "text-lime-400", 
        oColor: "text-pink-500", 
        xGlow: "drop-shadow-[0_0_6px_#84cc16] drop-shadow-[0_0_12px_#84cc16] drop-shadow-[0_0_20px_#84cc16]", 
        oGlow: "drop-shadow-[0_0_6px_#ec4899] drop-shadow-[0_0_12px_#ec4899] drop-shadow-[0_0_20px_#ec4899]" 
    },
    { 
        id: "PIXEL", 
        displayId: 5, 
        xColor: "text-slate-200", 
        oColor: "text-slate-200", 
        xGlow: "drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]", 
        oGlow: "drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]", 
        bordered: true 
    },
    { 
        id: "MINIMAL", 
        displayId: 6, 
        xColor: "text-emerald-400", 
        oColor: "text-emerald-400", 
        xGlow: "drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]", 
        oGlow: "drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]",
        animation: "animate-pulse" 
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

// /**
//  * Get all available marker variants
//  */
// export const getMarkerVariants = () => [...MARKER_VARIANTS];

/**
 * Transform frontend values to backend API format
 * Converts display IDs to backend enum names and numeric values
 * @param {Object} selection - Frontend selection { boardSize, gridStyle, markerVariant }
 * @returns {Object} Backend format { boardSize: number, boardStyle: string, markerStyle: string }
 */

export const transformToBackendFormat = (selection) => {
    
    let boardSize = selection.boardSize;
    if (typeof boardSize === 'string') {
        boardSize = parseInt(boardSize.split('x')[0]);
    }
  
    const currentGridStyle = String(selection.gridStyle).toLowerCase();
    const gridStyleObj = GRID_STYLES.find(s => s.displayId === currentGridStyle);
    const boardStyle = gridStyleObj?.id || 'CLASSIC'; 
    const currentMarkerId = Number(selection.markerVariant); 
    const markerVariantObj = MARKER_VARIANTS.find(m => m.displayId === currentMarkerId);
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
 * @param {Object} options - Frontend customization { boardSize, gridStyle, markerVariant, aiDifficulty }
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
    console.log("Dữ liệu gốc từ UI:", options);
    console.log("Dữ liệu sau khi chuyển đổi (Payload):", backendPayload);
};

/**
 * Get all available AI difficulty levels for single player mode
 * @returns {Array} Array of difficulty objects with AI info
 */
export const getDifficultyLevels = () => {
    return [
        {
            id: 'EASY',
            level: 'EASY',
            aiName: 'Bot (Easy)',
            badgeColor: 'cyan-400',
            badgeColorHex: '#22d3ee',
            description: 'A rookie opponent. Learn the game at your own pace.'
        },
        {
            id: 'MEDIUM',
            level: 'MEDIUM',
            aiName: 'Bot (Medium)',
            badgeColor: 'yellow-400',
            badgeColorHex: '#facc15',
            description: 'A seasoned opponent. Expect a real challenge.'
        },
        {
            id: 'HARD',
            level: 'HARD',
            aiName: 'Bot (Hard)',
            badgeColor: 'red-500',
            badgeColorHex: '#ef4444',
            description: 'A master tactician. Seek the ultimate test of skill.'
        }
    ];
};
