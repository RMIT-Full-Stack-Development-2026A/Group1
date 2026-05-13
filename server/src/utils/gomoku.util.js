export const checkGomokuWin = (moves, boardSize, lastMoveRow, lastMoveCol, playerIndex) => {
    // Declare variable
    const playerMoves = new Set();
    for (const m of moves) {
        if (m.byParticipantIndex === playerIndex) {
            playerMoves.add(`${m.row},${m.col}`);
        }
    }

    // Define the 4 axes (Horizontal, Vertical, Diagonal Down, Diagonal Up)
    const axes = [
        [[0, 1], [0, -1]],   // Horizontal (Right, Left)
        [[1, 0], [-1, 0]],   // Vertical (Down, Up)
        [[1, 1], [-1, -1]],  // Diagonal (Bottom-Right, Top-Left)
        [[1, -1], [-1, 1]]   // Diagonal (Bottom-Left, Top-Right)
    ];

    // Generate the Algebraic coordinate (A1, A2, ...)
    const getCoordinate = (r, c) => `${String.fromCharCode(65 + c)}${r + 1}`;

    // Check each axis
    for (const [dir1, dir2] of axes) {
        let count = 1;
        const winningLine = [{ 
            row: lastMoveRow, 
            col: lastMoveCol, 
            coordinate: getCoordinate(lastMoveRow, lastMoveCol) 
        }];

        // Helper to traverse in one specific direction
        const traverse = (dRow, dCol) => {
            let r = lastMoveRow + dRow;
            let c = lastMoveCol + dCol;
            
            // Keep walking while inside bounds AND the cell belongs to the player
            while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && playerMoves.has(`${r},${c}`)) {
                count++;
                winningLine.push({ row: r, col: c, coordinate: getCoordinate(r, c) });
                r += dRow;
                c += dCol;
            }
        };

        // Walk both ways along the current axis
        traverse(dir1[0], dir1[1]);
        traverse(dir2[0], dir2[1]);

        // Win condition
        if (count >= 5) {
            return winningLine; 
        }
    }

    return null; // No win
};