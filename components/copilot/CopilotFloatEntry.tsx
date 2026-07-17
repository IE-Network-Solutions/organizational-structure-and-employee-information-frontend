'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { RightOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useCopilotStore } from '@/store/uistate/features/copilot';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotAiEditIcon from './CopilotAiEditIcon';
import { COPILOT_THEME } from './copilotTheme';

const COLLAPSED_SIZE = 56;
const EXPANDED_WIDTH = 268;
const EXPANDED_HEIGHT = 56;
const POSITION_KEY_PREFIX = 'copilot_float_position';
const COPILOT_ROUTE = '/copilot';
const DRAG_THRESHOLD_PX = 6;

type FloatPosition = { left: number; top: number };

function clampPosition(
  left: number,
  top: number,
  width: number,
  height: number,
  inset: number,
): FloatPosition {
  if (typeof window === 'undefined') return { left, top };
  const maxLeft = Math.max(inset, window.innerWidth - width - inset);
  const maxTop = Math.max(inset, window.innerHeight - height - inset);
  return {
    left: Math.min(Math.max(inset, left), maxLeft),
    top: Math.min(Math.max(inset, top), maxTop),
  };
}

function getDefaultPosition(
  width: number,
  height: number,
  inset: number,
): FloatPosition {
  if (typeof window === 'undefined') return { left: inset, top: inset };
  return clampPosition(
    window.innerWidth - width - inset,
    window.innerHeight - height - inset,
    width,
    height,
    inset,
  );
}

function loadStoredPosition(
  userId: string | undefined,
  width: number,
  height: number,
  inset: number,
): FloatPosition {
  if (typeof window === 'undefined' || !userId) {
    return getDefaultPosition(width, height, inset);
  }
  try {
    const raw = window.localStorage.getItem(`${POSITION_KEY_PREFIX}:${userId}`);
    if (!raw) return getDefaultPosition(width, height, inset);
    const parsed = JSON.parse(raw) as FloatPosition;
    if (
      typeof parsed.left !== 'number' ||
      typeof parsed.top !== 'number' ||
      !Number.isFinite(parsed.left) ||
      !Number.isFinite(parsed.top)
    ) {
      return getDefaultPosition(width, height, inset);
    }
    return clampPosition(parsed.left, parsed.top, width, height, inset);
  } catch {
    return getDefaultPosition(width, height, inset);
  }
}

/**
 * Draggable Copilot launcher — collapsed FAB or expanded unified pill.
 */
