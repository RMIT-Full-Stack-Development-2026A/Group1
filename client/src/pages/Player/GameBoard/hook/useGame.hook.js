import { useState } from 'react';
import { checkWin, checkDraw } from './gameLogic';
import { gameService } from '../service/game.service';

// Helper function to convert (row, col) to Algebraic notation (e.g., 0,0 -> "A1")
const toAlgebraic = (r, c) => {
    const colLetter = String.fromCharCode(65 + c); // 65 is ASCII for 'A'
    const rowNumber = r + 1;
    return `${colLetter}${rowNumber}`;
};

export const useGame = (boardSize = 10) => {
    // ===== State Management =====
    const [board, setBoard] = useState(Array(boardSize).fill(Array(boardSize).fill(null)));
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [winnerData, setWinnerData] = useState(null); 
    const [isDraw, setIsDraw] = useState(false);
    // Array to store chronological moves for Replay feature
    const [moveHistory, setMoveHistory] = useState([]); 

    // ===== Main Logic Function =====
    const handleMove = async (row, col) => {
        // Stop if cell is already taken, or if the game is already over
        if (board[row][col] !== null || winnerData || isDraw) return;

        // Clone the board to avoid mutating state directly
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        // Record the current move
        const currentTimestamp = new Date().toISOString();
        const newMove = {
            playerName: currentPlayer, // 'X' or 'O'
            coordinate: toAlgebraic(row, col), // e.g., "C4"
            timestamp: currentTimestamp
        };
        const updatedHistory = [...moveHistory, newMove];
        setMoveHistory(updatedHistory);

        // Check Win using the 2D array
        const winningCells = checkWin(newBoard, row, col, currentPlayer);
        
        if (winningCells) {
            setWinnerData({ player: currentPlayer, cells: winningCells });
        
            // Assuming 'X' is Player 1 and 'O' is Player 2
            const resultEnum = currentPlayer === 'X' ? 'PLAYER1_WIN' : 'PLAYER2_WIN';

            // Send formatted JSON to BE
            await gameService.saveGameResult({
                result: resultEnum,
                endTime: currentTimestamp,
                moves: updatedHistory
            });
            return;
        }

        // Check Draw
        if (checkDraw(newBoard)) {
            setIsDraw(true);
            
            await gameService.saveGameResult({
                result: 'DRAW',
                endTime: currentTimestamp,
                moves: updatedHistory
            });
            return;
        }

        // Switch turn if no win and no draw
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    };

    // ===== Reset Function =====
    const resetGame = () => {
        setBoard(Array(boardSize).fill(Array(boardSize).fill(null)));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
        setMoveHistory([]); // Clear history on reset
    };

    return {
        board,
        currentPlayer,
        winnerData,
        isDraw,
        handleMove,
        resetGame
    };
};