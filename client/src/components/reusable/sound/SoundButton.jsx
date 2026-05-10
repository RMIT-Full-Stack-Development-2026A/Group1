import { forwardRef } from 'react';
import { useButtonSound } from '@/hooks/useButtonSound';

const SoundButton = forwardRef(({ onClick, children, ...props }, ref) => {
    const { play } = useButtonSound();

    const handleClick = (event) => {
        play();
        onClick?.(event);
    };

    return (
        <button ref={ref} onClick={handleClick} {...props}>
            {children}
        </button>
    );
});

SoundButton.displayName = 'SoundButton';

export default SoundButton;
