import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/reusable/Navigation";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useSocketStore } from "@/stores/socket/SocketStore";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Footer from "@/components/reusable/Footer";

// Routes that must fill exactly the viewport height (h-screen).
// Content that exceeds the viewport on these routes will still scroll
// naturally inside the <main> — this only constrains the outer shell.
const CONSTRAINED_ROUTES = ['/subscription', '/play', '/success', '/cancel', '/lobby', '/game/offline/'];

// Routes where the navbar is completely hidden (full-screen immersive UI).
// These are also constrained by default.
const IMMERSIVE_ROUTES = ['/game/', '/room/online/', '/game/offline/'];

export default function Layout({ children }) {
    const location = useLocation();
    const showScrollTop = useScrollToTop();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const connectSocket = useSocketStore((state) => state.connectSocket);
    const disconnectSocket = useSocketStore((state) => state.disconnectSocket);

    useEffect(() => {
        useAuthStore.getState().checkAuth();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            connectSocket();
        } else {
            disconnectSocket();
        }
    }, [isAuthenticated, connectSocket, disconnectSocket]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    const isImmersive = IMMERSIVE_ROUTES.some(prefix =>
        location.pathname.startsWith(prefix)
    );
    const isConstrained = isImmersive || CONSTRAINED_ROUTES.some(path =>
        location.pathname === path
    );

    if (isImmersive) {
        // Game board: no nav, no footer, no padding — pure full-screen shell
        // On small screens allow scrolling inside the main area so tall side panels are reachable
        return (
            <div className="h-screen w-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg overflow-auto lg:overflow-hidden">
                <div className="scanlines"></div>
                <main className="flex-1 overflow-auto lg:overflow-hidden">
                    {children}
                </main>
            </div>
        );
    }

    if (isConstrained) {
        // Viewport-fit pages: nav visible, no footer, content fills below nav
        return (
            <div className="h-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg overflow-auto lg:overflow-hidden">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-cyan focus:text-deep-bg focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase"
                >
                    Skip to main content
                </a>
                <Navigation />
                <div className="scanlines"></div>
                <main id="main-content" className="flex-1 pt-16 overflow-auto">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-cyan focus:text-deep-bg focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase"
            >
                Skip to main content
            </a>
            <Navigation />

            <div className="scanlines"></div>

            <main id="main-content" className="flex-1 pt-16">
                {children}
            </main>

            {showScrollTop && (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
                    aria-label="Scroll to top"
                    className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#4cc9f0] bg-[#4cc9f0] text-[#003543] shadow-md transition-[background-color,box-shadow] duration-200 hover:bg-[#93e2ff] hover:shadow-[0px_0px_8px_#4cc9f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93e2ff]"
                >
                    <span aria-hidden="true" className="material-symbols-outlined">arrow_upward</span>
                </button>
            )}

            <Footer />
        </div>
    );
}