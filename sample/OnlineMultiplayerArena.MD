<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=1440, height=900, initial-scale=1.0" name="viewport"/>
<title>TICTACTOANG // ONLINE_MULTIPLAYER</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700;800&amp;family=IBM+Plex+Mono:wght@300;400;600&amp;family=Press+Start+2P&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #0d0d1a;
            color: #e3e0f4;
            font-family: 'IBM Plex Mono', monospace;
        }
        .scanline {
            width: 100%;
            height: 100%;
            z-index: 100;
            background: linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%);
            background-size: 100% 2px;
            pointer-events: none;
            position: fixed;
        }
        .pixel-grid {
            background-image: radial-gradient(rgba(76, 201, 240, 0.05) 1px, transparent 0);
            background-size: 4px 4px;
        }
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .glitch-border {
            box-shadow: 0 0 8px rgba(76, 201, 240, 0.4);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        /* Custom Scrollbar for Arcade feel */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #12121f; }
        ::-webkit-scrollbar-thumb { background: #3d484d; }
        ::-webkit-scrollbar-thumb:hover { background: #4cc9f0; }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "secondary-container": "#fad100",
                        "on-tertiary": "#4e2600",
                        "on-surface": "#e3e0f4",
                        "secondary-fixed-dim": "#e9c400",
                        "on-secondary-fixed": "#221b00",
                        "error-container": "#93000a",
                        "surface-variant": "#343342",
                        "outline-variant": "#3d484d",
                        "surface": "#12121f",
                        "secondary-fixed": "#ffe171",
                        "primary-container": "#4cc9f0",
                        "on-primary-fixed-variant": "#004e61",
                        "surface-dim": "#12121f",
                        "on-primary-container": "#005266",
                        "inverse-surface": "#e3e0f4",
                        "tertiary-fixed": "#ffdcc4",
                        "tertiary": "#ffcca9",
                        "inverse-on-surface": "#2f2f3d",
                        "primary-fixed": "#b7eaff",
                        "primary-fixed-dim": "#5bd5fc",
                        "on-secondary-container": "#6d5a00",
                        "tertiary-fixed-dim": "#ffb780",
                        "tertiary-container": "#fba866",
                        "surface-container-lowest": "#0d0d1a",
                        "secondary": "#fff0c4",
                        "on-error": "#690005",
                        "on-tertiary-fixed-variant": "#6f3800",
                        "on-tertiary-fixed": "#2f1400",
                        "on-secondary-fixed-variant": "#554600",
                        "outline": "#879398",
                        "surface-bright": "#383847",
                        "on-error-container": "#ffdad6",
                        "background": "#12121f",
                        "on-primary-fixed": "#001f28",
                        "surface-container-highest": "#343342",
                        "primary": "#93e2ff",
                        "surface-container-high": "#292937",
                        "inverse-primary": "#006780",
                        "surface-tint": "#5bd5fc",
                        "on-primary": "#003543",
                        "surface-container-low": "#1a1a28",
                        "surface-container": "#1e1e2c",
                        "on-background": "#e3e0f4",
                        "on-tertiary-container": "#753b00",
                        "on-secondary": "#3b2f00",
                        "error": "#ffb4ab",
                        "on-surface-variant": "#bcc8ce"
                    },
                    fontFamily: {
                        "headline": ["Space Grotesk"],
                        "body": ["IBM Plex Mono"],
                        "label": ["IBM Plex Mono"]
                    },
                    borderRadius: {"DEFAULT": "0px", "lg": "0px", "xl": "0px", "full": "0px"},
                },
            },
        }
    </script>
