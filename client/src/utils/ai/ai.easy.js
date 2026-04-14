/**
 * Easy AI Strategy - Random Adjacent Moves
 * The Easy AI shall randomly choose an empty cell immediately adjacent to 
 * the player's last move.
 */

/**
 * Get all empty cells adjacent to any opponent mark
 * @param {Array} board - 2D board state
 * @param {String} opponentMark - The opponent's mark ('X' or 'O')
 * @returns {Array} Array of [row, col] coordinates adjacent to opponent marks
 */
const getAdjacentEmptyCells = (board, opponentMark) => {
    const size = board.length;
    const adjacentCells = new Set();
    
    // 8 directions: up, down, left, right, and 4 diagonals
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    // Scan the board for opponent marks
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            // Found an opponent mark
            if (board[r][c] === opponentMark) {
                // Check all 8 adjacent cells
                for (const [dr, dc] of directions) {
                    const newR = r + dr;
                    const newC = c + dc;
                    
                    // Check bounds and if cell is empty
                    if (newR >= 0 && newR < size && newC >= 0 && newC < size && board[newR][newC] === null) {
                        // Use Set to avoid duplicates (a cell might be adjacent to multiple opponent marks)
                        adjacentCells.add(JSON.stringify([newR, newC]));
                    }
                }
            }
        }
    }
    
    // Convert Set back to array of coordinates
    return Array.from(adjacentCells).map(coord => JSON.parse(coord));
};

/**
 * Get all empty cells on the board
 * @param {Array} board - 2D board state
 * @returns {Array} Array of [row, col] coordinates for empty cells
 */
const getAllEmptyCells = (board) => {
    const size = board.length;
    const emptyCells = [];
    
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === null) {
                emptyCells.push([r, c]);
            }
        }
    }
    
    return emptyCells;
};

/**
 * Easy AI Move - Randomly selects an empty cell adjacent to player's moves
 * @param {Array} board - 2D board state
 * @param {String} botMark - Bot's mark ('X' or 'O')
 * @returns {Array} coordinate [row, col]
 */
export const getEasyMove = (board, botMark = 'O') => {
    // Determine opponent's mark
    const opponentMark = botMark === 'X' ? 'O' : 'X';
    
    // Get all empty cells adjacent to opponent marks
    const adjacentCells = getAdjacentEmptyCells(board, opponentMark);
    
    // If adjacent cells exist, randomly pick one
    if (adjacentCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * adjacentCells.length);
        return adjacentCells[randomIndex];
    }
    
    // Fallback: If no adjacent cells (e.g., first move), pick any random empty cell
    const allEmpty = getAllEmptyCells(board);
    if (allEmpty.length > 0) {
        const randomIndex = Math.floor(Math.random() * allEmpty.length);
        return allEmpty[randomIndex];
    }
    
    // Safety: Board is full (shouldn't happen in normal gameplay)
    return [0, 0];
};
