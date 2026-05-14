'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export type FieldTypeValue =
  | 'input'
  | 'textArea'
  | 'checkbox'
  | 'radio'
  | 'dropdown';

interface DraggableFieldTypeCardProps {
  id: string;
  label: string;
  description: ReactNode;
  fieldType: FieldTypeValue;
}

const DraggableFieldTypeCard: React.FC<DraggableFieldTypeCardProps> = ({
  id,
  label,
  description,
  fieldType,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type: 'fieldType', fieldType, label },
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.45 : 1 }}
      {...attributes}
      {...listeners}
      className={`p-3 rounded-lg bg-white border cursor-grab active:cursor-grabbing z-50 transition-colors select-none ${
        isDragging
          ? 'drag-item-active'
          : 'border-[#E5E7EB] hover:border-[#1E40AF]/50'
      }`}
      id={`settings-draggable-field-type-${id}`}
      data-cy={`settings-draggable-field-type-${id}`}
    >
      <div
        data-cy="settings-draggable-field-type-content"
        className="flex items-center gap-2"
      >
        <DragIndicatorIcon
          data-cy="settings-draggable-field-type-icon"
          style={{ fontSize: 16 }}
          className="text-gray-300 shrink-0"
          aria-hidden
        />
        <div data-cy="settings-draggable-field-type-content-container">
          <p
            data-cy="settings-draggable-field-type-label"
            className="font-medium text-sm text-gray-900 m-0"
          >
            {label}
          </p>
          <p
            data-cy="settings-draggable-field-type-description"
            className="text-xs text-gray-500 m-0 mt-1"
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraggableFieldTypeCard;
