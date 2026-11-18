'use client';

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface Notice {
  message: string;
  type: 'error' | 'warning' | 'info';
  id: number;
}

interface ErrorBannerProps {
  notice: Notice | null;
  onDismiss: () => void;
}

export default function ErrorBanner({ notice, onDismiss }: ErrorBannerProps) {
  if (!notice) return null;

  const isError = notice.type === 'error';
  const isWarning = notice.type === 'warning';

  return (
    <div className="w-full max-w-[480px] px-1 -mb-1 animate-toast">
      <div
        className={[
          'flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border shadow-lg transition-all',
          isError
            ? 'bg-[#2A1414] border-red-500/40 text-red-200'
            : isWarning
            ? 'bg-[#262010] border-amber-500/40 text-amber-200'
            : 'bg-[#1C1C1C] border-[#383838] text-[#F2F2F2]',
        ].join(' ')}
        role="alert"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isError ? (
            <AlertCircle size={15} className="text-red-400 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          ) : (
            <Info size={15} className="text-[#858585] shrink-0" />
          )}
          <span className="truncate">{notice.message}</span>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss warning"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
