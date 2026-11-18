'use client';

import { useMemo } from 'react';
import { Cell } from '@/lib/game-types';
import SudokuCell from './SudokuCell';

interface SudokuBoardProps {
  board: Cell[][];
  selectedCell: { row: number; col: number } | null;
  highlightedCells: Set<string>;
  conflictCells: Set<string>;
  shakingCell?: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
}

export default function SudokuBoard({
  board,
  selectedCell,
  highlightedCells,
  conflictCells,
  shakingCell,
  onCellClick,
}: SudokuBoardProps) {
  const selectedValue =
    selectedCell != null
      ? board[selectedCell.row]?.[selectedCell.col]?.value ?? 0
      : 0;

  // Pre-calculate 3×3 blocks for optimal render performance
  const blocks = useMemo(() => {
    return Array.from({ length: 9 }, (_, b) => {
      const bRow = Math.floor(b / 3);
      const bCol = b % 3;
      return Array.from({ length: 9 }, (_, p) => {
        const pRow = Math.floor(p / 3);
        const pCol = p % 3;
        return {
          row: bRow * 3 + pRow,
          col: bCol * 3 + pCol,
        };
      });
    });
  }, []);

  return (
    <div
      className="w-full max-w-[480px] aspect-square rounded-2xl overflow-hidden border-2 border-[#555555] bg-[#555555] grid grid-cols-3 grid-rows-3 gap-[2px] shadow-2xl p-[1px] select-none"
      role="grid"
      aria-label="Sudoku board"
    >
      {blocks.map((blockCells, blockIdx) => (
        <div
          key={blockIdx}
          className="grid grid-cols-3 grid-rows-3 gap-[1px] bg-[#303030] w-full h-full overflow-hidden"
        >
          {blockCells.map(({ row, col }) => {
            const cell = board[row]?.[col];
            if (!cell) return null;

            const key = `${row},${col}`;
            const isSelected = selectedCell?.row === row && selectedCell?.col === col;
            const isHighlighted = highlightedCells.has(key);
            const isError = conflictCells.has(key) || cell.isError;
            const isMatchingNumber =
              selectedValue > 0 && cell.value === selectedValue && !isSelected;
            const isShaking = shakingCell?.row === row && shakingCell?.col === col;

            return (
              <div key={key} className="w-full h-full relative" role="gridcell">
                <SudokuCell
                  value={cell.value}
                  isGiven={cell.isGiven}
                  notes={cell.notes}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isMatchingNumber={isMatchingNumber}
                  isError={isError}
                  isShaking={isShaking}
                  row={row}
                  col={col}
                  onClick={onCellClick}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
