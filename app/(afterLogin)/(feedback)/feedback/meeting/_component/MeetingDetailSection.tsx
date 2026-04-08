'use client';

import type { ReactNode } from 'react';

/** Panel shell: full width of parent, min 81px height, 8px radius, 9px gap, 1px border, padding 8/12/8/12 */
export const meetingDetailSectionClassName =
  'flex flex-col gap-[9px] w-full max-w-full min-w-0 min-h-[81px] rounded-lg border border-solid border-[#D9D9D9] pt-2 pr-3 pb-2 pl-3 box-border opacity-100';

export default function MeetingDetailSection({
  children,
  className,
  'data-cy': dataCy,
}: {
  children: ReactNode;
  className?: string;
  'data-cy'?: string;
}) {
  return (
    <div
      className={`${meetingDetailSectionClassName}${className ? ` ${className}` : ''}`}
      data-cy={dataCy}
    >
      {children}
    </div>
  );
}
