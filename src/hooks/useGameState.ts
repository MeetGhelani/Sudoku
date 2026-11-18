'use client';

import { useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import type { Cell, Difficulty, GameSettings, GameState, HistoryEntry } from '@/lib/game-types';
import { generatePuzzle } from '@/lib/sudoku-generator';
import { getHint } from '@/lib/sudoku-solver';
import { validateBoard, isComplete } from '@/lib/sudoku-validator';
import { saveGame, loadGame } from '@/lib/game-persistence';
import { pushHistory, undoMove } from '@/lib/move-history';
import { sound } from '@/lib/sound';
import type { Notice } from '@/components/ErrorBanner';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildBoard(puzzle: number[][]): Cell[][] {
  return puzzle.map((row) =>
    row.map((v) => ({
      value: v,
      isGiven: v !== 0,
      notes: new Set<number>(),
      isError: false,
    }))
  );
}

function boardAsGrid(board: Cell[][]): number[][] {
  return board.map((row) => row.map((cell) => cell.value));
}

/** Deep-clone a Cell[][] (Sets are not structurally shared). */
function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      notes: new Set(cell.notes),
    }))
  );
}

function defaultSettings(): GameSettings {
  return {
    soundEnabled: true,
    highlightErrors: true,
    showTimer: true,
    autoCheck: true,
  };
}

const emptyGrid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

