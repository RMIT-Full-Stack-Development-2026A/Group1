import { useState } from 'react';
import { checkWin, checkDraw } from './gameLogic';
import { gameService } from './game.service';

export const useGame = (boardSize = 10) => {
    // 1. Core State
    const [board, setBoard] = useState(Array(boardSize).fill(Array(boardSize).fill(null)));
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [winnerData, setWinnerData] = useState(null); // { player: 'X', cells: [[r,c]...] }
    const [isDraw, setIsDraw] = useState(false);

    // 2. The single function UI teammates need to call
    const handleMove = async (row, col) => {
        // Stop if cell is already taken, or if the game is already over
        if (board[row][col] !== null || winnerData || isDraw) return;

        // Clone the board to avoid mutating state directly
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        // Check Win
        const winningCells = checkWin(newBoard, row, col, currentPlayer);
        
        if (winningCells) {
            // WE HAVE A WINNER
            setWinnerData({ player: currentPlayer, cells: winningCells });
            
            // Call API to save result asynchronously
            await gameService.saveGameResult({
                winner: currentPlayer,
                boardState: newBoard,
                status: 'completed'
            });
            return;
        }

        // Check Draw
        if (checkDraw(newBoard)) {
            setIsDraw(true);
            await gameService.saveGameResult({
                winner: null,
                boardState: newBoard,
                status: 'draw'
            });
            return;
        }

        // Switch turn if no win and no draw
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    };

    const resetGame = () => {
        setBoard(Array(boardSize).fill(Array(boardSize).fill(null)));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
    };

    // 3. Expose exactly what the UI needs
    return {
        board,
        currentPlayer,
        winnerData,
        isDraw,
        handleMove,
        resetGame
    };
};