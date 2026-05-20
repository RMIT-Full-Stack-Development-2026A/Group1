import React from "react";
import RoomCard from "./RoomCard";

export default function RoomGrid({ rooms, onJoinRoom, onCreateRoom, currentUserId, pagination, onPageChange }) {
    
    const roomList = Array.isArray(rooms) ? rooms : [];
    const hasRooms = roomList.length > 0;

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
            
            {hasRooms && (
                <div className="flex-1 overflow-x-auto md:overflow-visible -mx-4 px-4 py-2">
                    <div className="flex gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
                        {roomList.map((room) => (
                            <div key={room.id} className="min-w-[260px] md:min-w-0">
                                <RoomCard room={room} onJoin={onJoinRoom} currentUserId={currentUserId} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!hasRooms && (
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="text-center bg-surface-container-low border border-dashed border-outline/40 px-12 py-16 shadow-inner max-w-lg w-full">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-surface-container-highest border border-outline-variant mb-6">
                             <svg className="w-8 h-8 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 012 2H5a2 2 0 012-2v6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>

                        <p className="font-headline text-[#fad100] text-on-surface text-base tracking-wider font-bold mb-3">
                            NO AVAILABLE ROOMS
                        </p>
                        <p className="text-outline text-sm mb-10 max-w-xs mx-auto">
                            LOOKS LIKE ALL ROOM ARE FULL
                        </p>

                        <button
                            onClick={onCreateRoom}
                            className="px-8 h-12 border border-outline-variant cursor-pointer bg-[#4dc9ed] text-black font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 shadow-md flex items-center gap-2 mx-auto"
                        >
                            <span className="text-lg">+</span> CREATE NEW ONE NOW
                        </button>
                    </div>
                </div>
            )}

            {pagination && pagination.total > 0 && hasRooms && (
                <div className="mt-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/30">
                    <p className="text-[11px] font-semibold text-outline tracking-wider">
                        SHOWING <span className="text-on-surface font-bold">{showFrom}</span> - <span className="text-on-surface font-bold">{showTo}</span> OF <span className="text-on-surface font-bold">{pagination.total}</span> ROOMS
                    </p>
                    
                    <div className="flex gap-1.5 items-center flex-wrap justify-center">
                        <button
                            onClick={() => onPageChange?.(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center px-3 h-8 rounded-md bg-surface-container-highest border border-outline-variant text-xs font-medium hover:border-outline hover:text-on-secondary transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <span className="mr-1">&laquo;</span> PREV
                        </button>

                        {(() => {
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
                                                className="w-10 h-8 px-1 rounded-md text-xs bg-surface border-2 border-primary-container text-on-surface outline-none text-center shadow-sm focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            key={`ellipsis-${idx}`}
                                            onClick={() => setShowJumpInput(true)}
                                            className="flex items-center justify-center min-w-[32px] h-8 rounded-md text-xs text-outline hover:text-on-secondary hover:bg-surface-container-highest transition-colors cursor-pointer"
                                            title="Click to jump to a page"
                                        >
                                            &hellip;
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange?.(pageNum)}
                                        className={`flex items-center justify-center min-w-[32px] px-1 h-8 rounded-md text-xs font-semibold transition-all duration-200 active:scale-95 ${
                                            currentPage === pageNum
                                                ? "bg-primary-container text-on-primary border-2 border-primary-container shadow-sm scale-110 pointer-events-none"
                                                : "bg-surface-container-highest border border-outline-variant hover:border-outline hover:text-on-secondary"
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
                            className="flex items-center justify-center px-3 h-8 rounded-md bg-surface-container-highest border border-outline-variant text-xs font-medium hover:border-outline hover:text-on-secondary transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            NEXT <span className="ml-1">&raquo;</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}