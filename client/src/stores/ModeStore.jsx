import { create } from "zustand";

export const useModeStore = create((set) => ({
    // State
    gameMode: "SINGLE_PLAYER", // "SINGLE_PLAYER", "TWO_PLAYERS", "ONLINE_MATCH"
    aiDifficulty: "MEDIUM",    // "EASY", "MEDIUM", "HARD"

    // Actions
    setGameMode: (mode) => set({ gameMode: mode }),
    setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
    
    // Reset
    resetMode: () => set({ gameMode: "TWO_PLAYERS", aiDifficulty: "EASY" })
}));