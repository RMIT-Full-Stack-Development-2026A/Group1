/**
 * Heuristic Scoring Matrix
 * Evaluates the danger level of a sequence
 * @param {number} count - Number of consecutive marks
 * @param {number} blocks - Number of blocked ends (0, 1, or 2)
 * @returns {number} Score
 */
const getScore = (count, blocks) => {
    // Worthless if blocked on both sides (unless it already reached 5)
    if (blocks === 2 && count < 5) return 0; 
    
    // Any 5-mark line -> MUST BLOCK IMMEDIATELY
    if (count >= 5) return 1000000;              
    
    // Any 4-mark line opened on both ends -> EXTREME DANGER
    if (count === 4 && blocks === 0) return 100000; 
    
    // Block capped 4 (prevents them from making it 5 on the next turn)
    if (count === 4 && blocks === 1) return 50000;  
    
    // Open 3 (Danger: could become Open 4)
    if (count === 3 && blocks === 0) return 10000;  
    
    // Capped 3
    if (count === 3 && blocks === 1) return 100;    
    
    // Open 2
    if (count === 2 && blocks === 0) return 100;    
    
    // Capped 2
    if (count === 2 && blocks === 1) return 10;     
    
    // Single unblocked mark
    if (count === 1 && blocks === 0) return 1;      
    
    return 0;
};

/**
 * Evaluate the danger score of a specific cell if the opponent places a mark there
 */
const evaluateCell = (board, row, col, playerMark) => {
    let totalScore = 0;
    let open3Count = 0; // Counter specifically for Fork detection
    const size = board.length;
    
    // 4 Directions: Horizontal, Vertical, Diagonal (\), Anti-Diagonal (/)
    const directions = [ [0, 1], [1, 0], [1, 1], [1, -1] ];

    for (const [dr, dc] of directions) {
        let count = 1; // Include the cell currently being evaluated
        let blocks = 0;

        // Scan forward (positive direction)
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerMark) {
            count++;
            r += dr;
            c += dc;
        }
        // Check if the forward end is blocked by wall or opponent
        if (r < 0 || r >= size || c < 0 || c >= size || (board[r][c] !== null && board[r][c] !== playerMark)) {
            blocks++;
        }

        // Scan backward (negative direction)
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerMark) {
            count++;
            r -= dr;
            c -= dc;
        }
        // Check if the backward end is blocked
        if (r < 0 || r >= size || c < 0 || c >= size || (board[r][c] !== null && board[r][c] !== playerMark)) {
            blocks++;
        }

        // Detect open 3-mark lines for Fork evaluation
        if (count === 3 && blocks === 0) {
            open3Count++;
        }

        // Add base score for this direction
        totalScore += getScore(count, blocks);
    }
    
    // Any fork formation (two crossing 3-mark lines opened on both ends)
    // If a cell creates 2 or more open 3-mark lines, it's a deadly fork. 
    // Give it a massive bonus score so the AI prioritizes blocking it.
    if (open3Count >= 2) {
        totalScore += 80000; 
    }
    
    return totalScore;
};

/**
 * Get the active bounding box of the board to optimize scanning
 * Returns the min/max rows and cols expanded by a padding radius
 */
const getActiveZone = (board, padding = 2) => {
    const size = board.length;
    let minR = size, maxR = -1, minC = size, maxC = -1;
    let hasMoves = false;

    // Find the absolute limits of current played moves
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== null) {
                hasMoves = true;
                if (r < minR) minR = r;
                if (r > maxR) maxR = r;
                if (c < minC) minC = c;
                if (c > maxC) maxC = c;
            }
        }
    }

    // If board is empty, return null to trigger first-move logic
    if (!hasMoves) return null;

    // Apply padding and ensure it stays within board boundaries
    return {
        minR: Math.max(0, minR - padding),
        maxR: Math.min(size - 1, maxR + padding),
        minC: Math.max(0, minC - padding),
        maxC: Math.min(size - 1, maxC + padding)
    };
};

/**
 * Heuristic Algorithm (Medium Bot) - DEFENSIVE STRATEGY ONLY
 * Highly optimized using Zone of Interest
 */
export const getMediumMove = (board, botMark) => {
    const size = board.length;
    // Identify the human player's mark to anticipate their attacks
    const humanMark = botMark === 'X' ? 'O' : 'X';
    
    // Calculate the active bounding box to avoid scanning the entire board
    const zone = getActiveZone(board, 2);

    // Edge case: Empty board (Bot moves first)
    if (!zone) {
        const center = Math.floor(size / 2);
        return [center, center];
    }

    let bestScore = -1;
    let bestMoves = []; 

    // ONLY scan cells within the active zone
    for (let r = zone.minR; r <= zone.maxR; r++) {
        for (let c = zone.minC; c <= zone.maxC; c++) {
            // Only evaluate empty cells
            if (board[r][c] === null) {
                
                // Calculate how dangerous this cell is if the human plays here
                const defenseScore = evaluateCell(board, r, c, humanMark);

                if (defenseScore > bestScore) {
                    bestScore = defenseScore;
                    bestMoves = [[r, c]]; // Replace with new best move
                } else if (defenseScore === bestScore) {
                    bestMoves.push([r, c]); // Add to list if scores tie
                }
            }
        }
    }

    // Fallback if no threat is detected in the zone (should rarely happen with padding)
    if (bestScore === 0 || bestMoves.length === 0) {
        for (let r = zone.minR; r <= zone.maxR; r++) {
            for (let c = zone.minC; c <= zone.maxC; c++) {
                if (board[r][c] === null) return [r, c];
            }
        }
    }

    // Randomize among the best defensive moves to make the bot less predictable
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
};