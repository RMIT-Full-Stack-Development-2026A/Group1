import React, { useState } from "react";

export default function PlayerProfile() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState("ALL RESULTS");
  const [filterGameType, setFilterGameType] = useState("GAME TYPE");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data
  const playerData = {
    username: "PLAYER_01",
    isPremium: true,
    country: "USA",
    level: 42,
    playerId: "88-BF-9021",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkmMltbh3xFeUIqkLXTmWE1kJXbQgg5eVaLBpyZeERt0SROAkLOaHvXiGk7T25LETp18XnvJDsuGHowbSb7X9b0GfQjLMgDna1HzIERXvKWOAmle0hLUWOqah5G8jq9KPiwB86R5OD_Eq_wPgZteur-6pCVnpkA_zFiGGasFvV_kzE-0Drb4oOy-usa1WIOBueanyK6B39HwmsoKFwuYUx7jnWHvlESiv2z29b-ySd5TQG2ZnCBywAy_TYMmAkB0AasFRhxe--MeHZ",
    stats: {
      wins: 1204,
      losses: 432,
      draws: 156,
      winRate: 74.2,
    },
  };

  const matchHistory = [
    {
      id: "0842",
      date: "2070.10.24 14:22",
      gameType: "TURBO 5X5",
      opponent: "CYBER_PUNK_42",
      result: "WIN",
      duration: "02:45",
      canReplay: true,
    },
    {
      id: "0841",
      date: "2070.10.24 14:10",
      gameType: "CLASSIC 3X3",
      opponent: "X_TERMINATOR_X",
      result: "LOSS",
      duration: "01:12",
      canReplay: true,
    },
    {
      id: "0840",
      date: "2070.10.23 23:58",
      gameType: "CLASSIC 3X3",
      opponent: "BOT_LEVEL_MAX",
      result: "ABORT",
      duration: "00:05",
      canReplay: false,
    },
    {
      id: "0839",
      date: "2070.10.23 22:15",
      gameType: "TURBO 5X5",
      opponent: "NEO_TOKYO_QUEEN",
      result: "WIN",
      duration: "04:30",
      canReplay: true,
    },
  ];

  const getResultColor = (result) => {
    switch (result) {
      case "WIN":
        return "bg-primary-container/20 text-primary-container border-primary-container/40";
      case "LOSS":
        return "bg-error-container/20 text-error-container border-error-container/40";
      case "ABORT":
        return "bg-surface-container-highest text-outline border-outline/40";
      default:
        return "";
    }
  };

  const getOpponentColor = (result) => {
    switch (result) {
      case "WIN":
        return "text-primary";
      case "LOSS":
        return "text-error";
      default:
        return "text-outline";
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto p-8 space-y-8">
      {/* Profile Header */}
      <section className="bg-surface-container border border-outline-variant p-6 relative flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-primary-container"></div>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 border-2 border-primary-container p-1 bg-surface-container-lowest">
            <img
              alt="Player Avatar"
              className="w-full h-full grayscale contrast-125 brightness-110"
              src={playerData.avatarUrl}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="font-arcade text-2xl text-on-surface">
                {playerData.username}
              </h2>
              {playerData.isPremium && (
                <div className="flex items-center bg-secondary-container px-2 py-1 gap-1">
                  <span
                    className="material-symbols-outlined text-xs text-on-secondary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                  <span className="text-[10px] font-bold text-on-secondary-container uppercase tracking-tighter">
                    PREMIUM
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-outline font-bold text-xs uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">flag</span>
                {playerData.country}
              </span>
              <span className="text-primary">LVL {playerData.level}</span>
              <span className="text-[#3d484d]">ID: {playerData.playerId}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="border border-outline text-xs px-4 py-2 hover:bg-surface-container-highest transition-all duration-75 active:translate-y-[2px] font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span>
            EDIT PROFILE
          </button>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* WINS */}
        <div className="bg-surface-container border border-outline-variant p-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-primary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              WINS
            </p>
            <span className="material-symbols-outlined text-primary-container opacity-50">
              trending_up
            </span>
          </div>
          <p className="font-arcade text-3xl text-primary-container">
            {playerData.stats.wins.toLocaleString()}
          </p>
          <div className="mt-2 h-1 bg-surface-container-highest w-full">
            <div className="h-full bg-primary-container w-[75%]"></div>
          </div>
        </div>

        {/* LOSSES */}
        <div className="bg-surface-container border border-outline-variant p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-error-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              LOSSES
            </p>
            <span className="material-symbols-outlined text-error-container opacity-50">
              trending_down
            </span>
          </div>
          <p className="font-arcade text-3xl text-error-container">
            {playerData.stats.losses.toLocaleString()}
          </p>
          <div className="mt-2 h-1 bg-surface-container-highest w-full">
            <div className="h-full bg-error-container w-[25%]"></div>
          </div>
        </div>

        {/* DRAWS */}
        <div className="bg-surface-container border border-outline-variant p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-outline"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              DRAWS
            </p>
            <span className="material-symbols-outlined text-outline opacity-50">
              balance
            </span>
          </div>
          <p className="font-arcade text-3xl text-outline">
            {playerData.stats.draws.toLocaleString()}
          </p>
          <div className="mt-2 h-1 bg-surface-container-highest w-full">
            <div className="h-full bg-outline w-[10%]"></div>
          </div>
        </div>

        {/* WIN RATE */}
        <div className="bg-surface-container border border-outline-variant p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-tertiary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              WIN RATE
            </p>
            <span className="material-symbols-outlined text-tertiary-container opacity-50">
              star
            </span>
          </div>
          <p className="font-arcade text-3xl text-tertiary-container">
            {playerData.stats.winRate}%
          </p>
          <div className="mt-2 h-1 bg-surface-container-highest w-full flex gap-1">
            <div className="h-full bg-tertiary-container flex-grow"></div>
            <div className="h-full bg-tertiary-container flex-grow"></div>
            <div className="h-full bg-tertiary-container flex-grow"></div>
            <div className="h-full bg-surface-container-highest flex-grow"></div>
          </div>
        </div>
      </section>

      {/* Match History Table Section */}
      <section className="bg-surface-container border border-outline-variant flex flex-col">
        {/* Table Header Area */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-outline-variant pixel-grid">
          <h3 className="font-arcade text-lg text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container">
              history
            </span>
            MATCH HISTORY
          </h3>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <input
                className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary-container outline-none px-4 py-2 text-xs font-body text-on-surface placeholder:text-outline-variant uppercase"
                placeholder="Search opponent or room..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-2 top-2 text-outline text-sm">
                search
              </span>
            </div>
            <select
              className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-outline focus:border-primary-container appearance-none"
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
            >
              <option>ALL RESULTS</option>
              <option>WIN</option>
              <option>LOSS</option>
              <option>ABORT</option>
            </select>
            <select
              className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-outline focus:border-primary-container appearance-none"
              value={filterGameType}
              onChange={(e) => setFilterGameType(e.target.value)}
            >
              <option>GAME TYPE</option>
              <option>CLASSIC 3X3</option>
              <option>TURBO 5X5</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest text-outline text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">GAME TYPE</th>
                <th className="px-6 py-4">OPPONENT</th>
                <th className="px-6 py-4">RESULT</th>
                <th className="px-6 py-4">DURATION</th>
                <th className="px-6 py-4 text-right">REPLAY</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium uppercase tracking-tight divide-y divide-outline-variant/30">
              {matchHistory.map((match) => (
                <tr
                  key={match.id}
                  className="hover:bg-surface-container-highest/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-outline font-arcade text-[8px]">
                    {match.id}
                  </td>
                  <td className="px-6 py-4">{match.date}</td>
                  <td className="px-6 py-4">{match.gameType}</td>
                  <td className={`px-6 py-4 ${getOpponentColor(match.result)}`}>
                    {match.opponent}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`${getResultColor(
                        match.result
                      )} px-2 py-1 border`}
                    >
                      {match.result}
                    </span>
                  </td>
                  <td className="px-6 py-4">{match.duration}</td>
                  <td className="px-6 py-4 text-right">
                    {match.canReplay ? (
                      <span
                        className="material-symbols-outlined text-secondary-container cursor-pointer hover:scale-110 transition-transform"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline/30 cursor-not-allowed">
                        block
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-outline-variant flex justify-between items-center">
          <p className="text-[10px] font-bold text-outline">
            SHOWING 1-10 OF 842 MATCHES
          </p>
          <div className="flex gap-2">
            <button className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-[2px]">
              PREV
            </button>
            <button className="bg-primary-container text-on-primary border border-primary-container px-3 py-1 text-xs active:translate-y-[2px]">
              01
            </button>
            <button className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-[2px]">
              02
            </button>
            <button className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-[2px]">
              03
            </button>
            <button className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-[2px]">
              NEXT
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}