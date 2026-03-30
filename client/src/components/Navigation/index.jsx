import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navigation() {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0d0d1a] border-b border-[#3d484d] border-b-2">
            <div className="flex items-center gap-4">
                <span
                    onClick={() => navigate("/")}
                    className="text-2xl font-black text-[#4cc9f0] [text-shadow:2px_2px_0px_#1e1e2c] font-headline uppercase tracking-widest cursor-pointer hover:drop-shadow-[0_0_8px_#4cc9f0] transition-all"
                >
                    TTT
                </span>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/login")}
                    className="font-mono uppercase tracking-widest text-xs text-[#e2e8f0] opacity-80 hover:text-[#4cc9f0] transition-all px-4 py-2"
                >
                    Login
                </button>
                <button
                    onClick={() => navigate("/register")}
                    className="font-mono uppercase tracking-widest text-xs bg-[#4cc9f0] text-[#003543] px-4 py-2 active:translate-y-[1px] shadow-[2px_2px_0px_#1e1e2c] hover:shadow-[0px_0px_8px_#4cc9f0]"
                >
                    Register
                </button>
            </div>
        </nav>
    );
}