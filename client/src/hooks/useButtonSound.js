import { useRef, useEffect, useCallback } from 'react';
import { AUDIO_FILES } from '@/config/audioConfig';

export const useButtonSound = (src = AUDIO_FILES.BUTTON_CLICK, volume = 0.45) => {
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.volume = volume;
        audioRef.current = audio;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [src, volume]);

    const play = useCallback(() => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
            // AbortError: the button unmounted (navigation, logout) and paused its own sound mid-play.
            // NotAllowedError: the browser blocked autoplay before any user gesture. Neither is a bug.
            if (error?.name === 'AbortError' || error?.name === 'NotAllowedError') return;
            console.error('Error playing button sound:', error);
        });
    }, []);

    return { play };
};
