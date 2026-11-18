'use client';

import type { Difficulty } from '@/lib/game-types';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {DIFFICULTIES.map((d) => {
        const isActive = d.value === value;
        return (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            className={[
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-100 select-none',
              isActive
                ? 'bg-[#303030] text-[#F2F2F2]'
                : 'text-[#555555] hover:text-[#858585]',
            ].join(' ')}
            aria-pressed={isActive}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
