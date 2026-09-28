import type {RoomType, AnalysisGrid, CellAnalysis} from '../types';

export const GRID_SIZE = 13;

const DIRS = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
];

function inBounds(r: number, c: number): boolean {
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

// Calcola distanze da Start con BFS attraverso stanze reali
function calculateDistancesFromStart(grid: RoomType[][]): number[][] {
    const dist: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(-1));
    let startPos: { r: number; c: number } | null = null;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 'start') {
                startPos = { r, c };
                break;
            }
        }
    }

    if (!startPos) return dist;

    const queue: { r: number; c: number }[] = [startPos];
    dist[startPos.r][startPos.c] = 0;

    while (queue.length > 0) {
        const { r, c } = queue.shift()!;
        for (const { r: dr, c: dc } of DIRS) {
            const nr = r + dr;
            const nc = c + dc;
            if (inBounds(nr, nc)) {
                const type = grid[nr][nc];
                if (type !== 'empty' && type !== 'blocked' && dist[nr][nc] === -1) {
                    dist[nr][nc] = dist[r][c] + 1;
                    queue.push({ r: nr, c: nc });
                }
            }
        }
    }

    return dist;
}

// 1. Secret Room Analyzer
export function analyzeSecret(grid: RoomType[][]): AnalysisGrid {
    const rawScores: (CellAnalysis | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    let maxNeighbors = 0;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] !== 'empty') continue;

            let validNeighbors = 0;
            let touchesBossOrBlocked = false;

            for (const { r: dr, c: dc } of DIRS) {
                const nr = r + dr;
                const nc = c + dc;
                if (inBounds(nr, nc)) {
                    const type = grid[nr][nc];
                    if (type === 'boss' || type === 'blocked') {
                        touchesBossOrBlocked = true;
                    } else if (type !== 'empty') {
                        validNeighbors++;
                    }
                }
            }

            if (!touchesBossOrBlocked && validNeighbors > 0) {
                let score = 0;
                if (validNeighbors >= 4) score = 100;
                else if (validNeighbors === 3) score = 75;
                else if (validNeighbors === 2) score = 25;
                else if (validNeighbors === 1) score = 1;

                rawScores[r][c] = {
                    score,
                    percentage: 0,
                    reasons: [`${validNeighbors} stanze connesse`],
                };

                if (validNeighbors > maxNeighbors) {
                    maxNeighbors = validNeighbors;
                }
            }
        }
    }

    // Se esistono stanze con 2+ vicini, elimina le 1-connessione (regola fallback Isaac)
    if (maxNeighbors >= 2) {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = rawScores[r][c];
                if (cell && cell.score === 1) {
                    rawScores[r][c] = null;
                }
            }
        }
    }

    return normalizePercentages(rawScores);
}

// 2. Super Secret Room Analyzer
export function analyzeSuperSecret(grid: RoomType[][]): AnalysisGrid {
    const rawScores: (CellAnalysis | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    const distances = calculateDistancesFromStart(grid);

    let bossDist = -1;
    let shopDist = -1;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 'boss') bossDist = distances[r][c];
            if (grid[r][c] === 'shop') shopDist = distances[r][c];
        }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] !== 'empty') continue;

            let neighborCount = 0;
            let touchesBlocked = false;
            let singleNeighborPos: { r: number; c: number } | null = null;
            let singleNeighborType: RoomType | null = null;

            for (const { r: dr, c: dc } of DIRS) {
                const nr = r + dr;
                const nc = c + dc;
                if (inBounds(nr, nc)) {
                    const type = grid[nr][nc];
                    if (type === 'blocked') touchesBlocked = true;
                    else if (type !== 'empty') {
                        neighborCount++;
                        singleNeighborPos = { r: nr, c: nc };
                        singleNeighborType = type;
                    }
                }
            }

            // Regola: esattamente 1 vicino e deve essere 'normal'
            if (!touchesBlocked && neighborCount === 1 && singleNeighborType === 'normal' && singleNeighborPos) {
                const d = distances[singleNeighborPos.r][singleNeighborPos.c];
                const reasons: string[] = [];
                let score = 10;

                if (d !== -1) {
                    score += d * 15;
                    reasons.push(`Distanza dallo start: ${d}`);

                    if (bossDist !== -1 && d === bossDist - 1) {
                        score += 35;
                        reasons.push('Adiacente al ramo Boss');
                    }
                    if (shopDist !== -1 && d >= shopDist) {
                        score += 20;
                        reasons.push('Priorità dead-end post-Shop');
                    }
                } else {
                    reasons.push('Stanza normale non connessa allo start');
                }

                rawScores[r][c] = { score, percentage: 0, reasons };
            }
        }
    }

    return normalizePercentages(rawScores);
}

