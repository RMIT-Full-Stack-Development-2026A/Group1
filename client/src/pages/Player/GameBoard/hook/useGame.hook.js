import { useState, useCallback, useEffect } from 'react';
import { checkWin, checkDraw } from './gameLogic';
import { gameService } from '../service/game.service';

// Helper: Init 2D array
const initBoard = (size) => Array(size).fill(null).map(() => Array(size).fill(null));

// Helper: convert coordinate (e.g., (0,0) -> A1)
const toAlgebraic = (r, c) => `${String.fromCharCode(65 + c)}${r + 1}`;

// Hook gets playersInfo array and initialBoardSize from the UI layer
export const useGame = (gameMode = 'TWO_PLAYERS', playersInfo = [], initialBoardSize = 10) => {

    // Initialize with the dynamic size provided by CustomizationStore
    const [boardSize, setBoardSizeState] = useState(initialBoardSize);
    const [isLocked, setIsLocked] = useState(false);
    
    // Lazy initialization for board performance using initialBoardSize
    const [board, setBoard] = useState(() => initBoard(initialBoardSize));
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [winnerData, setWinnerData] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [moveHistory, setMoveHistory] = useState([]);
    
    // Removed markerStyle state since CustomizationStore handles UI logic now

    // Tracking turns and time for Backend Payload
    const [participantIndex, setParticipantIndex] = useState(0);
    const [firstTurnIndex, setFirstTurnIndex] = useState(0); // Track who goes first (default 0)
    const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

    // Only allow changing board size when no active game
    const setBoardSize = useCallback((size) => {
        const activeGame = moveHistory.length > 0 && !winnerData && !isDraw;
        if (activeGame) return; // Lock changing size when game is playing
        
        setBoardSizeState(size);
        setBoard(initBoard(size));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
        setMoveHistory([]);
        setParticipantIndex(firstTurnIndex);
        setStartedAt(new Date().toISOString()); // Reset start time
    }, [moveHistory.length, winnerData, isDraw, firstTurnIndex]); 

    // Handle move upgraded with exact BE Schema
    const handleMove = useCallback(async (row, col) => {
        // Ignore click if cell is occupied or game is already over
        if (isLocked || board[row][col] !== null || winnerData || isDraw) return;

        // Copy board state to trigger re-render
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        const timestamp = new Date().toISOString();
        
        // 1. Format new move matching BE payload
        const newMove = {
            moveNumber: moveHistory.length + 1,
            byParticipantIndex: participantIndex,
            row: row,
            col: col,
            coordinate: toAlgebraic(row, col)
        };
        
        const updatedHistory = [...moveHistory, newMove];
        setMoveHistory(updatedHistory);

        // Check win
        const winningCells = checkWin(newBoard, row, col, currentPlayer);
        
        if (winningCells) {
            setWinnerData({ player: currentPlayer, cells: winningCells });
            
            // 2. Format winning line matching BE payload
            const formattedWinningLine = winningCells.map(([r, c]) => ({
                row: r,
                col: c,
                coordinate: toAlgebraic(r, c)
            }));

            // Call API to save match result
            try {
                await gameService.saveGameResult({
                    gameType: gameMode,
                    status: "FINISHED",
                    boardSize: boardSize,
                    firstTurnParticipantIndex: firstTurnIndex,
                    winnerParticipantIndex: participantIndex, // The one who just moved is the winner
                    startedAt: startedAt,
                    endedAt: timestamp,
                    participants: playersInfo, 
                    winningLine: formattedWinningLine,
                    moves: updatedHistory
                });
            } catch (error) {
                console.error("Save match result failed, but UI can proceed:", error);
            }
            return;
        }

        // Check draw
        if (checkDraw(newBoard)) {
            setIsDraw(true);
            try {
                await gameService.saveGameResult({ 
                    gameType: gameMode,
                    status: "DRAW",
                    boardSize: boardSize,
                    firstTurnParticipantIndex: firstTurnIndex,
                    winnerParticipantIndex: null, // No winner in draw
                    startedAt: startedAt,
                    endedAt: timestamp,
                    participants: playersInfo,
                    winningLine: [],
                    moves: updatedHistory
                });
            } catch (error) {
                console.error("Save match result failed:", error);
            }
            return;
        }

        // Switch player
        setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
        setParticipantIndex(1 - participantIndex);
    }, [board, currentPlayer, winnerData, isDraw, moveHistory, isLocked, gameMode, boardSize, participantIndex, firstTurnIndex, startedAt, playersInfo]);

    // Handle AI move or wait for opponent move in online mode
    useEffect(() => {
        if (winnerData || isDraw) return; 

        const processAutoMove = async () => {
            // SINGLE_PLAYER bot logic
            if (gameMode === 'SINGLE_PLAYER' && currentPlayer === 'O') {
                setIsLocked(true); 
                
                // TODO for Minz: Add AI Logic here
                
                setIsLocked(false); 
            }
            // ONLINE_MATCH logic
            else if (gameMode === 'ONLINE_MATCH' && currentPlayer === 'O') {
                setIsLocked(true); 
                // Listen to socket.io here
            }
            // Local match - no lock needed
            else {
                setIsLocked(false);
            }
        };

        processAutoMove();
    }, [currentPlayer, gameMode, winnerData, isDraw]);

    const resetGame = useCallback(() => {
        setBoard(initBoard(boardSize));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
        setMoveHistory([]);
        setParticipantIndex(firstTurnIndex);
        setStartedAt(new Date().toISOString()); // Reset start time for the new match
    }, [boardSize, firstTurnIndex]);

    return {
        board,
        boardSize,
        currentPlayer,
        winnerData,
        isDraw,
        isLocked,
        handleMove,
        resetGame,
        setBoardSize,
        // Removed setMarkerStyle from return
    };
};