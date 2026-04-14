// Match History Table Sub-component - Displays match history with filters and pagination
import React from "react";

export default function MatchHistoryTable({
  matches,
  searchQuery,
  onSearchChange,
  filterResult,
  onFilterResultChange,
  filterGameType,
  onFilterGameTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortBy,
  sortOrder,
  onSortBy,
  currentPage,
  totalMatches,
  onPageChange,
  onReplay,
  loading,
}) {
  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return <span className="ml-1 text-outline/40">⇅</span>;
    return sortOrder === "desc" 
      ? <span className="ml-1 text-primary-container">↓</span> 
      : <span className="ml-1 text-primary-container">↑</span>;
  };
  const getResultColor = (result) => {
    switch (result) {
      case "WIN":
        return {
          backgroundColor: "#4cc9f0",
          color: "#000000",
          borderColor: "#4cc9f0",
        };
      case "LOSS":
        return {
          backgroundColor: "#93000a",
          color: "#000000",
          borderColor: "#93000a",
        };
      case "ABORT":
      case "DRAW":
        return {
          backgroundColor: "#879398",
          color: "#000000",
          borderColor: "#879398",
        };
      default:
        return {
          backgroundColor: "transparent",
          color: "#000000",
          borderColor: "#879398",
        };
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

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalMatches / itemsPerPage);

  return (
    <section 
      className="border border-outline-variant flex flex-col"
      style={{ backgroundColor: "#1b1c2c" }}
    >
      {/* Table Header/Controls */}
      <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-outline-variant">
        <h3 className="font-arcade text-lg text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">
            history
          </span>
          MATCH HISTORY
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow md:w-64">
            <input
              className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary-container outline-none px-4 py-2 text-xs font-body text-on-surface placeholder:text-outline-variant uppercase"
              placeholder="Search opponent or room..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-2 top-2 text-outline text-sm">
              search
            </span>
          </div>

          {/* Date From Filter */}
          <input
            className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-on-surface placeholder:text-outline-variant focus:border-primary-container"
            placeholder="From"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />

          {/* Date To Filter */}
          <input
            className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-on-surface placeholder:text-outline-variant focus:border-primary-container"
            placeholder="To"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />

          {/* Result Filter */}
          <select
            className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-outline focus:border-primary-container appearance-none cursor-pointer"
            value={filterResult}
            onChange={(e) => onFilterResultChange(e.target.value)}
          >
            <option>ALL RESULTS</option>
            <option>WIN</option>
            <option>LOSS</option>
            <option>ABORT</option>
          </select>

          {/* Game Type Filter */}
          <select
            className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-outline focus:border-primary-container appearance-none cursor-pointer"
            value={filterGameType}
            onChange={(e) => onFilterGameTypeChange(e.target.value)}
          >
            <option>GAME TYPE</option>
            <option>SINGLE_PLAYER</option>
            <option>TWO_PLAYERS</option>
            <option>ONLINE_MATCH</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest text-outline text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant">
              <th className="px-6 py-4">#</th>
              <th 
                className="px-6 py-4 cursor-pointer hover:text-primary-container transition-colors" 
                onClick={() => onSortBy("endedAt")}
              >
                DATE <SortIndicator column="endedAt" />
              </th>
              <th className="px-6 py-4">GAME TYPE</th>
              <th className="px-6 py-4">OPPONENT</th>
              <th className="px-6 py-4">RESULT</th>
              <th className="px-6 py-4">START TIME</th>
              <th className="px-6 py-4">END TIME</th>
              <th className="px-6 py-4 text-right">REPLAY</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium uppercase tracking-tight divide-y divide-outline-variant/30">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-outline/50">
                  Loading matches...
                </td>
              </tr>
            ) : matches.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-outline/50">
                  No matches found
                </td>
              </tr>
            ) : (
              matches.map((match) => (
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
                      className="border inline-flex items-center justify-center"
                      style={{
                        ...getResultColor(match.result),
                        width: "80px",
                        height: "32px",
                      }}
                    >
                      {match.result}
                    </span>
                  </td>
                  <td className="px-6 py-4">{match.startTime}</td>
                  <td className="px-6 py-4">{match.endTime}</td>
                  <td className="px-6 py-4 text-right">
                    {match.canReplay ? (
                      <span
                        className="material-symbols-outlined text-secondary-container cursor-pointer hover:scale-110 transition-transform"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        onClick={() => onReplay(match.id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-outline">
          SHOWING {matches.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, totalMatches)} OF {totalMatches} MATCHES
        </p>

        {/* Pagination Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PREV
          </button>

          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 text-xs active:translate-y-[2px] ${
                  currentPage === pageNum
                    ? "bg-primary-container text-on-primary border border-primary-container"
                    : "bg-surface-container-highest border border-outline hover:bg-outline hover:text-on-secondary transition-all"
                }`}
              >
                {String(pageNum).padStart(2, "0")}
              </button>
            )
          )}

          {totalPages > 3 && (
            <button
              disabled
              className="px-3 py-1 text-xs text-outline/50"
            >
              ...
            </button>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            NEXT
          </button>
        </div>
      </div>
    </section>
  );
}
