/**
 * Check if the current move results in a win.
 * @param {Array<Array<string|null>>} board - The current 2D board state
 * @param {number} row - The row index of the current move
 * @param {number} col - The column index of the current move
 * @param {string} player - The current player ('X' or 'O')
 * @returns {Array<Array<number>>|null} - Returns an array of winning coordinates or null if no win
 */
export const checkWin = (board, row, col, player) => {
    // 4 directions: Horizontal, Vertical, Main Diagonal, Anti-Diagonal
    const directions = [
        [0, 1],  // Horizontal (Right)
        [1, 0],  // Vertical (Down)
        [1, 1],  // Main Diagonal (Down-Right)
        [1, -1]  // Anti-Diagonal (Down-Left)
    ];

    const numRows = board.length;
    const numCols = board[0].length;

    for (let [dRow, dCol] of directions) {
        let count = 1; // Count the current cell
        let winningCells = [[row, col]]; // Store coordinates for UI animation

        // Check forward direction
        let r = row + dRow;
        let c = col + dCol;
        while (r >= 0 && r < numRows && c >= 0 && c < numCols && board[r][c] === player) {
            count++;
            winningCells.push([r, c]);
            r += dRow;
            c += dCol;
        }

        // Check backward direction
        r = row - dRow;
        c = col - dCol;
        while (r >= 0 && r < numRows && c >= 0 && c < numCols && board[r][c] === player) {
            count++;
            winningCells.push([r, c]);
            r -= dRow;
            c -= dCol;
        }

        // If 5 or more consecutive cells are found, return the winning cells
        if (count >= 5) {
            return winningCells;
        }
    }

    return null; // No win in any direction
};

/**
 * Check if the board is completely full (Draw)
 */
export const checkDraw = (board) => {
    // Return true if there is no null cell left
    return board.every(row => row.every(cell => cell !== null));
};