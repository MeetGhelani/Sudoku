export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Cell {
  value: number; // 0 = empty
  isGiven: boolean;
  notes: Set<number>;
  isError: boolean;
}

export interface GameState {
  puzzle: number[][]; // original puzzle (0 = empty)
  solution: number[][]; // the solved grid
  board: Cell[][]; // current user board
  selectedCell: { row: number; col: number } | null;
  difficulty: Difficulty;
  mistakes: number;
  maxMistakes: number;
  timer: number; // seconds elapsed
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  isGameOver: boolean;
  notesMode: boolean;
  history: HistoryEntry[];
  settings: GameSettings;
}

export interface HistoryEntry {
  row: number;
  col: number;
  prevValue: number;
  prevNotes: number[]; // use arrays not Set for serialization
  newValue: number;
  newNotes: number[];
}

export interface GameSettings {
  soundEnabled: boolean;
  highlightErrors: boolean;
  showTimer: boolean;
  autoCheck: boolean;
}