</head>
<body class="bg-surface-container-lowest h-screen flex flex-col antialiased">
<div class="scanline"></div>
<!-- TopAppBar -->
<nav class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#12121f] border-b-2 border-[#3d484d]">
<div class="flex items-center gap-8">
<span class="text-2xl font-black text-[#4cc9f0] tracking-tighter hover:shadow-[0_0_8px_#4cc9f0] transition-shadow cursor-pointer">TTT</span>
<div class="hidden md:flex gap-6">
<a class="font-['Space_Grotesk'] uppercase tracking-widest text-xs text-[#3d484d] hover:text-[#4cc9f0] transition-colors" href="#">ARCADE</a>
<a class="font-['Space_Grotesk'] uppercase tracking-widest text-xs text-[#3d484d] hover:text-[#4cc9f0] transition-colors" href="#">LEADERBOARD</a>
<a class="font-['Space_Grotesk'] uppercase tracking-widest text-xs text-[#3d484d] hover:text-[#4cc9f0] transition-colors" href="#">PROFILE</a>
</div>
</div>
<div class="flex items-center gap-4">
<button class="material-symbols-outlined text-[#3d484d] hover:text-[#4cc9f0] transition-colors p-2">settings</button>
<button class="material-symbols-outlined text-[#3d484d] hover:text-[#4cc9f0] transition-colors p-2">terminal</button>
</div>
</nav>
<!-- Sub-Header / Match Info -->
<div class="mt-16 bg-surface-container border-b border-outline-variant px-6 py-3 flex justify-between items-center">
<div class="flex flex-col">
<span class="pixel-font text-xs text-primary-container">ONLINE MATCH</span>
<span class="text-[10px] text-outline font-mono">MATCH_ID: #FF-990-0074</span>
</div>
<div class="flex items-center gap-12">
<div class="flex flex-col items-center">
<span class="pixel-font text-[10px] text-on-surface">MOV_COUNT: 21</span>
</div>
<div class="flex items-center gap-2 bg-surface-container-highest px-3 py-1 border border-outline-variant">
<span class="pixel-font text-[10px] text-secondary-container">ROOM #042</span>
<span class="material-symbols-outlined text-xs text-secondary-container cursor-pointer hover:scale-110 transition-transform">content_copy</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-2">
<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
<span class="text-[10px] font-bold tracking-tighter text-green-500">CONNECTED</span>
</div>
<button class="text-[10px] font-bold text-error border border-error px-3 py-1 hover:bg-error-container hover:text-on-error-container transition-all">ABORT_GAME</button>
</div>
</div>
<!-- Main Content Area -->
<main class="flex-grow flex p-6 gap-6 overflow-hidden">
<!-- Left Sidebar: Player 1 (Local) -->
<aside class="w-[240px] flex flex-col gap-4">
<div class="bg-surface p-4 border border-outline-variant relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-1 bg-error"></div>
<div class="flex flex-col items-center gap-4 mt-2">
<div class="w-32 h-32 bg-surface-container-highest border-2 border-outline-variant p-2">
<img alt="Player 1 Avatar" class="w-full h-full object-cover" data-alt="Pixel art avatar for local player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYGpp3rs_4l1Cwfs4YF9UwF-qfEy5Rr-Y-ql3EI7GskgB1Kx0JNLQNpsZ0cJmWakvWqEuKEaZQr2HLUf4nyLjdOoVIGRcxTgG-4CGX3gWKpbKNki3DHWrGRHx19uQmbeNU5fb5aRk_n--1-LxUEBetfdUmt6Y013w-zpxwH4aWEV9LDFjFAInGG0hJBT5Jw_PbQr0qNGq1GSlr-yPj745zY_3Wiby5BkDTQAauzh1_ApigRANg74UVSZpJViIvGc1RKTgCDO8bfCqM"/>
</div>
<div class="text-center">
<span class="pixel-font text-[10px] text-on-surface block mb-2">PLAYER_01</span>
<span class="pixel-font text-4xl text-error drop-shadow-[0_0_5px_rgba(230,57,70,0.5)]">X</span>
</div>
</div>
<div class="mt-6 space-y-3">
<div class="bg-primary-container/10 border border-primary-container px-2 py-1 text-center">
<span class="text-[10px] font-bold text-primary-container tracking-widest">ACTIVE_TURN</span>
</div>
<div class="w-full bg-surface-container-highest h-2 overflow-hidden">
<div class="h-full bg-primary-container w-[65%]" style="box-shadow: 0 0 10px #4cc9f0;"></div>
</div>
<div class="flex justify-between text-[10px] text-outline font-mono">
<span>TIME_REMAINING</span>
<span>12.4s</span>
</div>
</div>
</div>
<div class="flex-grow bg-surface border border-outline-variant p-4 pixel-grid">
<h4 class="text-[10px] text-outline font-bold border-b border-outline-variant pb-2 mb-3">SESSION_LOG</h4>
<div class="space-y-2 text-[9px] font-mono opacity-60">
<p>&gt; AUTHENTICATED...</p>
<p>&gt; UPLINK_STABLE</p>
<p>&gt; BUFFER_READY</p>
</div>
</div>
</aside>
<!-- Center Area: Game Board -->
<section class="flex-grow flex flex-col items-center justify-center bg-surface-container border border-outline-variant relative">
<!-- Grid Coordinates Top -->
<div class="flex mb-2 ml-8">
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">a</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">b</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">c</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">d</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">e</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">f</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">g</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">h</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">i</div>
<div class="w-12 h-6 flex items-center justify-center font-mono text-xs text-outline">j</div>
</div>
<div class="flex">
<!-- Grid Coordinates Left -->
<div class="flex flex-col mr-2">
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">1</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">2</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">3</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">4</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">5</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">6</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">7</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">8</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">9</div>
<div class="w-6 h-12 flex items-center justify-center font-mono text-xs text-outline">10</div>
</div>
<!-- 10x10 Board -->
<div class="grid grid-cols-10 grid-rows-10 border border-outline-variant bg-surface-container-lowest">
<!-- Generating a mix of pieces and empty cells -->
<div class="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container/10 cursor-pointer transition-colors group">
<span class="pixel-font text-xl text-error opacity-100">X</span>
</div>
<div class="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container/10 cursor-pointer transition-colors group"></div>
<div class="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container/10 cursor-pointer transition-colors group">
<span class="pixel-font text-xl text-primary-container drop-shadow-[0_0_5px_#4cc9f0]">O</span>
</div>
<div class="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container/10 cursor-pointer transition-colors group"></div>
<div class="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container/10 cursor-pointer transition-colors group"></div>
<div class="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container/10 cursor-pointer transition-colors group">
<span class="pixel-font text-xl text-error">X</span>
</div>
<!-- Row fillers for visualization -->
<script>
                        for(let i=0; i<94; i++) {
                            const icons = ['', '', '', 'X', 'O', ''];
                            const icon = icons[Math.floor(Math.random() * icons.length)];
                            const colorClass = icon === 'X' ? 'text-error' : 'text-primary-container drop-shadow-[0_0_5px_#4cc9f0]';
                            document.write(`
                                <div class="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container/10 cursor-pointer transition-colors group">
                                    <span class="pixel-font text-xl ${colorClass}">${icon}</span>
                                </div>
                            `);
                        }
                    </script>
