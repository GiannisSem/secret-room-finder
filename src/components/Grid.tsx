import React, { useState, useMemo } from 'react';
import type { RoomType, AnalysisGrid } from '../types';
import { GRID_SIZE } from '../utils/analyzer';

interface GridProps {
    grid: RoomType[][];
    onCellClick: (r: number, c: number, isRightClick?: boolean) => void;
    onCellDoubleClick: (r: number, c: number) => void;
    analysis: AnalysisGrid | null;
}

const ROOM_COLORS: Record<RoomType, string> = {
    empty: 'bg-zinc-950/80 hover:bg-zinc-800/60 border-zinc-800/60',
    blocked: 'bg-red-950/40 border-red-900/60 text-red-500 font-bold',
    normal: 'bg-zinc-700 border-zinc-500 text-zinc-100',
    start: 'bg-blue-600 border-blue-400 text-white',
    boss: 'bg-purple-700 border-purple-400 text-white',
    shop: 'bg-yellow-600 border-yellow-400 text-white',
    curse: 'bg-red-900 border-red-700 text-red-200',
    special: 'bg-amber-700 border-amber-500 text-white',
    secret: 'bg-blue-500 border-blue-300 text-white',
    super_secret: 'bg-pink-600 border-pink-400 text-white',
    ultra_secret: 'bg-rose-700 border-rose-400 text-white',
    red: 'bg-red-600 border-red-400 text-white',
};

const ROOM_LABELS: Partial<Record<RoomType, string>> = {
    blocked: '✕',
    start: 'ST',
    boss: 'B',
    shop: 'S',
    curse: '☽',
    special: '★',
    secret: 'S',
    super_secret: 'SS',
    ultra_secret: 'US',
    red: 'R',
};

export const Grid: React.FC<GridProps> = ({
                                              grid,
                                              onCellClick,
                                              onCellDoubleClick,
                                              analysis,
                                          }) => {
    const [isMouseDown, setIsMouseDown] = useState(false);

    const maxPercentage = useMemo(() => {
        if (!analysis) return 0;
        let max = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = analysis[r][c];
                if (cell && cell.percentage > max) {
                    max = cell.percentage;
                }
            }
        }
        return max;
    }, [analysis]);

    const handleMouseDown = (r: number, c: number, e: React.MouseEvent) => {
        e.preventDefault();
        setIsMouseDown(true);
        onCellClick(r, c, e.button === 2);
    };

    const handleMouseEnter = (r: number, c: number, e: React.MouseEvent) => {
        if (isMouseDown) {
            onCellClick(r, c, e.buttons === 2);
        }
    };

    return (
        <div
            className="inline-block p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-2xl select-none backdrop-blur-md"
            onMouseUp={() => setIsMouseDown(false)}
            onMouseLeave={() => setIsMouseDown(false)}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div
                className="grid gap-1.5"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                }}
            >
                {grid.map((row, r) =>
                    row.map((cellType, c) => {
                        const cellAnalysis = analysis ? analysis[r][c] : null;
                        const hasAnalysis = cellAnalysis && cellAnalysis.percentage > 0;

                        let dynamicStyle = ROOM_COLORS[cellType];
                        let content: React.ReactNode = ROOM_LABELS[cellType] || null;

                        if (cellType === 'empty' && hasAnalysis) {
                            const p = cellAnalysis.percentage;
                            const isBest = p === maxPercentage && maxPercentage > 0;

                            if (isBest) {
                                dynamicStyle =
                                    'bg-amber-500 border-amber-300 text-zinc-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-300 animate-pulse font-black';
                            } else if (p >= 50) {
                                dynamicStyle = 'bg-emerald-600/90 border-emerald-400 text-white';
                            } else if (p >= 25) {
                                dynamicStyle = 'bg-emerald-700/70 border-emerald-500 text-emerald-100';
                            } else {
                                dynamicStyle = 'bg-emerald-950/60 border-emerald-800 text-emerald-300';
                            }

                            content = (
                                <div className="flex flex-col items-center justify-center leading-none">
                                    <span className="text-[11px] font-extrabold">{p}%</span>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={`${r}-${c}`}
                                onMouseDown={(e) => handleMouseDown(r, c, e)}
                                onMouseEnter={(e) => handleMouseEnter(r, c, e)}
                                onDoubleClick={() => onCellDoubleClick(r, c)}
                                title={cellAnalysis?.reasons.join(' | ')}
                                className={`w-10 h-10 rounded-md border flex items-center justify-center cursor-pointer text-xs font-bold transition-all duration-75 ${dynamicStyle}`}
                            >
                                {content}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};