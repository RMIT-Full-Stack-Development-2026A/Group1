import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
// import Navigation from "@/components/Navigation";
import { useAuthStore } from "@/stores/AuthStore";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Layout({ children }) {
    const { checkAuth } = useAuthStore();
    const location = useLocation();
    const showScrollTop = useScrollToTop();

    // Initialize auth check on app startup (runs only once globally)
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Hide navigation on guest auth pages
    // const hideNavRoutes = ["/login", "/register", "/"];
    // const shouldHideNav = hideNavRoutes.includes(location.pathname);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <div className = "relative min-h-screen flex flex-col font-mono selection:bg-primary-cyan selection:text-deep-bg">
            {/*{!shouldHideNav && (*/}
            {/*    // <Navigation isAuthenticated={isAuthenticated} user={user} />*/}
            {/*)}*/}
            
            <div className="scanlines"></div>

            <main className="min-h-screen">
                {children}
            </main>

            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white px-3 py-2 rounded-full shadow-md hover:bg-blue-800 transition-all duration-200"
                >
                    
                </button>
            )}
            <footer className="fixed bottom-0 w-full z-40 flex justify-between items-center px-4 py-2 bg-deep-bg border-t border-outline-variant">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-tight text-primary-cyan uppercase">
                        LATENCY: 14MS 
                    </span>
                    <span className="hidden md:inline text-[10px] text-outline-variant uppercase">
                        LOC: SECTOR_7G
                    </span>
                </div>
                <div className="flex gap-4">
                   <span className="text-[10px] tracking-tight text-primary-cyan flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      SYSTEM_STATUS: NOMINAL
                   </span>
                </div>
            </footer>
        </div>
    );
}