</div>
</div>
<!-- HUD Overlay Element -->
<div class="absolute bottom-4 right-4 flex gap-2">
<div class="p-1 border border-outline-variant bg-surface text-[8px] font-mono text-outline">LAT: 12ms</div>
<div class="p-1 border border-outline-variant bg-surface text-[8px] font-mono text-outline">SEC: L3</div>
</div>
</section>
<!-- Right Sidebar: Opponent & Chat -->
<aside class="w-[260px] flex flex-col gap-6">
<!-- Opponent Info -->
<div class="bg-surface p-4 border border-outline-variant relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-1 bg-primary-container"></div>
<div class="flex flex-col items-center gap-4 mt-2">
<div class="w-32 h-32 bg-surface-container-highest border-2 border-outline-variant p-2">
<img alt="Opponent Avatar" class="w-full h-full object-cover" data-alt="Pixel art avatar for opponent player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXYi0nsqfNYLbGMKYntj_SaTxNXagBjAFO-Fj7plWLfMtNlkWfU1RmeEljk2qCs1Pg26WIn4DYQFUVcK14IqnRndd4J5PJm1Z015BoKMM2ai2DWvI9ZalAETof3kXiAAOPn8whUpPJmKu-pHidn91e3lFkbukE3uw90aSvSj3lWgICvaTe_6KKSNBEk2JK1HTZ7KCtdfj3DQMjBG9zLbjxERmwZ5ERn1XM12vbWgB7UqPbfXFBTMNAQMpAA-7fUMSraKDIgEvleAri"/>
</div>
<div class="text-center">
<span class="pixel-font text-[10px] text-on-surface block mb-2">NEON_PHANTOM</span>
<span class="pixel-font text-4xl text-primary-container drop-shadow-[0_0_8px_#4cc9f0]">O</span>
</div>
</div>
</div>
<!-- Chat Panel -->
<div class="flex-grow flex flex-col bg-surface border border-outline-variant overflow-hidden">
<div class="bg-surface-container-high px-4 py-2 border-b border-outline-variant flex justify-between items-center">
<span class="pixel-font text-[9px] text-outline">COMM_LINK</span>
<span class="material-symbols-outlined text-xs text-outline">forum</span>
</div>
<div class="flex-grow p-4 overflow-y-auto space-y-4 font-mono text-[11px]">
<div class="flex flex-col items-start">
<span class="text-[9px] text-outline mb-1">NEON_PHANTOM</span>
<div class="bg-surface-container-highest p-2 border border-outline-variant text-on-surface">
                            nice move
                        </div>
</div>
<div class="flex flex-col items-end">
<span class="text-[9px] text-primary-container mb-1">PLAYER_01</span>
<div class="bg-primary-container/10 p-2 border border-primary-container text-primary-container">
                            thanks
                        </div>
</div>
<div class="flex flex-col items-start">
<span class="text-[9px] text-outline mb-1">NEON_PHANTOM</span>
<div class="bg-surface-container-highest p-2 border border-outline-variant text-on-surface">
                            thinking...
                        </div>
</div>
</div>
<div class="p-3 border-t border-outline-variant bg-surface-container-low space-y-2">
<input class="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary-container focus:ring-0 text-[11px] font-mono text-on-surface placeholder-outline/50 uppercase" placeholder="TYPE MESSAGE..." type="text"/>
<button class="w-full bg-primary-container text-on-primary font-bold text-[10px] py-2 tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[2px_2px_0px_#005266]">SEND_SIGNAL</button>
</div>
</div>
</aside>
</main>
<!-- Footer -->
<footer class="fixed bottom-0 w-full z-50 flex justify-between items-center px-4 py-1 bg-[#0d0d1a] border-t border-[#3d484d]">
<div class="flex items-center gap-4">
<span class="font-mono text-[10px] tracking-tight text-[#4cc9f0]">LATENCY: 14MS</span>
<span class="font-mono text-[10px] tracking-tight text-[#4cc9f0]">UPLINK: ACTIVE</span>
</div>
<div class="font-mono text-[10px] tracking-tight text-[#3d484d]">
            © 2074 TICTACTOANG // SYSTEM_READY
        </div>
</footer>
</body></html>