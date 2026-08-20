'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDashboardLayoutStore } from '@/store/uistate/features/dashboard/layout';
import {
  DASHBOARD_GRID_COLS,
  DASHBOARD_GRID_MARGIN,
  DASHBOARD_ROW_HEIGHT,
  layoutStorageKey,
} from './types';
import type { DashboardLayoutItem, DashboardPlanView } from './types';
import { widgetById } from './registry';
import {
  placeAndPushDown,
  packLayout,
  previewPushDown,
  resolveLayout,
  snapPosition,
  snapSize,
  widgetMetaById,
} from './layoutHelpers';
import './styles.css';

const [GAP_X, GAP_Y] = DASHBOARD_GRID_MARGIN;
const DRAG_THRESHOLD_PX = 4;
const FLIP_MS = 200;

const layoutSignature = (item: DashboardLayoutItem) =>
  `${item.i}:${item.x}:${item.y}:${item.w}:${item.h}`;

const gridMetrics = (grid: HTMLDivElement) => {
  const rect = grid.getBoundingClientRect();
  const colWidth = Math.max(
    1,
    (rect.width - GAP_X * (DASHBOARD_GRID_COLS - 1)) / DASHBOARD_GRID_COLS,
  );
  return {
    rect,
    colPitch: colWidth + GAP_X,
    rowPitch: DASHBOARD_ROW_HEIGHT + GAP_Y,
  };
};

const pointToItem = (
  left: number,
  top: number,
  grid: HTMLDivElement,
  item: DashboardLayoutItem,
) => {
  const { rect, colPitch, rowPitch } = gridMetrics(grid);
  const x = Math.round((left - rect.left) / colPitch);
  const y = Math.round((top - rect.top) / rowPitch);
  return { ...item, x, y };
};

type DragSession =
  | {
      type: 'move';
      id: DashboardLayoutItem['i'];
      origin: DashboardLayoutItem;
      baseItems: DashboardLayoutItem[];
      startClientX: number;
      startClientY: number;
      grabOffsetX: number;
      grabOffsetY: number;
      width: number;
      height: number;
      lastClientX: number;
      lastClientY: number;
      pointerId: number;
      active: boolean;
    }
  | {
      type: 'resize';
      axis: 'se' | 'e';
      id: DashboardLayoutItem['i'];
      origin: DashboardLayoutItem;
      pointerX: number;
      pointerY: number;
      pointerId: number;
    };

interface DragPreview {
  id: DashboardLayoutItem['i'];
  width: number;
  height: number;
}

interface GridCanvasProps {
  plan: DashboardPlanView;
}

