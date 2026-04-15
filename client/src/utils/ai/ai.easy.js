import { getActiveZone } from './ai.helpers';

/**
 * Check if a specific empty cell is directly adjacent (8 directions) to any opponent mark
 */
const isAdjacentToOpponent = (board, row, col, opponentMark) => {
    const size = board.length;
    // 8 directions: Up, Down, Left, Right, and 4 Diagonals
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    for (const [dr, dc] of directions) {
        const r = row + dr;
        const c = col + dc;
        
        // If the adjacent cell is within bounds and contains the opponent's mark
        if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === opponentMark) {
            return true;
        }
    }
    
    return false;
};

/**
 * Easy AI Move - Randomly selects an empty cell adjacent to player's moves
 * Optimized using Zone of Interest and 8-direction scanning
 */
export const getEasyMove = (board, botMark = 'O') => {
    const size = board.length;
    const opponentMark = botMark === 'X' ? 'O' : 'X';
    
    // We only need padding 1 because we only care about immediately adjacent cells
    const zone = getActiveZone(board, 1);

    // Fallback: If board is empty (first move), play exactly in the center
    if (!zone) {
        const center = Math.floor(size / 2);
        return [center, center];
    }

    const candidateMoves = [];

    // Only scan within the active bounding box
    for (let r = zone.minR; r <= zone.maxR; r++) {
        for (let c = zone.minC; c <= zone.maxC; c++) {
            // Find empty cells that touch at least one opponent's mark
            if (board[r][c] === null && isAdjacentToOpponent(board, r, c, opponentMark)) {
                candidateMoves.push([r, c]);
            }
        }
    }

    // Pick a random adjacent cell
    if (candidateMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidateMoves.length);
        return candidateMoves[randomIndex];
    }

    // Ultimate fallback
    return [0, 0];
};