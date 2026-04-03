<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TIC-TAC-TOANG | MATCH REPLAY</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;family=IBM+Plex+Mono:wght@400;500;600;700&amp;family=Space+Grotesk:wght@300..700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            background-color: #0d0d1a;
            background-image: 
                linear-gradient(rgba(18, 18, 31, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
                linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
            background-size: 100% 2px, 3px 100%;
            cursor: crosshair;
        }
        .pixel-grid {
            background-image: radial-gradient(circle, #3d484d 1px, transparent 1px);
            background-size: 24px 24px;
        }
        .scanline-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
            background-size: 100% 3px, 3px 100%;
            pointer-events: none;
            z-index: 100;
        }
        .chunky-shadow {
            box-shadow: 2px 2px 0px 0px #1e1e2c;
        }
        .active-glow {
            box-shadow: 0px 0px 8px #4cc9f0;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "secondary": "#fff0c4",
                        "on-surface": "#e3e0f4",
                        "surface-container": "#1e1e2c",
                        "on-surface-variant": "#bcc8ce",
                        "primary-container": "#4cc9f0",
                        "on-background": "#e3e0f4",
                        "secondary-container": "#fad100",
                        "outline-variant": "#3d484d",
                        "surface-dim": "#12121f",
                        "surface-container-low": "#1a1a28",
                        "on-primary-container": "#005266",
                        "surface-variant": "#343342",
                        "surface": "#12121f",
                        "primary": "#93e2ff",
                        "error-container": "#93000a",
                        "on-primary": "#003543",
                        "outline": "#879398",
                        "surface-container-highest": "#343342",
                        "inverse-on-surface": "#2f2f3d"
                    },
                    fontFamily: {
                        "headline": ["'Press Start 2P'", "cursive"],
                        "body": ["'IBM Plex Mono'", "monospace"],
                        "label": ["'IBM Plex Mono'", "monospace"]
                    },
                    borderRadius: { "DEFAULT": "0px", "lg": "0px", "xl": "0px", "full": "0px" },
                },
            },
        }
    </script>
</head>
<body class="font-body text-on-surface min-h-screen flex flex-col">
<div class="scanline-overlay"></div>
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#12121f] border-t-4 border-[#4cc9f0] border-b border-[#3d484d] flat no shadows">
<div class="flex items-center gap-8">
<span class="font-['Press_Start_2P'] text-xl text-[#4cc9f0] [text-shadow:0_0_8px_#4cc9f0]">TIC-TAC-TOANG</span>
<nav class="hidden md:flex gap-6">
<a class="font-['IBM_Plex_Mono'] uppercase tracking-widest text-xs text-[#3d484d] hover:text-[#4cc9f0] transition-colors" href="#">ARCADE</a>
<a class="font-['IBM_Plex_Mono'] uppercase tracking-widest text-xs text-[#3d484d] hover:text-[#4cc9f0] transition-colors" href="#">LEADERBOARD</a>
<a class="font-['IBM_Plex_Mono'] uppercase tracking-widest text-xs text-[#3d484d] hover:text-[#4cc9f0] transition-colors" href="#">PROFILE</a>
</nav>
</div>
<div class="flex items-center gap-4">
<button class="material-symbols-outlined text-[#3d484d] hover:text-[#4cc9f0] transition-colors">settings</button>
<button class="material-symbols-outlined text-[#3d484d] hover:text-[#4cc9f0] transition-colors">terminal</button>
</div>
</header>
<main class="flex-1 mt-16 mb-10 px-8 py-6 flex flex-col items-center pixel-grid">
<!-- Page Title & Match Header -->
<div class="w-full max-w-[1280px] flex justify-between items-end mb-8 border-b border-outline-variant pb-4">
<div class="flex flex-col gap-2">
<div class="flex items-center gap-4">
<h1 class="font-headline text-2xl text-on-surface uppercase tracking-tight">MATCH REPLAY</h1>
<span class="bg-secondary-container text-on-secondary px-3 py-1 flex items-center gap-2 text-[10px] font-bold border-2 border-on-secondary-container chunky-shadow">
<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                        PREMIUM
                    </span>
</div>
<p class="text-primary tracking-widest text-sm font-bold">
                    PLAYER_01 <span class="text-outline mx-2">VS</span> NEXUS-9 <span class="text-outline mx-4">|</span> 2074.05.22 <span class="text-outline mx-4">|</span> RESULT: <span class="text-error-container bg-error-container/20 px-2 uppercase">LOSS</span>
