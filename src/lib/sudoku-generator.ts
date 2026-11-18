import type { Difficulty } from './game-types';
import { DIFFICULTY_CONFIG } from './difficulty-config';
import { isValidPlacement } from './sudoku-solver';
import { countSolutions } from './sudoku-solver';

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a fully-solved valid 9×9 Sudoku grid using backtracking
 * with randomly shuffled candidates so each call produces a unique puzzle.
 */
export function generateSolvedGrid(): number[][] {
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== 0) continue;

        const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of candidates) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solve()) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
    return true;
  }

  solve();
  return grid;
}

/**
 * Returns true when the given (potentially incomplete) grid has exactly
 * one solution.
 */
export function hasUniqueSolution(grid: number[][]): boolean {
  return countSolutions(grid, 2) === 1;
}

/**
 * Generate a Sudoku puzzle for the given difficulty level.
 * Returns the puzzle (with 0 for empty cells) and the full solution.
 */
export function generatePuzzle(
  difficulty: Difficulty,
): { puzzle: number[][]; solution: number[][] } {
  const solution = generateSolvedGrid();
  const { minClues, maxClues } = DIFFICULTY_CONFIG[difficulty];

  // Target number of clues (randomly within the difficulty band)
  const targetClues =
    minClues + Math.floor(Math.random() * (maxClues - minClues + 1));

  // Start with a full copy of the solution and remove cells one by one
  const puzzle: number[][] = solution.map((row) => [...row]);

  // Build a shuffled list of all 81 positions
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 })),
  );

  let cluesRemaining = 81;

  for (const { row, col } of positions) {
    if (cluesRemaining <= targetClues) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    if (hasUniqueSolution(puzzle)) {
      cluesRemaining--;
    } else {
      // Restoring keeps the puzzle uniquely solvable
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}
