import type { GameState, Cell } from './game-types';

const STORAGE_KEY = 'sudoku-game';

/** Serialisable shape stored in localStorage */
interface SerializedCell {
  value: number;
  isGiven: boolean;
  notes: number[];
  isError: boolean;
}

type SerializedBoard = SerializedCell[][];

interface SerializedState extends Omit<GameState, 'board'> {
  board: SerializedBoard;
}

function cellToSerial(cell: Cell): SerializedCell {
  return {
    value: cell.value,
    isGiven: cell.isGiven,
    notes: Array.from(cell.notes),
    isError: cell.isError,
  };
}

function serialToCell(s: SerializedCell): Cell {
  return {
    value: s.value,
    isGiven: s.isGiven,
    notes: new Set(s.notes),
    isError: s.isError,
  };
}

/** Persist the current game state to localStorage. */
export function saveGame(state: GameState): void {
  if (typeof window === 'undefined') return;

  const serialized: SerializedState = {
    ...state,
    board: state.board.map((row) => row.map(cellToSerial)),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Ignore quota / security errors
  }
}

/** Load a previously saved game from localStorage. Returns null on failure. */
export function loadGame(): GameState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SerializedState;

    const state: GameState = {
      ...parsed,
      board: parsed.board.map((row) => row.map(serialToCell)),
    };

    return state;
  } catch {
    return null;
  }
}

/** Remove the saved game from localStorage. */
export function clearGame(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
