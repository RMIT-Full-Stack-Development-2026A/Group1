/**
 * Standardized Heuristic Scoring Matrix for all AI levels
 */
export const getScore = (count, blocks) => {
    if (count >= 5) return 10000000;         // Guaranteed Win
    if (count === 4 && blocks === 0) return 100000; // Open 4
    if (count === 4 && blocks === 1) return 5000;   // Capped 4
    if (count === 3 && blocks === 0) return 3000;   // Open 3
    if (count === 3 && blocks === 1) return 200;    // Capped 3
    if (count === 2 && blocks === 0) return 100;    // Open 2
    if (count === 2 && blocks === 1) return 10;     // Capped 2
    if (count === 1 && blocks === 0) return 1;      // Single
    return 0;
};

/**
 * Evaluate the danger/advantage score of a specific cell
 */
export const evaluateCell = (board, row, col, mark) => {
    const size = board.length;
    const directions = [ [0, 1], [1, 0], [1, 1], [1, -1] ];
    
    let totalScore = 0;
    
    // Count the number of critical chess positions to detect the forks.
    let live4 = 0, dead4 = 0, live3 = 0, dead3 = 0, live2 = 0;

    for (const [dr, dc] of directions) {
        let f_stones = 0, f_gap = 0, f_stones2 = 0, f_block = 0;
        let r = row + dr, c = col + dc;
        
        // Forward scan
        while (r >= 0 && r < size && c >= 0 && c < size) {
            if (board[r][c] === mark) {
                if (f_gap === 0) f_stones++;
                else f_stones2++;
            } else if (board[r][c] === null) {
                if (f_gap === 0) f_gap = 1; // Note the first gap.
                else break;                 // Encounter the second gap -> Stop
            } else {
                f_block = 1; break;         // Encountered enemy troops -> Blocked
            }
            r += dr; c += dc;
        }
        if (r < 0 || r >= size || c < 0 || c >= size) f_block = 1;

        let b_stones = 0, b_gap = 0, b_stones2 = 0, b_block = 0;
        r = row - dr; c = col - dc;
        
        // Backward scan
        while (r >= 0 && r < size && c >= 0 && c < size) {
            if (board[r][c] === mark) {
                if (b_gap === 0) b_stones++;
                else b_stones2++;
            } else if (board[r][c] === null) {
                if (b_gap === 0) b_gap = 1;
                else break;
            } else {
                b_block = 1; break;
            }
            r -= dr; c -= dc;
        }
        if (r < 0 || r >= size || c < 0 || c >= size) b_block = 1;

        // SYNTHESIS OF LOGIC
        const totalStones = 1 + f_stones + b_stones;
        const blocks = f_block + b_block;
        
        // Length if filling gaps (Broken patterns)
        const len1 = totalStones + f_stones2; 
        const len2 = totalStones + b_stones2;

        if (totalStones >= 5) return 10000000; // Win instantly

        let isLive4 = false, isDead4 = false, isLive3 = false, isDead3 = false;

        // Continuous Chess Analysis
        if (totalStones === 4) {
            if (blocks === 0) isLive4 = true;
            else if (blocks === 1) isDead4 = true;
        } else if (totalStones === 3) {
            if (blocks === 0) isLive3 = true;
            else if (blocks === 1) isDead3 = true;
        } else if (totalStones === 2) {
            if (blocks === 0) live2++;
        }

        // Broken Flag Analysis
        if (f_gap === 1 && len1 === 4) isDead4 = true;
        if (b_gap === 1 && len2 === 4) isDead4 = true;
        
        // Trap 3: Must be unblocked at both ends to be valid for creating a trap.
        if (f_gap === 1 && len1 === 3 && f_block === 0 && b_block === 0) isLive3 = true;
        if (b_gap === 1 && len2 === 3 && f_block === 0 && b_block === 0) isLive3 = true;

        if (isLive4) live4++;
        if (isDead4) dead4++;
        if (isLive3) live3++;
        if (isDead3) dead3++;

        totalScore += getScore(totalStones, blocks);
    }

    // --- Fork Detection System ---
    // Priority 1: With flag 4 open -> Cannot be blocked, must be captured
    if (live4 > 0) return 600000; 

    // Priority 2: Terrifying Double Threat (4-4 or 4-3 Trap). Opponent can only block one side!
    if (dead4 >= 2 || (dead4 >= 1 && live3 >= 1)) return 500000; 

    // Priority 3: Traditional 3-3 Trap
    if (live3 >= 2) return 100000; 

    // Accumulate points from potential positions to compare normal moves.
    totalScore += dead4 * 8000;
    totalScore += live3 * 5000;
    totalScore += dead3 * 500;
    totalScore += live2 * 100;

    return totalScore;
};

/**
 * Use the chessboard's active area to optimize the loop (Keep the width at 2 squares).
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