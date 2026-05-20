import { GameSession } from '../modules/game/models/gameSession.model.js';
import { ulid } from 'ulid';

/**
 * Determines user premium status based on expiration date.
 * @param {Object} user - User document.
 * @returns {boolean} True if premium is active.
 */
const computeIsPremium = (user) => !!(user.premiumExpiresAt && user.premiumExpiresAt > new Date());

/**
 * Seeds a completed match between two players.
 * @param {Object} player1 - First player document.
 * @param {Object} player2 - Second player document.
 * @returns {Promise<void>}
 */
export const seedMatches = async (player1, player2) => {
    console.log('Seeding Game Matches & History...');

    /**
     * Generates a predefined sequence of moves for the match.
     * @returns {Array<Object>} List of move objects.
     */
    const generateMoves = () => {
        const moves = [];
        for (let i = 0; i < 5; i++) {
            moves.push({
                moveNumber: i * 2 + 1,
                byParticipantIndex: 0,
                row: 5, col: 5 + i,
                coordinate: `F${6 + i}`, 
                placedAt: new Date(Date.now() - (10 - i * 2) * 60000)
            });
            
            if (i < 4) {
                moves.push({
                    moveNumber: i * 2 + 2,
                    byParticipantIndex: 1,
                    row: 6, col: 5 + i,
                    coordinate: `G${6 + i}`,
                    placedAt: new Date(Date.now() - (9 - i * 2) * 60000)
                });
            }
        }
        return moves;
    };

    const matchData = {
        sessionNumber: `GS-DEMO-${ulid()}`,
        gameType: 'ONLINE_MATCH',
        boardSize: 15,
        boardStyle: 'CLASSIC',
        markerStyle: 'GLOW',
        participants: [
            { 
                userId: player1._id, 
                usernameSnapshot: player1.username, 
                avatarSnapshot: player1.avatar ?? null, 
                isPremiumSnapshot: computeIsPremium(player1), 
                role: 'HUMAN', 
                mark: 'X' 
            },
            { 
                userId: player2._id, 
                usernameSnapshot: player2.username, 
                avatarSnapshot: player2.avatar ?? null, 
                isPremiumSnapshot: computeIsPremium(player2), 
                role: 'HUMAN', 
                mark: 'O' 
            }
        ],
        firstTurnParticipantIndex: 0,
        winnerParticipantIndex: 0, 
        status: 'FINISHED',
        endedReason: 'WIN',
        winningLine: [
            { row: 5, col: 5, coordinate: 'F6' },
            { row: 5, col: 6, coordinate: 'F7' },
            { row: 5, col: 7, coordinate: 'F8' },
            { row: 5, col: 8, coordinate: 'F9' },
            { row: 5, col: 9, coordinate: 'F10' }
        ],
        moves: generateMoves(),
        totalMoves: 9,
        startedAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        endedAt: new Date(),
        durationMs: 15 * 60000
    };

    const match = new GameSession(matchData);
    await match.save();

    console.log(`1 Online Match seeded (Winner: ${player1.username})`);
};