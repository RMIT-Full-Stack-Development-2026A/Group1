/**
 * Evaluates the board state to determine if the last move resulted in a Gomoku win.
 * @param {Array} moves - List of all board moves.
 * @param {number} boardSize - Dimension of the grid.
 * @param {number} lastMoveRow - Row index of the last move.
 * @param {number} lastMoveCol - Column index of the last move.
 * @param {number} playerIndex - Participant index making the move.
 * @returns {Array|null} Winning line coordinate array, or null if no win.
 */
export const checkGomokuWin = (moves, boardSize, lastMoveRow, lastMoveCol, playerIndex) => {
    const playerMoves = new Set();
    
    // Cache player move coordinates
    for (const m of moves) {
        if (m.byParticipantIndex === playerIndex) {
            playerMoves.add(`${m.row},${m.col}`);
        }
    }

    // Directional axes: [Horizontal, Vertical, Diagonal Down, Diagonal Up]
    const axes = [
        [[0, 1], [0, -1]],
        [[1, 0], [-1, 0]],
        [[1, 1], [-1, -1]],
        [[1, -1], [-1, 1]]
    ];

    /**
     * Converts matrix indices to algebraic notation.
     * @param {number} r - Row index.
     * @param {number} c - Column index.
     * @returns {string} Algebraic coordinate (e.g., A1).
     */
    const getCoordinate = (r, c) => `${String.fromCharCode(65 + c)}${r + 1}`;

    for (const [dir1, dir2] of axes) {
        let count = 1;
        const winningLine = [{ 
            row: lastMoveRow, 
            col: lastMoveCol, 
            coordinate: getCoordinate(lastMoveRow, lastMoveCol) 
        }];

        /**
         * Traverses the board in a specific directional vector.
         * @param {number} dRow - Row delta.
         * @param {number} dCol - Column delta.
         */
        const traverse = (dRow, dCol) => {
            let r = lastMoveRow + dRow;
            let c = lastMoveCol + dCol;
            
            while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && playerMoves.has(`${r},${c}`)) {
                count++;
                winningLine.push({ row: r, col: c, coordinate: getCoordinate(r, c) });
                r += dRow;
                c += dCol;
            }
        };

        traverse(dir1[0], dir1[1]);
        traverse(dir2[0], dir2[1]);

        if (count >= 5) return winningLine; 
    }

    return null;
};