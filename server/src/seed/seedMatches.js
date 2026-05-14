import { GameSession } from '../modules/game/models/gameSession.model.js';
import { ulid } from 'ulid';

export const seedMatches = async (player1, player2) => {
    console.log('Seeding Game Matches & History...');

    // await GameSession.deleteMany({ status: { $in: ['FINISHED', 'DRAW', 'ABORTED'] } });

    // P1 plays F6, F7, F8, F9, F10. P2 plays G6, G7, G8, G9
    const generateMoves = () => {
        const moves = [];
        for (let i = 0; i < 5; i++) {
            // Player 1 (X)
            moves.push({
                moveNumber: i * 2 + 1,
                byParticipantIndex: 0,
                row: 5, col: 5 + i,
                coordinate: `F${6 + i}`, 
                placedAt: new Date(Date.now() - (10 - i * 2) * 60000)
            });
            // Player 2 (O) - Stops at 4 moves since P1 wins
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
            { userId: player1._id, usernameSnapshot: player1.username, role: 'HUMAN', mark: 'X' },
            { userId: player2._id, usernameSnapshot: player2.username, role: 'HUMAN', mark: 'O' }
        ],
        firstTurnParticipantIndex: 0,
        winnerParticipantIndex: 0, // Player 1 wins
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
        startedAt: new Date(Date.now() - 15 * 60000), // 15 mins ago
        endedAt: new Date(),
        durationMs: 15 * 60000
    };

    const match = new GameSession(matchData);
    await match.save();

    console.log(`1 Online Match seeded (Winner: ${player1.username})`);
};