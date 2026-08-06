'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotAiEditIcon from './CopilotAiEditIcon';
import { COPILOT_THEME } from './copilotTheme';

const FAB_SIZE = 56;
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

/**
 * Draggable Copilot FAB — click routes to the Copilot page.
 * Always starts in the bottom-right corner on load/refresh.
 */
const CopilotFloatEntry: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
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
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;
    setPosition(getDefaultPosition(FAB_SIZE, FAB_SIZE, inset));
  }, [userId, inset]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      setPosition((prev) =>
        prev
          ? clampPosition(prev.left, prev.top, FAB_SIZE, FAB_SIZE, inset)
          : prev,
      );
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [inset]);

  const openCopilot = useCallback(() => {
    router.push(COPILOT_ROUTE);
  }, [router]);

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
        FAB_SIZE,
        FAB_SIZE,
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
          FAB_SIZE,
          FAB_SIZE,
          inset,
        );
        setPosition(next);
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
        width: FAB_SIZE,
        height: FAB_SIZE,
      }}
      data-cy="copilot-float-entry"
    >
      <div
        ref={rowRef}
        className={`pointer-events-auto flex h-full w-full items-center justify-end touch-none select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-pointer'
        }`}
        role="group"
        aria-label="Chat With Copilot"
        data-cy="copilot-float-entry-row"
        onPointerDown={onDragPointerDown}
      >
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
            onClick={() => runIfNotDragged(openCopilot)}
            className="copilot-float-surface inline-flex h-[52px] w-[52px] items-center justify-center rounded-full text-[#1E40AF] shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
            aria-label="Open Chat With Copilot"
            id="copilot-float-trigger"
            data-cy="copilot-float-trigger-collapsed"
          >
            <CopilotAiEditIcon size={22} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopilotFloatEntry;
