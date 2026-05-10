import { useState } from "react";
import { useModeStore } from "@/stores/ai/ModeStore";

export const useGameCustomization = () => {
    const { gameMode } = useModeStore();

    const [selectedBoardSize, setSelectedBoardSize] = useState("10x10");
    const [selectedStyle, setSelectedStyle] = useState("neon");
    const [selectedMarker, setSelectedMarker] = useState(3);
    const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
    const [loading, setLoading] = useState(false);

    const resetCustomization = () => {
        setSelectedBoardSize("10x10");
        setSelectedStyle("neon");
        setSelectedMarker(3);
        setSelectedDifficulty("MEDIUM");
        setLoading(false);
    };

    return {
        gameMode,
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
        resetCustomization,
    };
};
