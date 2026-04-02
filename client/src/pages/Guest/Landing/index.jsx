
import { useNavigate } from "react-router";
import Navigation from "@/components/Navigation/index";
import Footer from "@/components/Footer";
import { BoardVisualizer } from "@/components/BoardVisualizer";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#0d0d1a] text-[#e3e0f4] font-body overflow-x-hidden selection:bg-[#fad100] selection:text-[#003543]">
            {/* Top Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="relative min-h-screen flex flex-col items-center">
                {/* Background Textures */}
                <div className="absolute inset-0 opacity-20 z-0" style={{
                    backgroundImage: "radial-gradient(#3d484d 1px, transparent 1px)",
                    backgroundSize: "16px 16px"
                }}></div>
                <div className="absolute inset-0 z-10" style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.05) 50%)",
                    backgroundSize: "100% 2px",
                    pointerEvents: "none"
                }}></div>

                {/* Hero Section */}
                <section className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
                    {/* HUD Header */}
                    <div className="w-full flex justify-between items-end mb-12 border-b border-[#3d484d] pb-2">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] text-[#93e2ff] uppercase font-headline tracking-tighter">
                                COSC2769|COSC2808
                            </span>
                            <span className="text-xs text-[#fad100] font-headline">Fullstack Development</span>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-[#93e2ff]"></div>
                            <div className="w-2 h-2 bg-[#4cc9f0]"></div>
                            <div className="w-2 h-2 bg-[#3d484d]"></div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[#93e2ff] uppercase font-headline tracking-tighter">
                                Group 1
                            </span>
                            <span className="text-xs text-[#e3e0f4] font-headline">Semester 2, 2026</span>
                        </div>
                    </div>

                    {/* Main Logo */}
                    <div className="relative group mb-6">
                        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-[#4cc9f0] tracking-tighter uppercase [text-shadow:4px_4px_0px_#1e1e2c]">
                            TicTacToang
                        </h1>
                        <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[#fda866]"></div>
                        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[#fda866]"></div>
                    </div>

                    {/* Tagline */}
                    <p className="font-body text-lg md:text-xl text-[#bcc8ce] max-w-2xl mb-12 tracking-wide uppercase">
                        The ultimate 10x10 TicTacToe arena. <span className="text-[#93e2ff]">Precision or Perish.</span>
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-6 mb-24">
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-[#4cc9f0] text-[#003543] px-10 py-5 font-headline text-xl flex items-center justify-center gap-4 border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#1e1e2c] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:shadow-[0px_0px_8px_#4cc9f0]"
                        >
                            PLAY NOW
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="border-2 border-[#3d484d] text-[#e3e0f4] px-10 py-5 font-headline text-xl active:translate-y-[1px] transition-all hover:shadow-[0px_0px_8px_#4cc9f0] hover:border-[#4cc9f0]"
                        >
                            LOGIN
                        </button>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {/* Card 1 */}
                        <div className="bg-[#1e1e2c] border border-[#3d484d] p-1 relative overflow-hidden group hover:border-[#4cc9f0] transition-colors">
                            <div className="h-1 bg-[#4cc9f0] w-full mb-4"></div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-[#292937] flex items-center justify-center border border-[#3d484d] group-hover:border-[#4cc9f0] transition-colors flex-shrink-0">
                                        <span className="text-[#4cc9f0] text-3xl">⊞</span>
                                    </div>
                                    <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">10x10 Board</h3>
                                </div>
                                <p className="text-xs text-[#bcc8ce] leading-relaxed">
                                    Massive tactical grid for extended strategies and unpredictable outcomes.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#1e1e2c] border border-[#3d484d] p-1 relative overflow-hidden group hover:border-[#fad100] transition-colors">
                            <div className="h-1 bg-[#fad100] w-full mb-4"></div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-[#292937] flex items-center justify-center border border-[#3d484d] group-hover:border-[#fad100] transition-colors flex-shrink-0">
                                        <span className="text-[#fad100] text-3xl">⚙</span>
                                    </div>
                                    <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">3 AI Levels</h3>
                                </div>
                                <p className="text-xs text-[#bcc8ce] leading-relaxed">
                                    Challenge the mainframe from 'Novice Protocol' to 'God Mode Execution'.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#1e1e2c] border border-[#3d484d] p-1 relative overflow-hidden group hover:border-[#ffb780] transition-colors">
                            <div className="h-1 bg-[#ffb780] w-full mb-4"></div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-[#292937] flex items-center justify-center border border-[#3d484d] group-hover:border-[#ffb780] transition-colors flex-shrink-0">
                                        <span className="text-[#ffb780] text-3xl">◐</span>
                                    </div>
                                    <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">Online Multiplayer</h3>
                                </div>
                                <p className="text-xs text-[#bcc8ce] leading-relaxed">
                                    Battle other pilots across the global network in real-time combat.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Board Visualization */}
                    <div className="mt-16 w-full">
                        <BoardVisualizer />
                    </div>
                </section>

            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}