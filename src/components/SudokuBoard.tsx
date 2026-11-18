'use client';

import { Cell } from '@/lib/game-types';
import SudokuCell from './SudokuCell';

interface SudokuBoardProps {
  board: Cell[][];
  selectedCell: { row: number; col: number } | null;
  highlightedCells: Set<string>;
  conflictCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

/**
 * Returns Tailwind border classes for a cell at (row, col).
 * - Outer border is handled on the container.
 * - Major 3×3 separators: right border after cols 2 & 5, bottom border after rows 2 & 5.
 * - Minor grid lines: 1px #383838 on right/bottom for all other cells.
 */
function cellBorderClasses(row: number, col: number): string {
  const classes: string[] = [];

  // Right border
  if (col === 2 || col === 5) {
    classes.push('border-r-2 border-r-[#777777]');
  } else if (col !== 8) {
    classes.push('border-r border-r-[#383838]');
  }

  // Bottom border
  if (row === 2 || row === 5) {
    classes.push('border-b-2 border-b-[#777777]');
  } else if (row !== 8) {
    classes.push('border-b border-b-[#383838]');
  }

  return classes.join(' ');
}

export default function SudokuBoard({
  board,
  selectedCell,
  highlightedCells,
  conflictCells,
  onCellClick,
}: SudokuBoardProps) {
  const selectedValue =
    selectedCell != null
      ? board[selectedCell.row][selectedCell.col].value
      : 0;

  return (
    <div
      className="w-full max-w-[480px] aspect-square border-2 border-[#777777] rounded-lg overflow-hidden"
      role="grid"
      aria-label="Sudoku board"
    >
      <div className="grid grid-cols-9 w-full h-full">
        {board.map((rowArr, r) =>
          rowArr.map((cell, c) => {
            const key = `${r},${c}`;
            const isSelected = selectedCell?.row === r && selectedCell?.col === c;
            const isHighlighted = highlightedCells.has(key);
            const isError = conflictCells.has(key) || cell.isError;
            const isMatchingNumber =
              selectedValue > 0 && cell.value === selectedValue && !isSelected;

            return (
              <div
                key={key}
                className={cellBorderClasses(r, c)}
                role="gridcell"
              >
                <SudokuCell
                  value={cell.value}
                  isGiven={cell.isGiven}
                  notes={cell.notes}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isMatchingNumber={isMatchingNumber}
                  isError={isError}
                  row={r}
                  col={c}
                  onClick={onCellClick}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