const CopilotFloatEntry: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { showBot, setShowBot } = useCopilotStore();
  const { token, userId } = useAuthenticationStore();
  const inset = COPILOT_THEME.floatInset;
  const [position, setPosition] = useState<FloatPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0,
  });
  const suppressClickRef = useRef(false);
  const skipCollapseAnchorRef = useRef(true);
  const rowRef = useRef<HTMLDivElement>(null);

  const isCollapsed = showBot;
  const launcherWidth = isCollapsed ? COLLAPSED_SIZE : EXPANDED_WIDTH;
  const launcherHeight = isCollapsed ? COLLAPSED_SIZE : EXPANDED_HEIGHT;

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;
    setPosition(
      loadStoredPosition(userId, EXPANDED_WIDTH, EXPANDED_HEIGHT, inset),
    );
  }, [userId, inset]);

  useEffect(() => {
    if (!position || typeof window === 'undefined') return;
    setPosition((prev) =>
      prev
        ? clampPosition(
            prev.left,
            prev.top,
            launcherWidth,
            launcherHeight,
            inset,
          )
        : prev,
    );
  }, [launcherWidth, launcherHeight, inset, isCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      setPosition((prev) =>
        prev
          ? clampPosition(
              prev.left,
              prev.top,
              launcherWidth,
              launcherHeight,
              inset,
            )
          : prev,
      );
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [launcherWidth, launcherHeight, inset]);

  useEffect(() => {
    if (skipCollapseAnchorRef.current) {
      skipCollapseAnchorRef.current = false;
      return;
    }
    const deltaW = EXPANDED_WIDTH - COLLAPSED_SIZE;
    const deltaH = EXPANDED_HEIGHT - COLLAPSED_SIZE;
    setPosition((prev) => {
      if (!prev) return prev;
      if (isCollapsed) {
        return clampPosition(
          prev.left + deltaW,
          prev.top + deltaH,
          COLLAPSED_SIZE,
          COLLAPSED_SIZE,
          inset,
        );
      }
      return clampPosition(
        prev.left - deltaW,
        prev.top - deltaH,
        EXPANDED_WIDTH,
        EXPANDED_HEIGHT,
        inset,
      );
    });
  }, [isCollapsed, inset]);

  const persistPosition = useCallback(
    (next: FloatPosition) => {
      if (!userId || typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(
          `${POSITION_KEY_PREFIX}:${userId}`,
          JSON.stringify(next),
        );
      } catch {
        /* ignore quota errors */
      }
    },
    [userId],
  );

  const openCopilot = useCallback(() => {
    router.push(COPILOT_ROUTE);
  }, [router]);

  const expandLauncher = useCallback(() => {
    setShowBot(false);
  }, [setShowBot]);

  const collapseLauncher = useCallback(() => {
    setShowBot(true);
  }, [setShowBot]);

  const onDragPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !position) return;

    const drag = dragRef.current;
    drag.active = true;
    drag.moved = false;
    drag.pointerId = e.pointerId;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.originLeft = position.left;
    drag.originTop = position.top;

    const onDocumentPointerMove = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId || !drag.active) return;

      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

      if (!drag.moved) {
        drag.moved = true;
        setIsDragging(true);
      }

      ev.preventDefault();
      const next = clampPosition(
        drag.originLeft + dx,
        drag.originTop + dy,
        launcherWidth,
        launcherHeight,
        inset,
      );
      setPosition(next);
    };

    const onDocumentPointerEnd = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId || !drag.active) return;

      document.removeEventListener('pointermove', onDocumentPointerMove);
      document.removeEventListener('pointerup', onDocumentPointerEnd);
      document.removeEventListener('pointercancel', onDocumentPointerEnd);

      const didMove = drag.moved;
      drag.active = false;
      drag.moved = false;
      setIsDragging(false);

      if (didMove) {
        suppressClickRef.current = true;
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;
        const next = clampPosition(
          drag.originLeft + dx,
          drag.originTop + dy,
          launcherWidth,
          launcherHeight,
          inset,
        );
        setPosition(next);
        persistPosition(next);
      }
    };

    document.addEventListener('pointermove', onDocumentPointerMove);
    document.addEventListener('pointerup', onDocumentPointerEnd);
    document.addEventListener('pointercancel', onDocumentPointerEnd);
  };

  const runIfNotDragged = (action: () => void) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    action();
  };

  const isLoggedIn = Boolean(token && userId);
  if (!isLoggedIn) return null;
  if (pathname === COPILOT_ROUTE) return null;
  if (!position) return null;

  return (
    <div
      className="pointer-events-none z-[1050]"
      style={{
        position: 'fixed',
        left: position.left,
        top: position.top,
        width: launcherWidth,
        height: launcherHeight,
        transition: isDragging
          ? 'none'
          : 'width 0.32s cubic-bezier(0.22, 1, 0.36, 1), height 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      data-cy="copilot-float-entry"
    >
      <div
        ref={rowRef}
        className={`pointer-events-auto flex h-full w-full items-center justify-end touch-none select-none ${
          isDragging
            ? 'cursor-grabbing'
            : isCollapsed
              ? 'cursor-pointer'
              : 'cursor-grab'
        }`}
        role="group"
        aria-label="Chat With Copilot"
        data-cy="copilot-float-entry-row"
        onPointerDown={onDragPointerDown}
      >
        {isCollapsed ? (
          <div
            className={`copilot-float-fab-shell rounded-full bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] p-[2px] ${
              isDragging
                ? ''
                : 'transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]'
            }`}
            data-cy="copilot-float-fab-shell"
          >
            <button
              type="button"
              onClick={() => runIfNotDragged(expandLauncher)}
              className="copilot-float-surface inline-flex h-[52px] w-[52px] items-center justify-center rounded-full text-[#1E40AF] shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
              aria-label="Expand Chat With Copilot"
              id="copilot-float-trigger"
              data-cy="copilot-float-trigger-collapsed"
            >
              <CopilotAiEditIcon size={22} aria-hidden />
            </button>
          </div>
        ) : (
          <div
            className="copilot-float-expanded-enter copilot-float-surface flex h-14 w-[268px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-white/70 shadow-[0_12px_40px_-10px_rgba(30,64,175,0.38)] ring-1 ring-[#1E40AF]/10"
            data-cy="copilot-float-expanded-trigger"
          >
            <button
              type="button"
              onClick={() => runIfNotDragged(openCopilot)}
              className="flex min-w-0 flex-1 items-center gap-3 px-3.5 text-left transition-colors hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B82F6]/40"
              aria-label="Open Chat With Copilot"
              id="copilot-float-trigger"
              data-cy="copilot-float-trigger"
            >
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                data-cy="copilot-float-trigger-icon-badge"
              >
                <CopilotAiEditIcon
                  size={18}
                  className="text-white"
                  aria-hidden
                />
              </span>
              <span
                className="truncate text-[13px] font-semibold tracking-[-0.01em] text-slate-800"
                data-cy="copilot-float-label-text"
              >
                Chat With Copilot
              </span>
            </button>
            <button
              type="button"
              onClick={() => runIfNotDragged(collapseLauncher)}
              className="flex w-11 shrink-0 items-center justify-center border-l border-[#1E40AF]/10 bg-white/30 text-[#64748B] transition-colors hover:bg-white/70 hover:text-[#1E40AF] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B82F6]/40"
              aria-label="Collapse copilot launcher"
              data-cy="copilot-float-trigger-collapse"
            >
              <RightOutlined className="text-xs" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopilotFloatEntry;
