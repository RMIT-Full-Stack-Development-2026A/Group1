import { useSocketStore } from '@/stores/socket/SocketStore';
import classicBg from '@/assets/themes/classic/bg.png';
import neonBg from '@/assets/themes/neon/bg.png';
import blockBg from '@/assets/themes/block/bg.png';

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
    { id: "JUNGLE", displayId: "jungle", name: "JUNGLE" },
    { id: "DARK", displayId: "dark", name: "DARK"},
    { id: "LAVA", displayId: "lava", name: "LAVA"},
];

// Maps frontend numeric IDs to backend enum names
export const BOARD_THEMES = {
    jungle: {
        wrapper: 'bg-[#0a0a1a] border-4 border-[#276112]',
        cellBorder: 'border-1 border-[#276112] bg-[#0a0a1a]',
        boardBorder: 'border-4 border-[#2a2a4e]/40',
        glow: { boxShadow: '0 0 20px rgba(16, 184, 55, 0.57), inset 0 0 14px rgba(16, 184, 55, 0.57)' },
        bgImage: classicBg
    },
    dark: {
        wrapper: 'bg-[#0a0a1a] border-4 border-[#4cc9f0]',
        cellBorder: 'border-1 border-[#4cc9f0] bg-[#0a0a1a]',
        boardBorder: 'border-4 border-[#4cc9f0]/40',
        glow: { boxShadow: '0 0 24px rgba(76, 201, 240, 0.18), inset 0 0 18px rgba(76, 201, 240, 0.08)' },
        bgImage: neonBg
    },
    lava: {
        wrapper: 'bg-[#0a0a0a] border-4 border-[#ff3d00]',
        cellBorder: 'border-1 border-[#ff3d00] bg-[#0a0a1a]',
        boardBorder: 'border-4 border-[#ff3d00]/40',
        glow: { boxShadow: '0 0 18px rgba(255, 61, 0, 0.2), inset 0 0 10px rgba(255, 61, 0, 0.06)' },
        bgImage: blockBg
    },
};
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
    
    let boardSize = selection.boardSize;
    if (typeof boardSize === 'string') {
        boardSize = parseInt(boardSize.split('x')[0]);
    }
  
    const currentGridStyle = String(selection.gridStyle).toLowerCase();
    const gridStyleObj = GRID_STYLES.find(s => s.displayId === currentGridStyle);
    const boardStyle = gridStyleObj?.id || 'JUNGLE'; 
    // markerVariant can be a single number or we may have per-player values
    let currentMarkerId = Number(selection.markerVariant);
    if (!currentMarkerId) {
        // Prefer X variant if provided
        if (selection.markerVariantX) currentMarkerId = Number(selection.markerVariantX);
        else if (selection.markerVariantO) currentMarkerId = Number(selection.markerVariantO);
    }
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
 * Create a game room via WebSocket
 * @param {Object} options - Frontend customization { boardSize, gridStyle, markerVariant }
 * @returns {Promise<Object>} Room data with roomId
 */
export const createGameRoom = (options, isOnline = false) => {

    if (!isOnline) {
        return Promise.resolve({
            roomId: `offline_${Date.now()}`,
            ...options,
            status: 'PLAYING',
            participants: []
        });
    }

    return new Promise((resolve, reject) => {
        const { socket, isConnected, connectSocket } = useSocketStore.getState();

        if (!isConnected || !socket) {
            connectSocket();
            const retryTimeout = setTimeout(() => {
                const { socket: newSocket, isConnected: newConnected } = useSocketStore.getState();
                if (!newConnected || !newSocket) {
                    clearTimeout(retryTimeout);
                    return reject(new Error('Socket not connected. Please try again.'));
                }
                _emitRoomCreate(newSocket, options, resolve, reject);
            }, 2000);
            return;
        }

        _emitRoomCreate(socket, options, resolve, reject);
    });
};

function _emitRoomCreate(socket, options, resolve, reject) {
    const backendPayload = transformToBackendFormat(options);

    const socketPayload = {
        ...backendPayload,
        marker: 'X',
    };

    console.log('[createGameRoom] Emitting room:create via socket:', socketPayload);

    const timeout = setTimeout(() => {
        socket.off('room:created', onCreated);
        socket.off('error', onError);
        reject(new Error('Server did not respond to room:create. Please try again.'));
    }, 10000);

    function onCreated(payload) {
        clearTimeout(timeout);
        socket.off('room:created', onCreated);
        socket.off('error', onError);

        console.log('[createGameRoom] room:created received:', payload);
        const room = payload?.room;

        if (!room?.id) {
            return reject(new Error('Server returned invalid room data.'));
        }

        resolve({
            ...room,
            roomId: room.id,
        });
    }

    function onError(errorPayload) {
        if (errorPayload?.event !== 'room:create') return;
        clearTimeout(timeout);
        socket.off('room:created', onCreated);
        socket.off('error', onError);

        console.error('[createGameRoom] room:create error:', errorPayload);
        reject(new Error(errorPayload?.message || 'Failed to create room.'));
    }

    socket.once('room:created', onCreated);
    socket.on('error', onError);

    socket.emit('room:create', socketPayload);
    console.log('[createGameRoom] room:create emitted.');
}

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
