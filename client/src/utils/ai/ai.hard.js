/**
 * HARD AI: a gomoku (five or more in a row) engine.
 *
 * How it plays, in the order it decides:
 *  1. If it can make five right now, it does. Nothing else is considered.
 *  2. If the opponent threatens five, it blocks (a double threat cannot be stopped; it still blocks one).
 *  3. It looks for a forced win made only of fours (each four must be answered at one cell).
 *  4. Otherwise it runs an iterative-deepening alpha-beta search with a transposition table. Fours and
 *     blocks are forced moves that do not use up depth, and every leaf also checks for a forced win by
 *     fours, so a double threat (four-four, four-three) is seen before it happens.
 *
 * The board is tracked as every 5-cell line ("window") with a stone count per player, updated
 * incrementally on each move, which gives the evaluation and the threat detection for free.
 */

const WIN = 1000000;
const TIME_BUDGET_MS = 1000;
const VCF_BUDGET_MS = 300;
const MAX_DEPTH = 16;
const VCF_DEPTH_ROOT = 14;
const VCF_DEPTH_LEAF = 8;
const TT_LIMIT = 250000;

const BOT = 1;
const HUMAN = 2;

// Value of a window that holds only one player's stones, by stone count.
const WINDOW_VALUE = [0, 1, 12, 150, 2000, 50000];
// Search width by distance from the root.
const WIDTH_BY_PLY = [30, 18, 14, 10, 8];

const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];

// ---------------------------------------------------------------------------------------------
// Static, per-board-size data (windows, neighbours, hash keys). Built once and reused.
// ---------------------------------------------------------------------------------------------

const layoutCache = new Map();

const createRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0);
    };
};

const getLayout = (n) => {
    if (layoutCache.has(n)) return layoutCache.get(n);

    const total = n * n;
    const windows = [];
    const cellWindows = Array.from({ length: total }, () => []);
    // The same windows grouped by direction (index 0-3), used to recognise shapes around a cell.
    const cellDirWindows = Array.from({ length: total }, () => [[], [], [], []]);

    DIRECTIONS.forEach(([dr, dc], d) => {
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const endR = r + 4 * dr;
                const endC = c + 4 * dc;
                if (endR < 0 || endR >= n || endC < 0 || endC >= n) continue;
                const id = windows.length;
                const cells = [];
                for (let k = 0; k < 5; k++) {
                    const cell = (r + k * dr) * n + (c + k * dc);
                    cells.push(cell);
                    cellWindows[cell].push(id);
                    cellDirWindows[cell][d].push(id);
                }
                windows.push(cells);
            }
        }
    });

    const neighbours = Array.from({ length: total }, (_, cell) => {
        const r = Math.floor(cell / n);
        const c = cell % n;
        const list = [];
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n) list.push(nr * n + nc);
            }
        }
        return list;
    });

    const random = createRandom(0x9E3779B9 ^ n);
    const hashA = new Int32Array(total * 3);
    const hashB = new Int32Array(total * 3);
    for (let i = 0; i < hashA.length; i++) {
        hashA[i] = random() | 0;
        hashB[i] = random() | 0;
    }

    const layout = { n, total, windows, cellWindows, cellDirWindows, neighbours, hashA, hashB };
    layoutCache.set(n, layout);
    return layout;
};

// ---------------------------------------------------------------------------------------------
// One search. All mutable state lives inside this closure so calls never interfere with each other.
// ---------------------------------------------------------------------------------------------

