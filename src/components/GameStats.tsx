'use client';

import { Pause, Play, Clock, AlertCircle } from 'lucide-react';

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
  const hasMistakes = mistakes > 0;

  return (
    <div className="flex items-center justify-between w-full max-w-[480px] px-1 select-none">
      {/* Left: Timer + Pause button */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] border border-[#262626]">
          <Clock size={13} className="text-[#666666]" />
          <span className="text-[#D4D4D4] text-xs font-mono tracking-wider">
            {displayTime}
          </span>
        </div>

        {isRunning && (
          <button
            onClick={onTogglePause}
            className={[
              'p-1.5 rounded-full transition-all duration-150',
              'bg-[#181818] border border-[#262626] text-[#888888] hover:text-[#FFFFFF] hover:bg-[#252525]',
              isPaused ? 'text-amber-400 border-amber-500/50 bg-[#252010]' : '',
            ].join(' ')}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play size={13} strokeWidth={2} />
            ) : (
              <Pause size={13} strokeWidth={2} />
            )}
          </button>
        )}
      </div>

      {/* Right: Mistakes indicator with clear styling */}
      <div
        className={[
          'flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200',
          hasMistakes
            ? 'bg-[#2A1414] border-red-500/50 text-red-300'
            : 'bg-[#181818] border-[#262626] text-[#888888]',
        ].join(' ')}
      >
        <span className="text-[11px] font-medium tracking-wide uppercase">
          Mistakes
        </span>

        <div className="flex items-center gap-1">
          {Array.from({ length: maxMistakes }, (_, i) => {
            const isMade = i < mistakes;
            return (
              <span
                key={i}
                className={[
                  'text-xs font-bold transition-all duration-150',
                  isMade ? 'text-red-400 scale-110' : 'text-[#444444]',
                ].join(' ')}
                aria-hidden="true"
              >
                ✕
              </span>
            );
          })}
        </div>

        <span
          className={[
            'text-xs font-semibold ml-0.5',
            hasMistakes ? 'text-red-400' : 'text-[#777777]',
          ].join(' ')}
        >
          {mistakes}/{maxMistakes}
        </span>
      </div>
    </div>
  );
}