// 3. Ultra Secret Room Analyzer (Corretto)
export function analyzeUltraSecret(grid: RoomType[][]): AnalysisGrid {
    const rawScores: (CellAnalysis | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] !== 'empty') continue;

            // VINCOLO 1: L'Ultra Secret NON deve toccare direttamente nessuna stanza reale o bloccata
            let directlyTouchesRealRoom = false;
            for (const { r: dr, c: dc } of DIRS) {
                const nr = r + dr;
                const nc = c + dc;
                if (inBounds(nr, nc)) {
                    const t = grid[nr][nc];
                    if (t !== 'empty') {
                        directlyTouchesRealRoom = true;
                        break;
                    }
                }
            }

            if (directlyTouchesRealRoom) continue;

            // VINCOLO 2: Cerca stanze reali raggiungibili tramite 1 Red Room (adiacente alla candidata)
            const connectedRooms = new Set<string>();
            let touchesForbiddenRedRoom = false;

            for (const { r: dr, c: dc } of DIRS) {
                const redR = r + dr;
                const redC = c + dc;

                if (!inBounds(redR, redC)) continue;
                if (grid[redR][redC] !== 'empty') continue; // Deve essere una potenziale Red Room (spazio vuoto)

                // Controlliamo cosa tocca questa potenziale Red Room
                for (const d2 of DIRS) {
                    const targetR = redR + d2.r;
                    const targetC = redC + d2.c;

                    if (inBounds(targetR, targetC)) {
                        if (targetR === r && targetC === c) continue; // Salta la US stessa

                        const t = grid[targetR][targetC];

                        // Le Red Room NON possono connettere a Boss o Curse
                        if (t === 'boss' || t === 'curse') {
                            touchesForbiddenRedRoom = true;
                            break;
                        }

                        // Conta le stanze valide raggiunte (Normal, Start, Shop, Special)
                        if (t === 'normal' || t === 'start' || t === 'shop' || t === 'special') {
                            connectedRooms.add(`${targetR},${targetC}`);
                        }
                    }
                }
                if (touchesForbiddenRedRoom) break;
            }

            if (touchesForbiddenRedRoom) continue;

            const totalConnections = connectedRooms.size;
            if (totalConnections > 0) {
                let score = 0;
                if (totalConnections >= 3) score = 100;
                else if (totalConnections === 2) score = 50;
                else if (totalConnections === 1) score = 20;

                rawScores[r][c] = {
                    score,
                    percentage: 0,
                    reasons: [`${totalConnections} stanze connesse via Red Room`],
                };
            }
        }
    }

    return normalizePercentages(rawScores);
}

function normalizePercentages(raw: (CellAnalysis | null)[][]): AnalysisGrid {
    let totalScore = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (raw[r][c]) totalScore += raw[r][c]!.score;
        }
    }

    if (totalScore === 0) return raw;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (raw[r][c]) {
                raw[r][c]!.percentage = Math.round((raw[r][c]!.score / totalScore) * 100);
            }
        }
    }

    return raw;
}