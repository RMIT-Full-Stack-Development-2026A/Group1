export default function BoardVisualizer() {
    // Sample board state with X and O placements
    const board = [
        // Row 1
        ["X", "O", "", "", "X", "", "", "", "", ""],
        // Row 2
        ["", "O", "X", "", "", "", "", "", "", ""],
        // Row 3
        ["O", "", "", "O", "", "X", "", "", "", ""],
        // Row 4
        ["", "", "", "", "X", "", "", "", "", ""],
        // Row 5
        ["", "O", "", "", "", "", "", "X", "", ""],
        // Row 6
        ["", "", "", "", "", "", "", "", "", ""],
        // Row 7
        ["", "", "O", "", "", "", "", "", "", ""],
        // Row 8
        ["", "", "", "", "", "X", "", "", "", ""],
        // Row 9
        ["", "", "", "", "", "", "", "", "", ""],
        // Row 10
        ["", "", "", "", "", "", "", "", "", ""]
    ];

    return (
        <div className="w-full relative h-[400px] border border-[#3d484d] bg-[#1a1a28] overflow-hidden">
            <div className="absolute top-0 left-0 p-4 border-r border-b border-[#3d484d] font-headline text-[10px] text-[#3d484d]">
                VISUALIZER_v4.2
            </div>

            {/* Board Markers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none">
                <div className="relative w-[400px] h-[400px] grid grid-cols-10 grid-rows-10 gap-0 border border-[#3d484d]">
                    {board.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className="border border-[#3d484d] flex items-center justify-center text-2xl font-headline"
                            >
                                {cell === "X" && (
                                    <span className="text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">
                                        X
                                    </span>
                                )}
                                {cell === "O" && (
                                    <span className="text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">
                                        O
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Scanning Progress */}
            <div className="absolute bottom-4 right-4 text-right">
                <p className="text-[10px] font-headline text-[#93e2ff] opacity-50">SCANNING SECTOR...</p>
                <div className="w-32 h-1 bg-[#3d484d] mt-1">
                    <div className="w-2/3 h-full bg-[#4cc9f0] shadow-[0_0_5px_#4cc9f0]"></div>
                </div>
            </div>
        </div>
    );
}
