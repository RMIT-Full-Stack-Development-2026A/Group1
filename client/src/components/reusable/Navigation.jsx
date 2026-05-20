import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { useAuthStore } from "../../stores/auth/AuthStore";
import { useAudioStore } from "../../stores/audio/AudioStore";
import SoundButton from '@/components/reusable/sound/SoundButton';

export default function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);
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
                    <>
                        {/* Desktop menu */}
                        <div className="hidden md:flex items-center gap-4">
                        {isAdmin ? (
                            /* Admin Navigation */
                            <div className="flex items-center gap-3">
                                <SoundButton
                                    onClick={() => navigate("/admin")}
                                    className={`font-mono uppercase tracking-widest text-xs px-4 py-2 border-b-2 transition-all ${
                                        location.pathname === "/admin"
                                            ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                            : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                    }`}
                                >
                                    ADMIN DASHBOARD
                                </SoundButton>

                                <SoundButton
                                    onClick={() => navigate("/admin/players")}
                                    className={`font-mono uppercase tracking-widest text-xs px-3 py-2 border-b-2 transition-all ${
                                        location.pathname === "/admin/players"
                                            ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                            : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                    }`}
                                >
                                    PLAYERS
                                </SoundButton>

                                <SoundButton
                                    onClick={() => navigate("/admin/rooms")}
                                    className={`font-mono uppercase tracking-widest text-xs px-3 py-2 border-b-2 transition-all ${
                                        location.pathname === "/admin/rooms"
                                            ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                            : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                    }`}
                                >
                                    GAME ROOMS
                                </SoundButton>
                            </div>
                        ) : (
                            /* Player Navigation */
                            <>
                                <SoundButton
                                    onClick={() => navigate("/play")}
                                    className={`font-mono uppercase tracking-widest text-xs px-4 py-2 border-b-2 transition-all ${location.pathname === "/play"
                                            ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                            : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                        }`}
                                >
                                    GAME MODES
                                </SoundButton>
                                <SoundButton
                                    onClick={() => navigate("/profile")}
                                    className={`font-mono uppercase tracking-widest text-xs px-4 py-2 border-b-2 transition-all ${location.pathname === "/profile"
                                            ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                            : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                        }`}
                                >
                                    PROFILE
                                </SoundButton>
                                <SoundButton
                                    onClick={() => navigate("/subscription")}
                                    className={`font-mono uppercase tracking-widest text-xs px-4 py-2 border-b-2 transition-all ${location.pathname === "/subscription"
                                        ? "text-[#4cc9f0] font-bold border-b-[#4cc9f0]"
                                        : "text-[#e2e8f0] opacity-80 border-b-transparent hover:text-[#4cc9f0] hover:border-b-[#4cc9f0]"
                                        }`}
                                >
                                    SUBSCRIPTION
                                </SoundButton>
                            </>
                        )}
                        </div>

                        {/* Mobile: hamburger trigger */}
                        <button
                            onClick={() => setMobileOpen(o => !o)}
                            aria-expanded={mobileOpen}
                            aria-label="Toggle menu"
                            className="md:hidden ml-2 p-2 bg-transparent border rounded text-[#e3e0f4]"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        {/* Mobile dropdown menu (visible when open) */}
                        {mobileOpen && (
                            <div className="mobile-nav-dropdown md:hidden">
                                <div className="flex flex-col gap-2">
                                    {isAdmin ? (
                                        <>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/admin'); }} className="text-left px-2 py-2">ADMIN DASHBOARD</SoundButton>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/admin/players'); }} className="text-left px-2 py-2">PLAYERS</SoundButton>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/admin/rooms'); }} className="text-left px-2 py-2">GAME ROOMS</SoundButton>
                                        </>
                                    ) : (
                                        <>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/play'); }} className="text-left px-2 py-2">GAME MODES</SoundButton>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/profile'); }} className="text-left px-2 py-2">PROFILE</SoundButton>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/subscription'); }} className="text-left px-2 py-2">SUBSCRIPTION</SoundButton>
                                        </>
                                    )}

                                    <hr className="border-t border-[#2b2b33] my-2" />

                                    {/* Music toggle in mobile menu */}
                                    <SoundButton onClick={() => { toggleBackgroundMusic(); setMobileOpen(false); }} className="text-left px-2 py-2">
                                        {isBackgroundMusicEnabled ? 'MUSIC ON' : 'MUSIC OFF'}
                                    </SoundButton>

                                    {/* Auth actions */}
                                    {!isLoading && isAuthenticated ? (
                                        <SoundButton onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-left px-2 py-2">LOGOUT</SoundButton>
                                    ) : (
                                        <>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/login'); }} className="text-left px-2 py-2">LOGIN</SoundButton>
                                            <SoundButton onClick={() => { setMobileOpen(false); navigate('/register'); }} className="text-left px-2 py-2">REGISTER</SoundButton>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="hidden md:flex items-center gap-3">
                <SoundButton
                    onClick={toggleBackgroundMusic}
                    className={`inline-flex items-center gap-2 font-mono uppercase tracking-widest text-xs px-4 py-2 border transition-all shadow-[2px_2px_0px_#1e1e2c] ${isBackgroundMusicEnabled
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

            {/* Mobile controls: moved into the mobile dropdown to avoid being clipped */}
        </nav>
    );
}