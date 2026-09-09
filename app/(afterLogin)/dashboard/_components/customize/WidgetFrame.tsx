'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import { Tooltip } from 'antd';
import { MdClose, MdDragIndicator } from 'react-icons/md';
import type { DashboardPlanView, DashboardWidgetDefinition } from './types';

interface WidgetFrameProps {
  definition: DashboardWidgetDefinition;
  plan: DashboardPlanView;
  isEditing: boolean;
  /** Single-column fallback used on narrow screens. */
  isStacked: boolean;
  isDragging: boolean;
  onRemove: (id: string) => void;
  onDragStart: (event: ReactPointerEvent<HTMLElement>, id: string) => void;
  onResizeStart: (event: ReactPointerEvent<HTMLElement>, id: string) => void;
}

export default function WidgetFrame({
  definition,
  plan,
  isEditing,
  isStacked,
  isDragging,
  onRemove,
  onDragStart,
  onResizeStart,
}: WidgetFrameProps) {
  const canDrag = isEditing && !isStacked;

  return (
    <div
      className={`group relative h-full w-full rounded-lg ${canDrag ? 'cursor-move' : ''} ${
        isDragging ? 'z-20 opacity-90 shadow-lg' : ''
      }`}
      onPointerDown={
        canDrag ? (event) => onDragStart(event, definition.id) : undefined
      }
      data-cy={`dashboard-widget-${definition.id}`}
    >
      <div
        className={[
          isStacked
            ? ''
            : 'h-full overflow-auto scrollbar-none rounded-lg [&>*]:min-h-full',
          // While editing, the frame owns every pointer so a drag can't open a
          // dropdown or trigger a button inside the widget.
          isEditing ? 'pointer-events-none select-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        data-cy={`dashboard-widget-content-${definition.id}`}
      >
        {definition.render(plan)}
      </div>

      {isEditing && (
        <div
          className="absolute inset-0 rounded-lg border-2 border-dashed border-primary/60 bg-primary/[0.03] pointer-events-none"
          data-cy={`dashboard-widget-edit-overlay-${definition.id}`}
        />
      )}

      {isEditing && (
        <div
          // On the grid these sit over the widget's own content, so they only
          // appear for the card being pointed at. Stacked cards have no hover,
          // so they stay visible there.
          className={`absolute top-1.5 right-1.5 z-10 flex items-center gap-px rounded-md border border-gray-200 bg-white shadow-sm ${
            isStacked
              ? ''
              : 'opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100'
          }`}
          data-cy={`dashboard-widget-edit-actions-${definition.id}`}
        >
          {canDrag && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-l-md text-gray-400"
              title={`Drag ${definition.title}`}
              data-cy={`dashboard-widget-drag-handle-${definition.id}`}
            >
              <MdDragIndicator size={14} />
            </span>
          )}
          <Tooltip title={`Hide ${definition.title}`}>
            <button
              type="button"
              aria-label={`Hide ${definition.title}`}
              className="flex h-5 w-5 items-center justify-center rounded-r-md text-gray-500 hover:bg-red-50 hover:text-red-500"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onRemove(definition.id)}
              data-cy={`dashboard-widget-hide-${definition.id}`}
            >
              <MdClose size={13} />
            </button>
          </Tooltip>
        </div>
      )}

      {canDrag && (
        <button
          type="button"
          aria-label={`Resize ${definition.title}`}
          className="absolute bottom-0 right-0 z-10 h-5 w-5 cursor-se-resize rounded-br-lg"
          onPointerDown={(event) => {
            event.stopPropagation();
            onResizeStart(event, definition.id);
          }}
          data-cy={`dashboard-widget-resize-handle-${definition.id}`}
        >
          <span
            className="absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-primary"
            data-cy={`dashboard-widget-resize-handle-mark-${definition.id}`}
          />
        </button>
      )}
    </div>
  );
}
