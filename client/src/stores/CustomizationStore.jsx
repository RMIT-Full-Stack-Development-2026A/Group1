import { create } from "zustand";

/**
 * Game Customization Store
 * Stores the current game customization settings using DISPLAY values (frontend format)
 * These are transformed to backend format when creating rooms
 * Used across multiple pages: GameCustomization → GameBoard
 */
export const useCustomizationStore = create((set) => ({
    // State - using display format (frontend)
    boardSize: "10x10",        // Frontend format: "10x10" or "15x15"
    gridStyle: "classic",      // Frontend format: "classic", "neon", or "block"
    markerVariant: 3,          // Frontend format: numeric ID 1-6

    // Actions
    setBoardSize: (size) => set({ boardSize: size }),
    setGridStyle: (style) => set({ gridStyle: style }),
    setMarkerVariant: (variant) => set({ markerVariant: variant }),

    /**
     * Set all customization options at once (display format)
     */
    setCustomization: (boardSize, gridStyle, markerVariant) =>
        set({ boardSize, gridStyle, markerVariant }),

    /**
     * Reset to defaults (display format)
     */
    resetCustomization: () =>
        set({
            boardSize: "10x10",
            gridStyle: "classic",
            markerVariant: 3,
        }),
}));
