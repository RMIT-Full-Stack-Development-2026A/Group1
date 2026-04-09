import { create } from "zustand";

export const useModeStore = create((set) => ({
    // State
    gameMode: "TWO_PLAYERS", // "SINGLE_PLAYER", "TWO_PLAYERS", "ONLINE_MATCH"
    aiDifficulty: "EASY",    // "EASY", "MEDIUM", "HARD"

    // Actions
    setGameMode: (mode) => set({ gameMode: mode }),
    setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
    
    // Reset
    resetMode: () => set({ gameMode: "TWO_PLAYERS", aiDifficulty: "EASY" })
}));