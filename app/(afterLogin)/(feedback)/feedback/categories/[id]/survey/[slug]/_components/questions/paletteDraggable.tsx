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
      className="box-border flex h-[54px] w-full min-w-0 cursor-grab flex-col justify-center gap-0.5 overflow-hidden rounded-md border border-gray-200 bg-white p-2 text-left opacity-100 transition-colors hover:border-[#2D5BFF]/40 active:cursor-grabbing"
      data-cy={`survey-palette-${fieldType}`}
    >
      <div
        className="flex items-center justify-between gap-2"
        data-cy={`survey-palette-card-row-${fieldType}`}
      >
        <span
          className="truncate text-[14px] font-semibold text-gray-900"
          data-cy={`survey-palette-card-title-${fieldType}`}
        >
          {title}
        </span>
        <span
          className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-100 px-1 text-[10px] font-semibold tabular-nums text-gray-600"
          data-cy={`survey-palette-card-count-${fieldType}`}
        >
          {count}
        </span>
      </div>
      <p
        className="m-0 line-clamp-2 text-[12px] leading-tight text-gray-500"
        data-cy={`survey-palette-card-desc-${fieldType}`}
      >
        {description}
      </p>
    </button>
  );
};

export default PaletteDraggable;
