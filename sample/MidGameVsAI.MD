<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TICTACTOANG // MATCH_ACTIVE</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700;900&amp;family=IBM+Plex+Mono:wght@300;400;700&amp;family=Press+Start+2P&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            background-color: #0d0d1a;
            color: #e3e0f4;
            overflow: hidden;
        }

        /* Scanline Texture Overlay */
        .scanlines {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to bottom,
                rgba(18, 16, 16, 0) 50%,
                rgba(0, 0, 0, 0.1) 50%
            );
            background-size: 100% 4px;
            z-index: 100;
            pointer-events: none;
        }

        /* Pixel Grid Texture */
        .pixel-grid {
            background-image: radial-gradient(circle, #3d484d 1px, transparent 1px);
            background-size: 24px 24px;
        }

        .crt-glow {
            text-shadow: 0 0 8px rgba(76, 201, 240, 0.6);
        }

        .pixel-font {
            font-family: 'Press Start 2P', cursive;
        }

        .mono-font {
            font-family: 'IBM Plex Mono', monospace;
        }

        .headline-font {
            font-family: 'Space Grotesk', sans-serif;
        }

        /* Material Icon Override */
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #0d0d1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3d484d;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "on-tertiary-fixed": "#2f1400",
                        "on-error-container": "#ffdad6",
                        "on-error": "#690005",
                        "on-surface-variant": "#bcc8ce",
                        "tertiary-container": "#fba866",
                        "inverse-primary": "#006780",
                        "surface": "#12121f",
                        "on-tertiary-container": "#753b00",
                        "tertiary": "#ffcca9",
                        "secondary-container": "#fad100",
                        "on-secondary-container": "#6d5a00",
                        "inverse-surface": "#e3e0f4",
                        "on-tertiary": "#4e2600",
                        "outline-variant": "#3d484d",
                        "surface-tint": "#5bd5fc",
                        "on-secondary-fixed": "#221b00",
                        "tertiary-fixed-dim": "#ffb780",
                        "surface-container-high": "#292937",
                        "surface-container": "#1e1e2c",
                        "error": "#ffb4ab",
                        "surface-container-highest": "#343342",
                        "error-container": "#93000a",
                        "on-primary-fixed-variant": "#004e61",
                        "on-tertiary-fixed-variant": "#6f3800",
                        "outline": "#879398",
                        "on-primary-fixed": "#001f28",
                        "on-primary-container": "#005266",
                        "on-background": "#e3e0f4",
                        "surface-dim": "#12121f",
                        "primary-fixed": "#b7eaff",
                        "on-surface": "#e3e0f4",
                        "secondary": "#fff0c4",
                        "on-primary": "#003543",
                        "surface-variant": "#343342",
                        "surface-container-low": "#1a1a28",
                        "surface-bright": "#383847",
                        "primary-fixed-dim": "#5bd5fc",
                        "on-secondary-fixed-variant": "#554600",
                        "primary": "#93e2ff",
                        "tertiary-fixed": "#ffdcc4",
                        "secondary-fixed-dim": "#e9c400",
                        "secondary-fixed": "#ffe171",
                        "surface-container-lowest": "#0d0d1a",
                        "primary-container": "#4cc9f0",
                        "on-secondary": "#3b2f00",
                        "background": "#12121f",
                        "inverse-on-surface": "#2f2f3d"
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
<body class="pixel-grid">
<div class="scanlines"></div>
<!-- Top Navigation (Shared Component Context) -->
<header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#12121f] border-b-2 border-[#3d484d] shadow-[0_0_8px_#4cc9f0]">
<div class="flex items-center gap-8">
<span class="text-xl font-black text-[#4cc9f0] tracking-tighter headline-font">TICTACTOANG</span>
<div class="flex items-center gap-4 mono-font text-[10px] tracking-widest">
<span class="text-[#4cc9f0] border-r border-[#3d484d] pr-4">VS AI — HARD</span>
<span class="text-slate-500">REF-990-0074</span>
</div>
</div>
<div class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
<span class="pixel-font text-[10px] text-[#fad100]">MOV_COUNT:</span>
<span class="pixel-font text-lg text-white">14</span>
</div>
<div class="flex items-center gap-4">
<button class="mono-font text-[10px] text-error border border-error px-4 py-2 hover:bg-error-container transition-all active:scale-95 duration-75 shadow-[2px_2px_0px_#93000a]">
                ABORT_GAME
            </button>
<div class="flex gap-2">
<span class="material-symbols-outlined text-slate-400 hover:text-[#4cc9f0] cursor-pointer">settings</span>
<span class="material-symbols-outlined text-slate-400 hover:text-[#4cc9f0] cursor-pointer">power_settings_new</span>
</div>
</div>
</header>
<!-- Side Navigation (Shared Component Context) -->
<aside class="fixed left-0 top-16 h-[calc(100vh-64px-32px)] z-40 flex flex-col bg-[#0d0d1a] border-r-2 border-[#3d484d] w-64 mono-font text-[10px]">
<div class="p-4 border-b border-[#3d484d] flex flex-col gap-1">
<div class="flex justify-between items-center">
<span class="text-[#fad100] font-bold">MATCH_STATUS</span>
<span class="material-symbols-outlined text-[#fad100] text-xs">memory</span>
</div>
<span class="text-slate-500 opacity-60">CORE_v2.0.74</span>
</div>
<nav class="flex-grow py-4">
<div class="bg-[#4cc9f0] text-[#003543] font-bold p-3 border-l-4 border-transparent flex items-center gap-3">
<span class="material-symbols-outlined text-sm">person</span>
<span>PLAYER_01</span>
</div>
<div class="text-[#4cc9f0] p-3 opacity-60 hover:bg-[#1e1e2c] border-l-4 border-transparent hover:border-[#4cc9f0] flex items-center gap-3 cursor-pointer">
<span class="material-symbols-outlined text-sm">smart_toy</span>
<span>SYSTEM_AI</span>
</div>
<div class="text-[#4cc9f0] p-3 opacity-60 hover:bg-[#1e1e2c] border-l-4 border-transparent hover:border-[#4cc9f0] flex items-center gap-3 cursor-pointer">
<span class="material-symbols-outlined text-sm">database</span>
<span>LOG_DATA</span>
</div>
<div class="text-[#4cc9f0] p-3 opacity-60 hover:bg-[#1e1e2c] border-l-4 border-transparent hover:border-[#4cc9f0] flex items-center gap-3 cursor-pointer">
<span class="material-symbols-outlined text-sm">memory</span>
<span>HARDWARE</span>
</div>
</nav>
<div class="p-4 mt-auto">
<button class="w-full bg-[#1e1e2c] text-error p-3 border border-[#3d484d] hover:bg-error-container transition-all">
                FORFEIT_MATCH
            </button>
</div>
</aside>
<!-- Main Game Workspace -->
<main class="ml-64 mt-16 pb-8 h-[calc(100vh-64px-32px)] flex">
<!-- Left Panel: Human Player -->
<section class="w-80 border-r border-[#3d484d] bg-[#12121f] p-6 flex flex-col items-center shadow-[inset_-8px_0_15px_-10px_#4cc9f0]">
<div class="w-32 h-32 border-2 border-[#4cc9f0] p-1 bg-[#0d0d1a] mb-6">
<img alt="Human Pixel Avatar" class="w-full h-full object-cover opacity-80" data-alt="Cyberpunk pixel art human avatar portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX7VW8IiIdHDfyW7WajSEXZPoy0hbDoozp4YQMhu_byf7nJv_CGuRdQGphcw9pxINPVnDEbWKQN0EOoO1y1T0d5-JxSLA5V2tLdNSMP0XJNUQ17rrbybs_oMSfvVdm3i1eiiNagPRFhXHbGeuQ_CtDIaOToQvbmzbh23iXyJJ9JWvdkiAfrv1vh5A0APRq0k3NuMn0qvsWI5jRMCYQrOxEc2PS3igx1DK4sleStTaYpB_iuktYwf8lpVGg3hB_QDuQsYabZ_N5wlWa"/>
</div>
<h2 class="pixel-font text-sm text-white mb-2">PLAYER_01</h2>
<div class="bg-primary-container text-on-primary font-bold px-3 py-1 text-[10px] tracking-widest mono-font mb-8 border border-white/20">
                ACTIVE_TURN
            </div>
<div class="flex-grow flex flex-col items-center justify-center">
<span class="pixel-font text-8xl text-error crt-glow">X</span>
<span class="mono-font text-[10px] text-slate-500 mt-4 tracking-[0.3em]">STRATEGIC_LEAD</span>
</div>
<div class="w-full mt-auto">
<div class="flex justify-between mono-font text-[9px] mb-2">
<span class="text-[#4cc9f0]">THINK_TIME</span>
<span class="text-white">00:42</span>
</div>
<div class="w-full h-1 bg-[#1e1e2c]">
<div class="h-full bg-[#4cc9f0] w-1/3 shadow-[0_0_4px_#4cc9f0]"></div>
</div>
</div>
</section>
<!-- Center: Game Grid -->
<section class="flex-grow bg-[#0d0d1a] flex flex-col items-center justify-center p-8 overflow-auto">
<div class="relative p-8 border-2 border-[#3d484d] bg-[#12121f]">
<!-- Column Labels -->
<div class="absolute top-0 left-8 right-8 h-8 flex items-center justify-between mono-font text-[10px] text-slate-500">
<span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span><span>I</span><span>J</span>
</div>
<!-- Row Labels -->
<div class="absolute left-0 top-8 bottom-8 w-8 flex flex-col items-center justify-between mono-font text-[10px] text-slate-500">
<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
</div>
<!-- 10x10 Grid -->
<div class="grid grid-cols-10 gap-1 bg-[#3d484d]">
<!-- Repeat for 100 tiles, simplified for logic -->
<!-- Row 1 -->
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<!-- Row 2: Contains Player X's -->
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"><span class="pixel-font text-error text-xl">X</span></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"><span class="pixel-font text-error text-xl">X</span></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"><span class="pixel-font text-error text-xl">X</span></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<!-- Row 3: Hover Faint Glow -->
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1e1e2c] border border-[#4cc9f0]/30 flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<!-- Row 4-7 Mixed with AI O's Diagonal -->
<!-- Filling up remaining grid cells -->
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"><span class="pixel-font text-[#4cc9f0] text-xl">O</span></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"><span class="pixel-font text-[#4cc9f0] text-xl">O</span></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"><span class="pixel-font text-[#4cc9f0] text-xl">O</span></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"><span class="pixel-font text-[#4cc9f0] text-xl">O</span></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<div class="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center"></div>
<!-- Empty Remaining Rows 8-10 -->
<!-- [Visual Filler for Grid Consistency] -->
<div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div>
<div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div>
<div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div><div class="w-12 h-12 bg-[#1a1a2e]"></div>
</div>
</div>
<div class="mt-8 flex gap-4">
<div class="bg-surface-container border border-[#3d484d] px-4 py-2 flex items-center gap-2 mono-font text-[10px]">
<span class="text-[#fad100]">COORD:</span>
<span class="text-white">D3</span>
</div>
<div class="bg-surface-container border border-[#3d484d] px-4 py-2 flex items-center gap-2 mono-font text-[10px]">
<span class="text-[#fad100]">STATUS:</span>
<span class="text-white">WAITING_FOR_INPUT...</span>
</div>
</div>
</section>
<!-- Right Panel: AI Opponent -->
<section class="w-80 border-l border-[#3d484d] bg-[#12121f] p-6 flex flex-col items-center">
<div class="w-32 h-32 border-2 border-slate-700 p-1 bg-[#0d0d1a] mb-6 grayscale opacity-40">
<img alt="AI Pixel Avatar" class="w-full h-full object-cover" data-alt="Brutalistic pixel art robot head avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbYB1Ne4MTqq3DU0fm7-dMmYxpdvqz4d6F60sllz6lz5rgaHnt6Zm5AATeWWpAasuqqjsqoz9zyRIEc7bo1NOyX8xdhGywGC43o0RLLq-v3CvgQKXY1DyAg8jpiO7Cx2WwbirI1dckEKc_8k5gP0EEVYS3BtwKi7djqxCI58_BbsRlYc9Vit3kefjQYwP9HxfCQWudGcK-AWYqHKizrSCWUoDwtvWBTTPcd7HfiBdffLouv-bPd4DC5j7GqL8aIL79Ox149NVeTzwt"/>
</div>
<h2 class="pixel-font text-sm text-slate-400 mb-2">NEXUS-9</h2>
<div class="bg-error-container text-on-error-container font-bold px-3 py-1 text-[10px] tracking-widest mono-font mb-4 border border-white/10">
                HARD
            </div>
<div class="flex flex-col items-center justify-center py-4">
<span class="pixel-font text-8xl text-[#4cc9f0] opacity-50">O</span>
<span class="mono-font text-[10px] text-tertiary-container mt-4 flicker">ANALYZING...</span>
</div>
<div class="w-full mt-8 bg-[#0d0d1a] border border-[#3d484d] flex-grow flex flex-col">
<div class="bg-[#1e1e2c] border-b border-[#3d484d] p-2 flex items-center justify-between">
<span class="mono-font text-[9px] text-slate-500">LOG_FEED</span>
<span class="material-symbols-outlined text-[10px] text-slate-500">terminal</span>
</div>
<div class="p-3 flex-grow overflow-y-auto custom-scrollbar mono-font text-[9px] space-y-2">
<div class="text-[#4cc9f0]/60">&gt; ANALYZING MOVE_37</div>
<div class="text-[#4cc9f0]/60">&gt; ADV_STRATEGY_02</div>
<div class="text-slate-600">&gt; HEURISTIC_MATCH_FOUND: 88%</div>
<div class="text-slate-600">&gt; CALCULATING_OFFSET...</div>
<div class="text-slate-700">&gt; THREAD_IDLE_WAIT</div>
</div>
</div>
</section>
</main>
<!-- Footer (Shared Component Context) -->
<footer class="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-4 h-8 bg-[#0d0d1a] border-t border-[#3d484d] mono-font text-[8px] uppercase">
<div class="flex gap-4">
<span class="text-slate-500">(C) 2074 NEON_ARCADE_SYSTEMS</span>
<span class="text-slate-500 hidden md:block">LOC: SECTOR_G / TERMINAL_42</span>
</div>
<div class="flex gap-4">
<a class="text-slate-600 hover:text-white transition-opacity duration-300" href="#">TERMS</a>
<a class="text-slate-600 hover:text-white transition-opacity duration-300" href="#">PRIVACY</a>
<a class="text-[#4cc9f0] hover:text-white transition-opacity duration-300" href="#">DEBUG_MODE</a>
</div>
</footer>
<style>
        @keyframes flicker {
            0% { opacity: 1; }
            5% { opacity: 0.8; }
            10% { opacity: 1; }
            15% { opacity: 0.9; }
            50% { opacity: 0.95; }
            55% { opacity: 0.4; }
            60% { opacity: 0.95; }
            95% { opacity: 1; }
            100% { opacity: 0.9; }
        }
        .flicker {
            animation: flicker 4s infinite linear;
        }
    </style>
</body></html>