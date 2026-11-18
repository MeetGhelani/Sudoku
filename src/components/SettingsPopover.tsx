'use client';

import { X } from 'lucide-react';
import type { GameSettings } from '@/lib/game-types';

interface SettingsPopoverProps {
  settings: GameSettings;
  onUpdate: (s: Partial<GameSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-150 focus:outline-none',
        checked ? 'bg-[#F2F2F2]' : 'bg-[#383838]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-150',
          checked ? 'translate-x-5 bg-[#101010]' : 'translate-x-0 bg-[#555555]',
        ].join(' ')}
      />
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-[#F2F2F2] text-sm">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsPopover({
  settings,
  onUpdate,
  isOpen,
  onClose,
}: SettingsPopoverProps) {
  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Popover panel — stop click propagation so clicks inside don't close */}
      <div
        className="relative bg-[#181818] border border-[#383838] rounded-xl p-5 w-72 shadow-2xl"
        style={{ animation: 'fadeIn 150ms ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#F2F2F2] text-sm font-medium tracking-wide">
            Settings
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#555555] hover:text-[#858585] hover:bg-[#282828] transition-colors duration-100"
            aria-label="Close settings"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#383838] mb-3" />

        {/* Toggle rows */}
        <div className="divide-y divide-[#282828]">
          <ToggleRow
            label="Highlight Errors"
            checked={settings.highlightErrors}
            onChange={(v) => onUpdate({ highlightErrors: v })}
          />
          <ToggleRow
            label="Show Timer"
            checked={settings.showTimer}
            onChange={(v) => onUpdate({ showTimer: v })}
          />
          <ToggleRow
            label="Auto-check"
            checked={settings.autoCheck}
            onChange={(v) => onUpdate({ autoCheck: v })}
          />
          <ToggleRow
            label="Sound"
            checked={settings.soundEnabled}
            onChange={(v) => onUpdate({ soundEnabled: v })}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
