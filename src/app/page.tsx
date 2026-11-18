'use client';

import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import GameHeader from '@/components/GameHeader';
import GameStats from '@/components/GameStats';
import SudokuBoard from '@/components/SudokuBoard';
import NumberPad from '@/components/NumberPad';
import SettingsPopover from '@/components/SettingsPopover';
import GameCompleteModal from '@/components/GameCompleteModal';
import type { Difficulty } from '@/lib/game-types';

export default function Page() {
  const {
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
  } = useGameState();

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Keyboard handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // 1-9: enter number
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        enterNumber(parseInt(e.key, 10));
        return;
      }

      // Backspace / Delete: erase
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        eraseCell();
        return;
      }

      // N: toggle notes
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        toggleNotes();
        return;
      }

      // Ctrl+Z / Cmd+Z: undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Arrow keys: move selected cell
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const { selectedCell } = state;
        const row = selectedCell?.row ?? 4;
        const col = selectedCell?.col ?? 4;

        let nextRow = row;
        let nextCol = col;
        if (e.key === 'ArrowUp')    nextRow = Math.max(0, row - 1);
        if (e.key === 'ArrowDown')  nextRow = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft')  nextCol = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') nextCol = Math.min(8, col + 1);

        selectCell(nextRow, nextCol);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, enterNumber, eraseCell, toggleNotes, undo, selectCell]);

  const handleNewGame = (d: Difficulty) => {
    newGame(d);
  };

  const handleRetry = () => {
    newGame(state.difficulty);
  };

  return (
    <main className="min-h-screen bg-[#101010] flex flex-col items-center justify-start sm:justify-center px-4 py-4 sm:py-6 select-none">
      <div className="w-full max-w-[480px] flex flex-col gap-4">
        <GameHeader
          difficulty={state.difficulty}
          onDifficultyChange={(d) => newGame(d)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <GameStats
          timer={state.timer}
          mistakes={state.mistakes}
          maxMistakes={state.maxMistakes}
          isPaused={state.isPaused}
          showTimer={state.settings.showTimer}
          isRunning={state.isRunning}
          onTogglePause={togglePause}
        />
        <SudokuBoard
          board={state.board}
          selectedCell={state.selectedCell}
          highlightedCells={highlightedCells}
          conflictCells={conflictCells}
          onCellClick={selectCell}
        />
        <NumberPad
          onNumber={enterNumber}
          notesMode={state.notesMode}
          onUndo={undo}
          onErase={eraseCell}
          onToggleNotes={toggleNotes}
          onHint={hint}
          board={state.board}
        />
      </div>

      <SettingsPopover
        settings={state.settings}
        onUpdate={updateSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <GameCompleteModal
        isComplete={state.isComplete}
        isGameOver={state.isGameOver}
        timer={state.timer}
        difficulty={state.difficulty}
        onNewGame={handleNewGame}
        onRetry={handleRetry}
      />
    </main>
  );
}
