// This makes traps almost impossible to pull off against the AI.
const MAX_DEPTH = 4; 

// Decrease slightly to balance the exponential cost of Depth 4 and keep the browser fast
const TOP_MOVES_TO_SEARCH = 10; 

// UPGRADE 2: Paranoia Multiplier. The Bot fears the human's setup more than it values its own.
const DEFENSE_PARANOIA_FACTOR = 1.5; 

// ---------------------------------------------------------
// 1. HELPER FUNCTIONS 
// ---------------------------------------------------------
const getScore = (count, blocks) => {
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

const evaluateCell = (board, row, col, mark) => {
    let totalScore = 0;
    let open3Count = 0; 
    const size = board.length;
    const directions = [ [0, 1], [1, 0], [1, 1], [1, -1] ];

    for (const [dr, dc] of directions) {
        let count = 1; 
        let blocks = 0;

        // Forward
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === mark) {
            count++; r += dr; c += dc;
        }
        if (r < 0 || r >= size || c < 0 || c >= size || (board[r][c] !== null && board[r][c] !== mark)) blocks++;

        // Backward
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

const getActiveZone = (board, padding = 2) => {
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

// ---------------------------------------------------------
// 2. MINIMAX CORE LOGIC
// ---------------------------------------------------------

const evaluateBoardStatic = (board, botMark, humanMark, zone) => {
    let botScore = 0;
    let humanScore = 0;

    for (let r = zone.minR; r <= zone.maxR; r++) {
        for (let c = zone.minC; c <= zone.maxC; c++) {
            if (board[r][c] === botMark) {
                botScore += evaluateCell(board, r, c, botMark);
            } else if (board[r][c] === humanMark) {
                humanScore += evaluateCell(board, r, c, humanMark);
            }
        }
    }
    // Multiply humanScore to make the Bot hyper-defensive in its future evaluations
    return botScore - (humanScore * DEFENSE_PARANOIA_FACTOR);
};

const getSortedCandidateMoves = (board, botMark, humanMark, zone) => {
    const moves = [];
    
    for (let r = zone.minR; r <= zone.maxR; r++) {
        for (let c = zone.minC; c <= zone.maxC; c++) {
            if (board[r][c] === null) {
                const attackScore = evaluateCell(board, r, c, botMark);
                const defenseScore = evaluateCell(board, r, c, humanMark);
                
                // CRITICAL FIX: Order of operations matters. 
                // 1. If Bot can win right now, do it.
                if (attackScore >= 10000000) return [[r, c]]; 
                // 2. If Bot can't win, but Human is about to win, block it AT ALL COSTS.
                if (defenseScore >= 10000000) return [[r, c]]; 

                // Weight defense heavier to suffocate the player's attempts to build
                const totalScore = attackScore + (defenseScore * DEFENSE_PARANOIA_FACTOR);
                
                if (totalScore > 0) {
                    moves.push({ row: r, col: c, score: totalScore });
                }
            }
        }
    }

    moves.sort((a, b) => b.score - a.score);
    return moves.slice(0, TOP_MOVES_TO_SEARCH).map(m => [m.row, m.col]);
};

const minimax = (board, depth, alpha, beta, isMaximizing, botMark, humanMark, zone) => {
    if (depth === 0) {
        return evaluateBoardStatic(board, botMark, humanMark, zone);
    }

    const candidateMoves = getSortedCandidateMoves(board, botMark, humanMark, zone);
    if (candidateMoves.length === 0) return 0;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const [r, c] of candidateMoves) {
            board[r][c] = botMark; 
            const ev = minimax(board, depth - 1, alpha, beta, false, botMark, humanMark, zone);
            board[r][c] = null;    

            maxEval = Math.max(maxEval, ev);
            alpha = Math.max(alpha, ev);
            if (beta <= alpha) break; 
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const [r, c] of candidateMoves) {
            board[r][c] = humanMark; 
            const ev = minimax(board, depth - 1, alpha, beta, true, botMark, humanMark, zone);
            board[r][c] = null;      

            minEval = Math.min(minEval, ev);
            beta = Math.min(beta, ev);
            if (beta <= alpha) break; 
        }
        return minEval;
    }
};

/**
 * 3. MAIN EXPORT FUNCTION (Hard Bot)
 */
export const getHardMove = (board, botMark) => {
    const size = board.length;
    const humanMark = botMark === 'X' ? 'O' : 'X';
    
    const zone = getActiveZone(board, 2);

    if (!zone) {
        const center = Math.floor(size / 2);
        return [center, center];
    }

    const candidateMoves = getSortedCandidateMoves(board, botMark, humanMark, zone);
    
    // Immediate win or block found by HR department
    if (candidateMoves.length === 1) {
        return candidateMoves[0];
    }

    let bestScore = -Infinity;
    let bestMove = candidateMoves[0] || [0,0];

    for (const [r, c] of candidateMoves) {
        board[r][c] = botMark; 
        const moveScore = minimax(board, MAX_DEPTH - 1, -Infinity, Infinity, false, botMark, humanMark, zone);
        board[r][c] = null;    

        if (moveScore > bestScore) {
            bestScore = moveScore;
            bestMove = [r, c];
        }
    }

    return bestMove;
};