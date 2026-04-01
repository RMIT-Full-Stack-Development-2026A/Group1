
import { useNavigate } from "react-router";
import Navigation from "@/components/Navigation/index";

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
                                System Status
                            </span>
                            <span className="text-xs text-[#fad100] font-headline">ONLINE // STABLE</span>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-[#93e2ff]"></div>
                            <div className="w-2 h-2 bg-[#4cc9f0]"></div>
                            <div className="w-2 h-2 bg-[#3d484d]"></div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[#93e2ff] uppercase font-headline tracking-tighter">
                                Loc: Sector 7
                            </span>
                            <span className="text-xs text-[#e3e0f4] font-headline">2070.04.12</span>
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
                    <div className="mt-24 w-full relative h-[400px] border border-[#3d484d] bg-[#1a1a28] overflow-hidden">
                        <div className="absolute top-0 left-0 p-4 border-r border-b border-[#3d484d] font-headline text-[10px] text-[#3d484d]">
                            VISUALIZER_v4.2
                        </div>

                        {/* Board Markers */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none">
                            <div className="relative w-[400px] h-[400px] grid grid-cols-10 grid-rows-10 gap-0 border border-[#3d484d]">
                                {/* Row 1 */}
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">O</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 2 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">O</div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 3 */}
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">O</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">O</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 4 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 5 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">O</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 6 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 7 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">O</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 8 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 9 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                
                                {/* Row 10 */}
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                                <div className="border border-[#3d484d]"></div>
                            </div>
                        </div>

                        {/* Scanning Progress */}
                        <div className="absolute bottom-4 right-4 text-right">
                            <p className="text-[10px] font-headline text-[#93e2ff] opacity-50">SCANNING SECTOR...</p>
                            <div className="w-32 h-1 bg-[#3d484d] mt-1">
                                <div className="w-2/3 h-full bg-[#4cc9f0] shadow-[0_0_5px_#4cc9f0]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */} {/* To Be Removed */}
                <section className="w-full bg-[#1e1e2c] py-12 border-y border-[#3d484d]">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center">
                            <span className="font-headline text-2xl text-[#fad100] mb-2">142K</span>
                            <span className="text-[10px] font-headline uppercase tracking-widest text-[#bcc8ce]">
                                Matches Played
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-headline text-2xl text-[#fad100] mb-2">9.8K</span>
                            <span className="text-[10px] font-headline uppercase tracking-widest text-[#bcc8ce]">
                                Active Pilots
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-headline text-2xl text-[#fad100] mb-2">24ms</span>
                            <span className="text-[10px] font-headline uppercase tracking-widest text-[#bcc8ce]">
                                Avg Latency
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-headline text-2xl text-[#fad100] mb-2">2070</span>
                            <span className="text-[10px] font-headline uppercase tracking-widest text-[#bcc8ce]">
                                System Year
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-4 px-6 flex justify-center items-center bg-[#0d0d1a] border-t border-[#3d484d]">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-[#4cc9f0] font-headline text-xs">TTT SYSTEM</span>
                        <span className="w-px h-3 bg-[#3d484d]"></span>
                        <span className="text-[#bcc8ce] font-mono text-[10px] uppercase tracking-tighter hover:text-[#e2e8f0] cursor-pointer">
                            Security Protocol
                        </span>
                        <span className="text-[#bcc8ce] font-mono text-[10px] uppercase tracking-tighter hover:text-[#e2e8f0] cursor-pointer">
                            User Agreement
                        </span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-tighter text-[#3d484d]">
                        © 2070 NEON-GRID ARCADE SYSTEMS. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </footer>
        </div>
    );
}