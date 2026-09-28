import { useState, useMemo } from 'react';
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-8 px-4 font-sans">
        <Analytics />
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-rose-500 uppercase drop-shadow-md">
            TBOI Secret Room Finder
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Map your floor layout to compute true probability rates for Secret, Super Secret, and Ultra Secret Rooms
          </p>
        </header>

        <Toolbar
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            onClear={handleClear}
        />

        <main className="flex justify-center items-center my-auto">
          <Grid
              grid={grid}
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
              analysis={analysis}
          />
        </main>

        <footer className="mt-8 text-center text-xs text-zinc-500 space-y-2">
          <div className="flex flex-wrap justify-center gap-4 text-zinc-400">
            <span>🖱️ <strong>Left Click:</strong> Place</span>
            <span>•</span>
            <span>⚡ <strong>Right Click:</strong> Toggle X (Obstacle)</span>
            <span>•</span>
            <span>🧹 <strong>Double Click:</strong> Clear Tile</span>
          </div>
          <p className="text-zinc-600 font-medium">
            Made by <span className="text-rose-400/90 font-semibold">GingisSem</span> for The Binding of Isaac community
          </p>
        </footer>
      </div>
  );
}