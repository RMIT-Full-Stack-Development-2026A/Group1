// import { getEasyMove } from './ai.easy'; 
import { getEasyMove } from './ai.easy';
import { getMediumMove } from './ai.medium';
import { getHardMove } from './ai.hard';

const AI_STRATEGIES = {
    EASY: getEasyMove,
    MEDIUM: getMediumMove,
    HARD: getHardMove,
};

/**
 * Get the best move from AI based on difficulty
 * @param {Array} board - 2D Board at current state
 * @param {String} difficulty - 'EASY' | 'MEDIUM' | 'HARD'
 * @param {String} botMark - 'X' or 'O'
 * @param {Object|null} lastMove - { row, col } of the player's most recent move (for EASY AI)
 * @returns {Array} coordinate [row, col]
 */
export const getBestAIMove = (board, difficulty = 'HARD', botMark = 'O', lastMove = null) => {
    
    const calculateMove = AI_STRATEGIES[difficulty] || AI_STRATEGIES.MEDIUM;
    
    return calculateMove(board, botMark, lastMove);
};