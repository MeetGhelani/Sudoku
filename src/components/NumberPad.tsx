'use client';

import { RotateCcw, Eraser, Pencil, Lightbulb } from 'lucide-react';
import { Cell } from '@/lib/game-types';

interface NumberPadProps {
  onNumber: (n: number) => void;
  notesMode: boolean;
  onUndo: () => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  board: Cell[][];
}

/** Count how many times a number 1-9 appears on the board (correct non-zero values). */
function countNumber(board: Cell[][], n: number): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.value === n && !cell.isError) count++;
    }
  }
  return count;
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface ControlButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}

function ControlButton({ onClick, icon, label, active = false, badge }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative flex flex-col items-center justify-center gap-1.5',
        'flex-1 min-w-[64px] h-[52px] px-2 rounded-xl border',
        'transition-all duration-150 active:scale-95 cursor-pointer shadow-sm',
        active
          ? 'bg-[#2E2E2E] border-[#666666] text-[#FFFFFF] ring-1 ring-[#888888]'
          : 'bg-[#181818] border-[#262626] text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#252525] hover:border-[#383838]',
      ].join(' ')}
      aria-label={label}
      aria-pressed={active}
    >
      <div className="relative">
        {icon}
        {active && (
          <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-white shadow-sm" />
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-semibold leading-none tracking-wider uppercase">
          {label}
        </span>
        {badge && (
          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-white/20 text-white leading-none">
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

export default function NumberPad({
  onNumber,
  notesMode,
  onUndo,
  onErase,
  onToggleNotes,
  onHint,
  board,
}: NumberPadProps) {
  return (
    <div className="flex flex-col items-center gap-3.5 w-full max-w-[480px] select-none">
      {/* Control buttons row */}
      <div className="flex items-center justify-between gap-2 w-full">
        <ControlButton
          onClick={onUndo}
          icon={<RotateCcw size={17} strokeWidth={2} />}
          label="Undo"
        />
        <ControlButton
          onClick={onErase}
          icon={<Eraser size={17} strokeWidth={2} />}
          label="Erase"
        />
        <ControlButton
          onClick={onToggleNotes}
          icon={<Pencil size={17} strokeWidth={2} />}
          label="Notes"
          active={notesMode}
          badge={notesMode ? 'ON' : undefined}
        />
        <ControlButton
          onClick={onHint}
          icon={<Lightbulb size={17} strokeWidth={2} />}
          label="Hint"
        />
      </div>

      {/* Number buttons — 9 in a row */}
      <div className="grid grid-cols-9 gap-1.5 w-full">
        {NUMBERS.map((n) => {
          const placed = countNumber(board, n);
          const complete = placed >= 9;
          const remaining = Math.max(0, 9 - placed);

          return (
            <button
              key={n}
              onClick={() => onNumber(n)}
              disabled={complete}
              className={[
                'relative flex flex-col items-center justify-center',
                'h-12 rounded-xl border',
                'transition-all duration-150 active:scale-95',
                complete
                  ? 'opacity-25 bg-[#121212] border-transparent cursor-not-allowed text-[#444444]'
                  : 'bg-[#181818] border-[#262626] text-[#F2F2F2] hover:bg-[#282828] hover:border-[#404040] hover:text-white cursor-pointer shadow-sm',
              ].join(' ')}
              aria-label={`Enter number ${n}`}
            >
              <span className="text-[clamp(16px,3vw,21px)] font-bold leading-none">
                {n}
              </span>
              {!complete && (
                <span className="text-[9px] font-medium text-[#666666] leading-none mt-1">
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
