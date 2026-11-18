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

/** Count how many times a number 1-9 appears in the board (non-zero values). */
function countNumber(board: Cell[][], n: number): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.value === n) count++;
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
}

function ControlButton({ onClick, icon, label, active = false }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center gap-1',
        'min-w-[44px] min-h-[44px] px-3 py-2 rounded',
        'transition-colors duration-100',
        active
          ? 'text-[#F2F2F2] bg-[#303030]'
          : 'text-[#555555] hover:text-[#858585] hover:bg-[#1C1C1C]',
      ].join(' ')}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
      <span className="text-[10px] leading-none tracking-wide uppercase">{label}</span>
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
    <div className="flex flex-col items-center gap-4 w-full max-w-[480px]">
      {/* Number buttons — 9 in a row */}
      <div className="grid grid-cols-9 gap-1 w-full">
        {NUMBERS.map((n) => {
          const placed = countNumber(board, n);
          const complete = placed >= 9;
          return (
            <button
              key={n}
              onClick={() => onNumber(n)}
              disabled={complete}
              className={[
                'flex items-center justify-center',
                'min-h-[44px] rounded',
                'text-[clamp(16px,3vw,22px)] font-semibold leading-none',
                'transition-colors duration-100',
                complete
                  ? 'opacity-30 cursor-not-allowed text-[#F2F2F2]'
                  : 'text-[#F2F2F2] hover:bg-[#303030] active:bg-[#383838] cursor-pointer',
              ].join(' ')}
              aria-label={`Enter ${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-2 w-full">
        <ControlButton
          onClick={onUndo}
          icon={<RotateCcw size={18} strokeWidth={1.8} />}
          label="Undo"
        />
        <ControlButton
          onClick={onErase}
          icon={<Eraser size={18} strokeWidth={1.8} />}
          label="Erase"
        />
        <ControlButton
          onClick={onToggleNotes}
          icon={<Pencil size={18} strokeWidth={1.8} />}
          label="Notes"
          active={notesMode}
        />
        <ControlButton
          onClick={onHint}
          icon={<Lightbulb size={18} strokeWidth={1.8} />}
          label="Hint"
        />
      </div>
    </div>
  );
}
