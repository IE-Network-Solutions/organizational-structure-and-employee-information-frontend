'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  GRID_COLUMNS,
  GRID_GAP,
  GRID_GUIDE_COLUMN_STEP,
  GRID_GUIDE_ROW_STEP,
  GRID_ROW_PITCH,
  GRID_STACKED_BREAKPOINT,
  rowsToPixels,
} from './constants';
import {
  cloneLayout,
  layoutRowCount,
  moveWidget,
  resizeWidget,
  snapDragPosition,
  snapResizeSize,
} from './gridEngine';
import { getWidgetDefinition } from './widgetRegistry';
import WidgetFrame from './WidgetFrame';
import type { DashboardPlanView, DashboardWidgetLayoutItem } from './types';

/** Spare rows kept below the content while editing, as a drop target. */
const EDIT_MODE_SPARE_ROWS = 3;

interface Interaction {
  type: 'drag' | 'resize';
  id: string;
  startClientX: number;
  startClientY: number;
  origin: DashboardWidgetLayoutItem;
  baseLayout: DashboardWidgetLayoutItem[];
}

interface DashboardGridProps {
  layout: DashboardWidgetLayoutItem[];
  plan: DashboardPlanView;
  isEditing: boolean;
  onLayoutChange: (layout: DashboardWidgetLayoutItem[]) => void;
  onHideWidget: (id: string) => void;
}

