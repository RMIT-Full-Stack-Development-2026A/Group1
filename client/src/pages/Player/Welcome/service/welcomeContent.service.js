/**
 * Welcome Page Content
 * Static copy/data for the /welcome landing-style page.
 * Content language: English only (standing rule, see docs/welcome-page-plan.md).
 * Kept independent from GameModeSelect's service — these mode cards are a
 * visual preview only, not a functional mode table (see docs/welcome-page-plan.md §4.4).
 */

export const MARQUEE_ITEMS = [
  "3 GAME MODES",
  "NO SIGN-UP REQUIRED TO TRY",
  "PLAYS GREAT ON MOBILE",
  "100% FREE",
];

// Each mode gets its own scripted win pattern so the 3 hover demos look
// visually distinct (see MiniBoardDemo.jsx): diagonal, column, bottom row.
export const MODE_PREVIEWS = [
  {
    id: "SINGLE_PLAYER",
    title: "SINGLE PLAYER",
    description: "Battle the AI across 3 difficulty levels.",
    accentColor: "#4cc9f0",
    icon: "smart_toy",
    script: [0, 1, 4, 2, 8], // X wins the diagonal
  },
  {
    id: "TWO_PLAYERS",
    title: "LOCAL ARENA",
    description: "Challenge a friend on the same machine.",
    accentColor: "#fad100",
    icon: "videogame_asset",
    script: [0, 1, 3, 2, 6], // X wins the left column
  },
  {
    id: "ONLINE_MATCH",
    title: "ONLINE LOBBY",
    description: "Enter the global network and climb the rankings.",
    accentColor: "#ffb780",
    icon: "public",
    script: [6, 0, 7, 1, 8], // X wins the bottom row
  },
];

export const HOW_TO_PLAY_STEPS = [
  {
    step: 1,
    title: "Choose a mode",
    description: "Pick AI, Local, or Online on the /play screen.",
  },
  {
    step: 2,
    title: "Place X or O",
    description: "Take turns marking empty cells on the board.",
  },
  {
    step: 3,
    title: "Connect 3 in a row",
    description: "First to line up 3 marks wins the match.",
  },
];

// icon values are Material Symbols ligature names — rendered with the
// `material-symbols-outlined` font class in FeatureGrid.jsx.
export const FEATURE_CARDS = [
  {
    id: "board-size",
    title: "10x10 & 15x15 BOARDS",
    description: "Massive tactical grids for unpredictable, drawn-out battles.",
    icon: "grid_on",
  },
  {
    id: "ai-levels",
    title: "3 AI LEVELS",
    description: "From rookie Easy bots to a master-tactician Hard mode.",
    icon: "settings",
  },
];

// TODO: replace with real milestones before merging to main
export const HISTORY_PLACEHOLDER = {
  id: "history",
  title: "DEVELOPMENT HISTORY",
  milestones: [
    { date: "2026-03", label: "Project kicked off" },
    { date: "2026-06", label: "Offline gameplay prototype" },
    { date: "2026-09", label: "Online multiplayer launched" },
    { date: "2026-10", label: "Welcome page shipped" },
  ],
};

// TODO: replace with real photos/GitHub handles before merging to main
export const TEAM_MEMBERS = [
  { id: 1, name: "Member Name 1", role: "Frontend", github: "https://github.com/", photo: null },
  { id: 2, name: "Member Name 2", role: "Backend", github: "https://github.com/", photo: null },
  { id: 3, name: "Member Name 3", role: "Design", github: "https://github.com/", photo: null },
  { id: 4, name: "Member Name 4", role: "QA", github: "https://github.com/", photo: null },
  { id: 5, name: "Member Name 5", role: "Project Lead", github: "https://github.com/", photo: null },
];

// 07/10: value now comes from the real backend (GET /games/stats/total),
// see ChallengeCounter.jsx + gameStats.service.js. Only the label is static.
export const CHALLENGE_STAT = {
  label: "Can you beat the AI on Hard?",
};

export const FAQ_ITEMS = [
  {
    question: "Is it free to play?",
    answer: "Yes, the core modes are completely free. Some extra features are part of the Premium plan.",
  },
  {
    question: "Do I need to create an account?",
    answer: "You need an account to save progress, play Online, and view your match history.",
  },
  {
    question: "What are the rules?",
    answer: "Connect 3 marks in a row — horizontally, vertically, or diagonally — before your opponent.",
  },
  {
    question: "Does it work on mobile?",
    answer: "Yes, the layout is fully responsive on both desktop and mobile.",
  },
];

export const DOCK_SECTIONS = [
  { id: "welcome-top", label: "Home", icon: "home" },
  { id: "modes", label: "Modes", icon: "sports_esports" },
  { id: "how-to-play", label: "How to Play", icon: "menu_book" },
  { id: "team", label: "Team", icon: "groups" },
  { id: "feedback", label: "Feedback", icon: "feedback" },
  { id: "faq", label: "FAQ", icon: "help" },
  { id: "cta", label: "Play Now", icon: "play_arrow" },
];
