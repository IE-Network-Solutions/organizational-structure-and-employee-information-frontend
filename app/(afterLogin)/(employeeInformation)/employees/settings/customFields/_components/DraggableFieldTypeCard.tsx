'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export type FieldTypeValue =
  | 'input'
  | 'datePicker'
  | 'select'
  | 'toggle'
  | 'checkbox';

interface DraggableFieldTypeCardProps {
  id: string;
  label: string;
  description: string;
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

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 rounded-lg border-[1px] border-[#D9D9D9] cursor-grab active:cursor-grabbing shadow-sm"
      id={`settings-draggable-field-type-${id}`}
      data-cy={`settings-draggable-field-type-${id}`}
    >
      <div
        data-cy="settings-draggable-field-type-content"
        className="flex items-start gap-3"
      >
        <span
          data-cy="settings-draggable-field-type-icon"
          className="text-blue-600 mt-0.5"
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
