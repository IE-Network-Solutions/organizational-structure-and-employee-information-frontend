'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const PALETTE_ID_PREFIX = 'palette:' as const;

export function paletteDragId(fieldType: string): string {
  return `${PALETTE_ID_PREFIX}${fieldType}`;
}

interface PaletteDraggableProps {
  fieldType: string;
  title: string;
  description: string;
  count: number;
  onPointerDownPick?: () => void;
}

const PaletteDraggable: React.FC<PaletteDraggableProps> = ({
  fieldType,
  title,
  description,
  count,
  onPointerDownPick,
}) => {
  const dragId = paletteDragId(fieldType);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId,
      data: { fieldType, source: 'palette' as const },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.45 : 1,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onPointerDownPick?.()}
      className="box-border flex w-full min-w-0 cursor-grab flex-row items-center gap-3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-3 text-left opacity-100 shadow-sm transition-all hover:shadow-md active:cursor-grabbing lg:h-[54px] lg:flex-col lg:items-stretch lg:justify-center lg:gap-0.5 lg:p-2"
      data-cy={`survey-palette-${fieldType}`}
    >
      {/* Color dot (mobile) */}
      <span
        className="h-4 w-4 shrink-0 rounded-full border border-[#D1D5DB] bg-[#F9FAFB] lg:hidden"
        aria-hidden
        data-cy={`survey-palette-card-dot-${fieldType}`}
      />
      <div
        className="flex min-w-0 flex-1 flex-col gap-0.5"
        data-cy={`survey-palette-card-body-${fieldType}`}
      >
        <div
          className="flex items-center justify-between gap-2"
          data-cy={`survey-palette-card-row-${fieldType}`}
        >
          <span
            className="truncate text-sm font-semibold leading-tight text-gray-900 lg:text-[13px]"
            data-cy={`survey-palette-card-title-${fieldType}`}
          >
            {title}
          </span>
          <span
            className="hidden h-5 min-w-[20px] shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-100 px-1 text-[10px] font-semibold tabular-nums text-gray-600 lg:inline-flex"
            data-cy={`survey-palette-card-count-${fieldType}`}
          >
            {count}
          </span>
        </div>
        <p
          className="m-0 line-clamp-2 text-[11px] leading-snug text-gray-500 lg:text-[11px] lg:leading-tight"
          data-cy={`survey-palette-card-desc-${fieldType}`}
        >
          {description}
        </p>
      </div>
    </button>
  );
};

export default PaletteDraggable;
