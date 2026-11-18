'use client';

interface SudokuCellProps {
  value: number;
  isGiven: boolean;
  notes: Set<number>;
  isSelected: boolean;
  isHighlighted: boolean;
  isMatchingNumber: boolean;
  isError: boolean;
  isShaking?: boolean;
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
  isShaking = false,
  row,
  col,
  onClick,
}: SudokuCellProps) {
  const showNumber = value > 0;
  const showNotes = !showNumber && notes.size > 0;

  // Background styling priority: selected > error > matching > highlighted > default
  let bgClass: string;
  if (isSelected) {
    bgClass = isError ? 'bg-[#3A1818] ring-1 ring-inset ring-red-500/80' : 'bg-[#333333]';
  } else if (isError) {
    bgClass = 'bg-[#2D1414] ring-1 ring-inset ring-red-500/50';
  } else if (isMatchingNumber && value > 0) {
    bgClass = 'bg-[#2A2A2A]';
  } else if (isHighlighted) {
    bgClass = 'bg-[#222222]';
  } else {
    bgClass = 'bg-[#181818]';
  }

  // Text color
  let textClass: string;
  if (isError) {
    textClass = 'text-red-400 font-bold';
  } else if (isGiven) {
    textClass = isMatchingNumber && !isSelected
      ? 'text-[#FFFFFF] font-bold'
      : 'text-[#F5F5F5] font-bold';
  } else {
    textClass = isMatchingNumber && !isSelected
      ? 'text-[#FFFFFF] font-medium'
      : 'text-[#D4D4D4] font-medium';
  }

  return (
    <button
      className={[
        'relative w-full h-full flex items-center justify-center',
        'transition-colors duration-100 cursor-pointer select-none',
        'outline-none focus-visible:ring-1 focus-visible:ring-[#888888]',
        bgClass,
        'hover:brightness-110 active:brightness-95',
        isShaking ? 'animate-cell-shake z-10' : '',
      ].join(' ')}
      onClick={() => onClick(row, col)}
      aria-label={`Cell row ${row + 1} column ${col + 1}${value ? `, value ${value}` : ''}${isError ? ', has error' : ''}`}
      aria-pressed={isSelected}
    >
      {showNumber && (
        <span
          className={[
            'text-[clamp(16px,2.8vw,24px)] leading-none select-none',
            textClass,
          ].join(' ')}
        >
          {value}
        </span>
      )}

      {showNotes && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[2px] pointer-events-none">
          {NOTE_POSITIONS.map((n) => (
            <span
              key={n}
              className={[
                'flex items-center justify-center text-[clamp(8px,1.1vw,11px)] font-medium leading-none',
                notes.has(n) ? 'text-[#888888]' : 'text-transparent',
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
