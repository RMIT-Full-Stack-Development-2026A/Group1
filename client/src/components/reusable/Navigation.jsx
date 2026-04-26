import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { useAuthStore } from "../../stores/AuthStore";
import { useAudioStore } from "../../stores/AudioStore";
import SoundButton from '@/components/reusable/SoundButton';

export default function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading, logout, user } = useAuthStore();
    const { isBackgroundMusicEnabled, toggleBackgroundMusic } = useAudioStore();

    const isAdmin = user?.role === 'ADMIN';

    const handleLogoClick = () => {
        // If logged in, go to appropriate dashboard. Otherwise, go to landing page
        if (isAuthenticated) {
            if (isAdmin) {
                navigate("/admin");
            } else {
                navigate("/play");
            }
        } else {
            navigate("/");
        }
    };

    const handleLogout = async () => {
        await logout();
        // Redirect to landing page after logout
        navigate("/");
    };

    return (
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-deep-bg border-b-2 border-[#3d484d]">
            <div className="flex items-center gap-8">
                <span
                    onClick={handleLogoClick}
                    className="text-2xl font-black text-[#4cc9f0] [text-shadow:2px_2px_0px_#1e1e2c] font-headline uppercase tracking-widest cursor-pointer hover:drop-shadow-[0_0_8px_#4cc9f0] transition-all"
                >
                    TicTacToang
                </span>
                
                {isAuthenticated && !isLoading && (
                    <div className="flex items-center gap-4">
                        {isAdmin ? (
                            /* Admin Navigation */
                            <SoundButton
                                onClick={() => navigate("/admin")}
                                className={`font-mono uppercase tracking-widest text-xs px-4 py-2 border-b-2 transition-all ${
                                    location.pathname.startsWith("/admin")
                                        ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                        : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                }`}
                            >
                                ADMIN DASHBOARD
                            </SoundButton>
                        ) : (
                            /* Player Navigation */
                            <>
                                <SoundButton
                                    onClick={() => navigate("/play")}
                                    className={`font-mono uppercase tracking-widest text-xs px-4 py-2 border-b-2 transition-all ${
                                        location.pathname === "/play"
                                            ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                            : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                    }`}
                                >
                                    GAME MODES
                                </SoundButton>
                                <SoundButton
                                    onClick={() => navigate("/profile")}
                                    className={`font-mono uppercase tracking-widest text-xs px-4 py-2 border-b-2 transition-all ${
                                        location.pathname === "/profile"
                                            ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                            : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                    }`}
                                >
                                    PROFILE
                                </SoundButton>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <SoundButton
                    onClick={toggleBackgroundMusic}
                    className={`inline-flex items-center gap-2 font-mono uppercase tracking-widest text-xs px-4 py-2 border transition-all shadow-[2px_2px_0px_#1e1e2c] ${
                        isBackgroundMusicEnabled
                            ? "bg-[#052e32] text-[#4cc9f0] border-[#4cc9f0] hover:shadow-[0px_0px_8px_#4cc9f0]"
                            : "bg-[#2b1515] text-[#ffb4ab] border-[#ffb4ab] hover:shadow-[0px_0px_8px_#ffb4ab]"
                    }`}
                    aria-pressed={!isBackgroundMusicEnabled}
                    title={isBackgroundMusicEnabled ? 'Turn background music off' : 'Turn background music on'}
                >
                    {isBackgroundMusicEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    {isBackgroundMusicEnabled ? 'MUSIC ON' : 'MUSIC OFF'}
                </SoundButton>

                {!isLoading && isAuthenticated ? (
                    <SoundButton
                        onClick={handleLogout}
                        className="font-mono uppercase tracking-widest text-xs bg-[#ffb4ab] cursor-pointer text-[#690005] px-4 py-2 active:translate-y-px shadow-[2px_2px_0px_#1e1e2c] hover:shadow-[0px_0px_8px_#ffb4ab] transition-all"
                    >
                        LOGOUT
                    </SoundButton>
                ) : (
                    <>
                        <SoundButton
                            onClick={() => navigate("/login")}
                            className="font-mono uppercase tracking-widest text-xs text-[#e2e8f0] opacity-80 hover:text-[#4cc9f0] transition-all px-4 py-2"
                        >
                            LOGIN
                        </SoundButton>
                        <SoundButton
                            onClick={() => navigate("/register")}
                            className="font-mono uppercase tracking-widest text-xs bg-primary-cyan text-[#003543] px-4 py-2 active:translate-y-px shadow-[2px_2px_0px_#1e1e2c] hover:shadow-[0px_0px_8px_#4cc9f0] transition-all"
                        >
                            REGISTER
                        </SoundButton>
                    </>
                )}
            </div>
        </nav>
    );
}