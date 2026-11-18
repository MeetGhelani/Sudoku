'use client';

import { Settings } from 'lucide-react';
import type { Difficulty } from '@/lib/game-types';
import DifficultySelector from './DifficultySelector';

interface GameHeaderProps {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onOpenSettings: () => void;
}

function SudokuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {/* 3×3 grid of rounded squares */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 7 + 0.5}
            y={row * 7 + 0.5}
            width="5"
            height="5"
            rx="1"
            fill="#555555"
          />
        ))
      )}
    </svg>
  );
}

export default function GameHeader({
  difficulty,
  onDifficultyChange,
  onOpenSettings,
}: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between w-full h-12 select-none">
      {/* Left: icon + wordmark */}
      <div className="flex items-center gap-2 min-w-0">
        <SudokuIcon />
        <span className="text-[#858585] text-sm font-medium tracking-wide">
          Sudoku
        </span>
      </div>

      {/* Center: difficulty pills */}
      <div className="flex-1 flex justify-center">
        <DifficultySelector value={difficulty} onChange={onDifficultyChange} />
      </div>

      {/* Right: settings */}
      <div className="flex items-center">
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-[#555555] hover:text-[#858585] hover:bg-[#1C1C1C] transition-colors duration-100"
          aria-label="Open settings"
        >
          <Settings size={16} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}
