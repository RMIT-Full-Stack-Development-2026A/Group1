<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TTT // ONLINE ARENA</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&amp;family=IBM+Plex+Mono:wght@300;400;500;600;700&amp;family=Press+Start+2P&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "surface-bright": "#383847",
                "secondary-fixed": "#ffe171",
                "on-secondary-fixed": "#221b00",
                "on-primary": "#003543",
                "primary": "#93e2ff",
                "inverse-on-surface": "#2f2f3d",
                "outline-variant": "#3d484d",
                "outline": "#879398",
                "on-tertiary-fixed-variant": "#6f3800",
                "on-primary-fixed": "#001f28",
                "surface-dim": "#12121f",
                "surface-container-high": "#292937",
                "tertiary-fixed": "#ffdcc4",
                "on-tertiary-fixed": "#2f1400",
                "on-background": "#e3e0f4",
                "on-primary-fixed-variant": "#004e61",
                "on-tertiary": "#4e2600",
                "tertiary-container": "#fba866",
                "tertiary-fixed-dim": "#ffb780",
                "error": "#ffb4ab",
                "surface-tint": "#5bd5fc",
                "on-surface-variant": "#bcc8ce",
                "error-container": "#93000a",
                "surface-container-highest": "#343342",
                "surface-variant": "#343342",
                "background": "#12121f",
                "on-secondary-container": "#6d5a00",
                "tertiary": "#ffcca9",
                "on-surface": "#e3e0f4",
                "surface-container-lowest": "#0d0d1a",
                "primary-container": "#4cc9f0",
                "on-primary-container": "#005266",
                "on-tertiary-container": "#753b00",
                "surface-container": "#1e1e2c",
                "secondary-container": "#fad100",
                "primary-fixed-dim": "#5bd5fc",
                "on-secondary": "#3b2f00",
                "primary-fixed": "#b7eaff",
                "surface-container-low": "#1a1a28",
                "on-error": "#690005",
                "on-secondary-fixed-variant": "#554600",
                "secondary-fixed-dim": "#e9c400",
                "secondary": "#fff0c4",
                "surface": "#12121f",
                "inverse-surface": "#e3e0f4",
                "on-error-container": "#ffdad6",
                "inverse-primary": "#006780"
              },
              fontFamily: {
                "headline": ["'Press Start 2P'", "cursive"],
                "body": ["'IBM Plex Mono'", "monospace"],
                "label": ["'IBM Plex Mono'", "monospace"],
                "mono": ["'IBM Plex Mono'", "monospace"]
              },
              borderRadius: {
                "DEFAULT": "0px",
                "lg": "0px",
                "xl": "0px",
                "full": "0px"
              },
            },
          },
        }
    </script>
