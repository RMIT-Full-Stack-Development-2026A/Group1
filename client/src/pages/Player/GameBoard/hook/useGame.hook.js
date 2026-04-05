import { useState, useCallback, useEffect} from 'react';
import { checkWin, checkDraw } from './gameLogic';
import { gameService } from '../service/game.service';

const DEFAULT_SIZE = 10;

// Helper: Khởi tạo mảng 2 chiều độc lập (Fix lỗi Array Reference)
const initBoard = (size) => Array(size).fill(null).map(() => Array(size).fill(null));

// Helper: Chuyển đổi tọa độ (VD: 0,0 -> A1)
const toAlgebraic = (r, c) => `${String.fromCharCode(65 + c)}${r + 1}`;

export const useGame = (gameMode = 'LOCAL') => {
    const [boardSize, setBoardSizeState]    = useState(DEFAULT_SIZE);
    const [isLocked, setIsLocked]          = useState(false);
    // use lazy intialization for board to avoid unnecessary computation on every render, 
    // this is how it works: 
    // initBoard(DEFAULT_SIZE) is only called once during the initial render, 
    // and its result is used as the initial state for board. 
    // Subsequent renders will not call initBoard again, thus improving performance.
    const [board, setBoard]                 = useState(() => initBoard(DEFAULT_SIZE));
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [winnerData, setWinnerData]       = useState(null);
    const [isDraw, setIsDraw]               = useState(false);
    const [moveHistory, setMoveHistory]     = useState([]);
    const [markerStyle, setMarkerStyle]     = useState('default');

    // only allow changing board size when no active game
    const setBoardSize = useCallback((size) => {
        const activeGame = moveHistory.length > 0 && !winnerData && !isDraw;
        if (activeGame) return; // Khóa chức năng đổi size khi đang chơi dở
        
        setBoardSizeState(size);
        setBoard(initBoard(size));
        setCurrentPlayer('X');
        setWinnerData(null);
        setIsDraw(false);
        setMoveHistory([]);
    }, [moveHistory.length, winnerData, isDraw]); 

    // handlemove upgrade
    const handleMove = useCallback(async (row, col) => {
        // Ignore click if cell is occupied or game is already over
        
        if (isLocked || board[row][col] !== null || winnerData || isDraw) return;

        // copy board state to trigger re-render, also update move history for API call
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        const timestamp = new Date().toISOString();
        const updatedHistory = [
            ...moveHistory,
            { playerName: currentPlayer, coordinate: toAlgebraic(row, col), timestamp },
        ];
        setMoveHistory(updatedHistory);

        // checkwin upgradeed with API call to save result
        const winningCells = checkWin(newBoard, row, col, currentPlayer);
        if (winningCells) {
            setWinnerData({ player: currentPlayer, cells: winningCells });
            // call API to save match result, but don't block UI if it fails
            try {
                await gameService.saveGameResult({
                    result: currentPlayer === 'X' ? 'PLAYER1_WIN' : 'PLAYER2_WIN',
                    endTime: timestamp,
                    moves: updatedHistory,
                });
            } catch (error) {
                console.error("Save match result failed, but UI can proceed:", error);
            }
            return;
        }

        // draw check
        if (checkDraw(newBoard)) {
            setIsDraw(true);
            try {
                await gameService.saveGameResult({ result: 'DRAW', endTime: timestamp, moves: updatedHistory });
            } catch (error) {
                console.error("Save match result failed:", error);
            }
            return;
        }

        // switch player
        setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
    }, [board, currentPlayer, winnerData, isDraw, moveHistory, isLocked]);

    // Handle AI move or wait for opponent move in online mode 
    useEffect(() => {
        if (winnerData || isDraw) return; // Game over thì thôi

        const processAutoMove = async () => {
            // NẾU LÀ ĐÁNH VỚI MÁY VÀ ĐẾN LƯỢT MÁY (O)
            if (gameMode === 'AI' && currentPlayer === 'O') {
                setIsLocked(true); // 1. Khóa bàn cờ lại, không cho Player X bấm loạn
                
                // TODO for Minz:
                // 1. Call function handleAIMove(board, boardSize) here
                // 2. Wait for it to return the best move [bestRow, bestCol]
                // 3. Update the board accordingly, similar to handleMove
                
                // for example
                // await new Promise(resolve => setTimeout(resolve, 1000));
                
                setIsLocked(false); // AI finish, unlock for Player X
            }
            
            // NẾU LÀ ĐÁNH ONLINE VÀ ĐẾN LƯỢT ĐỐI THỦ (O)
            else if (gameMode === 'ONLINE' && currentPlayer === 'O') {
                setIsLocked(true); // Khóa bàn cờ chờ dữ liệu từ Socket.io
                // TODO for Minz: Lắng nghe socket.on('opponent_move') ở đây
            }
            
            // NẾU ĐÁNH LOCAL THÌ KHÔNG KHÓA GÌ CẢ
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