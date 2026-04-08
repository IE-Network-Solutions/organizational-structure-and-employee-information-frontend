import type { ReactNode } from 'react';

import './meetingFormSpacing.css';

/** Ant Design `Form` `requiredMark`: asterisk after label (default `*` uses `::before`, which conflicts with `::after` colon). */
export function meetingFormRequiredMark(
  label: ReactNode,
  { required }: { required: boolean },
): ReactNode {
  if (!required) return label;
  return (
    <>
      {label}
      <span
        className="text-[14px] font-normal leading-none text-[#ff4d4f]"
        style={{ marginInlineStart: 4 }}
        aria-hidden
        data-cy="meeting-form-required-asterisk"
      >
        *
      </span>
    </>
  );
}
