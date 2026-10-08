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
    description: "Pick AI, Local, or Online.",
  },
  {
    step: 2,
    title: "Place X or O",
    description: "Make your moves on the board.",
  },
  {
    step: 3,
    title: "Connect 5 in a row",
    description: "First to line up 5 marks wins the game.",
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
  ],
};

import member1Photo from "@/assets/team/member-1.jpg";
import member2Photo from "@/assets/team/member-2.jpg";
import member3Photo from "@/assets/team/member-3.jpg";
import member4Photo from "@/assets/team/member-4.jpg";
import member5Photo from "@/assets/team/member-5.jpg";

// TODO: replace placeholder names/roles/GitHub links with the real ones before merging to main
export const TEAM_MEMBERS = [
  { id: 1, name: "Frank Khanh", role: "Project Lead", github: "https://github.com/KhanhQNguyn", photo: member1Photo },
  { id: 2, name: "Gia Phat", role: "Frontend Developer", github: "https://github.com/giaphat060206", photo: member2Photo },
  { id: 3, name: "Minh Thang", role: "Backend Lead", github: "https://github.com/ThangHoang54", photo: member3Photo },
  { id: 4, name: "Kiem Minh", role: "Backend Developer", github: "https://github.com/kiemminh000", photo: member4Photo },
  { id: 5, name: "Hoang Minh", role: "Scrum Master & QA", github: "https://github.com/Minz516", photo: member5Photo },
];

// TODO: replace with real player quotes before merging to main.
// avatar: served from client/public/avatars/ (NOT client/src/assets/ — a
// plain path string here, not a static import, so the build doesn't break
// before the real photos exist). Drop files named reviewer-1.jpg .. 6.jpg
// into client/public/avatars/ later; see the README there.
export const TESTIMONIALS = [
  { id: 1, name: "Alex Tran", role: "Casual Player", avatar: "/avatars/reviewer-1.jpg", quote: "The online matches feel instant — no lag, no fuss. My go-to break between classes." },
  { id: 2, name: "Priya Nair", role: "Weekend Grinder", avatar: "/avatars/reviewer-2.jpg", quote: "Finally a tic-tac-toe that doesn't get boring. The bigger boards actually make you think." },
  { id: 3, name: "Minh Khoa", role: "Local Arena Regular", avatar: "/avatars/reviewer-3.jpg", quote: "Playing against my roommate on the same screen is still the best way to end an argument." },
  { id: 4, name: "Sara Ibrahim", role: "Mobile Player", avatar: "/avatars/reviewer-4.jpg", quote: "Works great on my phone during commutes. Clean UI, zero sign-up friction to try it out." },
  { id: 5, name: "Daniel Vo", role: "AI Challenger", avatar: "/avatars/reviewer-5.jpg", quote: "Hard mode actually punishes mistakes. Took me a week to beat it consistently." },
  { id: 6, name: "Linh Pham", role: "Online Ranked", avatar: "/avatars/reviewer-6.jpg", quote: "Three themes, six marker styles — small touches, but they make every match feel fresh." },
];

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

// Dock is intentionally coarser than the page's section list: "Features",
// "Board Themes" and "Markers" are 3 separate full-screen sections on the
// page (unchanged), but share one "Features" entry here so the dock stays
// short. FAQ removed (07/10, page section also removed).
export const DOCK_SECTIONS = [
  { id: "welcome-top",   label: "Home",         icon: "home" },
  { id: "modes",         label: "Modes",         icon: "sports_esports" },
  { id: "how-to-play",   label: "How to Play",   icon: "menu_book" },
  { id: "features",      label: "Features",       icon: "star" },
  { id: "history",       label: "History",        icon: "history_edu" },
  { id: "team",          label: "Team",           icon: "groups" },
  { id: "testimonials",  label: "Reviews",        icon: "reviews" },
  { id: "feedback",      label: "Feedback",       icon: "feedback" },
  { id: "cta",           label: "Play Now",       icon: "play_arrow" },
];
