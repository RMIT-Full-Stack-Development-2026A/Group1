import { useState } from "react";

export const useGameCustomization = () => {
    const [selectedBoardSize, setSelectedBoardSize] = useState("10x10");
    const [selectedStyle, setSelectedStyle] = useState("dark");
    const [selectedMarker, setSelectedMarker] = useState(3);
    const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
    const [loading, setLoading] = useState(false);

    const resetCustomization = () => {
        setSelectedBoardSize("10x10");
        setSelectedStyle("dark");
        setSelectedMarker(3);
        setSelectedDifficulty("MEDIUM");    
        setLoading(false);
    };

    return {
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
