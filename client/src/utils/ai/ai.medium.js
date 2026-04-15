import { getActiveZone, evaluateCell } from './ai.helpers';

/**
 * Heuristic Algorithm (Medium Bot) - DEFENSIVE STRATEGY ONLY
 * Highly optimized using Zone of Interest
 */
export const getMediumMove = (board, botMark) => {
    const size = board.length;
    // Identify the human player's mark to anticipate their attacks
    const humanMark = botMark === 'X' ? 'O' : 'X';
    
    // Calculate the active bounding box to avoid scanning the entire board
    const zone = getActiveZone(board, 2);

    // Edge case: Empty board (Bot moves first)
    if (!zone) {
        const center = Math.floor(size / 2);
        return [center, center];
    }

    let bestScore = -1;
    let bestMoves = []; 

    // ONLY scan cells within the active zone
    for (let r = zone.minR; r <= zone.maxR; r++) {
        for (let c = zone.minC; c <= zone.maxC; c++) {
            // Only evaluate empty cells
            if (board[r][c] === null) {
                
                // Calculate how dangerous this cell is if the human plays here
                const defenseScore = evaluateCell(board, r, c, humanMark);

                if (defenseScore > bestScore) {
                    bestScore = defenseScore;
                    bestMoves = [[r, c]]; // Replace with new best move
                } else if (defenseScore === bestScore) {
                    bestMoves.push([r, c]); // Add to list if scores tie
                }
            }
        }
    }

    // Fallback if no threat is detected in the zone (should rarely happen with padding)
    if (bestScore === 0 || bestMoves.length === 0) {
        for (let r = zone.minR; r <= zone.maxR; r++) {
            for (let c = zone.minC; c <= zone.maxC; c++) {
                if (board[r][c] === null) return [r, c];
            }
        }
    }

    // Randomize among the best defensive moves to make the bot less predictable
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
};