const createEngine = (board, botMark) => {
    const n = board.length;
    const { total: N, windows, cellWindows, cellDirWindows, neighbours, hashA, hashB } = getLayout(n);
    const windowCount = windows.length;

    const cells = new Int8Array(N);
    const count1 = new Int8Array(windowCount); // BOT stones per window
    const count2 = new Int8Array(windowCount); // HUMAN stones per window
    const counts = [null, count1, count2];
    const neighbourCount = new Int16Array(N);

    // Windows that hold a single player's stones: fives, fours (one empty cell left) and threes.
    const fives = [0, 0, 0];
    const fours = [0, 0, 0];
    const threes = [0, 0, 0];

    let score = 0; // static evaluation from BOT's point of view
    let stones = 0;
    let hashLow = 0;
    let hashHigh = 0;

    let nodes = 0;
    let deadline = 0;
    let timedOut = false;
    let vcfRootMove = -1;
    const table = new Map();

    const accumulate = (w, sign) => {
        const a = count1[w];
        const b = count2[w];
        if (a !== 0 && b !== 0) return;
        if (a !== 0) {
            score += sign * WINDOW_VALUE[a];
            if (a === 5) fives[BOT] += sign;
            else if (a === 4) fours[BOT] += sign;
            else if (a === 3) threes[BOT] += sign;
        } else if (b !== 0) {
            score -= sign * WINDOW_VALUE[b];
            if (b === 5) fives[HUMAN] += sign;
            else if (b === 4) fours[HUMAN] += sign;
            else if (b === 3) threes[HUMAN] += sign;
        }
    };

    const place = (cell, side) => {
        const list = cellWindows[cell];
        const own = counts[side];
        for (let i = 0; i < list.length; i++) {
            const w = list[i];
            accumulate(w, -1);
            own[w]++;
            accumulate(w, 1);
        }
        cells[cell] = side;
        stones++;
        hashLow ^= hashA[cell * 3 + side];
        hashHigh ^= hashB[cell * 3 + side];
        const near = neighbours[cell];
        for (let i = 0; i < near.length; i++) neighbourCount[near[i]]++;
    };

    const remove = (cell) => {
        const side = cells[cell];
        const list = cellWindows[cell];
        const own = counts[side];
        for (let i = 0; i < list.length; i++) {
            const w = list[i];
            accumulate(w, -1);
            own[w]--;
            accumulate(w, 1);
        }
        cells[cell] = 0;
        stones--;
        hashLow ^= hashA[cell * 3 + side];
        hashHigh ^= hashB[cell * 3 + side];
        const near = neighbours[cell];
        for (let i = 0; i < near.length; i++) neighbourCount[near[i]]--;
    };

    // Load the starting position.
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const mark = board[r][c];
            if (mark !== null && mark !== undefined) place(r * n + c, mark === botMark ? BOT : HUMAN);
        }
    }

    /** Empty cells that complete a five for `side` (cells of windows holding four of its stones). */
    const completionCells = (side) => {
        const own = counts[side];
        const other = counts[3 - side];
        const result = [];
        for (let w = 0; w < windowCount; w++) {
            if (own[w] !== 4 || other[w] !== 0) continue;
            const win = windows[w];
            for (let k = 0; k < 5; k++) {
                if (cells[win[k]] === 0) {
                    if (!result.includes(win[k])) result.push(win[k]);
                    break;
                }
            }
        }
        return result;
    };

    /** Empty cells that would give `side` a four (cells of windows holding three of its stones). */
    const fourMakers = (side) => {
        const own = counts[side];
        const other = counts[3 - side];
        const result = [];
        for (let w = 0; w < windowCount; w++) {
            if (own[w] !== 3 || other[w] !== 0) continue;
            const win = windows[w];
            for (let k = 0; k < 5; k++) {
                if (cells[win[k]] === 0 && !result.includes(win[k])) result.push(win[k]);
            }
        }
        return result;
    };

    /**
     * Is there a forced win for `me` that uses only fours? Every four leaves the opponent one reply.
     * A move that makes two fives threats at once, or a four that cannot be answered, wins.
     */
    const vcf = (me, depth, isRoot = false) => {
        if ((++nodes & 255) === 0 && Date.now() > deadline) timedOut = true;
        if (timedOut) return false;
        if (fours[me] > 0) return true;
        if (depth === 0 || threes[me] === 0) return false;
        const other = 3 - me;
        if (fours[other] > 0) return false; // the opponent threatens five, so we must defend instead

        const makers = fourMakers(me);
        for (let i = 0; i < makers.length; i++) {
            const cell = makers[i];
            place(cell, me);
            let won = false;
            const completions = completionCells(me);
            if (completions.length >= 2) {
                won = true;
            } else if (completions.length === 1) {
                const reply = completions[0];
                place(reply, other);
                if (fives[other] === 0) won = vcf(me, depth - 1);
                remove(reply);
            }
            remove(cell);
            if (won) {
                if (isRoot) vcfRootMove = cell;
                return true;
            }
        }
        return false;
    };

    /** How promising a cell is for `side`: its own attack value plus the value of denying the opponent. */
    const priority = (cell, side) => {
        const other = 3 - side;
        const own = counts[side];
        const opp = counts[other];
        const dirs = cellDirWindows[cell];

        let own4 = 0, own3 = 0, ownWeak = 0, ownSmall = 0;
        let opp4 = 0, opp3 = 0, oppWeak = 0, oppSmall = 0;

        for (let d = 0; d < 4; d++) {
            const list = dirs[d];
            let m3 = false, m2 = 0, m1 = 0;
            let p3 = false, p2 = 0, p1 = 0;
            for (let i = 0; i < list.length; i++) {
                const w = list[i];
                const a = own[w];
                const b = opp[w];
                if (b === 0) {
                    if (a === 3) m3 = true;
                    else if (a === 2) m2++;
                    else if (a === 1) m1++;
                }
                if (a === 0) {
                    if (b === 3) p3 = true;
                    else if (b === 2) p2++;
                    else if (b === 1) p1++;
                }
            }
            if (m3) own4++;
            else if (m2 >= 2) own3++;
            else if (m2 === 1) ownWeak++;
            else ownSmall += m1;
            if (p3) opp4++;
            else if (p2 >= 2) opp3++;
            else if (p2 === 1) oppWeak++;
            else oppSmall += p1;
        }

        let value = own4 * 6000 + own3 * 1500 + ownWeak * 200 + ownSmall * 4
            + opp4 * 3500 + opp3 * 1300 + oppWeak * 150 + oppSmall * 3;
        if (own4 >= 2) value += 200000;
        else if (own4 >= 1 && own3 >= 1) value += 80000;
        else if (own3 >= 2) value += 40000;
        if (opp4 >= 2) value += 150000;
        else if (opp4 >= 1 && opp3 >= 1) value += 60000;
        else if (opp3 >= 2) value += 30000;

        // A little pull towards the centre breaks ties sensibly.
        const r = Math.floor(cell / n);
        const c = cell % n;
        value += (n - Math.abs(r - (n - 1) / 2) - Math.abs(c - (n - 1) / 2));
        return value;
    };

    const generate = (side, limit, jitter) => {
        const result = [];
        for (let cell = 0; cell < N; cell++) {
            if (cells[cell] !== 0 || neighbourCount[cell] === 0) continue;
            result.push({ cell, value: priority(cell, side) + (jitter ? Math.random() * 3 : 0) });
        }
        result.sort((x, y) => y.value - x.value);
        return result.length > limit ? result.slice(0, limit) : result;
    };

    const evaluateFor = (side) => (side === BOT ? score : -score);

    const search = (depth, alpha, beta, side, ply) => {
        if ((++nodes & 511) === 0 && Date.now() > deadline) timedOut = true;
        if (timedOut) return 0;

        const other = 3 - side;
        if (fives[other] > 0) return -(WIN - ply);
        if (fours[side] > 0) return WIN - ply - 1;

        let forced = -1;
        if (fours[other] > 0) {
            const blocks = completionCells(other);
            if (blocks.length > 1) return -(WIN - ply - 2); // two five threats cannot both be stopped
            forced = blocks[0];
        }
        if (stones === N) return 0;

        if (depth <= 0 && forced < 0) {
            if (threes[side] > 0 && vcf(side, VCF_DEPTH_LEAF)) return WIN - ply - 3;
            return evaluateFor(side);
        }

        let ttMove = -1;
        const key = hashLow;
        if (forced < 0) {
            const entry = table.get(key);
            if (entry && entry.check === hashHigh) {
                ttMove = entry.move;
                if (entry.depth >= depth) {
                    if (entry.flag === 0) return entry.score;
                    if (entry.flag === 1 && entry.score > alpha) alpha = entry.score;
                    else if (entry.flag === 2 && entry.score < beta) beta = entry.score;
                    if (alpha >= beta) return entry.score;
                }
            }
        }

        let moves;
        if (forced >= 0) {
            moves = [{ cell: forced, value: 0 }];
        } else {
            moves = generate(side, WIDTH_BY_PLY[Math.min(ply, WIDTH_BY_PLY.length - 1)], false);
            if (ttMove >= 0) {
                const at = moves.findIndex((m) => m.cell === ttMove);
                if (at > 0) moves.unshift(moves.splice(at, 1)[0]);
            }
        }
        if (moves.length === 0) return 0;

        const originalAlpha = alpha;
        let best = -Infinity;
        let bestMove = moves[0].cell;
        for (let i = 0; i < moves.length; i++) {
            const cell = moves[i].cell;
            place(cell, side);
            const value = -search(depth - 1, -beta, -alpha, other, ply + 1);
            remove(cell);
            if (timedOut) return 0;
            if (value > best) {
                best = value;
                bestMove = cell;
            }
            if (value > alpha) alpha = value;
            if (alpha >= beta) break;
        }

        // Scores that encode a forced win or loss depend on the distance to the root, so do not cache them.
        if (forced < 0 && Math.abs(best) < WIN - 1000) {
            if (table.size > TT_LIMIT) table.clear();
            table.set(key, {
                check: hashHigh,
                depth,
                score: best,
                move: bestMove,
                flag: best <= originalAlpha ? 2 : best >= beta ? 1 : 0,
            });
        }
        return best;
    };

    const toCoordinates = (cell) => [Math.floor(cell / n), cell % n];

    const chooseMove = () => {
        if (stones === 0) {
            const middle = Math.floor(n / 2);
            return [middle, middle];
        }

        // 1. Win now.
        if (fours[BOT] > 0) return toCoordinates(completionCells(BOT)[0]);
        // 2. Stop a five.
        if (fours[HUMAN] > 0) return toCoordinates(completionCells(HUMAN)[0]);
        // 3. A forced win made of fours (given a share of the time budget, so it can never stall the move).
        deadline = Date.now() + VCF_BUDGET_MS;
        const forcedWin = threes[BOT] > 0 && vcf(BOT, VCF_DEPTH_ROOT, true) && vcfRootMove >= 0;
        if (forcedWin) return toCoordinates(vcfRootMove);
        timedOut = false;

        // 4. Deepening search.
        deadline = Date.now() + TIME_BUDGET_MS;
        let rootMoves = generate(BOT, WIDTH_BY_PLY[0], true);
        if (rootMoves.length === 0) {
            for (let cell = 0; cell < N; cell++) if (cells[cell] === 0) return toCoordinates(cell);
            return [0, 0];
        }
        let bestCell = rootMoves[0].cell;

        for (let depth = 1; depth <= MAX_DEPTH; depth++) {
            let depthBest = -Infinity;
            let depthBestCell = -1;
            let alpha = -Infinity;

            for (let i = 0; i < rootMoves.length; i++) {
                const cell = rootMoves[i].cell;
                place(cell, BOT);
                const value = -search(depth - 1, -Infinity, -alpha, HUMAN, 1);
                remove(cell);
                if (timedOut) break;
                rootMoves[i].value = value;
                if (value > depthBest) {
                    depthBest = value;
                    depthBestCell = cell;
                }
                if (value > alpha) alpha = value;
            }
            if (timedOut) break;

            bestCell = depthBestCell;
            // Search the best move first at the next depth.
            const at = rootMoves.findIndex((m) => m.cell === bestCell);
            if (at > 0) rootMoves.unshift(rootMoves.splice(at, 1)[0]);

            if (depthBest >= WIN - 1000) break; // forced win found
            if (depthBest <= -WIN + 1000) break; // every move loses; no point searching further
        }
        return toCoordinates(bestCell);
    };

    return { chooseMove };
};

/**
 * Pick the AI's move.
 * @param {Array<Array<string|null>>} board - square board of 'X' / 'O' / null (not modified)
 * @param {string} botMark - the mark the AI plays
 * @returns {Array<number>} [row, col]
 */
export const getHardMove = (board, botMark) => createEngine(board, botMark).chooseMove();
