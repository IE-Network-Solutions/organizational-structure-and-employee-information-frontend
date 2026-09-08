'use client';

import React from 'react';

export type CheckinInbox = 'mine' | 'assigned';

const OPTIONS: { value: CheckinInbox; label: string }[] = [
  { value: 'mine', label: 'Mine' },
  { value: 'assigned', label: 'Assigned' },
];

export default function CheckinInboxToggle({
  value,
  onChange,
}: {
  value: CheckinInbox;
  onChange: (next: CheckinInbox) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Check-in inbox"
      className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-1.5 sm:shrink-0 sm:flex-nowrap"
      data-cy="bsc-checkin-inbox-toggle"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-cy={`bsc-checkin-inbox-${option.value}`}
            onClick={() => onChange(option.value)}
            className={[
              'inline-flex h-9 shrink-0 items-center rounded-md border font-medium transition-colors',
              'text-xs sm:text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/45 focus-visible:ring-offset-2',
              isActive
                ? 'border-slate-200 bg-white px-2.5 text-slate-800 shadow-sm hover:bg-slate-100 sm:px-3'
                : 'border-transparent bg-transparent px-2 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800 sm:px-2.5',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
