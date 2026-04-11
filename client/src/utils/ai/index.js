// import { getEasyMove } from './ai.easy'; 
import { getMediumMove } from './ai.medium';

const AI_STRATEGIES = {
    // EASY: getEasyMove, 
    MEDIUM: getMediumMove,
    // HARD: getHardMove,
};

/**
 * Get the best move from AI based on difficulty
 * @param {Array} board - 2D Board at current state
 * @param {String} difficulty - 'EASY' | 'MEDIUM' | 'HARD'
 * @param {String} botMark - 'X' or 'O'
 * @returns {Array} coordinate [row, col]
 */
export const getBestAIMove = (board, difficulty = 'MEDIUM', botMark = 'O') => {
    
    const calculateMove = AI_STRATEGIES[difficulty] || AI_STRATEGIES.MEDIUM;
    
    return calculateMove(board, botMark);
};