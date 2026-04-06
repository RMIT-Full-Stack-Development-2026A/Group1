import { create } from "zustand";

/**
 * Game Customization Store
 * Stores the current game customization settings (board size, grid style, marker variant)
 * Used across multiple pages: GameCustomization → GameBoard
 */
export const useCustomizationStore = create((set) => ({
    // State
    boardSize: "10x10",
    gridStyle: "neon",
    markerVariant: 3,

    // Actions
    setBoardSize: (size) => set({ boardSize: size }),
    setGridStyle: (style) => set({ gridStyle: style }),
    setMarkerVariant: (variant) => set({ markerVariant: variant }),

    /**
     * Set all customization options at once
     */
    setCustomization: (boardSize, gridStyle, markerVariant) =>
        set({ boardSize, gridStyle, markerVariant }),

    /**
     * Reset to defaults
     */
    resetCustomization: () =>
        set({
            boardSize: "10x10",
            gridStyle: "neon",
            markerVariant: 3,
        }),
}));
