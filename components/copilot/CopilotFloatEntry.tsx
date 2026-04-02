'use client';

import React, { useEffect, useState } from 'react';
import { useCopilotStore } from '@/store/uistate/features/copilot';
import CopilotAiEditIcon, { COPILOT_FLOAT_INDIGO } from './CopilotAiEditIcon';
import { COPILOT_THEME } from './copilotTheme';

/** Dashboard: 60×60 squircle, pill label 265×46, ~8–10px gap */
const FLOAT_BTN = 60;
const POPOVER_W = 265;
const POPOVER_H = 46;
const GAP = 9;
const HINT_KEY = 'copilot_float_hint_seen';

/**
 * Pill label + 60×60 tile — ~6px radius, 1px blue border, blue pencil + sparkle icon (20×20 asset).
 */
const CopilotFloatEntry: React.FC = () => {
  const { isOpen, setIsOpen } = useCopilotStore();
  const inset = COPILOT_THEME.floatInset;
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const alreadySeen = window.sessionStorage.getItem(HINT_KEY) === '1';
    if (alreadySeen) return;
    setShowHint(true);
    window.sessionStorage.setItem(HINT_KEY, '1');
    const t = window.setTimeout(() => setShowHint(false), 5000);
    return () => window.clearTimeout(t);
  }, []);

  if (isOpen) return null;

  return (
    <div
      className="pointer-events-none z-[1050]"
      style={{
        position: 'fixed',
        bottom: inset,
        right: inset,
      }}
      data-cy="copilot-float-entry"
    >
      <div
        className="pointer-events-auto flex items-center"
        style={{ gap: GAP }}
        role="group"
        aria-label="Chat With Copilot"
        data-cy="copilot-float-entry-row"
      >
        {showHint ? (
          <div
            className="relative box-border flex shrink-0 items-center justify-center border bg-white px-5"
            style={{
              width: 'min(265px, calc(100vw - 6rem))',
              maxWidth: POPOVER_W,
              height: POPOVER_H,
              borderRadius: 0,
              borderColor: COPILOT_THEME.floatPopoverBorder,
              boxShadow: COPILOT_THEME.floatPopoverShadow,
            }}
            data-cy="copilot-float-label"
          >
            <span
              className="select-none text-center text-[14px] font-medium leading-none text-[#374151]"
              data-cy="copilot-float-label-text"
            >
              Chat With Copilot
            </span>
            <span
              className="pointer-events-none absolute left-full top-1/2 z-0 -mt-[6px] border-y-[6px] border-l-[7px] border-y-transparent"
              style={{ borderLeftColor: COPILOT_THEME.floatPopoverBorder }}
              aria-hidden
              data-cy="copilot-float-label-caret-border"
            />
            <span
              className="pointer-events-none absolute left-full top-1/2 z-[1] -mt-[5px] ml-px border-y-[5px] border-l-[6px] border-y-transparent border-l-white"
              aria-hidden
              data-cy="copilot-float-label-caret-fill"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="box-border inline-flex shrink-0 items-center justify-center bg-white transition-[transform,box-shadow] hover:-translate-y-px active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-2"
          style={{
            width: FLOAT_BTN,
            height: FLOAT_BTN,
            borderRadius: COPILOT_THEME.floatFabRadius,
            backgroundColor: COPILOT_THEME.floatFabBg,
            border: `${COPILOT_THEME.floatFabBorderWidth}px solid ${COPILOT_THEME.floatFabBorder}`,
            boxShadow: COPILOT_THEME.floatFabShadow,
            color: COPILOT_FLOAT_INDIGO,
          }}
          aria-label="Open Chat With Copilot"
          id="copilot-float-trigger"
          data-cy="copilot-float-trigger"
        >
          <CopilotAiEditIcon size={28} aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default CopilotFloatEntry;
