// Route: /play/customize
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore";
import { useCustomizationStore } from "@/stores/CustomizationStore";
import { useGameCustomization } from "./hook/useGameCustomization.hook";
import { createGameRoom } from "./service/customization.service";
import {
    BoardSizeSelector,
    GridStyleSelector,
    MarkerVariantSelector,
    ActionButtons,
} from "./sub-components";

export default function GameCustomization() {
    const navigate = useNavigate();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const { setCustomization } = useCustomizationStore();
    const {
        selectedBoardSize,
        setSelectedBoardSize,
        selectedStyle,
        setSelectedStyle,
        selectedMarker,
        setSelectedMarker,
        loading,
        setLoading,
    } = useGameCustomization();

    // Redirect to landing page if not logged in
    useEffect(() => {
        if (!isCheckingAuth && !isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    const handleCreateRoom = async () => {
        setLoading(true);
        try {
            // Save customization to global store (accessible from GameBoard)
            setCustomization(selectedBoardSize, selectedStyle, selectedMarker);

            const roomData = await createGameRoom({
                boardSize: selectedBoardSize,
                gridStyle: selectedStyle,
                markerVariant: selectedMarker,
            });

            // Navigate to game board with room ID
            navigate(`/game/${roomData.roomId}`, { state: { room: roomData } });
        } catch (error) {
            console.error("Failed to create room:", error);
            setLoading(false);
            // TODO: Show error message to user
        }
    };

    const handleCancel = () => {
        navigate("/lobby");
    };

    if (isCheckingAuth) {
        return (
            <div className="bg-[#0d0d1a] text-[#e3e0f4] min-h-screen flex items-center justify-center">
                <div className="font-mono text-[#4cc9f0]">Checking authentication...</div>
            </div>
        );
    }

    return (
        <div className="bg-[#0d0d1a] text-[#e3e0f4] font-body min-h-screen flex flex-col overflow-x-hidden">
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
            <main className="flex-grow pt-15 pb-20 px-6 flex flex-col items-center justify-start overflow-y-auto relative z-10">
                <div className="max-w-4xl w-full space-y-12">
                    {/* Header Section */}
                    <div className="text-center space-y-2">
                        <h1 className="font-headline text-3xl md:text-4xl text-[#4cc9f0] drop-shadow-[0_0_12px_rgba(76,201,240,0.6)]">
                            ROOM SETUP
                        </h1>
                        <div className="h-1 w-24 bg-[#4cc9f0] mx-auto"></div>
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
                        <MarkerVariantSelector
                            selectedMarker={selectedMarker}
                            onSelect={setSelectedMarker}
                        />

                        {/* Action Buttons */}
                        <ActionButtons
                            onCreateRoom={handleCreateRoom}
                            onCancel={handleCancel}
                            isLoading={loading}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}