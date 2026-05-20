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
    // Per-player marker variants (frontend numeric IDs 1-6)
    markerVariantX: 3,
    markerVariantO: 3,
    // Legacy single-value for compatibility
    markerVariant: 3,

    // Actions
    setBoardSize: (size) => set({ boardSize: size }),
    setGridStyle: (style) => set({ gridStyle: style }),
    setMarkerVariant: (variant) => set({ markerVariant: Number(variant), markerVariantX: Number(variant), markerVariantO: Number(variant) }),
    setMarkerVariantX: (variant) => set({ markerVariantX: Number(variant), markerVariant: Number(variant) }),
    setMarkerVariantO: (variant) => set({ markerVariantO: Number(variant) }),

    /**
     * Set all customization options at once (display format)
     */
    /**
     * Set all customization options at once (display format)
     * markerVariant can be:
     * - a single number => sets both players to the same variant
     * - an object { x: number, o: number } => sets per-player variants
     */
    setCustomization: (boardSize, gridStyle, markerVariant) =>
        set((state) => {
            let mx = state.markerVariantX;
            let mo = state.markerVariantO;
            let legacy = state.markerVariant;

            if (typeof markerVariant === 'number') {
                mx = mo = Number(markerVariant);
                legacy = Number(markerVariant);
            } else if (markerVariant && typeof markerVariant === 'object') {
                if (markerVariant.x != null) mx = Number(markerVariant.x);
                if (markerVariant.o != null) mo = Number(markerVariant.o);
                legacy = mx;
            }

            return { boardSize, gridStyle, markerVariantX: mx, markerVariantO: mo, markerVariant: legacy };
        }),

    /**
     * Reset to defaults (display format)
     */
    resetCustomization: () =>
        set({
            boardSize: "10x10",
            gridStyle: "classic",
            markerVariantX: 3,
            markerVariantO: 3,
            markerVariant: 3,
        }),
}));