export default function DashboardGrid({
  layout,
  plan,
  isEditing,
  onLayoutChange,
  onHideWidget,
}: DashboardGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [previewLayout, setPreviewLayout] = useState<
    DashboardWidgetLayoutItem[] | null
  >(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    setContainerWidth(node.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isStacked =
    containerWidth > 0 && containerWidth < GRID_STACKED_BREAKPOINT;

  /** Distance between the left edge of one column and the next one. */
  const columnPitch =
    containerWidth > 0 ? (containerWidth + GRID_GAP) / GRID_COLUMNS : 0;

  // Read by the pointer handlers so resizing the window mid-gesture doesn't
  // tear down and restart the drag.
  const columnPitchRef = useRef(columnPitch);
  columnPitchRef.current = columnPitch;

  const renderedLayout = previewLayout ?? layout;

  const startInteraction = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      id: string,
      type: Interaction['type'],
    ) => {
      if (!isEditing || isStacked || columnPitch <= 0) return;
      const origin = layout.find((item) => item.id === id);
      if (!origin) return;
      event.preventDefault();
      setInteraction({
        type,
        id,
        startClientX: event.clientX,
        startClientY: event.clientY,
        origin: { ...origin },
        baseLayout: cloneLayout(layout),
      });
      setPreviewLayout(cloneLayout(layout));
    },
    [isEditing, isStacked, columnPitch, layout],
  );

  const handleDragStart = useCallback(
    (event: ReactPointerEvent<HTMLElement>, id: string) =>
      startInteraction(event, id, 'drag'),
    [startInteraction],
  );

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLElement>, id: string) =>
      startInteraction(event, id, 'resize'),
    [startInteraction],
  );

  useEffect(() => {
    if (!interaction) return;
    const { type, id, startClientX, startClientY, origin, baseLayout } =
      interaction;
    const definition = getWidgetDefinition(id);
    let nextLayout = baseLayout;

    const handlePointerMove = (event: PointerEvent) => {
      const pitch = columnPitchRef.current;
      if (pitch <= 0) return;
      const deltaX = event.clientX - startClientX;
      const deltaY = event.clientY - startClientY;

      if (type === 'drag') {
        const snapped = snapDragPosition(baseLayout, id, {
          x: origin.x + Math.round(deltaX / pitch),
          y: origin.y + Math.round(deltaY / GRID_ROW_PITCH),
          w: origin.w,
          h: origin.h,
        });
        nextLayout = moveWidget(baseLayout, id, snapped.x, snapped.y);
      } else {
        const widthPx = origin.w * pitch - GRID_GAP + deltaX;
        const heightPx = rowsToPixels(origin.h) + deltaY;
        const snapped = snapResizeSize(baseLayout, id, origin, {
          w: Math.round((widthPx + GRID_GAP) / pitch),
          h: Math.round((heightPx + GRID_GAP) / GRID_ROW_PITCH),
        });
        nextLayout = resizeWidget(
          baseLayout,
          id,
          snapped.w,
          snapped.h,
          definition?.minW ?? 1,
          definition?.minH ?? 1,
        );
      }

      setPreviewLayout(nextLayout);
    };

    const handlePointerUp = () => {
      setInteraction(null);
      setPreviewLayout(null);
      onLayoutChange(nextLayout);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [interaction, onLayoutChange]);

  const gridRows = layoutRowCount(renderedLayout);
  const gridHeight = Math.max(
    0,
    rowsToPixels(gridRows + (isEditing ? EDIT_MODE_SPARE_ROWS : 0)),
  );

  /**
   * Faint guides so the empty parts of the canvas stay visible while editing.
   * Drawn every few columns/rows — one line per column would read as noise at
   * this resolution.
   */
  const guideStyle = useMemo(
    () => ({
      backgroundImage:
        'linear-gradient(to right, rgba(54,54,240,0.07) 1px, transparent 1px),' +
        'linear-gradient(to bottom, rgba(54,54,240,0.07) 1px, transparent 1px)',
      backgroundSize:
        `${columnPitch * GRID_GUIDE_COLUMN_STEP}px ` +
        `${GRID_ROW_PITCH * GRID_GUIDE_ROW_STEP}px`,
    }),
    [columnPitch],
  );

  const stackedOrder = useMemo(
    () =>
      [...renderedLayout].sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y)),
    [renderedLayout],
  );

  if (renderedLayout.length === 0) {
    return (
      <div ref={containerRef} data-cy="dashboard-grid-empty-container">
        <div
          className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white text-center"
          data-cy="dashboard-grid-empty"
        >
          <span
            className="text-base font-semibold text-gray-700"
            data-cy="dashboard-grid-empty-title"
          >
            Your dashboard is empty
          </span>
          <span
            className="text-sm text-gray-500"
            data-cy="dashboard-grid-empty-description"
          >
            Use Add to bring widgets back, or Reset to restore the default
            layout.
          </span>
        </div>
      </div>
    );
  }

  if (isStacked) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col gap-4 pb-5"
        data-cy="dashboard-grid-stacked"
      >
        {stackedOrder.map((item) => {
          const definition = getWidgetDefinition(item.id);
          if (!definition) return null;
          return (
            <WidgetFrame
              key={item.id}
              definition={definition}
              plan={plan}
              isEditing={isEditing}
              isStacked
              isDragging={false}
              onRemove={onHideWidget}
              onDragStart={handleDragStart}
              onResizeStart={handleResizeStart}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full pb-5"
      style={{ height: gridHeight }}
      data-cy="dashboard-grid"
    >
      {isEditing && columnPitch > 0 && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={guideStyle}
          data-cy="dashboard-grid-guides"
        />
      )}

      {/* Widgets are placed in pixels, so wait for the first measurement. */}
      {columnPitch > 0 &&
        renderedLayout.map((item) => {
          const definition = getWidgetDefinition(item.id);
          if (!definition) return null;
          const isDragging = interaction?.id === item.id;
          return (
            <div
              key={item.id}
              className={`absolute ${isDragging ? '' : 'transition-all duration-150 ease-out'}`}
              style={{
                left: item.x * columnPitch,
                top: item.y * GRID_ROW_PITCH,
                width: Math.max(0, item.w * columnPitch - GRID_GAP),
                height: rowsToPixels(item.h),
              }}
              data-cy={`dashboard-grid-slot-${item.id}`}
            >
              <WidgetFrame
                definition={definition}
                plan={plan}
                isEditing={isEditing}
                isStacked={false}
                isDragging={Boolean(isDragging)}
                onRemove={onHideWidget}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
              />
            </div>
          );
        })}
    </div>
  );
}
