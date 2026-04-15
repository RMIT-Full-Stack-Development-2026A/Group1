/**
 * Standardized Heuristic Scoring Matrix for all AI levels
 */
export const getScore = (count, blocks) => {
    if (blocks === 2 && count < 5) return 0; 
    if (count >= 5) return 10000000;              // Guaranteed Win
    if (count === 4 && blocks === 0) return 100000; // Open 4
    if (count === 4 && blocks === 1) return 10000;  // Capped 4
    if (count === 3 && blocks === 0) return 5000;   // Open 3
    if (count === 3 && blocks === 1) return 100;    // Capped 3
    if (count === 2 && blocks === 0) return 50;     // Open 2
    if (count === 2 && blocks === 1) return 5;      // Capped 2
    if (count === 1 && blocks === 0) return 1;      // Single
    return 0;
};

/**
 * Evaluate the danger/advantage score of a specific cell
 */
export const evaluateCell = (board, row, col, mark) => {
    let totalScore = 0;
    let open3Count = 0; 
    const size = board.length;
    const directions = [ [0, 1], [1, 0], [1, 1], [1, -1] ];

    for (const [dr, dc] of directions) {
        let count = 1; 
        let blocks = 0;

        // Forward scan
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === mark) {
            count++; r += dr; c += dc;
        }
        if (r < 0 || r >= size || c < 0 || c >= size || (board[r][c] !== null && board[r][c] !== mark)) blocks++;

        // Backward scan
        r = row - dr; c = col - dc;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === mark) {
            count++; r -= dr; c -= dc;
        }
        if (r < 0 || r >= size || c < 0 || c >= size || (board[r][c] !== null && board[r][c] !== mark)) blocks++;

        if (count === 3 && blocks === 0) open3Count++;
        totalScore += getScore(count, blocks);
    }
    
    if (open3Count >= 2) totalScore += 80000; // Fork detection
    return totalScore;
};

/**
 * Get the active bounding box of the board to optimize scanning
 */
export const getActiveZone = (board, padding = 2) => {
    const size = board.length;
    let minR = size, maxR = -1, minC = size, maxC = -1;
    let hasMoves = false;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== null) {
                hasMoves = true;
                if (r < minR) minR = r;
                if (r > maxR) maxR = r;
                if (c < minC) minC = c;
                if (c > maxC) maxC = c;
            }
        }
    }

    if (!hasMoves) return null;

    return {
        minR: Math.max(0, minR - padding),
        maxR: Math.min(size - 1, maxR + padding),
        minC: Math.max(0, minC - padding),
        maxC: Math.min(size - 1, maxC + padding)
    };
};