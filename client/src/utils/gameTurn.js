/**
 * Turn state shared by the offline and online game screens.
 *
 * A player is active only while the match is running and it is their mark's turn.
 * Keeping the rule here stops the two screens (and the desktop panel / mobile
 * avatar bar) from drifting apart.
 *
 * @param {string} mark        the player's mark ('X' | 'O')
 * @param {string} currentMark the mark whose turn it is
 * @param {{ gameOver?: boolean, isPlaying?: boolean }} [state]
 *        gameOver  the match has a winner or is a draw
 *        isPlaying false while waiting for an opponent / a room that is not PLAYING
 * @returns {boolean}
 */
export const isPlayerTurn = (mark, currentMark, { gameOver = false, isPlaying = true } = {}) =>
    Boolean(mark) && !gameOver && isPlaying && mark === currentMark;
