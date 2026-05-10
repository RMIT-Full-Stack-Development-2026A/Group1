import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAudioStore = create(
    persist(
        (set) => ({
            isBackgroundMusicEnabled: true,
            setBackgroundMusicEnabled: (enabled) => set({ isBackgroundMusicEnabled: enabled }),
            toggleBackgroundMusic: () =>
                set((state) => ({ isBackgroundMusicEnabled: !state.isBackgroundMusicEnabled })),
        }),
        {
            name: 'tictactoan-audio-settings',
            partialize: (state) => ({
                isBackgroundMusicEnabled: state.isBackgroundMusicEnabled,
            }),
        }
    )
);