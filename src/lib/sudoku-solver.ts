import type { Cell } from './game-types';

/**
 * Check whether placing `num` at (row, col) in `grid` is valid
 * according to Sudoku rules. The cell itself is treated as empty.
 */
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number,
): boolean {
  // Row check
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }

  // Column check
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }

  // 3×3 box check
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === num) return false;
    }
  }

  return true;
}

/**
 * Deep-clone a 9×9 number grid.
 */
function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

function getBoxIndex(r: number, c: number): number {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

/**
 * Solve `grid` in-place using backtracking with MRV (Minimum Remaining Values) heuristic.
 * Returns true if a solution was found.
 */
function backtrackMRV(
  grid: number[][],
  rowMasks: number[],
  colMasks: number[],
  boxMasks: number[],
): boolean {
  let minCandidates = 10;
  let bestR = -1;
  let bestC = -1;
  let bestMask = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const b = getBoxIndex(r, c);
        const used = rowMasks[r] | colMasks[c] | boxMasks[b];
        const avail = (~used) & 0x3fe; // bits 1..9
        let count = 0;
        for (let num = 1; num <= 9; num++) {
          if ((avail & (1 << num)) !== 0) count++;
        }

        if (count === 0) return false; // Dead end

        if (count < minCandidates) {
          minCandidates = count;
          bestR = r;
          bestC = c;
          bestMask = avail;
          if (count === 1) break; // Can't beat 1 candidate
        }
      }
    }
    if (minCandidates === 1) break;
  }

  // If no empty cell found, grid is solved!
  if (bestR === -1) return true;

  const b = getBoxIndex(bestR, bestC);
  for (let num = 1; num <= 9; num++) {
    const bit = 1 << num;
    if ((bestMask & bit) !== 0) {
      grid[bestR][bestC] = num;
      rowMasks[bestR] |= bit;
      colMasks[bestC] |= bit;
      boxMasks[b] |= bit;

      if (backtrackMRV(grid, rowMasks, colMasks, boxMasks)) return true;

      // Undo
      grid[bestR][bestC] = 0;
      rowMasks[bestR] &= ~bit;
      colMasks[bestC] &= ~bit;
      boxMasks[b] &= ~bit;
    }
  }

  return false;
}

/**
 * Return a solved copy of `grid`, or null if unsolvable.
 */
export function solveSudoku(grid: number[][]): number[][] | null {
  const copy = cloneGrid(grid);
  const rowMasks = new Array(9).fill(0);
  const colMasks = new Array(9).fill(0);
  const boxMasks = new Array(9).fill(0);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = copy[r][c];
      if (val !== 0) {
        const bit = 1 << val;
        const b = getBoxIndex(r, c);
        rowMasks[r] |= bit;
        colMasks[c] |= bit;
        boxMasks[b] |= bit;
      }
    }
  }

  if (backtrackMRV(copy, rowMasks, colMasks, boxMasks)) return copy;
  return null;
}

/**
 * Count the number of solutions up to `limit` using MRV heuristic.
 * Stops early once the count reaches the limit.
 */
export function countSolutions(grid: number[][], limit: number): number {
  let count = 0;
  const copy = cloneGrid(grid);
  const rowMasks = new Array(9).fill(0);
  const colMasks = new Array(9).fill(0);
  const boxMasks = new Array(9).fill(0);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = copy[r][c];
      if (val !== 0) {
        const bit = 1 << val;
        const b = getBoxIndex(r, c);
        rowMasks[r] |= bit;
        colMasks[c] |= bit;
        boxMasks[b] |= bit;
      }
    }
  }

  function solve(): void {
    if (count >= limit) return;

    let minCandidates = 10;
    let bestR = -1;
    let bestC = -1;
    let bestMask = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (copy[r][c] === 0) {
          const b = getBoxIndex(r, c);
          const used = rowMasks[r] | colMasks[c] | boxMasks[b];
          const avail = (~used) & 0x3fe;
          let cCount = 0;
          for (let num = 1; num <= 9; num++) {
            if ((avail & (1 << num)) !== 0) cCount++;
          }

          if (cCount === 0) return;

          if (cCount < minCandidates) {
            minCandidates = cCount;
            bestR = r;
            bestC = c;
            bestMask = avail;
            if (cCount === 1) break;
          }
        }
      }
      if (minCandidates === 1) break;
    }

    if (bestR === -1) {
      count++;
      return;
    }

    const b = getBoxIndex(bestR, bestC);
    for (let num = 1; num <= 9; num++) {
      const bit = 1 << num;
      if ((bestMask & bit) !== 0) {
        copy[bestR][bestC] = num;
        rowMasks[bestR] |= bit;
        colMasks[bestC] |= bit;
        boxMasks[b] |= bit;

        solve();

        copy[bestR][bestC] = 0;
        rowMasks[bestR] &= ~bit;
        colMasks[bestC] &= ~bit;
        boxMasks[b] &= ~bit;

        if (count >= limit) return;
      }
    }
  }

  solve();
  return count;
}

/**
 * Return a hint: the first empty or incorrect cell (reading order) whose value in
 * `solution` differs from `board`, giving the correct value.
 * Returns null if no hint is available (board is complete or matches solution).
 */
export function getHint(
  solution: number[][],
  board: Cell[][],
): { row: number; col: number; value: number } | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board[row][col];
      if (!cell.isGiven && cell.value !== solution[row][col]) {
        return { row, col, value: solution[row][col] };
      }
    }
  }
  return null;
}
