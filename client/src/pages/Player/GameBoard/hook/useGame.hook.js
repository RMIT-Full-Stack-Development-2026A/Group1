import { useState, useCallback, useEffect } from 'react';
import { checkWin, checkDraw } from './gameLogic';
import { gameService } from '../service/game.service';
import { getBestAIMove } from '../../../../utils/ai';
import { useModeStore } from '../../../../stores/ModeStore';
import { transformToBackendFormat } from '../../GameCustomization/service/customization.service';
import { useCustomizationStore } from '../../../../stores/CustomizationStore'; // Import the store to access current customization settings
import { notifySuccess } from '@/utils/toast.util';

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
    const [isAborting, setIsAborting] = useState(false);
    const [moveHistory, setMoveHistory] = useState([]);

    // Tracking turns and time for Backend Payload
    const [participantIndex, setParticipantIndex] = useState(0);
    const [firstTurnIndex, setFirstTurnIndex] = useState(0); // Track who goes first (default 0)
    const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

    const { aiDifficulty } = useModeStore();

    // ==========================================
    // DEBUG STATION 1: Check inputs on every render
    // ==========================================
    console.log("--- [DEBUG: Hook Render] ---");
    console.log("1. Game Mode:", gameMode);
    console.log("2. AI Difficulty:", aiDifficulty);
    console.log("3. Player 1 Info:", playersInfo[0]);
    console.log("4. Player 2 Info:", playersInfo[1]);
    console.log("5. Current Player Turn:", currentPlayer);
    console.log("----------------------------");

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
        if (isLocked || board[row][col] !== null || winnerData || isDraw) {
            return;
        }

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        const timestamp = new Date().toISOString();

        const newMove = {
            moveNumber: moveHistory.length + 1,
            byParticipantIndex: participantIndex,
            row: row,
            col: col,
            coordinate: toAlgebraic(row, col)
        };

        const updatedHistory = [...moveHistory, newMove];
        setMoveHistory(updatedHistory);

        // Kiểm tra thắng/hòa để gửi kết quả
        const winningCells = checkWin(newBoard, row, col, currentPlayer);
        const drawDetected = !winningCells && checkDraw(newBoard);

        if (winningCells || drawDetected) {
            if (winningCells) setWinnerData({ player: currentPlayer, cells: winningCells });
            if (drawDetected) setIsDraw(true);

            // LOGIC FIX: Lấy state hiện tại từ CustomizationStore và transform sang định dạng Backend
            const customization = useCustomizationStore.getState();
            const { boardStyle, markerStyle } = transformToBackendFormat(customization);

            const payload = {
                gameType: gameMode,
                status: winningCells ? "FINISHED" : "DRAW",
                boardSize: boardSize,
                // Thêm 2 trường này để lưu đúng giao diện đã chọn
                boardStyle: boardStyle,
                markerStyle: markerStyle,
                firstTurnParticipantIndex: firstTurnIndex,
                winnerParticipantIndex: winningCells ? participantIndex : null,
                startedAt: startedAt,
                endedAt: timestamp,
                participants: playersInfo,
                winningLine: winningCells ? winningCells.map(([r, c]) => ({
                    row: r, col: c, coordinate: toAlgebraic(r, c)
                })) : [],
                moves: updatedHistory
            };

            try {
                await gameService.saveGameResult(payload, { silent: true });
                notifySuccess('Match saved.');
            } catch (error) {
                console.error("Save match result failed:", error);
            }
            return;
        }

        setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
        setParticipantIndex(1 - participantIndex);
    }, [board, currentPlayer, winnerData, isDraw, moveHistory, isLocked, gameMode, boardSize, participantIndex, firstTurnIndex, startedAt, playersInfo]);

    // Handle AI move or wait for opponent move in online mode
    useEffect(() => {

        if (winnerData || isDraw) return;

        const processAutoMove = async () => {
            // SINGLE_PLAYER bot logic
            if (gameMode === 'SINGLE_PLAYER' && currentPlayer === 'O') {
                console.log("[DEBUG] Bot is waking up! Triggering AI calculation...");

                setIsLocked(true); // Lock UI while Bot is playing

                // 1. Extract data from global stores and info of AI
                const botPlayer = playersInfo.find(p => p.role === 'AI');
                console.log("[DEBUG] Found Bot Player Info:", botPlayer);

                // 2. Create a small delay to simulate AI thinking like human
                setTimeout(() => {
                    console.log("[DEBUG] Calculating best move for board with difficulty:", aiDifficulty);

                    // 3. Call getBestAIMove to take the coordinate that AI will go
                    const [bestRow, bestCol] = getBestAIMove(board, aiDifficulty, 'O');
                    console.log(`[DEBUG] Bot calculated move: [${bestRow}, ${bestCol}]`);

                    // 4. Let bot play
                    handleMove(bestRow, bestCol);

                    // 5. Unlock UI
                    setIsLocked(false);
                }, 1300); // 1300ms delay
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

    }, [currentPlayer, gameMode, winnerData, isDraw, board, handleMove, aiDifficulty, playersInfo]);

    const resetGame = useCallback(() => {
        setBoard(initBoard(boardSize));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
        setMoveHistory([]);
        setParticipantIndex(firstTurnIndex);
        setStartedAt(new Date().toISOString()); // Reset start time for the new match
    }, [boardSize, firstTurnIndex]);

    // unction to handle aborting the game and saving progress
    const abortGame = useCallback(async () => {
        setIsAborting(true);
        try {
            const customization = useCustomizationStore.getState();
            const { boardStyle, markerStyle } = transformToBackendFormat(customization);
            const timestamp = new Date().toISOString();

            const payload = {
                gameType: gameMode,
                status: 'ABORTED',
                boardSize,
                boardStyle,
                markerStyle,
                firstTurnParticipantIndex: firstTurnIndex,
                winnerParticipantIndex: null,
                startedAt,
                endedAt: timestamp,
                participants: playersInfo,
                winningLine: [],
                moves: moveHistory,
            };

            await gameService.saveGameResult(payload, { silent: true });
            notifySuccess('Match saved.');
        } catch (err) {
            console.error('Abort save failed:', err);
        } finally {
            setIsAborting(false);
        }
    }, [gameMode, boardSize, firstTurnIndex, startedAt, playersInfo, moveHistory]);

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
        abortGame,
        isAborting, // <-- thêm 2 cái này
    };
};