'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { FC } from 'react';
import { LuGripVertical, LuPencil } from 'react-icons/lu';

export type SortablePendingMaterial = {
  clientId: string;
  title: string;
  timeToFinishMinutes: number | null;
};

interface SortablePendingLessonMaterialRowProps {
  material: SortablePendingMaterial;
  onEdit: (clientId: string) => void;
  onRemove: (clientId: string) => void;
}

const SortablePendingLessonMaterialRow: FC<
  SortablePendingLessonMaterialRowProps
> = ({ material: item, onEdit, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.clientId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors"
      data-cy={`tna-inline-create-pending-material-${item.clientId}`}
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-3"
        data-cy={`tna-inline-create-pending-material-main-${item.clientId}`}
      >
        <button
          type="button"
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-gray-400 outline-none hover:text-gray-600 active:cursor-grabbing"
          aria-label={`Drag to reorder ${item.title}`}
          data-cy={`tna-inline-create-pending-material-grip-${item.clientId}`}
          {...listeners}
        >
          <LuGripVertical size={16} className="block shrink-0" aria-hidden />
        </button>
        <div
          className="min-w-0 flex-1"
          data-cy={`tna-inline-create-pending-material-body-${item.clientId}`}
        >
          <span
            className="block text-sm text-black/70"
            data-cy={`tna-inline-create-pending-material-title-${item.clientId}`}
          >
            {item.title}
          </span>
          <div
            className="mt-1 text-xs text-black/70"
            data-cy={`tna-inline-create-pending-material-duration-${item.clientId}`}
          >
            {item.timeToFinishMinutes != null
              ? `${item.timeToFinishMinutes} minutes`
              : '—'}
          </div>
        </div>
      </div>
      <div
        className="mt-0.5 flex shrink-0 items-center gap-1"
        data-cy={`tna-inline-create-pending-material-actions-${item.clientId}`}
      >
        <Button
          type="text"
          size="small"
          className="inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-md !bg-transparent !border-none !p-0 leading-none text-gray-400 hover:!bg-gray-100 hover:!text-gray-700 [&_.ant-btn-icon]:m-0"
          aria-label={`Edit ${item.title}`}
          data-cy={`tna-inline-create-pending-material-edit-${item.clientId}`}
          onClick={() => onEdit(item.clientId)}
        >
          <LuPencil size={16} className="block shrink-0" aria-hidden />
        </Button>
        <Button
          type="text"
          size="small"
          className="inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-md !bg-transparent !border-none !p-0 leading-none text-gray-400 hover:!bg-gray-100 hover:!text-gray-700 [&_.ant-btn-icon]:m-0"
          aria-label={`Remove ${item.title}`}
          data-cy={`tna-inline-create-pending-material-remove-${item.clientId}`}
          onClick={() => onRemove(item.clientId)}
        >
          <CloseOutlined className="text-xs" />
        </Button>
      </div>
    </div>
  );
};

export default SortablePendingLessonMaterialRow;
