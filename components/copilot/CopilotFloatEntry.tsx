'use client';

import React, { useEffect, useState } from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useCopilotStore } from '@/store/uistate/features/copilot';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotAiEditIcon, { COPILOT_FLOAT_INDIGO } from './CopilotAiEditIcon';
import { COPILOT_THEME } from './copilotTheme';

/** Dashboard: 60×60 squircle, pill label 265×46, ~8–10px gap */
const BOT_BTN_WIDTH = 84;
const BOT_BTN_HEIGHT = 60;
const POPOVER_W = 265;
const POPOVER_H = 46;
const GAP = 9;
const HINT_KEY_PREFIX = 'copilot_float_hint_seen';

/**
 * Pill label + 60×60 tile — ~6px radius, 1px blue border, blue pencil + sparkle icon (20×20 asset).
 */
const CopilotFloatEntry: React.FC = () => {
  const { isOpen, setIsOpen, showBot, setShowBot } = useCopilotStore();
  const { token, userId } = useAuthenticationStore();
  const inset = COPILOT_THEME.floatInset;
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLoggedIn = Boolean(token && userId);
    if (!isLoggedIn) {
      setShowHint(false);
      return;
    }

    const hintKey = `${HINT_KEY_PREFIX}:${userId}`;
    const alreadySeen = window.sessionStorage.getItem(hintKey) === '1';
    if (alreadySeen) return;

    setShowHint(true);
    window.sessionStorage.setItem(hintKey, '1');

    const t = window.setTimeout(() => setShowHint(false), 5000);
    return () => window.clearTimeout(t);
  }, [token, userId]);

  const isLoggedIn = Boolean(token && userId);
  if (!isLoggedIn) return null;

  if (isOpen) return null;

  return (
    <div
      className="pointer-events-none z-[1050]"
      style={{
        position: 'fixed',
        bottom: inset,
        right: showBot ? 0 : inset,
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

        {showBot ? (
          <button
            type="button"
            onClick={() => setShowBot(false)}
            className="box-border inline-flex shrink-0 flex-col items-center justify-center border-0 shadow-md rounded-l-2xl"
            style={{
              width: 16,
              height: 60,
              backgroundColor: COPILOT_THEME.floatFabBorder,
              boxShadow: COPILOT_THEME.floatFabCollapsedShadow,
            }}
            aria-label="Open Chat With Copilot"
            id="copilot-float-trigger-vertical-pill"
            data-cy="copilot-float-trigger-vertical-pill"
          >
            <svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              data-cy="copilot-float-vertical-pill-sparkle"
            ></svg>
          </button>
        ) : (
          <div
            className="box-border inline-flex shrink-0 items-stretch overflow-hidden bg-white transition-[transform,box-shadow] hover:-translate-y-px"
            style={{
              width: BOT_BTN_WIDTH,
              height: BOT_BTN_HEIGHT,
              borderRadius: COPILOT_THEME.floatFabRadius,
              backgroundColor: COPILOT_THEME.floatFabBg,
              border: `${COPILOT_THEME.floatFabBorderWidth}px solid ${COPILOT_THEME.floatFabBorder}`,
              boxShadow: COPILOT_THEME.floatFabExpandedShadow,
              color: COPILOT_FLOAT_INDIGO,
            }}
            data-cy="copilot-float-expanded-trigger"
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex flex-1 items-center justify-center bg-transparent px-1 text-inherit transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]/40 border-none"
              aria-label="Open Chat With Copilot"
              id="copilot-float-trigger"
              data-cy="copilot-float-trigger"
            >
              <CopilotAiEditIcon size={28} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setShowBot(true)}
              className="flex items-center justify-center border-0 border-[#E5E7EB] bg-transparent px-1 text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]/40"
              aria-label="Collapse copilot launcher"
              data-cy="copilot-float-trigger-collapse"
            >
              <KeyboardArrowRightIcon
                sx={{ fontSize: 22 }}
                aria-hidden
                className="text-[#1e40af]"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopilotFloatEntry;
