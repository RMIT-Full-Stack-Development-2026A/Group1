// Route: /customize
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useCustomizationStore } from "@/stores/game/CustomizationStore";
import { useModeStore } from "@/stores/ai/ModeStore";
import { useSocketStore } from '@/stores/socket/SocketStore';
import { useGameCustomization } from "./hook/useGameCustomization.hook";
import { createGameRoom } from "./service/customization.service";
import {
    BoardSizeSelector,
    GridStyleSelector,
    MarkerVariantSelector,
    FirstPlayerSelector,
    DifficultySelector,
    Player2NameInput,
    ActionButtons,
} from "./sub-components";

export default function GameCustomization() {
    const navigate = useNavigate();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const { setCustomization } = useCustomizationStore();
    const { gameMode, player2Name, startingPlayer, setAiDifficulty, setPlayer2Name, setStartingPlayer } = useModeStore();
    const { connectSocket } = useSocketStore();
    const isOnlineMatch = gameMode === 'ONLINE_MATCH';
    const {
        selectedBoardSize,
        setSelectedBoardSize,
        selectedStyle,
        setSelectedStyle,
        selectedMarker,
        setSelectedMarker,
        selectedDifficulty,
        setSelectedDifficulty,
        loading,
        setLoading,
    } = useGameCustomization();

    // Per-player marker selections for local and AI matches
    const [selectedMarkerP1, setSelectedMarkerP1] = React.useState(selectedMarker);
    const [selectedMarkerP2, setSelectedMarkerP2] = React.useState(selectedMarker);

    // Redirect to landing page if not logged in
    useEffect(() => {
        if (!isCheckingAuth && !isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    useEffect(() => {
        if (isOnlineMatch) {
            connectSocket();
        }
    }, [isOnlineMatch, connectSocket]);

    const handleCreateRoom = async () => {
        setLoading(true);
        try {
            // Save customization to global store (accessible from GameBoard)
            // For online matches, keep previous behavior (host marker irrelevant)
            if (isOnlineMatch) {
                setCustomization(selectedBoardSize, selectedStyle, 3);
            } else {
                // For local or single-player, store per-player marker choices
                setCustomization(selectedBoardSize, selectedStyle, { x: selectedMarkerP1, o: selectedMarkerP2 });
            }
            setStartingPlayer(startingPlayer);

            // Prepare room data payload
            const roomPayload = {
                boardSize: selectedBoardSize,
                gridStyle: selectedStyle,
            };

            if (!isOnlineMatch) {
                // Attach per-player marker variants for local/AI modes
                roomPayload.markerVariantX = selectedMarkerP1;
                roomPayload.markerVariantO = selectedMarkerP2;
            }
            

            // Add AI difficulty for single player mode
            if (gameMode === 'SINGLE_PLAYER') {
                roomPayload.aiDifficulty = selectedDifficulty;
                roomPayload.opponentType = 'AI';
                setAiDifficulty(selectedDifficulty);
            }

            const roomData = await createGameRoom(roomPayload, isOnlineMatch);

            // Navigate to game board with room ID (online matches use different route)
            if (isOnlineMatch) {
                navigate(`/room/online/${roomData.roomId}`, { state: { initialRoomData: roomData } });
            } else {
                navigate(`/game/${roomData.roomId}`, { state: { room: roomData } });
            }
        } catch (error) {
            console.error("Failed to create room:", error);
            alert(`Failed to create room: ${error.message}`);
            setLoading(false);

        }
    };

    const handleCancel = () => {
        // For local modes (SINGLE_PLAYER and TWO_PLAYERS), go back to game mode select
        // For online mode, go back to lobby
        navigate(gameMode === 'ONLINE_MATCH' ? '/lobby' : '/play');
    };

    if (isCheckingAuth) {
        return (
            <div className="bg-deep-bg text-[#e3e0f4] min-h-screen flex items-center justify-center">
                <div className="font-mono text-primary-cyan">Checking authentication...</div>
            </div>
        );
    }

    return (
        <div className="bg-deep-bg text-[#e3e0f4] font-body min-h-screen flex flex-col overflow-x-hidden">
            {/* Background Grid Pattern */}
            <div
                className="fixed inset-0 opacity-10 pointer-events-none z-0"
                style={{
                    backgroundImage: "radial-gradient(circle, #3d484d 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            ></div>

            {/* Scanline effect */}
            <div
                className="fixed inset-0 opacity-20 pointer-events-none z-0"
                style={{
                    background: "linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)",
                    backgroundSize: "100% 4px",
                }}
            ></div>

            {/* Main Content */}
            <main className="grow pt-15 pb-20 px-6 flex flex-col items-center justify-start overflow-y-auto relative z-10">
                <div className="max-w-4xl w-full space-y-12">
                    {/* Header Section */}
                    <div className="text-center space-y-2">
                        <h1 className="font-headline text-3xl md:text-4xl text-primary-cyan drop-shadow-[0_0_12px_rgba(76,201,240,0.6)]">
                            ROOM SETUP
                        </h1>
                        <div className="h-1 w-24 bg-primary-cyan mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                        {/* Section 1: Board Size */}
                        <BoardSizeSelector
                            selectedSize={selectedBoardSize}
                            onSelect={setSelectedBoardSize}
                        />

                        {/* Section 2: Grid Style */}
                        <GridStyleSelector
                            selectedStyle={selectedStyle}
                            onSelect={setSelectedStyle}
                        />

                        {/* Section 3: Marker Variant */}
                        {!isOnlineMatch && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-[#879398] mb-2 uppercase font-mono">Player 1 Marker</p>
                                    <MarkerVariantSelector
                                        selectedMarker={selectedMarkerP1}
                                        onSelect={(v) => { setSelectedMarkerP1(v); }}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-[#879398] mb-2 uppercase font-mono">{gameMode === 'SINGLE_PLAYER' ? 'AI Marker' : 'Player 2 Marker'}</p>
                                    <MarkerVariantSelector
                                        selectedMarker={selectedMarkerP2}
                                        onSelect={(v) => { setSelectedMarkerP2(v); }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Section 4: First Player (Only for Local and Single Player) */}
                        {gameMode !== 'ONLINE_MATCH' && (
                            <FirstPlayerSelector
                                gameMode={gameMode}
                                selectedPlayer={startingPlayer}
                                onSelect={setStartingPlayer}
                            />
                        )}

                        {/* Section 5: AI Difficulty (Only for Single Player) */}
                        {gameMode === 'SINGLE_PLAYER' && (
                            <DifficultySelector
                                selectedDifficulty={selectedDifficulty}
                                onSelect={setSelectedDifficulty}
                            />
                        )}

                        {/* Section 5: Player 2 Name (Only for Local Two Players) */}
                        {gameMode === 'TWO_PLAYERS' && (
                            <Player2NameInput
                                value={player2Name}
                                onChange={setPlayer2Name}
                            />
                        )}

                        {/* Action Buttons */}
                        <ActionButtons
                            onCreateRoom={handleCreateRoom}
                            onCancel={handleCancel}
                            isLoading={loading}
                            gameMode={gameMode}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}