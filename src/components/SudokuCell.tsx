'use client';

import { Cell } from '@/lib/game-types';

interface SudokuCellProps {
  value: number;
  isGiven: boolean;
  notes: Set<number>;
  isSelected: boolean;
  isHighlighted: boolean;
  isMatchingNumber: boolean;
  isError: boolean;
  row: number;
  col: number;
  onClick: (row: number, col: number) => void;
}

const NOTE_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function SudokuCell({
  value,
  isGiven,
  notes,
  isSelected,
  isHighlighted,
  isMatchingNumber,
  isError,
  row,
  col,
  onClick,
}: SudokuCellProps) {
  const showNumber = value > 0;
  const showNotes = !showNumber && notes.size > 0;

  // Background color priority: selected > matching > highlighted > default
  let bgClass: string;
  if (isSelected) {
    bgClass = 'bg-[#303030]';
  } else if (isMatchingNumber && value > 0) {
    bgClass = 'bg-[#252525]';
  } else if (isHighlighted) {
    bgClass = 'bg-[#222222]';
  } else {
    bgClass = 'bg-[#1C1C1C]';
  }

  // Text color
  let textClass: string;
  if (isError) {
    textClass = 'text-[#888888]';
  } else if (isGiven) {
    textClass = isMatchingNumber && !isSelected
      ? 'text-[#EAEAEA] font-semibold'
      : 'text-[#F2F2F2] font-semibold';
  } else {
    textClass = isMatchingNumber && !isSelected
      ? 'text-[#EAEAEA]'
      : 'text-[#D0D0D0]';
  }

  return (
    <button
      className={[
        'relative w-full aspect-square flex items-center justify-center',
        'transition-colors duration-100 cursor-pointer select-none',
        'outline-none focus-visible:ring-1 focus-visible:ring-[#777777]',
        bgClass,
        'hover:bg-[#282828]',
        isSelected ? '!bg-[#303030]' : '',
      ].join(' ')}
      onClick={() => onClick(row, col)}
      aria-label={`Cell row ${row + 1} column ${col + 1}${value ? `, value ${value}` : ''}`}
      aria-pressed={isSelected}
    >
      {showNumber && (
        <span
          className={[
            'text-[clamp(14px,2.4vw,22px)] leading-none',
            textClass,
          ].join(' ')}
        >
          {value}
        </span>
      )}

      {showNotes && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[1px] pointer-events-none">
          {NOTE_POSITIONS.map((n) => (
            <span
              key={n}
              className={[
                'flex items-center justify-center text-[clamp(6px,0.9vw,9px)] leading-none',
                notes.has(n) ? 'text-[#555555]' : 'text-transparent',
              ].join(' ')}
            >
              {n}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
