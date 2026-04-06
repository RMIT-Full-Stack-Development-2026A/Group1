<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TICTACTOANG // ARCADE_TERMINAL</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;family=IBM+Plex+Mono:wght@400;700&amp;family=Space+Grotesk:wght@700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "outline-variant": "#3d484d",
              "surface-container-low": "#1a1a28",
              "on-tertiary": "#4e2600",
              "primary-fixed-dim": "#5bd5fc",
              "inverse-surface": "#e3e0f4",
              "secondary": "#fff0c4",
              "on-tertiary-fixed": "#2f1400",
              "on-secondary-fixed-variant": "#554600",
              "on-primary": "#003543",
              "on-tertiary-container": "#753b00",
              "on-error": "#690005",
              "on-error-container": "#ffdad6",
              "surface-bright": "#383847",
              "error-container": "#93000a",
              "surface-container-high": "#292937",
              "outline": "#879398",
              "primary": "#93e2ff",
              "on-primary-fixed": "#001f28",
              "surface-container-lowest": "#0d0d1a",
              "secondary-fixed-dim": "#e9c400",
              "primary-fixed": "#b7eaff",
              "tertiary": "#ffcca9",
              "secondary-fixed": "#ffe171",
              "on-primary-fixed-variant": "#004e61",
              "on-secondary-container": "#6d5a00",
              "inverse-primary": "#006780",
              "surface-container-highest": "#343342",
              "on-surface-variant": "#bcc8ce",
              "on-tertiary-fixed-variant": "#6f3800",
              "surface-dim": "#12121f",
              "on-background": "#e3e0f4",
              "background": "#12121f",
              "inverse-on-surface": "#2f2f3d",
              "error": "#ffb4ab",
              "primary-container": "#4cc9f0",
              "tertiary-fixed-dim": "#ffb780",
              "surface-tint": "#5bd5fc",
              "surface": "#12121f",
              "on-secondary-fixed": "#221b00",
              "on-secondary": "#3b2f00",
              "surface-variant": "#343342",
              "on-surface": "#e3e0f4",
              "tertiary-fixed": "#ffdcc4",
              "secondary-container": "#fad100",
              "surface-container": "#1e1e2c",
              "tertiary-container": "#fba866",
              "on-primary-container": "#005266"
            },
            fontFamily: {
              "headline": ["'Press Start 2P'", "cursive"],
              "body": ["'IBM Plex Mono'", "monospace"],
              "label": ["'IBM Plex Mono'", "monospace"],
              "mono": ["'IBM Plex Mono'", "monospace"]
            },
            borderRadius: {"none": "0", "DEFAULT": "0", "lg": "0", "xl": "0", "full": "0"},
          },
        },
      }
    </script>
