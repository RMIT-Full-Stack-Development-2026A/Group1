import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/AuthStore";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Layout({ children }) {
    const location = useLocation();
    const showScrollTop = useScrollToTop();

    // Initialize auth check on app startup (runs only once globally)
    // Use empty dependency array - Zustand functions should not be in dependencies
    useEffect(() => {
        useAuthStore.getState().checkAuth();
    }, []);

    // Hide navigation on guest auth pages
    // const hideNavRoutes = ["/login", "/register", "/"];
    // const shouldHideNav = hideNavRoutes.includes(location.pathname);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <div className = "relative min-h-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg">
            {/* Navigation Bar - Universal Header */}
            <Navigation />
            
            <div className="scanlines"></div>

            <main className="min-h-screen pt-16">
                {children}
            </main>

            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white px-3 py-2 rounded-full shadow-md hover:bg-blue-800 transition-all duration-200"
                >
                    
                </button>
            )}
            
            {/* Footer - Universal Footer */}
            <Footer />
        </div>
    );
}