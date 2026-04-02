import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
    const navigate = useNavigate();
    const { isLoggedIn, loading, logout } = useAuth();

    const handleLogoClick = () => {
        // If logged in, go to lobby. Otherwise, go to landing page
        if (isLoggedIn) {
            navigate("/lobby");
        } else {
            navigate("/");
        }
    };

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            // Redirect to landing page after logout
            navigate("/");
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0d0d1a] border-b-2 border-[#3d484d]">
            <div className="flex items-center gap-4">
                <span
                    onClick={handleLogoClick}
                    className="text-2xl font-black text-[#4cc9f0] [text-shadow:2px_2px_0px_#1e1e2c] font-headline uppercase tracking-widest cursor-pointer hover:drop-shadow-[0_0_8px_#4cc9f0] transition-all"
                >
                    TicTacToang
                </span>
            </div>

            <div className="flex items-center gap-4">
                {!loading && isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="font-mono uppercase tracking-widest text-xs bg-[#ffb4ab] text-[#690005] px-4 py-2 active:translate-y-px shadow-[2px_2px_0px_#1e1e2c] hover:shadow-[0px_0px_8px_#ffb4ab] transition-all"
                    >
                        LOGOUT
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => navigate("/login")}
                            className="font-mono uppercase tracking-widest text-xs text-[#e2e8f0] opacity-80 hover:text-[#4cc9f0] transition-all px-4 py-2"
                        >
                            LOGIN
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="font-mono uppercase tracking-widest text-xs bg-[#4cc9f0] text-[#003543] px-4 py-2 active:translate-y-px shadow-[2px_2px_0px_#1e1e2c] hover:shadow-[0px_0px_8px_#4cc9f0] transition-all"
                        >
                            REGISTER
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}