function initialGameState(): GameState {
  return {
    puzzle: emptyGrid,
    solution: emptyGrid,
    board: buildBoard(emptyGrid),
    selectedCell: null,
    difficulty: 'easy',
    mistakes: 0,
    maxMistakes: 3,
    timer: 0,
    isRunning: false,
    isPaused: false,
    isComplete: false,
    isGameOver: false,
    notesMode: false,
    history: [],
    settings: defaultSettings(),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'NEW_GAME'; difficulty: Difficulty }
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'ENTER_NUMBER'; num: number }
  | { type: 'ERASE_CELL' }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_NOTES' }
  | { type: 'HINT' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'TICK' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    // -----------------------------------------------------------------------
    case 'LOAD_STATE':
      return action.payload;

    // -----------------------------------------------------------------------
    case 'NEW_GAME': {
      const { puzzle, solution } = generatePuzzle(action.difficulty);
      const next: GameState = {
        ...state,
        puzzle,
        solution,
        board: buildBoard(puzzle),
        selectedCell: null,
        difficulty: action.difficulty,
        mistakes: 0,
        timer: 0,
        isRunning: true,
        isPaused: false,
        isComplete: false,
        isGameOver: false,
        notesMode: false,
        history: [],
      };
      saveGame(next);
      return next;
    }

    // -----------------------------------------------------------------------
    case 'SELECT_CELL': {
      return {
        ...state,
        selectedCell: { row: action.row, col: action.col },
      };
    }

    // -----------------------------------------------------------------------
    case 'ENTER_NUMBER': {
      const { selectedCell, board, solution, notesMode, settings } = state;
      if (!selectedCell) return state;

      const { row, col } = selectedCell;
      const cell = board[row][col];

      // Cannot edit given cells
      if (cell.isGiven) return state;

      const newBoard = cloneBoard(board);

      if (notesMode) {
        // Notes mode: toggle note if cell is not a confirmed value cell
        if (cell.value !== 0) return state; // already has a placed value — no-op
        const noteSet = new Set(newBoard[row][col].notes);
        if (noteSet.has(action.num)) {
          noteSet.delete(action.num);
        } else {
          noteSet.add(action.num);
        }
        newBoard[row][col] = { ...newBoard[row][col], notes: noteSet };
        const next = { ...state, board: newBoard };
        saveGame(next);
        return next;
      }

      // Normal mode
      const correct = solution[row][col] === action.num;

      if (!correct) {
        const shouldMark = settings.highlightErrors || settings.autoCheck;
        if (shouldMark) {
          newBoard[row][col] = { ...newBoard[row][col], isError: true, value: action.num };
        }
        const newMistakes = state.mistakes + 1;
        const isGameOver = newMistakes >= state.maxMistakes;
        const next: GameState = {
          ...state,
          board: newBoard,
          mistakes: newMistakes,
          isGameOver,
          isRunning: !isGameOver,
        };
        saveGame(next);
        return next;
      }

      // Correct placement
      const prevValue = cell.value;
      const prevNotes = Array.from(cell.notes);
      newBoard[row][col] = {
        ...newBoard[row][col],
        value: action.num,
        isError: false,
        notes: new Set(),
      };

      // Remove this number from notes in same row, col, box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const inRow = r === row;
          const inCol = c === col;
          const inBox =
            r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3;
          if ((inRow || inCol || inBox) && !(r === row && c === col)) {
            const noteSet = new Set(newBoard[r][c].notes);
            if (noteSet.has(action.num)) {
              noteSet.delete(action.num);
              newBoard[r][c] = { ...newBoard[r][c], notes: noteSet };
            }
          }
        }
      }

      const entry: HistoryEntry = {
        row,
        col,
        prevValue,
        prevNotes,
        newValue: action.num,
        newNotes: [],
      };
      const newHistory = pushHistory(state.history, entry);
      const boardComplete = isComplete(newBoard, solution);

      const next: GameState = {
        ...state,
        board: newBoard,
        history: newHistory,
        isComplete: boardComplete,
        isRunning: !boardComplete,
      };
      saveGame(next);
      return next;
    }

    // -----------------------------------------------------------------------
    case 'ERASE_CELL': {
      const { selectedCell, board } = state;
      if (!selectedCell) return state;

      const { row, col } = selectedCell;
      const cell = board[row][col];
      if (cell.isGiven) return state;
      if (cell.value === 0 && cell.notes.size === 0) return state;

      const newBoard = cloneBoard(board);
      const prevValue = cell.value;
      const prevNotes = Array.from(cell.notes);
      newBoard[row][col] = {
        ...newBoard[row][col],
        value: 0,
        notes: new Set(),
        isError: false,
      };

      const entry: HistoryEntry = {
        row,
        col,
        prevValue,
        prevNotes,
        newValue: 0,
        newNotes: [],
      };
      const newHistory = pushHistory(state.history, entry);
      const next = { ...state, board: newBoard, history: newHistory };
      saveGame(next);
      return next;
    }

    // -----------------------------------------------------------------------
    case 'UNDO': {
      const { board: newBoard, history: newHistory } = undoMove(
        cloneBoard(state.board),
        state.history
      );
      const next = { ...state, board: newBoard, history: newHistory };
      saveGame(next);
      return next;
    }

    // -----------------------------------------------------------------------
    case 'TOGGLE_NOTES':
      return { ...state, notesMode: !state.notesMode };

    // -----------------------------------------------------------------------
    case 'HINT': {
      const hintResult = getHint(state.solution, state.board);
      if (!hintResult) return state;

      const { row, col, value } = hintResult;
      const newBoard = cloneBoard(state.board);
      const prevValue = newBoard[row][col].value;
      const prevNotes = Array.from(newBoard[row][col].notes);
      newBoard[row][col] = {
        ...newBoard[row][col],
        value,
        isGiven: false,
        isError: false,
        notes: new Set(),
      };

      // Also clear this number from notes in peers
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const inRow = r === row;
          const inCol = c === col;
          const inBox =
            r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3;
          if ((inRow || inCol || inBox) && !(r === row && c === col)) {
            const noteSet = new Set(newBoard[r][c].notes);
            if (noteSet.has(value)) {
              noteSet.delete(value);
              newBoard[r][c] = { ...newBoard[r][c], notes: noteSet };
            }
          }
        }
      }

      const entry: HistoryEntry = {
        row,
        col,
        prevValue,
        prevNotes,
        newValue: value,
        newNotes: [],
      };
      const newHistory = pushHistory(state.history, entry);
      const boardComplete = isComplete(newBoard, state.solution);

      const next: GameState = {
        ...state,
        board: newBoard,
        history: newHistory,
        selectedCell: { row, col },
        isComplete: boardComplete,
        isRunning: !boardComplete,
      };
      saveGame(next);
      return next;
    }

    // -----------------------------------------------------------------------
    case 'TOGGLE_PAUSE': {
      if (state.isComplete || state.isGameOver) return state;
      return { ...state, isPaused: !state.isPaused };
    }

    // -----------------------------------------------------------------------
    case 'TICK': {
      if (!state.isRunning || state.isPaused || state.isComplete || state.isGameOver) {
        return state;
      }
      return { ...state, timer: state.timer + 1 };
    }

    // -----------------------------------------------------------------------
    case 'UPDATE_SETTINGS': {
      const next = {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
      saveGame(next);
      return next;
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseGameState {
  state: GameState;
  selectCell: (row: number, col: number) => void;
  enterNumber: (num: number) => void;
  eraseCell: () => void;
  undo: () => void;
  toggleNotes: () => void;
  hint: () => void;
  togglePause: () => void;
  newGame: (difficulty: Difficulty) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  highlightedCells: Set<string>;
  conflictCells: Set<string>;
  notice: Notice | null;
  dismissNotice: () => void;
  shakingCell: { row: number; col: number } | null;
}

export function useGameState(): UseGameState {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    // On first render (SSR-safe): return a placeholder; we'll load on mount.
    return initialGameState();
  });

  const [notice, setNotice] = useState<Notice | null>(null);
  const [shakingCell, setShakingCell] = useState<{ row: number; col: number } | null>(null);

  // Auto-dismiss notice after 4 seconds
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice((curr) => (curr?.id === notice.id ? null : curr));
    }, 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Victory chime when puzzle complete
  useEffect(() => {
    if (state.isComplete && state.settings.soundEnabled) {
      sound.playWin();
    }
  }, [state.isComplete, state.settings.soundEnabled]);

  // On mount: attempt to restore a saved game or generate a new game
  useEffect(() => {
    const saved = loadGame();
    if (saved && saved.puzzle && saved.puzzle.some((r) => r.some((v) => v !== 0))) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    } else {
      dispatch({ type: 'NEW_GAME', difficulty: 'easy' });
    }
  }, []);

  // Timer tick
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // -------------------------------------------------------------------------
  // Callbacks with UX feedback & sound
  // -------------------------------------------------------------------------

  const selectCell = useCallback((row: number, col: number) => {
    if (state.settings.soundEnabled) {
      sound.playSelect();
    }
    dispatch({ type: 'SELECT_CELL', row, col });
  }, [state.settings.soundEnabled]);

  const enterNumber = useCallback((num: number) => {
    const { selectedCell, board, solution, notesMode, settings, mistakes, maxMistakes } = state;
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];

    // Warning if trying to edit a given cell
    if (cell.isGiven) {
      if (settings.soundEnabled) sound.playError();
      setShakingCell({ row, col });
      setNotice({
        message: 'Starting clues cannot be modified',
        type: 'warning',
        id: Date.now(),
      });
      setTimeout(() => setShakingCell(null), 380);
      return;
    }

    if (notesMode) {
      if (cell.value !== 0) {
        if (settings.soundEnabled) sound.playError();
        setNotice({
          message: 'Cell is already filled — erase first to add pencil notes',
          type: 'warning',
          id: Date.now(),
        });
        return;
      }
      if (settings.soundEnabled) sound.playNote();
      dispatch({ type: 'ENTER_NUMBER', num });
      return;
    }

    // Normal mode: check correctness
    const isCorrect = solution[row][col] === num;
    if (!isCorrect) {
      if (settings.soundEnabled) sound.playError();
      const newMistakes = mistakes + 1;
      setShakingCell({ row, col });
      setTimeout(() => setShakingCell(null), 380);
      setNotice({
        message: `Incorrect: ${num} does not belong here • Mistake ${newMistakes} of ${maxMistakes}`,
        type: 'error',
        id: Date.now(),
      });
    } else {
      if (settings.soundEnabled) sound.playPlace();
      setNotice(null);
    }

    dispatch({ type: 'ENTER_NUMBER', num });
  }, [state]);

  const eraseCell = useCallback(() => {
    const { selectedCell, board, settings } = state;
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isGiven) {
      if (settings.soundEnabled) sound.playError();
      setShakingCell({ row, col });
      setNotice({
        message: 'Starting clues cannot be erased',
        type: 'warning',
        id: Date.now(),
      });
      setTimeout(() => setShakingCell(null), 380);
      return;
    }

    if (settings.soundEnabled) sound.playErase();
    setNotice(null);
    dispatch({ type: 'ERASE_CELL' });
  }, [state]);

  const undo = useCallback(() => {
    if (state.settings.soundEnabled) sound.playClick();
    setNotice(null);
    dispatch({ type: 'UNDO' });
  }, [state.settings.soundEnabled]);

  const toggleNotes = useCallback(() => {
    if (state.settings.soundEnabled) sound.playNote();
    const nextMode = !state.notesMode;
    setNotice({
      message: nextMode ? 'Pencil Notes mode enabled (1-9 to add notes)' : 'Normal mode enabled',
      type: 'info',
      id: Date.now(),
    });
    dispatch({ type: 'TOGGLE_NOTES' });
  }, [state.notesMode, state.settings.soundEnabled]);

  const hint = useCallback(() => {
    if (state.settings.soundEnabled) sound.playPlace();
    setNotice({
      message: 'Hint revealed correct number',
      type: 'info',
      id: Date.now(),
    });
    dispatch({ type: 'HINT' });
  }, [state.settings.soundEnabled]);

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  const newGame = useCallback((difficulty: Difficulty) => {
    setNotice(null);
    setShakingCell(null);
    dispatch({ type: 'NEW_GAME', difficulty });
  }, []);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  const dismissNotice = useCallback(() => {
    setNotice(null);
  }, []);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  const highlightedCells = useMemo<Set<string>>(() => {
    const { selectedCell, board } = state;
    const result = new Set<string>();
    if (!selectedCell) return result;

    const { row, col } = selectedCell;
    const selectedValue = board[row]?.[col]?.value ?? 0;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const inRow = r === row;
        const inCol = c === col;
        const inBox =
          r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3;
        const sameValue =
          selectedValue !== 0 && board[r]?.[c]?.value === selectedValue;

        if (inRow || inCol || inBox || sameValue) {
          result.add(`${r},${c}`);
        }
      }
    }

    return result;
  }, [state.selectedCell, state.board]);

  const conflictCells = useMemo<Set<string>>(() => {
    return validateBoard(boardAsGrid(state.board));
  }, [state.board]);

  // -------------------------------------------------------------------------

  return {
    state,
    selectCell,
    enterNumber,
    eraseCell,
    undo,
    toggleNotes,
    hint,
    togglePause,
    newGame,
    updateSettings,
    highlightedCells,
    conflictCells,
    notice,
    dismissNotice,
    shakingCell,
  };
}
