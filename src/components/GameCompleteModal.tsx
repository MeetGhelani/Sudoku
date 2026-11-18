'use client';

import type { Difficulty } from '@/lib/game-types';
import { DIFFICULTY_CONFIG } from '@/lib/difficulty-config';

interface GameCompleteModalProps {
  isComplete: boolean;
  isGameOver: boolean;
  timer: number;
  difficulty: Difficulty;
  onNewGame: (d: Difficulty) => void;
  onRetry: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function GameCompleteModal({
  isComplete,
  isGameOver,
  timer,
  difficulty,
  onNewGame,
  onRetry,
}: GameCompleteModalProps) {
  const isVisible = isComplete || isGameOver;
  if (!isVisible) return null;

  const label = DIFFICULTY_CONFIG[difficulty].label;

  return (
    /* Full-screen overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      style={{ animation: 'modalFade 300ms ease' }}
    >
      <div
        className="bg-[#181818] border border-[#383838] rounded-2xl p-8 w-80 flex flex-col items-center gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isGameOver ? (
          <>
            {/* Game Over */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-[#F2F2F2] text-xl font-semibold tracking-tight">
                Game Over
              </span>
              <span className="text-[#555555] text-sm">
                Too many mistakes — better luck next time
              </span>
            </div>

            <div className="h-px bg-[#383838] w-full" />

            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-[#858585] text-xs uppercase tracking-widest">
                Difficulty
              </span>
              <span className="text-[#F2F2F2] text-sm">{label}</span>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onRetry}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#282828] text-[#F2F2F2] hover:bg-[#303030] transition-colors duration-100"
              >
                Retry
              </button>
              <button
                onClick={() => onNewGame(difficulty)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#F2F2F2] text-[#101010] hover:bg-[#DEDEDE] transition-colors duration-100"
              >
                New Game
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Puzzle Complete */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-[#F2F2F2] text-xl font-semibold tracking-tight">
                Puzzle Complete
              </span>
              <span className="text-[#555555] text-sm">
                Well done!
              </span>
            </div>

            <div className="h-px bg-[#383838] w-full" />

            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[#858585] text-xs uppercase tracking-widest">
                  Time
                </span>
                <span className="text-[#F2F2F2] text-lg font-mono">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[#858585] text-xs uppercase tracking-widest">
                  Difficulty
                </span>
                <span className="text-[#F2F2F2] text-sm">{label}</span>
              </div>
            </div>

            <button
              onClick={() => onNewGame(difficulty)}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-[#F2F2F2] text-[#101010] hover:bg-[#DEDEDE] transition-colors duration-100"
            >
              New Game
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
