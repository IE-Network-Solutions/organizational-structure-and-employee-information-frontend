'use client';

import { useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';
import { useCollaboration } from '@/components/collaboration/collaboration-context';
import { CollaborationAccessDenied } from '@/components/collaboration/collaboration-access-denied';
import {
  buildCollaborationSrc,
  COLLABORATION_ACCESS_DENIED_MESSAGE_TYPE,
  COLLABORATION_CLOSE_MESSAGE_TYPE,
  COLLABORATION_MESSAGE_TYPE,
} from '@/utils/collaboration';

/** Sidebar blue-50, the same wash the nav sider uses. */
const WORKSPACE_PANEL_BACKGROUND = '#EFF6FF';
/** Slate-200, the border tone the shell already uses between columns. */
const WORKSPACE_BORDER = '#E2E8F0';

export const COLLABORATION_MIN_PANEL_WIDTH = 240;
export const COLLABORATION_DEFAULT_PANEL_WIDTH = 480;
/**
 * Hard ceiling on the panel, the same as Core's chat dock (CHAT_MAX_WIDTH).
 * Past this the embed stops being a companion column and starts crowding the
 * page it is meant to sit beside — and the host's own content is the reason
 * the user is here. Kept in step with CRM and Operations.
 */
export const COLLABORATION_MAX_PANEL_WIDTH = 680;
const PANEL_WIDTH_STORAGE_KEY = 'collaboration-panel-width';

/**
 * The one place a width becomes legal. Applied on write rather than only while
 * dragging, so a width stored before the ceiling existed is pulled back into
 * range on the next load instead of persisting forever.
 */
function clampPanelWidth(width: number): number {
  return Math.min(
    COLLABORATION_MAX_PANEL_WIDTH,
    Math.max(COLLABORATION_MIN_PANEL_WIDTH, Math.round(width)),
  );
}

type CollaborationPanelStore = {
  panelWidth: number;
  dragging: boolean;
  /**
   * The embedded app reported the user is not a member of collaboration. Holds
   * for the life of the page: the frame is dropped, so a reload re-checks.
   */
  accessDenied: boolean;
  setPanelWidth: (width: number) => void;
  setDragging: (dragging: boolean) => void;
  setAccessDenied: () => void;
};

function readStoredPanelWidth(): number {
  if (typeof window === 'undefined') return COLLABORATION_DEFAULT_PANEL_WIDTH;

  try {
    const savedWidth = Number(
      window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY),
    );
    if (
      Number.isFinite(savedWidth) &&
      savedWidth >= COLLABORATION_MIN_PANEL_WIDTH
    ) {
      return clampPanelWidth(savedWidth);
    }
  } catch {
    // Fall through to the default when browser storage is unavailable.
  }

  return COLLABORATION_DEFAULT_PANEL_WIDTH;
}

/**
 * Exported because the shell's fixed header has to subtract this width while the
 * panel is open — a `position: fixed` header sized off the viewport would
 * otherwise run underneath the panel. See components/navBar.
 */
export const useCollaborationPanelStore = create<CollaborationPanelStore>(
  (set) => ({
    // Hydrate synchronously so a hard reload does not paint at 480 then jump.
    panelWidth: readStoredPanelWidth(),
    dragging: false,
    setPanelWidth: (width) => {
      const panelWidth = clampPanelWidth(width);
      try {
        window.localStorage.setItem(
          PANEL_WIDTH_STORAGE_KEY,
          String(panelWidth),
        );
      } catch {
        // Resizing should still work when browser storage is unavailable.
      }
      set({ panelWidth });
    },
    setDragging: (dragging) => set({ dragging }),
    accessDenied: false,
    setAccessDenied: () => set({ accessDenied: true }),
  }),
);

/**
 * Collaboration embed as an inline layout panel, not an overlay: it is a flex
 * sibling of the main content inside the app shell, so opening it narrows the
 * page rather than covering it. Mount it as the last child of the shell's flex
 * row (see components/navBar).
 *
 * The iframe stays mounted while the panel is closed (hidden via `display`, not
 * unmounted) so chat state, sockets and scroll position survive closing and
 * reopening — and so a context set by a Workspace screen has already loaded by
 * the time the user opens it.
 *
 * There is no floating launcher tab here, unlike CRM and Operations: Workspace
 * opens this from its Announcement nav item, and the bottom-right corner is
 * already taken by the Copilot entry.
 *
 * Desktop only. The panel would leave no room for the page on a phone, so it is
 * hidden below `md`.
 *
 * `sticky top-0 self-start h-screen` is load-bearing, not decoration. Workspace
 * puts no height or overflow constraint on html/body, so a tall page scrolls the
 * document itself — and a plain full-height flex child rides up with it, leaving
 * the panel clipped at both ends. `self-start` stops the flex row stretching it
 * to the full document height, which is what gives sticky somewhere to travel;
 * the panel then stays pinned to the viewport while only the page column scrolls
 * underneath. It also replaces `relative` rather than joining it: Tailwind runs
 * with `important: true` here, so `relative` would win over any position set
 * inline, and sticky establishes the containing block the absolute children
 * (resizer, iframe) need just as well.
 */
