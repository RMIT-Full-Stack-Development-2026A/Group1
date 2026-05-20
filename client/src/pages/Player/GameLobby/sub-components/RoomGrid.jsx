import React from "react";
import RoomCard from "./RoomCard";

export default function RoomGrid({ rooms, onJoinRoom, onCreateRoom, currentUserId, pagination, onPageChange }) {
    // Ensure rooms is always an array
    const roomList = Array.isArray(rooms) ? rooms : [];
    const itemsPerPage = pagination?.limit || 5;
    const totalPages = Math.max(1, Math.ceil((pagination?.total || roomList.length || 0) / itemsPerPage));
    const currentPage = Math.min(pagination?.page || 1, totalPages);
    const [jumpToPage, setJumpToPage] = React.useState("");
    const [showJumpInput, setShowJumpInput] = React.useState(false);

    const handleJumpToPage = () => {
        const pageNum = parseInt(jumpToPage, 10);
        if (pageNum >= 1 && pageNum <= totalPages) {
            onPageChange?.(pageNum);
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

    const showFrom = roomList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showTo = Math.min(currentPage * itemsPerPage, pagination?.total || roomList.length || 0);

    return (
        <div className="flex flex-col w-full flex-1 min-h-0">
            {/* Room Grid: horizontally scrollable on small screens */}
            <div className="flex-1 overflow-x-auto md:overflow-visible -mx-4 px-4 py-2">
                <div className="flex gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
                    {roomList.map((room) => (
                        <div key={room.id} className="min-w-[260px] md:min-w-0">
                            <RoomCard room={room} onJoin={onJoinRoom} currentUserId={currentUserId} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State - Centered */}
            {roomList.length === 0 && (
                <div className="flex-1 min-h-[28rem] flex items-center justify-center py-16">
                    <div className="text-center">
                        <p className="font-mono text-[#879398] text-sm">
                            NO AVAILABLE ROOMS RIGHT NOW
                        </p>                  
                    </div>
                </div>
            )}

            {pagination && pagination.total > 0 && (
                <div className="mt-auto p-6 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-outline">
                        SHOWING {showFrom}-
                        {showTo} OF {pagination.total} ROOMS
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            onClick={() => onPageChange?.(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            PREV
                        </button>

                        {(() => {
                            // Generate smart pagination: [1] ... [current-1] [current] [current+1] ... [last]
                            const pages = [];
                            const range = 1;

                            pages.push(1);

                            const rangeStart = Math.max(2, currentPage - range);
                            const rangeEnd = Math.min(totalPages - 1, currentPage + range);

                            if (rangeStart > 2) {
                                pages.push('...');
                            }

                            for (let i = rangeStart; i <= rangeEnd; i++) {
                                pages.push(i);
                            }

                            if (rangeEnd < totalPages - 1) {
                                pages.push('...');
                            }

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
                                                onKeyDown={handleKeyPress}
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
                                        onClick={() => onPageChange?.(pageNum)}
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
                            onClick={() => onPageChange?.(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-surface-container-highest border border-outline px-3 py-1 text-xs hover:bg-outline hover:text-on-secondary transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
