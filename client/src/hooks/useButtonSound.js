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
            console.error('Error playing button sound:', error);
        });
    }, []);

    return { play };
};
