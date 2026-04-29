import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/reusable/Navigation";
import { useAuthStore } from "@/stores/AuthStore";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Footer from "@/components/reusable/Footer";

// Routes that must fill exactly the viewport height (h-screen).
// Content that exceeds the viewport on these routes will still scroll
// naturally inside the <main> — this only constrains the outer shell.
const CONSTRAINED_ROUTES = ['/subscription', '/play', '/success', '/cancel'];

// Routes where the navbar is completely hidden (full-screen immersive UI).
// These are also constrained by default.
const IMMERSIVE_ROUTES = ['/game/'];

export default function Layout({ children }) {
    const location = useLocation();
    const showScrollTop = useScrollToTop();

    useEffect(() => {
        useAuthStore.getState().checkAuth();
    }, []);

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
        return (
            <div className="h-screen w-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg overflow-hidden">
                <div className="scanlines"></div>
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        );
    }

    if (isConstrained) {
        // Viewport-fit pages: nav visible, no footer, content fills below nav
        return (
            <div className="h-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg overflow-hidden">
                <Navigation />
                <div className="scanlines"></div>
                <main className="flex-1 pt-16 overflow-auto">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg">
            <Navigation />

            <div className="scanlines"></div>

            <main className="flex-1 pt-16">
                {children}
            </main>

            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white px-3 py-2 rounded-full shadow-md hover:bg-blue-800 transition-all duration-200"
                >
                    ↑
                </button>
            )}

            <Footer />
        </div>
    );
}