import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

// Nhập 3 Store chứa dữ liệu (Lưu ý: Bạn tự chỉnh lại đường dẫn import cho đúng thư mục dự án nhé)
import { useAuthStore } from '@/stores/AuthStore';
import { useModeStore } from '@/stores/ModeStore'; 
import { useCustomizationStore } from '@/stores/CustomizationStore'; 
import { useGame } from './hook/useGame.hook';
import Navigation from '@/components/reusable/Navigation';
import Footer from '@/components/reusable/Footer';
import ScanLines from '@/components/reusable/ScanLines';
import PlayerPanel from './sub-components/PlayerPanel';
import BoardArea from './sub-components/BoardArea';
import WinOverlay from './sub-components/WinOverlay';

const GameBoard = () => {
    const navigate = useNavigate();
    
    // 1. RÚT DỮ LIỆU TỪ ZUSTAND STORES
    const { user } = useAuthStore(); 
    const { gameMode, aiDifficulty } = useModeStore();
    const { boardSize: displaySize, markerVariant, setMarkerVariant } = useCustomizationStore();

    // 2. PHIÊN DỊCH DỮ LIỆU (Frontend -> Backend/Hook format)
    // Biến chuỗi "10x10" hoặc "15x15" từ store thành số nguyên 10 hoặc 15
    const initialBoardSize = useMemo(() => {
        return parseInt(displaySize.split('x')[0], 10) || 10;
    }, [displaySize]);

    // Map số markerVariant (1, 2, 3...) thành chuỗi (default, custom_1...) để component BoardArea hiểu
    const activeMarkerStyle = markerVariant === 1 ? 'default' : `custom_${markerVariant}`;

    // 3. THIẾT LẬP TIÊU ĐỀ & TÊN NGƯỜI CHƠI
    // Lưu ý: Đổi điều kiện gameMode thành 'SINGLE_PLAYER' để khớp với biến chuẩn của Store/Backend
    const matchTitle = gameMode === 'SINGLE_PLAYER' ? `VS AI — ${aiDifficulty}` : gameMode === 'ONLINE_MATCH' ? 'RANKED MATCH' : 'LOCAL MULTIPLAYER';
    const isBotMatch = gameMode === 'SINGLE_PLAYER';
    const p2Name = isBotMatch ? 'NEXUS-9' : gameMode === 'ONLINE_MATCH' ? 'OPPONENT' : 'PLAYER_02';

    // 4. XÂY DỰNG PLAYERS INFO CHO BACKEND
    const playersInfo = useMemo(() => {
        const player1 = {
            userId: user?._id || user?.id || null, 
            usernameSnapshot: user?.username || user?.name || 'PLAYER_01', 
            role: 'HUMAN',
            mark: 'X'
        };

        let player2 = {
            userId: null,
            usernameSnapshot: p2Name,
            role: 'HUMAN',
            mark: 'O'
        };

        if (isBotMatch) {
            player2.role = 'AI';
            player2.aiDifficulty = aiDifficulty; 
        }

        return [player1, player2];
    }, [user, gameMode, isBotMatch, p2Name, aiDifficulty]);

    // 5. GỌI HOOK GAME
    // Truyền thêm initialBoardSize vào vị trí thứ 3
    const {
        board,
        boardSize, // Lấy boardSize hiện tại từ Hook (vì hook có cơ chế khóa đổi size khi đang chơi)
        currentPlayer,
        winnerData,
        isDraw,
        isLocked, 
        handleMove,
        resetGame,
        setBoardSize, // Hàm đổi size an toàn của Hook
    } = useGame(gameMode, playersInfo, initialBoardSize);

    const gameOver = !!winnerData || isDraw;

    // 6. XỬ LÝ SỰ KIỆN TỪ DROPDOWN TRONG BOARD AREA
    const handleMarkerChange = (val) => {
        // Dịch ngược từ 'default' hoặc 'custom_1' về số nguyên để lưu lại vào Store
        const newVariant = val === 'default' ? 1 : parseInt(val.replace('custom_', ''), 10);
        setMarkerVariant(newVariant || 1);
    };

    return (
        <div className="flex flex-col bg-deep-bg text-[#e3e0f4] overflow-hidden h-screen w-screen relative">
            <ScanLines />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Mono:wght@400;700&display=swap');
                .font-headline { font-family: 'Press Start 2P', cursive; }
                .scanlines { background: linear-gradient(to bottom, rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%); background-size: 100% 2px; pointer-events: none; }
                .pixel-grid { background-image: radial-gradient(rgba(76,201,240,0.05) 1px, transparent 0); background-size: 4px 4px; pointer-events: none; }
                .glow-cyan { box-shadow: 0 0 10px #4cc9f0; }
                .glow-amber { box-shadow: 0 0 15px #fad100; }
                .text-glow-amber { text-shadow: 0 0 12px #fad100; }
                .chunky-offset { box-shadow: 2px 2px 0px 0px #005266; }
            `}</style>

            <div className="fixed inset-0 scanlines z-100" />
            <div className="fixed inset-0 pixel-grid z-99" />

            <Navigation />

            <main className="mx-auto w-fit pt-16 flex-1 overflow-hidden flex px-6 gap-6 items-center justify-center font-mono">
                <PlayerPanel 
                    role="X" 
                    playerName={playersInfo[0].usernameSnapshot} 
                    isBot={false} 
                    isActive={currentPlayer === 'X' && !gameOver} 
                />

                <BoardArea
                    board={board}
                    boardSize={boardSize} // Truyền boardSize từ Hook
                    matchTitle={matchTitle}
                    markerStyle={activeMarkerStyle} // Truyền markerStyle đã được phiên dịch
                    winnerData={winnerData}
                    isDraw={isDraw}
                    isLocked={isLocked}
                    onCellClick={handleMove}
                    onReset={resetGame}
                    onSizeChange={setBoardSize} // Vẫn xài hàm đổi size của Hook để đảm bảo an toàn trận đấu
                    onMarkerChange={handleMarkerChange} // Xài hàm custom gọi lên Store
                />

                <PlayerPanel 
                    role="O" 
                    playerName={playersInfo[1].usernameSnapshot} 
                    isBot={isBotMatch} 
                    isActive={currentPlayer === 'O' && !gameOver} 
                    difficulty={isBotMatch ? aiDifficulty : undefined} 
                />
            </main>

            {gameOver && (
                <WinOverlay winnerData={winnerData} isDraw={isDraw} onRestart={resetGame} onBackToLobby={() => navigate('/lobby')} />
            )}

            <Footer />
        </div>
    );
};

export default GameBoard;