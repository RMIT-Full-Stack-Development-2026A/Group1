import { create } from "zustand";

export const useModeStore = create((set) => ({
    // State
    gameMode: "SINGLE_PLAYER", // "SINGLE_PLAYER", "TWO_PLAYERS", "ONLINE_MATCH"
    aiDifficulty: "MEDIUM",    // "EASY", "MEDIUM", "HARD"
    player2Name: "PLAYER_02",

    // Actions
    setGameMode: (mode) => set({ gameMode: mode }),
    setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
    setPlayer2Name: (name) => set({ player2Name: name }),
    
    // Reset
    resetMode: () => set({ gameMode: "TWO_PLAYERS", aiDifficulty: "EASY", player2Name: "PLAYER_02" })
}));