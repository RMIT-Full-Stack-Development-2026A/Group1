import { getActiveZone, evaluateCell } from './ai.helpers';

// Stop searching after this time to prevent browser freeze
const MAX_THINKING_TIME_MS = 1200; 
// Absolute maximum depth limit 
const MAX_SEARCH_DEPTH = 15; 
const WINNING_THRESHOLD = 10000000;
const DEFENSE_FACTOR = 1.2;

// Global state to manage search limits across recursive calls
let isTimeOut = false;
// Store killer moves for each depth [depth][move_string]
let killerMoves = [];

/**
 * Static evaluation of the board state.
 */
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
    
    return botScore - (humanScore * DEFENSE_FACTOR);
};

/**
 * Generates and sorts candidate moves based on immediate heuristic scores.
 */
const getCandidateMoves = (board, botMark, humanMark, zone, currentDepth) => {
    const moves = [];
    let forcedBlock = null; // Variable used to "remember" the location that needs to be blocked urgently.
    
    for (let r = zone.minR; r <= zone.maxR; r++) {
        for (let c = zone.minC; c <= zone.maxC; c++) {
            if (board[r][c] === null) {
                const attackScore = evaluateCell(board, r, c, botMark);
                const defenseScore = evaluateCell(board, r, c, humanMark);
                
                // 1. IF AI CAN WIN IMMEDIATELY -> Play now, end the game!
                if (attackScore >= WINNING_THRESHOLD) {
                    return [{ row: r, col: c, score: WINNING_THRESHOLD }];
                }
                
                // 2. IF HUMAN IS ABOUT TO WIN -> Remember to block.
                // Find out if the AI has any winning moves on the rest of the board.
                if (defenseScore >= WINNING_THRESHOLD) {
                    forcedBlock = { row: r, col: c, score: WINNING_THRESHOLD };
                }

                const totalScore = attackScore + defenseScore;
                if (totalScore > 0) {
                    moves.push({ row: r, col: c, score: totalScore });
                }
            }
        }
    }

    // 3. After scanning the entire board:
    // If the AI has no winning moves, but the Human has a move that's about to win -> Block is mandatory.
    if (forcedBlock) {
        return [forcedBlock];
    }

    // 4. Handling Killer Moves and Arranging Normal Moves
    const currentKillers = killerMoves[currentDepth] || new Set();
    
    moves.forEach(m => {
        const moveId = `${m.row},${m.col}`;
        if (currentKillers.has(moveId)) {
            m.score += 50000; // Huge boost for killer moves
        }
    });

    // Sort in descending order by total score
    moves.sort((a, b) => b.score - a.score);
    
    // Adaptive Beam Search: The deeper you think, the narrower your field of vision becomes in order to maintain speed.
    const width = currentDepth > 4 ? 8 : 15;
    return moves.slice(0, width);
};

/**
 * Core Minimax with Alpha-Beta Pruning and Time Control
 */
const minimax = (board, depth, alpha, beta, isMaximizing, botMark, humanMark, zone, startTime, currentPly) => {
    // Time check: abort completely if we exceeded our time budget
    if ((Date.now() - startTime) > MAX_THINKING_TIME_MS) {
        isTimeOut = true;
        return 0; 
    }

    if (depth === 0) {
        return evaluateBoardStatic(board, botMark, humanMark, zone);
    }

    const candidateMoves = getCandidateMoves(board, botMark, humanMark, zone, currentPly);
    if (candidateMoves.length === 0) return 0;
    
    // Early termination if a forced win/loss is found right here
    if (candidateMoves.length === 1 && candidateMoves[0].score >= WINNING_THRESHOLD) {
        board[candidateMoves[0].row][candidateMoves[0].col] = isMaximizing ? botMark : humanMark;
        const terminalScore = evaluateBoardStatic(board, botMark, humanMark, zone);
        board[candidateMoves[0].row][candidateMoves[0].col] = null;
        return terminalScore;
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of candidateMoves) {
            board[move.row][move.col] = botMark; 
            const ev = minimax(board, depth - 1, alpha, beta, false, botMark, humanMark, zone, startTime, currentPly + 1);
            board[move.row][move.col] = null;    

            if (isTimeOut) break;

            if (ev > maxEval) maxEval = ev;
            if (ev > alpha) alpha = ev;
            
            // Alpha-Beta Cutoff -> Register Killer Move
            if (beta <= alpha) {
                killerMoves[currentPly].add(`${move.row},${move.col}`);
                break; 
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of candidateMoves) {
            board[move.row][move.col] = humanMark; 
            const ev = minimax(board, depth - 1, alpha, beta, true, botMark, humanMark, zone, startTime, currentPly + 1);
            board[move.row][move.col] = null;      

            if (isTimeOut) break;

            if (ev < minEval) minEval = ev;
            if (ev < beta) beta = ev;
            
            // Alpha-Beta Cutoff -> Register Killer Move
            if (beta <= alpha) {
                killerMoves[currentPly].add(`${move.row},${move.col}`);
                break; 
            }
        }
        return minEval;
    }
};

/**
 * Main export utilizing Iterative Deepening
 */
export const getHardMove = (board, botMark) => {
    const size = board.length;
    const humanMark = botMark === 'X' ? 'O' : 'X';
    const zone = getActiveZone(board, 2);

    if (!zone) {
        const center = Math.floor(size / 2);
        return [center, center];
    }

    let bestMoveOverall = null;
    const startTime = Date.now();
    
    // Reset global search constraints
    isTimeOut = false;
    killerMoves = Array(MAX_SEARCH_DEPTH + 1).fill(null).map(() => new Set());

    // Iterative Deepening Loop
    for (let depth = 1; depth <= MAX_SEARCH_DEPTH; depth++) {
        let currentDepthBestMove = null;
        let bestScore = -Infinity;
        
        const moves = getCandidateMoves(board, botMark, humanMark, zone, 0);
        
        // Immediate win/loss detection at root
        if (moves.length === 1 && moves[0].score >= WINNING_THRESHOLD) {
            return [moves[0].row, moves[0].col];
        }

        // Principal Variation (PV) Ordering: 
        // Always search the best move from the previous depth first!
        if (bestMoveOverall) {
            moves.sort((a, b) => {
                const isABest = a.row === bestMoveOverall[0] && a.col === bestMoveOverall[1];
                const isBBest = b.row === bestMoveOverall[0] && b.col === bestMoveOverall[1];
                if (isABest && !isBBest) return -1;
                if (!isABest && isBBest) return 1;
                return 0;
            });
        }

        for (const move of moves) {
            board[move.row][move.col] = botMark;
            const score = minimax(board, depth - 1, -Infinity, Infinity, false, botMark, humanMark, zone, startTime, 1);
            board[move.row][move.col] = null;

            if (isTimeOut) break;

            if (score > bestScore) {
                bestScore = score;
                currentDepthBestMove = [move.row, move.col];
            }
        }

        // If time ran out during this depth, discard its incomplete results 
        // and use the reliable best move from the previous depth.
        if (isTimeOut) {
            break; 
        }
        
        bestMoveOverall = currentDepthBestMove;
        
        // If we foresee a forced win, no need to search deeper
        if (bestScore >= WINNING_THRESHOLD) {
            break;
        }
    }

    // Fallback just in case, though highly unlikely
    return bestMoveOverall || [zone.minR, zone.minC]; 
};