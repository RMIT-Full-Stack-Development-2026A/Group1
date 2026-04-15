import { getActiveZone, evaluateCell } from './ai.helpers';

// This makes traps almost impossible to pull off against the AI.
const MAX_DEPTH = 6; 

// Decrease slightly to balance the exponential cost of Depth 4 and keep the browser fast
const TOP_MOVES_TO_SEARCH = 10; 

// Paranoia Multiplier. The Bot fears the human's setup more than it values its own.
const DEFENSE_PARANOIA_FACTOR = 1.5; 

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

// Core Minimax
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

// Export Function
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