// src/Layout.jsx
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuthStore } from "@/stores/AuthStore";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Layout({ children }) {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();
    const showScrollTop = useScrollToTop();

    // Hide navigation on guest auth pages
    const hideNavRoutes = ["/login", "/register", "/"];
    const shouldHideNav = hideNavRoutes.includes(location.pathname);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <>
            {!shouldHideNav && (
                <Navigation isAuthenticated={isAuthenticated} user={user} />
            )}

            <main className="min-h-screen">
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
        </>
    );
}