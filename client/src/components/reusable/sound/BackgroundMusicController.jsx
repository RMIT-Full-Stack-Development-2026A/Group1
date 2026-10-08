import { useEffect, useRef } from 'react';
import { AUDIO_FILES } from '@/config/audioConfig';
import { useAudioStore } from '@/stores/audio/AudioStore';

const userGestureEvents = ['pointerdown', 'keydown', 'touchstart'];

export default function BackgroundMusicController() {
    const audioRef = useRef(null);
    const retryListenersRef = useRef([]);
    const isBackgroundMusicEnabled = useAudioStore((state) => state.isBackgroundMusicEnabled);

    useEffect(() => {
        const audio = new Audio(AUDIO_FILES.BACKGROUND);
        audio.loop = true;
        audio.volume = 0.28;
        // 'none': nothing downloads until playback actually starts (the file is ~1.8 MB)
        audio.preload = 'none';
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const clearRetryListeners = () => {
            retryListenersRef.current.forEach(({ eventName, handler }) => {
                window.removeEventListener(eventName, handler);
            });
            retryListenersRef.current = [];
        };

        if (!isBackgroundMusicEnabled) {
            clearRetryListeners();
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        const waitForGesture = () => {
            if (retryListenersRef.current.length > 0) return;

            const retryPlayback = () => {
                audio.play().catch(() => {});
                clearRetryListeners();
            };

            userGestureEvents.forEach((eventName) => {
                window.addEventListener(eventName, retryPlayback, { once: true, passive: true });
                retryListenersRef.current.push({ eventName, handler: retryPlayback });
            });
        };

        const tryPlay = () => {
            // Browsers block autoplay until the visitor has interacted with the page, and calling play() before
            // that can still start fetching the file. So wait for the first gesture instead of trying blind.
            if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
                waitForGesture();
                return;
            }
            audio.play().catch(waitForGesture);
        };

        tryPlay();

        return clearRetryListeners;
    }, [isBackgroundMusicEnabled]);

    return null;
}