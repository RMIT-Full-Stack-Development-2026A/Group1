import { useCallback } from "react";

export const useAudio = (src, volume = 0.5) => {
    const play = useCallback(() => {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch((error) => {
            // Interrupted playback and blocked autoplay are expected, not errors.
            if (error?.name === "AbortError" || error?.name === "NotAllowedError") return;
            console.error("Error playing audio:", error);
        });
    }, [src, volume]);

    return { play };
};