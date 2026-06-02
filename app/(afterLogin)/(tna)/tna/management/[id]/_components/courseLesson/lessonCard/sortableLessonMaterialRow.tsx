'use client';

import { CourseLessonMaterial } from '@/types/tna/course';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from 'antd';
import Link from 'next/link';
import { FC } from 'react';
import { LuGripVertical, LuPencil } from 'react-icons/lu';

interface SortableLessonMaterialRowProps {
  material: CourseLessonMaterial;
  lessonCourseId: string;
  lessonId: string;
  onEditMaterial: (material: CourseLessonMaterial) => void;
}

const SortableLessonMaterialRow: FC<SortableLessonMaterialRowProps> = ({
  material: item,
  lessonCourseId,
  lessonId,
  onEditMaterial,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
      id={`tnaLessonCardMaterial${item.id}Id`}
      data-cy={`tna-lesson-card-material-${item.id}`}
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-3"
        data-cy={`tna-lesson-card-material-main-${item.id}`}
      >
        <button
          type="button"
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-gray-400 outline-none hover:text-gray-600 active:cursor-grabbing"
          aria-label={`Drag to reorder ${item.title}`}
          data-cy={`tna-lesson-card-material-grip-${item.id}`}
          {...listeners}
        >
          <LuGripVertical size={16} className="block shrink-0" aria-hidden />
        </button>
        <div
          className="min-w-0 flex-1"
          data-cy={`tna-lesson-card-material-body-${item.id}`}
        >
          <Link
            id="tnaRedirectToTnaManagment"
            data-cy={`tna-redirect-to-tna-management-${item.id}`}
            href={`/tna/management/${lessonCourseId}/${lessonId}/${item.id}`}
            className="block text-sm text-black/70 hover:text-primary"
          >
            {item.title}
          </Link>
          <div
            className="mt-1 text-xs text-black/70"
            id={`tnaLessonCardMaterialDuration${item.id}Id`}
            data-cy={`tna-lesson-card-material-duration-${item.id}`}
          >
            {item.timeToFinishMinutes != null
              ? `${item.timeToFinishMinutes} minutes`
              : '—'}
          </div>
        </div>
      </div>
      <Button
        type="text"
        size="small"
        className="mt-0.5 shrink-0 inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-md !bg-transparent !border-none !p-0 leading-none text-gray-400 hover:!bg-gray-100 hover:!text-gray-700 [&_.ant-btn-icon]:m-0"
        aria-label={`Edit ${item.title}`}
        data-cy={`tna-lesson-card-material-edit-${item.id}`}
        onClick={() => onEditMaterial(item)}
      >
        <LuPencil size={16} className="block shrink-0" aria-hidden />
      </Button>
    </div>
  );
};

export default SortableLessonMaterialRow;
