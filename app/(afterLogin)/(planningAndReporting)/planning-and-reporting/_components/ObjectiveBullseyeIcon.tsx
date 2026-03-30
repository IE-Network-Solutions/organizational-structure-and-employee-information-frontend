import React from 'react';
import { PR_PRIMARY } from './planningUiTokens';

/** Two concentric blue rings + center dot (objective / bullseye). */
export function ObjectiveBullseyeIcon({
  dataCy = 'planning-reporting-objective-icon',
}: {
  dataCy?: string;
}) {
  return (
    <span
      className="relative flex h-8 w-8 shrink-0 items-center justify-center pt-0.5"
      data-cy={dataCy}
    >
      <span
        className="absolute h-[26px] w-[26px] rounded-full border-2 bg-white"
        style={{ borderColor: PR_PRIMARY }}
        data-cy="planning-reporting-objective-ring-outer"
        aria-hidden
      />
      <span
        className="absolute h-[14px] w-[14px] rounded-full border bg-white"
        style={{ borderColor: PR_PRIMARY }}
        data-cy="planning-reporting-objective-ring-inner"
        aria-hidden
      />
      <span
        className="relative z-10 h-1.5 w-1.5 rounded-full md:h-2 md:w-2"
        style={{ backgroundColor: PR_PRIMARY }}
        data-cy="planning-reporting-objective-dot"
        aria-hidden
      />
    </span>
  );
}
