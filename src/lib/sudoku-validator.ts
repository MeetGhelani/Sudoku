import type { Cell } from './game-types';

/**
 * Scan `grid` for Sudoku constraint violations.
 * Returns a Set of "row,col" strings for every cell that participates in
 * at least one duplicate within its row, column or 3×3 box.
 */
export function validateBoard(grid: number[][]): Set<string> {
  const conflicts = new Set<string>();

  function markConflicts(cells: Array<{ row: number; col: number; val: number }>): void {
    const seen = new Map<number, { row: number; col: number }>();
    for (const { row, col, val } of cells) {
      if (val === 0) continue;
      if (seen.has(val)) {
        const prev = seen.get(val)!;
        conflicts.add(`${prev.row},${prev.col}`);
        conflicts.add(`${row},${col}`);
      } else {
        seen.set(val, { row, col });
      }
    }
  }

  // Check rows
  for (let r = 0; r < 9; r++) {
    markConflicts(
      grid[r].map((val, c) => ({ row: r, col: c, val })),
    );
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    markConflicts(
      grid.map((row, r) => ({ row: r, col: c, val: row[c] })),
    );
  }

  // Check 3×3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const cells: Array<{ row: number; col: number; val: number }> = [];
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          cells.push({ row: r, col: c, val: grid[r][c] });
        }
      }
      markConflicts(cells);
    }
  }

  return conflicts;
}

/**
 * Returns true if every cell on `board` has a non-zero value that matches
 * the corresponding cell in `solution`.
 */
export function isComplete(board: Cell[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value === 0) return false;
      if (board[r][c].value !== solution[r][c]) return false;
    }
  }
  return true;
}
