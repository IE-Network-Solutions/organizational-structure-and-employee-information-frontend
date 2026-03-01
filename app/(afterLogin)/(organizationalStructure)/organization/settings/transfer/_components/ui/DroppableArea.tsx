'use client';
import React from 'react';
import { Select } from 'antd';
import { useDroppable } from '@dnd-kit/core';
import FolderIcon from '@/components/Icons/folder';

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  isEmpty?: boolean;
  placeholder?: string;
  onDragOver?: (isOver: boolean) => void;
  mobileSelectProps?: {
    placeholder?: string;
    value?: string | null;
    options?: Array<{ value: string; label: string }>;
    onChange?: (value: string | null) => void;
    dataCy?: string;
  };
}

const DroppableArea: React.FC<DroppableAreaProps> = ({
  id,
  children,
  className = '',
  isEmpty,
  placeholder,
  onDragOver,
  mobileSelectProps,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  React.useEffect(() => {
    if (onDragOver) {
      onDragOver(isOver);
    }
  }, [isOver, onDragOver]);

  return (
    <div
      ref={setNodeRef}
      id="transfer-droppable-area"
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-400' : ''}`}
      style={{ position: 'relative', minHeight: isEmpty ? '130px' : 'auto' }}
      data-cy={`transfer-droppable-area-${id}`}
    >
      {/* Mobile-only searchable select input - shown regardless of items */}
      {mobileSelectProps && (
        <div
          className="lg:hidden mb-4"
          data-cy="transfer-droppable-area-mobile-select-container"
        >
          <Select
            placeholder={mobileSelectProps.placeholder || 'Select department'}
            allowClear
            showSearch
            size="large"
            className="w-full"
            value={mobileSelectProps.value || null}
            onChange={(value) => {
              if (mobileSelectProps.onChange) {
                mobileSelectProps.onChange(value);
              }
            }}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={mobileSelectProps.options || []}
            data-cy={mobileSelectProps.dataCy}
          />
        </div>
      )}

      {isEmpty && (
        <div
          className="w-full h-[130px] flex flex-col items-center justify-center"
          id="transfer-droppable-area-empty-div"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          data-cy="transfer-droppable-area-empty-placeholder"
        >
          <FolderIcon data-cy="transfer-droppable-area-empty-icon" />
          <p
            className="text-gray-400 text-sm m-0"
            data-cy="transfer-droppable-area-empty-text"
          >
            {placeholder}
          </p>
        </div>
      )}
      {children}
    </div>
  );
};

export default DroppableArea;
