import type { Cell, HistoryEntry } from './game-types';

const MAX_HISTORY = 100;

/**
 * Push a new entry onto the history stack.
 * Caps the array at MAX_HISTORY entries (oldest entries are discarded first).
 */
export function pushHistory(
  history: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  const next = [...history, entry];
  if (next.length > MAX_HISTORY) {
    return next.slice(next.length - MAX_HISTORY);
  }
  return next;
}

/**
 * Undo the most recent move.
 *
 * Returns:
 * - `board`   — a new deep-copied board with the move reverted
 * - `history` — the history array with the last entry removed
 * - `undone`  — the entry that was undone, or null if history was empty
 */
export function undoMove(
  board: Cell[][],
  history: HistoryEntry[],
): { board: Cell[][]; history: HistoryEntry[]; undone: HistoryEntry | null } {
  if (history.length === 0) {
    return { board, history, undone: null };
  }

  const newHistory = history.slice(0, history.length - 1);
  const undone = history[history.length - 1];

  // Deep-copy the board so callers always get a new reference
  const newBoard: Cell[][] = board.map((row) =>
    row.map((cell) => ({ ...cell, notes: new Set(cell.notes) })),
  );

  const { row, col, prevValue, prevNotes } = undone;
  newBoard[row][col] = {
    ...newBoard[row][col],
    value: prevValue,
    notes: new Set(prevNotes),
    isError: false,
  };

  return { board: newBoard, history: newHistory, undone };
}
