import { useEffect, useState } from "react"

export const useScrollToTop = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        // Smooth scrolling on the html element, unless the visitor asked for reduced motion
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion) document.documentElement.style.scrollBehavior = 'smooth';

        // scrollY is how far the page is scrolled; screenY would be the browser window's position on the monitor
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400)
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            // Clean up smooth scroll on unmount
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);
    return showScrollTop;
};