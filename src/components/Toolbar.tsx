import React from 'react';
import type { RoomType, ActiveSecretMode } from '../types';

interface ToolbarProps {
    selectedTool: RoomType | 'eraser';
    setSelectedTool: (tool: RoomType | 'eraser') => void;
    activeMode: ActiveSecretMode;
    setActiveMode: (mode: ActiveSecretMode) => void;
    onClear: () => void;
}

const ROOM_BUTTONS: { type: RoomType | 'eraser'; label: string; color: string }[] = [
    { type: 'eraser', label: 'Eraser', color: 'bg-zinc-700 text-white' },
    { type: 'blocked', label: 'X (Blocked)', color: 'bg-red-950 text-red-400 border border-red-800' },
    { type: 'normal', label: 'Normal', color: 'bg-zinc-700 text-zinc-200' },
    { type: 'start', label: 'Start', color: 'bg-blue-600 text-white' },
    { type: 'special', label: 'Special ★', color: 'bg-amber-700 text-white' },
    { type: 'curse', label: 'Curse ☽', color: 'bg-red-900 text-red-200 border border-red-700' },
    { type: 'shop', label: 'Shop', color: 'bg-yellow-600 text-white' },
    { type: 'boss', label: 'Boss', color: 'bg-purple-700 text-white' },
    { type: 'secret', label: 'Secret (S)', color: 'bg-blue-500 text-white' },
    { type: 'super_secret', label: 'Super (SS)', color: 'bg-pink-600 text-white' },
    { type: 'ultra_secret', label: 'Ultra (US)', color: 'bg-rose-700 text-white' },
    { type: 'red', label: 'Red Room', color: 'bg-red-600 text-white' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
                                                    selectedTool,
                                                    setSelectedTool,
                                                    activeMode,
                                                    setActiveMode,
                                                    onClear,
                                                }) => {
    return (
        <div className="flex flex-col gap-3.5 px-4 py-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-2xl max-w-6xl w-full mx-auto mb-6 backdrop-blur-md">
            <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto py-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1.5">
          Brush:
        </span>
                {ROOM_BUTTONS.map((btn) => (
                    <button
                        key={btn.type}
                        onClick={() => setSelectedTool(btn.type)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${btn.color} ${
                            selectedTool === btn.type
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 shadow-md'
                                : 'opacity-85 hover:opacity-100'
                        }`}
                    >
                        {btn.label}
                    </button>
                ))}
                <button
                    onClick={onClear}
                    className="ml-auto px-2.5 py-1 bg-red-950/60 text-red-300 border border-red-800/60 rounded-md text-[11px] font-bold hover:bg-red-900 transition-all whitespace-nowrap shrink-0"
                >
                    Clear Floor
                </button>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1.5">
          Analyze:
        </span>
                {[
                    { mode: 'none', label: 'Off' },
                    { mode: 'secret', label: 'Secret (S)' },
                    { mode: 'super_secret', label: 'Super Secret (SS)' },
                    { mode: 'ultra_secret', label: 'Ultra Secret (US)' },
                ].map(({ mode, label }) => (
                    <button
                        key={mode}
                        onClick={() => setActiveMode(activeMode === mode ? 'none' : (mode as ActiveSecretMode))}
                        className={`px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap transition-all ${
                            activeMode === mode
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-900'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};