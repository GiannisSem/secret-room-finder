import { useState, useMemo, useEffect } from 'react';
import type { RoomType, ActiveSecretMode, AnalysisGrid } from './types';
import { GRID_SIZE, analyzeSecret, analyzeSuperSecret, analyzeUltraSecret } from './utils/analyzer';
import { Toolbar } from './components/Toolbar';
import { Grid } from './components/Grid';
import { Analytics } from "@vercel/analytics/react"

export default function App() {
    const [grid, setGrid] = useState<RoomType[][]>(() =>
        Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty'))
    );
    const [selectedTool, setSelectedTool] = useState<RoomType | 'eraser'>('normal');
    const [activeMode, setActiveMode] = useState<ActiveSecretMode>('none');

    // Gestione Hotkeys (0-9)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key) {
                case '0': setSelectedTool('eraser'); break;
                case '1': setSelectedTool('normal'); break;
                case '2': setSelectedTool('start'); break;
                case '3': setSelectedTool('special'); break;
                case '4': setSelectedTool('curse'); break;
                case '5': setSelectedTool('shop'); break;
                case '6': setSelectedTool('boss'); break;
                case '7': setSelectedTool('secret'); break;
                case '8': setSelectedTool('super_secret'); break;
                case '9': setSelectedTool('ultra_secret'); break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleCellClick = (r: number, c: number, isRightClick = false) => {
        setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            if (isRightClick) {
                next[r][c] = next[r][c] === 'blocked' ? 'empty' : 'blocked';
            } else {
                next[r][c] = selectedTool === 'eraser' ? 'empty' : selectedTool;
            }
            return next;
        });
    };

    const handleCellDoubleClick = (r: number, c: number) => {
        setGrid((prev) => {
            const next = prev.map((row) => [...row]);
            next[r][c] = 'empty';
            return next;
        });
    };

    const handleClear = () => {
        setGrid(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty')));
        setActiveMode('none');
    };

    const isRoomAlreadyPlaced = (mode: ActiveSecretMode): boolean => {
        if (mode === 'none') return false;
        return grid.some((row) => row.includes(mode as RoomType));
    };

    const analysis: AnalysisGrid | null = useMemo(() => {
        if (activeMode === 'none' || isRoomAlreadyPlaced(activeMode)) {
            return null;
        }
        if (activeMode === 'secret') return analyzeSecret(grid);
        if (activeMode === 'super_secret') return analyzeSuperSecret(grid);
        if (activeMode === 'ultra_secret') return analyzeUltraSecret(grid);
        return null;
    }, [grid, activeMode]);

    return (
        // Aggiunti colori di sfondo e testo dinamici per Light/Dark Mode
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col items-center py-8 px-4 font-sans transition-colors duration-200">
            <Analytics />
            <header className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-rose-600 dark:text-rose-500 uppercase drop-shadow-md">
                    TBOI Secret Room Finder
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                    Map your floor layout to compute true probability rates for Secret, Super Secret, and Ultra Secret Rooms
                </p>
            </header>

            {/* Pannello Istruzioni Spostato Sopra e Ampliato */}
            <div className="mb-6 max-w-3xl text-center text-sm bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                <div className="flex flex-wrap justify-center gap-4 text-gray-800 dark:text-zinc-300 font-medium mb-3">
                    <span>🖱️ <strong>Left Click:</strong> Place</span>
                    <span>•</span>
                    <span>⚡ <strong>Right Click:</strong> Toggle X (Blocked)</span>
                    <span>•</span>
                    <span>🧹 <strong>Double Click:</strong> Clear Tile</span>
                    <span>•</span>
                    <span>⌨️ <strong>Hotkeys 1-9:</strong> Select Room (0 = Eraser)</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-500 flex flex-col gap-1 mt-3 border-t border-gray-100 dark:border-zinc-800 pt-3">
                    <p><strong>💡 Irregular rooms (large or narrow):</strong> For rooms that span multiple cells or have L-shapes, use the X on the outer walls where the game cannot physically generate doors.</p>
                    <p><strong>🛑 When to use the X (Blocked):</strong> Place it in cells or along edges where you are certain there is an obstacle (e.g., pits or immovable rocks) preventing a Secret Room from spawning in that spot.</p>
                </div>
            </div>

            <Toolbar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                onClear={handleClear}
            />

            <main className="flex justify-center items-center my-auto mt-4">
                <Grid
                    grid={grid}
                    onCellClick={handleCellClick}
                    onCellDoubleClick={handleCellDoubleClick}
                    analysis={analysis}
                />
            </main>

            <footer className="mt-8 text-center text-xs text-gray-500 dark:text-zinc-500 space-y-2">
                <p className="font-medium">
                    Made by <span className="text-rose-600 dark:text-rose-400/90 font-semibold">GingisSem</span> for The Binding of Isaac community
                </p>
            </footer>
        </div>
    );
}