export function CollaborationDock() {
  const { enabled, isOpen, context, close } = useCollaboration();
  const panelRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelWidth = useCollaborationPanelStore((state) => state.panelWidth);
  const dragging = useCollaborationPanelStore((state) => state.dragging);
  const setPanelWidth = useCollaborationPanelStore(
    (state) => state.setPanelWidth,
  );
  const setDragging = useCollaborationPanelStore((state) => state.setDragging);
  const accessDenied = useCollaborationPanelStore(
    (state) => state.accessDenied,
  );
  const setAccessDenied = useCollaborationPanelStore(
    (state) => state.setAccessDenied,
  );

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // The embedded app's own header has a close button; it asks via postMessage.
  // It also reports when the user has no collaboration access. Only our iframe
  // is listened to.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === COLLABORATION_CLOSE_MESSAGE_TYPE) close();
      if (event.data?.type === COLLABORATION_ACCESS_DENIED_MESSAGE_TYPE) {
        setAccessDenied();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [close, setAccessDenied]);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: PointerEvent) => {
      const container = panelRef.current?.parentElement;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      // `bounds.width` still caps separately: on a narrow window the container
      // is the tighter limit, and the panel must not outgrow it.
      setPanelWidth(Math.min(bounds.width, bounds.right - event.clientX));
    };

    const handleUp = () => setDragging(false);

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [dragging, setDragging, setPanelWidth]);

  // Only needs rebuilding when the context path/entity changes.
  const src = useMemo(
    () => buildCollaborationSrc(context ?? undefined),
    [context],
  );

  // Hand the current context to the embedded app once it has loaded, so it can
  // deep-link. Harmless if the app does not consume it.
  const postContext = () => {
    if (!context) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: COLLABORATION_MESSAGE_TYPE, payload: context },
      '*',
    );
  };

  if (!enabled) return null;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label="Collaboration"
      aria-hidden={!isOpen}
      data-cy="collaboration-panel"
      className={`sticky top-0 self-start h-screen shrink-0 flex-col ${
        isOpen ? 'hidden md:flex' : 'hidden'
      } ${
        dragging
          ? ''
          : 'transition-[width] duration-300 ease-out motion-reduce:transition-none'
      }`}
      style={{
        width: panelWidth,
        maxWidth: '100%',
        borderLeft: `1px solid ${WORKSPACE_BORDER}`,
        background: '#FFFFFF',
      }}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize collaboration panel"
        data-cy="collaboration-panel-resizer"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        className="absolute inset-y-0 left-0 z-30 w-3 cursor-ew-resize touch-none bg-transparent transition hover:bg-slate-300/70 active:bg-slate-400/80"
      />

      {/* No host bar: the embedded app's own header carries the title, the
          ⋯ menu and the close button (it posts COLLABORATION_CLOSE_MESSAGE_TYPE).
          The Announcement nav item still toggles the panel too. When access
          is denied the frame is dropped and the Access Denied state brings
          its own close button. */}
      <div
        className="relative min-h-0 flex-1 p-2"
        style={{ background: WORKSPACE_PANEL_BACKGROUND }}
        data-cy="collaboration-panel-body"
      >
        {/* Swallows pointer events mid-drag so the iframe cannot capture them. */}
        <div
          className={`absolute inset-0 z-20 ${
            dragging ? '' : 'pointer-events-none'
          }`}
          data-cy="collaboration-panel-overlay"
        />
        {accessDenied ? (
          <CollaborationAccessDenied onClose={close} />
        ) : (
          <iframe
            ref={iframeRef}
            src={src}
            title="Selamnew Collaboration"
            onLoad={postContext}
            data-cy="collaboration-panel-iframe"
            className="absolute inset-0 size-full border-0"
            allow="camera; microphone; display-capture; clipboard-read; clipboard-write; autoplay"
          />
        )}
      </div>
    </aside>
  );
}
