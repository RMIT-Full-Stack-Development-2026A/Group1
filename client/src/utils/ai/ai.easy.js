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
 * Easy AI Move - Randomly selects an empty cell adjacent to the player's LAST move
 * (with fallback to zone-based scanning if no adjacent cell is available or no last move provided)
 */
export const getEasyMove = (board, botMark = 'O', lastMove = null) => {
    const size = board.length;
    const opponentMark = botMark === 'X' ? 'O' : 'X';

    // ── If we know the player's last move, only pick adjacent to it ──
    if (lastMove && lastMove.row != null && lastMove.col != null) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        const adjacentMoves = [];
        for (const [dr, dc] of directions) {
            const r = lastMove.row + dr;
            const c = lastMove.col + dc;
            if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) {
                adjacentMoves.push([r, c]);
            }
        }

        if (adjacentMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * adjacentMoves.length);
            return adjacentMoves[randomIndex];
        }

        // Fallthrough: all adjacent cells occupied → fall back to zone scanning
    }

    // ── Fallback: zone-based adjacent-to-any-player-move scanning ──
    const zone = getActiveZone(board, 1);

    if (!zone) {
        const center = Math.floor(size / 2);
        return [center, center];
    }

    const candidateMoves = [];

    for (let r = zone.minR; r <= zone.maxR; r++) {
        for (let c = zone.minC; c <= zone.maxC; c++) {
            if (board[r][c] === null && isAdjacentToOpponent(board, r, c, opponentMark)) {
                candidateMoves.push([r, c]);
            }
        }
    }

    if (candidateMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidateMoves.length);
        return candidateMoves[randomIndex];
    }

    // Ultimate fallback
    return [0, 0];
};