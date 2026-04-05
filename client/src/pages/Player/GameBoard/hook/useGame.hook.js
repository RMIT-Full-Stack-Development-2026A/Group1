import { useState, useCallback } from 'react';
import { checkWin, checkDraw } from './gameLogic';
import { gameService } from '../service/game.service';

const DEFAULT_SIZE = 10;

const initBoard = (size) => Array(size).fill(null).map(() => Array(size).fill(null));

const toAlgebraic = (r, c) => `${String.fromCharCode(65 + c)}${r + 1}`;

export const useGame = () => {
    const [boardSize,    setBoardSizeState] = useState(DEFAULT_SIZE);
    const [board,        setBoard]          = useState(() => initBoard(DEFAULT_SIZE));
    const [currentPlayer,setCurrentPlayer] = useState('X');
    const [winnerData,   setWinnerData]    = useState(null);
    const [isDraw,       setIsDraw]        = useState(false);
    const [moveHistory,  setMoveHistory]   = useState([]);
    const [markerStyle,  setMarkerStyle]   = useState('default');

    // ─── Change board size (only allowed before game starts or after game ends) ───
    const setBoardSize = useCallback((size) => {
        const active = moveHistory.length > 0 && !winnerData && !isDraw;
        if (active) return; // locked during live game
        setBoardSizeState(size);
        setBoard(initBoard(size));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
        setMoveHistory([]);
    }, [moveHistory, winnerData, isDraw]);

    // ─── Main move handler ───
    const handleMove = useCallback(async (row, col) => {
        if (board[row][col] !== null || winnerData || isDraw) return;

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        const timestamp = new Date().toISOString();
        const updatedHistory = [
            ...moveHistory,
            { playerName: currentPlayer, coordinate: toAlgebraic(row, col), timestamp },
        ];
        setMoveHistory(updatedHistory);

        const winningCells = checkWin(newBoard, row, col, currentPlayer);
        if (winningCells) {
            setWinnerData({ player: currentPlayer, cells: winningCells });
            await gameService.saveGameResult({
                result:  currentPlayer === 'X' ? 'PLAYER1_WIN' : 'PLAYER2_WIN',
                endTime: timestamp,
                moves:   updatedHistory,
            });
            return;
        }

        if (checkDraw(newBoard)) {
            setIsDraw(true);
            await gameService.saveGameResult({ result: 'DRAW', endTime: timestamp, moves: updatedHistory });
            return;
        }

        setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
    }, [board, currentPlayer, winnerData, isDraw, moveHistory]);

    // ─── Reset ───
    const resetGame = useCallback(() => {
        setBoard(initBoard(boardSize));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
        setMoveHistory([]);
    }, [boardSize]);

    return {
        board,
        boardSize,
        currentPlayer,
        winnerData,
        isDraw,
        markerStyle,
        handleMove,
        resetGame,
        setBoardSize,
        setMarkerStyle,
    };
};