<style>
        .scanline {
            background: linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
            background-size: 100% 4px, 3px 100%;
            pointer-events: none;
        }
        .pixel-grid {
            background-image: radial-gradient(#3d484d 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .chunky-offset {
            box-shadow: 4px 4px 0px 0px #343342;
        }
        .chunky-offset-primary {
            box-shadow: 4px 4px 0px 0px #005266;
        }
        .glow-cyan {
            box-shadow: 0 0 12px #4cc9f0;
        }
        .glow-text-cyan {
            text-shadow: 0 0 8px #4cc9f0;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-surface-container-lowest text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col overflow-x-hidden">
<!-- Scanline Overlay -->
<div class="fixed inset-0 scanline z-50 opacity-20 pointer-events-none"></div>
<!-- TopNavBar -->
<nav class="flex justify-between items-center w-full px-6 py-4 bg-[#12121f] dark:bg-[#12121f] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] border-b-2 border-[#3d484d] sticky top-0 z-40">
<div class="flex items-center gap-8">
<span class="text-2xl font-black text-[#4cc9f0] dark:text-[#4cc9f0] [text-shadow:0_0_8px_#4cc9f0] font-mono uppercase tracking-tighter">TTT</span>
<div class="hidden md:flex gap-6 items-center">
<a class="font-mono uppercase tracking-tighter transition-all duration-75 active:translate-y-0.5 text-[#4cc9f0] opacity-80 hover:bg-[#1e1e2c] hover:text-[#4cc9f0] hover:shadow-[0_0_8px_#4cc9f0] px-2 py-1" href="#">Arcade</a>
<a class="font-mono uppercase tracking-tighter transition-all duration-75 active:translate-y-0.5 text-[#fad100] border-b-2 border-[#fad100] pb-1 hover:bg-[#1e1e2c] hover:shadow-[0_0_8px_#4cc9f0] px-2" href="#">Leaderboard</a>
<a class="font-mono uppercase tracking-tighter transition-all duration-75 active:translate-y-0.5 text-[#4cc9f0] opacity-80 hover:bg-[#1e1e2c] hover:text-[#4cc9f0] hover:shadow-[0_0_8px_#4cc9f0] px-2 py-1" href="#">Profile</a>
</div>
</div>
<div class="flex items-center gap-4">
<button class="material-symbols-outlined text-[#4cc9f0] hover:bg-[#1e1e2c] p-1 transition-all">settings</button>
<button class="material-symbols-outlined text-[#4cc9f0] hover:bg-[#1e1e2c] p-1 transition-all">terminal</button>
</div>
</nav>
<!-- Main Content Area -->
<main class="flex-grow flex flex-col md:flex-row p-6 gap-6 relative pixel-grid">
<!-- Left Sidebar: MY STATS -->
<aside class="w-full md:w-80 flex flex-col gap-6 z-10">
<section class="bg-surface border-2 border-outline-variant p-0 chunky-offset">
<div class="h-3 bg-primary-container w-full"></div>
<div class="p-4">
<h3 class="font-mono text-sm tracking-widest uppercase text-outline mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-xs">monitoring</span>
                        MY STATS
                    </h3>
<div class="space-y-4">
<div class="flex justify-between items-end border-b border-outline-variant pb-2">
<span class="text-xs text-on-surface-variant font-mono">WINS</span>
<span class="text-2xl font-bold text-primary-container glow-text-cyan">42</span>
</div>
<div class="flex justify-between items-end border-b border-outline-variant pb-2">
<span class="text-xs text-on-surface-variant font-mono">LOSSES</span>
<span class="text-2xl font-bold text-error">12</span>
</div>
<div class="flex justify-between items-end">
<span class="text-xs text-on-surface-variant font-mono">RANK</span>
<span class="text-lg font-bold text-secondary-container">#085 ELITE</span>
</div>
</div>
</div>
</section>
<section class="bg-surface-container border-2 border-outline-variant p-4">
<h4 class="font-mono text-[10px] tracking-tighter uppercase text-outline mb-3">Recent Activity</h4>
<div class="space-y-2 font-mono text-[10px]">
<div class="flex gap-2 text-primary-container">
<span>[14:22]</span>
<span>MATCH_WON vs USER_77</span>
</div>
<div class="flex gap-2 text-on-surface-variant">
<span>[14:05]</span>
<span>ENTERED_LOBBY_ARENA</span>
</div>
<div class="flex gap-2 text-tertiary-container">
<span>[13:58]</span>
<span>LEVEL_UP -&gt; LVL 14</span>
</div>
</div>
</section>
</aside>
<!-- Room Grid Section -->
<section class="flex-grow flex flex-col gap-6 z-10">
<!-- Header Area -->
<div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
<div class="flex flex-col gap-2">
<h1 class="font-headline text-2xl lg:text-3xl tracking-tighter text-on-surface">ONLINE ARENA</h1>
<div class="flex items-center gap-2">
<span class="w-2 h-2 bg-primary-container animate-pulse"></span>
<span class="font-mono text-sm text-primary-container tracking-widest">24 ONLINE</span>
</div>
</div>
<div class="flex gap-4">
<button class="bg-primary-container text-on-primary font-mono font-bold px-6 py-3 chunky-offset-primary hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-tighter flex items-center gap-2">
<span class="material-symbols-outlined">add_box</span>
                        CREATE ROOM
                    </button>
<button class="border-2 border-outline-variant text-on-surface font-mono font-bold px-6 py-3 chunky-offset hover:border-primary hover:text-primary transition-all uppercase tracking-tighter flex items-center gap-2">
<span class="material-symbols-outlined">bolt</span>
                        QUICK JOIN
                    </button>
</div>
</div>
<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Room Card 1 -->
<div class="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-0 flex flex-col transition-all hover:border-primary-container group">
<div class="flex justify-between items-center px-4 py-2 border-b-2 border-[#2a2a4e] bg-surface-container-high">
<span class="font-mono text-xs text-primary-container">ROOM #042</span>
<span class="font-mono text-[10px] text-on-surface-variant bg-surface-container-highest px-2">10x10</span>
</div>
<div class="p-4 flex-grow flex flex-col gap-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 border-2 border-primary-container flex items-center justify-center overflow-hidden bg-surface-container-highest">
<img alt="Player 1 Avatar" class="w-full h-full object-cover" data-alt="Pixel art avatar of a player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7HFgomn_wjRvffZ-c_WY2sk5JOJtfQRYhgwNRXqorsVkn-d9EDnm1E43Nq9jp0NRIWEwBl9k9d2tuxoRTC-tOWfXucHHztb8lVa1KdxXexhTMAYC_45v5BqEV19YOfbQe-KbtPnllwV0-VqbSNd5gj9WRmoPxdSBNAr-ttNPBlhkg2R4uI3f16GmChw8yzTssQUcgn84YTFbygPLrcMbBwmeYgfj1j4zuT56qKBnrdt7S_O5HlXBbYK0fVqN1Q_kE_eHOUyYlzXfD"/>
</div>
<div class="flex flex-col">
<span class="font-mono text-xs text-on-surface-variant uppercase">HOST</span>
<span class="font-mono text-sm font-bold text-primary-container">PLAYER_ONE</span>
</div>
</div>
<div class="flex items-center justify-center py-4 bg-surface-container-lowest border border-dashed border-outline-variant">
<span class="font-mono text-xs text-tertiary-container animate-pulse uppercase tracking-widest">Waiting for player...</span>
</div>
</div>
<div class="p-4 pt-0">
<button class="w-full border-2 border-primary-container text-primary-container py-2 font-mono font-bold hover:bg-primary-container hover:text-on-primary transition-all uppercase tracking-tighter chunky-offset-primary active:translate-y-0.5 active:shadow-none">JOIN</button>
</div>
</div>
<!-- Room Card 2 -->
<div class="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-0 flex flex-col transition-all hover:border-primary-container">
<div class="flex justify-between items-center px-4 py-2 border-b-2 border-[#2a2a4e] bg-surface-container-high">
<span class="font-mono text-xs text-primary-container">ROOM #045</span>
<span class="font-mono text-[10px] text-on-surface-variant bg-surface-container-highest px-2">15x15</span>
</div>
<div class="p-4 flex-grow flex flex-col gap-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 border-2 border-primary-container flex items-center justify-center overflow-hidden bg-surface-container-highest">
<img alt="Player 2 Avatar" class="w-full h-full object-cover" data-alt="Pixel art avatar of user neon_phantom" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKoGGiINzZ4f5CtOe_24xAKumLRwCA6kXS1rMCEbWonvjxNMsm_28urLdkNZNWXy3bI8lTUgTxGYVgNUWt9vlgObIRWpLEHCfzlz-KYimj42qb8ZtbdmyVOEAgoZ_gyJNRGSirb4EfwS7jAvN1ZFAiL0pCLu2VOkiQqTzXyJEBOrL9yUTOnd3Z6xRPWm4R3OjtUdOgmZFZ24lF5IrFqUMaoY3AUM3uA0c-1WYADBRniBzMXUw2G_XwqEcBt24ejdLh4P6vxCCyRt89"/>
</div>
<div class="flex flex-col">
<span class="font-mono text-xs text-on-surface-variant uppercase">HOST</span>
<span class="font-mono text-sm font-bold text-primary-container">NEON_PHANTOM</span>
</div>
</div>
<div class="flex items-center justify-center py-4 bg-surface-container-lowest border border-dashed border-outline-variant">
<span class="font-mono text-xs text-tertiary-container animate-pulse uppercase tracking-widest">Waiting for player...</span>
</div>
</div>
<div class="p-4 pt-0">
<button class="w-full border-2 border-primary-container text-primary-container py-2 font-mono font-bold hover:bg-primary-container hover:text-on-primary transition-all uppercase tracking-tighter chunky-offset-primary active:translate-y-0.5 active:shadow-none">JOIN</button>
</div>
</div>
<!-- Room Card 3 (FULL) -->
<div class="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-0 flex flex-col opacity-60 grayscale cursor-not-allowed">
<div class="flex justify-between items-center px-4 py-2 border-b-2 border-[#2a2a4e] bg-surface-container-high">
<span class="font-mono text-xs text-outline">ROOM #039</span>
<span class="font-mono text-[10px] text-on-surface-variant bg-surface-container-highest px-2">10x10</span>
</div>
<div class="p-4 flex-grow flex flex-col gap-4">
<div class="flex flex-col gap-2">
<div class="flex items-center gap-3">
<div class="w-8 h-8 border-2 border-outline-variant overflow-hidden bg-surface-container-highest">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Small pixel art avatar for a room host" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO7GzyT-UGV_1uVDMuQiMuEXl12NDytwrAdwXk9ah4QvEq0VPTtvyapY1KdLCpmvtQJ5bzbWJ8BkYxMm4sEgOcDaLOz2_rj0jQtWc6DIpIzz8gcvE2IyV0cbiL9aPdiXllGlKkLA51Bz0WGGFWQ8NRBfG_9S8mLtQdyLZy8DnPfGW6I71WiAwLMJC3ditK8S59eUlJGcKCACTOxJtMTjSVx5-q8VwdYWU9y8gVLRxUx6poFiOKhSUILISSceCYqmLANWhjaXCB-C3u"/>
</div>
<span class="font-mono text-[10px] text-on-surface-variant">HOST_X</span>
</div>
<div class="flex items-center gap-3">
<div class="w-8 h-8 border-2 border-outline-variant overflow-hidden bg-surface-container-highest">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Small pixel art avatar for an opponent" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeInkZKRjnGQ8u7o1NxBD9irizNUoS9Rgl3-rl_D1O1LwuQRUKZIMaX7zOeDWQCDtsOn89UnRmheS-sQ1wTDRckved723vMW_dVNMCAA3bD8eC5b2TG4Q10Mgfp_zVYDJogcw7Lsp9RwDaKPWFsnAmRL93kgRbbv2KBhW47Nyw6QnkfscXqJoCZtBRhOHl09tQmS8EDBKqDa2dEAnVIoxDI10ZK_im1RKvqd646OrNFC_b-cK0Rf5hYkB8G6J9dSJzPCzV8LHamcnR"/>
</div>
<span class="font-mono text-[10px] text-on-surface-variant">PLAYER_Y</span>
</div>
</div>
<div class="flex items-center justify-center py-2 bg-surface-container-highest">
<span class="font-mono text-xs text-on-surface-variant uppercase tracking-widest">MATCH IN PROGRESS</span>
</div>
</div>
<div class="p-4 pt-0">
<div class="w-full bg-outline-variant text-on-surface-variant py-2 font-mono text-center text-xs uppercase tracking-tighter">FULL</div>
</div>
</div>
<!-- Room Card 4 -->
<div class="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-0 flex flex-col transition-all hover:border-primary-container group">
<div class="flex justify-between items-center px-4 py-2 border-b-2 border-[#2a2a4e] bg-surface-container-high">
<span class="font-mono text-xs text-primary-container">ROOM #046</span>
<span class="font-mono text-[10px] text-on-surface-variant bg-surface-container-highest px-2">10x10</span>
</div>
<div class="p-4 flex-grow flex flex-col gap-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 border-2 border-primary-container flex items-center justify-center overflow-hidden bg-surface-container-highest">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Pixel art avatar for host CYBER_KING" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD8OxE23iTiexZ6lvNC6qDacw-eEVH5vsk0sAxUTR3CQcQ9syRzQYW9whkbd9rUcFWMCdCM0-eQIyqEURSA7hYha-i9H9LzgQqs7SNN0BJLjVes4KMj7xq0lVjm3C0sMtSuvqkMKzRHFrEYsRkGivcihZsqQJ3mOvgQkQBs3W4SQm4vTO6rDZdSaoby-HIsCONb6kaVbHpNiNfdm6HccYBEc-h_o_m9cVjTcxjbGu6-FxMAw7U2r8S3GTx7l3wAbAp0bhwcMYnFDV7"/>
</div>
<div class="flex flex-col">
<span class="font-mono text-xs text-on-surface-variant uppercase">HOST</span>
<span class="font-mono text-sm font-bold text-primary-container">CYBER_KING</span>
</div>
</div>
<div class="flex items-center justify-center py-4 bg-surface-container-lowest border border-dashed border-outline-variant">
<span class="font-mono text-xs text-tertiary-container animate-pulse uppercase tracking-widest">Waiting for player...</span>
</div>
</div>
<div class="p-4 pt-0">
<button class="w-full border-2 border-primary-container text-primary-container py-2 font-mono font-bold hover:bg-primary-container hover:text-on-primary transition-all uppercase tracking-tighter chunky-offset-primary active:translate-y-0.5 active:shadow-none">JOIN</button>
</div>
</div>
<!-- Room Card 5 -->
<div class="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-0 flex flex-col transition-all hover:border-primary-container group">
<div class="flex justify-between items-center px-4 py-2 border-b-2 border-[#2a2a4e] bg-surface-container-high">
<span class="font-mono text-xs text-primary-container">ROOM #047</span>
<span class="font-mono text-[10px] text-on-surface-variant bg-surface-container-highest px-2">15x15</span>
</div>
<div class="p-4 flex-grow flex flex-col gap-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 border-2 border-primary-container flex items-center justify-center overflow-hidden bg-surface-container-highest">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Pixel art avatar for user ZERO_COOL" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPAYeedDySC8VojF-BXhu_eawrwNkyc1cFiUz-V1uI5xiKlkofArKCEYpGetA9pKG5ie07et6g8I0WkF-LEBJXOR1vfJUjmlDUQbNf_DuWDP7SkpWKAfxmC7dyl-vl4siC42wr64WXmpYYrkpVpR8uMBA3EMSkZs3ku6cvELdbUwvuVavyNhWkUmCK6dC9pnYfu4aSGaTPPN3bh1IGyLvvwPpZAv0OZhfoZQvCd_pEkwRCxCco0LXQY31fxf-_NulMbE0ZFJ7ulyMm"/>
</div>
<div class="flex flex-col">
<span class="font-mono text-xs text-on-surface-variant uppercase">HOST</span>
<span class="font-mono text-sm font-bold text-primary-container">ZERO_COOL</span>
</div>
</div>
<div class="flex items-center justify-center py-4 bg-surface-container-lowest border border-dashed border-outline-variant">
<span class="font-mono text-xs text-tertiary-container animate-pulse uppercase tracking-widest">Waiting for player...</span>
</div>
</div>
<div class="p-4 pt-0">
<button class="w-full border-2 border-primary-container text-primary-container py-2 font-mono font-bold hover:bg-primary-container hover:text-on-primary transition-all uppercase tracking-tighter chunky-offset-primary active:translate-y-0.5 active:shadow-none">JOIN</button>
</div>
</div>
<!-- Room Card 6 -->
<div class="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-0 flex flex-col transition-all hover:border-primary-container group">
<div class="flex justify-between items-center px-4 py-2 border-b-2 border-[#2a2a4e] bg-surface-container-high">
<span class="font-mono text-xs text-primary-container">ROOM #048</span>
<span class="font-mono text-[10px] text-on-surface-variant bg-surface-container-highest px-2">10x10</span>
</div>
<div class="p-4 flex-grow flex flex-col gap-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 border-2 border-primary-container flex items-center justify-center overflow-hidden bg-surface-container-highest">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Pixel art avatar for user BIT_CRUSHER" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCw_l5pFuVqAtg6wCDdNz3gHlW6V7tfmDteoAXzZr0X5snOPwVaK5dtIIW3OWGI1m0uaMT1hN-0WWqDd0uqIocSL3oV7bYbPEHmYBjwZsMrO_d0lfKfCj994ncAP3S9a6-cz3KvNUVn64sKw6wjVEQ0tLxkYJsILDYxqoyvATlQJWpEphV4Oh8Jj5aAXsi8ZJjSOGkDQUaPHkFnb4Plouu9Jc5CotTVsIEGj7vMebu-verE4YcwheJhX0b1N2BNZT_ECM98FT0I6sX"/>
</div>
<div class="flex flex-col">
<span class="font-mono text-xs text-on-surface-variant uppercase">HOST</span>
<span class="font-mono text-sm font-bold text-primary-container">BIT_CRUSHER</span>
</div>
</div>
<div class="flex items-center justify-center py-4 bg-surface-container-lowest border border-dashed border-outline-variant">
<span class="font-mono text-xs text-tertiary-container animate-pulse uppercase tracking-widest">Waiting for player...</span>
</div>
</div>
<div class="p-4 pt-0">
<button class="w-full border-2 border-primary-container text-primary-container py-2 font-mono font-bold hover:bg-primary-container hover:text-on-primary transition-all uppercase tracking-tighter chunky-offset-primary active:translate-y-0.5 active:shadow-none">JOIN</button>
</div>
</div>
</div>
</section>
</main>
<!-- Footer -->
<footer class="flex justify-between items-center w-full px-6 py-3 border-t-2 border-[#3d484d] bg-[#0d0d1a] dark:bg-[#0d0d1a] z-40">
<span class="font-mono text-xs tracking-widest uppercase text-[#4cc9f0] opacity-60">© 2070 NEOTACK SYSTEMS // ALL RIGHTS RESERVED</span>
<div class="flex gap-6 items-center">
<span class="font-mono text-xs tracking-widest uppercase text-[#4cc9f0] opacity-60 flex items-center gap-2">
<span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                SYSTEM_STATUS: NOMINAL
            </span>
<span class="font-mono text-xs tracking-widest uppercase text-[#fad100] flex items-center gap-2">
<span class="material-symbols-outlined text-xs">lock</span>
                ENCRYPTION: ACTIVE
            </span>
<span class="font-mono text-xs tracking-widest uppercase text-[#4cc9f0] opacity-60">v4.0.2</span>
</div>
</footer>
</body></html>