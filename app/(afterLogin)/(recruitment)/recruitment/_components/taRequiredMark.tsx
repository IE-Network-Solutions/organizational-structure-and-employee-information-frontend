'use client';

import React from 'react';

type TaRequiredMarkProps = {
  'data-cy'?: string;
};

export function TaRequiredMark({ 'data-cy': dataCy }: TaRequiredMarkProps) {
  return (
    <span
      className="inline-flex shrink-0 translate-y-[0.04em] items-center text-[1em] font-bold leading-[1.2] text-[#FF4D4F]"
      aria-hidden
      data-cy={dataCy}
    >
      *
    </span>
  );
}
