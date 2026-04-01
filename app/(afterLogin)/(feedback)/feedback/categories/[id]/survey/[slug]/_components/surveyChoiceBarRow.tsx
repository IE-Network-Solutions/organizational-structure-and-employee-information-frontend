'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */

import React from 'react';

/** Progress bar row for choice question summaries (Insights + Responses tab). */
export function SurveyChoiceBarRow({
  label,
  pct,
}: {
  label: string;
  pct: number;
}) {
  return (
    <div className="mb-2 flex min-w-0 items-center gap-2 last:mb-0 sm:gap-3">
      <span
        className="max-w-[40%] shrink-0 truncate text-xs text-gray-600 sm:max-w-[36%]"
        title={label}
      >
        {label}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#1E40AF]/85 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-gray-800 sm:w-10">
        {pct}%
      </span>
    </div>
  );
}