<style>
        .scanlines {
            background: linear-gradient(
                to bottom,
                rgba(18, 16, 16, 0) 50%,
                rgba(0, 0, 0, 0.1) 50%
            );
            background-size: 100% 2px;
            pointer-events: none;
        }
        .pixel-grid {
            background-image: radial-gradient(rgba(76, 201, 240, 0.05) 1px, transparent 0);
            background-size: 4px 4px;
            pointer-events: none;
        }
        .glow-cyan { box-shadow: 0 0 10px #4cc9f0; }
        .glow-red { box-shadow: 0 0 10px #93000a; }
        .glow-amber { box-shadow: 0 0 15px #fad100; }
        .text-glow-cyan { text-shadow: 0 0 8px #4cc9f0; }
        .text-glow-red { text-shadow: 0 0 8px #ffb4ab; }
        .text-glow-amber { text-shadow: 0 0 12px #fad100; }
        
        .chunky-offset-primary {
            box-shadow: 2px 2px 0px 0px #005266;
        }
        .chunky-offset-error {
            box-shadow: 2px 2px 0px 0px #690005;
        }
        
        /* Coordinate Labels alignment */
        .grid-container {
            display: grid;
            grid-template-columns: 24px 1fr 24px;
            grid-template-rows: 24px 1fr 24px;
        }
    </style>
</head>
<body class="bg-surface-container-lowest text-on-surface font-body overflow-hidden h-screen w-screen relative">
<!-- Screen Overlays -->
<div class="fixed inset-0 scanlines z-[100]"></div>
<div class="fixed inset-0 pixel-grid z-[99]"></div>
<!-- Top Navigation Shell -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#12121f] border-b-2 border-[#3d484d] shadow-[0px_2px_0px_0px_#343342]">
<div class="flex items-center gap-4">
<span class="text-2xl font-black text-[#4cc9f0] [text-shadow:0px_0px_8px_#4cc9f0] font-headline tracking-tighter">TICTACTOANG</span>
</div>
<nav class="hidden md:flex gap-8">
<a class="font-mono uppercase tracking-widest text-sm text-[#4cc9f0] border-b-2 border-[#4cc9f0] pb-1 active:translate-y-[1px]" href="#">ARCADE</a>
<a class="font-mono uppercase tracking-widest text-sm text-[#3d484d] hover:text-[#4cc9f0] transition-colors duration-100 active:translate-y-[1px]" href="#">LEADERBOARD</a>
<a class="font-mono uppercase tracking-widest text-sm text-[#3d484d] hover:text-[#4cc9f0] transition-colors duration-100 active:translate-y-[1px]" href="#">SYSTEM_LOGS</a>
</nav>
<div class="flex items-center gap-4">
<button class="p-2 text-[#4cc9f0] hover:bg-[#1e1e2c] transition-colors duration-100 active:translate-y-[1px]">
<span class="material-symbols-outlined">settings</span>
</button>
<button class="p-2 text-[#4cc9f0] hover:bg-[#1e1e2c] transition-colors duration-100 active:translate-y-[1px]">
<span class="material-symbols-outlined">terminal</span>
</button>
</div>
</header>
<!-- Main Content Layout -->
<main class="pt-16 pb-8 h-full flex px-6 gap-6 items-center justify-center">
<!-- Left Panel: Player 1 (Active) -->
<aside class="w-[220px] flex flex-col gap-4 self-start mt-8">
<div class="bg-surface border-2 border-primary-container p-6 flex flex-col items-center gap-6 glow-cyan relative">
<div class="absolute -top-3 left-4 bg-primary-container text-on-primary px-2 py-0.5 text-[10px] font-bold uppercase">ACTIVE_TURN</div>
<div class="w-32 h-32 border-2 border-outline-variant bg-surface-container-highest flex items-center justify-center p-2">
<img class="w-full h-full object-cover" data-alt="Pixel art avatar of player one" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5vF5oo5Cs1xM2c-huE79NJhW1R6SV3bTB8K3_GCuarPZyf3s_X_ffRI5jBf85BJEmuN3pBpeoMoccdBK53oxi-f50uBbJsEdQ_o15whuvBM8HecFXuSSAx4vV_-32nT4ErgPQN4UHzI9gQqR1fPzx1mzI7N2O7ZQ6Lf_mlh8dABtIFaeHdFGyFg9aB3Ae8_ynaLlTt3QnefC1zX_fIzVZ6McwqE4Kej3BVefWWSjUPeAA-tdp3K0XCAOljAD9ltu0SYMjAOdO4Ur"/>
</div>
<div class="text-center">
<p class="font-headline text-[10px] text-primary tracking-tighter mb-2">PLAYER_01</p>
<div class="text-error font-headline text-5xl text-glow-red">X</div>
</div>
<div class="w-full h-1 bg-outline-variant">
<div class="w-3/4 h-full bg-primary-container"></div>
</div>
<p class="text-[9px] font-mono text-outline self-start uppercase">ENERGY: 75%</p>
</div>
<div class="bg-surface-container border border-outline-variant p-4">
<p class="text-[9px] font-mono text-outline mb-1 uppercase tracking-widest">SYSTEM_STATUS</p>
<p class="text-[11px] font-mono text-on-surface">CALCULATING_TRAJECTORY...</p>
</div>
</aside>
<!-- Center: Game Board -->
<section class="flex-1 flex flex-col gap-4 max-w-[800px]">
<!-- Board Header -->
<div class="flex justify-between items-end bg-surface-container p-4 border-b-2 border-primary">
<div>
<h2 class="font-headline text-xs text-secondary-container mb-1">VS AI — HARD</h2>
<p class="font-mono text-[10px] text-outline uppercase tracking-widest">MATCH_ID: #FF-990-2074</p>
</div>
<div class="flex items-center gap-6">
<div class="text-right">
<p class="font-mono text-[10px] text-outline uppercase">MOVE_COUNTER</p>
<p class="font-headline text-lg text-on-surface">14</p>
</div>
<button class="border border-error text-error px-4 py-2 font-headline text-[8px] hover:bg-error-container hover:text-on-error-container transition-all active:translate-y-[1px] uppercase">
                        ABORT_GAME
                    </button>
</div>
</div>
<!-- The Grid Area -->
<div class="bg-[#1a1a2e] p-4 border border-outline-variant grid-container">
<!-- Top Labels -->
<div class="col-start-2 flex justify-between px-1">
<span class="w-full text-center text-[9px] text-outline font-mono">A</span>
<span class="w-full text-center text-[9px] text-outline font-mono">B</span>
<span class="w-full text-center text-[9px] text-outline font-mono">C</span>
<span class="w-full text-center text-[9px] text-outline font-mono">D</span>
<span class="w-full text-center text-[9px] text-outline font-mono">E</span>
<span class="w-full text-center text-[9px] text-outline font-mono">F</span>
<span class="w-full text-center text-[9px] text-outline font-mono">G</span>
<span class="w-full text-center text-[9px] text-outline font-mono">H</span>
<span class="w-full text-center text-[9px] text-outline font-mono">I</span>
<span class="w-full text-center text-[9px] text-outline font-mono">J</span>
</div>
<!-- Left Labels -->
<div class="row-start-2 flex flex-col justify-between py-1">
<span class="h-full flex items-center text-[9px] text-outline font-mono">01</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">02</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">03</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">04</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">05</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">06</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">07</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">08</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">09</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">10</span>
</div>
<!-- Main Grid -->
<div class="col-start-2 row-start-2 grid grid-cols-10 grid-rows-10 border-l border-t border-[#2a2a4e]">
<!-- Tiles (Iterative generation mockup) -->
<!-- Row 1-4 random marks -->
<div class="aspect-square border-r border-b border-[#2a2a4e] flex items-center justify-center font-headline text-lg text-error text-glow-red">X</div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e] flex items-center justify-center font-headline text-lg text-primary text-glow-cyan">O</div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<!-- Winning Line (F3 to J3 Example) -->
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e] flex items-center justify-center font-headline text-lg text-primary text-glow-cyan">O</div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>
<div class="aspect-square border-r border-b border-[#2a2a4e] bg-[#f4a261]/20 border-2 border-secondary-container flex items-center justify-center font-headline text-lg text-secondary-container glow-amber">X</div>
<div class="aspect-square border-r border-b border-[#2a2a4e] bg-[#f4a261]/20 border-2 border-secondary-container flex items-center justify-center font-headline text-lg text-secondary-container glow-amber">X</div>
<div class="aspect-square border-r border-b border-[#2a2a4e] bg-[#f4a261]/20 border-2 border-secondary-container flex items-center justify-center font-headline text-lg text-secondary-container glow-amber">X</div>
<div class="aspect-square border-r border-b border-[#2a2a4e] bg-[#f4a261]/20 border-2 border-secondary-container flex items-center justify-center font-headline text-lg text-secondary-container glow-amber">X</div>
<div class="aspect-square border-r border-b border-[#2a2a4e] bg-[#f4a261]/20 border-2 border-secondary-container flex items-center justify-center font-headline text-lg text-secondary-container glow-amber">X</div>
<!-- Fill rest with empty tiles -->
<script>
                        for(let i=0; i<80; i++) {
                            document.write('<div class="aspect-square border-r border-b border-[#2a2a4e]"></div>');
                        }
                    </script>
</div>
<!-- Right Labels -->
<div class="row-start-2 col-start-3 flex flex-col justify-between py-1 px-1">
<span class="h-full flex items-center text-[9px] text-outline font-mono">01</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">02</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">03</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">04</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">05</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">06</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">07</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">08</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">09</span>
<span class="h-full flex items-center text-[9px] text-outline font-mono">10</span>
</div>
<!-- Bottom Labels -->
<div class="col-start-2 row-start-3 flex justify-between px-1">
<span class="w-full text-center text-[9px] text-outline font-mono">A</span>
<span class="w-full text-center text-[9px] text-outline font-mono">B</span>
<span class="w-full text-center text-[9px] text-outline font-mono">C</span>
<span class="w-full text-center text-[9px] text-outline font-mono">D</span>
<span class="w-full text-center text-[9px] text-outline font-mono">E</span>
<span class="w-full text-center text-[9px] text-outline font-mono">F</span>
<span class="w-full text-center text-[9px] text-outline font-mono">G</span>
<span class="w-full text-center text-[9px] text-outline font-mono">H</span>
<span class="w-full text-center text-[9px] text-outline font-mono">I</span>
<span class="w-full text-center text-[9px] text-outline font-mono">J</span>
</div>
</div>
</section>
<!-- Right Panel: AI Info -->
<aside class="w-[220px] flex flex-col gap-4 self-start mt-8">
<div class="bg-surface border border-outline-variant p-6 flex flex-col items-center gap-6 opacity-60">
<div class="w-32 h-32 border border-outline-variant bg-surface-container-highest flex items-center justify-center p-2 relative">
<img class="w-full h-full object-cover" data-alt="Pixel art robot icon for AI player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjjWXDmk_ynpCVfV9rNswZy3fWT8evjyzyGCQdSyLKWYrrzHdn-mlzTaE9eYBzfZ_hlMXa5kxLfxuZjoKtJ_pT8K0VU8yLEx0w4TwzqJxCK8yHyRClaXZQd_BvUHAIHNZ7JvvlAPRiw8PJJk66KWsd3wAX4QPoCcU-fQVQmToxL53bV2SzakK-jQ4WxSyB59QNBP9A9dH_mNj1oxsqAddHY1xrgdWWY9Xt0wHxXzjWEKxbrRRsthUm6DR8iQ8quvW_C5v10VQwQQQ7"/>
<div class="absolute bottom-0 right-0 bg-secondary-container text-on-secondary-container px-2 py-0.5 text-[8px] font-bold font-mono">HARD</div>
</div>
<div class="text-center">
<p class="font-headline text-[10px] text-outline tracking-tighter mb-2 uppercase">NEXUS-9</p>
<div class="text-primary font-headline text-5xl">O</div>
</div>
<div class="w-full h-1 bg-outline-variant">
<div class="w-1/2 h-full bg-outline"></div>
</div>
<p class="text-[9px] font-mono text-outline self-start uppercase">LATENCY: 4MS</p>
</div>
<div class="bg-surface-container border border-outline-variant p-4">
<p class="text-[9px] font-mono text-outline mb-1 uppercase tracking-widest">LOG_FEED</p>
<div class="space-y-1">
<p class="text-[9px] font-mono text-primary">&gt; ANALYZING_MOVE_14</p>
<p class="text-[9px] font-mono text-outline">&gt; RISK_DETECTED: 92%</p>
</div>
</div>
</aside>
</main>
<!-- Win Overlay (Hidden normally, rendered here for view) -->
<div class="fixed inset-0 z-[110] bg-surface-container-lowest/80 flex items-center justify-center">
<!-- Confetti Pixels -->
<div class="absolute inset-0 overflow-hidden pointer-events-none">
<div class="absolute top-10 left-1/4 w-3 h-3 bg-primary-container"></div>
<div class="absolute top-40 right-1/4 w-4 h-4 bg-secondary-container"></div>
<div class="absolute bottom-20 left-1/3 w-2 h-2 bg-error"></div>
<div class="absolute top-1/2 right-10 w-3 h-3 bg-tertiary"></div>
<div class="absolute bottom-1/4 right-1/3 w-4 h-4 bg-primary-container"></div>
</div>
<div class="bg-surface border-4 border-secondary-container p-12 max-w-2xl w-full text-center glow-amber relative">
<div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary px-6 py-2 font-headline text-sm uppercase">CONGRATULATIONS</div>
<h1 class="font-headline text-4xl text-secondary-container text-glow-amber mb-12 leading-relaxed">PLAYER 1<br/>WINS!</h1>
<div class="flex flex-col gap-4 items-center">
<button class="w-64 bg-primary-container text-on-primary font-headline text-xs py-5 chunky-offset-primary hover:translate-y-[2px] hover:shadow-none transition-all uppercase">
                    PLAY AGAIN
                </button>
<button class="w-64 border-2 border-outline-variant text-outline font-headline text-[10px] py-4 hover:border-primary hover:text-primary transition-all uppercase">
                    BACK TO LOBBY
                </button>
</div>
<div class="mt-12 pt-6 border-t border-outline-variant flex justify-between font-mono text-[10px] text-outline uppercase">
<span>REWARD: +50 CREDITS</span>
<span>WIN_STREAK: 3</span>
</div>
</div>
</div>
<!-- Footer Shell -->
<footer class="fixed bottom-0 w-full py-2 px-6 flex justify-between items-center bg-[#0d0d1a] border-t border-[#3d484d] z-50">
<div class="flex items-center gap-6">
<span class="font-mono text-[10px] uppercase tracking-tighter text-[#4cc9f0]">© 2074 NEON-REACH SYSTEMS. ALL RIGHTS RESERVED.</span>
</div>
<div class="flex gap-4">
<span class="font-mono text-[10px] uppercase tracking-tighter text-[#3d484d] hover:text-[#4cc9f0]">v1.0.4-STABLE</span>
<span class="font-mono text-[10px] uppercase tracking-tighter text-[#3d484d] hover:text-[#4cc9f0]">CORE_TEMP: 42C</span>
<span class="font-mono text-[10px] uppercase tracking-tighter text-[#4cc9f0]">CONNECTIVITY: OPTIMAL</span>
</div>
</footer>
</body></html>