const GridCanvas = ({ plan }: GridCanvasProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const captureElRef = useRef<HTMLElement | null>(null);
  const itemsRef = useRef<DashboardLayoutItem[]>([]);
  const suppressPointerRef = useRef<number | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const prevRects = useRef(new Map<string, DOMRect>());
  const lastPlaceholderRef = useRef<string | null>(null);
  const previewElRef = useRef<HTMLDivElement | null>(null);
  const userId = useAuthenticationStore((state) => state.userId);
  const storageKey = layoutStorageKey(userId || 'anonymous', plan);
  const isEditing = useDashboardLayoutStore((state) => state.isEditing);
  const hasHydrated = useDashboardLayoutStore((state) => state.hasHydrated);
  const layoutsByKey = useDashboardLayoutStore((state) => state.layoutsByKey);
  const layoutEpoch = useDashboardLayoutStore((state) => state.layoutEpoch);
  const setLayout = useDashboardLayoutStore((state) => state.setLayout);
  const [draftItems, setDraftItems] = useState<DashboardLayoutItem[] | null>(
    null,
  );
  const [committedItems, setCommittedItems] = useState<
    DashboardLayoutItem[] | null
  >(null);
  const [activeWidgetId, setActiveWidgetId] = useState<
    DashboardLayoutItem['i'] | null
  >(null);
  const [placeholder, setPlaceholder] = useState<DashboardLayoutItem | null>(
    null,
  );
  const [preview, setPreview] = useState<DragPreview | null>(null);

  const savedLayout = layoutsByKey[storageKey];
  const storedItems = useMemo(
    () =>
      resolveLayout(
        savedLayout && savedLayout.length > 0
          ? savedLayout
          : hasHydrated
            ? savedLayout
            : undefined,
        plan,
      ),
    [hasHydrated, savedLayout, plan],
  );

  const items = draftItems ?? committedItems ?? storedItems;
  itemsRef.current = items;
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  useEffect(() => {
    setCommittedItems(null);
    setDraftItems(null);
  }, [storageKey, layoutEpoch]);

  const visibleItems = useMemo(
    () => items.filter((item) => !item.hidden),
    [items],
  );
  const visibleItemsRef = useRef(visibleItems);
  visibleItemsRef.current = visibleItems;

  const layoutKey = useMemo(
    () =>
      visibleItems
        .map((item) => `${item.i}:${item.x}:${item.y}:${item.w}:${item.h}`)
        .join('|'),
    [visibleItems],
  );

  useLayoutEffect(() => {
    visibleItemsRef.current.forEach((item) => {
      if (item.i === activeWidgetId) return;
      const node = nodeRefs.current.get(item.i);
      if (!node) return;
      const visual = node.getBoundingClientRect();
      node.style.transition = 'none';
      node.style.transform = 'none';
      const layout = node.getBoundingClientRect();
      prevRects.current.set(item.i, layout);
      const dx = visual.left - layout.left;
      const dy = visual.top - layout.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        node.style.transform = '';
        return;
      }
      node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          node.style.transition = `transform ${FLIP_MS}ms ease`;
          node.style.transform = 'translate3d(0, 0, 0)';
        });
      });
    });
  }, [layoutKey, activeWidgetId]);

  const persistItems = (next: DashboardLayoutItem[]) => {
    const packed = packLayout(next);
    itemsRef.current = packed;
    setCommittedItems(packed);
    setLayout(storageKeyRef.current, packed);
  };

  const clearPointerSession = () => {
    const node = captureElRef.current;
    const session = dragRef.current;
    if (node && session && node.hasPointerCapture(session.pointerId)) {
      node.releasePointerCapture(session.pointerId);
    }
    captureElRef.current = null;
    dragRef.current = null;
    lastPlaceholderRef.current = null;
    setActiveWidgetId(null);
    setPlaceholder(null);
    setPreview(null);
    setDraftItems(null);
  };

  const dragLogicRef = useRef({
    applyMove: (
      _session: Extract<DragSession, { type: 'move' }>,
      _event: PointerEvent,
    ) => undefined,
    applyResize: (
      _session: Extract<DragSession, { type: 'resize' }>,
      _event: PointerEvent,
    ) => undefined,
    finish: (_session: DragSession, _event: PointerEvent) => undefined,
  });

  dragLogicRef.current = {
    applyMove: (session, event) => {
      const grid = gridRef.current;
      if (!grid) return;
      session.lastClientX = event.clientX;
      session.lastClientY = event.clientY;
      const left = event.clientX - session.grabOffsetX;
      const top = event.clientY - session.grabOffsetY;
      const previewNode = previewElRef.current;
      if (previewNode) {
        previewNode.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      }
      const snapped = snapPosition(
        pointToItem(left, top, grid, session.origin),
      );
      const signature = layoutSignature(snapped);
      if (lastPlaceholderRef.current === signature) return;
      lastPlaceholderRef.current = signature;
      setPlaceholder(snapped);
      setDraftItems(previewPushDown(session.baseItems, snapped));
    },
    applyResize: (session, event) => {
      const grid = gridRef.current;
      if (!grid) return;
      const { colPitch, rowPitch } = gridMetrics(grid);
      const dw = Math.round((event.clientX - session.pointerX) / colPitch);
      const dh =
        session.axis === 'se'
          ? Math.round((event.clientY - session.pointerY) / rowPitch)
          : 0;
      const sized = snapSize({
        ...session.origin,
        w: session.origin.w + dw,
        h: session.origin.h + dh,
      });
      setDraftItems(placeAndPushDown(itemsRef.current, sized));
    },
    finish: (session, event) => {
      if (session.type === 'move') {
        const grid = gridRef.current;
        if (!grid) return;
        const next = pointToItem(
          event.clientX - session.grabOffsetX,
          event.clientY - session.grabOffsetY,
          grid,
          session.origin,
        );
        persistItems(placeAndPushDown(session.baseItems, next));
        return;
      }
      const resized = itemsRef.current.find((item) => item.i === session.id);
      persistItems(
        resized ? placeAndPushDown(itemsRef.current, resized) : itemsRef.current,
      );
    },
  };

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const session = dragRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      if (session.type === 'move') {
        if (!session.active) {
          const distance = Math.hypot(
            event.clientX - session.startClientX,
            event.clientY - session.startClientY,
          );
          if (distance < DRAG_THRESHOLD_PX) return;
          session.active = true;
          session.baseItems = itemsRef.current.map((item) => ({ ...item }));
          session.lastClientX = event.clientX;
          session.lastClientY = event.clientY;
          setActiveWidgetId(session.id);
          setPreview({
            id: session.id,
            width: session.width,
            height: session.height,
          });
          setDraftItems(session.baseItems);
        }
        dragLogicRef.current.applyMove(session, event);
        return;
      }
      dragLogicRef.current.applyResize(session, event);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (suppressPointerRef.current === event.pointerId) {
        suppressPointerRef.current = null;
        return;
      }
      const session = dragRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      const didDrag = session.type === 'resize' || session.active;
      dragRef.current = null;
      lastPlaceholderRef.current = null;
      setActiveWidgetId(null);
      setPlaceholder(null);
      setPreview(null);
      const node = captureElRef.current;
      if (node?.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
      captureElRef.current = null;
      if (didDrag) dragLogicRef.current.finish(session, event);
      setDraftItems(null);
    };

    window.addEventListener('pointermove', onPointerMove, { capture: true });
    window.addEventListener('pointerup', onPointerUp, { capture: true });
    window.addEventListener('pointercancel', onPointerUp, { capture: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove, {
        capture: true,
      });
      window.removeEventListener('pointerup', onPointerUp, { capture: true });
      window.removeEventListener('pointercancel', onPointerUp, {
        capture: true,
      });
    };
  }, []);

  const startMove = (
    event: React.PointerEvent<HTMLDivElement>,
    item: DashboardLayoutItem,
  ) => {
    if (!isEditingRef.current || event.button !== 0) return;
    if (suppressPointerRef.current === event.pointerId) return;
    const target = event.target as HTMLElement;
    if (
      target.closest('.dashboard-widget-resize-handle') ||
      target.closest('.dashboard-widget-remove')
    ) {
      return;
    }
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    captureElRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      type: 'move',
      id: item.i,
      origin: item,
      baseItems: itemsRef.current.map((entry) => ({ ...entry })),
      startClientX: event.clientX,
      startClientY: event.clientY,
      grabOffsetX: event.clientX - rect.left,
      grabOffsetY: event.clientY - rect.top,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      width: rect.width,
      height: rect.height,
      pointerId: event.pointerId,
      active: false,
    };
  };

  const startResize = (
    event: React.PointerEvent<HTMLButtonElement>,
    item: DashboardLayoutItem,
    axis: 'se' | 'e',
  ) => {
    event.preventDefault();
    event.stopPropagation();
    captureElRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      type: 'resize',
      axis,
      id: item.i,
      origin: item,
      pointerX: event.clientX,
      pointerY: event.clientY,
      pointerId: event.pointerId,
    };
    setActiveWidgetId(item.i);
    setDraftItems(itemsRef.current);
  };

  const removeWidget = (
    event: React.PointerEvent<HTMLButtonElement>,
    widgetId: DashboardLayoutItem['i'],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    suppressPointerRef.current = event.pointerId;
    dragRef.current = null;
    clearPointerSession();
    persistItems(
      itemsRef.current.map((item) =>
        item.i === widgetId ? { ...item, hidden: true } : item,
      ),
    );
  };

  const previewNode =
    preview &&
    (() => {
      const widget = widgetById[preview.id];
      if (!widget) return null;
      const WidgetComponent = widget.Component;
      const session = dragRef.current;
      const left =
        session?.type === 'move'
          ? session.lastClientX - session.grabOffsetX
          : 0;
      const top =
        session?.type === 'move'
          ? session.lastClientY - session.grabOffsetY
          : 0;
      return (
        <div
          ref={previewElRef}
          className="dashboard-widget dashboard-widget-preview"
          style={{
            width: preview.width,
            height: preview.height,
            transform: `translate3d(${left}px, ${top}px, 0)`,
          }}
          data-cy={`dashboard-widget-preview-${preview.id}`}
        >
          <div className="dashboard-widget-body h-full overflow-hidden">
            <WidgetComponent />
          </div>
        </div>
      );
    })();

  return (
    <div
      ref={gridRef}
      className={`dashboard-widget-grid${isEditing ? ' is-editing' : ''}${
        activeWidgetId ? ' is-reflowing' : ''
      }`}
      data-cy="dashboard-widget-grid-container"
    >
      {placeholder && activeWidgetId && (
        <div
          className="dashboard-widget-placeholder"
          style={{
            gridColumn: `${placeholder.x + 1} / span ${placeholder.w}`,
            gridRow: `${placeholder.y + 1} / span ${placeholder.h}`,
          }}
          data-cy={`dashboard-widget-placeholder-${placeholder.i}`}
        />
      )}
      {visibleItems.map((item) => {
        const widget = widgetById[item.i];
        if (!widget) return null;
        const WidgetComponent = widget.Component;
        const meta = widgetMetaById[item.i];
        const canGrowWidth = meta.maxW > meta.minW;
        const canGrowHeight =
          (meta.maxH ?? Number.POSITIVE_INFINITY) > meta.minH;
        const isDragging = activeWidgetId === item.i;
        return (
          <div
            key={item.i}
            ref={(node) => {
              if (node) nodeRefs.current.set(item.i, node);
              else nodeRefs.current.delete(item.i);
            }}
            className={`dashboard-widget relative ${
              isDragging ? 'is-dragging dashboard-widget-ghost' : ''
            }`}
            style={{
              gridColumn: `${item.x + 1} / span ${item.w}`,
              gridRow: `${item.y + 1} / span ${item.h}`,
            }}
            data-cy={`dashboard-widget-item-${item.i}`}
            onPointerDown={(event) => startMove(event, item)}
          >
            <div
              className="dashboard-widget-body overflow-visible"
              data-cy={`dashboard-widget-body-${item.i}`}
            >
              <WidgetComponent />
            </div>
            {isEditing && (
              <>
                <button
                  type="button"
                  className="dashboard-widget-remove"
                  aria-label={`Remove ${widget.title}`}
                  id={`dashboard-widget-remove-${item.i}`}
                  data-cy={`dashboard-widget-remove-${item.i}`}
                  onPointerDownCapture={(event) =>
                    removeWidget(event, item.i)
                  }
                >
                  <X size={14} strokeWidth={2} />
                </button>
                {canGrowWidth && (
                  <button
                    type="button"
                    className="dashboard-widget-resize-handle dashboard-widget-resize-handle-e"
                    aria-label={`Resize ${widget.title} width`}
                    id={`dashboard-widget-resize-e-${item.i}`}
                    data-cy={`dashboard-widget-resize-e-${item.i}`}
                    onPointerDown={(event) => startResize(event, item, 'e')}
                  />
                )}
                {canGrowHeight && (
                  <button
                    type="button"
                    className="dashboard-widget-resize-handle dashboard-widget-resize-handle-se"
                    aria-label={`Resize ${widget.title}`}
                    id={`dashboard-widget-resize-se-${item.i}`}
                    data-cy={`dashboard-widget-resize-se-${item.i}`}
                    onPointerDown={(event) => startResize(event, item, 'se')}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
      {previewNode &&
        typeof document !== 'undefined' &&
        createPortal(previewNode, document.body)}
    </div>
  );
};

export default GridCanvas;
