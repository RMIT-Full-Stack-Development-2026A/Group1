import { useCallback } from "react";

export const useAudio = (src, volume = 0.5) => {
    const play = useCallback(() => {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
        });
    }, [src, volume]);

    return { play };
};