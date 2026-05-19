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
  onApplyFilters,
  onResetFilters,
  loading,
  isPremium,
}) {
  const itemsPerPage = 5;
  const totalPages = Math.ceil(totalMatches / itemsPerPage);

  const [jumpToPage, setJumpToPage] = React.useState("");
  const [showJumpInput, setShowJumpInput] = React.useState(false);

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpToPage("");
      setShowJumpInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJumpToPage();
    } else if (e.key === "Escape") {
      setShowJumpInput(false);
      setJumpToPage("");
    }
  };

  React.useEffect(() => {
    console.log("[MatchHistoryTable] Props received:");
    console.log("  - matches.length:", matches.length);
    console.log("  - totalMatches:", totalMatches);
    console.log("  - currentPage:", currentPage);
    console.log("  - totalPages:", totalPages);
    console.log("  - itemsPerPage:", itemsPerPage);
  }, [matches, totalMatches, currentPage, totalPages]);
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
        return {
          backgroundColor: "#f5a623",
          color: "#000000",
          borderColor: "#f5a623",
        };
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

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "--";
    
    try {
      // Parse time strings in format "HH:MM:SS"
      const [startHour, startMin, startSec] = startTime.split(":").map(Number);
      const [endHour, endMin, endSec] = endTime.split(":").map(Number);
      
      let startTotalSec = startHour * 3600 + startMin * 60 + (startSec || 0);
      let endTotalSec = endHour * 3600 + endMin * 60 + (endSec || 0);
      
      // Handle case where end time is next day (e.g., 01:00:00 to 23:00:00)
      if (endTotalSec < startTotalSec) {
        endTotalSec += 24 * 3600;
      }
      
      const durationSec = endTotalSec - startTotalSec;
      
      // Convert seconds to HH:MM:SS format
      const hours = Math.floor(durationSec / 3600);
      const minutes = Math.floor((durationSec % 3600) / 60);
      const seconds = durationSec % 60;
      
      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");
      
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } catch (error) {
      return "--";
    }
  };

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
          <div className="relative grow md:w-64 flex flex-col gap-1">
            <label className="text-[8px] text-outline-variant uppercase font-bold tracking-wider">SEARCH</label>
            <input
              className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary-container outline-none px-4 py-2 text-xs font-body text-on-surface placeholder:text-outline-variant uppercase"
              placeholder="Opponent or room..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Date From Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] text-outline-variant uppercase font-bold tracking-wider">From</label>
            <input
              className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-on-surface placeholder:text-outline-variant focus:border-primary-container"
              placeholder="MM / DD / YYYY"
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>

          {/* Date To Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] text-outline-variant uppercase font-bold tracking-wider">To</label>
            <input
              className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-on-surface placeholder:text-outline-variant focus:border-primary-container"
              placeholder="MM / DD / YYYY"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>

          {/* Result Filter */}
          <select
            className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-outline focus:border-primary-container appearance-none cursor-pointer"
            style={{ backgroundColor: '#343342', color: '#e3e0f4' }}
            value={filterResult}
            onChange={(e) => onFilterResultChange(e.target.value)}
          >
            <option style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>ALL RESULTS</option>
            <option style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>WIN</option>
            <option style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>LOSS</option>
            <option style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>ABORT</option>
            <option style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>DRAW</option>
          </select>

          {/* Game Type Filter */}
          <select
            className="bg-surface-container-highest border-b-2 border-outline text-xs px-3 py-2 outline-none uppercase font-bold text-outline focus:border-primary-container appearance-none cursor-pointer"
            style={{ backgroundColor: '#343342', color: '#e3e0f4' }}
            value={filterGameType}
            onChange={(e) => onFilterGameTypeChange(e.target.value)}
          >
            <option value="" style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>ALL GAME TYPES</option>
            <option value="SINGLE_PLAYER" style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>SINGLE PLAYER</option>
            <option value="TWO_PLAYERS" style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>TWO PLAYERS</option>
            <option value="ONLINE_MATCH" style={{ backgroundColor: '#343342', color: '#e3e0f4' }}>ONLINE MATCH</option>
          </select>

          {/* Reset Filter Button */}
          <button
            onClick={onResetFilters}
            className="bg-surface-container-highest text-outline px-4 py-2 text-xs uppercase font-bold border border-outline hover:bg-outline hover:text-surface transition-all active:translate-y-0.5"
          >
            RESET
          </button>

          {/* Filter Button */}
          <button
            onClick={onApplyFilters}
            className="bg-primary-container text-on-primary px-4 py-2 text-xs uppercase font-bold border border-primary-container hover:bg-primary hover:border-primary transition-all active:translate-y-0.5"
          >
            FILTER
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest text-outline text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">GAME TYPE</th>
              <th className="px-6 py-4">OPPONENT</th>
              <th className="px-6 py-4">RESULT</th>
              <th 
                className="px-6 py-4 cursor-pointer hover:text-primary-container transition-colors" 
                onClick={() => onSortBy("endedAt")}
              >
                DATE <SortIndicator column="endedAt" />
              </th>
              <th className="px-6 py-4">START TIME</th>
              <th className="px-6 py-4">END TIME</th>
              <th className="px-6 py-4">
                <div className="flex flex-col leading-tight">
                  <span>DURATION</span>
                  <span className="text-xs text-gray-400">(HH:MM:SS)</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right">REPLAY</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium uppercase tracking-tight divide-y divide-outline-variant/30">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-outline/50">
                  Loading matches...
                </td>
              </tr>
            ) : matches.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-outline/50">
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
                  <td className="px-6 py-4">{match.date}</td>
                  <td className="px-6 py-4">{match.startTime}</td>
                  <td className="px-6 py-4">{match.endTime}</td>
                  <td className="px-6 py-4">{calculateDuration(match.startTime, match.endTime)}</td>
                  <td className="px-6 py-4 text-right">
                    {isPremium ? (
                      <span
                        className="material-symbols-outlined text-secondary-container cursor-pointer hover:scale-110 transition-transform"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        onClick={() => onReplay(match.id)}
                        title="View match replay"
                      >
                        play_arrow
                      </span>
                    ) : (
                      <span
                        className="material-symbols-outlined text-warning cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => onReplay(match.id)}
                        title="Premium feature - click to view replay"
                      >
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
            className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PREV
          </button>

          {(() => {
            // Generate smart pagination: [1] ... [current-1] [current] [current+1] ... [last]
            const pages = [];
            const range = 1; // Pages to show on each side of current page
            
            // Always add page 1
            pages.push(1);
            
            // Calculate start and end of range around current page
            const rangeStart = Math.max(2, currentPage - range);
            const rangeEnd = Math.min(totalPages - 1, currentPage + range);
            
            // Add "..." if there's a gap between page 1 and range start
            if (rangeStart > 2) {
              pages.push('...');
            }
            
            // Add pages around current
            for (let i = rangeStart; i <= rangeEnd; i++) {
              pages.push(i);
            }
            
            // Add "..." if there's a gap between range end and last page
            if (rangeEnd < totalPages - 1) {
              pages.push('...');
            }
            
            // Always add last page (if more than 1 page)
            if (totalPages > 1 && rangeEnd < totalPages) {
              pages.push(totalPages);
            }
            
            return pages.map((pageNum, idx) => {
              if (pageNum === '...') {
                return showJumpInput ? (
                  <div key={`jump-input-${idx}`}>
                    <input
                      autoFocus
                      type="number"
                      min="1"
                      max={totalPages}
                      value={jumpToPage}
                      onChange={(e) => setJumpToPage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onBlur={() => {
                        setShowJumpInput(false);
                        setJumpToPage("");
                      }}
                      className="w-9 px-2 py-1 text-xs bg-primary-container border border-primary-container text-on-primary outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ) : (
                  <button
                    key={`ellipsis-${idx}`}
                    onClick={() => setShowJumpInput(true)}
                    className="px-3 py-1 text-xs text-outline/50 hover:text-primary transition-colors cursor-pointer hover:bg-surface-container-highest border border-outline-variant rounded"
                    title="Click to jump to a page"
                  >
                    ...
                  </button>
                );
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-xs active:translate-y-0.5 font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-primary-container text-on-primary border-2 border-primary-container shadow-[0_0_12px_rgba(76,201,240,0.6)] scale-105"
                      : "bg-surface-container-highest border border-outline hover:bg-outline hover:text-on-secondary"
                  }`}
                >
                  {String(pageNum).padStart(2, "0")}
                </button>
              );
            });
          })()}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            NEXT
          </button>
        </div>
      </div>
    </section>
  );
}
