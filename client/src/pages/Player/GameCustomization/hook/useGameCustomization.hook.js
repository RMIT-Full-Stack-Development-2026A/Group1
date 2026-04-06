import { useState } from "react";

export const useGameCustomization = () => {
    const [selectedBoardSize, setSelectedBoardSize] = useState("10x10");
    const [selectedStyle, setSelectedStyle] = useState("neon");
    const [selectedMarker, setSelectedMarker] = useState(3);
    const [loading, setLoading] = useState(false);

    const resetCustomization = () => {
        setSelectedBoardSize("10x10");
        setSelectedStyle("neon");
        setSelectedMarker(3);
        setLoading(false);
    };

    return {
        selectedBoardSize,
        setSelectedBoardSize,
        selectedStyle,
        setSelectedStyle,
        selectedMarker,
        setSelectedMarker,
        loading,
        setLoading,
        resetCustomization,
    };
};
