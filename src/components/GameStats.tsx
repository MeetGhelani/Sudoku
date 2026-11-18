'use client';

import { Pause, Play } from 'lucide-react';

interface GameStatsProps {
  timer: number;
  mistakes: number;
  maxMistakes: number;
  isPaused: boolean;
  showTimer: boolean;
  isRunning: boolean;
  onTogglePause: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function GameStats({
  timer,
  mistakes,
  maxMistakes,
  isPaused,
  showTimer,
  isRunning,
  onTogglePause,
}: GameStatsProps) {
  const displayTime = !showTimer || isPaused ? '--:--' : formatTime(timer);

  return (
    <div className="flex items-center justify-between w-full max-w-[480px] px-1">
      {/* Timer */}
      <div className="flex items-center gap-2">
        <span className="text-[#858585] text-sm font-mono tracking-wider select-none">
          {displayTime}
        </span>
      </div>

      {/* Pause button */}
      {isRunning && (
        <button
          onClick={onTogglePause}
          className={[
            'p-1.5 rounded transition-colors duration-100',
            'text-[#555555] hover:text-[#858585] hover:bg-[#1C1C1C]',
          ].join(' ')}
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
        >
          {isPaused ? (
            <Play size={15} strokeWidth={1.8} />
          ) : (
            <Pause size={15} strokeWidth={1.8} />
          )}
        </button>
      )}

      {/* Mistakes */}
      <div className="flex items-center gap-1 select-none">
        {Array.from({ length: maxMistakes }, (_, i) => (
          <span
            key={i}
            className={[
              'text-sm transition-colors duration-150',
              i < mistakes ? 'text-[#858585]' : 'text-[#333333]',
            ].join(' ')}
            aria-hidden="true"
          >
            ✕
          </span>
        ))}
        <span className="text-[#555555] text-xs ml-1">
          {mistakes}/{maxMistakes}
        </span>
      </div>
    </div>
  );
}