</p>
</div>
<div class="text-right flex flex-col items-end">
<span class="text-[10px] text-outline mb-1 uppercase tracking-tighter">System ID: 882-XQ-90</span>
<div class="h-1 w-32 bg-surface-container-highest">
<div class="h-full w-2/3 bg-primary-container"></div>
</div>
</div>
</div>
<div class="w-full max-w-[1280px] grid grid-cols-12 gap-8 items-start">
<!-- Left: Replay Area -->
<div class="col-span-12 lg:col-span-8 flex flex-col items-center">
<!-- 10x10 Game Board -->
<div class="relative p-8 bg-surface-container border border-outline-variant chunky-shadow">
<!-- Column Labels -->
<div class="absolute top-0 left-8 right-8 h-8 flex justify-around items-center text-[10px] text-outline font-bold">
<span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span><span>I</span><span>J</span>
</div>
<!-- Row Labels -->
<div class="absolute left-0 top-8 bottom-8 w-8 flex flex-col justify-around items-center text-[10px] text-outline font-bold">
<span>10</span><span>9</span><span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
</div>
<div class="grid grid-cols-10 grid-rows-10 border border-outline-variant">
<!-- Board Cells (Simplified loop representation) -->
<!-- Row 1-10... representing the 10x10 grid -->
<!-- Cell Example -->
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative hover:bg-surface-container-highest transition-colors"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative">
<span class="font-headline text-2xl text-error-container [text-shadow:0_0_8px_#93000a]">X</span>
<span class="absolute top-0.5 right-0.5 text-[8px] bg-white text-black px-0.5">01</span>
</div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<!-- Row 2 -->
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative">
<span class="font-headline text-2xl text-primary-container [text-shadow:0_0_8px_#4cc9f0]">O</span>
<span class="absolute top-0.5 right-0.5 text-[8px] bg-white text-black px-0.5">02</span>
</div>
<!-- ... (Filling space to maintain grid visual) -->
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<!-- Row 5 Center Interaction -->
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative border-2 border-primary-container z-10">
<span class="font-headline text-2xl text-error-container [text-shadow:0_0_8px_#93000a]">X</span>
<span class="absolute top-0.5 right-0.5 text-[8px] bg-white text-black px-0.5">13</span>
</div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative border-2 border-primary-container z-10 active-glow">
<span class="font-headline text-2xl text-primary-container [text-shadow:0_0_8px_#4cc9f0]">O</span>
<span class="absolute top-0.5 right-0.5 text-[8px] bg-white text-black px-0.5">14</span>
</div>
<!-- ... rest of grid ... -->
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e] flex items-center justify-center relative"></div>
<!-- Generating dummy rows for layout completeness -->
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div>
<div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div><div class="w-12 h-12 border border-[#2a2a4e] bg-[#1a1a2e]"></div>
</div>
</div>
<!-- Replay Controls -->
<div class="mt-10 w-full bg-surface p-6 border border-outline-variant chunky-shadow">
<!-- Progress Bar -->
<div class="mb-6 flex items-center gap-4">
<span class="text-[10px] text-outline font-bold">MOVE 14</span>
<div class="flex-1 h-3 bg-surface-container-highest border border-outline relative">
<div class="absolute inset-y-0 left-0 bg-primary-container" style="width: 46%;"></div>
<div class="absolute inset-y-0 left-[46%] w-1 bg-white active-glow z-10"></div>
</div>
<span class="text-[10px] text-outline font-bold">MOVE 30</span>
</div>
<div class="flex justify-between items-center">
<div class="flex gap-2">
<button class="w-10 h-10 bg-surface-container border border-outline flex items-center justify-center chunky-shadow hover:bg-surface-container-high active:translate-x-0.5 active:translate-y-0.5 transition-all">
<span class="material-symbols-outlined text-on-surface">first_page</span>
</button>
<button class="w-10 h-10 bg-surface-container border border-outline flex items-center justify-center chunky-shadow hover:bg-surface-container-high active:translate-x-0.5 active:translate-y-0.5 transition-all">
<span class="material-symbols-outlined text-on-surface">chevron_left</span>
</button>
<button class="w-12 h-12 bg-primary-container border border-outline-variant flex items-center justify-center chunky-shadow hover:active-glow active:translate-x-0.5 active:translate-y-0.5 transition-all">
<span class="material-symbols-outlined text-on-primary">play_arrow</span>
</button>
<button class="w-10 h-10 bg-surface-container border border-outline flex items-center justify-center chunky-shadow hover:bg-surface-container-high active:translate-x-0.5 active:translate-y-0.5 transition-all">
<span class="material-symbols-outlined text-on-surface">chevron_right</span>
</button>
<button class="w-10 h-10 bg-surface-container border border-outline flex items-center justify-center chunky-shadow hover:bg-surface-container-high active:translate-x-0.5 active:translate-y-0.5 transition-all">
<span class="material-symbols-outlined text-on-surface">last_page</span>
</button>
</div>
<div class="flex gap-1">
<button class="px-3 py-1 bg-surface-container-highest border border-outline text-[10px] font-bold text-outline hover:text-on-surface">1X</button>
<button class="px-3 py-1 bg-secondary-container border border-on-secondary-container text-[10px] font-bold text-on-secondary chunky-shadow">2X</button>
<button class="px-3 py-1 bg-surface-container-highest border border-outline text-[10px] font-bold text-outline hover:text-on-surface">4X</button>
</div>
</div>
</div>
</div>
<!-- Right: Move Log -->
<div class="col-span-12 lg:col-span-4 flex flex-col h-full">
<div class="flex flex-col h-full bg-surface border border-outline-variant chunky-shadow">
<div class="h-10 bg-primary-container flex items-center px-4 justify-between">
<span class="text-on-primary font-bold text-[10px] uppercase tracking-widest">MOVE_LOG</span>
<span class="text-on-primary font-bold text-[10px]">V_2.7.4</span>
</div>
<div class="p-4 flex-1 overflow-y-auto no-scrollbar font-body text-sm space-y-1">
<div class="flex justify-between text-outline/50 border-b border-outline-variant/30 pb-1 mb-2">
<span>#</span><span>P1 (X)</span><span>P2 (O)</span>
</div>
<div class="flex justify-between hover:bg-surface-container-highest px-2 py-1 transition-colors">
<span class="text-outline w-8">01</span><span class="flex-1">d10</span><span class="flex-1">c9</span>
</div>
<div class="flex justify-between hover:bg-surface-container-highest px-2 py-1 transition-colors">
<span class="text-outline w-8">02</span><span class="flex-1">e10</span><span class="flex-1">f10</span>
</div>
<div class="flex justify-between hover:bg-surface-container-highest px-2 py-1 transition-colors">
<span class="text-outline w-8">03</span><span class="flex-1">e9</span><span class="flex-1">d9</span>
</div>
<div class="flex justify-between hover:bg-surface-container-highest px-2 py-1 transition-colors">
<span class="text-outline w-8">04</span><span class="flex-1">f9</span><span class="flex-1">g9</span>
</div>
<div class="flex justify-between hover:bg-surface-container-highest px-2 py-1 transition-colors">
<span class="text-outline w-8">05</span><span class="flex-1">e8</span><span class="flex-1">e7</span>
</div>
<div class="flex justify-between hover:bg-surface-container-highest px-2 py-1 transition-colors">
<span class="text-outline w-8">06</span><span class="flex-1">f8</span><span class="flex-1">g8</span>
</div>
<div class="flex justify-between bg-primary-container/10 border-l-2 border-primary-container px-2 py-1 transition-colors group">
<span class="text-primary w-8">07</span><span class="flex-1 text-on-surface">e5</span><span class="flex-1 text-primary-container font-bold [text-shadow:0_0_4px_#4cc9f0]">f6</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">08</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">09</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">10</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">11</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">12</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">13</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">14</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
<div class="flex justify-between opacity-30 px-2 py-1">
<span class="text-outline w-8">15</span><span class="flex-1">--</span><span class="flex-1">--</span>
</div>
</div>
<div class="p-4 bg-surface-container-low border-t border-outline-variant">
<div class="flex items-center justify-between mb-4">
<span class="text-[10px] text-outline">AUTO-ANALYZE</span>
<div class="w-8 h-4 bg-primary-container/20 border border-primary-container flex items-center px-0.5">
<div class="w-2.5 h-2.5 bg-primary-container"></div>
</div>
</div>
<button class="w-full py-2 bg-surface-container-highest border border-outline text-[10px] font-bold text-on-surface hover:bg-surface-container-high chunky-shadow uppercase tracking-widest active:translate-x-0.5 active:translate-y-0.5 transition-all">
                            Export PGN
                        </button>
</div>
</div>
</div>
</div>
</main>
<!-- Footer -->
<footer class="fixed bottom-0 w-full flex justify-between items-center px-4 py-2 bg-[#0d0d1a] border-t border-[#3d484d] z-50">
<div class="flex items-center gap-6">
<span class="font-['IBM_Plex_Mono'] text-[10px] tracking-tighter text-[#3d484d]">© 2070 NEO-ANALOG SYSTEMS</span>
<div class="flex gap-4">
<span class="font-['IBM_Plex_Mono'] text-[10px] tracking-tighter text-[#3d484d] hover:text-[#4cc9f0] cursor-default uppercase">SYSTEM STATUS: OPTIMAL</span>
<span class="font-['IBM_Plex_Mono'] text-[10px] tracking-tighter text-[#3d484d] hover:text-[#4cc9f0] cursor-default uppercase">ENCRYPTION: ACTIVE</span>
</div>
</div>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
<span class="font-['IBM_Plex_Mono'] text-[10px] tracking-tighter text-[#4cc9f0] uppercase">LIVE UPLINK</span>
</div>
</footer>
</body></html>